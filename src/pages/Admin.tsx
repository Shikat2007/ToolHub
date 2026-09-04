import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Users,
  Wrench,
  Activity,
  TrendingUp,
  Shield,
  Mail,
  UserPlus,
  Settings,
  Clock,
  Combine,
  Scissors,
  Minimize2,
  Globe,
  Image,
  Facebook,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";

/* ── Tool icon map ─────────────────────────────────────────── */

const toolIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  "merge-pdf": Combine,
  "split-pdf": Scissors,
  "compress-pdf": Minimize2,
  "video-downloader": Globe,
  "pdf-to-image": Image,
  "fb-downloader": Facebook,
};

function ToolIcon({ toolId, className }: { toolId: string; className?: string }) {
  const Icon = toolIconMap[toolId] ?? Wrench;
  return <Icon className={className} />;
}

/* ── Admin page ────────────────────────────────────────────── */

export default function Admin() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"overview" | "team" | "tools">("overview");

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")} className="size-9 cursor-pointer">
              <ArrowLeft className="size-4" />
            </Button>
            <div className="flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Shield className="size-4" />
              </div>
              <div>
                <h1 className="text-sm font-semibold tracking-tight">Admin</h1>
                <p className="text-[11px] text-muted-foreground">Team management and analytics</p>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleSignOut} className="cursor-pointer text-muted-foreground">
            Sign out
          </Button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* Tabs */}
        <div className="mb-8 flex gap-1 rounded-xl bg-muted/50 p-1">
          {([
            { id: "overview", label: "Overview", icon: TrendingUp },
            { id: "team", label: "Team", icon: Users },
            { id: "tools", label: "Tools", icon: Wrench },
          ] as const).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="size-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
        >
          {activeTab === "overview" && <OverviewTab userName={user?.name} />}
          {activeTab === "team" && <TeamTab />}
          {activeTab === "tools" && <ToolsTab />}
        </motion.div>
      </div>
    </div>
  );
}

/* ── Overview ──────────────────────────────────────────────── */

