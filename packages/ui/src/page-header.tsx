"use client";

import React from "react";

export interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumb?: { label: string; href?: string }[];
  actions?: React.ReactNode;
  badge?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  breadcrumb,
  actions,
  badge,
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border ${className}`}
    >
      <div className="space-y-1">
        {breadcrumb && breadcrumb.length > 0 && (
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-text-faint mb-1.5">
            {breadcrumb.map((crumb, idx) => (
              <React.Fragment key={crumb.label + idx}>
                {crumb.href ? (
                  <a
                    href={crumb.href}
                    className="hover:text-text transition-colors"
                  >
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

        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-text">{title}</h1>
          {badge}
        </div>

        {description && (
          <p className="text-xs text-text-muted leading-relaxed max-w-2xl">{description}</p>
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
