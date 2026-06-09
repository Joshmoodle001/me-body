interface EmptyStateProps {
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}

export default function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: "var(--card-muted)", border: "1px solid var(--border)" }}>
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" style={{ color: "var(--text-muted)" }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </div>
      <h3 className="mb-1" style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>{title}</h3>
      <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "1.25rem", maxWidth: "280px", lineHeight: "22px" }}>{description}</p>
      {action && (
        <button onClick={action.onClick} className="btn btn-primary">{action.label}</button>
      )}
    </div>
  );
}
