import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Globe,
  Link,
  Loader2,
  AlertCircle,
  Download,
  ExternalLink,
  Music,
  Video,
  Facebook,
  Instagram,
  Twitter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface MediaDownloaderProps {
  onBack: () => void;
}

interface MediaResult {
  platform: string;
  videoId: string | null;
  title: string;
  description: string;
  thumbnail: string | null;
  downloadOptions: Array<{
    quality: string;
    format: string;
    label: string;
    requiresBackend: boolean;
  }>;
  originalUrl: string;
}

const platformIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  youtube: Video,
  facebook: Facebook,
  instagram: Instagram,
  tiktok: Globe,
  twitter: Twitter,
  other: Globe,
};

const platformColors: Record<string, string> = {
  youtube: "text-red-500",
  facebook: "text-blue-500",
  instagram: "text-pink-500",
  tiktok: "text-cyan-500",
  twitter: "text-sky-500",
  other: "text-muted-foreground",
};

export default function MediaDownloader({ onBack }: MediaDownloaderProps) {
  const [url, setUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MediaResult | null>(null);

  const handleAnalyze = async () => {
    if (!url.trim()) return;
    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      // Client-side URL analysis (no backend required)
      const parsed = new URL(url.trim());
      const host = parsed.hostname.replace("www.", "").replace("m.", "");

      let platform = "other";
      let videoId: string | null = null;

      if (host.includes("youtube.com") || host.includes("youtu.be")) {
        platform = "youtube";
        if (host.includes("youtu.be")) {
          videoId = parsed.pathname.slice(1).split("?")[0] || null;
        } else {
          videoId = parsed.searchParams.get("v");
        }
      } else if (host.includes("facebook.com") || host.includes("fb.com") || host.includes("fb.watch")) {
        platform = "facebook";
        const match = parsed.pathname.match(/\/videos?\/(\d+)/);
        videoId = match?.[1] ?? null;
      } else if (host.includes("instagram.com")) {
        platform = "instagram";
        const match = parsed.pathname.match(/\/reel\/([\w-]+)/) || parsed.pathname.match(/\/p\/([\w-]+)/);
        videoId = match?.[1] ?? null;
      } else if (host.includes("tiktok.com")) {
        platform = "tiktok";
        const match = parsed.pathname.match(/\/video\/(\d+)/);
        videoId = match?.[1] ?? null;
      } else if (host.includes("twitter.com") || host.includes("x.com")) {
        platform = "twitter";
        const match = parsed.pathname.match(/\/status\/(\d+)/);
        videoId = match?.[1] ?? null;
      }

      // Build download options
      let downloadOptions: MediaResult["downloadOptions"] = [];

      if (platform === "youtube") {
        downloadOptions = [
          { quality: "1080p", format: "mp4", label: "Full HD (1080p)", requiresBackend: true },
          { quality: "720p", format: "mp4", label: "HD (720p)", requiresBackend: true },
          { quality: "480p", format: "mp4", label: "SD (480p)", requiresBackend: true },
          { quality: "audio", format: "mp3", label: "Audio only (MP3)", requiresBackend: true },
        ];
      } else if (platform === "facebook") {
        downloadOptions = [
          { quality: "hd", format: "mp4", label: "HD Quality", requiresBackend: true },
          { quality: "sd", format: "mp4", label: "SD Quality", requiresBackend: true },
        ];
      } else if (platform === "instagram") {
        downloadOptions = [
          { quality: "original", format: "mp4", label: "Original Quality", requiresBackend: true },
        ];
      } else if (platform === "tiktok") {
        downloadOptions = [
          { quality: "hd", format: "mp4", label: "HD (No Watermark)", requiresBackend: true },
          { quality: "sd", format: "mp4", label: "SD (No Watermark)", requiresBackend: true },
          { quality: "audio", format: "mp3", label: "Audio only (MP3)", requiresBackend: true },
        ];
      } else if (platform === "twitter") {
        downloadOptions = [
          { quality: "original", format: "mp4", label: "Original Quality", requiresBackend: true },
          { quality: "medium", format: "mp4", label: "Compressed", requiresBackend: true },
        ];
      } else {
        downloadOptions = [
          { quality: "original", format: "mp4", label: "Original Quality", requiresBackend: true },
        ];
      }

      setResult({
        platform,
        videoId,
        title: `Video from ${platform.charAt(0).toUpperCase() + platform.slice(1)}`,
        description: `Detected ${platform} video. ID: ${videoId ?? "unknown"}`,
        thumbnail: null,
        downloadOptions,
        originalUrl: url.trim(),
      });
    } catch {
      setError("Invalid URL. Please enter a valid video link.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const PlatformIcon = platformIcons[result?.platform ?? "other"] ?? Globe;

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-border/60 px-6 py-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="size-9 shrink-0 cursor-pointer">
          <ArrowLeft className="size-4" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
            <Globe className="size-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Universal Downloader</h2>
            <p className="text-xs text-muted-foreground">
              Download videos from YouTube, Instagram, TikTok, and more
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-6 py-8">
          {/* URL input */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Link className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/50" />
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                placeholder="Paste a video URL (YouTube, Instagram, TikTok, etc.)"
                className="h-11 pl-10 text-sm"
              />
            </div>
            <Button
              onClick={handleAnalyze}
              disabled={!url.trim() || isAnalyzing}
              className="cursor-pointer gap-2 px-5"
            >
              {isAnalyzing ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Download className="size-4" />
              )}
              <span className="hidden sm:inline">Fetch</span>
            </Button>
          </div>

          <p className="mt-2 text-[11px] text-muted-foreground">
            Supports YouTube, Facebook, Instagram, TikTok, Twitter/X, and other video platforms.
          </p>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className="mt-4 flex items-start gap-2.5 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Result */}
          <AnimatePresence>
            {result && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                className="mt-6 space-y-5">

                {/* Video info card */}
                <div className="overflow-hidden rounded-xl border border-border/60 bg-card">
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <PlatformIcon className={`mt-0.5 size-5 shrink-0 ${platformColors[result.platform] ?? "text-muted-foreground"}`} />
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-semibold leading-snug">{result.title}</h3>
                        {result.description && (
                          <p className="mt-1 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                            {result.description}
                          </p>
                        )}
                        <div className="mt-2 flex items-center gap-2">
                          <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                            {result.platform}
                          </span>
                          {result.videoId && (
                            <span className="text-[10px] text-muted-foreground">
                              ID: {result.videoId}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Download options */}
                <div>
                  <p className="mb-3 text-sm font-medium">Available Formats</p>
                  <div className="space-y-2">
                    {result.downloadOptions.map((opt) => (
                      <div
                        key={opt.quality}
                        className="flex items-center gap-3 rounded-xl border border-border/60 bg-card px-4 py-3 transition-colors hover:border-primary/30"
                      >
                        {opt.format === "mp3" ? (
                          <Music className="size-4 shrink-0 text-primary" />
                        ) : (
                          <Video className="size-4 shrink-0 text-primary" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium">{opt.label}</p>
                          <p className="text-[11px] text-muted-foreground uppercase">
                            {opt.format}
                          </p>
                        </div>
                        {opt.requiresBackend ? (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled
                            className="gap-1.5"
                          >
                            <ExternalLink className="size-3.5" />
                            Requires API
                          </Button>
                        ) : (
                          <Button variant="default" size="sm" className="cursor-pointer gap-1.5">
                            <Download className="size-3.5" />
                            Download
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="mt-3 rounded-lg bg-muted/50 p-3 text-[11px] leading-relaxed text-muted-foreground">
                    Direct video downloading requires a backend service (yt-dlp or equivalent).
                    This interface analyzes the URL, detects the platform, and presents available
                    formats. Connect a download API endpoint to enable actual file downloads.
                  </p>
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
              <p className="text-sm font-medium text-muted-foreground">
                Paste a video link above to get started
              </p>
              <p className="mt-1 text-xs text-muted-foreground/70">
                We&apos;ll detect the platform and show available download options
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
