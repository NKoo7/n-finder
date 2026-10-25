"use client";

import { useEffect, useState } from "react";
import { fetchRanking, type ApiRecommendation } from "@/lib/api";
import { MOOD_DIMENSIONS, type MoodPreferences } from "@/lib/mood-dimensions";

type Settled = { key: string; results: ApiRecommendation[] | null; error: string | null };

/**
 * Asks the backend engine for the ranking whenever the sliders settle (200 ms debounce,
 * in-flight requests cancelled). `loading` is derived by comparing the settled request's key
 * with the current sliders, so no state is set synchronously inside the effect.
 */
export function useRanking(preferences: MoodPreferences) {
  const key = MOOD_DIMENSIONS.map((d) => preferences[d.id]).join(",");
  const [settled, setSettled] = useState<Settled | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const results = await fetchRanking(preferences, controller.signal);
        setSettled({ key, results, error: null });
      } catch (error) {
        if (controller.signal.aborted) return;
        setSettled({ key, results: null, error: error instanceof Error ? error.message : "Request failed." });
      }
    }, 200);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [key, preferences]);

  const current = settled && settled.key === key ? settled : null;
  return { loading: current === null, results: current?.results ?? null, error: current?.error ?? null };
}
