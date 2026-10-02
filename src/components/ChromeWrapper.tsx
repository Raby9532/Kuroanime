"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export function ChromeWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isWelcomePage = pathname === "/";

  if (isWelcomePage) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}
