"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import { getProfile, getContentItems } from "@/db/queries";
import type { DBContentItem } from "@/db/localDb";

interface MealTemplateStructure {
  portion?: Record<string, string>;
  structure?: Record<string, string[]>;
  notes?: string;
}

export default function RecipePage() {
  const [templates, setTemplates] = useState<DBContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { (async () => { const profile = await getProfile(); const items = await getContentItems("meal_template", "en-ZA"); setTemplates(items); setLoading(false); })(); }, []);

  return (
    <div className="app-container">
      <PageHeader title="Meal Builder" subtitle="Evidence-based meal templates with South African options" />
      <div className="card mb-4" style={{ background: "var(--teal-soft)", borderColor: "rgba(45,212,191,0.15)" }}>
        <div className="flex items-start gap-2">
          <span className="text-lg shrink-0">&#x1F372;</span>
          <div><p className="text-sm font-semibold" style={{ color: "var(--teal)" }}>How meal templates work</p><p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>Each template shows a balanced meal structure. Swap ingredients to match what you have available.</p></div>
        </div>
      </div>
      {loading ? (<div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="card skeleton" style={{ height: "80px" }} />)}</div>) : templates.length === 0 ? (
        <EmptyState title="No meal templates yet" description="Meal templates will appear here as they are reviewed and approved." />
      ) : (
        <div className="space-y-3">
          {templates.map((t) => { let structure: MealTemplateStructure = {}; try { structure = JSON.parse(t.body) as MealTemplateStructure; } catch {}
            return (
              <div key={t.id} className="card">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0 mr-2"><p className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>{t.title}</p><p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{t.summary}</p>
                    {structure.portion && <div className="mt-2 flex flex-wrap gap-1">{Object.entries(structure.portion).map(([key, val]) => (<span key={key} className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: "var(--brand-soft)", color: "var(--brand)" }}>{key.replace(/_/g, " ")}: {val}</span>))}</div>}
                  </div>
                  <span className="badge badge-gold text-[9px] shrink-0">SA</span>
                </div>
                {structure.structure && <div className="mt-2 pt-2" style={{ borderTop: "1px solid var(--border)" }}><div className="grid grid-cols-2 gap-1 text-[10px]">{Object.entries(structure.structure).map(([slot, items]) => (<div key={slot} className="truncate"><span className="font-semibold capitalize" style={{ color: "var(--text-secondary)" }}>{slot}:</span><span style={{ color: "var(--text-muted)" }}> {Array.isArray(items) ? items.slice(0, 3).join(", ") : items}</span></div>))}</div></div>}
                {structure.notes && <p className="mt-2 text-[10px]" style={{ color: "var(--text-muted)", fontStyle: "italic" }}>{structure.notes}</p>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
