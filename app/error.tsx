"use client";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: "var(--background)" }}>
      <div className="text-center max-w-md">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: "var(--error-soft)" }}>
          <svg className="w-8 h-8" fill="none" stroke="var(--error)" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>Something went wrong</h1>
        <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>An unexpected error occurred. Your local data is safe.</p>
        <button onClick={reset} className="py-3 px-6 rounded-[var(--radius-button)] font-semibold text-white" style={{ background: "var(--brand)" }}>Try Again</button>
      </div>
    </div>
  );
}