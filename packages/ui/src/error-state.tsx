"use client";

import React from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "./button";

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Something went wrong",
  message = "Failed to load data. Please check your network and try again.",
  onRetry,
  className = "",
}) => {
  return (
    <div
      className={`p-6 rounded-md border border-danger-border bg-danger-tint text-center flex flex-col items-center justify-center space-y-3 ${className}`}
    >
      <div className="w-10 h-10 rounded-md bg-surface border border-danger-border text-danger flex items-center justify-center shadow-xs">
        <AlertCircle className="w-5 h-5" />
      </div>

      <div className="space-y-1 max-w-sm">
        <h4 className="text-sm font-semibold text-text">{title}</h4>
        <p className="text-xs text-text-muted leading-relaxed">{message}</p>
      </div>

      {onRetry && (
        <div className="pt-1">
          <Button
            size="sm"
            variant="secondary"
            onClick={onRetry}
            icon={<RotateCcw className="w-3.5 h-3.5 text-text-muted" />}
          >
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
};
