import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { template: "%s | Me Body", default: "Me Body — Private Body Intelligence & Nutrition Tracking" },
  description: "Your private body intelligence app. Track food, habits, workouts, and progress without shame, ads, or confusing paywalls.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Me Body" },
  icons: { icon: [{ url: "/icons/icon-192.svg", sizes: "192x192", type: "image/svg+xml" }, { url: "/icons/icon-512.svg", sizes: "512x512", type: "image/svg+xml" }] },
};

export const viewport: Viewport = {
  themeColor: "#2F6F5E",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;650;700;750&display=swap" rel="stylesheet" />
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              var theme = localStorage.getItem('me-body-theme');
              if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                document.documentElement.classList.add('dark');
              }
            })();
            if ('serviceWorker' in navigator) {
              navigator.serviceWorker.register('/sw.js').catch(function(){});
            }
          `
        }} />
      </head>
      <body className="font-[Inter,system-ui,sans-serif]">
        <a href="#main-content" className="skip-to-content">Skip to main content</a>
        <main id="main-content">{children}</main>
      </body>
    </html>
  );
}
