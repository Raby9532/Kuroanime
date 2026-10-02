import Link from "next/link";
import { ALL_GENRES } from "@/lib/anilist";

export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] mt-16">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-4">
          <span className="font-display text-xl tracking-wider">
            <span className="text-white">kuro</span><span className="text-brand">!</span><span className="text-white">anime</span>
          </span>
        </div>
        <p className="text-xs text-gray-500 mb-5 max-w-md">
          Watch anime online free. No ads, fast streams, thousands of titles.
        </p>

        <div className="flex flex-wrap gap-x-5 gap-y-2 mb-5 text-xs">
          {[
            { label: "Trending", href: "/trending" },
            { label: "Seasonal", href: "/seasonal" },
            { label: "Top Rated", href: "/top" },
            { label: "Schedule", href: "/schedule" },
            { label: "Browse", href: "/browse" },
          ].map((l) => (
            <Link key={l.href} href={l.href} className="text-gray-500 hover:text-brand transition-colors">
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex flex-wrap gap-1.5 mb-6">
          {ALL_GENRES.slice(0, 12).map((g) => (
            <Link key={g} href={`/genre/${encodeURIComponent(g)}`}
              className="text-[11px] text-gray-500 hover:text-white bg-white/[0.03] hover:bg-brand px-2 py-1 rounded-full transition-all">
              {g}
            </Link>
          ))}
        </div>

        <div className="border-t border-white/[0.06] pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-gray-600">
          <p>© {new Date().getFullYear()} KuroAnime · For educational purposes only.</p>
          <p>
            Powered by{" "}
            <a href="https://anilist.co" target="_blank" rel="noopener" className="text-brand hover:underline">AniList</a>
            {" & "}
            <a href="https://github.com/consumet" target="_blank" rel="noopener" className="text-brand hover:underline">Consumet</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
