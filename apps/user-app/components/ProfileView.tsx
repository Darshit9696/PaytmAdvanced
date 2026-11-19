"use client";

import React, { useState } from "react";
import { signOut } from "next-auth/react";
import { ShieldCheck, LogOut, Key, Copy, Check, Moon } from "lucide-react";
import { Avatar, Button, ThemeToggle, PageHeader } from "@repo/ui";

interface ProfileViewProps {
  user: {
    id: number;
    name: string | null;
    email: string | null;
    number: string;
  };
}

export default function ProfileView({ user }: ProfileViewProps) {
  const [copied, setCopied] = useState(false);

  const userName = user.name || "PayPulse User";
  const userEmail = user.email || "No email linked";
  const userPhone = user.number || "No phone linked";
  const userId = user.id.toString();

  const handleCopyId = () => {
    navigator.clipboard.writeText(userId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-[1100px] w-full space-y-6 font-sans">
      <PageHeader
        title="Profile"
        subtitle="Personal digital wallet account details and session security"
      />

      {/* 1. Profile Header Banner */}
      <div className="bg-surface border border-border rounded-[10px] p-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center gap-5">
          <div className="shrink-0 flex items-center justify-center">
            <Avatar
              name={userName}
              size="xl"
              className="w-[56px] h-[56px] min-w-[56px] min-h-[56px] shrink-0 aspect-square rounded-full text-lg"
              style={{ width: 56, height: 56, minWidth: 56, minHeight: 56 }}
            />
          </div>

          <div className="text-center sm:text-left space-y-1">
            <h2 className="text-xl font-semibold tracking-tight text-text">{userName}</h2>
            <p className="text-xs text-text-muted">Personal digital wallet account</p>
          </div>
        </div>
      </div>

      {/* 2. Personal Information Definition List */}
      <div className="bg-surface rounded-[10px] border border-border p-6 space-y-4">
        <h3 className="font-medium text-text-muted text-xs">
          Personal details
        </h3>

        <dl className="divide-y divide-border">
          <div className="py-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 first:pt-0">
            <dt className="text-xs text-text-muted">Mobile phone</dt>
            <dd className="text-sm text-text font-mono tabular-nums">+91 {userPhone}</dd>
          </div>
          <div className="py-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
            <dt className="text-xs text-text-muted">Email address</dt>
            <dd className="text-sm text-text">{userEmail}</dd>
          </div>
          <div className="py-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 last:pb-0">
            <dt className="text-xs text-text-muted">Wallet account ID</dt>
            <dd className="text-sm text-text font-mono tabular-nums flex items-center gap-2">
              <span>#{userId}</span>
              <button
                type="button"
                onClick={handleCopyId}
                className="p-1 hover:bg-surface-subtle rounded transition-colors text-primary cursor-pointer border border-border inline-flex items-center justify-center"
                title="Copy Wallet ID"
                aria-label="Copy Wallet ID"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-success" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-text-muted hover:text-primary" />
                )}
              </button>
            </dd>
          </div>
        </dl>
      </div>

      {/* 3. Appearance & Theme Preference */}
      <div className="bg-surface rounded-[10px] border border-border p-6 space-y-4">
        <h3 className="font-medium text-text-muted text-xs">
          Appearance & theme
        </h3>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
          <div className="flex items-center gap-3">
            <Moon className="w-4 h-4 text-primary" />
            <div>
              <p className="text-sm font-medium text-text">Color theme</p>
              <p className="text-xs text-text-muted">
                Choose between warm stone light mode, calm carbon dark mode, or follow system default.
              </p>
            </div>
          </div>
          <ThemeToggle variant="segmented" />
        </div>
      </div>

      {/* 4. Security & Session */}
      <div className="bg-surface rounded-[10px] border border-border p-6 space-y-4">
        <h3 className="font-medium text-text-muted text-xs">
          Security and session
        </h3>

        <div className="divide-y divide-border">
          <div className="flex items-center justify-between py-3 first:pt-0">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <div>
                <p className="text-sm font-medium text-text">Ledger-verified balance</p>
                <p className="text-xs text-text-muted">All transactions are balanced and verified against the ledger.</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <Key className="w-4 h-4 text-text-muted" />
              <div>
                <p className="text-sm font-medium text-text">Signed in with email and password</p>
                <p className="text-xs text-text-muted">Session secured via encrypted credentials.</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between py-3 last:pb-0">
            <div className="flex items-center gap-3">
              <LogOut className="w-4 h-4 text-danger" />
              <div>
                <p className="text-sm font-medium text-text">Sign Out</p>
                <p className="text-xs text-text-muted">Sign out of this device.</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-danger hover:bg-danger-subtle hover:border-danger/30 border-border"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
