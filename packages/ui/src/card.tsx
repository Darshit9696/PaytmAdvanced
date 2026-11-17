import React, { type JSX } from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  title?: string;
  href?: string;
  children: React.ReactNode;
}

export function Card({
  className = "",
  title,
  children,
  href,
  ...props
}: CardProps): JSX.Element {
  const baseClasses =
    "bg-surface border border-border rounded-md shadow-xs transition-colors overflow-hidden";

  if (href) {
    return (
      <a
        className={`${baseClasses} block p-5 hover:border-border-strong group ${className}`}
        href={href}
        rel="noopener noreferrer"
        target={href.startsWith("http") ? "_blank" : undefined}
      >
        {title && (
          <h2 className="text-base font-semibold text-text flex items-center justify-between mb-2">
            <span>{title}</span>
            <span className="text-text-muted group-hover:translate-x-0.5 transition-transform">
              →
            </span>
          </h2>
        )}
        <div className="text-sm text-text-muted leading-relaxed">{children}</div>
      </a>
    );
  }

  return (
    <div className={`${baseClasses} ${className}`} {...props}>
      {title && (
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-text">{title}</h3>
        </div>
      )}
      {children}
    </div>
  );
}

export function CardHeader({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`px-5 py-4 border-b border-border flex flex-col space-y-1.5 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={`text-base font-semibold text-text tracking-tight ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={`text-xs text-text-muted leading-relaxed ${className}`} {...props}>
      {children}
    </p>
  );
}

export function CardContent({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-5 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`px-5 py-3.5 border-t border-border bg-surface-subtle/50 flex items-center justify-between ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
