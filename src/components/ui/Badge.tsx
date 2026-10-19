import * as React from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant =
  | "draft"
  | "pending"
  | "changes"
  | "approved"
  | "published"
  | "scheduled"
  | "neutral"
  | "frosted-dark"
  | "outline";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  withDot?: boolean;
  size?: "sm" | "md";
}

export function Badge({
  className,
  variant = "neutral",
  withDot = false,
  size = "md",
  children,
  ...props
}: BadgeProps) {
  const variantStyles: Record<BadgeVariant, { container: string; dot?: string }> = {
    draft: {
      container: "bg-surface-container-high text-ink-secondary border border-hairline",
      dot: "bg-zinc-400",
    },
    pending: {
      container: "bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]",
      dot: "bg-[#D97706]",
    },
    changes: {
      container: "bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA]",
      dot: "bg-[#DC2626]",
    },
    approved: {
      container: "bg-[#DCFCE7] text-[#16A34A] border border-[#BBF7D0]",
      dot: "bg-[#16A34A]",
    },
    published: {
      container: "bg-indigo-50 text-aura-primary border border-indigo-200",
      dot: "bg-aura-primary",
    },
    scheduled: {
      container: "bg-[#EEF2FF] text-[#4F46E5] border border-[#E0E7FF]",
      dot: "bg-[#4F46E5]",
    },
    neutral: {
      container: "bg-surface-container-high text-ink-primary border border-hairline-subtle",
      dot: "bg-ink-secondary",
    },
    "frosted-dark": {
      container: "bg-black/60 text-white backdrop-blur-md border border-white/20",
      dot: "bg-white",
    },
    outline: {
      container: "bg-white text-ink-secondary border border-hairline-subtle",
      dot: "bg-ink-tertiary",
    },
  };

  const sizeStyles = {
    sm: "h-5 px-2 text-[10px] tracking-wide",
    md: "h-[22px] px-2.5 text-label-md font-medium",
  };

  const current = variantStyles[variant];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full select-none whitespace-nowrap",
        sizeStyles[size],
        current.container,
        className
      )}
      {...props}
    >
      {withDot && (
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full shrink-0",
            current.dot || "bg-current"
          )}
        />
      )}
      {children}
    </span>
  );
}
