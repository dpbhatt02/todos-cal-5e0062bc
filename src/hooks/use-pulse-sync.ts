import { useEffect, useRef } from "react";

/**
 * Periodically invoke a callback while enabled.
 * The callback only runs when the document is visible
 * and ensures only one invocation at a time.
 */
export function usePulseSync(
  enabled: boolean,
  callback: () => void | Promise<void>,
  intervalMs = 60000,
) {
  const timeoutRef = useRef<number | null>(null);
  const runningRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    const tick = () => {
      if (document.visibilityState !== "visible") {
        schedule();
        return;
      }
      if (runningRef.current) {
        schedule();
        return;
      }
      runningRef.current = true;
      Promise.resolve(callback()).finally(() => {
        runningRef.current = false;
        schedule();
      });
    };

    const schedule = () => {
      timeoutRef.current = window.setTimeout(tick, intervalMs);
    };

    schedule();

    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [enabled, callback, intervalMs]);
}
