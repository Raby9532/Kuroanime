import { NextRequest, NextResponse } from "next/server";
import {
  searchGogoanime, getGogoanimeEpisodes, getGogoanimeStream,
  searchAnimePahe, getAnimePaheStream,
} from "@/lib/streaming";

export const runtime = "nodejs";

const HIANIME_API  = "https://hi-anime-api-silk.vercel.app";
const ANIKOTO_API  = "https://anikoto-six.vercel.app";
const ANIKOTO_DATA = "https://anikotoapi.site";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function bestMatch(results: { id: string; title: string }[], title: string) {
  const clean = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();
  const target = clean(title);
  let best = results[0], bestScore = 0;
  for (const r of results) {
    const c = clean(r.title);
    if (c === target) return r;
    const score = target.split(" ").filter((w) => c.includes(w)).length / target.split(" ").length;
    if (score > bestScore) { bestScore = score; best = r; }
  }
  return best;
}

const FETCH_OPTS = (ms = 8000) => ({
  headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36", "Accept": "application/json" },
  signal: AbortSignal.timeout(ms),
});

// ─── MegaPlay via Anikoto s-2 ──────────────────────────────────────────────────
interface AnikotoEpisodeData {
  id?: number | string; number?: number; episode_number?: number;
  episode_embed_id?: string | number; embed_id?: string | number;
  embed_url?: { sub?: string; dub?: string };
}

async function getMegaplayEmbeds(title: string, episode: number) {
  try {
    const searchRes = await fetch(`${ANIKOTO_API}/api/search?keyword=${encodeURIComponent(title)}`, { ...FETCH_OPTS(), next: { revalidate: 3600 } } as RequestInit);
    if (!searchRes.ok) return [];
    const searchData = await searchRes.json();
    const results: { id?: string; slug?: string; name?: string; title?: string }[] = searchData?.results || searchData?.data || searchData?.animes || [];
    if (!results.length) return [];
    const clean = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();
    const target = clean(title);
    let best = results[0], bestScore = 0;
    for (const r of results) { const c = clean(r.name || r.title || ""); if (c === target) { best = r; break; } const score = target.split(" ").filter((w) => c.includes(w)).length / target.split(" ").length; if (score > bestScore) { bestScore = score; best = r; } }
    const seriesId = best.id || best.slug; if (!seriesId) return [];
    const seriesRes = await fetch(`${ANIKOTO_DATA}/series/${seriesId}`, { ...FETCH_OPTS(), next: { revalidate: 300 } } as RequestInit);
    if (!seriesRes.ok) return [];
    const seriesData = await seriesRes.json();
    const episodes: AnikotoEpisodeData[] = seriesData?.episodes || seriesData?.data?.episodes || seriesData?.anime?.episodes || [];
    if (!episodes.length) return [];
    const ep = episodes.find((e) => (e.number ?? e.episode_number) === episode) || episodes[episode - 1];
    if (!ep) return [];
    const out: { type: "embed"; url: string; provider: string; lang: string }[] = [];
    if (ep.embed_url?.sub) out.push({ type: "embed", url: ep.embed_url.sub, provider: "Anikoto Sub", lang: "sub" });
    if (ep.embed_url?.dub) out.push({ type: "embed", url: ep.embed_url.dub, provider: "Anikoto Dub", lang: "dub" });
    const embedId = ep.episode_embed_id ?? ep.embed_id;
    if (embedId && !ep.embed_url?.sub) {
      out.push({ type: "embed", url: `https://megaplay.buzz/stream/s-2/${embedId}/sub`, provider: "MegaPlay Sub", lang: "sub" });
    }
    return out;
  } catch { return []; }
}

