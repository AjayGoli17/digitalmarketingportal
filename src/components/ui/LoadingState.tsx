import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-surface-container-high/70", className)}
      {...props}
    />
  );
}

export function LoadingSpinner({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizeStyles = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <Loader2
      className={cn("animate-spin text-aura-primary", sizeStyles[size], className)}
    />
  );
}

export function LoadingCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-xl bg-white border border-hairline-subtle p-6 shadow-whisper space-y-4",
        className
      )}
    >
      <div className="flex items-center space-x-3">
        <Skeleton className="w-10 h-10 rounded-lg" />
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/4" />
        </div>
      </div>
      <Skeleton className="h-28 w-full rounded-lg" />
      <div className="flex justify-between items-center pt-2">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-8 w-24 rounded-md" />
      </div>
    </div>
  );
}

export function LoadingPage({
  title = "Loading workspace...",
}: {
  title?: string;
}) {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center">
      <div className="relative mb-4">
        <div className="w-10 h-10 rounded-xl bg-aura-primary/10 flex items-center justify-center">
          <LoadingSpinner size="md" />
        </div>
      </div>
      <p className="text-body-sm font-medium text-ink-primary">{title}</p>
      <p className="text-body-sm text-ink-secondary mt-1">
        Synchronizing editorial assets and review states
      </p>
    </div>
  );
}
