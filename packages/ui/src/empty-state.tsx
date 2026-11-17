"use client";

import React from "react";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = "",
}) => {
  return (
    <div
      className={`py-12 px-4 text-center flex flex-col items-center justify-center space-y-3 ${className}`}
    >
      {icon && (
        <div className="w-10 h-10 rounded-md bg-surface-subtle border border-border flex items-center justify-center text-text-muted mb-1 shadow-xs">
          {icon}
        </div>
      )}
      <div className="space-y-1 max-w-sm">
        <h3 className="text-sm font-semibold text-text">{title}</h3>
        {description && (
          <p className="text-xs text-text-muted leading-relaxed">{description}</p>
        )}
      </div>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
};