// ─── Anikoto m3u8 (SUB + DUB dono fetch karta hai) ────────────────────────────
async function getAnikotoM3u8(title: string, episode: number, category: "sub" | "dub") {
  try {
    const searchRes = await fetch(`${ANIKOTO_API}/api/search?keyword=${encodeURIComponent(title)}`, { ...FETCH_OPTS(), next: { revalidate: 3600 } } as RequestInit);
    if (!searchRes.ok) return []; const sd = await searchRes.json();
    const results: { id?: string; slug?: string; name?: string; title?: string }[] = sd?.results || sd?.data || sd?.animes || [];
    if (!results.length) return [];
    const clean = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim(); const target = clean(title);
    let best = results[0], bestScore = 0;
    for (const r of results) { const c = clean(r.name || r.title || ""); if (c === target) { best = r; break; } const score = target.split(" ").filter((w) => c.includes(w)).length / target.split(" ").length; if (score > bestScore) { bestScore = score; best = r; } }
    const slug = best.id || best.slug; if (!slug) return [];
    const watchRes = await fetch(`${ANIKOTO_API}/api/watch/${slug}?ep=${episode}`, { ...FETCH_OPTS(), next: { revalidate: 300 } } as RequestInit);
    if (!watchRes.ok) return []; const wd = await watchRes.json();
    const rawSources: { url?: string; isM3U8?: boolean; quality?: string }[] = wd?.sources || wd?.data?.sources || [];
    const tracks: { file?: string; src?: string; label?: string; kind?: string }[] = wd?.tracks || wd?.data?.tracks || [];
    const subtitles = tracks.filter((t) => t.kind === "captions" || t.kind === "subtitles").map((t) => ({ url: t.file || t.src || "", lang: t.label || "Unknown" })).filter((t) => t.url);
    const proxyBase: string = wd?.proxyUrl || "";
    return rawSources.filter((s) => s.url && (s.isM3U8 || s.url.includes(".m3u8"))).map((s) => ({ type: "m3u8" as const, url: proxyBase ? `${proxyBase}${encodeURIComponent(s.url!)}` : s.url!, provider: `Anikoto ${category === "sub" ? "Sub" : "Dub"} (${s.quality || "HD"})`, lang: category, subtitles }));
  } catch { return []; }
}

// ─── HiAnime m3u8 (SUB + DUB dono fetch) ──────────────────────────────────────
async function getHiAnimeM3u8(title: string, episode: number) {
  try {
    const searchRes = await fetch(`${HIANIME_API}/api/search?keyword=${encodeURIComponent(title)}`, { ...FETCH_OPTS(), next: { revalidate: 3600 } } as RequestInit);
    if (!searchRes.ok) return []; const sd = await searchRes.json();
    const animes: { id: string; name?: string; title?: string }[] = sd?.results || sd?.animes || sd?.data?.animes || [];
    if (!animes.length) return [];
    const clean = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim(); const target = clean(title);
    let best = animes[0], bestScore = 0;
    for (const a of animes) { const c = clean(a.name || a.title || ""); if (c === target) { best = a; break; } const score = target.split(" ").filter((w) => c.includes(w)).length / target.split(" ").length; if (score > bestScore) { bestScore = score; best = a; } }
    const animeRes = await fetch(`${HIANIME_API}/api/anime/${best.id}`, { ...FETCH_OPTS(), next: { revalidate: 300 } } as RequestInit);
    if (!animeRes.ok) return []; const ad = await animeRes.json();
    const episodes: { id: string; number?: number; episodeId?: string }[] = ad?.episodes || ad?.data?.episodes || ad?.results?.episodes || [];
    if (!episodes.length) return []; const ep = episodes.find((e) => e.number === episode) || episodes[episode - 1]; if (!ep) return [];
    const episodeId = ep.episodeId || ep.id; if (!episodeId) return [];
    const sources: { type: "m3u8"; url: string; provider: string; lang: string; subtitles?: { url: string; lang: string }[] }[] = [];
    for (const cat of ["sub", "dub"] as const) {
      try {
        const srcRes = await fetch(`${HIANIME_API}/api/episode-srcs?id=${episodeId}&server=megacloud&category=${cat}`, { ...FETCH_OPTS(), next: { revalidate: 300 } } as RequestInit);
        if (!srcRes.ok) continue; const srcData = await srcRes.json();
        const link = srcData?.link || srcData?.sources?.[0]?.url || srcData?.data?.sources?.[0]?.url; if (!link) continue;
        const subtitles = (srcData?.tracks || []).filter((t: { kind?: string }) => t.kind === "captions" || t.kind === "subtitles").map((t: { file?: string; label?: string }) => ({ url: t.file || "", lang: t.label || "Unknown" })).filter((t: { url: string }) => t.url);
        sources.push({ type: "m3u8", url: link, provider: `HiAnime ${cat === "sub" ? "Sub" : "Dub"}`, lang: cat, subtitles });
      } catch {}
    }
    return sources;
  } catch { return []; }
}

