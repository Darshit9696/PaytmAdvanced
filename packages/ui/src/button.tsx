"use client";

import React, { forwardRef } from "react";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "accent" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  appName?: string; // backwards compatibility
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className = "",
      variant = "primary",
      size = "md",
      loading = false,
      disabled = false,
      icon,
      iconRight,
      appName,
      onClick,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-md transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98] select-none whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2";

    const variantStyles: Record<string, string> = {
      primary:
        "bg-primary text-primary-fg hover:bg-primary-hover border border-primary",
      secondary:
        "bg-surface text-text hover:bg-surface-subtle border border-border",
      outline:
        "bg-transparent text-text hover:bg-surface-subtle border border-border",
      ghost:
        "bg-transparent text-text-muted hover:text-text hover:bg-surface-subtle border border-transparent",
      accent:
        "bg-accent text-accent-fg hover:bg-accent-hover font-medium border border-accent-hover/40",
      danger:
        "bg-danger text-white hover:opacity-90 border border-danger",
    };

    const sizeStyles: Record<string, string> = {
      sm: "h-9 px-3.5 text-xs gap-2",
      md: "h-10 px-4 text-sm gap-2",
      lg: "h-12 px-6 text-base gap-2.5",
    };

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (appName && !onClick) {
        alert(`Hello from your ${appName} app!`);
        return;
      }
      onClick?.(e);
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        onClick={handleClick}
        className={`${baseStyles} ${variantStyles[variant] || variantStyles.primary} ${sizeStyles[size] || sizeStyles.md} ${className}`}
        {...props}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin text-current shrink-0" />
        ) : (
          icon && <span className="shrink-0 inline-flex items-center">{icon}</span>
        )}
        <span className="inline-flex items-center gap-2 whitespace-nowrap">{children}</span>
        {!loading && iconRight && <span className="shrink-0 inline-flex items-center">{iconRight}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";
