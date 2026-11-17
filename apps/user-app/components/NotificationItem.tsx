"use client";

import React from "react";
import { ArrowUpRight, ArrowDownLeft, AlertCircle } from "lucide-react";
import { Notification, NotificationType } from "@/types/notification";

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead?: (id: number) => void;
}

export function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 0 || diffInSeconds < 60) {
      return "just now";
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) {
      return "yesterday";
    }

    if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
}

function getNotificationTypeDetails(type: NotificationType) {
  switch (type) {
    case "TRANSFER_SENT":
      return {
        icon: <ArrowUpRight className="w-3.5 h-3.5 text-danger" />,
        containerClass: "bg-danger-tint border-danger-border text-danger",
      };
    case "TRANSFER_RECEIVED":
      return {
        icon: <ArrowDownLeft className="w-3.5 h-3.5 text-success" />,
        containerClass: "bg-success-tint border-success-border text-success",
      };
    case "PAYMENT_FAILED":
    default:
      return {
        icon: <AlertCircle className="w-3.5 h-3.5 text-warning" />,
        containerClass: "bg-warning-tint border-warning-border text-warning",
      };
  }
}

export function NotificationItem({ notification, onMarkAsRead }: NotificationItemProps) {
  const { icon, containerClass } = getNotificationTypeDetails(notification.type);
  const isUnread = !notification.isRead;

  return (
    <div
      onClick={() => onMarkAsRead?.(notification.id)}
      className={`p-3.5 transition-colors flex items-start gap-3 relative cursor-pointer ${
        isUnread
          ? "bg-surface-subtle/80 hover:bg-surface-subtle"
          : "bg-surface hover:bg-surface-subtle/50"
      }`}
    >
      {/* Type Icon Chip */}
      <div
        className={`w-7 h-7 rounded-sm border flex items-center justify-center shrink-0 mt-0.5 ${containerClass}`}
      >
        {icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pr-1">
        <div className="flex items-center gap-1.5">
          {isUnread && (
            <span
              className="w-1.5 h-1.5 rounded-full bg-accent shrink-0"
              title="Unread"
            />
          )}
          <h4
            className={`text-xs tracking-tight truncate ${
              isUnread ? "font-semibold text-text" : "font-normal text-text-muted"
            }`}
          >
            {notification.title}
          </h4>
        </div>

        <p className="text-[11px] text-text-muted leading-relaxed mt-0.5 line-clamp-2 break-words">
          {notification.message}
        </p>

        <span className="text-[10px] text-text-faint font-mono tabular-nums mt-1 block">
          {formatRelativeTime(notification.createdAt)}
        </span>
      </div>
    </div>
  );
}
