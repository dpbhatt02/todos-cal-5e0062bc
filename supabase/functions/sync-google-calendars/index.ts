
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
    const { userId, direction = "both" } = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "User ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user's Google Calendar integration
    const { data: integration, error: integrationError } = await supabase
      .from("user_integrations")
      .select("*")
      .eq("user_id", userId)
      .eq("provider", "google_calendar")
      .single();

    if (integrationError) {
      console.error("Error fetching integration:", integrationError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch Google Calendar integration" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!integration) {
      return new Response(
        JSON.stringify({ error: "Google Calendar integration not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if token is expired and refresh if needed
    const now = new Date();
    const tokenExpires = integration.token_expires_at ? new Date(integration.token_expires_at) : null;
    let accessToken = integration.access_token;

    if (tokenExpires && now >= tokenExpires && integration.refresh_token) {
      console.log("Token expired, refreshing...");
      
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
        return new Response(
          JSON.stringify({ error: "Failed to refresh token" }),
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
        })
        .eq("id", integration.id);

      if (updateError) {
        console.error("Error updating token:", updateError);
      }

      accessToken = tokenData.access_token;
    }

    // Get user's enabled calendars
    const { data: calendarSettings, error: settingsError } = await supabase
      .from("calendar_settings")
      .select("calendar_id, enabled")
      .eq("user_id", userId)
      .eq("enabled", true);

    if (settingsError) {
      console.error("Error fetching calendar settings:", settingsError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch calendar settings" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create an array of enabled calendar IDs
    const enabledCalendarIds = calendarSettings?.map(setting => setting.calendar_id) || [];
    
    if (enabledCalendarIds.length === 0) {
      return new Response(
        JSON.stringify({ message: "No enabled calendars found", syncResults: { eventsImported: 0, tasksExported: 0 } }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let syncResults = {
      eventsImported: 0,
      tasksExported: 0
    };

    // Sync Google Calendar events to app tasks (if direction is "both" or "import")
    if (direction === "both" || direction === "import") {
      syncResults.eventsImported = await syncEventsToTasks(supabase, accessToken, enabledCalendarIds, userId);
    }

    // Sync app tasks to Google Calendar (if direction is "both" or "export")
    if (direction === "both" || direction === "export") {
      syncResults.tasksExported = await syncTasksToEvents(supabase, accessToken, enabledCalendarIds[0], userId);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Calendar sync completed", 
        syncResults 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Sync Google Calendars Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Function to sync Google Calendar events to app tasks
async function syncEventsToTasks(supabase, accessToken, calendarIds, userId) {
  let importedCount = 0;
  const timeMin = new Date();
  timeMin.setDate(timeMin.getDate() - 7); // Get events from 7 days ago
  
  const timeMax = new Date();
  timeMax.setDate(timeMax.getDate() + 30); // Get events up to 30 days in the future
  
  try {
    // Get all existing tasks with Google Calendar event IDs
    const { data: existingTasks, error: tasksError } = await supabase
      .from("tasks")
      .select("id, google_calendar_event_id, google_calendar_id, updated_at")
      .eq("user_id", userId)
      .not("google_calendar_event_id", "is", null);

    if (tasksError) {
      console.error("Error fetching existing tasks:", tasksError);
      return 0;
    }

    // Create a map of event IDs to task data for quick lookup
    const existingTasksMap = {};
    existingTasks?.forEach(task => {
      if (task.google_calendar_event_id) {
        const key = `${task.google_calendar_id}:${task.google_calendar_event_id}`;
        existingTasksMap[key] = task;
      }
    });

    // Process each enabled calendar
    for (const calendarId of calendarIds) {
      // Fetch events from this calendar
      const eventsUrl = new URL(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`);
      eventsUrl.searchParams.append("timeMin", timeMin.toISOString());
      eventsUrl.searchParams.append("timeMax", timeMax.toISOString());
      eventsUrl.searchParams.append("singleEvents", "true");
      eventsUrl.searchParams.append("maxResults", "100");

      const eventsResponse = await fetch(eventsUrl.toString(), {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!eventsResponse.ok) {
        const errorData = await eventsResponse.json();
        console.error(`Error fetching events for calendar ${calendarId}:`, errorData);
        continue;
      }

      const eventsData = await eventsResponse.json();
      const events = eventsData.items || [];

      // Process each event
      for (const event of events) {
        if (event.status === "cancelled") continue;
        
        // Skip events that don't have a start date/time
        if (!event.start || (!event.start.date && !event.start.dateTime)) continue;

        const eventKey = `${calendarId}:${event.id}`;
        const existingTask = existingTasksMap[eventKey];
        const eventLastUpdated = new Date(event.updated);
        
        // Format due date from event
        const dueDate = event.start.dateTime 
          ? new Date(event.start.dateTime) 
          : new Date(`${event.start.date}T00:00:00`);

        // Create or update task based on event
        if (!existingTask) {
          // This is a new event, create a task for it
          const { data: newTask, error: createError } = await supabase
            .from("tasks")
            .insert({
              user_id: userId,
              title: event.summary || "Untitled Event",
              description: event.description || "",
              due_date: dueDate.toISOString(),
              priority: "medium",
              completed: event.status === "completed",
              google_calendar_event_id: event.id,
              google_calendar_id: calendarId,
              start_time: event.start.dateTime ? new Date(event.start.dateTime).toISOString() : null,
              end_time: event.end?.dateTime ? new Date(event.end.dateTime).toISOString() : null,
              last_synced_at: new Date().toISOString(),
              is_all_day: !!event.start.date,
              sync_source: "google_calendar"
            })
            .select()
            .single();

          if (createError) {
            console.error("Error creating task from event:", createError);
          } else {
            importedCount++;
            console.log("Created new task from event:", newTask.id);
          }
        } else if (!existingTask.updated_at || eventLastUpdated > new Date(existingTask.updated_at)) {
          // This event has been updated more recently than the task, update the task
          const { error: updateError } = await supabase
            .from("tasks")
            .update({
              title: event.summary || "Untitled Event",
              description: event.description || "",
              due_date: dueDate.toISOString(),
              completed: event.status === "completed",
              start_time: event.start.dateTime ? new Date(event.start.dateTime).toISOString() : null,
              end_time: event.end?.dateTime ? new Date(event.end.dateTime).toISOString() : null,
              last_synced_at: new Date().toISOString(),
              is_all_day: !!event.start.date,
              sync_source: "google_calendar"
            })
            .eq("id", existingTask.id);

          if (updateError) {
            console.error("Error updating task from event:", updateError);
          } else {
            importedCount++;
            console.log("Updated task from event:", existingTask.id);
          }
        }
      }
    }

    return importedCount;
  } catch (error) {
    console.error("Error syncing events to tasks:", error);
    return 0;
  }
}

// Function to sync app tasks to Google Calendar events
async function syncTasksToEvents(supabase, accessToken, primaryCalendarId, userId) {
  let exportedCount = 0;
  
  try {
    // Get tasks that need to be synced
    const { data: tasks, error: tasksError } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", userId)
      .in("sync_source", ["app", null])
      .or(`updated_at.gt.last_synced_at,last_synced_at.is.null`);

    if (tasksError) {
      console.error("Error fetching tasks to sync:", tasksError);
      return 0;
    }

    if (!tasks || tasks.length === 0) {
      console.log("No tasks to sync to Google Calendar");
      return 0;
    }

    // Process each task
    for (const task of tasks) {
      try {
        // Determine if this is a new task or an update
        const isNewEvent = !task.google_calendar_event_id;
        
        // Prepare event data
        const eventData = {
          summary: task.title,
          description: task.description || "",
          start: {
            dateTime: task.start_time ? new Date(task.start_time).toISOString() : null,
            date: !task.start_time ? new Date(task.due_date).toISOString().split("T")[0] : null
          },
          end: {
            dateTime: task.end_time ? new Date(task.end_time).toISOString() : 
                    task.start_time ? new Date(new Date(task.start_time).getTime() + 30 * 60000).toISOString() : null,
            date: !task.start_time ? new Date(task.due_date).toISOString().split("T")[0] : null
          },
          status: task.completed ? "completed" : "confirmed"
        };

        // Remove null values
        if (!eventData.start.dateTime) delete eventData.start.dateTime;
        if (!eventData.start.date) delete eventData.start.date;
        if (!eventData.end.dateTime) delete eventData.end.dateTime;
        if (!eventData.end.date) delete eventData.end.date;

        // Add or update event on Google Calendar
        let eventResponse;
        
        if (isNewEvent) {
          // Create new event
          eventResponse = await fetch(
            `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(primaryCalendarId)}/events`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json"
              },
              body: JSON.stringify(eventData)
            }
          );
        } else {
          // Update existing event
          eventResponse = await fetch(
            `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(task.google_calendar_id || primaryCalendarId)}/events/${encodeURIComponent(task.google_calendar_event_id)}`,
            {
              method: "PUT",
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json"
              },
              body: JSON.stringify(eventData)
            }
          );
        }

        if (!eventResponse.ok) {
          const errorData = await eventResponse.json();
          console.error(`Error ${isNewEvent ? "creating" : "updating"} event:`, errorData);
          continue;
        }

        const eventResult = await eventResponse.json();

        // Update task with Google Calendar event ID and last synced timestamp
        const { error: updateError } = await supabase
          .from("tasks")
          .update({
            google_calendar_event_id: eventResult.id,
            google_calendar_id: primaryCalendarId,
            last_synced_at: new Date().toISOString(),
            sync_source: "app"
          })
          .eq("id", task.id);

        if (updateError) {
          console.error("Error updating task with event ID:", updateError);
        } else {
          exportedCount++;
          console.log(`${isNewEvent ? "Created" : "Updated"} Google Calendar event for task:`, task.id);
        }
      } catch (taskError) {
        console.error(`Error processing task ${task.id}:`, taskError);
      }
    }

    return exportedCount;
  } catch (error) {
    console.error("Error syncing tasks to events:", error);
    return 0;
  }
}
