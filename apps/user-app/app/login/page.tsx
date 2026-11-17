"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Phone, Lock, ArrowRight, ShieldCheck, Check } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Field } from "@repo/ui/field";
import { Alert } from "@repo/ui/toast";

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
      setError("Invalid phone number or password. Please verify your credentials.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-4xl bg-surface border border-border rounded-lg shadow-soft overflow-hidden grid lg:grid-cols-12 min-h-[560px]">
        
        {/* Left Side: Calm Ink-Green Brand Panel */}
        <div className="lg:col-span-5 bg-[#0F3D33] text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle line-grid pattern */}
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(to right, #FFFFFF 1px, transparent 1px), linear-gradient(to bottom, #FFFFFF 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />

          <div className="relative z-10 space-y-6">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-sm bg-accent text-accent-fg flex items-center justify-center font-bold text-sm tracking-tight shadow-xs select-none">
                P
              </div>
              <span className="text-base font-bold tracking-tight text-white">PayPulse</span>
            </Link>

            <div className="space-y-2 pt-8">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-white/10 text-accent text-[11px] font-medium border border-white/15">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Personal Account</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-snug">
                Every rupee, quietly accounted for.
              </h1>
              <p className="text-xs text-white/70 leading-relaxed pt-1">
                Precision peer-to-peer transfers backed by continuous double-entry ledger verification.
              </p>
            </div>
          </div>

          {/* Trust bullets */}
          <div className="relative z-10 pt-8 border-t border-white/10 space-y-2 text-xs text-white/80">
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-accent" />
              <span>Instant wallet-to-wallet settlement</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-accent" />
              <span>Protected NetBanking simulation</span>
            </div>
            <div className="flex items-center gap-2 text-accent/90">
              <Check className="w-3.5 h-3.5 text-accent" />
              <span>Simulation environment • No real money</span>
            </div>
          </div>
        </div>

        {/* Right Side: Clean Authentication Form */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center bg-surface">
          <div className="max-w-sm w-full mx-auto space-y-6">
            
            <div>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-[10px] font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wider mb-2">
                <span>Simulator • No Real Money</span>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-text">Sign in to your wallet</h2>
              <p className="text-xs text-text-muted mt-1">
                Enter your mobile number and password, or click a demo account below.
              </p>
            </div>

            {/* Quick Demo Credentials Card */}
            <div className="p-3 bg-surface-subtle border border-border rounded-md text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-text text-[11px] uppercase tracking-wider">Demo Accounts (Instant Fill)</span>
                <span className="text-[10px] text-text-faint">No signup needed</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPhone("9876543210");
                    setPassword("demo123");
                  }}
                  className="p-2 text-left bg-surface hover:bg-primary-tint border border-border hover:border-primary/40 rounded transition-all cursor-pointer group"
                >
                  <p className="font-medium text-text group-hover:text-primary text-[11px] truncate">Aryan Patel</p>
                  <p className="text-[10px] text-text-muted">9876543210</p>
                  <p className="text-[9px] text-primary font-mono mt-0.5">Password: demo123</p>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPhone("8765432109");
                    setPassword("demo123");
                  }}
                  className="p-2 text-left bg-surface hover:bg-primary-tint border border-border hover:border-primary/40 rounded transition-all cursor-pointer group"
                >
                  <p className="font-medium text-text group-hover:text-primary text-[11px] truncate">Neha Sharma</p>
                  <p className="text-[10px] text-text-muted">8765432109</p>
                  <p className="text-[9px] text-primary font-mono mt-0.5">Password: demo123</p>
                </button>
              </div>
            </div>

            {error && (
              <Alert variant="danger" onDismiss={() => setError("")}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <Field label="Mobile Number" required htmlFor="phone">
                <Input
                  id="phone"
                  type="tel"
                  placeholder="9876543210"
                  prefixText="+91"
                  leftIcon={<Phone className="w-4 h-4" />}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  autoFocus
                />
              </Field>

              <Field label="Password" required htmlFor="password">
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  leftIcon={<Lock className="w-4 h-4" />}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Field>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  loading={loading}
                  className="w-full"
                  iconRight={<ArrowRight className="w-4 h-4" />}
                >
                  Sign in
                </Button>
              </div>

              <div className="pt-4 border-t border-border flex flex-col gap-2 text-center text-xs text-text-muted">
                <p>
                  Don&apos;t have a personal account?{" "}
                  <Link href="/signup" className="text-primary font-semibold hover:underline">
                    Create account
                  </Link>
                </p>

                <p className="text-[11px] text-text-faint">
                  Are you a business merchant?{" "}
                  <a
                    href="http://localhost:3002/login"
                    className="text-text-muted hover:text-text font-medium underline"
                  >
                    Merchant login
                  </a>
                </p>
              </div>
            </form>

          </div>
        </div>

      </div>
    </div>
  );
}
