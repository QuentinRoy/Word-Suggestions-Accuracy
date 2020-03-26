import { useRef } from "react";

let nextId = 0;

export default function useUniqueId(prefix = "") {
  const ref = useRef();
  if (ref.current == null) {
    ref.current = nextId;
    nextId += 1;
  }
  return `${prefix}${ref.current}`;
}
