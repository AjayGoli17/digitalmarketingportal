import * as React from "react";
import { cn } from "@/lib/utils";
import { Layers } from "lucide-react";
import { Button } from "./Button";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-xl bg-white border border-dashed border-hairline-subtle p-12 text-center flex flex-col items-center justify-center max-w-md mx-auto my-8",
        className
      )}
    >
      <div className="w-12 h-12 rounded-xl bg-surface-container-low border border-hairline-subtle flex items-center justify-center text-ink-secondary mb-4">
        {icon || <Layers className="w-6 h-6 stroke-[1.5]" />}
      </div>
      <h3 className="text-title-md font-semibold text-ink-primary mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-body-sm text-ink-secondary max-w-sm mb-6">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
