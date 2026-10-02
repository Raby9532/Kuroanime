"use client";
import { useAuthModal } from "@/components/AuthModalProvider";
import { NotificationBell } from "@/components/NotificationBell";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Search, Menu, X, LogOut, Settings, List, User, Home, TrendingUp, Calendar, Grid3x3, Trophy, CalendarClock } from "lucide-react";
import Image from "next/image";

export function Navbar() {
  const { data: session } = useSession();
  const pathname          = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { openSignIn, openSignUp } = useAuthModal();
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setDropOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => { setDrawerOpen(false); }, [pathname]);

  const navLinks = [
    { href: "/home",          label: "Home",     icon: Home },
    { href: "/trending",  label: "Trending", icon: TrendingUp },
    { href: "/seasonal",  label: "Seasonal", icon: Calendar },
    { href: "/browse",    label: "Browse",   icon: Grid3x3 },
    { href: "/top",       label: "Top Rated", icon: Trophy },
    { href: "/schedule",  label: "Schedule", icon: CalendarClock },
  ];

  return (
    <>
      <nav className="sticky top-0 z-50 glass border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-3">

          {/* Hamburger — opens slide-out drawer, all screen sizes */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="shrink-0 w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <Menu size={20} />
          </button>

          {/* Logo */}
          {/* Logo */}
          <Link href="/home" className="flex items-center gap-2 shrink-0 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand to-accent flex items-center justify-center font-display text-white font-bold text-sm shadow-lg shadow-brand/30 group-hover:scale-105 transition-transform">K</div>
            <span className="font-display text-lg tracking-wide">
              <span className="text-white">KURO</span><span className="text-gradient">ANIME</span>
            </span>
          </Link>

          {/* Desktop inline links (quick access, drawer has full list) */}
          <div className="hidden lg:flex items-center gap-0.5 ml-2">
            {navLinks.slice(0, 4).map((l) => (
              <Link key={l.href} href={l.href}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors whitespace-nowrap ${
                  pathname === l.href ? "text-white bg-white/8" : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}>
                {l.label}
              </Link>
            ))}
          </div>

          <div className="flex-1" />

          {/* Search */}
          <form action="/search" method="get" className="relative hidden md:block">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              name="q"
              type="text"
              placeholder="Search anime..."
              className="bg-white/[0.04] border border-white/10 rounded-full pl-8 pr-4 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-brand transition-all w-40 focus:w-56"
            />
          </form>
          <Link href="/search" className="md:hidden shrink-0 w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:text-white hover:bg-white/5">
            <Search size={18} />
          </Link>

          {/* Auth */}
          <NotificationBell />
          {session ? (
            <div className="relative shrink-0" ref={dropRef}>
              <button onClick={() => setDropOpen(!dropOpen)}
                className="flex items-center gap-2 hover:bg-white/5 rounded-xl px-1.5 py-1.5 transition-colors">
                <div className="w-7 h-7 rounded-full overflow-hidden bg-surface-2 ring-1 ring-white/10 shrink-0">
                  {(session.user as any)?.avatarPreset || session.user?.image
                    ? <Image src={(session.user as any)?.avatarPreset || session.user?.image} alt="" width={28} height={28} className="w-full h-full object-cover" unoptimized />
                    : <User size={16} className="m-auto mt-1.5 text-gray-500" />
                  }
                </div>
              </button>
              {dropOpen && (
                <div className="absolute right-0 top-full mt-2 w-44 dropdown-solid shadow-2xl py-1.5 z-50">
                  <Link href="/watchlist" onClick={() => setDropOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
                    <List size={14} /> My List
                  </Link>
                  <Link href="/settings" onClick={() => setDropOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
                    <Settings size={14} /> Settings
                  </Link>
                  <div className="h-px bg-white/8 my-1" />
                  <button onClick={() => signOut({ callbackUrl: "/" })}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={openSignIn} className="text-sm text-gray-400 hover:text-white transition-colors hidden sm:block">
                Sign In
              </button>
              <button onClick={openSignUp} className="btn-glow text-white text-sm font-medium px-3.5 py-1.5 rounded-full whitespace-nowrap">
                Sign Up
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* ── Slide-out drawer (anikoto-style) ── */}
      {drawerOpen && (
        <>
          <div
            onClick={() => setDrawerOpen(false)}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease]"
          />
          <div className="fixed top-0 left-0 bottom-0 z-[70] w-72 glass border-r border-white/10 overflow-y-auto animate-[slideIn_0.25s_cubic-bezier(.2,.8,.2,1)]">
            <div className="flex items-center justify-between px-4 h-14 border-b border-white/[0.06]">
              <Link href="/home" className="flex items-center gap-2" onClick={() => setDrawerOpen(false)}>
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand to-accent flex items-center justify-center font-display text-white font-bold text-sm">K</div>
                <span className="font-display text-lg tracking-wide">
                  <span className="text-white">KURO</span><span className="text-gradient">ANIME</span>
                </span>
              </Link>
              <button onClick={() => setDrawerOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/5">
                <X size={18} />
              </button>
            </div>

            <div className="p-3 space-y-1">
              {navLinks.map((l) => {
                const Icon = l.icon;
                return (
                  <Link key={l.href} href={l.href}
                    className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm transition-all ${
                      pathname === l.href
                        ? "text-white bg-gradient-to-r from-brand/20 to-accent/20 border border-brand/30"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`}>
                    <Icon size={17} /> {l.label}
                  </Link>
                );
              })}
            </div>

            <div className="h-px bg-white/8 mx-3 my-2" />

            <div className="p-3 space-y-1">
              {session ? (
                <>
                  <Link href="/watchlist" className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5">
                    <List size={17} /> My List
                  </Link>
                  <Link href="/settings" className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5">
                    <Settings size={17} /> Settings
                  </Link>
                  <button onClick={() => signOut({ callbackUrl: "/" })}
                    className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm text-red-400 hover:bg-red-500/10">
                    <LogOut size={17} /> Sign Out
                  </button>
                </>
              ) : (
                <div className="flex gap-2 px-1 pt-1">
                  <button onClick={openSignIn} className="text-sm text-gray-400 hover:text-white transition-colors hidden sm:block">
                Sign In
              </button>
              <button onClick={openSignUp} className="btn-glow text-white text-sm font-medium px-3.5 py-1.5 rounded-full whitespace-nowrap">
                Sign Up
              </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
