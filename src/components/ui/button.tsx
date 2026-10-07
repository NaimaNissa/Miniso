import { cn } from "@/lib/utils";
import { forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-[var(--accent)] text-white hover:brightness-105 active:scale-[0.98]",
  secondary:
    "bg-[var(--accent-soft)] text-[var(--accent)] hover:bg-[var(--accent-soft-strong)]",
  ghost:
    "bg-transparent text-[var(--text-secondary)] hover:bg-[var(--border)] hover:text-[var(--text-primary)]",
  danger:
    "bg-[var(--danger-soft)] text-[var(--danger)] hover:brightness-95",
  outline:
    "border border-[var(--border)] bg-transparent text-[var(--text-primary)] hover:bg-[var(--background-elevated)]",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-xs gap-1.5 rounded-[var(--radius-sm)]",
  md: "h-10 px-4 text-sm gap-2 rounded-[var(--radius-md)]",
  lg: "h-12 px-5 text-base gap-2 rounded-[var(--radius-md)]",
};

export const Button = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: Variant;
    size?: Size;
  }
>(function Button(
  { className, variant = "primary", size = "md", ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center font-medium transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
});
