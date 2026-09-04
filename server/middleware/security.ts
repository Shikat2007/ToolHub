/**
 * Security Middleware — SSRF protection, input validation, command injection prevention.
 *
 * All checks are pure runtime (in-memory). No database, no logging to disk.
 */

import { Request, Response, NextFunction } from "express";
import dns from "dns";

// ── SSRF Protection ─────────────────────────────────────────────────────────

const PRIVATE_RANGES: Array<{ start: number[]; end: number[] }> = [
  { start: [127, 0, 0, 0], end: [127, 255, 255, 255] },
  { start: [10, 0, 0, 0], end: [10, 255, 255, 255] },
  { start: [172, 16, 0, 0], end: [172, 31, 255, 255] },
  { start: [192, 168, 0, 0], end: [192, 168, 255, 255] },
  { start: [0, 0, 0, 0], end: [0, 255, 255, 255] },
  { start: [169, 254, 0, 0], end: [169, 254, 255, 255] },
];

function ipToNumber(ip: string): number[] {
  return ip.split(".").map(Number);
}

function isInRange(
  ipParts: number[],
  range: { start: number[]; end: number[] },
): boolean {
  for (let i = 0; i < 4; i++) {
    if (ipParts[i] < range.start[i] || ipParts[i] > range.end[i]) return false;
  }
  return true;
}

function isPrivateIP(ip: string): boolean {
  const parts = ipToNumber(ip);
  if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255))
    return false;
  return PRIVATE_RANGES.some((r) => isInRange(parts, r));
}

/**
 * Resolve a hostname and verify none of the resolved IPs are private/internal.
 */
export async function assertSafeUrl(url: string): Promise<void> {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error("Invalid URL format.");
  }

  const protocol = parsed.protocol.toLowerCase();
  if (protocol !== "http:" && protocol !== "https:") {
    throw new Error("Only HTTP and HTTPS URLs are allowed.");
  }

  const hostname = parsed.hostname.toLowerCase();

  if (
    hostname === "localhost" ||
    hostname === "[::1]" ||
    hostname === "0.0.0.0"
  ) {
    throw new Error("Requests to localhost are blocked.");
  }

  // If hostname is an IP literal
  const ipParts = ipToNumber(hostname);
  if (ipParts.length === 4 && ipParts.every((p) => !isNaN(p))) {
    if (isPrivateIP(hostname)) {
      throw new Error("Requests to private IP ranges are blocked.");
    }
    return;
  }

  // DNS resolution check
  try {
    const addresses = await new Promise<string[]>((resolve, reject) => {
      dns.resolve4(hostname, (err, addrs) => {
        if (err) reject(err);
        else resolve(addrs);
      });
    });

    for (const addr of addresses) {
      if (isPrivateIP(addr)) {
        throw new Error(
          `SSRF blocked: "${hostname}" resolves to private IP ${addr}.`,
        );
      }
    }
  } catch (err) {
    if (err instanceof Error && err.message.startsWith("SSRF")) throw err;
    throw new Error(`Could not resolve hostname "${hostname}".`);
  }
}

// ── Command Injection Prevention ─────────────────────────────────────────────

const SHELL_METACHARACTERS = /[;&|`$(){}[\]<>!\\]/;

function containsShellMetachars(input: string): boolean {
  return SHELL_METACHARACTERS.test(input);
}

// ── URL Validation ───────────────────────────────────────────────────────────

const SAFE_URL_RE = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;

export function isValidHttpUrl(url: string): boolean {
  if (!SAFE_URL_RE.test(url)) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

// ── Middleware ────────────────────────────────────────────────────────────────

export function securityMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  // Block shell metacharacters in any query param or body string
  const checkString = (val: unknown): boolean => {
    if (typeof val === "string") return containsShellMetachars(val);
    if (Array.isArray(val)) return val.some(checkString);
    if (val && typeof val === "object") {
      return Object.values(val).some(checkString);
    }
    return false;
  };

  if (checkString(req.query) || checkString(req.body)) {
    res.status(400).json({ error: "Invalid input: prohibited characters detected." });
    return;
  }

  next();
}

// ── Resource Limits ──────────────────────────────────────────────────────────

export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB
export const MAX_MERGE_FILES = 20;
export const MAX_OUTPUT_SIZE = 200 * 1024 * 1024; // 200 MB

/** Validate PDF page range string like "1-3,5,8-10". Returns 1-indexed pages. */
export function parsePageRange(input: string, maxPage: number): number[] {
  const pages = new Set<number>();
  const parts = input.split(",").map((s) => s.trim());

  for (const part of parts) {
    if (/^\d+-\d+$/.test(part)) {
      const [start, end] = part.split("-").map(Number);
      if (start < 1 || end > maxPage || start > end) {
        throw new Error(
          `Invalid range "${part}". Must be between 1 and ${maxPage}.`,
        );
      }
      for (let i = start; i <= end; i++) pages.add(i);
    } else if (/^\d+$/.test(part)) {
      const n = Number(part);
      if (n < 1 || n > maxPage) {
        throw new Error(`Page ${n} is out of range (1–${maxPage}).`);
      }
      pages.add(n);
    } else {
      throw new Error(`Invalid page specification "${part}".`);
    }
  }

  if (pages.size === 0) throw new Error("No valid pages specified.");
  return Array.from(pages).sort((a, b) => a - b);
}
