"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import LoadingState from "@/components/ui/LoadingState";
import { getProfile } from "@/db/queries";
import { clearAllData } from "@/db/queries";
import type { DBProfile } from "@/db/localDb";

export default function SettingsPage() {
  const [profile, setProfile] = useState<DBProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProfile().then((p) => {
      setProfile(p ?? null);
      setLoading(false);
    });
  }, []);

  const handleClearData = async () => {
    if (window.confirm("This will delete ALL your local data, including logs, foods, profile, and settings. This cannot be undone. Are you sure?")) {
      await clearAllData();
      window.location.href = "/onboarding";
    }
  };

  if (loading) return <div className="min-h-screen bg-stone-50"><LoadingState message="Loading..." /></div>;

  return (
    <div className="p-6 pb-8">
      <PageHeader title="Settings" />

      <div className="space-y-4">
        {profile && (
          <div className="bg-white rounded-xl p-4 border border-stone-200">
            <p className="font-semibold text-stone-900">{profile.name}</p>
            <p className="text-sm text-stone-500">Goal: {profile.goalType.replace(/_/g, " ")}</p>
            <Link href="/settings/targets" className="text-green-600 text-sm font-medium mt-2 inline-block hover:underline">Edit Targets</Link>
          </div>
        )}

        {!profile && (
          <Link href="/onboarding" className="block bg-white rounded-xl p-4 border border-stone-200 hover:shadow-sm transition-shadow text-center">
            <p className="font-semibold text-stone-900">Set Up Profile</p>
            <p className="text-sm text-stone-500">Complete onboarding to calculate your targets</p>
          </Link>
        )}

        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden divide-y divide-stone-100">
          {[
            { href: "/settings/targets", label: "Nutrition Targets", desc: "Edit your calorie and macro targets" },
            { href: "/settings/privacy", label: "Privacy", desc: "How your data is handled" },
            { href: "/settings/data", label: "Data", desc: "Export, import, or delete your data" },
            { href: "/settings/sync", label: "Sync", desc: "Cloud sync (coming soon)" },
          ].map((item) => (
            <Link key={item.href} href={item.href} className="flex items-center justify-between px-4 py-4 hover:bg-stone-50 transition-colors">
              <div>
                <p className="font-medium text-stone-900 text-sm">{item.label}</p>
                <p className="text-xs text-stone-500">{item.desc}</p>
              </div>
              <span className="text-stone-400">&rarr;</span>
            </Link>
          ))}
        </div>

        <button
          onClick={handleClearData}
          className="w-full py-3 px-4 bg-red-50 text-red-700 rounded-xl font-medium text-sm border border-red-200 hover:bg-red-100 transition-colors"
        >
          Delete All Local Data
        </button>

        <p className="text-xs text-stone-400 text-center">
          Me Body v0.1.0. This app is not medical advice. Nutrition data from Open Food Facts and USDA may need checking.
        </p>
      </div>
    </div>
  );
}
