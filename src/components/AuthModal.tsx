"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { X, Mail, Lock, User, Loader2, Eye, EyeOff } from "lucide-react";

export function AuthModal({
  mode: initialMode,
  onClose,
}: {
  mode: "signin" | "signup";
  onClose: () => void;
}) {
  const router = useRouter();
  const [mode, setMode] = useState(initialMode);
  const [art, setArt] = useState<{ title: string; image: string } | null>(null);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/featured-anime").then((r) => r.json()).then(setArt);
  }, []);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) setError("Invalid email or password.");
    else { onClose(); router.refresh(); }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error || "Failed to create account.");
        setLoading(false);
        return;
      }
      const signInRes = await signIn("credentials", { email, password, redirect: false });
      setLoading(false);
      if (signInRes?.error) setError("Account created — please sign in.");
      else { onClose(); router.refresh(); }
    } catch {
      setLoading(false);
      setError("Something went wrong.");
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-3xl glass-card overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
        <button onClick={onClose} className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-white hover:bg-black/60">
          <X size={16} />
        </button>

        {/* Left: anime art */}
        <div className="relative hidden md:block w-64 shrink-0 overflow-hidden">
          {art && (
            <>
              <Image src={art.image} alt="" fill className="object-cover" unoptimized />
              <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/20 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-surface/50" />
              <p className="absolute bottom-4 left-4 right-4 text-xs text-gray-300 font-medium line-clamp-2">
                {art.title}
              </p>
            </>
          )}
        </div>

        {/* Right: form */}
        <div className="flex-1 p-6 sm:p-8 overflow-y-auto">
          <span className="font-display text-xl tracking-wider block mb-1">
            <span className="text-white">kuro</span><span className="text-brand">!</span><span className="text-white">anime</span>
          </span>
          <h2 className="font-display text-2xl text-white mb-1">
            {mode === "signin" ? "WELCOME BACK" : "CREATE ACCOUNT"}
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            {mode === "signin" ? "Sign in to continue watching." : "Join to save your watchlist and comment."}
          </p>

          {error && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 mb-4">{error}</p>}

          {mode === "signup" && (
            <button
              type="button"
              onClick={() => signIn("google", { callbackUrl: "/home" })}
              className="w-full flex items-center justify-center gap-2 bg-white/[0.05] hover:bg-white/[0.09] border border-white/10 rounded-xl py-3 text-sm text-white mb-4 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Continue with Google
            </button>
          )}
          {mode === "signup" && (
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px flex-1 bg-white/8" />
              <span className="text-xs text-gray-600">or</span>
              <div className="h-px flex-1 bg-white/8" />
            </div>
          )}

          <form onSubmit={mode === "signin" ? handleSignIn : handleSignUp} className="space-y-3">
            {mode === "signup" && (
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input required value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username"
                  className="w-full bg-surface-2 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-brand transition-colors" />
              </div>
            )}
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email"
                className="w-full bg-surface-2 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-brand transition-colors" />
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input type={showPw ? "text" : "password"} required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "signup" ? "Password (min 6 chars)" : "Password"}
                className="w-full bg-surface-2 border border-white/10 rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-brand transition-colors" />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500">
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            <button type="submit" disabled={loading}
              className="btn-glow w-full flex items-center justify-center gap-2 text-white font-semibold py-3 rounded-xl text-sm disabled:opacity-60 mt-1">
              {loading ? <Loader2 size={16} className="animate-spin" /> : mode === "signin" ? "Sign In" : "Create Account"}
            </button>
          </form>

          <p className="text-sm text-gray-500 mt-5 text-center">
            {mode === "signin" ? (
              <>Don&apos;t have an account?{" "}
                <button onClick={() => { setMode("signup"); setError(""); }} className="text-brand hover:underline font-medium">Sign up</button>
              </>
            ) : (
              <>Already have an account?{" "}
                <button onClick={() => { setMode("signin"); setError(""); }} className="text-brand hover:underline font-medium">Sign in</button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
                }
