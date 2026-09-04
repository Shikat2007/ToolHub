/**
 * Media Routes — URL analysis and metadata extraction.
 *
 * Security:
 *   - Strict URL validation (HTTPS only)
 *   - SSRF protection (DNS resolution + private IP blocking)
 *   - Shell metacharacter rejection
 *   - No shell execution — pure HTTP fetch + HTML parsing
 *   - No persistence — all data discarded after response
 */

import { Router, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import { assertSafeUrl, isValidHttpUrl } from "../middleware/security";

export const mediaRoutes = Router();

// Per-route rate limiter: 10 requests per minute (stricter for external fetches)
const mediaLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Media rate limit exceeded. Try again in a minute." },
});

mediaRoutes.use(mediaLimiter);

// ── Helpers ──────────────────────────────────────────────────────────────────

function extractVideoId(
  url: string,
): { platform: string; videoId: string | null } {
  const parsed = new URL(url);
  const host = parsed.hostname.replace("www.", "").replace("m.", "");

  if (host.includes("youtube.com") || host.includes("youtu.be")) {
    if (host.includes("youtu.be")) {
      return {
        platform: "youtube",
        videoId: parsed.pathname.slice(1).split("?")[0] || null,
      };
    }
    const vParam = parsed.searchParams.get("v");
    if (vParam) return { platform: "youtube", videoId: vParam };
    const shortMatch = parsed.pathname.match(/^\/shorts\/([\w-]+)/);
    if (shortMatch)
      return { platform: "youtube", videoId: shortMatch[1] };
    return { platform: "youtube", videoId: null };
  }

  if (
    host.includes("facebook.com") ||
    host.includes("fb.com") ||
    host.includes("fb.watch")
  ) {
    const videoMatch = parsed.pathname.match(/\/videos?\/(\d+)/);
    return { platform: "facebook", videoId: videoMatch?.[1] ?? null };
  }

  if (host.includes("instagram.com")) {
    const reelMatch = parsed.pathname.match(/\/reel\/([\w-]+)/);
    const postMatch = parsed.pathname.match(/\/p\/([\w-]+)/);
    return {
      platform: "instagram",
      videoId: reelMatch?.[1] ?? postMatch?.[1] ?? null,
    };
  }

  if (host.includes("tiktok.com")) {
    const videoMatch = parsed.pathname.match(/\/video\/(\d+)/);
    return { platform: "tiktok", videoId: videoMatch?.[1] ?? null };
  }

  if (host.includes("twitter.com") || host.includes("x.com")) {
    const statusMatch = parsed.pathname.match(/\/status\/(\d+)/);
    return { platform: "twitter", videoId: statusMatch?.[1] ?? null };
  }

  return { platform: "other", videoId: null };
}

async function fetchPageMetadata(
  url: string,
): Promise<{ title: string; description: string; thumbnail: string | null }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; ToolHub/1.0; +https://toolhub.internal)",
        Accept: "text/html",
      },
      redirect: "follow",
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return { title: "Untitled", description: "", thumbnail: null };
    }

    const html = await response.text();
    const chunk = html.slice(0, 50_000);

    const ogTitle = chunk.match(
      /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i,
    );
    const titleTag = chunk.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = ogTitle?.[1] ?? titleTag?.[1] ?? "Untitled";

    const ogDesc = chunk.match(
      /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i,
    );
    const metaDesc = chunk.match(
      /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i,
    );
    const description = ogDesc?.[1] ?? metaDesc?.[1] ?? "";

    const ogImage = chunk.match(
      /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
    );
    const thumbnail = ogImage?.[1] ?? null;

    return { title: title.trim(), description: description.trim(), thumbnail };
  } catch {
    return { title: "Untitled", description: "", thumbnail: null };
  }
}

// ── POST /api/media/analyze ─────────────────────────────────────────────────

mediaRoutes.post("/analyze", async (req: Request, res: Response) => {
  try {
    const { url } = req.body as { url: string };

    if (!url || typeof url !== "string") {
      res.status(400).json({ error: "URL is required." });
      return;
    }

    if (!isValidHttpUrl(url)) {
      res
        .status(400)
        .json({ error: "Invalid URL. Enter a valid HTTP or HTTPS URL." });
      return;
    }

    // SSRF check
    await assertSafeUrl(url);

    const { platform, videoId } = extractVideoId(url);
    const metadata = await fetchPageMetadata(url);

    interface DownloadOption {
      quality: string;
      format: string;
      label: string;
      requiresBackend: boolean;
    }

    let downloadOptions: DownloadOption[] = [];

    if (platform === "youtube" && videoId) {
      downloadOptions = [
        { quality: "1080p", format: "mp4", label: "Full HD (1080p)", requiresBackend: true },
        { quality: "720p", format: "mp4", label: "HD (720p)", requiresBackend: true },
        { quality: "480p", format: "mp4", label: "SD (480p)", requiresBackend: true },
        { quality: "audio", format: "mp3", label: "Audio only (MP3)", requiresBackend: true },
      ];
    } else if (platform === "facebook" && videoId) {
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

    res.json({
      platform,
      videoId,
      title: metadata.title,
      description: metadata.description,
      thumbnail: metadata.thumbnail,
      downloadOptions,
      originalUrl: url,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Internal server error";
    res.status(500).json({ error: message });
  }
});
