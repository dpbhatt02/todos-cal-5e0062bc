
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
    const { userId, syncToken, pageToken } = body;

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "User ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Syncing events from Google Calendar for user: ${userId}`);

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

    // Fetch calendar settings to get enabled calendars
    const { data: calendarSettings, error: calendarSettingsError } = await supabase
      .from("calendar_settings")
      .select("*")
      .eq("user_id", userId)
      .eq("enabled", true);
      
    if (calendarSettingsError) {
      console.error("Error fetching calendar settings:", calendarSettingsError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch calendar settings" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (!calendarSettings || calendarSettings.length === 0) {
      console.log("No enabled calendars found");
      return new Response(
        JSON.stringify({ success: true, message: "No enabled calendars to sync from" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const enabledCalendarIds = calendarSettings.map(cs => cs.calendar_id);
    console.log(`Found ${enabledCalendarIds.length} enabled calendars`);
    
    // Process each enabled calendar
    const allResults = [];
    
    for (const calendarId of enabledCalendarIds) {
      console.log(`Processing calendar: ${calendarId}`);
      
      try {
        // Construct the Google Calendar API URL
        let url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?maxResults=100`;
        
        // Add pagination token if provided
        if (pageToken) {
          url += `&pageToken=${pageToken}`;
        }
        
        // Add sync token if provided (for incremental sync)
        if (syncToken) {
          url += `&syncToken=${syncToken}`;
        } else {
          // If no sync token, get events from the last 30 days and future events
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          url += `&timeMin=${thirtyDaysAgo.toISOString()}`;
        }
        
        const response = await fetch(url, {
          headers: {
            "Authorization": `Bearer ${accessToken}`
          }
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error(`Error fetching events from calendar ${calendarId}:`, errorData);
          
          // If the sync token is invalid, clear it and try a full sync next time
          if (errorData.error?.code === 410) {
            allResults.push({
              calendarId,
              success: false,
              error: "Sync token expired, will do full sync next time",
              invalidSyncToken: true
            });
            continue;
          }
          
          allResults.push({
            calendarId,
            success: false,
            error: errorData
          });
          continue;
        }
        
        const data = await response.json();
        const events = data.items || [];
        console.log(`Fetched ${events.length} events from calendar ${calendarId}`);
        
        // Process each event
        const results = await Promise.all(events.map(async (event) => {
          try {
            // Skip events without proper dates or cancelled events
            if ((!event.start || !event.end) || event.status === 'cancelled') {
              return {
                eventId: event.id,
                success: false,
                message: "Skipped event missing dates or cancelled"
              };
            }
            
            // Check if this event already exists as a task
            const { data: existingTasks, error: existingTasksError } = await supabase
              .from("tasks")
              .select("*")
              .eq("google_calendar_event_id", event.id)
              .eq("user_id", userId);
              
            if (existingTasksError) {
              console.error(`Error checking existing task for event ${event.id}:`, existingTasksError);
              return {
                eventId: event.id,
                success: false,
                error: existingTasksError
              };
            }
            
            // Determine if we're creating a new task or updating an existing one
            if (existingTasks && existingTasks.length > 0) {
              // Update the existing task
              const task = existingTasks[0];
              
              // Only update if the event was updated after the task was last synced
              const eventUpdated = new Date(event.updated);
              const lastSynced = task.last_synced_at ? new Date(task.last_synced_at) : new Date(0);
              
              if (eventUpdated <= lastSynced && task.sync_source === "calendar") {
                console.log(`Task ${task.id} already up to date with event ${event.id}`);
                return {
                  eventId: event.id,
                  taskId: task.id,
                  success: true,
                  message: "Already up to date"
                };
              }
              
              console.log(`Updating task ${task.id} from event ${event.id}`);
              
              // Determine the due date
              let dueDate = null;
              let startTime = null;
              let endTime = null;
              let isAllDay = false;
              
              if (event.start.date) {
                // All-day event
                dueDate = new Date(event.start.date);
                isAllDay = true;
              } else if (event.start.dateTime) {
                // Event with specific time
                dueDate = new Date(event.start.dateTime);
                startTime = event.start.dateTime;
                endTime = event.end.dateTime;
              }
              
              const { error: updateError } = await supabase
                .from("tasks")
                .update({
                  title: event.summary || "Untitled Event",
                  description: event.description || "",
                  due_date: dueDate ? dueDate.toISOString() : null,
                  start_time: startTime,
                  end_time: endTime,
                  is_all_day: isAllDay,
                  last_synced_at: new Date().toISOString(),
                  sync_source: "calendar",
                })
                .eq("id", task.id);
                
              if (updateError) {
                console.error(`Error updating task ${task.id}:`, updateError);
                return {
                  eventId: event.id,
                  taskId: task.id,
                  success: false,
                  error: updateError
                };
              }
              
              return {
                eventId: event.id,
                taskId: task.id,
                success: true,
                operation: "updated"
              };
            } else {
              // Create a new task
              console.log(`Creating new task from event ${event.id}`);
              
              // Determine the due date
              let dueDate = null;
              let startTime = null;
              let endTime = null;
              let isAllDay = false;
              
              if (event.start.date) {
                // All-day event
                dueDate = new Date(event.start.date);
                isAllDay = true;
              } else if (event.start.dateTime) {
                // Event with specific time
                dueDate = new Date(event.start.dateTime);
                startTime = event.start.dateTime;
                endTime = event.end.dateTime;
              }
              
              const { data: newTask, error: createError } = await supabase
                .from("tasks")
                .insert({
                  user_id: userId,
                  title: event.summary || "Untitled Event",
                  description: event.description || "",
                  due_date: dueDate ? dueDate.toISOString() : null,
                  start_time: startTime,
                  end_time: endTime,
                  is_all_day: isAllDay,
                  google_calendar_event_id: event.id,
                  google_calendar_id: calendarId,
                  last_synced_at: new Date().toISOString(),
                  priority: "medium", // Default priority
                  completed: false, // Default completion status
                  sync_source: "calendar",
                })
                .select("id")
                .single();
                
              if (createError) {
                console.error(`Error creating task from event ${event.id}:`, createError);
                return {
                  eventId: event.id,
                  success: false,
                  error: createError
                };
              }
              
              return {
                eventId: event.id,
                taskId: newTask.id,
                success: true,
                operation: "created"
              };
            }
          } catch (error) {
            console.error(`Error processing event ${event.id}:`, error);
            return {
              eventId: event.id,
              success: false,
              error: error.message
            };
          }
        }));
        
        // Add calendar results to overall results
        allResults.push({
          calendarId,
          success: true,
          events: results,
          nextPageToken: data.nextPageToken,
          nextSyncToken: data.nextSyncToken
        });
        
        // Store new sync token if provided
        if (data.nextSyncToken) {
          // TODO: Store sync token for this calendar in database for incremental sync
          console.log(`New sync token for calendar ${calendarId}: ${data.nextSyncToken}`);
        }
      } catch (error) {
        console.error(`Error processing calendar ${calendarId}:`, error);
        allResults.push({
          calendarId,
          success: false,
          error: error.message
        });
      }
    }
    
    // Count total events processed across all calendars
    const successCount = allResults.reduce((count, result) => {
      if (result.success && result.events) {
        return count + result.events.filter(e => e.success).length;
      }
      return count;
    }, 0);
    
    return new Response(
      JSON.stringify({
        success: true,
        message: `Synced ${successCount} events from Google Calendar`,
        results: allResults
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
