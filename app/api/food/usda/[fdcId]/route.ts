import { NextResponse } from "next/server";
import { normalizeUsdaFood } from "@/lib/foodApiServer";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ fdcId: string }> }
) {
  const { fdcId } = await params;
  const apiKey = process.env.USDA_FDC_API_KEY ?? "DEMO_KEY";
  const url = `https://api.nal.usda.gov/fdc/v1/food/${encodeURIComponent(fdcId)}?api_key=${apiKey}`;

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) {
      return NextResponse.json({ error: `USDA API responded with ${res.status}` }, { status: 502 });
    }
    const food = await res.json();
    const normalized = normalizeUsdaFood(food);
    if (!normalized) {
      return NextResponse.json({ error: "Food not found or has insufficient data" }, { status: 404 });
    }
    return NextResponse.json(normalized);
  } catch (err) {
    console.error("USDA food detail error:", err);
    return NextResponse.json({ error: "Failed to fetch food details. Please try again." }, { status: 502 });
  }
}
