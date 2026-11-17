"use client";

import React from "react";
import { Bell, BellOff, RefreshCw, AlertCircle } from "lucide-react";
import { Notification } from "@/types/notification";
import { NotificationItem } from "./NotificationItem";
import { Badge } from "@repo/ui/badge";

interface NotificationDropdownProps {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
  unreadCount: number;
  onRetry: () => void;
  onClose?: () => void;
  onMarkAsRead?: (id: number) => void;
}

export function NotificationDropdown({
  notifications,
  loading,
  error,
  unreadCount,
  onRetry,
  onMarkAsRead,
}: NotificationDropdownProps) {
  return (
    <div
      role="dialog"
      aria-label="Notifications panel"
      className="absolute right-0 top-full mt-2 w-[340px] sm:w-[380px] max-w-[calc(100vw-2rem)] bg-surface border border-border rounded-md shadow-modal z-50 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150"
    >
      {/* Dropdown Header */}
      <div className="px-4 py-3 bg-surface-subtle border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-semibold text-text uppercase tracking-wider">
            Notifications
          </h3>
          {unreadCount > 0 && (
            <Badge variant="accent" size="sm">
              {unreadCount} new
            </Badge>
          )}
        </div>

        <button
          type="button"
          onClick={onRetry}
          disabled={loading}
          className="p-1 text-text-faint hover:text-text rounded-xs transition-colors cursor-pointer disabled:opacity-50"
          title="Refresh notifications"
          aria-label="Refresh notifications"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-primary" : ""}`} />
        </button>
      </div>

      {/* Dropdown Body */}
      <div className="flex-1 max-h-[360px] overflow-y-auto divide-y divide-border">
        {/* Loading */}
        {loading && notifications.length === 0 && (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-start gap-3 p-2 animate-pulse">
                <div className="w-7 h-7 rounded-sm bg-surface-subtle border border-border shrink-0" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-3 bg-surface-subtle rounded-xs w-2/3" />
                  <div className="h-2.5 bg-surface-subtle/80 rounded-xs w-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="p-6 text-center space-y-3">
            <div className="w-8 h-8 rounded-sm bg-danger-tint border border-danger-border text-danger flex items-center justify-center mx-auto">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-text">Unable to load notifications</p>
              <p className="text-[11px] text-text-muted px-2">{error}</p>
            </div>
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-surface hover:bg-surface-subtle text-text border border-border text-xs font-medium transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3 h-3 text-text-muted" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && notifications.length === 0 && (
          <div className="py-10 px-4 text-center space-y-2">
            <div className="w-9 h-9 rounded-sm bg-surface-subtle border border-border text-text-faint flex items-center justify-center mx-auto">
              <BellOff className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-medium text-text">No notifications</p>
              <p className="text-[11px] text-text-muted mt-0.5">
                Transfers and account activity will appear here.
              </p>
            </div>
          </div>
        )}

        {/* List */}
        {!error && notifications.length > 0 && (
          <div>
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={onMarkAsRead}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="px-4 py-2 bg-surface-subtle/50 border-t border-border text-[10px] text-text-muted text-center font-mono">
          {unreadCount === 0 ? "All caught up" : `${unreadCount} unread`}
        </div>
      )}
    </div>
  );
}
