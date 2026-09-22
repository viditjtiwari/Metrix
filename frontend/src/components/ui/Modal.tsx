"use client";

import React, { useEffect, useRef } from "react";
import clsx from "clsx";

interface ModalProps {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

const sizeStyles = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
};

export function Modal({
  title,
  subtitle,
  onClose,
  children,
  footer,
  size = "md",
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm animate-fade-in"
    >
      <div
        className={clsx(
          "w-full bg-surface-container-lowest rounded-2xl shadow-xl border border-surface-variant/40 animate-scale-in flex flex-col max-h-[90vh]",
          sizeStyles[size]
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-surface-variant/40">
          <div>
            <h2 className="font-headline font-bold text-base text-on-surface">
              {title}
            </h2>
            {subtitle && (
              <p className="text-[11px] text-on-surface-variant mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container-low transition focus-ring"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-2 p-4 border-t border-surface-variant/40 bg-surface-container-low/30 rounded-b-2xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
