
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
    const body = await req.json().catch(() => ({}));
    const { userId } = body;

    console.log("Received disconnect request for user:", userId);

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
      console.error("Error fetching integration:", integrationError.message);
      
      // If the error is that no rows were returned, we consider the disconnection successful
      if (integrationError.code === "PGRST116") { // No rows returned
        console.log("No integration found to disconnect");
        return new Response(
          JSON.stringify({ success: true, message: "No integration found to disconnect" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Failed to fetch integration details", details: integrationError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If integration doesn't exist, consider it already disconnected
    if (!integration) {
      console.log("No integration found to disconnect");
      return new Response(
        JSON.stringify({ success: true, message: "No integration found to disconnect" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If the integration exists and has an access token, try to revoke it
    let tokenRevocationSuccess = false;
    
    if (integration.access_token) {
      try {
        console.log("Attempting to revoke access token");
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
        } else {
          console.log("Successfully revoked access token");
          tokenRevocationSuccess = true;
        }
      } catch (revokeError) {
        console.error("Error during token revocation:", revokeError);
        // We continue with the disconnection even if token revocation fails
      }
    } else {
      console.log("No access token to revoke");
    }

    console.log("Updating integration record to disconnect");
    
    // Update integration status in database
    try {
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
        
        // If the update failed, but we revoked the token, we want to let the user know
        if (tokenRevocationSuccess) {
          return new Response(
            JSON.stringify({ 
              partialSuccess: true, 
              message: "Token was revoked but database could not be updated",
              details: updateError.message 
            }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        return new Response(
          JSON.stringify({ error: "Failed to update integration status", details: updateError.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } catch (updateException) {
      console.error("Exception during integration update:", updateException);
      return new Response(
        JSON.stringify({ error: "Exception during update operation", details: updateException.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Also delete calendar settings for this user
    try {
      console.log("Deleting calendar settings");
      const { error: deleteError } = await supabase
        .from("calendar_settings")
        .delete()
        .eq("user_id", userId);
      
      if (deleteError) {
        console.error("Error deleting calendar settings:", deleteError);
        // Continue even if this fails
      }
    } catch (deleteException) {
      console.error("Exception during calendar settings deletion:", deleteException);
      // Continue even if this fails
    }

    console.log("Successfully disconnected Google Calendar for user:", userId);
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
