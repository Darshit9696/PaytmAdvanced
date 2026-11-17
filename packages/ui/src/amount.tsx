"use client";

import React from "react";

export interface AmountProps {
  /** The monetary value to display */
  value: number | string | null | undefined;
  /** Currency symbol, defaults to ₹ */
  currency?: string;
  /** Number of decimal places, defaults to 2 */
  decimals?: number;
  /** Explicit sign display: '+' | '-' | 'auto' | 'none' */
  sign?: "+" | "-" | "auto" | "none";
  /** Font size preset */
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "display";
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
  colored = false,
  className = "",
}) => {
  const numericValue = typeof value === "number" ? value : Number(value || 0);
  const isPositive = numericValue > 0;
  const isNegative = numericValue < 0;
  const absValue = Math.abs(numericValue);

  let signPrefix = "";
  if (sign === "+" || (sign === "auto" && isPositive)) {
    signPrefix = "+";
  } else if (sign === "-" || isNegative) {
    signPrefix = "-";
  }

  const formattedNumber = formatINR(absValue, decimals);

  const sizeClasses: Record<string, string> = {
    xs: "text-xs",
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg font-semibold",
    xl: "text-xl font-bold tracking-tight",
    "2xl": "text-2xl font-bold tracking-tight",
    display: "text-3xl sm:text-4xl font-light tracking-tight",
  };

  let colorClass = "";
  if (colored) {
    if (signPrefix === "+") colorClass = "text-success";
    else if (signPrefix === "-") colorClass = "text-danger";
  }

  return (
    <span
      className={`font-mono tabular-nums inline-flex items-baseline ${sizeClasses[size] || sizeClasses.md} ${colorClass} ${className}`}
    >
      {signPrefix && <span className="mr-0.5 select-none">{signPrefix}</span>}
      {currency && <span className="mr-0.5 select-none font-sans font-normal opacity-90">{currency}</span>}
      <span>{formattedNumber}</span>
    </span>
  );
};
