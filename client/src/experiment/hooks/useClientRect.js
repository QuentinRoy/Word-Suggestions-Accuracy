import { useState, useMemo } from "react";

export default function useClientRect() {
  const [node, setNode] = useState(null);

  const rect = useMemo(
    () => (node == null ? null : node.getBoundingClientRect()),
    [node]
  );

  return [rect, setNode];
}
