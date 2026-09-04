import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme} className={`cursor-pointer transition-colors hover:bg-accent ${className ?? ""}`} aria-label="Toggle theme">
      {theme === "dark" ? <Sun className="size-4 transition-transform duration-300 rotate-0 scale-100" /> : <Moon className="size-4 transition-transform duration-300" />}
    </Button>
  );
}
