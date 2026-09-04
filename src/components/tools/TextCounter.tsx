import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Hash,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TextCounter({ onBack }: { onBack: () => void }) {
  const [input, setInput] = useState("");

  const stats = useMemo(() => {
    const text = input;
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, "").length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const sentences = text.trim() ? text.split(/[.!?]+/).filter((s) => s.trim()).length : 0;
    const paragraphs = text.trim() ? text.split(/\n\s*\n/).filter((p) => p.trim()).length : 0;
    const lines = text ? text.split("\n").length : 0;
    const readingTime = Math.max(1, Math.ceil(words / 200));
    const speakingTime = Math.max(1, Math.ceil(words / 130));

    return { characters, charactersNoSpaces, words, sentences, paragraphs, lines, readingTime, speakingTime };
  }, [input]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-4 border-b border-border/60 px-6 py-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="size-9 shrink-0 cursor-pointer">
          <ArrowLeft className="size-4" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
            <Hash className="size-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Word Counter</h2>
            <p className="text-xs text-muted-foreground">Live text statistics</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-6 py-8 space-y-6">
          <div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Start typing or paste your text here..."
              className="h-48 w-full rounded-xl border border-border/60 bg-card p-4 text-sm leading-relaxed placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Words", value: stats.words },
              { label: "Characters", value: stats.characters },
              { label: "No Spaces", value: stats.charactersNoSpaces },
              { label: "Sentences", value: stats.sentences },
              { label: "Paragraphs", value: stats.paragraphs },
              { label: "Lines", value: stats.lines },
              { label: "Reading Time", value: `${stats.readingTime}m` },
              { label: "Speaking Time", value: `${stats.speakingTime}m` },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-border/60 bg-card p-4 text-center">
                <p className="text-2xl font-bold tracking-tight">{s.value}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
