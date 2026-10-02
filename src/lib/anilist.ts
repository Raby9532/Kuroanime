const ANILIST_URL = "https://graphql.anilist.co";

const DEFAULT_REVALIDATE = 900;

const MEDIA_FIELDS = `
  id idMal
  isAdult
  title { romaji english native userPreferred }
  description(asHtml: false)
  coverImage { extraLarge large medium color }
  bannerImage
  format status episodes duration
  season seasonYear startDate { year month day }
  genres studios(isMain: true) { nodes { name } }
  averageScore popularity trending
  tags { name rank isMediaSpoiler }
  externalLinks { site url }
  trailer { id site }
  nextAiringEpisode { episode airingAt }
  characters(sort: ROLE, role: MAIN, perPage: 8) {
    edges { role node { id name { full } image { medium } } }
  }
  relations {
    edges {
      relationType(version: 2)
      node { id title { userPreferred } coverImage { large } format }
    }
  }
`;

// Thrown only when AniList genuinely confirms the media doesn't exist —
// callers can safely call notFound() only on this, never on generic errors.
export class AnilistNotFoundError extends Error {
  constructor(message = "Not Found") {
    super(message);
    this.name = "AnilistNotFoundError";
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function query<T>(
  q: string,
  variables?: Record<string, unknown>,
  revalidate = DEFAULT_REVALIDATE,
  maxRetries = 3
): Promise<T> {
  let lastError: unknown = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    let res: Response;
    try {
      res = await fetch(ANILIST_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          // AniList sits behind Cloudflare and can 403 requests that look
          // like bare server-to-server calls with no UA/Accept-Language.
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          "Accept-Language": "en-US,en;q=0.9",
        },
        body: JSON.stringify({ query: q, variables }),
        next: { revalidate },
      });
    } catch (networkErr) {
      lastError = networkErr;
      if (attempt < maxRetries) {
        await sleep(300 * Math.pow(2, attempt));
        continue;
      }
      throw new Error("AniList unreachable: network error");
    }

    // Rate limit / transient block — retry with backoff instead of failing
    // the whole page immediately.
    if (res.status === 403 || res.status === 429 || res.status >= 500) {
      lastError = new Error(`AniList error: ${res.status}`);
      if (attempt < maxRetries) {
        const retryAfter = Number(res.headers.get("retry-after"));
        const wait = !isNaN(retryAfter) && retryAfter > 0
          ? retryAfter * 1000
          : 400 * Math.pow(2, attempt);
        await sleep(wait);
        continue;
      }
      throw lastError;
    }

    if (!res.ok) {
      // Non-retryable HTTP failure (400, etc).
      throw new Error(`AniList error: ${res.status}`);
    }

    const json = await res.json();

    if (json.errors) {
      const firstError = json.errors[0];
      // AniList returns a real 404-style GraphQL error when the ID genuinely
      // doesn't exist — only THIS should ever trigger notFound() upstream.
      if (firstError?.status === 404 || /not found/i.test(firstError?.message || "")) {
        throw new AnilistNotFoundError(firstError.message);
      }
      lastError = new Error(firstError.message);
      if (attempt < maxRetries) {
        await sleep(400 * Math.pow(2, attempt));
        continue;
      }
      throw lastError;
    }

    return json.data as T;
  }

  throw lastError instanceof Error ? lastError : new Error("AniList request failed");
}

// Build-time / transient safety net.
// AniList sits behind Cloudflare and frequently 403s requests coming from
// CI + serverless build IPs (Vercel). A 403 during `next build` used to crash
// prerendering of /home and /schedule and fail the whole deployment.
// List endpoints are non-critical: if AniList is unreachable, return a
// fallback (usually an empty list) and let the page render. ISR will fill it
// in on the next successful revalidation.
async function safe<T>(fn: () => Promise<T>, fallback: T, label: string): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    console.warn(`[anilist] ${label} failed, using fallback:`, (err as Error)?.message);
    return fallback;
  }
}

export async function getTrending(page = 1, perPage = 20) {
  const q = `
    query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        media(sort: TRENDING_DESC, type: ANIME, isAdult: false) {
          ${MEDIA_FIELDS}
        }
      }
    }
  `;
  return safe(async () => {
    const data = await query<{ Page: { media: AnilistMedia[] } }>(q, { page, perPage });
    return data.Page.media;
  }, [] as AnilistMedia[], "getTrending");
}

