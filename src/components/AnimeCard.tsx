"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, Play } from "lucide-react";
import type { AnilistMedia } from "@/lib/anilist";

interface AnimeCardProps {
  anime: AnilistMedia;
  size?: "sm" | "md" | "lg";
  fill?: boolean; // true = fill parent grid cell (Browse/Search/Trending grids)
}

export function AnimeCard({ anime, size = "md", fill = false }: AnimeCardProps) {
  const [imgError, setImgError] = useState(false);
  const title = anime.title.english || anime.title.romaji;
  const score = anime.averageScore ? (anime.averageScore / 10).toFixed(1) : null;

  const imgSrc = anime.coverImage.extraLarge || anime.coverImage.large || anime.coverImage.medium;

  const widths = { sm: "w-32 sm:w-36", md: "w-36 sm:w-44", lg: "w-44 sm:w-52" };
  const heights = { sm: "h-44 sm:h-52", md: "h-52 sm:h-64", lg: "h-60 sm:h-72" };
  const imgSizes = {
    sm: "(max-width: 640px) 128px, 144px",
    md: "(max-width: 640px) 144px, 176px",
    lg: "(max-width: 640px) 176px, 208px",
  };

  return (
    <Link href={`/anime/${anime.id}`} className={`anime-card group block ${fill ? "w-full" : widths[size]}`}>
      <div className={`relative ${fill ? "aspect-[2/3]" : heights[size]} rounded-2xl overflow-hidden bg-surface-2 ring-1 ring-white/[0.06] group-hover:ring-brand/40 transition-all duration-300`}>
        {imgSrc && !imgError ? (
          <Image
            src={imgSrc}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes={imgSizes[size]}
            quality={90}
            unoptimized
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-surface-2 text-gray-400 text-xs text-center p-3 leading-snug">
            {title}
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-3">
          <div className="flex items-center justify-center mb-3 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            <div className="w-11 h-11 bg-gradient-to-br from-brand to-accent rounded-full flex items-center justify-center shadow-lg shadow-brand/40">
              <Play size={17} fill="white" className="text-white ml-0.5" />
            </div>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

        {score && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/70 backdrop-blur-md rounded-lg px-1.5 py-1 border border-white/10">
            <Star size={9} className="text-yellow-400 fill-yellow-400" />
            <span className="text-[11px] font-bold text-white">{score}</span>
          </div>
        )}

        {anime.format && (
          <div className="absolute top-2 left-2 bg-gradient-to-r from-brand to-accent backdrop-blur-md rounded-lg px-2 py-1">
            <span className="text-[10px] font-bold text-white tracking-wide">{anime.format}</span>
          </div>
        )}

        {anime.status === "RELEASING" && (
          <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 bg-black/60 backdrop-blur-md rounded-full px-1.5 py-0.5 border border-green-400/20">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            <span className="text-[9px] text-green-400 font-semibold">LIVE</span>
          </div>
        )}
      </div>

      <div className="mt-2.5 px-0.5">
        <h3 className="text-xs sm:text-sm font-medium text-white line-clamp-2 leading-snug group-hover:text-brand-light transition-colors">
          {title}
        </h3>
        {anime.seasonYear && (
          <p className="text-[11px] text-gray-500 mt-1">
            {anime.season} {anime.seasonYear}
          </p>
        )}
      </div>
    </Link>
  );
}
