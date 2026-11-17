"use client";

import React from "react";

export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  stickyHeader?: boolean;
}

export function Table({
  className = "",
  stickyHeader = false,
  children,
  ...props
}: TableProps) {
  return (
    <div className="w-full overflow-x-auto">
      <table
        className={`w-full text-left text-xs border-collapse ${className}`}
        {...props}
      >
        {children}
      </table>
    </div>
  );
}

export function TableHeader({
  className = "",
  sticky = false,
  children,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement> & { sticky?: boolean }) {
  return (
    <thead
      className={`border-b border-border bg-surface-subtle text-text-muted text-[11px] font-semibold tracking-wide uppercase ${
        sticky ? "sticky top-0 z-10 backdrop-blur-xs" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </thead>
  );
}

export function TableBody({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody className={`divide-y divide-border ${className}`} {...props}>
      {children}
    </tbody>
  );
}

export function TableRow({
  className = "",
  hoverable = true,
  children,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement> & { hoverable?: boolean }) {
  return (
    <tr
      className={`transition-colors duration-100 ${
        hoverable ? "hover:bg-surface-subtle/70" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </tr>
  );
}

export function TableHead({
  className = "",
  align = "left",
  children,
  ...props
}: React.ThHTMLAttributes<HTMLTableCellElement> & { align?: "left" | "center" | "right" }) {
  const alignClasses = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  return (
    <th
      className={`py-3 px-4 select-none font-semibold ${alignClasses[align]} ${className}`}
      {...props}
    >
      {children}
    </th>
  );
}

export function TableCell({
  className = "",
  align = "left",
  tabular = false,
  children,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement> & {
  align?: "left" | "center" | "right";
  tabular?: boolean;
}) {
  const alignClasses = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  return (
    <td
      className={`py-3.5 px-4 text-text ${tabular ? "font-mono tabular-nums" : ""} ${alignClasses[align]} ${className}`}
      {...props}
    >
      {children}
    </td>
  );
}

export function TableEmpty({
  colSpan,
  title = "No records found",
  description,
  className = "",
}: {
  colSpan: number;
  title?: string;
  description?: string;
  className?: string;
}) {
  return (
    <tr>
      <td colSpan={colSpan} className={`py-12 text-center ${className}`}>
        <p className="text-sm font-medium text-text">{title}</p>
        {description && (
          <p className="text-xs text-text-muted mt-1 max-w-sm mx-auto">
            {description}
          </p>
        )}
      </td>
    </tr>
  );
}
