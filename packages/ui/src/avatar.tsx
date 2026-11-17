"use client";

import React from "react";

export interface AvatarProps {
  name: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  size = "md",
  className = "",
}) => {
  const initial = (name || "?").trim().charAt(0).toUpperCase();

  const sizeClasses = {
    xs: "w-6 h-6 text-[10px]",
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-16 h-16 text-xl",
  };

  return (
    <div
      aria-label={name}
      className={`rounded-full bg-primary-tint text-primary font-semibold flex items-center justify-center border border-primary/20 shrink-0 select-none ${sizeClasses[size]} ${className}`}
    >
      <span>{initial}</span>
    </div>
  );
};
