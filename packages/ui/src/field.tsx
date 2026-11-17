"use client";

import React from "react";

export interface FieldProps {
  label?: string;
  hint?: string;
  error?: string | null;
  required?: boolean;
  htmlFor?: string;
  className?: string;
  children: React.ReactNode;
}

export const Field: React.FC<FieldProps> = ({
  label,
  hint,
  error,
  required = false,
  htmlFor,
  className = "",
  children,
}) => {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="block text-xs font-medium text-text-muted select-none"
        >
          {label}
          {required && <span className="text-danger ml-0.5">*</span>}
        </label>
      )}

      {children}

      {error ? (
        <p className="text-xs text-danger font-medium mt-1 animate-in fade-in duration-150">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-text-faint mt-1">{hint}</p>
      ) : null}
    </div>
  );
};
