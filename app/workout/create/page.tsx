"use client";

import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";

export default function WorkoutCreatePage() {
  return (
    <div className="p-6 pb-8">
      <PageHeader title="Create Workout" />
      <EmptyState
        title="Coming in v1.1"
        description="Custom workout builder with sets, reps, and exercise tracking will be available soon."
      />
    </div>
  );
}
