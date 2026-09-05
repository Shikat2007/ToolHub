import { lazy, Suspense, useCallback, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, Combine, Scissors, Minimize2, Image, Download, Globe, Wrench,
  Search, ChevronRight, LayoutGrid, ScanLine, ScanText, Shrink,
  Crop, ArrowRightLeft, Hash, CaseSensitive, QrCode, KeyRound, Music,
  Calculator, Code, FilePlus, Monitor, Cake, Percent, Scale, HeartPulse,
  Braces, Binary, FileCode, Fingerprint, GitCompare, AlignLeft,
  Star, Clock, Shield, Network, Link, ShieldCheck, Gauge, ArrowLeft, Sun, Moon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { categories, getToolsByCategory, tools as allTools, type ToolDef, type ToolCategory } from "@/lib/tool-registry";
import { useFavorites } from "@/hooks/use-favorites";
import { useRecent } from "@/hooks/use-recent";
import { SearchDialog, useSearchShortcut } from "@/components/SearchDialog";

// ── Lazy tool components ─────────────────────────────────────
const MergePdf = lazy(() => import("@/components/tools/MergePdf"));
const SplitPdf = lazy(() => import("@/components/tools/SplitPdf"));
const CompressPdf = lazy(() => import("@/components/tools/CompressPdf"));
const PdfToImage = lazy(() => import("@/components/tools/PdfToImage"));
const DocumentScanner = lazy(() => import("@/components/tools/DocumentScanner"));
const OCR = lazy(() => import("@/components/tools/OCR"));
const ImageCompressor = lazy(() => import("@/components/tools/ImageCompressor"));
const ImageResizer = lazy(() => import("@/components/tools/ImageResizer"));
const ImageFormatConverter = lazy(() => import("@/components/tools/ImageFormatConverter"));
const TextCounter = lazy(() => import("@/components/tools/TextCounter"));
const TextCase = lazy(() => import("@/components/tools/TextCase"));
const QRCodeTool = lazy(() => import("@/components/tools/QRCode"));
const PasswordGenerator = lazy(() => import("@/components/tools/PasswordGenerator"));
const MediaDownloader = lazy(() => import("@/components/tools/MediaDownloader"));
const AudioExtractor = lazy(() => import("@/components/tools/AudioExtractor"));
const AgeCalculator = lazy(() => import("@/components/tools/AgeCalculator"));
const PercentCalculator = lazy(() => import("@/components/tools/PercentCalculator"));
const UnitConverter = lazy(() => import("@/components/tools/UnitConverter"));
const BMICalculator = lazy(() => import("@/components/tools/BMICalculator"));
const JsonFormatter = lazy(() => import("@/components/tools/JsonFormatter"));
const Base64Tool = lazy(() => import("@/components/tools/Base64Tool"));
const MarkdownPreview = lazy(() => import("@/components/tools/MarkdownPreview"));
const HashGenerator = lazy(() => import("@/components/tools/HashGenerator"));
const TextDiff = lazy(() => import("@/components/tools/TextDiff"));
const LoremIpsum = lazy(() => import("@/components/tools/LoremIpsum"));
const DeviceInfo = lazy(() => import("@/components/tools/DeviceInfo"));
const MacLookup = lazy(() => import("@/components/tools/MacLookup"));
const SubnetCalculator = lazy(() => import("@/components/tools/SubnetCalculator"));
const UuidGenerator = lazy(() => import("@/components/tools/UuidGenerator"));
const UrlEncoder = lazy(() => import("@/components/tools/UrlEncoder"));
const PasswordStrength = lazy(() => import("@/components/tools/PasswordStrength"));
const SpeedTest = lazy(() => import("@/components/tools/SpeedTest"));

const toolComponents: Record<string, React.ComponentType<{ onBack: () => void }>> = {
  "merge-pdf": MergePdf, "split-pdf": SplitPdf, "compress-pdf": CompressPdf,
  "pdf-to-image": PdfToImage, "doc-scanner": DocumentScanner, "ocr": OCR,
  "image-compress": ImageCompressor, "image-resize": ImageResizer, "image-convert": ImageFormatConverter,
  "text-counter": TextCounter, "text-case": TextCase, "qr-code": QRCodeTool,
  "password-gen": PasswordGenerator, "video-downloader": MediaDownloader, "audio-extractor": AudioExtractor,
  "age-calc": AgeCalculator, "percent-calc": PercentCalculator, "unit-converter": UnitConverter,
  "bmi-calc": BMICalculator, "json-formatter": JsonFormatter, "base64-tool": Base64Tool,
  "markdown-preview": MarkdownPreview, "hash-generator": HashGenerator, "text-diff": TextDiff,
  "lorem-ipsum": LoremIpsum, "device-info": DeviceInfo, "mac-lookup": MacLookup,
  "subnet-calc": SubnetCalculator, "uuid-gen": UuidGenerator, "url-encoder": UrlEncoder,
  "password-strength": PasswordStrength, "speed-test": SpeedTest,
};

// ── Icons ────────────────────────────────────────────────────
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  FileText, Combine, Scissors, Minimize2, Image, Download, Globe, Wrench,
  ScanLine, ScanText, Shrink, Crop, ArrowRightLeft, Hash, CaseSensitive,
  QrCode, KeyRound, Music, Calculator, Code, FilePlus, Monitor, Cake,
  Percent, Scale, HeartPulse, Braces, Binary, FileCode, Fingerprint,
  GitCompare, AlignLeft, Shield, Network, Link, ShieldCheck, Gauge,
};

