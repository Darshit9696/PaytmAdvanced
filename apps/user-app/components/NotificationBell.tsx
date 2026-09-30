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

  // Fetch notifications from the backend API
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/notifications");

      if (!res.ok) {
        throw new Error("Failed to fetch notifications");
      }

      const data = await res.json();
      // Ensure we read data.notifications as required, with safe fallback to empty array
      setNotifications(data.notifications ?? data.notification ?? []);
    } catch (err: any) {
      setError(err?.message || "Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch notifications when component mounts
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Handle outside click and Escape key to close the dropdown
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

  // Calculate unread count strictly from state
  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  return (
    <div ref={containerRef} className="relative inline-flex items-center">
      {/* Notification Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="View notifications"
        aria-expanded={isOpen}
        className={`p-2 rounded-xl transition-all relative cursor-pointer border ${
          isOpen
            ? "bg-blue-600/15 text-cyan-400 border-cyan-500/40 shadow-sm shadow-cyan-500/20"
            : "bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white border-slate-700/80"
        }`}
      >
        <Bell className="w-5 h-5" />

        {/* Small badge displayed when unreadCount > 0 */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-[10px] font-extrabold px-1.5 min-w-[18px] h-[18px] rounded-full flex items-center justify-center shadow-md shadow-blue-500/30 border-2 border-[#0b101d] pointer-events-none">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown Panel */}
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
