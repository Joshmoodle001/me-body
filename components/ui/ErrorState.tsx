interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center" role="alert">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: "var(--error-soft)", border: "1px solid rgba(255,107,107,0.20)" }}>
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" style={{ color: "var(--error)" }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h3 className="mb-1" style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>Something went wrong</h3>
      <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "1.25rem" }}>{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn btn-primary">Try again</button>
      )}
    </div>
  );
}
