import * as React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  elevation?: "flat" | "level1" | "level2" | "interactive";
}

export function Card({
  className,
  elevation = "level1",
  children,
  ...props
}: CardProps) {
  const elevationStyles = {
    flat: "bg-white border border-hairline-subtle",
    level1: "bg-white border border-hairline-subtle shadow-whisper",
    level2: "bg-white border border-hairline-subtle shadow-popover",
    interactive:
      "bg-white border border-hairline-subtle shadow-whisper hover:border-zinc-300 hover:shadow-popover transition-all duration-200 cursor-pointer",
  };

  return (
    <div
      className={cn("rounded-xl overflow-hidden", elevationStyles[elevation], className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("px-6 py-5 border-b border-hairline flex items-center justify-between", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-6", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("px-6 py-4 bg-surface-container-low/40 border-t border-hairline flex items-center justify-between", className)}
      {...props}
    >
      {children}
    </div>
  );
}
