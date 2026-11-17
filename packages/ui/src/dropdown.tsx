"use client";

import React, { useState, useRef, useEffect } from "react";

export interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: "left" | "right";
  className?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  children,
  align = "right",
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      <div onClick={() => setIsOpen((prev) => !prev)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div
          className={`absolute ${align === "right" ? "right-0" : "left-0"} mt-1.5 w-56 rounded-md bg-surface border border-border shadow-lg py-1 z-50 focus:outline-none animate-in fade-in zoom-in-95 duration-100 ${className}`}
        >
          {children}
        </div>
      )}
    </div>
  );
};

export const DropdownItem: React.FC<{
  onClick?: () => void;
  icon?: React.ReactNode;
  danger?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}> = ({ onClick, icon, danger = false, disabled = false, children, className = "" }) => {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-left transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
        danger
          ? "text-danger hover:bg-danger-tint"
          : "text-text hover:bg-surface-subtle"
      } ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span className="flex-1 truncate">{children}</span>
    </button>
  );
};

export const DropdownDivider: React.FC = () => {
  return <div className="h-px bg-border my-1" />;
};
