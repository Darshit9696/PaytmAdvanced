"use client";

import React from "react";

export type BadgeVariant =
  | "neutral"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "primary"
  | "accent";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  dot?: boolean;
  size?: "sm" | "md";
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = "neutral",
  dot = false,
  size = "md",
  children,
  className = "",
  ...props
}) => {
  const variantStyles: Record<BadgeVariant, { bg: string; dotColor: string }> = {
    neutral: {
      bg: "bg-surface-subtle text-text-muted border-border",
      dotColor: "bg-text-faint",
    },
    success: {
      bg: "bg-success-tint text-success border-success-border",
      dotColor: "bg-success",
    },
    warning: {
      bg: "bg-warning-tint text-warning border-warning-border",
      dotColor: "bg-warning",
    },
    danger: {
      bg: "bg-danger-tint text-danger border-danger-border",
      dotColor: "bg-danger",
    },
    info: {
      bg: "bg-info-tint text-info border-info-border",
      dotColor: "bg-info",
    },
    primary: {
      bg: "bg-primary-tint text-primary border-primary/20",
      dotColor: "bg-primary",
    },
    accent: {
      bg: "bg-accent/20 text-text border-accent-hover/40",
      dotColor: "bg-accent",
    },
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-[11px]",
    md: "px-2.5 py-1 text-xs",
  };

  const current = variantStyles[variant] || variantStyles.neutral;

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-sm border select-none ${current.bg} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${current.dotColor}`} />}
      <span>{children}</span>
    </span>
  );
};

export const StatusPill = Badge;
