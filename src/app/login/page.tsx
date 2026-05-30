"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem("wrixty_authenticated");
    if (auth) {
      router.push("/dashboard");
    }
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Simulate login verification
    setTimeout(() => {
      if (email === "Superadmin@gmail.com" && password === "12345678") {
        localStorage.setItem("wrixty_authenticated", "true");
        router.push("/dashboard");
      } else {
        setError("Invalid email address or password. Please try again.");
        setLoading(false);
      }
    }, 800);
  };

  const autofillAdmin = () => {
    setEmail("Superadmin@gmail.com");
    setPassword("12345678");
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background gradients */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-teal-500/10 blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white border border-zinc-200 p-8 rounded-md shadow-lg text-center space-y-6">
          <div className="space-y-2">
            <div className="w-12 h-12 mx-auto rounded-md bg-indigo-600 flex items-center justify-center font-black text-white text-lg shadow-md tracking-wider">
              WA
            </div>
            <h1 className="text-xl font-black tracking-widest text-zinc-800 uppercase">
              Wrixty Ayurveda
            </h1>
            <p className="text-xs text-zinc-500 font-semibold tracking-wider uppercase">
              Sign In to Your Account
            </p>
          </div>

          {error && (
            <div className="p-3 text-xs bg-red-500/10 border border-red-500/20 text-red-400 rounded-md text-left font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500"
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500"
            />

            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={loading}
            >
              Sign In
            </Button>
          </form>

          {/* Quick Demo Autofill */}
          <div className="pt-4 border-t border-zinc-200">
            <button
              onClick={autofillAdmin}
              className="text-[11px] text-zinc-500 hover:text-indigo-600 font-bold tracking-wider uppercase transition-colors"
            >
              ⚡ Click to Auto-fill Demo Credentials
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