function OverviewTab({ userName }: { userName?: string }) {
  const totalUses = useQuery(api.usage.totalUses);
  const weeklyTrend = useQuery(api.usage.weeklyTrend);
  const recentActivity = useQuery(api.usage.recentActivity);
  const activeMembers = useQuery(api.usage.activeTeamMembers);
  const toolUsage = useQuery(api.usage.toolUsageByTool);

  const stats = [
    {
      label: "Team members",
      value: activeMembers?.length ?? "...",
      icon: Users,
      color: "text-blue-400",
    },
    {
      label: "Active tools",
      value: toolUsage?.length ?? "...",
      icon: Wrench,
      color: "text-emerald-400",
    },
    {
      label: "Total uses",
      value: totalUses ?? "...",
      icon: Activity,
      color: "text-violet-400",
    },
    {
      label: "This week",
      value: weeklyTrend
        ? weeklyTrend.reduce((sum, d) => sum + d.count, 0)
        : "...",
      icon: TrendingUp,
      color: "text-amber-400",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-border/60 shadow-none">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex size-10 items-center justify-center rounded-xl bg-muted/50">
                <stat.icon className={`size-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Activity log */}
        <Card className="border-border/60 shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Clock className="size-4 text-muted-foreground" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!recentActivity ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="size-4 animate-spin text-muted-foreground" />
              </div>
            ) : recentActivity.length === 0 ? (
              <p className="py-8 text-center text-xs text-muted-foreground">No activity yet. Use a tool to get started.</p>
            ) : (
              <div className="space-y-3">
                {recentActivity.slice(0, 10).map((entry, i) => {
                  const timeAgo = formatTimeAgo(entry.createdAt);
                  return (
                    <div key={entry._id ?? i} className="flex items-center justify-between text-sm">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-foreground">
                          <span className="font-medium">{entry.userName}</span>
                          <span className="text-muted-foreground"> used {entry.toolName}</span>
                        </p>
                      </div>
                      <span className="ml-4 shrink-0 text-xs text-muted-foreground">{timeAgo}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Workspace info */}
        <Card className="border-border/60 shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Settings className="size-4 text-muted-foreground" />
              Workspace Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Workspace</span>
              <span className="font-medium">{userName ? `${userName}'s Team` : "Team Workspace"}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Plan</span>
              <Badge variant="secondary" className="text-xs">Internal</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Storage</span>
              <span className="font-medium">Client-side + Convex</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Backend</span>
              <span className="font-medium">Convex Actions</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Version</span>
              <span className="font-medium">2.0.0</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ── Team ──────────────────────────────────────────────────── */

function TeamTab() {
  const teamMembers = useQuery(api.usage.adminUserList);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight">Team Members</h2>
        <Button size="sm" className="cursor-pointer gap-1.5" disabled>
          <UserPlus className="size-3.5" />
          Invite Member
        </Button>
      </div>

      <Card className="border-border/60 shadow-none">
        <CardContent className="p-0">
          {!teamMembers ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            </div>
          ) : teamMembers.length === 0 ? (
            <p className="py-8 text-center text-xs text-muted-foreground">No team members yet.</p>
          ) : (
            <div className="divide-y divide-border/60">
              <div className="grid grid-cols-[1fr_1fr_auto_auto] gap-4 px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground/60">
                <span>Member</span>
                <span className="hidden sm:block">Email</span>
                <span>Tools Used</span>
                <span className="w-8" />
              </div>
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="grid grid-cols-[1fr_1fr_auto_auto] items-center gap-4 px-4 py-3 transition-colors hover:bg-accent/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-8 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{member.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {member.lastActive ? formatTimeAgo(member.lastActive) : "Never"}
                      </p>
                    </div>
                  </div>
                  <p className="hidden truncate text-sm text-muted-foreground sm:block">{member.email}</p>
                  <Badge variant="secondary" className="text-xs">
                    {member.toolsUsed} uses
                  </Badge>
                  <Button variant="ghost" size="icon" className="size-8 cursor-pointer" disabled>
                    <Mail className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* ── Tools ─────────────────────────────────────────────────── */

function ToolsTab() {
  const toolStats = useQuery(api.usage.toolUsageByTool);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight">Tool Usage</h2>
        <Badge variant="secondary" className="text-xs">V2</Badge>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { id: "merge-pdf", name: "Merge PDF", status: "active" as const },
          { id: "split-pdf", name: "Split PDF", status: "active" as const },
          { id: "compress-pdf", name: "Compress PDF", status: "active" as const },
          { id: "video-downloader", name: "Universal Downloader", status: "active" as const },
          { id: "pdf-to-image", name: "PDF to Image", status: "coming" as const },
          { id: "fb-downloader", name: "Facebook Downloader", status: "coming" as const },
        ].map((tool) => {
          const stat = toolStats?.find((s) => s.toolId === tool.id);
          return (
            <Card key={tool.id} className="border-border/60 shadow-none">
              <CardContent className="flex items-center gap-4 p-5">
                <div className={`flex size-12 items-center justify-center rounded-xl ${
                  tool.status === "active"
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}>
                  <ToolIcon toolId={tool.id} className="size-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold">{tool.name}</h3>
                    <Badge variant={tool.status === "active" ? "default" : "secondary"} className="text-[10px]">
                      {tool.status === "active" ? "Active" : "Coming soon"}
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {stat
                      ? `${stat.count} use${stat.count !== 1 ? "s" : ""}`
                      : tool.status === "active"
                        ? "No uses yet"
                        : "Not yet available"}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-border/60 bg-card/50">
        <CardContent className="flex items-center gap-3 p-4">
          <Mail className="size-4 shrink-0 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            New tools are added to the registry automatically. To request a specific tool, reach out to the team lead.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

/* ── Helpers ───────────────────────────────────────────────── */

function formatTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}
