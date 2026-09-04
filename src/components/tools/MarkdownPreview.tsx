import { useState, useMemo } from "react";
import { ArrowLeft, FileCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { marked } from "marked";
import DOMPurify from "dompurify";

const SAMPLE = `# Hello World\n\nThis is a **bold** and *italic* text sample.\n\n## Features\n- Item one\n- Item two\n- Item three\n\n> A blockquote example\n\n\`\`\`js\nconsole.log("Hello!");\n\`\`\`\n\n[Link example](https://example.com)`;

export default function MarkdownPreview({ onBack }: { onBack: () => void }) {
  const [input, setInput] = useState(SAMPLE);

  const html = useMemo(() => {
    try {
      const raw = marked.parse(input) as string;
      return DOMPurify.sanitize(raw);
    } catch {
      return "<p class='text-destructive'>Parse error</p>";
    }
  }, [input]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-4 border-b border-border/60 px-6 py-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="size-9 shrink-0 cursor-pointer"><ArrowLeft className="size-4" /></Button>
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10"><FileCode className="size-5 text-primary" /></div>
          <div><h2 className="text-lg font-semibold tracking-tight">Markdown Previewer</h2><p className="text-xs text-muted-foreground">Live split-screen Markdown to HTML</p></div>
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        <div className="grid h-full lg:grid-cols-2">
          <div className="flex flex-col border-r border-border/60">
            <div className="border-b border-border/60 px-4 py-2 text-xs font-medium text-muted-foreground">Markdown</div>
            <textarea value={input} onChange={(e) => setInput(e.target.value)}
              className="flex-1 resize-none bg-card p-4 font-mono text-xs leading-relaxed focus:outline-none" />
          </div>
          <div className="flex flex-col">
            <div className="border-b border-border/60 px-4 py-2 text-xs font-medium text-muted-foreground">Preview</div>
            <div className="flex-1 overflow-y-auto p-4 prose prose-sm dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: html }} />
          </div>
        </div>
      </div>
    </div>
  );
}
