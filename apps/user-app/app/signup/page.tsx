"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Mail, Phone, Lock, ArrowRight, ShieldCheck, Check } from "lucide-react";
import { signIn } from "next-auth/react";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Field } from "@repo/ui/field";
import { Alert } from "@repo/ui/toast";

export default function SignupPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.msg || "Failed to create account");
      }

      setSuccess(true);

      const result = await signIn("credentials", {
        phone: formData.phone,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Account created, but automatic sign-in failed. Please sign in manually.");
        return;
      }

      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-4xl bg-surface border border-border rounded-lg shadow-soft overflow-hidden grid lg:grid-cols-12 min-h-[580px]">
        
        {/* Left Side: Calm Ink-Green Brand Panel */}
        <div className="lg:col-span-5 bg-[#0F3D33] text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
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
                <span>Instant Wallet Account</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-snug">
                Start with a balanced ledger.
              </h1>
              <p className="text-xs text-white/70 leading-relaxed pt-1">
                Receive an immediate ₹10,000 welcome wallet balance with complete double-entry transaction history.
              </p>
            </div>
          </div>

          <div className="relative z-10 pt-8 border-t border-white/10 space-y-2 text-xs text-white/80">
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-accent" />
              <span>Full cryptographic transaction audit</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-accent" />
              <span>Free instant peer-to-peer transfers</span>
            </div>
          </div>
        </div>

        {/* Right Side: Clean Registration Form */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center bg-surface">
          <div className="max-w-sm w-full mx-auto space-y-5">
            
            <div>
              <h2 className="text-xl font-bold tracking-tight text-text">Create personal account</h2>
              <p className="text-xs text-text-muted mt-1">
                Enter your details to create an authenticated wallet.
              </p>
            </div>

            {error && (
              <Alert variant="danger" onDismiss={() => setError("")}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert variant="success">
                Account created successfully. Signing in...
              </Alert>
            )}

            <form onSubmit={handleSignup} className="space-y-3.5">
              <Field label="Full Name" required htmlFor="name">
                <Input
                  id="name"
                  type="text"
                  name="name"
                  placeholder="Aarav Sharma"
                  leftIcon={<User className="w-4 h-4" />}
                  value={formData.name}
                  onChange={handleChange}
                  required
                  autoFocus
                />
              </Field>

              <Field label="Email Address" required htmlFor="email">
                <Input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="aarav@example.com"
                  leftIcon={<Mail className="w-4 h-4" />}
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </Field>

              <Field label="Mobile Number" required htmlFor="phone">
                <Input
                  id="phone"
                  type="tel"
                  name="phone"
                  placeholder="9876543210"
                  prefixText="+91"
                  leftIcon={<Phone className="w-4 h-4" />}
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </Field>

              <Field label="Password" required hint="At least 6 characters" htmlFor="password">
                <Input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  leftIcon={<Lock className="w-4 h-4" />}
                  value={formData.password}
                  onChange={handleChange}
                  minLength={6}
                  required
                />
              </Field>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  loading={loading || success}
                  className="w-full"
                  iconRight={<ArrowRight className="w-4 h-4" />}
                >
                  Create account
                </Button>
              </div>

              <div className="pt-4 border-t border-border text-center text-xs text-text-muted">
                Already have an account?{" "}
                <Link href="/login" className="text-primary font-semibold hover:underline">
                  Sign in
                </Link>
              </div>
            </form>

          </div>
        </div>

      </div>
    </div>
  );
}
