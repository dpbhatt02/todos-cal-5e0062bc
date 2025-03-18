// Import the necessary modules
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
    const { userId, taskIds } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Log activity to task history
    if (userId && taskIds?.length > 0) {
      try {
        // Get task details for the history
        const { data: tasksData } = await supabase
          .from("tasks")
          .select("id, title")
          .in("id", taskIds);
          
        if (tasksData && tasksData.length > 0) {
          // Create history entries for each synced task
          const historyEntries = tasksData.map(task => ({
            user_id: userId,
            task_id: task.id,
            task_title: task.title,
            action: "synced",
            details: "Synced to Google Calendar"
          }));
          
          await supabase.from("task_history").insert(historyEntries);
        }
      } catch (historyError) {
        console.error("Error recording sync history:", historyError);
      }
    }

    // Fetch user's calendar sync settings
    const { data: syncSettings, error: syncSettingsError } = await supabase
      .from("calendar_sync_settings")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (syncSettingsError) {
      console.error("Error fetching calendar sync settings:", syncSettingsError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch calendar sync settings" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Fetch user's Google Calendar integration
    const { data: integration, error: integrationError } = await supabase
      .from("user_integrations")
      .select("*")
      .eq("user_id", userId)
      .eq("provider", "google_calendar")
      .single();

    if (integrationError) {
      console.error("Error fetching Google Calendar integration:", integrationError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch Google Calendar integration" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!integration?.access_token) {
      console.error("No access token found for Google Calendar integration");
      return new Response(
        JSON.stringify({ error: "No access token found for Google Calendar integration" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const accessToken = integration.access_token;

    // Fetch tasks from Supabase
    const { data: tasks, error: tasksError } = await supabase
      .from("tasks")
      .select("*")
      .in("id", taskIds);

    if (tasksError) {
      console.error("Error fetching tasks from Supabase:", tasksError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch tasks from Supabase" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Sync tasks to Google Calendar
    for (const task of tasks) {
      if (!task.google_calendar_event_id) {
        // Create event in Google Calendar
        const event = {
          summary: task.title,
          description: task.description || "",
          start: {
            dateTime: task.start_time || task.due_date,
            timeZone: "UTC", // Enforce UTC timezone
          },
          end: {
            dateTime: task.end_time || task.due_date,
            timeZone: "UTC", // Enforce UTC timezone
          },
        };

        const calendarId = task.google_calendar_id || "primary";
        const createEventUrl = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`;

        const createEventResponse = await fetch(createEventUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(event),
        });

        const createEventData = await createEventResponse.json();

        if (!createEventResponse.ok) {
          console.error("Failed to create event in Google Calendar:", createEventData);
          continue; // Skip to the next task
        }

        // Update task with Google Calendar event ID
        const { error: updateError } = await supabase
          .from("tasks")
          .update({ google_calendar_event_id: createEventData.id })
          .eq("id", task.id);

        if (updateError) {
          console.error("Failed to update task with Google Calendar event ID:", updateError);
        }
      } else {
        // Update event in Google Calendar
        const event = {
          summary: task.title,
          description: task.description || "",
          start: {
            dateTime: task.start_time || task.due_date,
            timeZone: "UTC", // Enforce UTC timezone
          },
          end: {
            dateTime: task.end_time || task.due_date,
            timeZone: "UTC", // Enforce UTC timezone
          },
        };

        const calendarId = task.google_calendar_id || "primary";
        const updateEventUrl = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${task.google_calendar_event_id}`;

        const updateEventResponse = await fetch(updateEventUrl, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(event),
        });

        const updateEventData = await updateEventResponse.json();

        if (!updateEventResponse.ok) {
          console.error("Failed to update event in Google Calendar:", updateEventData);
          continue; // Skip to the next task
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in sync-tasks-to-calendar:", error);
    return new Response(
      JSON.stringify({ error: error.message || "An unexpected error occurred" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
