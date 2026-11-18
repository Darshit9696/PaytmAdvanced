"use client";

import React from "react";

export interface AvatarProps {
  name: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  style?: React.CSSProperties;
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  size = "md",
  className = "",
  style,
}) => {
  const initial = (name || "?").trim().charAt(0).toUpperCase();

  const sizeClasses = {
    xs: "w-6 h-6 min-w-[24px] min-h-[24px] text-[10px]",
    sm: "w-8 h-8 min-w-[32px] min-h-[32px] text-xs",
    md: "w-10 h-10 min-w-[40px] min-h-[40px] text-sm",
    lg: "w-12 h-12 min-w-[48px] min-h-[48px] text-base",
    xl: "w-14 h-14 min-w-[56px] min-h-[56px] text-lg",
  };

  return (
    <div
      aria-label={name}
      style={style}
      className={`rounded-full bg-primary-tint text-primary font-semibold flex items-center justify-center border border-primary/20 shrink-0 aspect-square select-none ${sizeClasses[size]} ${className}`}
    >
      <span>{initial}</span>
    </div>
  );
};
