"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, ArrowRight, ShieldCheck, Building2 } from "lucide-react";

export default function MerchantLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid merchant email address or password");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#090d16] px-4 py-8 font-sans selection:bg-indigo-500 selection:text-white">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-[#0f172a] shadow-2xl border border-slate-800">

        {/* Header / Brand Banner */}
        <div className="bg-slate-900 px-8 pt-8 pb-6 border-b border-slate-800 text-white">
          <div className="flex items-center justify-between mb-3">
            <Link href="http://localhost:3000" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-500 p-0.5">
                <div className="w-full h-full bg-[#090d16] rounded-[9px] flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-indigo-400" />
                </div>
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">PayPulse</span>
            </Link>
            <span className="flex items-center gap-1 text-[11px] bg-indigo-500/10 text-indigo-300 px-2.5 py-1 rounded-full border border-indigo-500/20">
              <ShieldCheck className="w-3.5 h-3.5" /> Merchant Portal
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Sign in to your standalone merchant account to view settlements and manage balance.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="p-8 space-y-5">
          {error && (
            <div className="p-3 text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl">
              ⚠️ {error}
            </div>
          )}

          {/* Email Field */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Merchant Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                placeholder="merchant@business.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 transition-all text-sm"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 transition-all text-sm"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer text-sm"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Authenticating Merchant...
              </span>
            ) : (
              <>
                Login to Merchant Console <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Link to Signup */}
          <div className="pt-4 text-center text-xs text-slate-400 border-t border-slate-800/80">
            Don't have a merchant account?{" "}
            <Link href="/signup" className="font-semibold text-indigo-400 hover:underline">
              Register Merchant Account
            </Link>
          </div>

          {/* Cross link to Personal App */}
          <div className="pt-1 text-center text-[11px] text-slate-400">
            Need a personal wallet?{" "}
            <a href="http://localhost:3000/login" className="font-semibold text-cyan-400 hover:underline">
              Personal App Login
            </a>
          </div>
        </form>

      </div>
    </div>
  );
}
