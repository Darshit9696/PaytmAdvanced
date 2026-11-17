"use client";

import React, { useState } from "react";
import { signOut } from "next-auth/react";
import { User, Phone, Mail, ShieldCheck, LogOut, Key, Copy, Check } from "lucide-react";
import { Avatar, Button } from "@repo/ui";

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
    <div className="max-w-2xl mx-auto space-y-6 font-sans">
      {/* 1. Profile Header Banner */}
      <div className="bg-surface border border-border rounded-[10px] p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center gap-5">
          <Avatar name={userName} size="xl" />

          <div className="text-center sm:text-left space-y-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl font-semibold tracking-tight text-text">{userName}</h2>
              <span className="flex items-center gap-1 text-[11px] bg-success-subtle/50 text-success px-2.5 py-0.5 rounded-full font-medium border border-success/30">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified User
              </span>
            </div>

            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-text-muted font-mono">
              <span>Wallet Ledger ID: {userId}</span>
              <button
                onClick={handleCopyId}
                className="p-1 hover:bg-surface-subtle rounded transition-colors text-primary cursor-pointer border border-border"
                title="Copy Wallet ID"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-success" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Personal Information Grid */}
      <div className="bg-surface rounded-[10px] border border-border shadow-xs p-6 space-y-4">
        <h3 className="font-semibold text-text-muted text-xs uppercase tracking-wider">
          Personal Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <div className="p-3.5 bg-surface-subtle rounded-[8px] border border-border flex items-center gap-3">
            <div className="p-2 bg-surface rounded-[6px] text-primary border border-border">
              <User className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                Full Name
              </p>
              <p className="text-sm font-medium text-text mt-0.5">{userName}</p>
            </div>
          </div>

          <div className="p-3.5 bg-surface-subtle rounded-[8px] border border-border flex items-center gap-3">
            <div className="p-2 bg-surface rounded-[6px] text-primary border border-border">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                Mobile Number
              </p>
              <p className="text-sm font-medium text-text mt-0.5 font-mono">+91 {userPhone}</p>
            </div>
          </div>

          <div className="p-3.5 bg-surface-subtle rounded-[8px] border border-border flex items-center gap-3 md:col-span-2">
            <div className="p-2 bg-surface rounded-[6px] text-primary border border-border">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                Email Address
              </p>
              <p className="text-sm font-medium text-text mt-0.5">{userEmail}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Security & Session */}
      <div className="bg-surface rounded-[10px] border border-border shadow-xs p-6 space-y-4">
        <h3 className="font-semibold text-text-muted text-xs uppercase tracking-wider">
          Security & Session
        </h3>

        <div className="divide-y divide-border">
          <div className="flex items-center justify-between py-3 first:pt-0">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-4 h-4 text-success" />
              <div>
                <p className="text-sm font-medium text-text">Double-Entry Cryptographic Balance</p>
                <p className="text-xs text-text-muted">Balance enforced via balanced database ledger.</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <Key className="w-4 h-4 text-text-muted" />
              <div>
                <p className="text-sm font-medium text-text">Authentication Protocol</p>
                <p className="text-xs text-text-muted">Secure JWT session token encrypted via NextAuth.</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-primary font-mono bg-primary/10 px-2 py-0.5 rounded-[4px] border border-primary/20">
              Active
            </span>
          </div>

          <div className="flex items-center justify-between py-3 last:pb-0">
            <div className="flex items-center gap-3">
              <LogOut className="w-4 h-4 text-danger" />
              <div>
                <p className="text-sm font-medium text-text">Sign Out</p>
                <p className="text-xs text-text-muted">Terminate active session credentials from this device.</p>
              </div>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
