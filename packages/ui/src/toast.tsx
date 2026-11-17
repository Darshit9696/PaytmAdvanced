"use client";

import React from "react";
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from "lucide-react";

export type AlertVariant = "info" | "success" | "warning" | "danger";

export interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  onDismiss?: () => void;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  variant = "info",
  title,
  children,
  onDismiss,
  className = "",
}) => {
  const variantStyles: Record<
    AlertVariant,
    { bg: string; border: string; text: string; icon: React.ReactNode }
  > = {
    info: {
      bg: "bg-info-tint",
      border: "border-info-border",
      text: "text-info",
      icon: <Info className="w-4 h-4 shrink-0 text-info" />,
    },
    success: {
      bg: "bg-success-tint",
      border: "border-success-border",
      text: "text-success",
      icon: <CheckCircle2 className="w-4 h-4 shrink-0 text-success" />,
    },
    warning: {
      bg: "bg-warning-tint",
      border: "border-warning-border",
      text: "text-warning",
      icon: <AlertTriangle className="w-4 h-4 shrink-0 text-warning" />,
    },
    danger: {
      bg: "bg-danger-tint",
      border: "border-danger-border",
      text: "text-danger",
      icon: <AlertCircle className="w-4 h-4 shrink-0 text-danger" />,
    },
  };

  const style = variantStyles[variant] || variantStyles.info;

  return (
    <div
      role="alert"
      className={`p-3.5 rounded-sm border flex items-start gap-3 text-xs leading-relaxed ${style.bg} ${style.border} ${className}`}
    >
      <div className="mt-0.5">{style.icon}</div>
      <div className="flex-1">
        {title && <p className={`font-semibold mb-0.5 ${style.text}`}>{title}</p>}
        <div className="text-text">{children}</div>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-text-muted hover:text-text p-1 rounded-xs transition-colors shrink-0 cursor-pointer"
          aria-label="Dismiss alert"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

export const Toast = Alert;
