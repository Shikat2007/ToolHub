import { useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft, Gauge, Play, Loader2, Download, Upload,
  Wifi, ArrowDown, ArrowUp, Timer, Activity, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props { onBack: () => void; }

type Phase = "idle" | "running" | "done";

const TEST_SERVERS = [
  "https://speed.cloudflare.com/__down?bytes=",
  "https://httpbin.org/bytes/",
];

// Well-known, CORS-enabled endpoints used for latency probing.
const PING_TARGETS = [
  "https://speed.cloudflare.com/__down?bytes=0",
  "https://www.google.com/generate_204",
];

const DOWNLOAD_SIZES = [500_000, 2_000_000, 8_000_000, 20_000_000]; // ramp up
const UPLOAD_PAYLOAD = 1_000_000; // 1 MB echo round trip

function fmtSpeed(mbps: number): string {
  if (mbps >= 100) return mbps.toFixed(0);
  if (mbps >= 10) return mbps.toFixed(1);
  return mbps.toFixed(2);
}

async function timedFetch(url: string, init?: RequestInit): Promise<{ ms: number; bytes: number }> {
  const t0 = performance.now();
  const res = await fetch(url, { ...init, cache: "no-store" });
  const buf = await res.arrayBuffer();
  const ms = performance.now() - t0;
  return { ms, bytes: buf.byteLength };
}

export default function SpeedTest({ onBack }: Props) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [ping, setPing] = useState<number | null>(null);
  const [jitter, setJitter] = useState<number | null>(null);
  const [downMbps, setDownMbps] = useState<number | null>(null);
  const [upMbps, setUpMbps] = useState<number | null>(null);
  const [liveMbps, setLiveMbps] = useState(0);
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const measurePing = async (signal: AbortSignal) => {
    setCurrentStage("Measuring latency");
    const samples: number[] = [];
    for (let i = 0; i < 6; i++) {
      const target = PING_TARGETS[i % PING_TARGETS.length];
      try {
        const { ms } = await timedFetch(target, { signal });
        samples.push(ms);
      } catch (e) {
        if (signal.aborted) throw e;
      }
      setProgress(5 + (i / 6) * 10);
    }
    if (samples.length === 0) throw new Error("Could not reach any test endpoint. Check your connection.");
    samples.sort((a, b) => a - b);
    const median = samples[Math.floor(samples.length / 2)];
    const mean = samples.reduce((s, v) => s + v, 0) / samples.length;
    setPing(Math.round(median));
    setJitter(Math.max(1, Math.round(Math.abs(median - mean))));
  };

  const measureDownload = async (signal: AbortSignal) => {
    setCurrentStage("Testing download speed");
    let totalBytes = 0;
    let totalMs = 0;
    const startProgress = 15;
    for (let i = 0; i < DOWNLOAD_SIZES.length; i++) {
      const url = `${TEST_SERVERS[0]}${DOWNLOAD_SIZES[i]}&cb=${Date.now()}`;
      const t0 = performance.now();
      try {
        const res = await fetch(url, { signal, cache: "no-store" });
        const reader = res.body?.getReader();
        if (!reader) {
          const buf = await res.arrayBuffer();
          totalBytes += buf.byteLength;
          totalMs += performance.now() - t0;
        } else {
          let received = 0;
          for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            received += value.byteLength;
            totalBytes += value.byteLength;
            const elapsed = (performance.now() - t0) / 1000;
            if (elapsed > 0.05) setLiveMbps((received * 8) / elapsed / 1_000_000);
          }
          totalMs += performance.now() - t0;
        }
      } catch (e) {
        if (signal.aborted) throw e;
        // Try fallback server for this size
        try {
          const r2 = await timedFetch(`https://httpbin.org/bytes/${Math.floor(DOWNLOAD_SIZES[i] / 1000)}`, { signal });
          totalBytes += r2.bytes;
          totalMs += r2.ms;
        } catch {
          if (i === 0) throw new Error("Download test endpoints unreachable.");
        }
      }
      setProgress(startProgress + ((i + 1) / DOWNLOAD_SIZES.length) * 55);
    }
    if (totalBytes === 0) throw new Error("Download test failed — no data received.");
    const seconds = totalMs / 1000;
    setDownMbps((totalBytes * 8) / seconds / 1_000_000);
  };

  const measureUpload = async (signal: AbortSignal) => {
    setCurrentStage("Testing upload speed");
    const payload = new Uint8Array(UPLOAD_PAYLOAD).fill(65); // deterministic "AAAA"
    const blobs = [payload, payload, payload];
    let totalBytes = 0;
    let totalMs = 0;
    for (let i = 0; i < blobs.length; i++) {
      const t0 = performance.now();
      try {
        await fetch("https://speed.cloudflare.com/__up", {
          method: "POST",
          body: blobs[i],
          signal,
          cache: "no-store",
        });
        totalMs += performance.now() - t0;
        totalBytes += UPLOAD_PAYLOAD;
      } catch (e) {
        if (signal.aborted) throw e;
      }
      setProgress(70 + ((i + 1) / blobs.length) * 25);
    }
    if (totalBytes === 0) {
      // Upload endpoint unavailable — skip rather than fail the whole test
      setUpMbps(null);
      return;
    }
    setUpMbps((totalBytes * 8) / (totalMs / 1000) / 1_000_000);
  };

  const runTest = async () => {
    setPhase("running");
    setError(null);
    setPing(null); setJitter(null); setDownMbps(null); setUpMbps(null);
    setLiveMbps(0); setProgress(0);
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      await measurePing(controller.signal);
      await measureDownload(controller.signal);
      await measureUpload(controller.signal);
      setProgress(100);
      setPhase("done");
    } catch (e) {
      if (!controller.signal.aborted) {
        setError(e instanceof Error ? e.message : "Speed test failed. Try again.");
        setPhase("idle");
      }
    } finally {
      abortRef.current = null;
    }
  };

  const stopTest = () => {
    abortRef.current?.abort();
    setPhase("idle");
    setCurrentStage("");
    setProgress(0);
    setLiveMbps(0);
  };

  const results = [
    { icon: Timer, label: "Ping", value: ping !== null ? `${ping} ms` : "—", tint: "text-emerald-500" },
    { icon: Activity, label: "Jitter", value: jitter !== null ? `${jitter} ms` : "—", tint: "text-amber-500" },
    { icon: ArrowDown, label: "Download", value: downMbps !== null ? `${fmtSpeed(downMbps)} Mbps` : "—", tint: "text-blue-500" },
    { icon: ArrowUp, label: "Upload", value: upMbps !== null ? `${fmtSpeed(upMbps)} Mbps` : "—", tint: "text-violet-500" },
  ];

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-4 border-b border-border/60 px-6 py-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="size-9 shrink-0 cursor-pointer">
          <ArrowLeft className="size-4" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
            <Gauge className="size-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Internet Speed Test</h2>
            <p className="text-xs text-muted-foreground">Live ping, jitter, download and upload measurements</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl px-6 py-10">
          {/* Dial */}
          <div className="flex flex-col items-center">
            <motion.div
              animate={phase === "running" ? { scale: [1, 1.03, 1] } : { scale: 1 }}
              transition={phase === "running" ? { repeat: Infinity, duration: 1.6 } : {}}
              className="relative flex size-52 items-center justify-center rounded-full border border-border/60 bg-card shadow-inner"
            >
              <svg viewBox="0 0 200 200" className="absolute inset-0 size-full -rotate-90">
                <circle cx="100" cy="100" r="88" fill="none" stroke="var(--border)" strokeWidth="10" />
                <circle
                  cx="100" cy="100" r="88" fill="none" stroke="var(--primary)" strokeWidth="10" strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 88}
                  strokeDashoffset={2 * Math.PI * 88 * (1 - progress / 100)}
                  style={{ transition: "stroke-dashoffset 0.3s ease" }}
                />
              </svg>
              <div className="text-center">
                {phase === "running" ? (
                  <>
                    <p className="text-3xl font-bold tabular-nums tracking-tight">{fmtSpeed(liveMbps)}</p>
                    <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Mbps live</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">{currentStage}</p>
                  </>
                ) : phase === "done" ? (
                  <>
                    <CheckCircle2 className="mx-auto size-8 text-emerald-500" />
                    <p className="mt-2 text-sm font-semibold">Test complete</p>
                    <p className="text-[11px] text-muted-foreground">Results below</p>
                  </>
                ) : (
                  <>
                    <Wifi className="mx-auto size-8 text-muted-foreground" />
                    <p className="mt-2 text-sm font-medium text-muted-foreground">Ready to test</p>
                  </>
                )}
              </div>
            </motion.div>

            <div className="mt-6 flex gap-2">
              {phase === "running" ? (
                <Button variant="outline" onClick={stopTest} className="cursor-pointer gap-2">
                  <Loader2 className="size-4 animate-spin" /> Stop test
                </Button>
              ) : (
                <Button onClick={runTest} className="cursor-pointer gap-2 px-6 shadow-lg shadow-primary/20">
                  <Play className="size-4" /> {phase === "done" ? "Run again" : "Start speed test"}
                </Button>
              )}
            </div>
          </div>

          {error && (
            <div className="mt-6 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Results */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {results.map((r) => (
              <div key={r.label} className="rounded-xl border border-border/60 bg-card p-4 text-center">
                <r.icon className={`mx-auto size-4 ${r.tint}`} />
                <p className="mt-2 text-lg font-bold tabular-nums tracking-tight">{r.value}</p>
                <p className="text-[11px] text-muted-foreground">{r.label}</p>
              </div>
            ))}
          </div>

          <p className="mt-6 text-center text-[11px] leading-relaxed text-muted-foreground">
            Measurements use public CORS-enabled endpoints (Cloudflare speed test, httpbin).
            Results are indicative and depend on endpoint load — for certification-grade testing
            use your ISP&apos;s tooling. Nothing about your traffic is stored.
          </p>
        </div>
      </div>
    </div>
  );
}
