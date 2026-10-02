import { AuthModalProvider } from "@/components/AuthModalProvider";
import type { Metadata } from "next";
import "./globals.css";
import { ChromeWrapper } from "@/components/ChromeWrapper";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/components/AuthProvider";
import { Toaster } from "react-hot-toast";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  metadataBase: new URL("https://kuroanime-green.vercel.app"),
  title: { default: "KuroAnime - Watch Anime Online Free", template: "%s | KuroAnime" },
  description: "Watch anime online free in HD — sub & dub, no ads, fast streaming servers.",
  keywords: ["watch anime online", "anime streaming", "free anime", "anime sub dub", "kuroanime"],
  openGraph: {
    title: "KuroAnime - Watch Anime Online Free",
    description: "Watch anime online free in HD — sub & dub, no ads, fast streaming servers.",
    url: "https://kuroanime-green.vercel.app",
    siteName: "KuroAnime",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var mem = navigator.deviceMemory || 4;
                  var cores = navigator.hardwareConcurrency || 4;
                  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                  var isLowEnd = mem <= 3 || cores <= 4 || reducedMotion;
                  if (isLowEnd) document.documentElement.classList.add('low-end');
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-surface text-white font-body">
        <AuthProvider>
          <ThemeProvider>
          <AuthModalProvider>
          <ChromeWrapper>{children}</ChromeWrapper>
          </AuthModalProvider>
          
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: { background: "#1a1a28", color: "#e8e8f0", border: "1px solid rgba(255,255,255,0.07)" },
            }}
          />
        </ThemeProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