export async function getPopular(page = 1, perPage = 20) {
  const q = `
    query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        media(sort: POPULARITY_DESC, type: ANIME, isAdult: false) {
          ${MEDIA_FIELDS}
        }
      }
    }
  `;
  return safe(async () => {
    const data = await query<{ Page: { media: AnilistMedia[] } }>(q, { page, perPage });
    return data.Page.media;
  }, [] as AnilistMedia[], "getPopular");
}

export async function getSeasonalAnime(season?: string, year?: number) {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentSeason =
    currentMonth <= 3 ? "WINTER"
    : currentMonth <= 6 ? "SPRING"
    : currentMonth <= 9 ? "SUMMER"
    : "FALL";

  const q = `
    query ($season: MediaSeason, $year: Int, $page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        media(season: $season, seasonYear: $year, sort: POPULARITY_DESC, type: ANIME, isAdult: false) {
          ${MEDIA_FIELDS}
        }
      }
    }
  `;
  return safe(async () => {
    const data = await query<{ Page: { media: AnilistMedia[] } }>(
      q,
      { season: season || currentSeason, year: year || now.getFullYear(), page: 1, perPage: 20 },
      3600
    );
    return data.Page.media;
  }, [] as AnilistMedia[], "getSeasonalAnime");
}

export async function searchAnime(search: string, page = 1, perPage = 20) {
  const q = `
    query ($search: String, $page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        pageInfo { total currentPage lastPage hasNextPage }
        media(search: $search, type: ANIME, isAdult: false, sort: SEARCH_MATCH) {
          ${MEDIA_FIELDS}
        }
      }
    }
  `;
  return safe(async () => {
    const data = await query<{ Page: { pageInfo: PageInfo; media: AnilistMedia[] } }>(
      q, { search, page, perPage }, 60
    );
    return data.Page;
  }, EMPTY_PAGE, "searchAnime");
}

export async function getAnimeById(id: number) {
  const q = `
    query ($id: Int) {
      Media(id: $id, type: ANIME) {
        ${MEDIA_FIELDS}
        recommendations(perPage: 8, sort: RATING_DESC) {
          nodes {
            mediaRecommendation {
              id title { userPreferred } coverImage { large } format isAdult
            }
          }
        }
      }
    }
  `;
  const data = await query<{ Media: AnilistMedia | null }>(
    q,
    { id },
    300 // 5 min — keeps episode counts fresh for airing anime
  );

  // AniList can return { Media: null } with no errors array for a bad ID.
  if (!data.Media) {
    throw new AnilistNotFoundError();
  }

  // Block direct access to adult titles by ID — even if someone knows
  // or guesses the AniList ID of adult content, don't serve it.
  if ((data.Media as any).isAdult) {
    throw new AnilistNotFoundError("Content not available");
  }

  // Filter adult recommendations client-side — AniList's recommendations
  // connection has no isAdult filter argument.
  if (data.Media.recommendations?.nodes) {
    data.Media.recommendations.nodes = data.Media.recommendations.nodes.filter(
      (n) => n.mediaRecommendation && !(n.mediaRecommendation as any).isAdult
    );
  }

  return data.Media;
}

export async function getAnimeByMalId(malId: number) {
  const q = `
    query ($malId: Int) {
      Media(idMal: $malId, type: ANIME) { ${MEDIA_FIELDS} }
    }
  `;
  const data = await query<{ Media: (AnilistMedia & { isAdult?: boolean }) | null }>(q, { malId });
  if (!data.Media) {
    throw new AnilistNotFoundError();
  }
  if (data.Media?.isAdult) {
    throw new AnilistNotFoundError("Content not available");
  }
  return data.Media;
}

export async function getTopAnime(page = 1, perPage = 50) {
  const q = `
    query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        pageInfo { total currentPage lastPage hasNextPage }
        media(sort: SCORE_DESC, type: ANIME, isAdult: false, status_not: NOT_YET_RELEASED) {
          ${MEDIA_FIELDS}
        }
      }
    }
  `;
  return safe(async () => {
    const data = await query<{ Page: { pageInfo: PageInfo; media: AnilistMedia[] } }>(
      q, { page, perPage }, 3600
    );
    return data.Page;
  }, EMPTY_PAGE, "getTopAnime");
}

