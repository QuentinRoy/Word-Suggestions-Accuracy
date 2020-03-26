import { useRef, useEffect } from "react";

const handler = (evt) => {
  evt.preventDefault();
};

const defaultEvents = ["touchmove", "touchstart", "touchend", "touchcancel"];

// For some reason evt.preventDefault does not prevent scrolling with
// React's synthetic events. So we use native events instead.
export default function usePreventTouchDefault(
  enabled = true,
  events = defaultEvents
) {
  const ref = useRef();
  const { current: elt } = ref;
  useEffect(() => {
    if (elt == null || !enabled) return undefined;
    for (let i = 0; i < events.length; i += 1) {
      elt.addEventListener(events[i], handler);
    }

    return () => {
      for (let i = 0; i < events.length; i += 1) {
        elt.removeEventListener(events[i], handler);
      }
    };
  }, [enabled, elt, events]);
  return ref;
}
