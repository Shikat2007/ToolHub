import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Users,
  Wrench,
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";

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

const mockTeamMembers = [
  { id: "1", name: "Alex Chen", email: "alex@team.io", role: "Admin", toolsUsed: 24, lastActive: "2 min ago" },
  { id: "2", name: "Jordan Lee", email: "jordan@team.io", role: "Member", toolsUsed: 18, lastActive: "1 hour ago" },
  { id: "3", name: "Sam Rivera", email: "sam@team.io", role: "Member", toolsUsed: 31, lastActive: "3 hours ago" },
  { id: "4", name: "Taylor Kim", email: "taylor@team.io", role: "Member", toolsUsed: 12, lastActive: "Yesterday" },
];

const mockActivity = [
  { user: "Sam Rivera", action: "Merged 4 PDF files", time: "2 min ago", tool: "Merge PDF" },
  { user: "Alex Chen", action: "Compressed a PDF", time: "18 min ago", tool: "Compress PDF" },
  { user: "Jordan Lee", action: "Split a PDF into 6 pages", time: "1 hour ago", tool: "Split PDF" },
  { user: "Sam Rivera", action: "Analyzed a YouTube URL", time: "3 hours ago", tool: "Universal Downloader" },
  { user: "Taylor Kim", action: "Merged 2 PDF files", time: "Yesterday", tool: "Merge PDF" },
];

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

function OverviewTab({ userName }: { userName?: string }) {
  const stats = [
    { label: "Team members", value: mockTeamMembers.length, icon: Users, color: "text-blue-400" },
    { label: "Active tools", value: 4, icon: Wrench, color: "text-emerald-400" },
    { label: "Total uses", value: 85, icon: TrendingUp, color: "text-violet-400" },
    { label: "This week", value: "+12%", icon: TrendingUp, color: "text-amber-400" },
  ];

  return (
    <div className="space-y-6">
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
        <Card className="border-border/60 shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Clock className="size-4 text-muted-foreground" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockActivity.map((entry, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-foreground">
                      <span className="font-medium">{entry.user}</span>
                      <span className="text-muted-foreground"> {entry.action}</span>
                    </p>
                  </div>
                  <span className="ml-4 shrink-0 text-xs text-muted-foreground">{entry.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

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
              <span className="text-muted-foreground">Backend</span>
              <span className="font-medium">Stateless (In-Memory)</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Database</span>
              <span className="font-medium">None</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Version</span>
              <span className="font-medium">3.0.0</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function TeamTab() {
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
            <div className="grid grid-cols-[1fr_1fr_auto_auto] gap-4 px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground/60">
              <span>Member</span>
              <span className="hidden sm:block">Email</span>
              <span>Tools Used</span>
              <span className="w-8" />
            </div>
            {mockTeamMembers.map((member) => (
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
                    <p className="text-[11px] text-muted-foreground">{member.lastActive}</p>
                  </div>
                </div>
                <p className="hidden truncate text-sm text-muted-foreground sm:block">{member.email}</p>
                <Badge variant="secondary" className="text-xs">{member.toolsUsed} uses</Badge>
                <Button variant="ghost" size="icon" className="size-8 cursor-pointer" disabled>
                  <Mail className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ToolsTab() {
  const tools = [
    { id: "merge-pdf", name: "Merge PDF", status: "active" as const, uses: 34 },
    { id: "split-pdf", name: "Split PDF", status: "active" as const, uses: 21 },
    { id: "compress-pdf", name: "Compress PDF", status: "active" as const, uses: 18 },
    { id: "video-downloader", name: "Universal Downloader", status: "active" as const, uses: 12 },
    { id: "pdf-to-image", name: "PDF to Image", status: "coming" as const, uses: 0 },
    { id: "fb-downloader", name: "Facebook Downloader", status: "coming" as const, uses: 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight">Tool Usage</h2>
        <Badge variant="secondary" className="text-xs">V3</Badge>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
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
                  {tool.uses > 0
                    ? `${tool.uses} use${tool.uses !== 1 ? "s" : ""}`
                    : "Not yet available"}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
