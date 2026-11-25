import type { CSSProperties } from "react";
import type { MoodDimension } from "@/lib/mood-dimensions";
import { DIMENSION_COLORS } from "@/lib/mood-colors";
import { describePosition } from "@/lib/scoring/explain";
import { cn } from "@/lib/utils";

interface MoodDimensionRowProps {
  dimension: MoodDimension;
  /** 0 to 100; see lib/mood-dimensions.ts for the scale. */
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

/**
 * One spectrum of the Cinematic Mood Engine, built on a native range input so keyboard
 * (arrows, Home, End, PageUp/PageDown) and screen-reader behaviour come for free.
 * `aria-valuetext` announces the plain-language position ("leans hopeful") rather than a
 * bare number; the visible readout shows both.
 */
export function MoodDimensionRow({
  dimension,
  value,
  onChange,
  className,
}: MoodDimensionRowProps) {
  const inputId = `mood-${dimension.id}`;
  const descId = `${inputId}-desc`;
  const position = describePosition(dimension, value);
  const color = DIMENSION_COLORS[dimension.id];
  return (
    <div className={cn("py-5 first:pt-0 last:pb-0", className)}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <label htmlFor={inputId} className="text-sm font-medium text-bone">
          {dimension.low}
          <span aria-hidden="true" className="px-2 text-bone-dim">
            &harr;
          </span>
          <span className="sr-only"> to </span>
          <span className={color.text}>{dimension.high}</span>
        </label>
        <span
          aria-hidden="true"
          className={cn(
            "ml-auto shrink-0 font-mono text-[0.68rem] uppercase tracking-[0.14em]",
            color.text,
          )}
        >
          {position} &middot; {value}
        </span>
      </div>
      <input
        id={inputId}
        type="range"
        min={0}
        max={100}
        step={1}
        value={value}
        onChange={(event) => onChange(Number(event.currentTarget.value))}
        aria-describedby={descId}
        aria-valuetext={`${position}, ${value} out of 100`}
        className="mood-slider mt-3 w-full"
        style={{ "--slider-a": color.from, "--slider-b": color.to } as CSSProperties}
      />
      <p id={descId} className="mt-2 text-xs leading-relaxed text-bone-dim max-lg:sr-only">
        {dimension.description}
      </p>
    </div>
  );
}
