import { MetadataRoute } from "next";
import { getTrending } from "@/lib/anilist";



export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {

  const staticPages: MetadataRoute.Sitemap = [
    { url: "https://kuroanime-green.vercel.app/home", lastModified: new Date(), priority: 1 },
    { url: "https://kuroanime-green.vercel.app/browse", lastModified: new Date(), priority: 0.8 },
    { url: "https://kuroanime-green.vercel.app/trending", lastModified: new Date(), priority: 0.8 },
    { url: "https://kuroanime-green.vercel.app/seasonal", lastModified: new Date(), priority: 0.7 },
    { url: "https://kuroanime-green.vercel.app/top", lastModified: new Date(), priority: 0.7 },
    { url: "https://kuroanime-green.vercel.app/schedule", lastModified: new Date(), priority: 0.6 },
  ];

  try {
    const trending = await getTrending(1, 50);
    const animePages: MetadataRoute.Sitemap = trending.map((a) => ({
      url: `https://kuroanime-green.vercel.app/anime/${a.id}`,
      lastModified: new Date(),
      priority: 0.6,
    }));
    return [...staticPages, ...animePages];
  } catch {
    return staticPages;
  }
}
