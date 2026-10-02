import { AVATAR_ART, AVATAR_IDS } from "@/lib/avatar-art";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return AVATAR_IDS.map((id) => ({ id }));
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const svg = AVATAR_ART[params.id];
  if (!svg) return new Response("Not found", { status: 404 });
  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
