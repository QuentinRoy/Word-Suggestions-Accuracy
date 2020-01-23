import { useState, useCallback, useRef, useEffect } from "react";

export default function useClientRect() {
  const [rect, setRect] = useState(null);
  const innerRef = useRef(null);

  const onChange = () => {
    if (innerRef.current == null) {
      setRect(null);
    } else {
      setRect(innerRef.current.getBoundingClientRect());
    }
  };

  const ref = useCallback(
    newNode => {
      innerRef.current = newNode;
      onChange();
    },
    // onChange is not in the dependency list because it does not matter if the
    // last created function is used, or if it is one from before. onChange only
    // depends on stuff that never changes (set rect and innerRef).
    []
  );

  useEffect(
    () => {
      window.addEventListener("resize", onChange);
      return () => {
        window.removeEventListener("resize", onChange);
      };
    },
    // Again, onChange is not in the dependencies because it does not matter.
    // What is important is that the onChange function being removed as a
    // listener is the one that was added, and that is the case.
    []
  );

  return [rect, ref];
}
