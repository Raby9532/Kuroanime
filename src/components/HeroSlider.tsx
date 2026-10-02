"use client";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, Star, ChevronLeft, ChevronRight, Info, Clapperboard } from "lucide-react";
import type { AnilistMedia } from "@/lib/anilist";

export function HeroSlider({ items }: { items: AnilistMedia[] }) {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  const SLIDE_MS = 6000;

  const next = useCallback(() => { setCurrent((i) => (i + 1) % items.length); setProgress(0); }, [items.length]);
  const prev = useCallback(() => { setCurrent((i) => (i - 1 + items.length) % items.length); setProgress(0); }, [items.length]);
  const goTo = (i: number) => { setCurrent(i); setProgress(0); };

  useEffect(() => {
    if (isPaused) return;
    const tick = setInterval(() => setProgress((p) => (p >= 100 ? 0 : p + 100 / (SLIDE_MS / 50))), 50);
    return () => clearInterval(tick);
  }, [isPaused, current]);

  useEffect(() => {
    if (progress >= 100) next();
  }, [progress, next]);

  const anime = items[current];
  if (!anime) return null;

  const title = anime.title.english || anime.title.romaji;
  const desc = anime.description?.replace(/<[^>]*>/g, "").slice(0, 170).trim() + "...";

  return (
    <section
      className="relative h-[42vh] sm:h-[58vh] min-h-[340px] max-h-[520px] overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Ambient glow orbs */}
      <div className="orb w-[420px] h-[420px] bg-brand top-[-15%] right-[5%]" />
      <div className="orb w-[380px] h-[380px] bg-accent bottom-[-10%] left-[-5%]" />

      {/* Background images */}
      {items.map((item, i) => {
        const hasBanner = Boolean(item.bannerImage);
        const src = item.bannerImage || item.coverImage.extraLarge;
        return (
          <div
            key={item.id}
            className={`absolute inset-0 transition-all duration-1000 ${
              i === current ? "opacity-100 scale-100" : "opacity-0 scale-105"
            }`}
          >
            <Image
              src={src}
              alt={item.title.english || item.title.romaji}
              fill
              className={`object-cover object-center ${hasBanner ? "" : "blur-2xl scale-125 opacity-60"}`}
              priority={i === 0}
              sizes="100vw"
              quality={90}
              unoptimized
            />
          </div>
        );
      })}

      {/* Gradients */}
      <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/60 to-surface/10" />
      <div className="absolute inset-0 bg-gradient-to-r from-surface/95 via-surface/40 to-transparent" />

      {/* ── Content: glass panel, floating over the backdrop ── */}
      <div className="relative z-10 h-full max-w-7xl mx-auto px-4 flex items-end pb-8 sm:pb-12">
        <div className="glass-card p-5 sm:p-7 max-w-md sm:max-w-lg w-full">
          {/* Badges */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {anime.trending && (
              <span className="flex items-center gap-1 bg-gradient-to-r from-brand to-accent text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
                #{anime.trending} TRENDING
              </span>
            )}
            {anime.format && (
              <span className="flex items-center gap-1 bg-white/[0.06] text-gray-300 text-[11px] px-2.5 py-1 rounded-full border border-white/10">
                <Clapperboard size={10} /> {anime.format}
              </span>
            )}
            {anime.status === "RELEASING" && (
              <span className="bg-green-500/15 text-green-400 text-[11px] px-2.5 py-1 rounded-full border border-green-500/25">
                ● AIRING
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-white leading-[0.95] mb-3 drop-shadow-lg">
            {title.toUpperCase()}
          </h1>

          {/* Meta */}
          <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-400 mb-3 flex-wrap">
            {anime.averageScore && (
              <span className="flex items-center gap-1">
                <Star size={12} className="text-yellow-400 fill-yellow-400" />
                <span className="font-semibold text-white">{(anime.averageScore / 10).toFixed(1)}</span>
              </span>
            )}
            {anime.episodes && <span>{anime.episodes} eps</span>}
            {anime.seasonYear && <span>{anime.season} {anime.seasonYear}</span>}
            {anime.duration && <span>{anime.duration}m</span>}
          </div>

          {/* Description */}
          <p className="text-gray-300 text-xs sm:text-sm leading-relaxed line-clamp-2 mb-4 hidden sm:block">
            {desc}
          </p>

          {/* Genres */}
          <div className="flex flex-wrap gap-1.5 mb-5">
            {anime.genres.slice(0, 3).map((g) => (
              <span key={g} className="text-xs bg-white/[0.05] text-gray-300 px-2.5 py-1 rounded-full border border-white/8">
                {g}
              </span>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href={`/anime/${anime.id}`}
              className="btn-glow inline-flex items-center gap-2 text-white font-semibold px-5 sm:px-6 py-2.5 rounded-full text-sm"
            >
              <Play size={15} fill="white" /> Watch Now
            </Link>
            <Link
              href={`/anime/${anime.id}`}
              className="inline-flex items-center gap-2 bg-white/[0.06] hover:bg-white/[0.12] text-white font-medium px-5 sm:px-6 py-2.5 rounded-full transition-all border border-white/10 text-sm"
            >
              <Info size={15} /> Details
            </Link>
          </div>
        </div>
      </div>

      {/* Floating poster preview — always visible so the sharp poster covers for missing banner art */}
      <div className="hidden sm:block absolute top-6 sm:top-8 right-4 sm:right-8 z-10 w-24 sm:w-32 rounded-2xl overflow-hidden shadow-2xl border border-white/10 rotate-2 hover:rotate-0 transition-transform duration-300">
        <Image
          src={anime.coverImage.extraLarge}
          alt={title}
          width={128}
          height={182}
          className="w-full h-auto"
          quality={90}
          unoptimized
        />
      </div>

      {/* Arrows */}
      <button
        onClick={prev}
        className="absolute left-2 sm:left-5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center glass rounded-full text-white hover:border-brand/50 transition-all"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        onClick={next}
        className="absolute right-2 sm:right-5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center glass rounded-full text-white hover:border-brand/50 transition-all"
      >
        <ChevronRight size={18} />
      </button>

      {/* Progress-bar indicators (replaces plain dots) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className="relative h-1 w-8 sm:w-10 rounded-full bg-white/15 overflow-hidden"
          >
            {i === current && (
              <span
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-brand to-accent rounded-full"
                style={{ width: `${progress}%` }}
              />
            )}
            {items.indexOf(items[i]) < current && (
              <span className="absolute inset-0 bg-white/40 rounded-full" />
            )}
          </button>
        ))}
      </div>
    </section>
  );
}
