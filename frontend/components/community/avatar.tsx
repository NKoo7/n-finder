import { cn } from "@/lib/utils";
import type { AvatarTheme } from "@/lib/community/types";

const THEME_GRADIENTS: Record<AvatarTheme, string> = {
  violet: "from-neon-violet-deep to-neon-blue-deep",
  pink: "from-neon-pink-deep to-neon-violet-deep",
  green: "from-neon-green-deep to-neon-cyan-deep",
  blue: "from-neon-blue-deep to-neon-violet-deep",
  sunset: "from-neon-violet-deep via-neon-pink-deep to-neon-pink",
  aurora: "from-neon-green-deep via-neon-cyan-deep to-neon-blue-deep",
};

export function Avatar({
  name,
  theme,
  className,
}: {
  name: string;
  theme: AvatarTheme;
  className?: string;
}) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 select-none items-center justify-center rounded-full bg-gradient-to-br font-semibold text-white",
        THEME_GRADIENTS[theme],
        className ?? "size-10 text-sm",
      )}
    >
      {initials || "?"}
    </span>
  );
}