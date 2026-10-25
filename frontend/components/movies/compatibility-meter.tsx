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
      <div aria-hidden="true" className="h-1 flex-1 overflow-hidden rounded-full bg-line-strong">
        <div className="h-full rounded-full bg-gold" style={{ width: `${clamped}%` }} />
      </div>
      <p className="shrink-0 font-mono text-xs tabular-nums text-bone">
        <span className="sr-only">Relative compatibility score: </span>
        {clamped}
        <span className="sr-only"> out of 100</span>
      </p>
    </div>
  );
}
