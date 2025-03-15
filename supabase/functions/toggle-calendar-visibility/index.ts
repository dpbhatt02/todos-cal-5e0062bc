
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
    const { userId, calendarId, enabled } = await req.json();

    if (!userId || !calendarId) {
      return new Response(
        JSON.stringify({ error: "User ID and Calendar ID are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if calendar visibility setting exists
    const { data: existingSetting, error: checkError } = await supabase
      .from("calendar_settings")
      .select("*")
      .eq("user_id", userId)
      .eq("calendar_id", calendarId)
      .maybeSingle();

    if (checkError) {
      console.error("Error checking calendar settings:", checkError);
      return new Response(
        JSON.stringify({ error: "Failed to check calendar settings" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let result;
    if (existingSetting) {
      // Update existing setting
      const { data, error: updateError } = await supabase
        .from("calendar_settings")
        .update({ enabled })
        .eq("id", existingSetting.id)
        .select();

      if (updateError) {
        console.error("Error updating calendar settings:", updateError);
        return new Response(
          JSON.stringify({ error: "Failed to update calendar settings" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      result = data;
    } else {
      // Insert new setting
      const { data, error: insertError } = await supabase
        .from("calendar_settings")
        .insert({
          user_id: userId,
          calendar_id: calendarId,
          enabled,
        })
        .select();

      if (insertError) {
        console.error("Error inserting calendar settings:", insertError);
        return new Response(
          JSON.stringify({ error: "Failed to insert calendar settings" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      result = data;
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Toggle Calendar Visibility Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
