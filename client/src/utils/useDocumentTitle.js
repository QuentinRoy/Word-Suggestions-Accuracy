import { useEffect } from "react";

function setTitle(title) {
  if (document.title !== title) {
    document.title = title;
  }
}

export default function useDocumentTitle(title) {
  useEffect(() => {
    const originalTitle = document.title;
    setTitle(title);
    return () => setTitle(originalTitle);
  }, [title]);
}
