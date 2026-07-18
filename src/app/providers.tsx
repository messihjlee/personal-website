"use client";

import { ThemeProvider } from "next-themes";
import { MinimizedProvider } from "@/lib/minimized";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <MinimizedProvider>{children}</MinimizedProvider>
    </ThemeProvider>
  );
}
