"use client";

import { X } from "lucide-react";
import { useEffect, useId, type ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg";
  tone?: "light" | "dark";
}

const SIZES = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-3xl",
};

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = "md",
  tone = "light",
}: ModalProps) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-end justify-center bg-ink-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`animate-fade-up max-h-[92vh] w-full ${SIZES[size]} overflow-y-auto rounded-t-2xl border border-ink-100 bg-white shadow-2xl sm:rounded-2xl`}
      >
        <div
          className={`sticky top-0 z-10 flex items-start justify-between gap-4 border-b px-5 py-4 sm:px-6 ${
            tone === "dark"
              ? "border-white/10 bg-ink-900 text-white"
              : "border-ink-100 bg-white/95 backdrop-blur"
          }`}
        >
          <div>
            <h2
              id={titleId}
              className={`text-base font-semibold sm:text-lg ${
                tone === "dark" ? "text-white" : "text-ink-900"
              }`}
            >
              {title}
            </h2>
            {description ? (
              <p
                className={`mt-1 text-xs leading-relaxed sm:text-sm ${
                  tone === "dark" ? "text-white/70" : "text-ink-500"
                }`}
              >
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className={`rounded-lg p-1.5 transition ${
              tone === "dark"
                ? "text-white/70 hover:bg-white/10 hover:text-white"
                : "text-ink-400 hover:bg-ink-50 hover:text-ink-800"
            }`}
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>
        <div className="px-5 py-5 sm:px-6">{children}</div>
      </div>
    </div>
  );
}
