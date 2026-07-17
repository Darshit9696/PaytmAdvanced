"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Phone, Lock, ArrowRight, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      phone,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid phone number or password");
      return;
    }

    router.push("/dashboard");
    router.refresh(); // Ensure session state updates instantly
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f4f7fa] px-4 py-8 font-sans">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl border border-gray-100">
        
        {/* Header / Brand Banner */}
        <div className="bg-[#002e6e] px-8 pt-10 pb-8 text-white">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-black tracking-tight text-white">
              Paytm 
            </h1>
            <span className="flex items-center gap-1 text-xs bg-white/10 text-cyan-200 px-2.5 py-1 rounded-full backdrop-blur-sm">
              <ShieldCheck className="w-3.5 h-3.5" /> Secure Login
            </span>
          </div>
          <p className="text-sm text-gray-200">
            Enter your credentials to access your digital wallet & account dashboard.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="p-8 space-y-5">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg animate-shake">
              {error}
            </div>
          )}

          {/* Phone Number Field */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
              Phone Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Phone className="w-5 h-5" />
              </div>
              <input
                type="tel"
                placeholder="Enter 10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00baf2] focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00baf2] focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 px-4 bg-[#00baf2] hover:bg-[#00a3d9] active:bg-[#008cc0] text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Authenticating...
              </span>
            ) : (
              <>
                Login to Dashboard <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>

          {/* Footer Info */}
          <div className="pt-4 text-center text-xs text-gray-400 border-t border-gray-100">
            Encrypted 256-bit SSL Connection
          </div>
        </form>

      </div>
    </div>
  );
}