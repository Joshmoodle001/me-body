"use client";

import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import Link from "next/link";

export default function RecipePage() {
  return (
    <div className="app-container">
      <PageHeader title="Recipes" />
      <EmptyState title="Recipes coming soon" description="Build and save custom recipes with ingredient scaling. Available in v1.2." action={{ label: "Back to Search", onClick: () => window.location.href = "/food/search" }} />
    </div>
  );
}
