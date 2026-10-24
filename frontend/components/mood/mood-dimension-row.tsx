import type { MoodDimension } from "@/lib/mood-dimensions";
import { cn } from "@/lib/utils";

interface MoodDimensionRowProps {
  dimension: MoodDimension;
  /** 0 to 100. Only meaningful once the control is enabled. */
  value?: number;
  /** Disabled until the Mood Engine is wired to the recommendation backend. */
  disabled?: boolean;
  className?: string;
}

/**
 * One spectrum of the Cinematic Mood Engine, built on a native range input so keyboard
 * and screen-reader behaviour comes for free. In this build it is deliberately disabled
 * and reads "Not set": it does not influence anything yet.
 */
export function MoodDimensionRow({
  dimension,
  value = 50,
  disabled = true,
  className,
}: MoodDimensionRowProps) {
  const inputId = `mood-${dimension.id}`;
  const descId = `${inputId}-desc`;
  return (
    <div className={cn("py-5 first:pt-0 last:pb-0", className)}>
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={inputId} className="text-sm font-medium text-bone">
          {dimension.low}
          <span aria-hidden="true" className="px-2 text-bone-dim">
            &harr;
          </span>
          <span className="sr-only"> to </span>
          {dimension.high}
        </label>
        <output
          htmlFor={inputId}
          className="shrink-0 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-bone-dim"
        >
          {disabled ? "Not set" : `${value}`}
        </output>
      </div>
      <input
        id={inputId}
        type="range"
        min={0}
        max={100}
        step={1}
        value={value}
        disabled={disabled}
        aria-describedby={descId}
        className="mt-3 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-line-strong accent-gold disabled:cursor-not-allowed disabled:opacity-50"
      />
      <p id={descId} className="mt-2.5 text-xs leading-relaxed text-bone-dim">
        {dimension.description}
      </p>
    </div>
  );
}
