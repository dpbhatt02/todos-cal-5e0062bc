
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
    // Parse the request body
    const { code, state, callbackUrl } = await req.json();

    console.log("Google Calendar Callback Handler called with:", { 
      code: code ? "Present" : "Missing",
      state: state ? state.substring(0, 5) + "..." : "Missing",
      callbackUrl
    });

    if (!code || !state) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Exchange code for tokens
    const tokenUrl = "https://oauth2.googleapis.com/token";
    const tokenParams = new URLSearchParams({
      code,
      client_id: Deno.env.get("GOOGLE_CLIENT_ID") || "",
      client_secret: Deno.env.get("GOOGLE_CLIENT_SECRET") || "",
      redirect_uri: callbackUrl,
      grant_type: "authorization_code",
    });

    console.log("Exchanging code for token with redirect_uri:", callbackUrl);

    const tokenResponse = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: tokenParams.toString(),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error("Token exchange error:", tokenData);
      return new Response(
        JSON.stringify({ error: "Failed to exchange code for token" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Successfully exchanged code for token");

    // Get user info from Google
    const userInfoResponse = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      }
    );

    const userInfo = await userInfoResponse.json();

    if (!userInfoResponse.ok) {
      console.error("User info error:", userInfo);
      return new Response(
        JSON.stringify({ error: "Failed to get user info" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Retrieved user info from Google:", { 
      email: userInfo.email,
      id: userInfo.id ? userInfo.id.substring(0, 5) + "..." : "missing"
    });

    // First check if the integration already exists
    const { data: existingIntegration, error: checkError } = await supabase
      .from("user_integrations")
      .select("*")
      .eq("user_id", state)
      .eq("provider", "google_calendar")
      .maybeSingle();

    if (checkError) {
      console.error("Error checking for existing integration:", checkError);
      return new Response(
        JSON.stringify({ error: "Database error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let dbOperationError;
    
    if (existingIntegration) {
      // Update existing integration
      console.log("Updating existing integration for user:", state.substring(0, 5) + "...");
      
      const { error: updateError } = await supabase
        .from("user_integrations")
        .update({
          provider_user_id: userInfo.id,
          provider_email: userInfo.email,
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          token_expires_at: new Date(
            Date.now() + tokenData.expires_in * 1000
          ).toISOString(),
          connected: true,
          updated_at: new Date().toISOString()
        })
        .eq("id", existingIntegration.id);
        
      dbOperationError = updateError;
    } else {
      // Create new integration
      console.log("Creating new integration for user:", state.substring(0, 5) + "...");
      
      const { error: insertError } = await supabase
        .from("user_integrations")
        .insert({
          user_id: state,
          provider: "google_calendar",
          provider_user_id: userInfo.id,
          provider_email: userInfo.email,
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          token_expires_at: new Date(
            Date.now() + tokenData.expires_in * 1000
          ).toISOString(),
          connected: true
        });
        
      dbOperationError = insertError;
    }

    if (dbOperationError) {
      console.error("Database error:", dbOperationError);
      return new Response(
        JSON.stringify({ error: "Database error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Successfully stored Google Calendar integration for user:", state.substring(0, 5) + "...");

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Google Calendar Callback Handler Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
