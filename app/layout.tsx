import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { template: "%s | Me Body", default: "Me Body - Private Body Intelligence & Nutrition Tracking" },
  description: "Privacy-first body intelligence, nutrition, habits, workout, and progress tracking.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Me Body" },
  icons: { icon: [{ url: "/icons/icon-192.svg", sizes: "192x192", type: "image/svg+xml" }, { url: "/icons/icon-512.svg", sizes: "512x512", type: "image/svg+xml" }] },
};

export const viewport: Viewport = {
  themeColor: "#16a34a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: `if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js').catch(function(){})}` }} />
      </head>
      <body>
        <a href="#main-content" className="skip-to-content">Skip to content</a>
        <main id="main-content">{children}</main>
      </body>
    </html>
  );
}
