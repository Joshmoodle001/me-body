"use client";

import { useState } from "react";
import Link from "next/link";
import { exportAllData, downloadJSON, importJSONData } from "@/db/exportData";
import { clearAllData } from "@/db/queries";
import PageHeader from "@/components/ui/PageHeader";

export default function DataSettingsPage() {
  const [message, setMessage] = useState("");
  const [importing, setImporting] = useState(false);

  const handleExport = async () => {
    try {
      const data = await exportAllData();
      const filename = `me-body-export-${new Date().toISOString().slice(0, 10)}.json`;
      downloadJSON(data, filename);
      setMessage("Export downloaded successfully.");
    } catch {
      setMessage("Failed to export data.");
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const text = await file.text();
      const result = await importJSONData(text);
      setMessage(result.message);
    } catch {
      setMessage("Failed to import data. Check the file format.");
    }
    setImporting(false);
  };

  const handleClear = async () => {
    if (window.confirm("Permanently delete ALL local data? This cannot be undone.")) {
      await clearAllData();
      window.location.href = "/onboarding";
    }
  };

  return (
    <div className="p-6 pb-8 max-w-md mx-auto">
      <Link href="/app/settings" className="text-green-600 text-sm font-medium mb-4 inline-block hover:underline">&larr; Back to Settings</Link>
      <h1 className="text-2xl font-bold text-stone-900 mb-4">Data Management</h1>

      {message && <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-800 mb-4">{message}</div>}

      <div className="space-y-4">
        <div className="bg-white rounded-xl p-4 border border-stone-200">
          <h2 className="font-semibold text-stone-900 mb-1">Export All Data</h2>
          <p className="text-sm text-stone-500 mb-3">Download all your local data as a JSON file for backup.</p>
          <button onClick={handleExport} className="w-full py-3 bg-green-600 text-white rounded-xl font-medium text-sm hover:bg-green-700 transition-colors">Export JSON</button>
        </div>

        <div className="bg-white rounded-xl p-4 border border-stone-200">
          <h2 className="font-semibold text-stone-900 mb-1">Import Data</h2>
          <p className="text-sm text-stone-500 mb-3">Restore from a previous Me Body export file.</p>
          <label className="block w-full py-3 bg-white border-2 border-dashed border-stone-300 rounded-xl text-center text-sm font-medium text-stone-600 hover:border-green-500 cursor-pointer transition-colors">
            {importing ? "Importing..." : "Choose JSON File"}
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
        </div>

        <div className="bg-red-50 rounded-xl p-4 border border-red-200">
          <h2 className="font-semibold text-red-800 mb-1">Delete All Data</h2>
          <p className="text-sm text-red-600 mb-3">This permanently removes all your local data including profile, logs, foods, and settings.</p>
          <button onClick={handleClear} className="w-full py-3 bg-red-600 text-white rounded-xl font-medium text-sm hover:bg-red-700 transition-colors">Delete All Data</button>
        </div>
      </div>
    </div>
  );
}
