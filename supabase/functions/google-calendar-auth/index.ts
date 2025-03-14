
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { userId, redirectUrl } = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "User ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!redirectUrl) {
      return new Response(
        JSON.stringify({ error: "Redirect URL is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Initiating Google Calendar auth with redirectUrl:", redirectUrl);

    // OAuth 2.0 config
    const CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID");
    const REDIRECT_URI = redirectUrl;
    const SCOPES = [
      "https://www.googleapis.com/auth/calendar.readonly",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
    ];

    if (!CLIENT_ID) {
      return new Response(
        JSON.stringify({ error: "Google Client ID not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create auth URL
    const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    authUrl.searchParams.append("client_id", CLIENT_ID);
    authUrl.searchParams.append("redirect_uri", REDIRECT_URI);
    authUrl.searchParams.append("response_type", "code");
    authUrl.searchParams.append("scope", SCOPES.join(" "));
    authUrl.searchParams.append("access_type", "offline");
    authUrl.searchParams.append("prompt", "consent");
    authUrl.searchParams.append("state", userId); // Pass userId in state param

    console.log("Generated Google auth URL with redirect_uri:", REDIRECT_URI);

    return new Response(
      JSON.stringify({ authUrl: authUrl.toString() }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Google Calendar Auth Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