// ─── TMDB lookup ──────────────────────────────────────────────────────────────
function stripSeasonSuffix(title: string): string {
  return title.replace(/\s*(season|s)\s*\d+.*$/i, "").replace(/\s*(part|cour)\s*\d+.*$/i, "").replace(/\s*\d+(st|nd|rd|th)\s*season.*$/i, "").trim();
}

async function getTmdbId(title: string, isMovie: boolean, year?: number): Promise<number | null> {
  const key = process.env.TMDB_API_KEY; if (!key) return null;
  const cleanTitle = stripSeasonSuffix(title);
  const mediaType = isMovie ? "movie" : "tv";
  const yearParam = isMovie ? "primary_release_year" : "first_air_date_year";

  try {
    // Attempt 1: clean title + year filter — critical for disambiguating
    // remakes / re-releases sharing the same base name.
    if (year) {
      const p1 = new URLSearchParams({ api_key: key, query: cleanTitle, [yearParam]: String(year) });
      const r1 = await fetch(`https://api.themoviedb.org/3/search/${mediaType}?${p1}`, { next: { revalidate: 86400 } });
      const d1 = await r1.json();
      if (d1.results?.[0]?.id) return d1.results[0].id;
    }

    // Attempt 2: clean title, no year filter
    const p2 = new URLSearchParams({ api_key: key, query: cleanTitle });
    const r2 = await fetch(`https://api.themoviedb.org/3/search/${mediaType}?${p2}`, { next: { revalidate: 86400 } });
    const d2 = await r2.json();
    if (d2.results?.[0]?.id) return d2.results[0].id;

    // Attempt 3: full original title as last resort
    if (cleanTitle !== title) {
      const p3 = new URLSearchParams({ api_key: key, query: title });
      const r3 = await fetch(`https://api.themoviedb.org/3/search/${mediaType}?${p3}`, { next: { revalidate: 86400 } });
      const d3 = await r3.json();
      if (d3.results?.[0]?.id) return d3.results[0].id;
    }

    return null;
  } catch { return null; }
}

// Resolves the REAL TMDB season number by matching air-year instead of
// guessing from title text — fixes titles like "Final Season", "Kai" etc
// that don't carry a plain digit the old regex could catch.
async function resolveSeasonNumber(tmdbId: number, year: number | undefined, fallback: number): Promise<number> {
  const key = process.env.TMDB_API_KEY;
  if (!key || !year) return fallback;
  try {
    const r = await fetch(`https://api.themoviedb.org/3/tv/${tmdbId}?api_key=${key}`, { next: { revalidate: 86400 } });
    const d = await r.json();
    const seasons: { season_number: number; air_date?: string }[] = d?.seasons || [];
    const real = seasons.filter((s) => s.season_number > 0 && s.air_date);
    if (!real.length) return fallback;

    let best = real[0], bestDiff = Infinity;
    for (const s of real) {
      const y = parseInt(s.air_date!.slice(0, 4));
      const diff = Math.abs(y - year);
      if (diff < bestDiff) { bestDiff = diff; best = s; }
    }
    return best.season_number;
  } catch {
    return fallback;
  }
}

