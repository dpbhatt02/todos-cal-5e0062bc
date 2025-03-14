
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const GoogleCalendarCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");
        const state = urlParams.get("state");
        const error = urlParams.get("error");

        console.log("Google Calendar callback parameters:", {
          code: code ? "Present" : "Missing",
          state: state ? state.substring(0, 5) + "..." : "Missing",
          error: error || "None"
        });

        if (error) {
          console.error("Error in Google OAuth flow:", error);
          navigate(`/settings?error=${encodeURIComponent(error)}&source=google_calendar`);
          return;
        }

        if (!code || !state) {
          console.error("Missing required parameters:", { code: !!code, state: !!state });
          navigate("/settings?error=missing_params&source=google_calendar");
          return;
        }

        // Call our Edge Function to process the OAuth callback
        const callbackUrl = `${window.location.origin}/api/google-calendar-callback`;
        
        console.log("Processing callback with code and state:", {
          code: code.substring(0, 5) + "...",
          state: state.substring(0, 5) + "...",
          callbackUrl
        });

        // Call the edge function directly
        const { data, error: functionError } = await supabase.functions.invoke(
          "google-calendar-callback-handler",
          {
            body: {
              code,
              state,
              callbackUrl
            },
          }
        );

        if (functionError) {
          console.error("Error processing callback:", functionError);
          navigate("/settings?error=processing_failed&source=google_calendar");
          return;
        }

        console.log("Successfully processed callback:", data);
        navigate("/settings?success=true&source=google_calendar");
      } catch (err) {
        console.error("Unexpected error in callback handler:", err);
        navigate("/settings?error=unexpected_error&source=google_calendar");
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Connecting Google Calendar</h1>
        <p className="text-gray-600 mb-6">Please wait while we complete the connection...</p>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
      </div>
    </div>
  );
};

export default GoogleCalendarCallback;
