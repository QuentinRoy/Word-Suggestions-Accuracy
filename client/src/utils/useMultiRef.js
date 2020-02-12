import { useRef, createRef } from "react";

const useMultiRef = (totalRefs, innerCreateRef = () => createRef()) => {
  const multiRef = useRef([]);
  const n = multiRef.current.length;
  if (n < totalRefs) {
    // Add missing refs.
    for (let i = n; i < totalRefs; i += 1) {
      multiRef.current.push(innerCreateRef(i));
    }
  } else if (n > totalRefs) {
    // Remove superfluous refs.
    const excess = n - totalRefs;
    multiRef.current.splice(n - excess, excess);
  }
  return multiRef.current;
};

export default useMultiRef;
