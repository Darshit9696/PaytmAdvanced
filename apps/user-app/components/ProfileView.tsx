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

  // Fallback fallbacks if database values resolve empty
  const userName = user.name || "Paytm User";
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
      
      {/* 1. Profile Top Banner / Hero */}
      <div className="bg-[#002e6e] text-white rounded-2xl p-6 shadow-xl relative overflow-hidden border border-slate-800/20">
        <div className="flex flex-col sm:flex-row items-center gap-5 relative z-10">
          {/* Avatar Icon */}
          <div className="w-20 h-20 bg-white/10 border-2 border-[#00baf2] rounded-full flex items-center justify-center text-white font-black text-3xl uppercase shadow-md backdrop-blur-sm">
            {userName[0]}
          </div>
          
          {/* Main Titles */}
          <div className="text-center sm:text-left space-y-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-2xl font-black tracking-tight">{userName}</h2>
              <span className="flex items-center gap-1 text-[10px] bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full font-bold border border-emerald-500/30 uppercase tracking-wider">
                Verified Account
              </span>
            </div>
            
            {/* Interactive User Account ID */}
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-cyan-200/80 font-mono">
              <span>Wallet ID: {userId}</span>
              <button 
                onClick={handleCopyId}
                className="p-1 hover:bg-white/10 rounded transition-colors text-cyan-300 cursor-pointer"
                title="Copy Wallet ID"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Details Form Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
        <h3 className="font-bold text-slate-400 text-xs uppercase tracking-wider mb-2">Personal Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name Display Box */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center gap-3.5">
            <div className="p-2.5 bg-white rounded-lg text-slate-400 border border-slate-200">
              <User className="w-5 h-5 text-[#002e6e]" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Name</p>
              <p className="text-sm font-bold text-slate-800 mt-0.5">{userName}</p>
            </div>
          </div>

          {/* Phone Display Box - Now using real direct DB values! */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center gap-3.5">
            <div className="p-2.5 bg-white rounded-lg text-slate-400 border border-slate-200">
              <Phone className="w-5 h-5 text-[#002e6e]" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mobile Number</p>
              <p className="text-sm font-bold text-slate-800 mt-0.5 font-mono">+91 {userPhone}</p>
            </div>
          </div>

          {/* Email Display Box */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center gap-3.5 md:col-span-2">
            <div className="p-2.5 bg-white rounded-lg text-slate-400 border border-slate-200">
              <Mail className="w-5 h-5 text-[#002e6e]" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</p>
              <p className="text-sm font-bold text-slate-800 mt-0.5">{userEmail}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Account Actions / Security Panel */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h3 className="font-bold text-slate-400 text-xs uppercase tracking-wider">Security & Preferences</h3>
        
        <div className="divide-y divide-slate-100">
          {/* Encryption Notice */}
          <div className="flex items-center justify-between py-3 first:pt-0">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <div>
                <p className="text-sm font-bold text-slate-800">256-Bit Wallet Encryption</p>
                <p className="text-xs text-slate-400">Your funds and endpoints are actively secure.</p>
              </div>
            </div>
          </div>

          {/* Password Mock Option */}
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <Key className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-sm font-bold text-slate-800">Account Password</p>
                <p className="text-xs text-slate-400">Change or reset your authentication code.</p>
              </div>
            </div>
            <button className="text-xs font-bold text-[#00baf2] hover:underline cursor-pointer">
              Update
            </button>
          </div>

          {/* Logout Action Row */}
          <div className="flex items-center justify-between py-3 last:pb-0">
            <div className="flex items-center gap-3">
              <LogOut className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-sm font-bold text-slate-800">Terminate Active Session</p>
                <p className="text-xs text-slate-400">Log out cleanly from this browser window.</p>
              </div>
            </div>
            <button 
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="px-4 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200/60 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}