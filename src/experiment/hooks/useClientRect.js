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

  const ref = useCallback(newNode => {
    innerRef.current = newNode;
    onChange();
  }, []);

  useEffect(() => {
    window.addEventListener("resize", onChange);
    return () => {
      window.removeEventListener("resize", onChange);
    };
  }, []);

  return [rect, ref];
}