export async function getAnimeByGenre(genre: string, page = 1, perPage = 30) {
  const q = `
    query ($genre: String, $page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        pageInfo { total currentPage lastPage hasNextPage }
        media(genre: $genre, sort: POPULARITY_DESC, type: ANIME, isAdult: false) {
          ${MEDIA_FIELDS}
        }
      }
    }
  `;
  return safe(async () => {
    const data = await query<{ Page: { pageInfo: PageInfo; media: AnilistMedia[] } }>(
      q, { genre, page, perPage }, 3600
    );
    return data.Page;
  }, EMPTY_PAGE, "getAnimeByGenre");
}

export async function getAiringSchedule() {
  const now = Math.floor(Date.now() / 1000);
  const twoDaysAgo = now - 2 * 24 * 60 * 60;
  const weekLater = now + 7 * 24 * 60 * 60;

  const q = `
    query ($from: Int, $to: Int) {
      Page(perPage: 50) {
        airingSchedules(airingAt_greater: $from, airingAt_lesser: $to, sort: TIME) {
          airingAt episode
          media {
            id title { english romaji }
            coverImage { large medium }
            format episodes status
            isAdult
          }
        }
      }
    }
  `;
  return safe(async () => {
    const data = await query<{
      Page: { airingSchedules: (AiringSchedule & { media: { isAdult?: boolean } })[] };
    }>(q, { from: twoDaysAgo, to: weekLater }, 300);

    // AniList's airingSchedules endpoint has no isAdult filter argument —
    // must filter client-side. Without this, hentai/adult content shows
    // unfiltered on the public homepage "Latest Episodes" section.
    return data.Page.airingSchedules.filter((s) => !s.media.isAdult);
  }, [] as AiringSchedule[], "getAiringSchedule");
}

const EMPTY_PAGE: { pageInfo: PageInfo; media: AnilistMedia[] } = {
  pageInfo: { total: 0, currentPage: 1, lastPage: 1, hasNextPage: false },
  media: [],
};

export const ALL_GENRES = [
  "Action", "Adventure", "Comedy", "Drama", "Fantasy",
  "Horror", "Mecha", "Music", "Mystery", "Psychological",
  "Romance", "Sci-Fi", "Slice of Life", "Sports",
  "Supernatural", "Thriller", "Isekai", "Harem",
];

// ── Types ──────────────────────────────────────────────────────────────────

export interface AnilistMedia {
  id: number;
  idMal: number | null;
  isAdult?: boolean;
  title: { romaji: string; english: string | null; native: string; userPreferred: string };
  description: string | null;
  coverImage: { extraLarge: string; large: string; medium: string; color: string | null };
  bannerImage: string | null;
  format: string | null;
  status: string | null;
  episodes: number | null;
  duration: number | null;
  season: string | null;
  seasonYear: number | null;
  startDate: { year: number | null; month: number | null; day: number | null };
  genres: string[];
  averageScore: number | null;
  popularity: number | null;
  trending: number | null;
  studios: { nodes: { name: string }[] };
  tags: { name: string; rank: number; isMediaSpoiler: boolean }[];
  externalLinks: { site: string; url: string }[];
  trailer: { id: string; site: string } | null;
  nextAiringEpisode: { episode: number; airingAt: number } | null;
  characters: {
    edges: {
      role: string;
      node: { id: number; name: { full: string }; image: { medium: string } };
    }[];
  };
  relations: {
    edges: {
      relationType: string;
      node: {
        id: number;
        title: { userPreferred: string };
        coverImage: { large: string };
        format: string | null;
      };
    }[];
  };
  recommendations?: {
    nodes: {
      mediaRecommendation: {
        id: number;
        title: { userPreferred: string };
        coverImage: { large: string };
        format: string | null;
      } | null;
    }[];
  };
}

export interface AiringSchedule {
  airingAt: number;
  episode: number;
  media: {
    id: number;
    title: { english: string | null; romaji: string };
    coverImage: { large: string; medium: string };
    format: string | null;
    episodes: number | null;
    status?: string | null;
  };
}

interface PageInfo {
  total: number;
  currentPage: number;
  lastPage: number;
  hasNextPage: boolean;
}
