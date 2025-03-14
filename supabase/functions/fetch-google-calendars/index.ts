
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
    const { userId } = await req.json();

    if (!userId) {
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
      .single();

    if (integrationError || !integration) {
      return new Response(
        JSON.stringify({ error: "Google Calendar integration not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if token is expired and refresh if needed
    const now = new Date();
    const tokenExpires = new Date(integration.token_expires_at);
    let accessToken = integration.access_token;

    if (now >= tokenExpires && integration.refresh_token) {
      console.log("Token expired, refreshing...");
      
      const tokenUrl = "https://oauth2.googleapis.com/token";
      const tokenParams = new URLSearchParams({
        client_id: Deno.env.get("GOOGLE_CLIENT_ID") || "",
        client_secret: Deno.env.get("GOOGLE_CLIENT_SECRET") || "",
        refresh_token: integration.refresh_token,
        grant_type: "refresh_token",
      });

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
        return new Response(
          JSON.stringify({ error: "Failed to refresh token" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Update token in database
      const { error: updateError } = await supabase
        .from("user_integrations")
        .update({
          access_token: tokenData.access_token,
          token_expires_at: new Date(
            Date.now() + tokenData.expires_in * 1000
          ).toISOString(),
        })
        .eq("user_id", userId)
        .eq("provider", "google_calendar");

      if (updateError) {
        console.error("Error updating token:", updateError);
      }

      accessToken = tokenData.access_token;
    }

    // Fetch calendars from Google Calendar API
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
      return new Response(
        JSON.stringify({ error: "Failed to fetch calendars" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ calendars: calendarData.items }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Fetch Google Calendars Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
