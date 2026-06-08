import type { NormalizedFood } from "./foodApiServer";

const API_BASE = "";

export async function searchUsda(query: string): Promise<NormalizedFood[]> {
  if (!query.trim()) return [];
  const res = await fetch(`${API_BASE}/api/food/usda/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error("USDA search failed");
  return res.json();
}

export async function getUsdaFood(fdcId: string): Promise<NormalizedFood | null> {
  const res = await fetch(`${API_BASE}/api/food/usda/${encodeURIComponent(fdcId)}`);
  if (!res.ok) throw new Error("USDA food fetch failed");
  return res.json();
}

export async function lookupBarcode(barcode: string): Promise<NormalizedFood | { not_found: true }> {
  const res = await fetch(`${API_BASE}/api/food/open-food-facts/${encodeURIComponent(barcode)}`);
  if (!res.ok) throw new Error("Barcode lookup failed");
  return res.json();
}

export async function fetchFromAPI(url: string): Promise<Response> {
  const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res;
}
