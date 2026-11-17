"use client";

import React from "react";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  circle?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = "",
  circle = false,
  ...props
}) => {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse bg-surface-subtle border border-border/50 ${
        circle ? "rounded-full" : "rounded-sm"
      } ${className}`}
      {...props}
    />
  );
};
