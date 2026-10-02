import Link from "next/link";
import {
  getTrending,
  getPopular,
  getSeasonalAnime,
  getAiringSchedule,
  type AnilistMedia,
  type AiringSchedule,
} from "@/lib/anilist";
import { AnimeCard } from "@/components/AnimeCard";
import { LatestEpisodeCard } from "@/components/LatestEpisodeCard";
import { HeroSlider } from "@/components/HeroSlider";
import { TrendingUp, Calendar, Flame, Clock } from "lucide-react";

export const revalidate = 900;
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Home",
  description: "Trending, popular and seasonal anime — watch sub & dub in HD, no ads.",
  alternates: {
    canonical: "/home",
  },
};

export default async function HomePage() {
  const [trending, popular, seasonal, schedule] = await Promise.all([
    getTrending(1, 20),
    getPopular(1, 20),
    getSeasonalAnime(),
    getAiringSchedule(),
  ]);

  const now = Math.floor(Date.now() / 1000);
  const latestEpisodes = schedule
    .filter((s) => s.airingAt <= now)
    .sort((a, b) => b.airingAt - a.airingAt)
    .slice(0, 20);

  const heroAnime = trending.slice(0, 5);

  return (
    <div className="pb-16">
      {heroAnime.length > 0 && <HeroSlider items={heroAnime} />}

      {latestEpisodes.length > 0 && (
        <LatestEpisodesSection episodes={latestEpisodes} />
      )}

      <Section
        title="Trending Now"
        icon={<Flame size={20} className="text-brand" />}
        items={trending}
        href="/trending"
      />
      <Section
        title="This Season"
        icon={<Calendar size={20} className="text-brand" />}
        items={seasonal}
        href="/seasonal"
      />
      <Section
        title="All Time Popular"
        icon={<TrendingUp size={20} className="text-brand" />}
        items={popular}
        href="/top"
      />
    </div>
  );
}

function LatestEpisodesSection({ episodes }: { episodes: AiringSchedule[] }) {
  return (
    <section className="max-w-7xl mx-auto px-4 mt-10">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Clock size={20} className="text-brand" />
          <h2 className="font-display text-xl sm:text-2xl text-white tracking-wide">
            LATEST EPISODES
          </h2>
        </div>
        <Link
          href="/schedule"
          className="text-xs text-brand hover:text-brand-light transition-colors font-medium"
        >
          View Schedule →
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {episodes.map((ep) => (
          <LatestEpisodeCard key={`${ep.media.id}-${ep.episode}`} ep={ep} />
        ))}
      </div>
    </section>
  );
}

function Section({
  title,
  icon,
  items,
  href,
}: {
  title: string;
  icon: React.ReactNode;
  items: AnilistMedia[];
  href?: string;
}) {
  return (
    <section className="max-w-7xl mx-auto px-4 mt-10 sm:mt-12">
      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="font-display text-xl sm:text-2xl text-white tracking-wide">
            {title.toUpperCase()}
          </h2>
        </div>
        {href && (
          <Link
            href={href}
            className="text-xs text-brand hover:text-brand-light transition-colors font-medium shrink-0"
          >
            See All →
          </Link>
        )}
      </div>
      <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">
        {items.map((anime) => (
          <div key={anime.id} className="shrink-0">
            <AnimeCard anime={anime} size="md" />
          </div>
        ))}
      </div>
    </section>
  );
}
