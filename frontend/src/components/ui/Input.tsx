"use client";

import React from "react";
import clsx from "clsx";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, helperText, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="space-y-1">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-base">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={clsx(
              "w-full rounded-lg bg-surface-container-low border text-xs text-on-surface",
              "placeholder:text-outline transition-all duration-150",
              "focus:outline-none focus:bg-surface-container-lowest focus:border-secondary",
              icon ? "pl-9 pr-3" : "px-3",
              "py-2",
              error
                ? "border-error focus:border-error"
                : "border-surface-variant/60",
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="text-[10px] text-error font-medium">{error}</p>
        )}
        {helperText && !error && (
          <p className="text-[10px] text-outline">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
