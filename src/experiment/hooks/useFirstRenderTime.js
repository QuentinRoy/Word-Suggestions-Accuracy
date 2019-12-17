import { useRef } from "react";

export default function useFirstRenderTime() {
  return useRef(new Date()).current;
}
