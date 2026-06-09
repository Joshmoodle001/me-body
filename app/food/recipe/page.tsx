"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import { getProfile, getContentItems } from "@/db/queries";
import type { DBContentItem } from "@/db/localDb";

export default function RecipePage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<DBContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const profile = await getProfile();
      const items = await getContentItems("meal_template", profile?.units ? "en-ZA" : undefined);
      setTemplates(items);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="app-container">
      <PageHeader title="Meal Builder" subtitle="Evidence-based meal templates with South African options" />

      <div className="card mb-4" style={{ background: "var(--brand-soft)", borderColor: "var(--brand-soft)" }}>
        <div className="flex items-start gap-2">
          <span className="text-lg shrink-0">&#127858;</span>
          <div>
            <p className="text-sm font-semibold" style={{ color: "var(--brand-dark)" }}>How meal templates work</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--brand)" }}>
              Each template shows a balanced meal structure with protein, carbs, vegetables, and healthy fat. Swap ingredients to match what you have available.
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="card skeleton" style={{ height: "80px" }} />)}
        </div>
      ) : templates.length === 0 ? (
        <EmptyState title="No meal templates yet" description="Meal templates will appear here as they are reviewed and approved." />
      ) : (
        <div className="space-y-3">
          {templates.map((t) => {
            let structure: any = {};
            try { structure = JSON.parse(t.body); } catch {}
            return (
              <div key={t.id} className="card">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0 mr-2">
                    <p className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>{t.title}</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{t.summary}</p>
                    {structure.portion && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {Object.entries(structure.portion).map(([key, val]: [string, any]) => (
                          <span key={key} className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: "var(--brand-soft)", color: "var(--brand-dark)" }}>
                            {key.replace(/_/g, " ")}: {val}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="badge badge-info text-[9px] shrink-0">SA</span>
                </div>
                {structure.structure && (
                  <div className="mt-2 pt-2" style={{ borderTop: "1px solid var(--border)" }}>
                    <div className="grid grid-cols-2 gap-1 text-[10px]">
                      {Object.entries(structure.structure).map(([slot, items]: [string, any]) => (
                        <div key={slot} className="truncate">
                          <span className="font-semibold capitalize" style={{ color: "var(--text-secondary)" }}>{slot}:</span>
                          <span style={{ color: "var(--text-muted)" }}> {Array.isArray(items) ? items.slice(0, 3).join(", ") : items}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {structure.notes && (
                  <p className="mt-2 text-[10px]" style={{ color: "var(--text-muted)", fontStyle: "italic" }}>{structure.notes}</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="card mt-4 text-center" style={{ background: "var(--card-muted)" }}>
        <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Create a custom recipe</p>
        <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
          Build and save your own recipes with ingredient scaling. Combine foods from your local database into a reusable recipe.
        </p>
        <button onClick={() => router.push("/food/manual")} className="mt-3 px-6 py-2.5 rounded-[var(--radius-button)] text-sm font-semibold" style={{ background: "var(--brand)", color: "white" }}>
          Start from food entry
        </button>
      </div>

      <p className="text-center mt-4" style={{ fontSize: "11px", color: "var(--text-muted)" }}>
        Full recipe builder with ingredient scaling and nutrition totals coming in v1.2.
        For now, create individual food entries and combine them in your daily log.
      </p>
    </div>
  );
}
