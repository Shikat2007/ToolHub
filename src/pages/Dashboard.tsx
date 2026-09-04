import { lazy, Suspense, useCallback, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, Combine, Scissors, Minimize2, Image, Download, Globe, Wrench,
  Menu, X, Search, ChevronRight, LayoutGrid, ScanLine, ScanText, Shrink,
  Crop, ArrowRightLeft, Hash, CaseSensitive, QrCode, KeyRound, Music,
  Calculator, Code, FilePlus, Monitor, Cake, Percent, Scale, HeartPulse,
  Braces, Binary, FileCode, Fingerprint, GitCompare, AlignLeft,
  Star, Clock, Shield, Network, Link, ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router";
import { categories, getToolsByCategory, tools as allTools, type ToolDef, type ToolCategory } from "@/lib/tool-registry";
import { Input } from "@/components/ui/input";
import { useFavorites } from "@/hooks/use-favorites";
import { useRecent } from "@/hooks/use-recent";
import { useTheme } from "@/hooks/use-theme";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SearchDialog, useSearchShortcut } from "@/components/SearchDialog";

// ── Lazy tools ───────────────────────────────────────────────
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

// ── Icons ────────────────────────────────────────────────────
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  FileText, Combine, Scissors, Minimize2, Image, Download, Globe, Wrench,
  ScanLine, ScanText, Shrink, Crop, ArrowRightLeft, Hash, CaseSensitive,
  QrCode, KeyRound, Music, Calculator, Code, FilePlus, Monitor, Cake,
  Percent, Scale, HeartPulse, Braces, Binary, FileCode, Fingerprint,
  GitCompare, AlignLeft, Shield, Network, Link, ShieldCheck,
};

function ToolIcon({ name, className }: { name: string; className?: string }) {
  const Icon = iconMap[name] || FileText;
  return <Icon className={className} />;
}

const ALL_CATEGORIES: ToolCategory[] = ["pdf", "scan", "image", "text", "utility", "media", "calculator", "developer", "creator", "network"];

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
  "password-strength": PasswordStrength,
};

