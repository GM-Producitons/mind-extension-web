import "./globals.css";
import "blobatar/motion.css";
import "blobatar/gaze.css";
import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono, Silkscreen } from "next/font/google";
import ClientProviders from "@/components/clientProvider";
import SettingsButton from "@/components/SettingsButton";

const viewportBootScript = `(function () {
  var query = window.matchMedia("(max-width: 767px)");
  var apply = function () {
    document.documentElement.dataset.viewportMobile = query.matches ? "true" : "false";
  };
  apply();
  query.addEventListener("change", apply);
})();`;

// import ServiceWorkerRegister from "@/features/notifications/ServiceWorkerRegister";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const pacePixel = Silkscreen({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-silkscreen",
});

export const metadata: Metadata = {
  description: "Your personal mind dashboard and productivity system.",
  title: "Mind Extension",
  themeColor: "#8b5cf6",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MindExtension",
  },
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="w-full h-full" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${pacePixel.variable} antialiased w-full h-full`}
      >
        <Script id="viewport-mobile" strategy="beforeInteractive">
          {viewportBootScript}
        </Script>
        {/* <ServiceWorkerRegister /> */}
        <ClientProviders>
          {children}
          <SettingsButton />
        </ClientProviders>
      </body>
    </html>
  );
}
