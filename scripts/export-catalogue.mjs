// Exports the frontend sample catalogue to backend/app/data/movies.json so both sides share one dataset.
// Run from the repo root: node scripts/export-catalogue.mjs   (needs Node 22.18+ for TypeScript stripping)
import { writeFileSync } from "node:fs";
const { SAMPLE_MOVIES, SAMPLE_DATASET_LABEL } = await import("../frontend/lib/movies/sample-movies.ts");
writeFileSync(
  new URL("../backend/app/data/movies.json", import.meta.url),
  JSON.stringify({ label: SAMPLE_DATASET_LABEL, movies: SAMPLE_MOVIES }, null, 1) + "\n",
);
console.log(`exported ${SAMPLE_MOVIES.length} films`);
