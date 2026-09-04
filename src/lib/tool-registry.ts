export interface ToolDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: ToolCategory;
  routeKey?: string;
  comingSoon?: boolean;
}

export type ToolCategory =
  | "pdf"
  | "scan"
  | "image"
  | "text"
  | "utility"
  | "media";

export interface CategoryDef {
  id: ToolCategory;
  label: string;
  icon: string;
}

export const categories: CategoryDef[] = [
  { id: "pdf", label: "PDF & Document", icon: "FileText" },
  { id: "scan", label: "Document Scanner", icon: "ScanLine" },
  { id: "image", label: "Image & Photo", icon: "Image" },
  { id: "text", label: "Text & Productivity", icon: "Type" },
  { id: "utility", label: "Daily Utilities", icon: "Wrench" },
  { id: "media", label: "Media Tools", icon: "Download" },
];

export const tools: ToolDef[] = [
  // ── PDF & Document ─────────────────────────────────────────
  {
    id: "merge-pdf",
    name: "Merge PDF",
    description: "Combine multiple PDF files into a single document.",
    icon: "Combine",
    category: "pdf",
    routeKey: "merge-pdf",
  },
  {
    id: "split-pdf",
    name: "Split PDF",
    description: "Extract pages from a PDF into separate files.",
    icon: "Scissors",
    category: "pdf",
    routeKey: "split-pdf",
  },
  {
    id: "compress-pdf",
    name: "Compress PDF",
    description: "Reduce PDF file size while maintaining quality.",
    icon: "Minimize2",
    category: "pdf",
    routeKey: "compress-pdf",
  },
  {
    id: "pdf-to-image",
    name: "PDF to Image",
    description: "Convert PDF pages to PNG or JPEG images.",
    icon: "Image",
    category: "pdf",
    routeKey: "pdf-to-image",
  },

  // ── Document Scanner ───────────────────────────────────────
  {
    id: "doc-scanner",
    name: "Document Scanner",
    description:
      "Scan documents with your camera, enhance with filters, export as JPG, PNG, or PDF.",
    icon: "ScanLine",
    category: "scan",
    routeKey: "doc-scanner",
  },
  {
    id: "ocr",
    name: "Image to Text",
    description: "Extract readable text from images using OCR.",
    icon: "ScanText",
    category: "scan",
    routeKey: "ocr",
  },

  // ── Image & Photo ──────────────────────────────────────────
  {
    id: "image-compress",
    name: "Image Compressor",
    description: "Reduce image file size with quality control.",
    icon: "Shrink",
    category: "image",
    routeKey: "image-compress",
  },
  {
    id: "image-resize",
    name: "Image Resizer",
    description: "Resize and crop images with aspect ratio presets.",
    icon: "Crop",
    category: "image",
    routeKey: "image-resize",
  },
  {
    id: "image-convert",
    name: "Image Format Converter",
    description: "Convert between JPG, PNG, and WebP formats.",
    icon: "ArrowRightLeft",
    category: "image",
    routeKey: "image-convert",
  },

  // ── Text & Productivity ────────────────────────────────────
  {
    id: "text-counter",
    name: "Word Counter",
    description: "Count words, characters, sentences, and paragraphs.",
    icon: "Hash",
    category: "text",
    routeKey: "text-counter",
  },
  {
    id: "text-case",
    name: "Text Case Converter",
    description: "Convert text to UPPERCASE, lowercase, Title Case, and more.",
    icon: "CaseSensitive",
    category: "text",
    routeKey: "text-case",
  },

  // ── Daily Utilities ────────────────────────────────────────
  {
    id: "qr-code",
    name: "QR Code Generator",
    description: "Generate and scan QR codes from text or images.",
    icon: "QrCode",
    category: "utility",
    routeKey: "qr-code",
  },
  {
    id: "password-gen",
    name: "Password Generator",
    description: "Generate strong, customizable passwords.",
    icon: "KeyRound",
    category: "utility",
    routeKey: "password-gen",
  },

  // ── Media Tools ────────────────────────────────────────────
  {
    id: "video-downloader",
    name: "Video Downloader",
    description:
      "Download videos from YouTube, Instagram, TikTok, and more.",
    icon: "Globe",
    category: "media",
    routeKey: "video-downloader",
  },
  {
    id: "audio-extractor",
    name: "Audio Extractor",
    description: "Extract audio tracks from video files.",
    icon: "Music",
    category: "media",
    routeKey: "audio-extractor",
  },
];

export function getToolsByCategory(category: ToolCategory): ToolDef[] {
  return tools.filter((t) => t.category === category);
}

export function getToolById(id: string): ToolDef | undefined {
  return tools.find((t) => t.id === id);
}
