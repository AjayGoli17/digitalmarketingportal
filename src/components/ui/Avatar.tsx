import * as React from "react";
import { cn } from "@/lib/utils";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  src?: string | null;
  size?: "sm" | "md" | "lg";
  shape?: "circle" | "rounded";
}

export function Avatar({
  name,
  src,
  size = "md",
  shape = "rounded",
  className,
  ...props
}: AvatarProps) {
  const [imageError, setImageError] = React.useState(false);

  const getInitials = (str: string) => {
    const parts = str.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return str.slice(0, 2).toUpperCase();
  };

  const sizeStyles = {
    sm: "w-7 h-7 text-[11px]",
    md: "w-9 h-9 text-body-sm",
    lg: "w-11 h-11 text-title-md font-semibold",
  };

  const shapeStyles = {
    circle: "rounded-full",
    rounded: "rounded-lg",
  };

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center font-medium select-none shrink-0 overflow-hidden bg-surface-container-high text-ink-primary border border-hairline-subtle",
        sizeStyles[size],
        shapeStyles[shape],
        className
      )}
      {...props}
    >
      {src && !imageError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={name}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  );
}
