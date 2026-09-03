import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import {
  Sparkles,
  FileText,
  Combine,
  Scissors,
  Minimize2,
  Image,
  ArrowRight,
  Zap,
  Shield,
  Gauge,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const pdfTools = [
  { icon: Combine, label: "Merge PDF" },
  { icon: Scissors, label: "Split PDF" },
  { icon: Minimize2, label: "Compress" },
  { icon: Image, label: "PDF to Image" },
];

const features = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description:
      "All PDF processing happens right in your browser. No uploads to servers, no waiting.",
  },
  {
    icon: Shield,
    title: "Private & Secure",
    description:
      "Your files never leave your device. 100% client-side processing with zero data collection.",
  },
  {
    icon: Gauge,
    title: "Built for Teams",
    description:
      "A unified toolkit your team can access from anywhere. No installs, no accounts for tools.",
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
              <Sparkles className="size-4 text-primary-foreground" />
            </div>
            <span className="text-base font-bold tracking-tight">ToolHub</span>
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
        {/* Subtle gradient backdrop */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-primary/[0.04] blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <motion.div {...fadeUp} transition={{ duration: 0.5 }}>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Built for your team
            </div>
          </motion.div>

          <motion.h1
            {...fadeUp}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
          >
            One hub. Every tool
            <br />
            your team needs.
          </motion.h1>

          <motion.p
            {...fadeUp}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground"
          >
            PDF merging, media downloading, and more — all processed
            client-side. Fast, private, and zero setup required.
          </motion.p>

          <motion.div
            {...fadeUp}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 flex items-center justify-center gap-3"
          >
            <Button
              onClick={() => navigate("/dashboard")}
              size="lg"
              className="cursor-pointer gap-2 px-7 text-sm font-medium shadow-lg"
            >
              Start using ToolHub
              <ArrowRight className="size-4" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Tool preview strip */}
      <section className="border-y border-border/60 bg-card/50 py-10">
        <div className="mx-auto max-w-5xl px-6">
          <p className="mb-6 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground/70">
            V1 — PDF Tools Available Now
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {pdfTools.map((tool) => (
              <motion.div
                key={tool.label}
                whileHover={{ y: -2 }}
                className="flex items-center gap-2 rounded-xl border border-border/60 bg-card px-4 py-2.5 text-sm font-medium shadow-sm transition-colors hover:border-primary/30"
              >
                <tool.icon className="size-4 text-primary" />
                {tool.label}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
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
              Why ToolHub?
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Designed from the ground up for how teams actually work.
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
                <div className="h-full rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
                  <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-primary/8 text-primary">
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
      <section className="border-t border-border/60 py-20">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Ready to get started?
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Open the dashboard and start using tools right away.
            </p>
            <Button
              onClick={() => navigate("/dashboard")}
              size="lg"
              className="mt-6 cursor-pointer gap-2 px-7 text-sm font-medium shadow-lg"
            >
              <FileText className="size-4" />
              Open ToolHub
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60 py-6">
        <div className="mx-auto max-w-6xl px-6 text-center text-xs text-muted-foreground">
          ToolHub — All-in-one tool hub for your team.
        </div>
      </footer>
    </div>
  );
}
