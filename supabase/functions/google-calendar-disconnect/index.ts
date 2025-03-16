
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
    let { data: integration, error: integrationError } = await supabase
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
      
      // Log the error but continue with disconnection attempt
      console.error("Will proceed with disconnection despite fetch error:", integrationError.message);
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
    let tokenRevocationError = null;
    
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

        // Get the response as text for better error logging
        const responseText = await revokeResponse.text();
        
        if (!revokeResponse.ok) {
          console.error("Error revoking token:", responseText);
          tokenRevocationError = responseText;
          // We continue with the disconnection even if token revocation fails
        } else {
          console.log("Successfully revoked access token");
          tokenRevocationSuccess = true;
        }
      } catch (revokeError) {
        console.error("Exception during token revocation:", revokeError);
        tokenRevocationError = revokeError.message;
        // We continue with the disconnection even if token revocation fails
      }
    } else {
      console.log("No access token to revoke");
    }

    console.log("Updating integration record to disconnect");
    
    // Always mark as disconnected regardless of token revocation
    try {
      const { error: updateError } = await supabase
        .from("user_integrations")
        .update({
          connected: false,
          access_token: null,
          refresh_token: null,
          token_expires_at: null,
          updated_at: new Date().toISOString()
        })
        .eq("user_id", userId)
        .eq("provider", "google_calendar");

      if (updateError) {
        console.error("Error updating integration status:", updateError);
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
        // Continue even if this fails, but don't report partial success
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: "Calendar disconnected but settings cleanup failed"
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } catch (deleteException) {
      console.error("Exception during calendar settings deletion:", deleteException);
      // Continue even if this fails
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Calendar disconnected but settings cleanup failed"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Successfully disconnected Google Calendar for user:", userId);
    
    // Always return a success if we've marked the integration as disconnected
    return new Response(
      JSON.stringify({ 
        success: true,
        tokenRevocationSuccess: tokenRevocationSuccess,
        message: "Calendar disconnected successfully"
      }),
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