// ─── Route handler ────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const sp = new URL(req.url).searchParams;
  const title    = sp.get("title");
  const episode  = parseInt(sp.get("episode") || "1");
  const provider = sp.get("provider") || "gogoanime";
  const season   = parseInt(sp.get("season") || "1");
  const year     = sp.get("year") ? parseInt(sp.get("year")!) : undefined;
  const isMovie  = sp.get("isMovie") === "true";

  if (!title) return NextResponse.json({ error: "title required" }, { status: 400 });

  if (provider === "megaplay") { const sources = await getMegaplayEmbeds(title, episode); return NextResponse.json({ sources }); }
  if (provider === "anikoto") { const [sub, dub] = await Promise.all([getAnikotoM3u8(title, episode, "sub"), getAnikotoM3u8(title, episode, "dub")]); return NextResponse.json({ sources: [...sub, ...dub] }); }
  if (provider === "hianime") { return NextResponse.json({ sources: await getHiAnimeM3u8(title, episode) }); }

  if (provider === "tmdb") {
    const tmdbId = await getTmdbId(title, isMovie, year);
    if (!tmdbId) return NextResponse.json({ sources: [] });

    let sources: { type: string; url: string; provider: string; lang: string }[] = [];

    if (isMovie) {
      sources = [
        { type: "embed", url: `https://vidsrc.to/embed/movie/${tmdbId}`,      provider: "VidSrc.to",   lang: "sub" },
        { type: "embed", url: `https://vidsrc.xyz/embed/movie/${tmdbId}`,     provider: "VidSrc.xyz",  lang: "sub" },
        { type: "embed", url: `https://vidsrc-embed.ru/embed/movie?tmdb=${tmdbId}`, provider: "VidSrc.me", lang: "sub" },
        { type: "embed", url: `https://vidlink.pro/movie/${tmdbId}`,          provider: "VidLink",     lang: "sub" },
        { type: "embed", url: `https://embed.su/embed/movie/${tmdbId}`,       provider: "Embed.su",    lang: "sub" },
        { type: "embed", url: `https://2embed.skin/embed/movie/${tmdbId}`,    provider: "2Embed",      lang: "sub" },
        // Only genuine dub — VidLink's dubbing param actually changes audio.
        { type: "embed", url: `https://vidlink.pro/movie/${tmdbId}?dubbing=true`, provider: "VidLink Dub", lang: "dub" },
      ];
    } else {
      const realSeason = await resolveSeasonNumber(tmdbId, year, season);

      sources = [
        { type: "embed", url: `https://vidsrc.to/embed/tv/${tmdbId}/${realSeason}/${episode}`, provider: "VidSrc.to",   lang: "sub" },
        { type: "embed", url: `https://vidsrc.xyz/embed/tv/${tmdbId}/${realSeason}/${episode}`, provider: "VidSrc.xyz",  lang: "sub" },
        { type: "embed", url: `https://vidsrc-embed.ru/embed/tv?tmdb=${tmdbId}&season=${realSeason}&episode=${episode}`, provider: "VidSrc.me", lang: "sub" },
        { type: "embed", url: `https://vidsrcme.su/embed/tv?tmdb=${tmdbId}&season=${realSeason}&episode=${episode}`,     provider: "VidSrc.me 2", lang: "sub" },
        { type: "embed", url: `https://vaplayer.ru/embed/tv/${tmdbId}/${realSeason}/${episode}`, provider: "VidAPI",     lang: "sub" },
        { type: "embed", url: `https://vidlink.pro/tv/${tmdbId}/${realSeason}/${episode}`,       provider: "VidLink",    lang: "sub" },
        { type: "embed", url: `https://embed.su/embed/tv/${tmdbId}/${realSeason}/${episode}`,   provider: "Embed.su",   lang: "sub" },
        // Only genuine dub — VidLink's dubbing param actually changes audio.
        { type: "embed", url: `https://vidlink.pro/tv/${tmdbId}/${realSeason}/${episode}?dubbing=true`, provider: "VidLink Dub", lang: "dub" },
      ];
    }
    return NextResponse.json({ sources, tmdbId });
  }

  if (provider === "animepahe") {
    try {
      const results = await searchAnimePahe(title); if (!results.length) return NextResponse.json({ sources: [] });
      const match = bestMatch(results, title);
      const sources = await getAnimePaheStream(`${match.id}/${episode}`);
      return NextResponse.json({ sources: sources.map((s) => ({ ...s, lang: "sub" })) });
    } catch { return NextResponse.json({ sources: [] }); }
  }

  // ── GogoAnime (default) ──
  try {
    const searchTitles = [title, title.replace(/\s+season\s+\d+/i, "").trim(), title.split(" ").slice(0, 3).join(" ")].filter((t, i, a) => a.indexOf(t) === i);
    let results: Awaited<ReturnType<typeof searchGogoanime>> = [];
    for (const t of searchTitles) { results = await searchGogoanime(t); if (results.length) break; }
    if (!results.length) return NextResponse.json({ sources: [] });
    const match = bestMatch(results, title); const eps = await getGogoanimeEpisodes(match.id);
    const ep = eps.find((e) => e.number === episode) || eps[episode - 1]; if (!ep) return NextResponse.json({ sources: [] });
    const sources = await getGogoanimeStream(ep.id);
    return NextResponse.json({ sources: sources.map((s) => ({ ...s, lang: "sub" })) });
  } catch { return NextResponse.json({ sources: [], error: "fetch failed" }); }
}
