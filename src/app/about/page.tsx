import type { Metadata } from "next";
import { readFileSync } from "fs";
import { join } from "path";
import { MdxContent } from "@/components/blog/MdxContent";

export const metadata: Metadata = {
  title: "About",
};

export default function AboutPage() {
  const content = readFileSync(join(process.cwd(), "src/content/about.md"), "utf-8");

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
          borderTop: "1px solid var(--border)",
          minHeight: "calc(100svh - 36px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <article style={{ maxWidth: 680, width: "100%", padding: "32px 24px" }}>
          <div style={{ color: "var(--muted)", fontSize: 15 }}>
            <MdxContent source={content} />
          </div>
        </article>
      </div>
    </div>
  );
}
