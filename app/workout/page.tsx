"use client";

import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";

export default function WorkoutPage() {
  return (
    <div className="p-6 pb-8">
      <PageHeader title="Workout" subtitle="Track your training" />
      <EmptyState
        title="Workouts coming soon"
        description="Workout tracking with exercise logging will be available in v1.1."
      />
    </div>
  );
}
