import * as React from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "./Button";

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  message = "An error occurred while loading this view. Please try again.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "rounded-xl bg-white border border-[#FECACA] p-8 text-center flex flex-col items-center justify-center max-w-md mx-auto my-8 shadow-whisper",
        className
      )}
    >
      <div className="w-11 h-11 rounded-xl bg-[#FEE2E2] flex items-center justify-center text-[#DC2626] mb-3">
        <AlertCircle className="w-5 h-5 stroke-[2]" />
      </div>
      <h3 className="text-title-md font-semibold text-ink-primary mb-1">
        {title}
      </h3>
      <p className="text-body-sm text-ink-secondary max-w-sm mb-5">
        {message}
      </p>
      {onRetry && (
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          onClick={onRetry}
        >
          Try Again
        </Button>
      )}
    </div>
  );
}
