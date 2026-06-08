"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/app/dashboard", label: "Home", svg: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { href: "/app/log", label: "Log", svg: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" },
  { href: "/app/scan", label: "Scan", svg: "M12 4v1m6 11h2m-6 0h-2m4 0v-2m-8 2v-2m4 0a4 4 0 11-8 0 4 4 0 018 0z" },
  { href: "/app/progress", label: "Progress", svg: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" },
  { href: "/app/coach", label: "Coach", svg: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      className="bottom-nav"
      role="navigation"
      aria-label="Main navigation"
    >
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            style={{ color: isActive ? "var(--brand)" : "var(--text-muted)" }}
            aria-current={isActive ? "page" : undefined}
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={isActive ? 2.5 : 1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d={item.svg} />
            </svg>
            <span style={{ fontSize: "10px", fontWeight: isActive ? 700 : 500, lineHeight: 1 }}>{item.label}</span>
            {isActive && (
              <span className="absolute bottom-1 w-5 h-0.5 rounded-full" style={{ background: "var(--brand)" }} />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
