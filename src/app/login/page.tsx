"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";
import { loginUser } from "../../services/authService";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const user = await loginUser({ email, password });
      localStorage.setItem("wrixty_authenticated", "true");
      localStorage.setItem("wrixty_token", user.token); // Save JWT token!
      localStorage.setItem("wrixty_authenticated_user", JSON.stringify({
        name: user.name,
        email: user.email,
        roles: user.roles
      }));
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Invalid email address or password. Please try again.");
      setLoading(false);
    }
  };

  const autofillAdmin = () => {
    setEmail("Superadmin@gmail.com");
    setPassword("12345678");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background gradients */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-primary-teal/5 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-secondary-cyan/5 blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-card-bg border border-border-ui p-10 rounded-lg shadow-soft text-center space-y-8">
          <div className="space-y-3">
            <div className="w-14 h-14 mx-auto rounded-lg bg-gradient-primary flex items-center justify-center font-black text-white text-xl shadow-md tracking-wider">
              WA
            </div>
            <h1 className="text-2xl font-black tracking-widest text-gradient-primary uppercase">
              Wrixty Ayurveda
            </h1>
            <p className="text-xs text-text-secondary font-semibold tracking-wider uppercase">
              Sign In to Your Account
            </p>
          </div>

          {error && (
            <div className="p-3 text-xs bg-error/10 border border-error/20 text-error rounded-lg text-left font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-card-bg border-border-ui text-text-primary placeholder:text-text-secondary/50 focus:border-primary-teal"
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-card-bg border-border-ui text-text-primary placeholder:text-text-secondary/50 focus:border-primary-teal"
            />

            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={loading}
              className="py-3"
            >
              Sign In
            </Button>
          </form>

          <div className="pt-4 border-t border-border-ui/50">
            <button
              onClick={autofillAdmin}
              className="text-[10px] font-bold uppercase tracking-widest text-text-secondary hover:text-primary-teal transition-all flex items-center justify-center gap-2 mx-auto"
            >
              <span className="w-4 h-[1px] bg-border-ui"></span>
              Click to auto-fill demo credentials
              <span className="w-4 h-[1px] bg-border-ui"></span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
