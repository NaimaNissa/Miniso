import { cn } from "@/lib/utils";

export function GlassCard({
  children,
  className,
  strong = false,
  hover = false,
}: {
  children: React.ReactNode;
  className?: string;
  strong?: boolean;
  hover?: boolean;
}) {
  return (
    <div
      className={cn(
        strong ? "glass-strong" : "glass",
        "rounded-[var(--radius-lg)]",
        hover &&
          "transition-shadow duration-200 hover:shadow-[var(--shadow-lg)]",
        className
      )}
    >
      {children}
    </div>
  );
}

export function SurfaceCard({
  children,
  className,
  hover = false,
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div
      className={cn(
        "surface rounded-[var(--radius-lg)]",
        hover &&
          "transition-shadow duration-200 hover:shadow-[var(--shadow-md)]",
        className
      )}
    >
      {children}
    </div>
  );
}
