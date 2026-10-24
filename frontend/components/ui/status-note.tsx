import type { ReactNode } from "react";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusNoteProps {
  children: ReactNode;
  className?: string;
}

/** Plain-language notice about what is and is not connected yet. */
export function StatusNote({ children, className }: StatusNoteProps) {
  return (
    <aside
      aria-label="Build status"
      className={cn(
        "flex items-start gap-3 rounded-lg border border-line bg-ink-900 px-4 py-3 text-sm leading-relaxed text-bone-muted",
        className,
      )}
    >
      <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-gold" />
      <div>{children}</div>
    </aside>
  );
}
