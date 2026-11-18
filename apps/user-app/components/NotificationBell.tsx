"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Bell } from "lucide-react";
import { Notification } from "@/types/notification";
import { NotificationDropdown } from "./NotificationDropdown";

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) throw new Error("Failed to fetch notifications");
      const data = await res.json();
      setNotifications(data.notifications ?? data.notification ?? []);
    } catch (err: any) {
      setError(err?.message || "Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  return (
    <div ref={containerRef} className="relative inline-flex items-center shrink-0">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="View notifications"
        aria-expanded={isOpen}
        style={{ width: 36, height: 36, minWidth: 36, minHeight: 36 }}
        className={`w-[36px] h-[36px] min-w-[36px] min-h-[36px] flex items-center justify-center shrink-0 rounded-md transition-all duration-150 relative cursor-pointer border ${
          isOpen
            ? "bg-primary-tint text-primary border-primary/30"
            : "bg-surface hover:bg-surface-subtle text-text-muted hover:text-text border-border"
        }`}
      >
        <Bell className="w-4 h-4" />

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-accent text-accent-fg text-[10px] font-bold font-mono px-1 min-w-[16px] h-[16px] rounded-full flex items-center justify-center border border-surface pointer-events-none z-10">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <NotificationDropdown
          notifications={notifications}
          loading={loading}
          error={error}
          unreadCount={unreadCount}
          onRetry={fetchNotifications}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
