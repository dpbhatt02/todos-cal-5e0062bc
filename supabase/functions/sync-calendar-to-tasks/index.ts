
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
    const { userId } = body;

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "User ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Syncing events from Google Calendar to tasks for user: ${userId}`);

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

    // Fetch enabled calendar IDs
    const { data: calendarSettings, error: calendarSettingsError } = await supabase
      .from("calendar_settings")
      .select("*")
      .eq("user_id", userId)
      .eq("enabled", true);
      
    if (calendarSettingsError) {
      console.error("Error fetching calendar settings:", calendarSettingsError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch calendar settings", details: calendarSettingsError }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // If no calendars are enabled, insert the primary calendar as enabled
    if (!calendarSettings || calendarSettings.length === 0) {
      console.log("No enabled calendars found, adding primary calendar as default");
      
      // First check if a calendar settings entry exists but is disabled
      const { data: existingSettings, error: existingError } = await supabase
        .from("calendar_settings")
        .select("*")
        .eq("user_id", userId)
        .eq("calendar_id", "primary");
        
      if (existingError) {
        console.error("Error checking existing calendar settings:", existingError);
      }
      
      if (existingSettings && existingSettings.length > 0) {
        // Update existing setting to enabled
        const { error: updateError } = await supabase
          .from("calendar_settings")
          .update({ enabled: true })
          .eq("id", existingSettings[0].id);
          
        if (updateError) {
          console.error("Error updating calendar setting:", updateError);
        } else {
          console.log("Primary calendar enabled successfully");
        }
      } else {
        // Create new calendar setting for primary calendar
        const { error: insertError } = await supabase
          .from("calendar_settings")
          .insert({
            user_id: userId,
            calendar_id: "primary",
            enabled: true
          });
          
        if (insertError) {
          console.error("Error inserting calendar setting:", insertError);
        } else {
          console.log("Primary calendar added successfully");
        }
      }
      
      // Use primary calendar for this sync
      calendarSettings.push({ calendar_id: "primary", enabled: true });
    }
    
    // Define time range for events (e.g., 30 days past to 60 days future)
    const timeMin = new Date();
    timeMin.setDate(timeMin.getDate() - 30);
    
    const timeMax = new Date();
    timeMax.setDate(timeMax.getDate() + 60);

    let syncedCount = 0;
    let errorCount = 0;
    const results = [];

    // Process each calendar
    for (const calendar of calendarSettings) {
      console.log(`Fetching events from calendar: ${calendar.calendar_id}`);
      
      try {
        // Fetch events from Google Calendar
        const eventsResponse = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendar.calendar_id)}/events?` + 
          new URLSearchParams({
            timeMin: timeMin.toISOString(),
            timeMax: timeMax.toISOString(),
            singleEvents: "true",
            orderBy: "startTime"
          }).toString(),
          {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          }
        );

        if (!eventsResponse.ok) {
          const errorData = await eventsResponse.json();
          console.error(`Error fetching events from calendar ${calendar.calendar_id}:`, errorData);
          results.push({
            calendarId: calendar.calendar_id,
            success: false,
            error: errorData
          });
          errorCount++;
          continue;
        }

        const eventsData = await eventsResponse.json();
        console.log(`Found ${eventsData.items?.length || 0} events in calendar ${calendar.calendar_id}`);

        if (!eventsData.items || eventsData.items.length === 0) {
          results.push({
            calendarId: calendar.calendar_id,
            success: true,
            message: "No events found"
          });
          continue;
        }

        // Filter out events we want to sync (exclude all-day events that span multiple days)
        const filteredEvents = eventsData.items.filter(event => {
          // Skip events without a summary (title)
          if (!event.summary) return false;
          
          // Skip cancelled events
          if (event.status === 'cancelled') return false;
          
          // Skip all-day events that span multiple days
          if (event.start.date && event.end.date) {
            const startDate = new Date(event.start.date);
            const endDate = new Date(event.end.date);
            // End date is exclusive in Google Calendar, so subtract 1 day
            endDate.setDate(endDate.getDate() - 1);
            
            // Skip if event spans multiple days
            if (startDate.getTime() !== endDate.getTime()) return false;
          }
          
          return true;
        });

        let calendarSyncCount = 0;
        
        // Process each event
        for (const event of filteredEvents) {
          // Check if this event is already synced
          const { data: existingTask, error: existingError } = await supabase
            .from("tasks")
            .select("*")
            .eq("user_id", userId)
            .eq("google_calendar_event_id", event.id)
            .maybeSingle();
            
          if (existingError) {
            console.error(`Error checking existing task for event ${event.id}:`, existingError);
            continue;
          }
          
          // Determine due date, start time, and end time
          let dueDate, startTime, endTime, isAllDay = false;
          
          if (event.start.date) {
            // All-day event
            dueDate = new Date(event.start.date);
            isAllDay = true;
          } else if (event.start.dateTime) {
            // Timed event
            dueDate = new Date(event.start.dateTime);
            startTime = event.start.dateTime;
            endTime = event.end.dateTime;
          } else {
            // Skip events with no start time/date
            console.log(`Skipping event ${event.id} - no start time/date`);
            continue;
          }
          
          if (existingTask) {
            // Check if the event has been updated since the task was last synced
            const eventUpdated = new Date(event.updated);
            const lastSynced = existingTask.last_synced_at ? new Date(existingTask.last_synced_at) : new Date(0);
            
            if (eventUpdated > lastSynced) {
              console.log(`Updating task for event ${event.id}: ${event.summary}`);
              
              // Update existing task
              const { error: updateError } = await supabase
                .from("tasks")
                .update({
                  title: event.summary,
                  description: event.description || "",
                  due_date: dueDate.toISOString(),
                  start_time: startTime,
                  end_time: endTime,
                  is_all_day: isAllDay,
                  google_calendar_id: calendar.calendar_id,
                  last_synced_at: new Date().toISOString(),
                  sync_source: "calendar"
                })
                .eq("id", existingTask.id);
                
              if (updateError) {
                console.error(`Error updating task for event ${event.id}:`, updateError);
              } else {
                calendarSyncCount++;
              }
            } else {
              console.log(`Skipping event ${event.id} - no updates`);
            }
          } else {
            console.log(`Creating new task for event ${event.id}: ${event.summary}`);
            
            // Create new task
            const { error: insertError } = await supabase
              .from("tasks")
              .insert({
                user_id: userId,
                title: event.summary,
                description: event.description || "",
                priority: "medium", // Default priority
                due_date: dueDate.toISOString(),
                start_time: startTime,
                end_time: endTime,
                is_all_day: isAllDay,
                completed: event.status === "cancelled",
                google_calendar_event_id: event.id,
                google_calendar_id: calendar.calendar_id,
                last_synced_at: new Date().toISOString(),
                sync_source: "calendar"
              });
              
            if (insertError) {
              console.error(`Error inserting task for event ${event.id}:`, insertError);
            } else {
              calendarSyncCount++;
            }
          }
        }
        
        results.push({
          calendarId: calendar.calendar_id,
          success: true,
          syncedCount: calendarSyncCount,
          totalEvents: filteredEvents.length
        });
        
        syncedCount += calendarSyncCount;
      } catch (calendarError) {
        console.error(`Error processing calendar ${calendar.calendar_id}:`, calendarError);
        results.push({
          calendarId: calendar.calendar_id,
          success: false,
          error: calendarError.message
        });
        errorCount++;
      }
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        message: `Synced ${syncedCount} events from Google Calendar to tasks`,
        results,
        syncedCount,
        errorCount
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Sync Calendar to Tasks Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
