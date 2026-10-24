/**
 * Button and ButtonLink.
 *
 * The optional `slideTo` label effect is adapted from Kokonut UI's "Slide Text Button"
 * (MIT, (c) kokonutUI, https://github.com/kokonut-labs/kokonutui). Changes: N-finder design
 * tokens, a shared style helper for <button> and <Link>, and no entrance animation.
 * The hover label is aria-hidden, so assistive tech only reads the primary label.
 */
import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const buttonStyles = cva(
  [
    "group relative inline-flex select-none items-center justify-center overflow-hidden whitespace-nowrap",
    "rounded-md font-medium tracking-tight",
    "transition-[background-color,border-color,color,scale] duration-200 ease-[var(--ease-cine)]",
    "active:scale-[0.98] motion-reduce:active:scale-100",
    "disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50",
  ],
  {
    variants: {
      variant: {
        primary: "bg-gold text-ink-950 hover:bg-gold-bright",
        outline:
          "border border-line-strong text-bone hover:border-bone-dim hover:bg-ink-800",
        ghost: "text-bone-muted hover:bg-ink-800 hover:text-bone",
      },
      size: {
        md: "h-10 px-5 text-sm",
        lg: "h-12 px-7 text-base md:min-w-52",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type StyleProps = VariantProps<typeof buttonStyles> & {
  /** Label that slides in on hover/focus. Purely decorative; screen readers ignore it. */
  slideTo?: string;
  children: ReactNode;
};

function Label({ slideTo, children }: Pick<StyleProps, "slideTo" | "children">) {
  if (!slideTo) return <>{children}</>;
  return (
    <span className="grid justify-items-center transition-transform duration-200 ease-[var(--ease-slide)] group-hover:-translate-y-full group-focus-visible:-translate-y-full motion-reduce:transition-none">
      <span className="col-start-1 row-start-1 flex items-center gap-2 transition-opacity duration-200 group-hover:opacity-0 group-focus-visible:opacity-0">
        {children}
      </span>
      <span
        aria-hidden="true"
        className="col-start-1 row-start-1 flex translate-y-full items-center gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
      >
        {slideTo}
      </span>
    </span>
  );
}

type ButtonProps = StyleProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children">;

export function Button({
  variant,
  size,
  slideTo,
  className,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(buttonStyles({ variant, size }), className)}
      {...props}
    >
      <Label slideTo={slideTo}>{children}</Label>
    </button>
  );
}

type ButtonLinkProps = StyleProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children" | "href"> & {
    href: string;
  };

export function ButtonLink({
  variant,
  size,
  slideTo,
  className,
  children,
  href,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      className={cn(buttonStyles({ variant, size }), className)}
      {...props}
    >
      <Label slideTo={slideTo}>{children}</Label>
    </Link>
  );
}
