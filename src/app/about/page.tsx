import type { Metadata } from "next";
import { readFileSync } from "fs";
import { join } from "path";
import { MdxContent } from "@/components/blog/MdxContent";
import { AboutPanel } from "@/components/about/AboutPanel";

export const metadata: Metadata = {
  title: "About",
};

const SECTIONS = [
  { slug: "researcher", title: "researcher" },
  { slug: "research",   title: "research" },
  { slug: "person",     title: "person" },
  { slug: "now",        title: "now" },
  { slug: "connect",    title: "connect" },
];

export default function AboutPage() {
  const sections = SECTIONS.map(({ slug, title }) => ({
    title,
    rendered: (
      <MdxContent
        source={readFileSync(join(process.cwd(), `src/content/about/${slug}.md`), "utf-8")}
      />
    ),
  }));

  return (
    <div
      style={{
        minHeight: "100svh",
        background: "var(--background)",
        paddingTop: 36,
      }}
    >
      <div
        style={{
          minHeight: "calc(100svh - 36px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px 16px",
        }}
      >
        <AboutPanel sections={sections} />
      </div>
    </div>
  );
}
