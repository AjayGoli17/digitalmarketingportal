import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "accent" | "ghost" | "outline" | "destructive";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aura-primary focus-visible:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none select-none";

    const variantStyles = {
      primary:
        "bg-ink-primary text-white hover:bg-zinc-800 shadow-sm active:scale-[0.99]",
      secondary:
        "bg-white text-ink-primary border border-hairline-subtle hover:bg-zinc-50 shadow-whisper active:scale-[0.99]",
      accent:
        "bg-aura-primary text-white hover:bg-[#4338CA] shadow-sm active:scale-[0.99]",
      ghost:
        "bg-transparent text-ink-secondary hover:text-ink-primary hover:bg-surface-container-low",
      outline:
        "bg-transparent text-ink-primary border border-hairline-subtle hover:bg-surface-container-low",
      destructive:
        "bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA] hover:bg-red-100",
    };

    const sizeStyles = {
      sm: "h-8 px-3 text-body-sm rounded-md gap-1.5",
      md: "h-9 px-4 text-body-md rounded-md gap-2",
      lg: "h-11 px-5 text-title-md rounded-md gap-2.5",
      icon: "h-9 w-9 rounded-md",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            {leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
