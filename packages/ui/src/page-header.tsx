"use client";

import React from "react";

export interface PageHeaderProps {
  title: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
  description?: string | React.ReactNode; // backwards compatibility
  breadcrumb?: { label: string; href?: string }[];
  actions?: React.ReactNode;
  badge?: React.ReactNode;
  borderBottom?: boolean;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  description,
  breadcrumb,
  actions,
  badge,
  borderBottom = true,
  className = "",
}) => {
  const sub = subtitle || description;

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
        borderBottom ? "pb-4 sm:pb-5 border-b border-border" : "pb-2"
      } ${className}`}
    >
      <div className="space-y-1 min-w-0">
        {breadcrumb && breadcrumb.length > 0 && (
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-text-faint mb-1">
            {breadcrumb.map((crumb, idx) => (
              <React.Fragment key={crumb.label + idx}>
                {crumb.href ? (
                  <a href={crumb.href} className="hover:text-text transition-colors">
                    {crumb.label}
                  </a>
                ) : (
                  <span className="text-text-muted font-medium">{crumb.label}</span>
                )}
                {idx < breadcrumb.length - 1 && <span>/</span>}
              </React.Fragment>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-semibold tracking-tight text-text">{title}</h1>
          {badge}
        </div>

        {sub && (
          <p className="text-xs sm:text-sm text-text-muted truncate max-w-2xl">
            {sub}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
};
