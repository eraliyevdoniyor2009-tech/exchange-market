// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations";
import { rateLimit, rateLimitHeaders } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  // Rate limit: 10 registrations per IP per 15 minutes
  const ip  = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rl  = rateLimit(`register:${ip}`, { max: 10, windowMs: 15 * 60_000 });
  const hdrs = rateLimitHeaders(rl);

  if (!rl.success) {
    return NextResponse.json(
      { error: "Too many registration attempts. Please try again later." },
      { status: 429, headers: hdrs }
    );
  }

  try {
    const body   = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400, headers: hdrs }
      );
    }

    const { name, email, password, phone, telegram } = parsed.data;

    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json(
        { error: "This email is already registered" },
        { status: 409, headers: hdrs }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const normalizedTelegram = telegram
      ? telegram.startsWith("@") ? telegram.slice(1) : telegram
      : null;

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone || null,
        telegram: normalizedTelegram,
      },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    return NextResponse.json(
      { message: "Account created successfully", user },
      { status: 201, headers: hdrs }
    );
  } catch (error) {
    console.error("[REGISTER]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
