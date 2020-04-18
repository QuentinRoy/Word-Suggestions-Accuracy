import { useLocation } from "react-router-dom";
import { useMemo } from "react";
import qs from "qs";

function decoder(str, defaultEncoder, charset, type) {
  if (type === "key") return defaultEncoder(str);
  switch (str.toLowerCase()) {
    case "true":
      return true;
    case "false":
      return false;
    default:
      return defaultEncoder(str);
  }
}

export default function useLocationParams() {
  const location = useLocation();
  return useMemo(() => {
    return qs.parse(location.search, {
      ignoreQueryPrefix: true,
      decoder,
    });
  }, [location]);
}