function ToolIcon({ name, className }: { name: string; className?: string }) {
  const Icon = iconMap[name] || FileText;
  return <Icon className={className} />;
}

// Restrained per-category accent tints for the portal cards.
const categoryTint: Record<ToolCategory, { bg: string; fg: string }> = {
  pdf: { bg: "bg-blue-500/10", fg: "text-blue-600 dark:text-blue-400" },
  scan: { bg: "bg-emerald-500/10", fg: "text-emerald-600 dark:text-emerald-400" },
  image: { bg: "bg-violet-500/10", fg: "text-violet-600 dark:text-violet-400" },
  text: { bg: "bg-amber-500/10", fg: "text-amber-600 dark:text-amber-400" },
  utility: { bg: "bg-teal-500/10", fg: "text-teal-600 dark:text-teal-400" },
  media: { bg: "bg-rose-500/10", fg: "text-rose-600 dark:text-rose-400" },
  calculator: { bg: "bg-orange-500/10", fg: "text-orange-600 dark:text-orange-400" },
  developer: { bg: "bg-cyan-500/10", fg: "text-cyan-600 dark:text-cyan-400" },
  creator: { bg: "bg-pink-500/10", fg: "text-pink-600 dark:text-pink-400" },
  network: { bg: "bg-indigo-500/10", fg: "text-indigo-600 dark:text-indigo-400" },
};

type View = { kind: "home" } | { kind: "category"; cat: ToolCategory } | { kind: "tool"; id: string };

