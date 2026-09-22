"use client";

import React from "react";
import clsx from "clsx";

type BadgeVariant = "success" | "warning" | "error" | "info" | "neutral";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  size?: "sm" | "md";
  dot?: boolean;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  success:
    "bg-tertiary/10 text-tertiary border-tertiary/20",
  warning:
    "bg-amber-50 text-amber-800 border-amber-200",
  error:
    "bg-error-container text-on-error-container border-error/20",
  info:
    "bg-secondary/10 text-secondary border-secondary/20",
  neutral:
    "bg-surface-container text-on-surface-variant border-surface-variant/40",
};

const dotColors: Record<BadgeVariant, string> = {
  success: "bg-tertiary",
  warning: "bg-amber-500",
  error: "bg-error",
  info: "bg-secondary",
  neutral: "bg-outline",
};

export function Badge({
  variant = "neutral",
  children,
  size = "sm",
  dot = false,
  className,
}: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-md border font-semibold",
        size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
        variantStyles[variant],
        className
      )}
    >
      {dot && (
        <span
          className={clsx("w-1.5 h-1.5 rounded-full", dotColors[variant])}
        />
      )}
      {children}
    </span>
  );
}
