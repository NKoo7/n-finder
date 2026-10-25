"use client";

import { useState } from "react";
import { ChevronDown, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import {
  MOOD_DIMENSIONS,
  type MoodDimensionId,
  type MoodPreferences,
} from "@/lib/mood-dimensions";
import { cn } from "@/lib/utils";
import { MoodDimensionRow } from "./mood-dimension-row";

interface MoodPanelProps {
  preferences: MoodPreferences;
  onChange: (dimension: MoodDimensionId, value: number) => void;
  onReset: () => void;
  isDefault: boolean;
  className?: string;
}

/** The five sliders plus reset. On small screens the controls can be collapsed. */
export function MoodPanel({ preferences, onChange, onReset, isDefault, className }: MoodPanelProps) {
  const [open, setOpen] = useState(true);
  return (
    <Surface role="group" aria-labelledby="mood-title" className={cn("p-6", className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id="mood-title" className="font-display text-3xl text-bone">
            Cinematic Mood Engine
          </h2>
          <p className="mt-1 text-sm text-bone-dim">Five spectrums, one mood.</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mood-controls"
          aria-label={open ? "Hide mood controls" : "Show mood controls"}
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-md text-bone-muted transition-colors hover:bg-ink-800 hover:text-bone lg:hidden"
        >
          <ChevronDown
            aria-hidden="true"
            className={cn("size-5 transition-transform motion-reduce:transition-none", open && "rotate-180")}
          />
        </button>
      </div>

      <div id="mood-controls" className={cn("mt-6", open ? "block" : "hidden", "lg:block")}>
        <div className="divide-y divide-line">
          {MOOD_DIMENSIONS.map((dimension) => (
            <MoodDimensionRow
              key={dimension.id}
              dimension={dimension}
              value={preferences[dimension.id]}
              onChange={(value) => onChange(dimension.id, value)}
            />
          ))}
        </div>
        <Button
          variant="outline"
          onClick={onReset}
          disabled={isDefault}
          className="mt-6 w-full"
        >
          <RotateCcw aria-hidden="true" className="mr-2 size-4" />
          Reset mood
        </Button>
      </div>
    </Surface>
  );
}
