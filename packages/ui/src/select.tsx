"use client";

import React, { forwardRef } from "react";
import { ChevronDown } from "lucide-react";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = "", error = false, disabled = false, children, ...props }, ref) => {
    return (
      <div className="relative inline-block w-full">
        <select
          ref={ref}
          disabled={disabled}
          className={`w-full appearance-none bg-surface border rounded-sm px-3 py-2 pr-9 text-sm text-text outline-none transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
            error
              ? "border-danger ring-1 ring-danger/30"
              : "border-border hover:border-border-strong focus:border-primary focus:ring-2 focus:ring-primary/15"
          } ${className}`}
          {...props}
        >
          {children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-text-faint">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>
    );
  }
);

Select.displayName = "Select";
