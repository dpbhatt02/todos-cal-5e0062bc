
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
    // Parse request body
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
      .single();

    if (integrationError) {
      console.error("Error fetching integration:", integrationError.message);
      // If the integration doesn't exist, we consider the disconnection successful
      if (integrationError.code === "PGRST116") { // No rows returned
        return new Response(
          JSON.stringify({ success: true, message: "No integration found to disconnect" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Failed to fetch integration details" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If the integration exists and has an access token, try to revoke it
    if (integration && integration.access_token) {
      try {
        // Revoke access token
        const revokeResponse = await fetch(
          `https://oauth2.googleapis.com/revoke?token=${integration.access_token}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          }
        );

        if (!revokeResponse.ok) {
          const responseText = await revokeResponse.text();
          console.error("Error revoking token:", responseText);
          // We continue with the disconnection even if token revocation fails
        }
      } catch (revokeError) {
        console.error("Error during token revocation:", revokeError);
        // We continue with the disconnection even if token revocation fails
      }
    }

    // Update integration status in database
    const { error: updateError } = await supabase
      .from("user_integrations")
      .update({
        connected: false,
        access_token: null,
        refresh_token: null,
        updated_at: new Date().toISOString()
      })
      .eq("user_id", userId)
      .eq("provider", "google_calendar");

    if (updateError) {
      console.error("Error updating integration status:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update integration status" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Also delete calendar settings for this user
    const { error: deleteError } = await supabase
      .from("user_calendar_settings")
      .delete()
      .eq("user_id", userId);
    
    if (deleteError) {
      console.error("Error deleting calendar settings:", deleteError);
      // Continue even if this fails
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Google Calendar Disconnect Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
