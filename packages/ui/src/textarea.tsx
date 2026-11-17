"use client";

import React, { forwardRef } from "react";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = "", error = false, disabled = false, rows = 3, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        rows={rows}
        disabled={disabled}
        className={`w-full bg-surface border rounded-sm p-3 text-sm text-text placeholder:text-text-faint outline-none font-sans transition-all duration-150 resize-y disabled:opacity-50 disabled:cursor-not-allowed ${
          error
            ? "border-danger ring-1 ring-danger/30"
            : "border-border hover:border-border-strong focus:border-primary focus:ring-2 focus:ring-primary/15"
        } ${className}`}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";
