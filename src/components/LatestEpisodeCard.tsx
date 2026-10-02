"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Clock, Tv } from "lucide-react";
import type { AiringSchedule } from "@/lib/anilist";

export function LatestEpisodeCard({ ep }: { ep: AiringSchedule }) {
  const [imgError, setImgError] = useState(false);
  const title = ep.media.title.english || ep.media.title.romaji;
  const airedAgo = Math.floor((Date.now() / 1000 - ep.airingAt) / 3600);
  const timeLabel =
    airedAgo < 1 ? "Just aired" : airedAgo < 24 ? `${airedAgo}h ago` : `${Math.floor(airedAgo / 24)}d ago`;

  const imgSrc = ep.media.coverImage.medium;

  return (
    <Link
      href={`/anime/${ep.media.id}`}
      className="group flex items-center gap-3 glass-card p-2.5 hover:border-brand/30 hover:-translate-y-0.5 transition-all duration-300"
    >
      <div className="relative w-16 h-20 shrink-0 rounded-xl overflow-hidden bg-surface-2 ring-1 ring-white/5">
        {imgSrc && !imgError ? (
          <Image
            src={imgSrc}
            alt={title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            sizes="64px"
            unoptimized
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-surface-2 text-gray-500 text-[9px] text-center p-1 leading-tight">
            {title}
          </div>
        )}
        <span className="absolute bottom-0 inset-x-0 h-6 bg-gradient-to-t from-black/70 to-transparent" />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-white line-clamp-2 leading-snug mb-1.5 group-hover:text-brand-light transition-colors">
          {title}
        </h3>
        <div className="flex items-center gap-2 text-[11px] text-gray-400">
          <span className="flex items-center gap-1 bg-brand/10 text-brand-light px-1.5 py-0.5 rounded-full">
            <Tv size={10} /> Ep {ep.episode}
          </span>
          <span className="flex items-center gap-1 text-gray-500">
            <Clock size={10} /> {timeLabel}
          </span>
        </div>
      </div>
    </Link>
  );
}
