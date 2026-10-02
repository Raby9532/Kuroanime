import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { censorProfanity } from "@/lib/profanity";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const anilistId = parseInt(searchParams.get("anilistId") || "0");
  const episode = parseInt(searchParams.get("episode") || "1");

  const comments = await prisma.comment.findMany({
    where: { anilistId, episode, parentId: null },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      user: { select: { name: true, image: true, avatarPreset: true } },
      replies: {
        orderBy: { createdAt: "asc" },
        include: { user: { select: { name: true, image: true, avatarPreset: true } } },
      },
    },
  });
  return NextResponse.json(comments);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { anilistId, episode, content, parentId, isSpoiler } = await req.json();
  if (!content?.trim()) return NextResponse.json({ error: "Empty comment" }, { status: 400 });
  if (content.length > 500) return NextResponse.json({ error: "Too long" }, { status: 400 });

  const clean = censorProfanity(content.trim());

  const comment = await prisma.comment.create({
    data: {
      anilistId,
      episode,
      userId: session.user.id,
      content: clean,
      parentId: parentId || null,
      isSpoiler: !!isSpoiler,
    },
    include: { user: { select: { name: true, image: true, avatarPreset: true } } },
  });

  // Notify the parent comment's author, if this is a reply and not a self-reply.
  if (parentId) {
    const parent = await prisma.comment.findUnique({ where: { id: parentId } });
    if (parent && parent.userId !== session.user.id) {
      await prisma.notification.create({
        data: {
          userId: parent.userId,
          type: "reply",
          fromName: session.user.name || "Someone",
          commentId: comment.id,
          anilistId,
          episode,
        },
      });
    }
  }

  return NextResponse.json(comment);
}
