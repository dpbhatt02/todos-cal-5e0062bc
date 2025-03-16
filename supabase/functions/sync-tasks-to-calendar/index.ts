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
    const body = await req.json().catch(() => ({}));
    const { userId, taskId } = body;

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "User ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Syncing task ${taskId || 'all'} to Google Calendar for user: ${userId}`);

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
      .eq("connected", true)
      .maybeSingle();

    if (integrationError) {
      console.error("Error fetching integration:", integrationError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch Google Calendar integration" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!integration || integration.access_token === "DISCONNECTED") {
      console.log("Google Calendar integration not found or disconnected");
      return new Response(
        JSON.stringify({ error: "Google Calendar integration not connected" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if token is expired and refresh if needed
    const now = new Date();
    const tokenExpires = integration.token_expires_at ? new Date(integration.token_expires_at) : null;
    let accessToken = integration.access_token;

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
                access_token: "DISCONNECTED",
                updated_at: new Date().toISOString()
              })
              .eq("id", integration.id);
            
            return new Response(
              JSON.stringify({ 
                error: "Calendar disconnected due to invalid token",
                details: tokenData
              }),
              { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
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
            updated_at: new Date().toISOString()
          })
          .eq("id", integration.id);

        if (updateError) {
          console.error("Error updating token:", updateError);
        } else {
          accessToken = tokenData.access_token;
        }
      } catch (refreshError) {
        console.error("Error refreshing token:", refreshError);
        return new Response(
          JSON.stringify({ error: "Error refreshing token", details: refreshError.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Fetch calendar settings to get default calendar
    const { data: calendarSettings, error: calendarSettingsError } = await supabase
      .from("calendar_settings")
      .select("*")
      .eq("user_id", userId)
      .eq("enabled", true);
      
    if (calendarSettingsError) {
      console.error("Error fetching calendar settings:", calendarSettingsError);
    }
    
    let defaultCalendarId = "primary";
    if (calendarSettings && calendarSettings.length > 0) {
      // Use the first enabled calendar as default
      defaultCalendarId = calendarSettings[0].calendar_id;
    }

    // Fetch task(s) to sync
    let tasksQuery = supabase
      .from("tasks")
      .select("*")
      .eq("user_id", userId);
      
    // If taskId is provided, only sync that specific task
    if (taskId) {
      tasksQuery = tasksQuery.eq("id", taskId);
    } else {
      // Otherwise, get tasks that haven't been synced yet or have been updated since last sync
      tasksQuery = tasksQuery.or(
        'google_calendar_event_id.is.null,last_synced_at.lt.updated_at'
      );
    }
    
    const { data: tasks, error: tasksError } = await tasksQuery;
    
    if (tasksError) {
      console.error("Error fetching tasks:", tasksError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch tasks", details: tasksError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (!tasks || tasks.length === 0) {
      console.log("No tasks to sync");
      return new Response(
        JSON.stringify({ success: true, message: "No tasks to sync" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log(`Found ${tasks.length} tasks to sync`);
    
    // Process each task
    const results = await Promise.all(tasks.map(async (task) => {
      try {
        // Skip tasks without due dates
        if (!task.due_date) {
          console.log(`Skipping task ${task.id} (${task.title}) - no due date`);
          return {
            taskId: task.id,
            success: false,
            message: "Task has no due date"
          };
        }
        
        const taskDate = new Date(task.due_date);
        
        // Prepare event data
        const eventData = {
          summary: task.title,
          description: task.description || `Priority: ${task.priority || 'medium'}`,
          start: {
            date: taskDate.toISOString().split('T')[0],
            timeZone: 'UTC'
          },
          end: {
            date: taskDate.toISOString().split('T')[0],
            timeZone: 'UTC'
          }
        };
        
        // If the task has start/end times, use dateTime instead of date
        if (task.start_time) {
          eventData.start = {
            dateTime: task.start_time,
            timeZone: 'UTC'
          };
        }
        
        if (task.end_time) {
          eventData.end = {
            dateTime: task.end_time,
            timeZone: 'UTC'
          };
        }
        
        let response;
        
        // If task already has a Google Calendar event ID, update it
        if (task.google_calendar_event_id) {
          console.log(`Updating event for task ${task.id}: ${task.title}`);
          
          const calendarId = task.google_calendar_id || defaultCalendarId;
          
          response = await fetch(
            `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${task.google_calendar_event_id}`,
            {
              method: "PUT",
              headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json"
              },
              body: JSON.stringify(eventData)
            }
          );
        } else {
          // Otherwise create a new event
          console.log(`Creating new event for task ${task.id}: ${task.title}`);
          
          response = await fetch(
            `https://www.googleapis.com/calendar/v3/calendars/${defaultCalendarId}/events`,
            {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json"
              },
              body: JSON.stringify(eventData)
            }
          );
        }
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error(`Error syncing task ${task.id}:`, errorData);
          return {
            taskId: task.id,
            success: false,
            error: errorData
          };
        }
        
        const eventData2 = await response.json();
        
        // Update task with Google Calendar event ID and last synced time
        const { error: updateError } = await supabase
          .from("tasks")
          .update({
            google_calendar_event_id: eventData2.id,
            google_calendar_id: eventData2.calendarId || defaultCalendarId,
            last_synced_at: new Date().toISOString(),
            sync_source: "app"
          })
          .eq("id", task.id);
          
        if (updateError) {
          console.error(`Error updating task ${task.id} after sync:`, updateError);
          return {
            taskId: task.id,
            success: true,
            warning: "Event created but failed to update task record",
            eventId: eventData2.id
          };
        }
        
        return {
          taskId: task.id,
          success: true,
          eventId: eventData2.id
        };
      } catch (error) {
        console.error(`Error processing task ${task.id}:`, error);
        return {
          taskId: task.id,
          success: false,
          error: error.message
        };
      }
    }));
    
    const successCount = results.filter(r => r.success).length;
    
    return new Response(
      JSON.stringify({
        success: true,
        message: `Synced ${successCount} of ${tasks.length} tasks to Google Calendar`,
        results
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Sync Tasks to Calendar Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
