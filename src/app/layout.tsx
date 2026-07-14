import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Providers } from "./providers";
import { GlobalHeader } from "@/components/ui/GlobalHeader";
import { siteConfig } from "@/lib/constants";
import { PathTracker } from "@/components/PathTracker";
import { PageTransition } from "@/components/ui/PageTransition";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: siteConfig.title,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.variable} antialiased`}>
        <Providers>
          <GlobalHeader />
          <PathTracker />
          <PageTransition>{children}</PageTransition>
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
