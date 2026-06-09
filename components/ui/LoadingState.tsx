interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({ message = "Loading..." }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20" role="status" aria-live="polite">
      <div className="w-10 h-10 rounded-full border-[3px] animate-spin mb-4" style={{ borderColor: "rgba(255,255,255,0.08)", borderTopColor: "var(--gold)" }} />
      <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>{message}</p>
    </div>
  );
}
