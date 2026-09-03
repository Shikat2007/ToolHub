import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Users,
  Wrench,
  Activity,
  TrendingUp,
  Shield,
  Mail,
  MoreHorizontal,
  UserPlus,
  Settings,
  Clock,
  Combine,
  Scissors,
  Minimize2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";

/* ── Types ─────────────────────────────────────────────────── */

interface TeamMember {
  name: string;
  email: string;
  role: string;
  lastActive: string;
  toolsUsed: number;
}

interface ToolStat {
  icon: React.ComponentType<{ className?: string }>;
  name: string;
  uses: number;
  trend: string;
  status: "active" | "coming";
}

interface ActivityEntry {
  user: string;
  action: string;
  time: string;
  tool: string;
}

/* ── Mock data ─────────────────────────────────────────────── */

const teamMembers: TeamMember[] = [
  {
    name: "Alex Chen",
    email: "alex@team.io",
    role: "Admin",
    lastActive: "2 min ago",
    toolsUsed: 12,
  },
  {
    name: "Jordan Lee",
    email: "jordan@team.io",
    role: "Member",
    lastActive: "1 hour ago",
    toolsUsed: 8,
  },
  {
    name: "Sam Rivera",
    email: "sam@team.io",
    role: "Member",
    lastActive: "3 hours ago",
    toolsUsed: 15,
  },
  {
    name: "Taylor Kim",
    email: "taylor@team.io",
    role: "Member",
    lastActive: "Yesterday",
    toolsUsed: 5,
  },
  {
    name: "Morgan Patel",
    email: "morgan@team.io",
    role: "Member",
    lastActive: "2 days ago",
    toolsUsed: 3,
  },
];

const toolStats: ToolStat[] = [
  {
    icon: Combine,
    name: "Merge PDF",
    uses: 147,
    trend: "+23%",
    status: "active",
  },
  {
    icon: Scissors,
    name: "Split PDF",
    uses: 0,
    trend: "—",
    status: "coming",
  },
  {
    icon: Minimize2,
    name: "Compress PDF",
    uses: 0,
    trend: "—",
    status: "coming",
  },
];

const activityLog: ActivityEntry[] = [
  {
    user: "Sam Rivera",
    action: "Merged 4 PDF files",
    time: "2 min ago",
    tool: "Merge PDF",
  },
  {
    user: "Alex Chen",
    action: "Merged 2 PDF files",
    time: "18 min ago",
    tool: "Merge PDF",
  },
  {
    user: "Jordan Lee",
    action: "Merged 6 PDF files",
    time: "1 hour ago",
    tool: "Merge PDF",
  },
  {
    user: "Sam Rivera",
    action: "Merged 3 PDF files",
    time: "3 hours ago",
    tool: "Merge PDF",
  },
  {
    user: "Taylor Kim",
    action: "Merged 2 PDF files",
    time: "Yesterday",
    tool: "Merge PDF",
  },
  {
    user: "Alex Chen",
    action: "Signed in to Tool Hub",
    time: "Yesterday",
    tool: "Auth",
  },
];

/* ── Admin page ────────────────────────────────────────────── */

