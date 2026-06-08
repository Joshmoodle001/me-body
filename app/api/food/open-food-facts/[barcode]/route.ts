import { NextResponse } from "next/server";
import { normalizeOpenFoodFactsProduct } from "@/lib/foodApiServer";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ barcode: string }> }
) {
  const { barcode } = await params;
  const userAgent = process.env.OPEN_FOOD_FACTS_USER_AGENT ?? "MeBody/0.1";

  try {
    const res = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}`,
      {
        headers: { "User-Agent": userAgent },
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!res.ok) {
      return NextResponse.json({ error: "Open Food Facts API unavailable" }, { status: 502 });
    }

    const data = await res.json();
    if (data.status === 0) {
      return NextResponse.json({ not_found: true, barcode }, { status: 200 });
    }

    const normalized = normalizeOpenFoodFactsProduct(data);
    if (!normalized) {
      return NextResponse.json({ not_found: true, barcode }, { status: 200 });
    }

    return NextResponse.json(normalized);
  } catch (err) {
    console.error("Open Food Facts lookup error:", err);
    return NextResponse.json({ error: "Failed to look up barcode. Please try again." }, { status: 502 });
  }
}
