
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

  // Parse the URL to get the query parameters
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state"); // This contains the userId
  const error = url.searchParams.get("error");

  console.log("Google Calendar Callback triggered with:", { 
    code: code ? "Present" : "Missing",
    state: state ? state.substring(0, 5) + "..." : "Missing",
    error: error || "None"
  });

  // Initialize Supabase client
  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Redirect URL for after processing - use the origin of the request
  const redirectUrl = new URL(url.origin);
  redirectUrl.pathname = "/settings";
  
  try {
    // Handle error from Google OAuth
    if (error) {
      console.error("Google OAuth error:", error);
      redirectUrl.searchParams.append("error", error);
      redirectUrl.searchParams.append("source", "google_calendar");
      return Response.redirect(redirectUrl.toString());
    }

    // Verify we have the code and userId
    if (!code || !state) {
      console.error("Missing required parameters:", { code: !!code, state: !!state });
      redirectUrl.searchParams.append("error", "missing_params");
      redirectUrl.searchParams.append("source", "google_calendar");
      return Response.redirect(redirectUrl.toString());
    }

    console.log("Processing OAuth callback with code and state:", { 
      codeFirstChars: code.substring(0, 5) + "...", 
      stateFirstChars: state.substring(0, 5) + "..." 
    });

    // Extract the redirect_uri that was used for the authorization request
    const callbackUrl = `${url.origin}/api/google-calendar-callback`;
    console.log("Using callback URL:", callbackUrl);

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
      redirectUrl.searchParams.append("error", "token_exchange_failed");
      redirectUrl.searchParams.append("source", "google_calendar");
      return Response.redirect(redirectUrl.toString());
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
      redirectUrl.searchParams.append("error", "user_info_failed");
      redirectUrl.searchParams.append("source", "google_calendar");
      return Response.redirect(redirectUrl.toString());
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

    if (checkError && !checkError.message.includes("no rows")) {
      console.error("Error checking for existing integration:", checkError);
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
      redirectUrl.searchParams.append("error", "database_error");
      redirectUrl.searchParams.append("source", "google_calendar");
      return Response.redirect(redirectUrl.toString());
    }

    console.log("Successfully stored Google Calendar integration for user:", state.substring(0, 5) + "...");

    // Redirect back to the app
    redirectUrl.searchParams.append("success", "true");
    redirectUrl.searchParams.append("source", "google_calendar");
    return Response.redirect(redirectUrl.toString());
    
  } catch (error) {
    console.error("Google Calendar Callback Error:", error);
    redirectUrl.searchParams.append("error", "unexpected_error");
    redirectUrl.searchParams.append("source", "google_calendar");
    return Response.redirect(redirectUrl.toString());
  }
});
