"use client";

import React, { forwardRef } from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  prefixText?: string;
  suffixText?: string;
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className = "",
      leftIcon,
      rightIcon,
      prefixText,
      suffixText,
      error = false,
      disabled = false,
      type = "text",
      ...props
    },
    ref
  ) => {
    return (
      <div
        className={`relative flex items-center bg-surface border rounded-sm transition-all duration-150 ${
          error
            ? "border-danger ring-1 ring-danger/30"
            : "border-border hover:border-border-strong focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15"
        } ${disabled ? "opacity-50 cursor-not-allowed bg-surface-subtle" : ""}`}
      >
        {leftIcon && (
          <div className="pl-3 pr-1 text-text-faint flex items-center pointer-events-none shrink-0">
            {leftIcon}
          </div>
        )}

        {prefixText && (
          <span className="pl-3 pr-1 text-text-muted text-sm select-none font-medium">
            {prefixText}
          </span>
        )}

        <input
          ref={ref}
          type={type}
          disabled={disabled}
          className={`w-full bg-transparent px-3 py-2 text-sm text-text placeholder:text-text-faint outline-none font-sans disabled:cursor-not-allowed ${className}`}
          {...props}
        />

        {suffixText && (
          <span className="pr-3 pl-1 text-text-muted text-xs select-none font-medium">
            {suffixText}
          </span>
        )}

        {rightIcon && (
          <div className="pr-3 pl-1 text-text-faint flex items-center shrink-0">
            {rightIcon}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
