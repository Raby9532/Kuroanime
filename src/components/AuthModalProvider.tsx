"use client";

import { createContext, useContext, useState } from "react";
import { AuthModal } from "@/components/AuthModal";

const AuthModalContext = createContext<{
  openSignIn: () => void;
  openSignUp: () => void;
}>({ openSignIn: () => {}, openSignUp: () => {} });

export function useAuthModal() {
  return useContext(AuthModalContext);
}

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<"signin" | "signup" | null>(null);

  return (
    <AuthModalContext.Provider value={{
      openSignIn: () => setMode("signin"),
      openSignUp: () => setMode("signup"),
    }}>
      {children}
      {mode && <AuthModal mode={mode} onClose={() => setMode(null)} />}
    </AuthModalContext.Provider>
  );
}