export default function Dashboard() {
  const [view, setView] = useState<View>({ kind: "home" });
  const [searchOpen, setSearchOpen] = useState(false);
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const { recent, trackUsage } = useRecent();
  const { theme, toggleTheme } = useTheme();

  useSearchShortcut(() => setSearchOpen(true));

  const openTool = useCallback((tool: ToolDef) => {
    if (tool.comingSoon) return;
    setView({ kind: "tool", id: tool.id });
    trackUsage(tool.id);
  }, [trackUsage]);

  const handleSearchSelect = useCallback((tool: ToolDef) => {
    openTool(tool);
  }, [openTool]);

  const goBack = useCallback(() => {
    setView((v) => {
      if (v.kind === "tool") {
        const tool = getTool(v.id);
        return tool ? { kind: "category", cat: tool.category } : { kind: "home" };
      }
      return { kind: "home" };
    });
  }, []);

  const activeTool = view.kind === "tool" ? getTool(view.id) : undefined;
  const activeCategory = view.kind === "category" ? view.cat : activeTool?.category;
  const activeCatDef = categories.find((c) => c.id === activeCategory);

  const favoriteTools = useMemo(() =>
    favorites.map((id) => allTools.find((t) => t.id === id)).filter(Boolean) as ToolDef[],
    [favorites]);

  const recentTools = useMemo(() =>
    recent.map((id) => allTools.find((t) => t.id === id)).filter(Boolean) as ToolDef[],
    [recent]);

  const ToolComponent = activeTool ? toolComponents[activeTool.id] : null;
  const viewKey = view.kind === "tool" ? `tool-${view.id}` : view.kind === "category" ? `cat-${view.cat}` : "home";

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background transition-colors duration-300">
      <SearchDialog isOpen={searchOpen} onClose={() => setSearchOpen(false)} onSelect={handleSearchSelect} />

      {/* ── Header ─────────────────────────────────────────── */}
      <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border/60 bg-card/50 px-4 backdrop-blur-md lg:px-6">
        <button onClick={() => setView({ kind: "home" })} className="flex shrink-0 items-center gap-2.5 cursor-pointer">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm shadow-primary/20">
            <Wrench className="size-4" />
          </div>
          <span className="text-base font-bold tracking-tight">Tool Hub</span>
        </button>

        <SeparatorDot />

        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="hidden min-w-0 items-center gap-1.5 text-sm sm:flex">
          <button onClick={() => setView({ kind: "home" })}
            className={`shrink-0 transition-colors cursor-pointer ${view.kind === "home" ? "font-medium text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            Home
          </button>
          {activeCatDef && (
            <>
              <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/50" />
              {view.kind === "tool" ? (
                <button onClick={() => setView({ kind: "category", cat: activeCatDef.id })}
                  className="shrink-0 text-muted-foreground transition-colors hover:text-foreground cursor-pointer">
                  {activeCatDef.label}
                </button>
              ) : (
                <span className="shrink-0 font-medium text-foreground">{activeCatDef.label}</span>
              )}
            </>
          )}
          {activeTool && (
            <>
              <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/50" />
              <span className="truncate font-medium text-foreground">{activeTool.name}</span>
            </>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <span className="hidden text-xs text-muted-foreground md:inline">{allTools.length} tools</span>
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme"
            className="size-9 cursor-pointer text-muted-foreground hover:text-foreground">
            {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setSearchOpen(true)}
            className="cursor-pointer gap-2 text-muted-foreground">
            <Search className="size-3.5" />
            <span className="hidden sm:inline">Search</span>
            <kbd className="hidden rounded border border-border/60 bg-muted px-1 text-[10px] lg:inline">Ctrl K</kbd>
          </Button>
        </div>
      </header>

      {/* ── Content ────────────────────────────────────────── */}
      <div className="relative flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div key={viewKey}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: "easeOut" }} className="min-h-full">

            {view.kind === "tool" && activeTool && ToolComponent ? (
              <div className="h-full pb-24">
                <Suspense fallback={<ToolFallback />}>
                  <ToolComponent onBack={goBack} />
                </Suspense>
              </div>
            ) : view.kind === "category" && activeCategory ? (
              <CategoryView cat={activeCategory} onOpenTool={openTool}
                isFavorite={isFavorite} onToggleFavorite={toggleFavorite} />
            ) : (
              <HomeView onOpenCategory={(cat) => setView({ kind: "category", cat })}
                favoriteTools={favoriteTools} recentTools={recentTools}
                onOpenTool={openTool} isFavorite={isFavorite} onToggleFavorite={toggleFavorite} />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Floating back navigation */}
        <AnimatePresence>
          {view.kind !== "home" && (
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 8 }} transition={{ duration: 0.15 }}
              className="fixed bottom-6 right-6 z-40">
              <Button onClick={goBack} size="lg"
                className="cursor-pointer gap-2 rounded-full px-5 shadow-xl shadow-primary/20">
                <ArrowLeft className="size-4" />
                {view.kind === "tool" ? "Back to tools" : "Back to home"}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function SeparatorDot() {
  return <div className="hidden h-4 w-px shrink-0 bg-border sm:block" />;
}

function getTool(id: string): ToolDef | undefined {
  return allTools.find((t) => t.id === id);
}

function ToolFallback() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="skeleton size-9 rounded-full" />
        <div className="skeleton h-3 w-24" />
      </div>
    </div>
  );
}

// ── Home: category portals ───────────────────────────────────
function HomeView({ onOpenCategory, favoriteTools, recentTools, onOpenTool, isFavorite, onToggleFavorite }: {
  onOpenCategory: (cat: ToolCategory) => void;
  favoriteTools: ToolDef[];
  recentTools: ToolDef[];
  onOpenTool: (t: ToolDef) => void;
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (id: string) => void;
}) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8 lg:py-10">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">Tool categories</h1>
        <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">
          Pick a category to browse its tools. Everything runs locally in your browser —
          files never leave your machine.
        </p>
      </motion.div>

      {recentTools.length > 0 && (
        <RecentChips tools={recentTools} onOpenTool={onOpenTool} />
      )}
      {favoriteTools.length > 0 && (
        <FavoriteChips tools={favoriteTools} onOpenTool={onOpenTool} />
      )}

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat, i) => {
          const catTools = getToolsByCategory(cat.id);
          const tint = categoryTint[cat.id];
          return (
            <motion.button key={cat.id} onClick={() => onOpenCategory(cat.id)}
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, delay: 0.04 + i * 0.035 }}
              whileHover={{ y: -3 }} whileTap={{ scale: 0.985 }}
              className="group cursor-pointer rounded-2xl border border-border/60 bg-card p-5 text-left shadow-sm transition-colors hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
              <div className="flex items-start justify-between">
                <div className={`flex size-11 items-center justify-center rounded-xl ${tint.bg} transition-transform duration-200 group-hover:scale-105`}>
                  <ToolIcon name={cat.icon} className={`size-5 ${tint.fg}`} />
                </div>
                <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                  {catTools.length} tool{catTools.length !== 1 ? "s" : ""}
                </span>
              </div>
              <h2 className="mt-4 text-[15px] font-semibold tracking-tight">{cat.label}</h2>
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{cat.description}</p>
              <div className="mt-3 flex flex-wrap gap-1">
                {catTools.slice(0, 4).map((t) => (
                  <span key={t.id} className="rounded-md bg-muted/70 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                    {t.name}
                  </span>
                ))}
                {catTools.length > 4 && (
                  <span className="rounded-md px-1 py-0.5 text-[10px] font-medium text-primary">
                    +{catTools.length - 4} more
                  </span>
                )}
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                Browse category <ChevronRight className="size-3.5" />
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function RecentChips({ tools, onOpenTool }: { tools: ToolDef[]; onOpenTool: (t: ToolDef) => void }) {
  return (
    <div className="mt-8">
      <div className="mb-2.5 flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <Clock className="size-3.5" /> Recently used
      </div>
      <div className="flex flex-wrap gap-2">
        {tools.map((tool) => (
          <button key={tool.id} onClick={() => onOpenTool(tool)}
            className="flex cursor-pointer items-center gap-1.5 rounded-full border border-border/60 bg-card px-3 py-1.5 text-xs font-medium shadow-sm transition-colors hover:border-primary/30 hover:text-primary">
            <ToolIcon name={tool.icon} className="size-3.5 text-primary" />
            {tool.name}
          </button>
        ))}
      </div>
    </div>
  );
}

function FavoriteChips({ tools, onOpenTool }: { tools: ToolDef[]; onOpenTool: (t: ToolDef) => void }) {
  return (
    <div className="mt-5">
      <div className="mb-2.5 flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <Star className="size-3.5 text-amber-500" /> Favorites
      </div>
      <div className="flex flex-wrap gap-2">
        {tools.map((tool) => (
          <button key={tool.id} onClick={() => onOpenTool(tool)}
            className="flex cursor-pointer items-center gap-1.5 rounded-full border border-border/60 bg-card px-3 py-1.5 text-xs font-medium shadow-sm transition-colors hover:border-primary/30 hover:text-primary">
            <ToolIcon name={tool.icon} className="size-3.5 text-primary" />
            {tool.name}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Category view: tools of one sector ───────────────────────
function CategoryView({ cat, onOpenTool, isFavorite, onToggleFavorite }: {
  cat: ToolCategory;
  onOpenTool: (t: ToolDef) => void;
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (id: string) => void;
}) {
  const catDef = categories.find((c) => c.id === cat)!;
  const catTools = getToolsByCategory(cat);
  const tint = categoryTint[cat];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8 lg:py-10">
      <div className="flex items-center gap-4">
        <div className={`flex size-12 items-center justify-center rounded-2xl ${tint.bg}`}>
          <ToolIcon name={catDef.icon} className={`size-6 ${tint.fg}`} />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight lg:text-2xl">{catDef.label}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">{catDef.description}</p>
        </div>
        <Badge variant="secondary" className="ml-auto hidden shrink-0 sm:inline-flex">
          {catTools.length} tool{catTools.length !== 1 ? "s" : ""}
        </Badge>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {catTools.map((tool, i) => (
          <motion.div key={tool.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.03 }}>
            <ToolCard tool={tool} onOpen={onOpenTool} isFavorite={isFavorite(tool.id)} onToggleFavorite={onToggleFavorite} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ── Tool card with favorite star ─────────────────────────────
function ToolCard({ tool, onOpen, isFavorite, onToggleFavorite }: {
  tool: ToolDef; onOpen: (t: ToolDef) => void; isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}) {
  return (
    <Card onClick={() => onOpen(tool)}
      className="group relative cursor-pointer border-border/60 shadow-sm transition-all duration-200 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
      <button
        onClick={(e) => { e.stopPropagation(); onToggleFavorite(tool.id); }}
        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        className="absolute right-3 top-3 z-10 cursor-pointer rounded-lg p-1 transition-colors hover:bg-accent"
      >
        <Star className={`size-3.5 transition-colors ${isFavorite ? "fill-amber-500 text-amber-500" : "text-muted-foreground/30 hover:text-amber-500"}`} />
      </button>
      <CardContent className="flex items-start gap-3 p-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-200 group-hover:scale-105">
          <ToolIcon name={tool.icon} className="size-5" />
        </div>
        <div className="min-w-0 pr-4">
          <h3 className="text-sm font-semibold">{tool.name}</h3>
          <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{tool.description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
