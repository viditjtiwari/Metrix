"use client";

import React from "react";
import clsx from "clsx";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
  helperText?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    { label, error, options, placeholder, helperText, className, id, ...props },
    ref
  ) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="space-y-1">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={clsx(
            "w-full rounded-lg bg-surface-container-low border px-3 py-2 text-xs text-on-surface",
            "transition-all duration-150 appearance-none cursor-pointer",
            "focus:outline-none focus:bg-surface-container-lowest focus:border-secondary",
            "bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22%2376777d%22%20d%3D%22m12%2015.4-6-6L7.4%208l4.6%204.6L16.6%208%2018%209.4z%22%2F%3E%3C%2Fsvg%3E')]",
            "bg-no-repeat bg-[right_10px_center]",
            error
              ? "border-error focus:border-error"
              : "border-surface-variant/60",
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
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

Select.displayName = "Select";
