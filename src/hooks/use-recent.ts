import { useCallback, useEffect, useState } from "react";

const MAX_RECENT = 4;

export function useRecent() {
  const [recent, setRecent] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("toolhub-recent") ?? "[]"); }
    catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem("toolhub-recent", JSON.stringify(recent));
  }, [recent]);

  const trackUsage = useCallback((toolId: string) => {
    setRecent((prev) => [toolId, ...prev.filter((id) => id !== toolId)].slice(0, MAX_RECENT));
  }, []);

  return { recent, trackUsage };
}
