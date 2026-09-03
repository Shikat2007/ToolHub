import { lazy, Suspense, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Combine,
  Scissors,
  Minimize2,
  Image,
  Download,
  Facebook,
  Globe,
  Brain,
  Rocket,
  Sparkles,
  Menu,
  X,
  LogOut,
  Search,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import {
  categories,
  getToolsByCategory,
  type ToolDef,
  type ToolCategory,
} from "@/lib/tool-registry";
import { Input } from "@/components/ui/input";

const MergePdf = lazy(() => import("@/components/tools/MergePdf"));

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  FileText,
  Combine,
  Scissors,
  Minimize2,
  Image,
  Download,
  Facebook,
  Globe,
  Brain,
  Rocket,
  Sparkles,
};

function ToolIcon({ name, className }: { name: string; className?: string }) {
  const Icon = iconMap[name] || FileText;
  return <Icon className={className} />;
}

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTool, setActiveTool] = useState<ToolDef | null>(null);
  const [activeCategory, setActiveCategory] = useState<ToolCategory | "all">(
    "all",
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const openTool = (tool: ToolDef) => {
    if (tool.comingSoon) return;
    setActiveTool(tool);
    setSidebarOpen(false);
  };

  const goBack = () => setActiveTool(null);

  const filteredTools = getToolsByCategory(
    activeCategory === "all" ? "pdf" : activeCategory,
  ).filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const allFilteredTools = searchQuery
    ? categories
        .flatMap((c) => getToolsByCategory(c.id))
        .filter(
          (t) =>
            t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.description.toLowerCase().includes(searchQuery.toLowerCase()),
        )
    : null;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border/60 bg-card transition-transform duration-200 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="flex h-16 items-center gap-2.5 border-b border-border/60 px-5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
            <Sparkles className="size-4 text-primary-foreground" />
          </div>
          <span className="text-base font-bold tracking-tight">ToolHub</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(false)}
            className="ml-auto size-8 lg:hidden cursor-pointer"
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Nav */}
        <ScrollArea className="flex-1 px-3 py-4">
          <div className="space-y-6">
            {/* All tools */}
            <button
              onClick={() => {
                setActiveTool(null);
                setActiveCategory("all");
                setSearchQuery("");
              }}
              className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors cursor-pointer ${
                !activeTool && activeCategory === "all"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <Search className="size-4" />
              All Tools
            </button>

            {/* Categories */}
            {categories.map((cat) => {
              const catTools = getToolsByCategory(cat.id);
              return (
                <div key={cat.id}>
                  <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                    {cat.label}
                  </p>
                  <div className="space-y-0.5">
                    {catTools.map((tool) => (
                      <button
                        key={tool.id}
                        onClick={() => openTool(tool)}
                        disabled={tool.comingSoon}
                        className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors cursor-pointer ${
                          activeTool?.id === tool.id
                            ? "bg-primary/10 font-medium text-primary"
                            : tool.comingSoon
                              ? "cursor-default text-muted-foreground/50"
                              : "text-muted-foreground hover:bg-accent hover:text-foreground"
                        }`}
                      >
                        <ToolIcon name={tool.icon} className="size-4 shrink-0" />
                        <span className="truncate">{tool.name}</span>
                        {tool.comingSoon && (
                          <Badge
                            variant="secondary"
                            className="ml-auto shrink-0 text-[10px]"
                          >
                            Soon
                          </Badge>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        {/* User */}
        <div className="border-t border-border/60 p-3">
          <div className="flex items-center gap-2.5 rounded-lg px-3 py-2">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {user?.name || "User"}
              </p>
              <p className="truncate text-[11px] text-muted-foreground">
                {user?.email || ""}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              className="size-8 shrink-0 cursor-pointer text-muted-foreground hover:text-foreground"
            >
              <LogOut className="size-3.5" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border/60 px-4 lg:px-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="size-9 lg:hidden cursor-pointer"
          >
            <Menu className="size-5" />
          </Button>

          {activeTool ? (
            <div className="flex items-center gap-2 text-sm">
              <button
                onClick={goBack}
                className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                Tools
              </button>
              <ChevronRight className="size-3.5 text-muted-foreground/50" />
              <span className="font-medium">{activeTool.name}</span>
            </div>
          ) : (
            <>
              <div className="relative max-w-sm flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/50" />
                <Input
                  placeholder="Search tools..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 pl-9 text-sm"
                />
              </div>
              <div className="hidden items-center gap-1.5 sm:flex">
                {(["all", "pdf", "media", "future"] as const).map((cat) => (
                  <Button
                    key={cat}
                    variant={activeCategory === cat ? "default" : "ghost"}
                    size="sm"
                    onClick={() => {
                      setActiveCategory(cat);
                      setSearchQuery("");
                    }}
                    className="cursor-pointer text-xs"
                  >
                    {cat === "all"
                      ? "All"
                      : categories.find((c) => c.id === cat)?.label}
                  </Button>
                ))}
              </div>
            </>
          )}
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {activeTool ? (
              <motion.div
                key={activeTool.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="h-full"
              >
                <Suspense
                  fallback={
                    <div className="flex h-full items-center justify-center">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        Loading tool...
                      </div>
                    </div>
                  }
                >
                  {activeTool.id === "merge-pdf" && (
                    <MergePdf onBack={goBack} />
                  )}
                </Suspense>
              </motion.div>
            ) : (
              <motion.div
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="p-6 lg:p-8"
              >
                {searchQuery && allFilteredTools ? (
                  <>
                    <h2 className="mb-1 text-lg font-semibold tracking-tight">
                      Search results
                    </h2>
                    <p className="mb-5 text-sm text-muted-foreground">
                      {allFilteredTools.length} tool
                      {allFilteredTools.length !== 1 ? "s" : ""} found
                    </p>
                    <ToolGrid
                      tools={allFilteredTools}
                      onOpenTool={openTool}
                    />
                  </>
                ) : (
                  categories.map((cat) => {
                    const catTools = getToolsByCategory(cat.id);
                    return (
                      <div key={cat.id} className="mb-8 last:mb-0">
                        <div className="mb-4 flex items-center gap-2.5">
                          <ToolIcon
                            name={cat.icon}
                            className="size-5 text-muted-foreground"
                          />
                          <h2 className="text-lg font-semibold tracking-tight">
                            {cat.label}
                          </h2>
                          {cat.id === "future" && (
                            <Badge
                              variant="secondary"
                              className="text-[10px]"
                            >
                              Coming soon
                            </Badge>
                          )}
                        </div>
                        <ToolGrid
                          tools={catTools}
                          onOpenTool={openTool}
                        />
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

/* ── Tool card grid ────────────────────────────────────────── */

function ToolGrid({
  tools,
  onOpenTool,
}: {
  tools: ToolDef[];
  onOpenTool: (tool: ToolDef) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {tools.map((tool) => (
        <motion.div
          key={tool.id}
          whileHover={{ y: -2 }}
          transition={{ duration: 0.15 }}
        >
          <Card
            onClick={() => onOpenTool(tool)}
            className={`group border-border/60 shadow-none transition-all duration-150 ${
              tool.comingSoon
                ? "cursor-default opacity-60"
                : "cursor-pointer hover:border-primary/30 hover:shadow-md"
            }`}
          >
            <CardContent className="flex items-start gap-3 p-4">
              <div
                className={`flex size-10 shrink-0 items-center justify-center rounded-xl transition-colors duration-150 ${
                  tool.comingSoon
                    ? "bg-muted text-muted-foreground"
                    : "bg-primary/8 text-primary group-hover:bg-primary/15"
                }`}
              >
                <ToolIcon name={tool.icon} className="size-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold">{tool.name}</h3>
                  {tool.comingSoon && (
                    <Badge
                      variant="secondary"
                      className="text-[10px]"
                    >
                      Soon
                    </Badge>
                  )}
                </div>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                  {tool.description}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
