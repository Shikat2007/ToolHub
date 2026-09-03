export interface ToolDef {
  id: string;
  name: string;
  description: string;
  icon: string; // Lucide icon name
  category: ToolCategory;
  /**
   * Route key matching the lazy-loaded component in Dashboard.
   * When adding a new tool, add a case in Dashboard's tool renderer.
   */
  routeKey?: string;
  comingSoon?: boolean;
}

export type ToolCategory = "pdf" | "media" | "future";

export interface CategoryDef {
  id: ToolCategory;
  label: string;
  icon: string;
}

export const categories: CategoryDef[] = [
  { id: "pdf", label: "PDF Tools", icon: "FileText" },
  { id: "media", label: "Media Downloaders", icon: "Download" },
  { id: "future", label: "Future Tools", icon: "Sparkles" },
];

export const tools: ToolDef[] = [
  // ── PDF Tools ──────────────────────────────────────────────
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
    comingSoon: true,
  },
  {
    id: "compress-pdf",
    name: "Compress PDF",
    description: "Reduce PDF file size while maintaining quality.",
    icon: "Minimize2",
    category: "pdf",
    comingSoon: true,
  },
  {
    id: "pdf-to-image",
    name: "PDF to Image",
    description: "Convert PDF pages to PNG or JPEG images.",
    icon: "Image",
    category: "pdf",
    comingSoon: true,
  },

  // ── Media Downloaders ──────────────────────────────────────
  {
    id: "fb-downloader",
    name: "Facebook Downloader",
    description: "Download Facebook videos in SD or HD quality.",
    icon: "Facebook",
    category: "media",
    comingSoon: true,
  },
  {
    id: "video-downloader",
    name: "Universal Downloader",
    description:
      "Download videos from YouTube, Instagram, TikTok and more.",
    icon: "Globe",
    category: "media",
    comingSoon: true,
  },

  // ── Future ─────────────────────────────────────────────────
  {
    id: "ai-tools",
    name: "AI Assistant",
    description: "AI-powered tools for text generation and analysis.",
    icon: "Brain",
    category: "future",
    comingSoon: true,
  },
  {
    id: "more-tools",
    name: "More Tools",
    description: "New tools are on the way. Stay tuned!",
    icon: "Rocket",
    category: "future",
    comingSoon: true,
  },
];

export function getToolsByCategory(category: ToolCategory): ToolDef[] {
  return tools.filter((t) => t.category === category);
}

export function getToolById(id: string): ToolDef | undefined {
  return tools.find((t) => t.id === id);
}
