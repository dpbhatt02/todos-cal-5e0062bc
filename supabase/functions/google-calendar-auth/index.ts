
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
    const { userId, redirectUrl } = await req.json();

    console.log("Google Calendar Auth request:", { 
      userId: userId ? userId.substring(0, 5) + "..." : "missing", 
      redirectUrl 
    });

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "User ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get URL components to construct the callback URL
    // If redirectUrl is provided, use it; otherwise, use a default
    let callbackUrl;
    if (redirectUrl) {
      callbackUrl = redirectUrl;
    } else {
      // If no redirectUrl is provided, we need to make a reasonable guess
      callbackUrl = "https://todos-cal.lovable.app/api/google-calendar-callback";
    }

    console.log("Using callback URL:", callbackUrl);

    // Set up OAuth parameters
    const clientId = Deno.env.get("GOOGLE_CLIENT_ID") || "";
    const scopes = [
      "https://www.googleapis.com/auth/calendar.readonly",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile"
    ];

    // Construct Google OAuth URL
    const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    authUrl.searchParams.append("client_id", clientId);
    authUrl.searchParams.append("redirect_uri", callbackUrl);
    authUrl.searchParams.append("response_type", "code");
    authUrl.searchParams.append("scope", scopes.join(" "));
    authUrl.searchParams.append("access_type", "offline");
    authUrl.searchParams.append("prompt", "consent");  // Force prompt to get a refresh token
    authUrl.searchParams.append("state", userId);      // Pass the userId through the state parameter

    console.log("Generated auth URL with redirect to:", callbackUrl);

    return new Response(
      JSON.stringify({ authUrl: authUrl.toString() }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Google Calendar Auth Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
