import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, avatarPreset } = await req.json();

  if (name && (name.length < 2 || name.length > 24)) {
    return NextResponse.json({ error: "Name must be 2-24 characters" }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      ...(name ? { name: name.trim() } : {}),
      ...(avatarPreset ? { avatarPreset } : {}),
    },
  });

  return NextResponse.json({ name: updated.name, avatarPreset: updated.avatarPreset });
}
