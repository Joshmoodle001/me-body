import { NextResponse } from "next/server";
import { normalizeUsdaFood } from "@/lib/foodApiServer";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  if (!query || query.trim().length === 0) {
    return NextResponse.json({ error: "Query parameter 'q' is required" }, { status: 400 });
  }

  const apiKey = process.env.USDA_FDC_API_KEY ?? "DEMO_KEY";
  const url = `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${apiKey}&query=${encodeURIComponent(query.trim())}&pageSize=20&dataType=Foundation,SR%20Legacy,Branded`;

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) {
      return NextResponse.json({ error: `USDA API responded with ${res.status}` }, { status: 502 });
    }
    const data = await res.json();
    const foods = (data.foods ?? []).map(normalizeUsdaFood).filter(Boolean);
    return NextResponse.json(foods);
  } catch (err) {
    console.error("USDA search error:", err);
    return NextResponse.json({ error: "Failed to search USDA food database. Please try again." }, { status: 502 });
  }
}
