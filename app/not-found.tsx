import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: "var(--background)" }}>
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold mb-4" style={{ color: "var(--brand)" }}>404</h1>
        <p className="text-lg font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Page not found</p>
        <p className="text-sm mb-8" style={{ color: "var(--text-secondary)" }}>This page does not exist or has been moved.</p>
        <Link href="/app" className="inline-block py-3 px-8 rounded-[var(--radius-button)] font-semibold text-white" style={{ background: "var(--brand)" }}>Go to Dashboard</Link>
      </div>
    </div>
  );
}