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
      return `${diffInMinutes} ${diffInMinutes === 1 ? "minute" : "minutes"} ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} ${diffInHours === 1 ? "hour" : "hours"} ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) {
      return "yesterday";
    }

    if (diffInDays < 7) {
      return `${diffInDays} days ago`;
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
        icon: <ArrowUpRight className="w-4 h-4 text-rose-400" />,
        containerClass: "bg-rose-500/10 border-rose-500/20 text-rose-400",
      };
    case "TRANSFER_RECEIVED":
      return {
        icon: <ArrowDownLeft className="w-4 h-4 text-emerald-400" />,
        containerClass: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
      };
    case "PAYMENT_FAILED":
    default:
      return {
        icon: <AlertCircle className="w-4 h-4 text-amber-400" />,
        containerClass: "bg-amber-500/10 border-amber-500/20 text-amber-400",
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
          ? "bg-slate-800/40 hover:bg-slate-800/60"
          : "bg-transparent hover:bg-slate-850/30"
      }`}
    >
      {/* Visual type icon badge */}
      <div
        className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${containerClass}`}
      >
        {icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pr-2">
        <div className="flex items-center gap-1.5">
          {isUnread && (
            <span
              className="w-2 h-2 rounded-full bg-cyan-400 shrink-0 shadow-sm shadow-cyan-400/50"
              title="Unread"
            />
          )}
          <h4
            className={`text-xs tracking-tight truncate ${
              isUnread ? "font-bold text-white" : "font-medium text-slate-300"
            }`}
          >
            {notification.title}
          </h4>
        </div>

        <p className="text-[11px] text-slate-300/90 leading-relaxed mt-1 line-clamp-2 break-words">
          {notification.message}
        </p>

        <span className="text-[10px] text-slate-400 font-mono mt-1.5 block">
          {formatRelativeTime(notification.createdAt)}
        </span>
      </div>
    </div>
  );
}
