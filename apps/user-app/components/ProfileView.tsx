"use client";

import React, { useState } from "react";
import { signOut } from "next-auth/react";
import { User, Phone, Mail, ShieldCheck, LogOut, Key, Copy, Check } from "lucide-react";

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
    <div className="max-w-3xl mx-auto space-y-6 font-sans">
      
      {/* 1. Profile Top Banner */}
      <div className="bg-[#0f172a] text-white rounded-2xl p-6 shadow-xl relative overflow-hidden border border-slate-800">
        <div className="flex flex-col sm:flex-row items-center gap-5 relative z-10">
          <div className="w-20 h-20 bg-blue-600/20 border-2 border-cyan-400 rounded-full flex items-center justify-center text-cyan-300 font-extrabold text-3xl uppercase shadow-md">
            {userName[0]}
          </div>
          
          <div className="text-center sm:text-left space-y-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-2xl font-bold tracking-tight text-white">{userName}</h2>
              <span className="flex items-center gap-1 text-[10px] bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-full font-semibold border border-emerald-500/20 uppercase tracking-wider">
                Verified Account
              </span>
            </div>
            
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-slate-400 font-mono">
              <span>Wallet ID: {userId}</span>
              <button 
                onClick={handleCopyId}
                className="p-1 hover:bg-slate-800 rounded transition-colors text-cyan-400 cursor-pointer"
                title="Copy Wallet ID"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Details Form Grid */}
      <div className="bg-[#0f172a] rounded-2xl border border-slate-800 shadow-sm p-6 space-y-5">
        <h3 className="font-bold text-slate-400 text-xs uppercase tracking-wider mb-2">Personal Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex items-center gap-3.5">
            <div className="p-2.5 bg-slate-800 rounded-lg text-cyan-400 border border-slate-700">
              <User className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Name</p>
              <p className="text-sm font-bold text-slate-100 mt-0.5">{userName}</p>
            </div>
          </div>

          <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex items-center gap-3.5">
            <div className="p-2.5 bg-slate-800 rounded-lg text-cyan-400 border border-slate-700">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mobile Number</p>
              <p className="text-sm font-bold text-slate-100 mt-0.5 font-mono">+91 {userPhone}</p>
            </div>
          </div>

          <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex items-center gap-3.5 md:col-span-2">
            <div className="p-2.5 bg-slate-800 rounded-lg text-cyan-400 border border-slate-700">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</p>
              <p className="text-sm font-bold text-slate-100 mt-0.5">{userEmail}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Account Actions / Security Panel */}
      <div className="bg-[#0f172a] rounded-2xl border border-slate-800 shadow-sm p-6 space-y-4">
        <h3 className="font-bold text-slate-400 text-xs uppercase tracking-wider">Security & Session</h3>
        
        <div className="divide-y divide-slate-800/80">
          <div className="flex items-center justify-between py-3.5 first:pt-0">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <div>
                <p className="text-sm font-bold text-slate-100">Wallet Encryption</p>
                <p className="text-xs text-slate-400">Authenticated user session active.</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between py-3.5">
            <div className="flex items-center gap-3">
              <Key className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-sm font-bold text-slate-100">Account Security</p>
                <p className="text-xs text-slate-400">Credentials encrypted via NextAuth.</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-cyan-400">
              Active
            </span>
          </div>

          <div className="flex items-center justify-between py-3.5 last:pb-0">
            <div className="flex items-center gap-3">
              <LogOut className="w-5 h-5 text-rose-400" />
              <div>
                <p className="text-sm font-bold text-slate-100">Sign Out</p>
                <p className="text-xs text-slate-400">Log out cleanly from this user session.</p>
              </div>
            </div>
            <button 
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="px-4 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}