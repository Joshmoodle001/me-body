"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/app/dashboard", label: "Home", icon: "H" },
  { href: "/app/log", label: "Log", icon: "L" },
  { href: "/app/scan", label: "Scan", icon: "S" },
  { href: "/app/progress", label: "Progress", icon: "P" },
  { href: "/app/settings", label: "More", icon: "m" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-stone-200 flex justify-around items-center px-2 h-16" style={{ paddingBottom: "env(safe-area-inset-bottom, 0.5rem)" }} role="navigation" aria-label="Main navigation">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-lg min-w-[44px] min-h-[44px] text-xs font-medium transition-colors ${isActive ? "text-green-600" : "text-stone-500 hover:text-stone-700"}`}
            aria-current={isActive ? "page" : undefined}
          >
            <span className="text-lg font-bold leading-none">{item.icon}</span>
            <span className="leading-none">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
