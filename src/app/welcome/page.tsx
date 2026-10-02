import Link from "next/link";
import { redirect } from "next/navigation";
import { Play, Sparkles, Zap, Globe2, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Welcome to KuroAnime",
  description: "Watch anime online free — sub & dub, no ads, fast streaming.",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-surface relative overflow-hidden flex items-center justify-center px-4">
      {/* Ambient background glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-brand/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px]" />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative z-10 max-w-2xl w-full text-center py-16">
        {/* Logo mark */}
        <div className="inline-flex items-center gap-2 mb-8">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand to-purple-600 flex items-center justify-center font-display text-xl text-white shadow-lg shadow-brand/40">
            K
          </div>
          <span className="font-display text-2xl text-white tracking-wide">
            KURO<span className="text-brand">ANIME</span>
          </span>
        </div>

        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-white leading-[1.05] mb-5">
          Your anime.
          <br />
          <span className="bg-gradient-to-r from-brand via-pink-500 to-purple-500 bg-clip-text text-transparent">
            Zero interruptions.
          </span>
        </h1>

        <p className="text-gray-400 text-sm sm:text-base max-w-md mx-auto mb-10 leading-relaxed">
          Thousands of titles, sub &amp; dub, fresh episodes daily —
          streaming instantly with no ads and no sign-up required.
        </p>

        <Link
          href="/"
          className="inline-flex items-center gap-2.5 bg-brand hover:bg-brand-dark text-white font-semibold px-8 py-3.5 rounded-full transition-all hover:scale-105 shadow-xl shadow-brand/30 text-base"
        >
          <Play size={18} fill="white" /> Visit KuroAnime
        </Link>

        {/* Feature strip */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-14 max-w-lg mx-auto">
          <Feature icon={<Zap size={18} />} label="Instant Streaming" />
          <Feature icon={<Globe2 size={18} />} label="Sub & Dub" />
          <Feature icon={<ShieldCheck size={18} />} label="No Ads" />
        </div>

        <p className="text-gray-600 text-xs mt-14 flex items-center justify-center gap-1.5">
          <Sparkles size={12} /> New episodes added every day
        </p>
      </div>
    </div>
  );
}

function Feature({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2 bg-white/[0.03] border border-white/[0.06] rounded-2xl py-4 px-2 backdrop-blur-sm">
      <span className="text-brand">{icon}</span>
      <span className="text-xs text-gray-400 font-medium">{label}</span>
    </div>
  );
}
