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
    title: "One Interface, Every Tool",
    description:
      "PDF workflows, media downloads, and future utilities — unified under a single, consistent experience.",
  },
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
            A unified, client-side toolkit for the team. PDF merging today,
            media downloads and more tomorrow — all processed locally in
            your browser.
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

      {/* Tool preview strip */}
      <section className="border-y border-border/60 bg-card/30 py-10">
        <div className="mx-auto max-w-5xl px-6">
          <p className="mb-6 text-center text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
            Available now
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {pdfTools.map((tool) => (
              <motion.div
                key={tool.label}
                whileHover={{ y: -2 }}
                className="flex items-center gap-2 rounded-xl border border-border/60 bg-card px-4 py-2.5 text-sm font-medium shadow-sm transition-colors hover:border-primary/40 hover:text-primary"
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
      <section className="border-t border-border/60 py-20">
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
              Sign in and start using tools immediately. No onboarding
              required.
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
