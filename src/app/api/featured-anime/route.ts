import { NextResponse } from "next/server";
import { getTrending } from "@/lib/anilist";

export async function GET() {
  const trending = await getTrending(1, 5).catch(() => []);
  const pick = trending[Math.floor(Math.random() * trending.length)];
  if (!pick) return NextResponse.json(null);
  return NextResponse.json({
    title: pick.title.english || pick.title.romaji,
    image: pick.coverImage.extraLarge,
  });
}
