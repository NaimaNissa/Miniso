import { Button } from "./button";
import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  description,
  action,
  onAction,
  className,
}: {
  title: string;
  description: string;
  action?: string;
  onAction?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-6 py-16 text-center",
        className
      )}
    >
      <div className="mb-4 h-12 w-12 rounded-full bg-[var(--accent-soft)]" />
      <h3 className="text-base font-semibold text-[var(--text-primary)]">
        {title}
      </h3>
      <p className="mt-1 max-w-sm text-sm text-[var(--text-secondary)]">
        {description}
      </p>
      {action && (
        <Button className="mt-5" variant="secondary" onClick={onAction}>
          {action}
        </Button>
      )}
    </div>
  );
}
