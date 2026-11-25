import { cn } from "@/lib/utils";

interface CompatibilityMeterProps {
  /** Relative compatibility, 0..100. */
  score: number;
  className?: string;
}

/**
 * Shows a relative compatibility score. The bar is decorative; the number carries the
 * meaning, with screen-reader text making clear what the number is.
 */
export function CompatibilityMeter({ score, className }: CompatibilityMeterProps) {
  const clamped = Math.min(100, Math.max(0, score));
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div aria-hidden="true" className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink-700">
        <div
          className="h-full rounded-full bg-gradient-to-r from-neon-violet via-neon-pink to-neon-amber transition-[width] duration-500 ease-[var(--ease-cine)] motion-reduce:transition-none"
          style={{ width: `${clamped}%` }}
        />
      </div>
      <p className="shrink-0 font-mono text-xs tabular-nums text-bone">
        <span className="sr-only">Relative compatibility score: </span>
        {clamped}
        <span className="sr-only"> out of 100</span>
      </p>
    </div>
  );
}
