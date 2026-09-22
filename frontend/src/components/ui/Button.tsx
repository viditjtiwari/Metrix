"use client";

import React from "react";
import clsx from "clsx";

type ButtonVariant = "primary" | "secondary" | "outline" | "danger" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: string;
  children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-secondary hover:bg-secondary-container text-on-secondary shadow-sm",
  secondary:
    "bg-surface-container-lowest border border-surface-variant text-on-surface hover:bg-surface-container-low",
  outline:
    "border border-surface-variant text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface",
  danger:
    "bg-error hover:bg-error-container text-on-error shadow-sm",
  ghost:
    "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-2.5 py-1 text-[11px] gap-1",
  md: "px-3.5 py-1.5 text-xs gap-1.5",
  lg: "px-5 py-2.5 text-sm gap-2",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-150 focus-ring",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
      ) : icon ? (
        <span className="material-symbols-outlined text-base">{icon}</span>
      ) : null}
      <span>{children}</span>
    </button>
  );
}
