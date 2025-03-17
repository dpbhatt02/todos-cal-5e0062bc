
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
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

    // Get all users with auto-sync enabled using a raw query to avoid type issues
    const { data: settings, error: settingsError } = await supabase.rpc('get_auto_sync_users');

    if (settingsError) {
      console.error("Error fetching auto-sync settings:", settingsError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch auto-sync settings" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!settings || settings.length === 0) {
      console.log("No users with auto-sync enabled");
      return new Response(
        JSON.stringify({ success: true, message: "No users with auto-sync enabled" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${settings.length} users with auto-sync enabled`);

    // Process each user
    const results = await Promise.all(settings.map(async (setting) => {
      try {
        const userId = setting.user_id;
        console.log(`Processing auto-sync for user: ${userId}`);

        // First sync from calendar to tasks
        const calendarToTasksResponse = await supabase.functions.invoke("sync-calendar-to-tasks", {
          body: { userId }
        });

        // Then sync from tasks to calendar
        const tasksToCalendarResponse = await supabase.functions.invoke("sync-tasks-to-calendar", {
          body: { userId }
        });

        // Update last synced timestamp
        const { error: updateError } = await supabase.rpc('update_last_synced', { 
          user_id_param: userId,
          last_synced_at_param: new Date().toISOString()
        });

        if (updateError) {
          console.error(`Error updating last_synced_at for user ${userId}:`, updateError);
        }

        return {
          userId,
          success: calendarToTasksResponse.error === undefined && tasksToCalendarResponse.error === undefined,
          calendarToTasksResult: calendarToTasksResponse.data,
          tasksToCalendarResult: tasksToCalendarResponse.data,
          errors: [
            ...(calendarToTasksResponse.error ? [calendarToTasksResponse.error] : []),
            ...(tasksToCalendarResponse.error ? [tasksToCalendarResponse.error] : [])
          ]
        };
      } catch (error) {
        console.error(`Error processing auto-sync for user ${setting.user_id}:`, error);
        return {
          userId: setting.user_id,
          success: false,
          error: error.message
        };
      }
    }));

    const successCount = results.filter(r => r.success).length;

    return new Response(
      JSON.stringify({
        success: true,
        message: `Auto-synced ${successCount} of ${settings.length} users`,
        results
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Auto-sync Calendar Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
