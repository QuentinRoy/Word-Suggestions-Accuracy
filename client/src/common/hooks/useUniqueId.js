import { useRef } from "react";
import { generate } from "shortid";

export default function useUniqueId(prefix = "") {
  const ref = useRef();
  if (ref.current == null) {
    ref.current = generate();
  }
  return `${prefix}${ref.current}`;
}
