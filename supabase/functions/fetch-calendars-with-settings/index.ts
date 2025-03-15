
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { userId } = body;

    console.log("Fetch calendars with settings request for user:", userId);

    if (!userId) {
      console.error("Missing userId in request body");
      return new Response(
        JSON.stringify({ error: "User ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user's Google Calendar integration
    const { data: integration, error: integrationError } = await supabase
      .from("user_integrations")
      .select("*")
      .eq("user_id", userId)
      .eq("provider", "google_calendar")
      .maybeSingle();

    if (integrationError) {
      console.error("Error fetching integration:", integrationError.message);
      return new Response(
        JSON.stringify({ error: "Failed to fetch Google Calendar integration", details: integrationError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!integration || !integration.connected) {
      console.log("No active Google Calendar integration found for user:", userId);
      return new Response(
        JSON.stringify({ error: "Google Calendar integration not found or not connected" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if token is expired and refresh if needed
    const now = new Date();
    const tokenExpires = integration.token_expires_at ? new Date(integration.token_expires_at) : new Date(0);
    let accessToken = integration.access_token;
    let tokenRefreshed = false;

    if (now >= tokenExpires && integration.refresh_token) {
      console.log("Token expired, refreshing...");
      
      const tokenUrl = "https://oauth2.googleapis.com/token";
      const tokenParams = new URLSearchParams({
        client_id: Deno.env.get("GOOGLE_CLIENT_ID") || "",
        client_secret: Deno.env.get("GOOGLE_CLIENT_SECRET") || "",
        refresh_token: integration.refresh_token,
        grant_type: "refresh_token",
      });

      try {
        const tokenResponse = await fetch(tokenUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: tokenParams.toString(),
        });

        const tokenData = await tokenResponse.json();

        if (!tokenResponse.ok) {
          console.error("Token refresh error:", tokenData);
          
          // If refresh token is invalid, mark integration as disconnected
          if (tokenData.error === "invalid_grant") {
            console.log("Refresh token is invalid, marking integration as disconnected");
            await supabase
              .from("user_integrations")
              .update({
                connected: false,
                updated_at: new Date().toISOString()
              })
              .eq("id", integration.id);
          }
          
          return new Response(
            JSON.stringify({ error: "Failed to refresh token", details: tokenData.error }),
            { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        console.log("Token refreshed successfully");
        
        // Update token in database
        const { error: updateError } = await supabase
          .from("user_integrations")
          .update({
            access_token: tokenData.access_token,
            token_expires_at: new Date(
              Date.now() + tokenData.expires_in * 1000
            ).toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq("id", integration.id);

        if (updateError) {
          console.error("Error updating token:", updateError);
        } else {
          tokenRefreshed = true;
        }

        accessToken = tokenData.access_token;
      } catch (refreshError) {
        console.error("Error during token refresh:", refreshError);
        return new Response(
          JSON.stringify({ error: "Failed to refresh token due to an exception", details: refreshError.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Fetch calendars from Google Calendar API
    try {
      console.log("Fetching calendars from Google Calendar API");
      const calendarResponse = await fetch(
        "https://www.googleapis.com/calendar/v3/users/me/calendarList",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const calendarData = await calendarResponse.json();

      if (!calendarResponse.ok) {
        console.error("Calendar list error:", calendarData);
        
        // If authentication failed and we haven't already tried refreshing the token
        if (calendarData.error?.code === 401 && !tokenRefreshed && integration.refresh_token) {
          console.log("Authentication failed after token refresh, marking integration as disconnected");
          await supabase
            .from("user_integrations")
            .update({
              connected: false,
              updated_at: new Date().toISOString()
            })
            .eq("id", integration.id);
        }
        
        return new Response(
          JSON.stringify({ error: "Failed to fetch calendars", details: calendarData.error?.message }),
          { status: calendarResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`Successfully fetched ${calendarData.items?.length || 0} calendars`);

      // Get user's calendar settings from database
      const { data: calendarSettings, error: settingsError } = await supabase
        .from("calendar_settings")
        .select("*")
        .eq("user_id", userId);

      if (settingsError) {
        console.error("Error fetching calendar settings:", settingsError);
        // Continue with empty settings rather than failing
      }

      // Create a map of calendar settings for efficient lookup
      const settingsMap = {};
      if (calendarSettings && calendarSettings.length > 0) {
        calendarSettings.forEach(setting => {
          settingsMap[setting.calendar_id] = setting.enabled;
        });
        console.log(`Found settings for ${calendarSettings.length} calendars`);
      } else {
        console.log("No calendar settings found, using defaults");
      }

      // Merge calendar data with settings
      const calendarsWithSettings = calendarData.items.map(calendar => {
        return {
          id: calendar.id,
          name: calendar.summary,
          color: calendar.backgroundColor || "#4285F4",
          enabled: settingsMap[calendar.id] !== undefined ? settingsMap[calendar.id] : true,
          primary: calendar.primary || false,
          description: calendar.description,
          accessRole: calendar.accessRole
        };
      });

      return new Response(
        JSON.stringify({ calendars: calendarsWithSettings }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (calendarError) {
      console.error("Error fetching calendars:", calendarError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch calendars due to an exception", details: calendarError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Fetch Calendars with Settings Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
