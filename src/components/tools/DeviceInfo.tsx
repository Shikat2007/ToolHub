import { useEffect, useState } from "react";
import { ArrowLeft, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Info {
  browser: string; os: string; platform: string;
  screenWidth: number; screenHeight: number;
  viewportWidth: number; viewportHeight: number;
  colorDepth: number; pixelRatio: number;
  language: string; cookiesEnabled: boolean;
  online: boolean; connection: string;
  touchSupport: string; deviceMemory: string;
  hardwareConcurrency: string; maxTouchPoints: number;
}

export default function DeviceInfo({ onBack }: { onBack: () => void }) {
  const [info, setInfo] = useState<Info | null>(null);

  useEffect(() => {
    const ua = navigator.userAgent;
    let browser = "Unknown";
    if (ua.includes("Firefox")) browser = "Firefox";
    else if (ua.includes("Edg")) browser = "Edge";
    else if (ua.includes("Chrome")) browser = "Chrome";
    else if (ua.includes("Safari")) browser = "Safari";

    let os = "Unknown";
    if (ua.includes("Win")) os = "Windows";
    else if (ua.includes("Mac")) os = "macOS";
    else if (ua.includes("Linux")) os = "Linux";
    else if (ua.includes("Android")) os = "Android";
    else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";

    const conn = (navigator as any).connection;
    const connection = conn ? `${conn.effectiveType ?? "unknown"} (${conn.downlink ?? "?"} Mbps)` : "Not available";

    setInfo({
      browser, os, platform: navigator.platform || "Unknown",
      screenWidth: screen.width, screenHeight: screen.height,
      viewportWidth: window.innerWidth, viewportHeight: window.innerHeight,
      colorDepth: screen.colorDepth, pixelRatio: window.devicePixelRatio,
      language: navigator.language, cookiesEnabled: navigator.cookieEnabled,
      online: navigator.onLine, connection,
      touchSupport: "ontouchstart" in window ? "Yes" : "No",
      deviceMemory: `${(navigator as any).deviceMemory ?? "N/A"} GB`,
      hardwareConcurrency: `${navigator.hardwareConcurrency ?? "N/A"} cores`,
      maxTouchPoints: navigator.maxTouchPoints,
    });
  }, []);

  const rows: { label: string; value: string }[] = info ? [
    { label: "Browser", value: info.browser },
    { label: "Operating System", value: info.os },
    { label: "Platform", value: info.platform },
    { label: "Screen Resolution", value: `${info.screenWidth} × ${info.screenHeight}` },
    { label: "Viewport Size", value: `${info.viewportWidth} × ${info.viewportHeight}` },
    { label: "Color Depth", value: `${info.colorDepth}-bit` },
    { label: "Pixel Ratio", value: `${info.pixelRatio}x` },
    { label: "Language", value: info.language },
    { label: "Cookies Enabled", value: info.cookiesEnabled ? "Yes" : "No" },
    { label: "Online Status", value: info.online ? "Online" : "Offline" },
    { label: "Connection", value: info.connection },
    { label: "Touch Support", value: info.touchSupport },
    { label: "Max Touch Points", value: `${info.maxTouchPoints}` },
    { label: "Device Memory", value: info.deviceMemory },
    { label: "CPU Cores", value: info.hardwareConcurrency },
  ] : [];

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-4 border-b border-border/60 px-6 py-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="size-9 shrink-0 cursor-pointer"><ArrowLeft className="size-4" /></Button>
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10"><Monitor className="size-5 text-primary" /></div>
          <div><h2 className="text-lg font-semibold tracking-tight">Device & Browser Info</h2><p className="text-xs text-muted-foreground">Screen, browser, viewport, and network details</p></div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-lg px-6 py-8 space-y-4">
          {/* Hero stat cards */}
          <div className="grid grid-cols-2 gap-3">
            {info && [
              { label: "Resolution", value: `${info.screenWidth}×${info.screenHeight}` },
              { label: "Viewport", value: `${info.viewportWidth}×${info.viewportHeight}` },
              { label: "Pixel Ratio", value: `${info.pixelRatio}x` },
              { label: "Cores", value: info.hardwareConcurrency },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-border/60 bg-card p-4 text-center">
                <p className="text-xl font-bold tracking-tight text-primary">{s.value}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Detail table */}
          <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
            {rows.map((row, i) => (
              <div key={row.label} className={`flex items-center justify-between px-4 py-2.5 text-sm ${i < rows.length - 1 ? "border-b border-border/30" : ""}`}>
                <span className="text-muted-foreground">{row.label}</span>
                <span className="font-medium text-right">{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