export default function Admin() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"overview" | "team" | "tools">(
    "overview",
  );

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
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
              className="size-9 cursor-pointer"
            >
              <ArrowLeft className="size-4" />
            </Button>
            <div className="flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Shield className="size-4" />
              </div>
              <div>
                <h1 className="text-sm font-semibold tracking-tight">Admin</h1>
                <p className="text-[11px] text-muted-foreground">
                  Team management and analytics
                </p>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="cursor-pointer text-muted-foreground"
          >
            Sign out
          </Button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* Tabs */}
        <div className="mb-8 flex gap-1 rounded-xl bg-muted/50 p-1">
          {(
            [
              { id: "overview", label: "Overview", icon: TrendingUp },
              { id: "team", label: "Team", icon: Users },
              { id: "tools", label: "Tools", icon: Wrench },
            ] as const
          ).map((tab) => (
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
          {activeTab === "overview" && (
            <OverviewTab
              userName={user?.name}
              teamMembers={teamMembers}
              toolStats={toolStats}
              activityLog={activityLog}
            />
          )}
          {activeTab === "team" && <TeamTab teamMembers={teamMembers} />}
          {activeTab === "tools" && <ToolsTab toolStats={toolStats} />}
        </motion.div>
      </div>
    </div>
  );
}

/* ── Overview ──────────────────────────────────────────────── */

function OverviewTab({
  userName,
  teamMembers,
  toolStats,
  activityLog,
}: {
  userName?: string;
  teamMembers: TeamMember[];
  toolStats: ToolStat[];
  activityLog: ActivityEntry[];
}) {
  const stats = [
    {
      label: "Team members",
      value: teamMembers.length,
      icon: Users,
      color: "text-blue-400",
    },
    {
      label: "Active tools",
      value: toolStats.filter((t) => t.status === "active").length,
      icon: Wrench,
      color: "text-emerald-400",
    },
    {
      label: "Total uses",
      value: toolStats.reduce((sum: number, t: ToolStat) => sum + t.uses, 0),
      icon: Activity,
      color: "text-violet-400",
    },
    {
      label: "This week",
      value: "+23%",
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
            <div className="space-y-3">
              {activityLog.map((entry: ActivityEntry, i: number) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-foreground">
                      <span className="font-medium">{entry.user}</span>
                      <span className="text-muted-foreground">
                        {" "}
                        {entry.action}
                      </span>
                    </p>
                  </div>
                  <span className="ml-4 shrink-0 text-xs text-muted-foreground">
                    {entry.time}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick info */}
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
              <span className="font-medium">
                {userName ? `${userName}'s Team` : "Team Workspace"}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Plan</span>
              <Badge variant="secondary" className="text-xs">
                Internal
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Storage</span>
              <span className="font-medium">Client-side only</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Backend</span>
              <span className="font-medium">None required</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Version</span>
              <span className="font-medium">1.0.0</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ── Team ──────────────────────────────────────────────────── */

function TeamTab({ teamMembers }: { teamMembers: TeamMember[] }) {
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
          <div className="divide-y divide-border/60">
            {/* Header */}
            <div className="grid grid-cols-[1fr_1fr_auto_auto] gap-4 px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground/60">
              <span>Member</span>
              <span className="hidden sm:block">Email</span>
              <span>Role</span>
              <span className="w-8" />
            </div>
            {/* Rows */}
            {teamMembers.map((member: TeamMember) => (
              <div
                key={member.email}
                className="grid grid-cols-[1fr_1fr_auto_auto] items-center gap-4 px-4 py-3 transition-colors hover:bg-accent/50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{member.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {member.lastActive}
                    </p>
                  </div>
                </div>
                <p className="hidden truncate text-sm text-muted-foreground sm:block">
                  {member.email}
                </p>
                <Badge
                  variant={member.role === "Admin" ? "default" : "secondary"}
                  className="text-xs"
                >
                  {member.role}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 cursor-pointer"
                  disabled
                >
                  <MoreHorizontal className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Invite management and role editing will be available when backend
        integration is complete.
      </p>
    </div>
  );
}

/* ── Tools ─────────────────────────────────────────────────── */

function ToolsTab({ toolStats }: { toolStats: ToolStat[] }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight">Tool Usage</h2>
        <Badge variant="secondary" className="text-xs">
          V1
        </Badge>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {toolStats.map((tool: ToolStat) => (
          <Card key={tool.name} className="border-border/60 shadow-none">
            <CardContent className="flex items-center gap-4 p-5">
              <div
                className={`flex size-12 items-center justify-center rounded-xl ${
                  tool.status === "active"
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <tool.icon className="size-6" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold">{tool.name}</h3>
                  <Badge
                    variant={tool.status === "active" ? "default" : "secondary"}
                    className="text-[10px]"
                  >
                    {tool.status === "active" ? "Active" : "Coming soon"}
                  </Badge>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {tool.uses > 0
                    ? `${tool.uses} uses · ${tool.trend} this week`
                    : "Not yet available"}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/60 bg-card/50">
        <CardContent className="flex items-center gap-3 p-4">
          <Mail className="size-4 shrink-0 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            New tools are added to the registry automatically. To request a
            specific tool, reach out to the team lead.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
