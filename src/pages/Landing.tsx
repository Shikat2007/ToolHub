import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import {
  Wrench, ArrowRight, Zap, Lock, Layers, Terminal,
  FileText, ScanLine, Image, Calculator, Code, Download, Shield, Gauge,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { categories, tools } from "@/lib/tool-registry";

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  "pdf": FileText, "scan": ScanLine, "image": Image, "text": Layers, "utility": Wrench,
  "media": Download, "calculator": Calculator, "developer": Code, "creator": Terminal, "network": Shield,
};

const categoryTint: Record<string, { bg: string; fg: string }> = {
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

const features = [
  {
    icon: Zap,
    title: "Zero latency",
    description:
      "Every operation runs directly in your browser. No round trips to a server, no queues, no waiting.",
  },
  {
    icon: Lock,
    title: "Nothing leaves your machine",
    description:
      "Files are processed locally and never uploaded anywhere. What happens in Tool Hub stays in Tool Hub.",
  },
  {
    icon: Gauge,
    title: "No keys, no accounts",
    description:
      "No API keys, no sign-ups, no tracking. Open the dashboard and every tool is ready to work.",
  },
];

const stats = [
  { value: String(tools.length), label: "Active tools" },
  { value: String(categories.length), label: "Categories" },
  { value: "0", label: "Server calls" },
  { value: "100%", label: "Client-side" },
];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Wrench className="size-4" />
            </div>
            <span className="text-base font-bold tracking-tight">Tool Hub</span>
          </div>
          <Button onClick={() => navigate("/dashboard")} size="sm" className="cursor-pointer gap-1.5">
            Open Dashboard
            <ArrowRight className="size-3.5" />
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-20">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/4 rounded-full bg-primary/8 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <motion.div {...fadeUp} transition={{ duration: 0.5 }}>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary">
              <Terminal className="size-3" />
              Internal tooling — your team only
            </div>
          </motion.div>

          <motion.h1
            {...fadeUp}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
          >
            Every tool. One place.
            <br />
            <span className="text-primary">No server required.</span>
          </motion.h1>

          <motion.p
            {...fadeUp}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground"
          >
            A unified, client-side toolkit for the team. PDF workflows, image processing,
            developer utilities, network diagnostics — {tools.length} real tools running locally
            in your browser, organized into {categories.length} focused categories.
          </motion.p>

          <motion.div
            {...fadeUp}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 flex items-center justify-center gap-3"
          >
            <Button
              onClick={() => navigate("/dashboard")}
              size="lg"
              className="cursor-pointer gap-2 px-7 text-sm font-medium shadow-lg shadow-primary/20"
            >
              Launch Tool Hub
              <ArrowRight className="size-4" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border/60 bg-card/30 py-8">
        <div className="mx-auto max-w-4xl px-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {stats.map((stat) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className="text-center"
              >
                <p className="text-2xl font-bold tracking-tight text-primary">{stat.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Category portals */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.4 }}
            className="mb-12 text-center"
          >
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Browse by category
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {tools.length} fully active tools across {categories.length} categories —
              no placeholders, no coming soon.
            </p>
          </motion.div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {categories.map((cat, i) => {
              const Icon = categoryIcons[cat.icon] ?? Wrench;
              const tint = categoryTint[cat.id];
              const count = tools.filter((t) => t.category === cat.id).length;
              return (
                <motion.button
                  key={cat.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.4, delay: i * 0.04 }}
                  whileHover={{ y: -2, scale: 1.01 }}
                  className="cursor-pointer rounded-2xl border border-border/60 bg-card p-4 text-left transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
                  onClick={() => navigate("/dashboard")}
                >
                  <div className={`mb-3 flex size-9 items-center justify-center rounded-xl ${tint.bg}`}>
                    <Icon className={`size-5 ${tint.fg}`} />
                  </div>
                  <h3 className="text-sm font-semibold">{cat.label}</h3>
                  <p className="mt-1 text-[11px] text-muted-foreground">{count} tools</p>
                </motion.button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-y border-border/60 bg-card/30 py-20">
        <div className="mx-auto max-w-5xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.4 }}
            className="mb-12 text-center"
          >
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Why Tool Hub?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Purpose-built for how our team actually works.
            </p>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-3">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <div className="h-full rounded-2xl border border-border/60 bg-card p-6">
                  <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <feature.icon className="size-5" />
                  </div>
                  <h3 className="mb-1.5 text-sm font-semibold">{feature.title}</h3>
                  <p className="text-xs leading-relaxed text-muted-foreground">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Ready to go?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Jump straight in — no onboarding, no sign-up, no friction.
            </p>
            <Button
              onClick={() => navigate("/dashboard")}
              size="lg"
              className="mt-6 cursor-pointer gap-2 px-7 text-sm font-medium shadow-lg shadow-primary/20"
            >
              Open Tool Hub
              <ArrowRight className="size-4" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60 py-6">
        <div className="mx-auto max-w-6xl px-6 text-center text-xs text-muted-foreground">
          Tool Hub — Internal toolkit for the team.
        </div>
      </footer>
    </div>
  );
}
