import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { censorProfanity } from "@/lib/profanity";

const EDIT_WINDOW_MS = 2 * 60 * 1000; // 2 minutes

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const comment = await prisma.comment.findUnique({ where: { id: params.id } });
  if (!comment) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (comment.userId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (Date.now() - comment.createdAt.getTime() > EDIT_WINDOW_MS) {
    return NextResponse.json({ error: "Edit window expired (2 min)" }, { status: 403 });
  }

  const { content } = await req.json();
  if (!content?.trim()) return NextResponse.json({ error: "Empty comment" }, { status: 400 });

  const updated = await prisma.comment.update({
    where: { id: params.id },
    data: { content: censorProfanity(content.trim()), editedAt: new Date() },
  });

  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const comment = await prisma.comment.findUnique({ where: { id: params.id } });
  if (!comment) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (comment.userId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.comment.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
