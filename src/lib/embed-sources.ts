// ─────────────────────────────────────────────────────────────────────────────
// Only real, currently-working sources. No dead domains, no fake dub labels.
//
// DUB reliability notes (important — don't re-add fake ones later):
//   ✅ MegaPlay (ani + mal routes) — genuinely separate dub-encoded stream
//      when that title has one mapped.
//   ✅ VidLink (?dubbing=true) — genuinely requests the dub track.
//   ❌ VidSrc's ds_lang param — only changes SUBTITLE language, NOT audio.
//      Never label a VidSrc ds_lang URL as "Dub" — it's misleading.
//   ❌ Never reuse the exact same URL for both Sub and Dub — if a provider
//      doesn't have a distinct dub param, it doesn't have dub. Leave it out.
// ─────────────────────────────────────────────────────────────────────────────

export type StreamSource =
  | { type: "m3u8"; url: string; subtitles?: { url: string; lang: string }[]; provider: string; lang?: string }
  | { type: "embed"; url: string; provider: string; lang?: string };

export type Language = "sub" | "dub";

// ── MegaPlay — AniList ID + MAL ID routes, SUB and DUB both real ──────────────
export function getAnilistEmbedSources(
  anilistId: number,
  episode: number,
  isMovie: boolean,
  malId?: number | null
): StreamSource[] {
  const ep = isMovie ? 1 : episode;

  const sources: StreamSource[] = [
    { type: "embed", url: `https://megaplay.buzz/stream/ani/${anilistId}/${ep}/sub`, provider: "MegaPlay Sub", lang: "sub" },
    { type: "embed", url: `https://megaplay.buzz/stream/ani/${anilistId}/${ep}/dub`, provider: "MegaPlay Dub", lang: "dub" },
  ];

  if (malId) {
    sources.push(
      { type: "embed", url: `https://megaplay.buzz/stream/mal/${malId}/${ep}/sub`, provider: "MegaPlay MAL Sub", lang: "sub" },
      { type: "embed", url: `https://megaplay.buzz/stream/mal/${malId}/${ep}/dub`, provider: "MegaPlay MAL Dub", lang: "dub" }
    );
  }

  return sources;
}

// Kept for compatibility with existing imports in VideoPlayer.tsx.
// No reliable MAL-only source exists beyond what MegaPlay MAL already covers above.
export function getMalEmbedSources(
  _malId: number | null,
  _episode: number,
  _isMovie: boolean
): StreamSource[] {
  return [];
}

// ── TMDB/IMDb embeds — VidSrc/VidLink/Embed.su family ────────────────────────
export function getEmbedSources(
  imdbId: string | null,
  tmdbId: number | null,
  season: number,
  episode: number,
  isMovie: boolean
): StreamSource[] {
  const s: StreamSource[] = [];

  if (tmdbId) {
    if (isMovie) {
      // ── SUB ──
      s.push({ type: "embed", url: `https://vidsrc.to/embed/movie/${tmdbId}`, provider: "VidSrc.to", lang: "sub" });
      s.push({ type: "embed", url: `https://vidsrc.xyz/embed/movie/${tmdbId}`, provider: "VidSrc.xyz", lang: "sub" });
      s.push({ type: "embed", url: `https://vidsrc-embed.ru/embed/movie?tmdb=${tmdbId}`, provider: "VidSrc.me", lang: "sub" });
      s.push({ type: "embed", url: `https://vidlink.pro/movie/${tmdbId}`, provider: "VidLink", lang: "sub" });
      s.push({ type: "embed", url: `https://embed.su/embed/movie/${tmdbId}`, provider: "Embed.su", lang: "sub" });
      s.push({ type: "embed", url: `https://2embed.skin/embed/movie/${tmdbId}`, provider: "2Embed", lang: "sub" });
      // ── DUB (only genuine ones) ──
      s.push({ type: "embed", url: `https://vidlink.pro/movie/${tmdbId}?dubbing=true`, provider: "VidLink Dub", lang: "dub" });
    } else {
      // ── SUB ──
      s.push({ type: "embed", url: `https://vidsrc.to/embed/tv/${tmdbId}/${season}/${episode}`, provider: "VidSrc.to", lang: "sub" });
      s.push({ type: "embed", url: `https://vidsrc.xyz/embed/tv/${tmdbId}/${season}/${episode}`, provider: "VidSrc.xyz", lang: "sub" });
      s.push({ type: "embed", url: `https://vidsrc-embed.ru/embed/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}`, provider: "VidSrc.me", lang: "sub" });
      s.push({ type: "embed", url: `https://vidlink.pro/tv/${tmdbId}/${season}/${episode}`, provider: "VidLink", lang: "sub" });
      s.push({ type: "embed", url: `https://embed.su/embed/tv/${tmdbId}/${season}/${episode}`, provider: "Embed.su", lang: "sub" });
      s.push({ type: "embed", url: `https://2embed.skin/embed/tv/${tmdbId}/${season}/${episode}`, provider: "2Embed", lang: "sub" });
      // ── DUB (only genuine ones) ──
      s.push({ type: "embed", url: `https://vidlink.pro/tv/${tmdbId}/${season}/${episode}?dubbing=true`, provider: "VidLink Dub", lang: "dub" });
    }
  }

  if (imdbId) {
    if (isMovie) {
      s.push({ type: "embed", url: `https://vidsrc.to/embed/movie/${imdbId}`, provider: "VidSrc IMDb", lang: "sub" });
    } else {
      s.push({ type: "embed", url: `https://vidsrc.to/embed/tv/${imdbId}/${season}/${episode}`, provider: "VidSrc IMDb", lang: "sub" });
    }
  }

  return s;
}
