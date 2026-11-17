"use client";

import React from "react";

export interface AmountProps {
  /** The monetary value to display */
  value: number | string | null | undefined;
  /** Currency symbol, defaults to ₹ */
  currency?: string;
  /** Number of decimal places, defaults to 2 */
  decimals?: number;
  /** Explicit sign display: '+' | '-' | 'auto' | 'none' | 'positive' | 'negative' */
  sign?: "+" | "-" | "auto" | "none" | "positive" | "negative";
  /** Font size preset */
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "display";
  /** Font weight */
  weight?: "light" | "normal" | "medium" | "semibold" | "bold" | "extrabold";
  /** Semantic color variant */
  variant?: "default" | "success" | "danger" | "muted" | "primary";
  /** Whether to show a colored sign/value (green for +, red for -) */
  colored?: boolean;
  /** Custom className */
  className?: string;
}

export function formatINR(val: number, decimals: number = 2): string {
  if (!Number.isFinite(val)) return "0.00";
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(val);
}

export const Amount: React.FC<AmountProps> = ({
  value,
  currency = "₹",
  decimals = 2,
  sign = "none",
  size = "md",
  weight,
  variant,
  colored = false,
  className = "",
}) => {
  const numericValue = typeof value === "number" ? value : Number(value || 0);
  const isPositive = numericValue > 0;
  const isNegative = numericValue < 0;
  const absValue = Math.abs(numericValue);

  let signPrefix = "";
  if (sign === "+" || sign === "positive" || (sign === "auto" && isPositive)) {
    signPrefix = "+";
  } else if (sign === "-" || sign === "negative" || isNegative) {
    signPrefix = "-";
  }

  const formattedNumber = formatINR(absValue, decimals);

  const sizeClasses: Record<string, string> = {
    xs: "text-xs",
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
    "2xl": "text-2xl",
    "3xl": "text-3xl tracking-tight",
    "4xl": "text-3xl sm:text-4xl tracking-tight",
    display: "text-4xl sm:text-5xl md:text-[52px] tracking-tight leading-none",
  };

  const weightClasses: Record<string, string> = {
    light: "font-light",
    normal: "font-normal",
    medium: "font-medium",
    semibold: "font-semibold",
    bold: "font-bold",
    extrabold: "font-extrabold",
  };

  let colorClass = "";
  if (variant) {
    if (variant === "success") colorClass = "text-success";
    else if (variant === "danger") colorClass = "text-danger";
    else if (variant === "muted") colorClass = "text-text-muted";
    else if (variant === "primary") colorClass = "text-primary";
  } else if (colored) {
    if (signPrefix === "+") colorClass = "text-success";
    else if (signPrefix === "-") colorClass = "text-danger";
  }

  const defaultWeight = "font-normal";
  const resolvedWeight = weight ? weightClasses[weight] : defaultWeight;

  return (
    <span
      className={`font-mono tabular-nums inline-flex items-baseline ${sizeClasses[size] || sizeClasses.md} ${resolvedWeight} ${colorClass} ${className}`}
    >
      {signPrefix && <span className="mr-0.5 select-none">{signPrefix}</span>}
      {currency && <span className="mr-0.5 select-none font-sans font-normal opacity-90">{currency}</span>}
      <span>{formattedNumber}</span>
    </span>
  );
};
