// src/app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateProfileSchema } from "@/lib/validations";

// GET /api/users/[id] — public profile
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id, isActive: true },
      select: {
        id: true,
        name: true,
        phone: true,
        telegram: true,
        avatar: true,
        createdAt: true,
        _count: { select: { products: true } },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ data: user });
  } catch (error) {
    console.error("[GET /api/users/id]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/users/[id] — update own profile
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sessionUserId = (session.user as any).id;
    const sessionRole = (session.user as any).role;

    // Only the user themselves or an admin can update
    if (sessionUserId !== params.id && sessionRole !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = updateProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, phone, telegram, avatar } = parsed.data;

    // Normalize telegram
    const normalizedTelegram = telegram
      ? telegram.startsWith("@") ? telegram.slice(1) : telegram
      : null;

    const updated = await prisma.user.update({
      where: { id: params.id },
      data: {
        name,
        phone: phone || null,
        telegram: normalizedTelegram,
        avatar: avatar || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        telegram: true,
        avatar: true,
        role: true,
      },
    });

    return NextResponse.json({ data: updated, message: "Profile updated" });
  } catch (error) {
    console.error("[PATCH /api/users/id]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/users/[id] — admin only
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sessionRole = (session.user as any).role;
    if (sessionRole !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.user.delete({ where: { id: params.id } });

    return NextResponse.json({ message: "User deleted" });
  } catch (error) {
    console.error("[DELETE /api/users/id]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
