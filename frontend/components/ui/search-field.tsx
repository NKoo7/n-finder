import type { InputHTMLAttributes } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  /** Required so the visually hidden label can be tied to the input. */
  id: string;
  label: string;
}

/** Labelled search input. The label is visually hidden but always present for assistive tech. */
export function SearchField({ id, label, className, ...props }: SearchFieldProps) {
  return (
    <div className={cn("relative", className)}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-bone-dim"
      />
      <input
        id={id}
        type="search"
        className="h-11 w-full rounded-md border border-line-strong bg-ink-900 pl-10 pr-3 text-sm text-bone placeholder:text-bone-dim transition-colors hover:border-bone-dim disabled:cursor-not-allowed disabled:opacity-60"
        {...props}
      />
    </div>
  );
}
