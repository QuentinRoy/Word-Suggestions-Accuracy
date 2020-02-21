import { useRef, useEffect } from "react";

const handler = evt => {
  evt.preventDefault();
};

// For some reason evt.preventDefault does not prevent scrolling with
// React's synthetic events. So we use native events instead.
export default function usePreventTouchScroll(enabled = true, argRef) {
  const ref = useRef();
  const elt = argRef == null ? ref.current : argRef.current;
  useEffect(() => {
    if (elt == null || !enabled) return undefined;
    elt.addEventListener("touchmove", handler);
    return () => {
      elt.removeEventListener("touchmove", handler);
    };
  }, [enabled, elt]);
  return ref;
}
