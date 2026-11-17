"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Building2, User, Mail, Phone, Lock, ArrowRight, ShieldCheck, Check } from "lucide-react";
import { signIn } from "next-auth/react";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Field } from "@repo/ui/field";
import { Alert } from "@repo/ui/toast";
import { ThemeToggle } from "@repo/ui";

export default function MerchantSignupPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    businessName: "",
    ownerName: "",
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
        throw new Error(data.message || data.msg || "Failed to register merchant account");
      }

      setSuccess(true);

      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Merchant account registered, but automatic sign-in failed. Please sign in manually.");
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
    <div className="min-h-screen bg-bg flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans relative">
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle variant="icon" />
      </div>
      <div className="w-full max-w-4xl bg-surface border border-border rounded-lg shadow-soft overflow-hidden grid lg:grid-cols-12 min-h-[600px]">
        
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
              <span className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                PayPulse <span className="text-accent text-[11px] font-semibold px-1.5 py-0.2 rounded-xs bg-white/15">Merchant</span>
              </span>
            </Link>

            <div className="space-y-2 pt-8">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-white/10 text-accent text-[11px] font-medium border border-white/15">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Business Onboarding</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-snug">
                Accept payments with ledger precision.
              </h1>
              <p className="text-xs text-white/70 leading-relaxed pt-1">
                Equip your store or online commerce with instant QR checkouts and transparent settlement tracking.
              </p>
            </div>
          </div>

          <div className="relative z-10 pt-8 border-t border-white/10 space-y-2 text-xs text-white/80">
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-accent" />
              <span>Dedicated commercial session separation</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-accent" />
              <span>Full transaction export and webhook integration</span>
            </div>
          </div>
        </div>

        {/* Right Side: Clean Merchant Registration Form */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center bg-surface">
          <div className="max-w-sm w-full mx-auto space-y-5">
            
            <div>
              <h2 className="text-xl font-bold tracking-tight text-text">Register merchant account</h2>
              <p className="text-xs text-text-muted mt-1">
                Enter your commercial details to activate payments.
              </p>
            </div>

            {error && (
              <Alert variant="danger" onDismiss={() => setError("")}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert variant="success">
                Merchant account created! Initializing session...
              </Alert>
            )}

            <form onSubmit={handleSignup} className="space-y-3.5">
              <Field label="Business Name" required htmlFor="businessName">
                <Input
                  id="businessName"
                  type="text"
                  name="businessName"
                  placeholder="Apex Electronics Pvt Ltd"
                  leftIcon={<Building2 className="w-4 h-4" />}
                  value={formData.businessName}
                  onChange={handleChange}
                  required
                  autoFocus
                />
              </Field>

              <Field label="Owner / Authorized Name" required htmlFor="ownerName">
                <Input
                  id="ownerName"
                  type="text"
                  name="ownerName"
                  placeholder="Vikram Mehta"
                  leftIcon={<User className="w-4 h-4" />}
                  value={formData.ownerName}
                  onChange={handleChange}
                  required
                />
              </Field>

              <Field label="Business Email" required htmlFor="email">
                <Input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="billing@apex.in"
                  leftIcon={<Mail className="w-4 h-4" />}
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </Field>

              <Field label="Phone Number" required htmlFor="phone">
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
                  Register business
                </Button>
              </div>

              <div className="pt-4 border-t border-border text-center text-xs text-text-muted">
                Already registered?{" "}
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
