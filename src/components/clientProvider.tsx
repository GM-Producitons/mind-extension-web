"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { OfflineRuntime } from "@/features/offline/offline-runtime";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <OfflineRuntime />
      {children}
      <Toaster />
    </ThemeProvider>
  );
}
