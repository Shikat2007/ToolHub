import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Globe, Link as LinkIcon, Loader2, AlertCircle, Download,
  FileVideo, Music, ExternalLink, Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props { onBack: () => void; }

interface DirectOption {
  label: string;
  kind: "video" | "audio" | "page";
  href: string;
  note?: string;
}

interface Analysis {
  platform: string;
  platformLabel: string;
  isValid: boolean;
  id: string | null;
  options: DirectOption[];
  guidance: string;
}

const PLATFORM_META: Record<string, { label: string; color: string }> = {
  youtube: { label: "YouTube", color: "text-red-500" },
  facebook: { label: "Facebook", color: "text-blue-500" },
  instagram: { label: "Instagram", color: "text-pink-500" },
  tiktok: { label: "TikTok", color: "text-cyan-500" },
  twitter: { label: "X / Twitter", color: "text-sky-500" },
  vimeo: { label: "Vimeo", color: "text-indigo-500" },
  reddit: { label: "Reddit", color: "text-orange-500" },
  streamable: { label: "Streamable", color: "text-emerald-500" },
  direct: { label: "Direct media file", color: "text-primary" },
  other: { label: "Other website", color: "text-muted-foreground" },
};

function detectPlatform(url: URL): { key: string; id: string | null } {
  const host = url.hostname.replace(/^(www|m|mobile)\./, "");
  const p = url.pathname;

  if (/(^|\.)youtube\.com$|^youtu\.be$/.test(url.hostname)) {
    const id = host.startsWith("youtu.be") ? p.slice(1).split("/")[0] : url.searchParams.get("v") ?? p.match(/\/(?:shorts|embed|live)\/([\w-]+)/)?.[1] ?? null;
    return { key: "youtube", id };
  }
  if (host.includes("facebook.com") || host.includes("fb.watch")) {
    return { key: "facebook", id: p.match(/\/videos?(?:\/[\w.-]+)?\/(\d+)/)?.[1] ?? p.match(/\/(\d{6,})/)?.[1] ?? null };
  }
  if (host.includes("instagram.com")) {
    return { key: "instagram", id: p.match(/\/(?:reel|reels|p|tv)\/([\w-]+)/)?.[1] ?? null };
  }
  if (host.includes("tiktok.com")) {
    return { key: "tiktok", id: p.match(/\/video\/(\d+)/)?.[1] ?? null };
  }
  if (host.includes("twitter.com") || host === "x.com" || host.endsWith(".x.com")) {
    return { key: "twitter", id: p.match(/\/status\/(\d+)/)?.[1] ?? null };
  }
  if (host.includes("vimeo.com")) {
    return { key: "vimeo", id: p.match(/\/(\d{6,})/)?.[1] ?? null };
  }
  if (host.includes("reddit.com")) {
    return { key: "reddit", id: p.match(/\/comments\/([\w-]+)/)?.[1] ?? null };
  }
  if (host.includes("streamable.com")) {
    return { key: "streamable", id: p.replace(/^\//, "").split("/")[0] || null };
  }
  if (/\.(mp4|webm|mov|m4v|mkv|mp3|wav|m4a|ogg|oga)$/i.test(p)) {
    return { key: "direct", id: null };
  }
  return { key: "other", id: null };
}

function analyzeUrl(rawUrl: string): Analysis {
  const url = new URL(rawUrl);
  const { key, id } = detectPlatform(url);
  const meta = PLATFORM_META[key] ?? PLATFORM_META.other;

  const options: DirectOption[] = [];

  if (key === "direct") {
    options.push({ label: "Download media file directly", kind: "video", href: url.href, note: "Streams straight from the source server to your browser" });
  }

  if (key === "youtube" && id) {
    const thumb = `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;
    options.push({ label: "Download thumbnail (max resolution JPG)", kind: "video", href: thumb, note: "Highest-res cover image, served by YouTube's CDN" });
  }

  if (key === "reddit" && id) {
    options.push({ label: "Open Reddit JSON API for media URLs", kind: "page", href: `${url.origin}${url.pathname.replace(/\/$/, "")}.json`, note: "Public JSON contains direct media links — copy the video URL and download" });
  }

  if (key === "streamable" && id) {
    options.push({ label: "Resolve via Streamable public API", kind: "page", href: `https://api.streamable.com/videos/${id}`, note: "Public JSON response includes the direct MP4 URL" });
  }

  if (key === "vimeo" && id) {
    options.push({ label: "Inspect oEmbed metadata", kind: "page", href: `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url.href)}`, note: "Public metadata endpoint" });
  }

  // Always-available escape hatches — these are real, working actions.
  options.push({ label: "Open original page in new tab", kind: "page", href: url.href });
  options.push({ label: "View page source (copy stream URLs)", kind: "page", href: `view-source:${url.href}`, note: "Browsers block view-source on some sites; then use a new tab to save media" });

  const guidance = key === "direct"
    ? "This is a direct media link — the download button streams it to you now, no keys required."
    : key === "other"
      ? "This domain isn't a known video platform. If the page hosts a media file, open it, right-click the video, and choose “Save video as…”. Everything happens in your browser."
      : `${meta.label} serves videos as encrypted, segmented streams. A browser alone can't stitch them — that's why no fake download buttons are shown here. Use the real actions below: they open the platform's own public endpoints where the media lives.`;

  return { platform: key, platformLabel: meta.label, isValid: true, id, options, guidance };
}

export default function MediaDownloader({ onBack }: Props) {
  const [url, setUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Analysis | null>(null);

  const handleAnalyze = () => {
    const raw = url.trim();
    if (!raw) return;
    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    // Strict validation: http(s) only, no shell metacharacters, sane length.
    const cleaned = raw.replace(/[\s`$;|&<>(){}[\]\\'"]/g, "");
    const urlPattern = /^https?:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/[^\s]*)?$/;

    try {
      if (!urlPattern.test(cleaned)) throw new Error("bad");
      const parsed = new URL(cleaned);
      if (!["http:", "https:"].includes(parsed.protocol)) throw new Error("bad");
      setTimeout(() => {
        setResult(analyzeUrl(cleaned));
        setIsAnalyzing(false);
      }, 350);
    } catch {
      setError("Invalid URL. Enter a full link starting with http:// or https:// (shell characters are stripped automatically).");
      setIsAnalyzing(false);
    }
  };

  const meta = result ? PLATFORM_META[result.platform] ?? PLATFORM_META.other : null;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-4 border-b border-border/60 px-6 py-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="size-9 shrink-0 cursor-pointer">
          <ArrowLeft className="size-4" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
            <Globe className="size-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Video Downloader</h2>
            <p className="text-xs text-muted-foreground">Analyze video URLs and grab media — no API keys, ever</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-6 py-8">
          {/* Input */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <LinkIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/50" />
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                placeholder="Paste a video URL (YouTube, Facebook, Reddit, direct MP4…)"
                className="h-11 pl-10 text-sm"
                spellCheck={false}
              />
            </div>
            <Button onClick={handleAnalyze} disabled={!url.trim() || isAnalyzing} className="cursor-pointer gap-2 px-5">
              {isAnalyzing ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
              <span className="hidden sm:inline">Analyze</span>
            </Button>
          </div>

          <p className="mt-2 text-[11px] text-muted-foreground">
            URLs are validated locally with a strict whitelist — nothing is uploaded or stored.
          </p>

          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className="mt-4 flex items-start gap-2.5 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {result && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                className="mt-6 space-y-5">

                {/* Detected platform card */}
                <div className="rounded-xl border border-border/60 bg-card p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                      <FileVideo className={`size-5 ${meta?.color ?? "text-muted-foreground"}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold">{result.platformLabel}</h3>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">{url.trim()}</p>
                      {result.id && <p className="mt-1 text-[10px] text-muted-foreground">Media ID: {result.id}</p>}
                    </div>
                  </div>
                  <p className="mt-3 rounded-lg bg-muted/50 p-3 text-xs leading-relaxed text-muted-foreground">
                    {result.guidance}
                  </p>
                </div>

                {/* Real, working actions */}
                <div>
                  <p className="mb-3 flex items-center gap-2 text-sm font-medium">
                    <Info className="size-3.5 text-primary" /> Available actions
                  </p>
                  <div className="space-y-2">
                    {result.options.map((opt) => (
                      <a key={opt.label} href={opt.href} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-3 rounded-xl border border-border/60 bg-card px-4 py-3 transition-colors hover:border-primary/30 group">
                        {opt.kind === "page" ? (
                          <ExternalLink className="size-4 shrink-0 text-primary" />
                        ) : (
                          opt.kind === "audio" ? <Music className="size-4 shrink-0 text-primary" /> : <FileVideo className="size-4 shrink-0 text-primary" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium group-hover:text-primary">{opt.label}</p>
                          {opt.note && <p className="text-[11px] text-muted-foreground">{opt.note}</p>}
                        </div>
                        <Download className="size-4 shrink-0 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                      </a>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty state */}
          {!result && !error && !isAnalyzing && (
            <div className="mt-16 text-center">
              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-muted/50">
                <Globe className="size-7 text-muted-foreground/50" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">Paste a video link to analyze it</p>
              <p className="mt-1 text-xs text-muted-foreground/70">
                Platform detection, thumbnail grabbing and direct-file downloads work out of the box
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
