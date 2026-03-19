// src/app/api/search/suggestions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSearchSuggestions } from "@/lib/data";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (query.length < 2) {
    return NextResponse.json({ data: [] });
  }

  try {
    const suggestions = await getSearchSuggestions(query);
    return NextResponse.json(
      { data: suggestions },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      }
    );
  } catch {
    return NextResponse.json({ data: [] });
  }
}
