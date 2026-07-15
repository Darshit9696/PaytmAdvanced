"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      phone,
      password,
      redirect: false,
    });

    console.log(result);
    

    setLoading(false);

    if (result?.error) {
      setError("Invalid phone number or password");
      return;
    }

    // Go to the /dashboard page
    router.push("/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-96 rounded-lg border p-6 shadow">
        <h1 className="mb-6 text-2xl font-bold">Login</h1>

        <input
          type="text"
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="mb-4 w-full rounded border p-2"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4 w-full rounded border p-2"
        />

        {error && (
          <p className="mb-4 text-red-500">
            {error}
          </p>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full rounded bg-black p-2 text-white"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </div>
    </div>
  );
}