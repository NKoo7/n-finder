import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/** A quiet bordered panel. Use sparingly; most layout should be open space and rules. */
export function Surface({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-xl border border-line bg-ink-900", className)}
      {...props}
    />
  );
}
