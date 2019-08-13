import { useState, useEffect } from "react";

const useHasWindowFocus = () => {
  const [hasWindowFocus, setHasWindowFocus] = useState(document.hasFocus());

  return hasWindowFocus;
};

export default useHasWindowFocus;
