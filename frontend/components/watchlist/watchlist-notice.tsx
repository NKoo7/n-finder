import { StatusNote } from "@/components/ui/status-note";
import type { WatchlistStatus } from "@/lib/watchlist/storage";

/** Explains storage problems. Renders nothing when storage is healthy. */
export function WatchlistNotice({ status, className }: { status: WatchlistStatus; className?: string }) {
  if (status === "unavailable") {
    return (
      <StatusNote className={className}>
        This browser is not letting N-finder save data, so your watchlist will only last until you
        close or reload this page.
      </StatusNote>
    );
  }
  if (status === "corrupted") {
    return (
      <StatusNote className={className}>
        A previously saved watchlist could not be read, so it is being ignored. Saving a film starts
        a fresh list.
      </StatusNote>
    );
  }
  return null;
}