// ── Tool count per category ──────────────────────────────────
function categoryCount(catId: ToolCategory): number {
  return allTools.filter((t) => t.category === catId).length;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const { recent, trackUsage } = useRecent();
  const { theme, toggleTheme } = useTheme();
  const [activeTool, setActiveTool] = useState<ToolDef | null>(null);
  const [activeCategory, setActiveCategory] = useState<ToolCategory | "all">("all");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  useSearchShortcut(() => setSearchOpen(true));

  const openTool = useCallback((tool: ToolDef) => {
    if (tool.comingSoon) return;
    setActiveTool(tool);
    trackUsage(tool.id);
    setSidebarOpen(false);
  }, [trackUsage]);

  const goBack = useCallback(() => setActiveTool(null), []);

  const handleSearchSelect = useCallback((tool: ToolDef) => {
    setActiveTool(tool);
    trackUsage(tool.id);
  }, [trackUsage]);

  const allFilteredTools = useMemo(() => {
    if (!searchQuery) return null;
    const q = searchQuery.toLowerCase();
    return categories.flatMap((c) => getToolsByCategory(c.id)).filter(
      (t) => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.category.includes(q));
  }, [searchQuery]);

  const favoriteTools = useMemo(() =>
    favorites.map((id) => allTools.find((t) => t.id === id)).filter(Boolean) as ToolDef[],
    [favorites]);

  const recentTools = useMemo(() =>
    recent.map((id) => allTools.find((t) => t.id === id)).filter(Boolean) as ToolDef[],
    [recent]);

  const ToolComponent = activeTool ? toolComponents[activeTool.id] : null;
  const activeCatLabel = categories.find((c) => c.id === activeTool?.category)?.label;

  return (
    <div className="flex h-screen overflow-hidden bg-background transition-colors duration-300">
      <SearchDialog isOpen={searchOpen} onClose={() => setSearchOpen(false)} onSelect={handleSearchSelect} />

      <AnimatePresence>
        {sidebarOpen && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden" />}
      </AnimatePresence>

      {/* ── Sidebar ────────────────────────────────────────── */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border/60 bg-sidebar/95 backdrop-blur-xl transition-transform duration-200 lg:static lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-16 items-center gap-2.5 border-b border-border/60 px-5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm shadow-primary/20"><Wrench className="size-4" /></div>
          <span className="text-base font-bold tracking-tight">Tool Hub</span>
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)} className="ml-auto size-8 lg:hidden cursor-pointer"><X className="size-4" /></Button>
        </div>

        <ScrollArea className="flex-1 px-3 py-4">
          <div className="space-y-6">
            <button onClick={() => { setActiveTool(null); setActiveCategory("all"); setSearchQuery(""); }}
              className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-all cursor-pointer ${!activeTool && activeCategory === "all" ? "bg-primary/10 text-primary shadow-sm" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}>
              <LayoutGrid className="size-4" /> All Tools
            </button>

            {categories.map((cat) => {
              const catTools = getToolsByCategory(cat.id);
              const count = categoryCount(cat.id);
              return (
                <div key={cat.id}>
                  <div className="mb-1.5 flex items-center justify-between px-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">{cat.label}</p>
                    <span className="rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground">{count}</span>
                  </div>
                  <div className="space-y-0.5">
                    {catTools.map((tool) => (
                      <button key={tool.id} onClick={() => openTool(tool)} disabled={tool.comingSoon}
                        className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-all cursor-pointer ${activeTool?.id === tool.id ? "bg-primary/10 font-medium text-primary shadow-sm" : tool.comingSoon ? "cursor-default text-muted-foreground/40" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}>
                        <ToolIcon name={tool.icon} className="size-4 shrink-0" />
                        <span className="truncate">{tool.name}</span>
                        {tool.comingSoon && <Badge variant="secondary" className="ml-auto shrink-0 text-[10px]">Soon</Badge>}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </aside>

      {/* ── Main ───────────────────────────────────────────── */}
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border/60 px-4 lg:px-6 bg-card/50 backdrop-blur-md">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)} className="size-9 lg:hidden cursor-pointer"><Menu className="size-5" /></Button>

          {activeTool ? (
            <div className="flex items-center gap-2 text-sm min-w-0">
              <button onClick={goBack} className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0">Tools</button>
              <ChevronRight className="size-3.5 text-muted-foreground/50 shrink-0" />
              {activeCatLabel && <><span className="text-muted-foreground/60 truncate max-w-[120px]">{activeCatLabel}</span><ChevronRight className="size-3.5 text-muted-foreground/50 shrink-0" /></>}
              <span className="font-medium truncate">{activeTool.name}</span>
            </div>
          ) : (
            <>
              <div className="relative max-w-sm flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/50" />
                <Input placeholder='Search tools… (Ctrl+K)' value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => !searchQuery && setSearchOpen(true)}
                  className="h-9 pl-9 pr-16 text-sm" />
                <kbd className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md border border-border/60 bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">⌘K</kbd>
              </div>
              <div className="hidden items-center gap-1 xl:flex">
                {(["all", ...ALL_CATEGORIES] as const).map((cat) => (
                  <Button key={cat} variant={activeCategory === cat ? "default" : "ghost"} size="sm"
                    onClick={() => { setActiveCategory(cat); setSearchQuery(""); }}
                    className="cursor-pointer text-[11px] px-2">
                    {cat === "all" ? "All" : categories.find((c) => c.id === cat)?.label}
                  </Button>
                ))}
              </div>
              <ThemeToggle />
            </>
          )}
        </header>

        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {activeTool ? (
              <motion.div key={activeTool.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="h-full">
                <Suspense fallback={<div className="flex h-full items-center justify-center"><div className="flex flex-col items-center gap-3"><div className="skeleton size-8 rounded-full" /><div className="skeleton h-3 w-24" /></div></div>}>
                  {ToolComponent && <ToolComponent onBack={goBack} />}
                </Suspense>
              </motion.div>
            ) : (
              <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="p-6 lg:p-8">

                {/* ── Welcome ──────────────────────────────── */}
                {!searchQuery && (
                  <div className="mb-8">
                    <h1 className="text-2xl font-bold tracking-tight">Welcome</h1>
                    <p className="mt-1 text-sm text-muted-foreground">{allTools.length} tools ready · {categories.length} categories</p>
                  </div>
                )}

                {/* ── Favorites ────────────────────────────── */}
                {!searchQuery && favoriteTools.length > 0 && (
                  <div className="mb-8">
                    <div className="mb-4 flex items-center gap-2.5">
                      <Star className="size-5 text-amber-500" />
                      <h2 className="text-lg font-semibold tracking-tight">Favorites</h2>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {favoriteTools.map((tool) => (
                        <ToolCard key={tool.id} tool={tool} onOpen={openTool} isFavorite={isFavorite(tool.id)} onToggleFavorite={toggleFavorite} />
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Recently Used ───────────────────────── */}
                {!searchQuery && recentTools.length > 0 && (
                  <div className="mb-8">
                    <div className="mb-4 flex items-center gap-2.5">
                      <Clock className="size-5 text-muted-foreground" />
                      <h2 className="text-lg font-semibold tracking-tight">Recently Used</h2>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {recentTools.map((tool) => (
                        <ToolCard key={tool.id} tool={tool} onOpen={openTool} isFavorite={isFavorite(tool.id)} onToggleFavorite={toggleFavorite} />
                      ))}
                    </div>
                  </div>
                )}

                {/* ── All Categories ──────────────────────── */}
                {searchQuery && allFilteredTools ? (
                  <>
                    <h2 className="mb-1 text-lg font-semibold tracking-tight">Search results</h2>
                    <p className="mb-5 text-sm text-muted-foreground">{allFilteredTools.length} tool{allFilteredTools.length !== 1 ? "s" : ""} found</p>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {allFilteredTools.map((tool) => (
                        <ToolCard key={tool.id} tool={tool} onOpen={openTool} isFavorite={isFavorite(tool.id)} onToggleFavorite={toggleFavorite} />
                      ))}
                    </div>
                  </>
                ) : (
                  categories.map((cat) => {
                    const catTools = getToolsByCategory(cat.id);
                    return (
                      <div key={cat.id} className="mb-8 last:mb-0">
                        <div className="mb-4 flex items-center gap-2.5">
                          <ToolIcon name={cat.icon} className="size-5 text-muted-foreground" />
                          <h2 className="text-lg font-semibold tracking-tight">{cat.label}</h2>
                          <Badge variant="secondary" className="text-[10px]">{categoryCount(cat.id)}</Badge>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                          {catTools.map((tool) => (
                            <ToolCard key={tool.id} tool={tool} onOpen={openTool} isFavorite={isFavorite(tool.id)} onToggleFavorite={toggleFavorite} />
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

// ── Tool Card with star ──────────────────────────────────────
function ToolCard({ tool, onOpen, isFavorite, onToggleFavorite }: {
  tool: ToolDef; onOpen: (t: ToolDef) => void; isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}) {
  return (
    <motion.div whileHover={{ y: -2, scale: 1.01 }} transition={{ duration: 0.15 }}>
      <Card onClick={() => onOpen(tool)}
        className={`group relative border-border/60 shadow-none transition-all duration-200 ${tool.comingSoon ? "cursor-default opacity-50" : "cursor-pointer hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"}`}>
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(tool.id); }}
          className="absolute top-3 right-3 z-10 cursor-pointer p-1 rounded-lg transition-colors hover:bg-accent"
        >
          <Star className={`size-3.5 transition-colors ${isFavorite ? "fill-amber-500 text-amber-500" : "text-muted-foreground/30 hover:text-amber-500"}`} />
        </button>
        <CardContent className="flex items-start gap-3 p-4">
          <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl transition-all duration-200 ${tool.comingSoon ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary group-hover:bg-primary/15 group-hover:shadow-sm group-hover:shadow-primary/10"}`}>
            <ToolIcon name={tool.icon} className="size-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold">{tool.name}</h3>
              {tool.comingSoon && <Badge variant="secondary" className="text-[10px]">Soon</Badge>}
            </div>
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground line-clamp-2">{tool.description}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
