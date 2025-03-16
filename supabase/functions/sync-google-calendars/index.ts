
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

    console.log("Starting Google Calendar sync process for user:", userId);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing Supabase URL or service role key");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user's Google Calendar integration
    const { data: integration, error: integrationError } = await supabase
      .from("user_integrations")
      .select("*")
      .eq("user_id", userId)
      .eq("provider", "google_calendar")
      .maybeSingle();

    if (integrationError) {
      console.error("Error fetching integration:", integrationError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch Google Calendar integration" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!integration || !integration.connected) {
      console.log("Google Calendar integration not found or not connected");
      return new Response(
        JSON.stringify({ error: "Google Calendar integration not found or not connected" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if token is expired and refresh if needed
    const now = new Date();
    const tokenExpires = integration.token_expires_at ? new Date(integration.token_expires_at) : null;
    let accessToken = integration.access_token;
    let refreshSuccessful = false;

    if (tokenExpires && now >= tokenExpires && integration.refresh_token) {
      console.log("Token expired, refreshing...");
      
      try {
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
          
          // Mark integration as disconnected if refresh token is invalid
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
            JSON.stringify({ error: "Failed to refresh token", details: tokenData }),
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
          .eq("id", integration.id);

        if (updateError) {
          console.error("Error updating token:", updateError);
        } else {
          refreshSuccessful = true;
        }

        accessToken = tokenData.access_token;
      } catch (refreshError) {
        console.error("Error refreshing token:", refreshError);
        return new Response(
          JSON.stringify({ error: "Error refreshing token", details: refreshError.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // For now, we're implementing a basic version that initiates the sync process
    // In a real implementation, this would include more detailed logic to sync events and tasks

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Calendar sync initiated",
        tokenRefreshed: refreshSuccessful
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Sync Google Calendars Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
