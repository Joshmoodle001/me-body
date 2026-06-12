"use client";

import { useState } from "react";
import Link from "next/link";
import { exportAllData, downloadJSON, importJSONData } from "@/db/exportData";
import { clearAllData } from "@/db/queries";
import PageHeader from "@/components/ui/PageHeader";

export default function DataSettingsPage() {
  const [message, setMessage] = useState("");
  const [importing, setImporting] = useState(false);

  const handleExport = async () => { try { const data = await exportAllData(); downloadJSON(data, `me-body-export-${new Date().toISOString().slice(0,10)}.json`); setMessage("Export downloaded."); } catch { setMessage("Failed to export."); } };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (!file) return; setImporting(true); try { setMessage((await importJSONData(await file.text())).message); } catch { setMessage("Failed to import."); } setImporting(false); };

  const handleClear = async () => { if (window.confirm("Delete ALL local data? This cannot be undone.")) { await clearAllData(); window.location.href = "/onboarding"; } };

  return (
    <div className="app-container max-w-md mx-auto">
      <Link href="/app/settings" className="text-sm font-semibold mb-4 inline-block" style={{ color: "var(--brand)" }}>&larr; Back</Link>
      <h1 style={{ fontSize: "28px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "1.5rem" }}>Data Management</h1>

      {message && <div className="card mb-4" style={{ background: "var(--brand-soft)", borderColor: "var(--brand-soft)" }}><p style={{ color: "var(--brand-dark)", fontSize: "14px" }}>{message}</p></div>}

      <div className="space-y-4">
        <div className="card">
          <h2 className="font-bold mb-1" style={{ color: "var(--text-primary)" }}>Export All Data</h2>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "0.75rem" }}>Download all your local data as a JSON file for backup.</p>
          <button onClick={handleExport} className="btn btn-primary w-full py-3">Export JSON</button>
        </div>

        <div className="card">
          <h2 className="font-bold mb-1" style={{ color: "var(--text-primary)" }}>Import Data</h2>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "0.75rem" }}>Restore from a previous Me Body export file.</p>
          <label className="block w-full py-3 rounded-[var(--radius-button)] text-center text-sm font-semibold cursor-pointer transition-colors" style={{ border: "2px dashed var(--border)", color: "var(--text-secondary)", background: "var(--card-muted)" }}>
            {importing ? "Importing..." : "Choose JSON File"}
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
        </div>

        <div className="card" style={{ background: "var(--error-soft)", borderColor: "var(--error-soft)" }}>
          <h2 className="font-bold mb-1" style={{ color: "var(--error)" }}>Delete All Data</h2>
          <p style={{ fontSize: "13px", color: "var(--error)", marginBottom: "0.75rem", opacity: 0.8 }}>Permanently removes all your local data.</p>
          <button onClick={handleClear} className="w-full py-3 rounded-[var(--radius-button)] font-semibold text-sm" style={{ background: "var(--error)", color: "white" }}>Delete All Data</button>
        </div>
      </div>
    </div>
  );
}
