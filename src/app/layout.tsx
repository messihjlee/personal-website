import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Providers } from "./providers";
import { GlobalHeader } from "@/components/ui/GlobalHeader";
import { siteConfig } from "@/lib/constants";
import { PathTracker } from "@/components/PathTracker";
import { PageTransition } from "@/components/ui/PageTransition";
import { MinimizedDock } from "@/lib/minimized";
import { WindowLayer } from "@/components/ui/WindowLayer";
import { getAllPosts } from "@/lib/notion";
import { getResearch } from "@/lib/research";
import { getAboutSections } from "@/lib/about";
import type { BlogPost } from "@/types";
import "./globals.css";

// windows float over every page, so their content is fetched here rather than on
// individual routes; keep the Notion posts on ISR so this doesn't hit the API
// on every request
export const revalidate = 300;

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // a missing/failing data source shouldn't take down every page — the window
  // just opens empty
  let posts: BlogPost[] = [];
  try {
    posts = await getAllPosts();
  } catch {
    posts = [];
  }
  const publications = getResearch();
  const aboutSections = getAboutSections();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.variable} antialiased`}>
        <Providers>
          <GlobalHeader />
          <PathTracker />
          <PageTransition>{children}</PageTransition>
          <WindowLayer posts={posts} publications={publications} aboutSections={aboutSections} />
          <MinimizedDock />
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
