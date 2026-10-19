"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/ErrorState";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="py-12">
      <ErrorState
        title="Unexpected application error"
        message={error.message || "An error occurred while loading this view."}
        onRetry={() => reset()}
      />
    </div>
  );
}
