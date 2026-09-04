import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import {
  Wrench,
  FileText,
  Combine,
  Scissors,
  Minimize2,
  Image,
  ArrowRight,
  Zap,
  Lock,
  Layers,
  Terminal,
  ScanLine,
  Download,
  Calculator,
  Code,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const categoryHighlights = [
  {
    icon: FileText,
    label: "PDF Tools",
    tools: ["Merge", "Split", "Compress", "PDF to Image"],
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    icon: ScanLine,
    label: "Scanner & OCR",
    tools: ["Document Scanner", "Image to Text"],
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    icon: Image,
    label: "Image Tools",
    tools: ["Compress", "Resize", "Convert"],
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    icon: Calculator,
    label: "Calculators",
    tools: ["Age", "Percentage", "Unit", "BMI"],
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    icon: Code,
    label: "Developer",
    tools: ["JSON", "Base64", "Markdown", "Hash"],
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
  },
  {
    icon: Download,
    label: "Media",
    tools: ["Video Downloader", "Audio Extractor"],
    color: "text-rose-500",
    bg: "bg-rose-500/10",
  },
  {
    icon: Shield,
    label: "Network & Utilities",
    tools: ["MAC Lookup", "Subnet Calc", "UUID", "Device Info"],
    color: "text-indigo-500",
    bg: "bg-indigo-500/10",
  },
];

const features = [
  {
    icon: Zap,
    title: "Zero Latency",
    description:
      "Every operation runs directly in the browser. No round trips to a server, no queues, no waiting.",
  },
  {
    icon: Lock,
    title: "Nothing Leaves Your Machine",
    description:
      "Files are processed locally and never uploaded anywhere. What happens in Tool Hub stays in Tool Hub.",
  },
  {
    icon: Layers,
    title: "31 Tools, One Interface",
    description:
      "PDF workflows, image editing, developer utilities, calculators, and network tools — all unified.",
  },
];

const stats = [
  { value: "31", label: "Active Tools" },
  { value: "10", label: "Categories" },
  { value: "0", label: "Server Calls" },
  { value: "100%", label: "Client-Side" },
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
            <span className="text-base font-bold tracking-tight">
              Tool Hub
            </span>
          </div>
          <Button
            onClick={() => navigate("/dashboard")}
            size="sm"
            className="cursor-pointer gap-1.5"
          >
            Open Dashboard
            <ArrowRight className="size-3.5" />
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-20">
        {/* Gradient glow */}
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
            A unified, client-side toolkit for the team. PDF workflows, image
            processing, developer utilities, and network tools — all running
            locally in your browser.
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
                <p className="text-2xl font-bold tracking-tight text-primary">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Grid */}
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
              Everything your team needs
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              32 fully active tools across 11 categories — no placeholders,
              no coming soon.
            </p>
          </motion.div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {categoryHighlights.map((cat, i) => (
              <motion.div
                key={cat.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                whileHover={{ y: -2, scale: 1.01 }}
                className="cursor-pointer rounded-2xl border border-border/60 bg-card p-5 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
                onClick={() => navigate("/dashboard")}
              >
                <div
                  className={`mb-3 flex size-9 items-center justify-center rounded-xl ${cat.bg}`}
                >
                  <cat.icon className={`size-5 ${cat.color}`} />
                </div>
                <h3 className="text-sm font-semibold">{cat.label}</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {cat.tools.join(" · ")}
                </p>
              </motion.div>
            ))}

            {/* Coming soon card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: 0.35 }}
              className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/60 p-5 text-center"
            >
              <div className="mb-3 flex size-9 items-center justify-center rounded-xl bg-muted">
                <Wrench className="size-5 text-muted-foreground" />
              </div>
              <h3 className="text-sm font-semibold text-muted-foreground">
                More coming soon
              </h3>
              <p className="mt-1 text-xs text-muted-foreground/60">
                Easily extensible modular architecture
              </p>
            </motion.div>
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
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Why Tool Hub?
            </h2>
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
                  <h3 className="mb-1.5 text-sm font-semibold">
                    {feature.title}
                  </h3>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
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
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Ready to go?
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Jump straight in — no onboarding, no sign-up, no friction.
            </p>
            <Button
              onClick={() => navigate("/dashboard")}
              size="lg"
              className="mt-6 cursor-pointer gap-2 px-7 text-sm font-medium shadow-lg shadow-primary/20"
            >
              <FileText className="size-4" />
              Open Tool Hub
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
