import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/** Loading placeholder. Pulses only when the user has not asked for reduced motion. */
export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={cn("rounded-md bg-ink-800 motion-safe:animate-pulse", className)}
      {...props}
    />
  );
}
