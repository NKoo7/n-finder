import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-start gap-4 rounded-xl border border-dashed border-line-strong px-6 py-8 sm:px-8",
        className,
      )}
    >
      <div>
        <h3 className="font-display text-2xl text-bone">{title}</h3>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-bone-muted">
          {description}
        </p>
      </div>
      {action}
    </div>
  );
}
