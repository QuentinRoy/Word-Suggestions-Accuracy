import { useState, useCallback } from "react";

export default function useClientRect() {
  const [node, setNode] = useState(null);

  const ref = useCallback(newNode => {
    setNode(newNode);
  }, []);

  return [node != null ? node.getBoundingClientRect() : null, ref];
}
