import Link from "next/link";
import Image from "next/image";
import { getTrending } from "@/lib/anilist";
import { SearchBox } from "@/components/SearchBox";
import { ArrowRight, Zap, Globe2, ShieldCheck, Sparkles } from "lucide-react";

export const metadata = {
  title: "Welcome to KuroAnime",
  description: "Watch anime online free — sub & dub, no ads, fast streaming.",
  alternates: {
    canonical: "/",
  },
};

const POPULAR_SEARCHES = [
  "One Piece", "Solo Leveling", "Jujutsu Kaisen", "Demon Slayer",
  "Attack on Titan", "Mushoku Tensei", "Bleach", "Naruto Shippuden",
];

export default async function WelcomePage() {
  const trending = await getTrending(1, 10).catch(() => []);

  return (
    <div className="min-h-screen bg-surface relative overflow-hidden">
      {/* ── Top banner: collage of trending posters ── */}
      <div className="relative h-52 sm:h-64 flex">
        {trending.slice(0, 8).map((anime) => (
          <div key={anime.id} className="relative flex-1 min-w-0 h-full overflow-hidden">
            <Image
              src={anime.coverImage.extraLarge}
              alt=""
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/70 to-surface/20" />
        <div className="absolute inset-0 bg-gradient-to-b from-surface/40 via-transparent to-transparent" />
      </div>

      {/* ── Main card ── */}
      <div className="relative max-w-2xl mx-auto px-4 -mt-16 sm:-mt-20 pb-20">
        <div className="orb w-[380px] h-[380px] bg-brand top-[-10%] left-1/2 -translate-x-1/2 opacity-20" />

        <div className="relative glass-card p-6 sm:p-10 text-center">
          <span className="font-display text-4xl sm:text-5xl tracking-wider inline-block mb-2">
            <span className="text-white">kuro</span><span className="text-brand">!</span><span className="text-white">anime</span>
          </span>
          <p className="text-gray-400 text-sm mb-8">
            Watch anime online free — sub &amp; dub, no ads, fast streaming.
          </p>

          <SearchBox />

          <div className="text-xs text-gray-500 leading-relaxed mb-8">
            <span className="text-gray-600">Popular:</span>{" "}
            {POPULAR_SEARCHES.map((term, i) => (
              <span key={term}>
                <Link href={`/search?q=${encodeURIComponent(term)}`} className="hover:text-brand transition-colors">
                  {term}
                </Link>
                {i < POPULAR_SEARCHES.length - 1 && <span className="text-gray-700">, </span>}
              </span>
            ))}
          </div>

          <Link
            href="/home"
            className="btn-glow inline-flex items-center gap-2 text-white font-semibold px-7 py-3 rounded-full text-sm"
          >
            Enter KuroAnime <ArrowRight size={16} />
          </Link>

          <div className="grid grid-cols-3 gap-3 mt-10">
            <Feature icon={<Zap size={16} />} label="Instant Streaming" />
            <Feature icon={<Globe2 size={16} />} label="Sub & Dub" />
            <Feature icon={<ShieldCheck size={16} />} label="No Ads" />
          </div>
        </div>

        {/* ── Info section, anikoto-style ── */}
        <div className="mt-8 glass-card p-6 sm:p-8 text-left">
          <h2 className="font-display text-xl text-white mb-3">
            KUROANIME — STREAM ANIME ONLINE FOR FREE
          </h2>
          <p className="text-sm text-gray-400 leading-relaxed mb-5">
            KuroAnime is a free anime streaming destination where fans can watch
            high-quality anime series and movies with English subtitles or dubbed
            audio. With a constantly growing collection, discovering your favourite
            anime takes just a moment.
          </p>

          <h3 className="text-sm font-semibold text-white mb-2">Why choose KuroAnime?</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex gap-2">
              <Sparkles size={14} className="text-brand shrink-0 mt-0.5" />
              <span><b className="text-gray-300">Massive catalog</b> — thousands of titles across every genre, from classics to the latest simulcasts.</span>
            </li>
            <li className="flex gap-2">
              <Sparkles size={14} className="text-brand shrink-0 mt-0.5" />
              <span><b className="text-gray-300">Multiple servers</b> — if one stream is slow, switch instantly to another.</span>
            </li>
            <li className="flex gap-2">
              <Sparkles size={14} className="text-brand shrink-0 mt-0.5" />
              <span><b className="text-gray-300">Fast updates</b> — new episodes added as soon as they air.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function Feature({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5 bg-white/[0.03] border border-white/[0.06] rounded-xl py-3 px-2">
      <span className="text-brand">{icon}</span>
      <span className="text-[10px] text-gray-400 font-medium">{label}</span>
    </div>
  );
}
