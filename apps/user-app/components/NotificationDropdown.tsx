"use client";

import React from "react";
import { Bell, BellOff, RefreshCw, AlertCircle } from "lucide-react";
import { Notification } from "@/types/notification";
import { NotificationItem } from "./NotificationItem";

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
      className="absolute right-0 top-full mt-2 w-[330px] sm:w-[380px] max-w-[calc(100vw-2rem)] bg-[#0f172a] border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150"
    >
      {/* Dropdown Header */}
      <div className="px-4 py-3 bg-[#0b101d] border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-white tracking-tight">Notifications</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-blue-500/15 text-cyan-400 border border-blue-500/25 text-[10px] font-bold">
              {unreadCount} new
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={onRetry}
          disabled={loading}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          title="Refresh notifications"
          aria-label="Refresh notifications"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-cyan-400" : ""}`} />
        </button>
      </div>

      {/* Dropdown Body */}
      <div className="flex-1 max-h-[380px] overflow-y-auto">
        {/* 1. LOADING STATE */}
        {loading && notifications.length === 0 && (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-start gap-3 p-2 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-slate-800/80 shrink-0" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-3 bg-slate-800 rounded w-2/3" />
                  <div className="h-2.5 bg-slate-800/70 rounded w-full" />
                  <div className="h-2 bg-slate-800/50 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 2. ERROR STATE */}
        {!loading && error && (
          <div className="p-6 text-center space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-rose-300">Unable to load notifications</p>
              <p className="text-[11px] text-slate-400 leading-relaxed px-2">{error}</p>
            </div>
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* 3. EMPTY STATE */}
        {!loading && !error && notifications.length === 0 && (
          <div className="py-10 px-4 text-center space-y-2.5">
            <div className="w-11 h-11 rounded-2xl bg-slate-800/50 border border-slate-800 text-slate-500 flex items-center justify-center mx-auto">
              <BellOff className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-200">No notifications yet</p>
              <p className="text-[11px] text-slate-400 mt-0.5 max-w-[200px] mx-auto">
                Transactions and account activity will appear here.
              </p>
            </div>
          </div>
        )}

        {/* 4. SUCCESS LIST (Preserves backend order) */}
        {!error && notifications.length > 0 && (
          <div className="divide-y divide-slate-800/70">
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

      {/* Dropdown Footer */}
      {notifications.length > 0 && (
        <div className="px-4 py-2 bg-[#0b101d] border-t border-slate-800/80 text-[10px] text-slate-400 text-center">
          {unreadCount === 0 ? "All caught up" : `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`}
        </div>
      )}
    </div>
  );
}
