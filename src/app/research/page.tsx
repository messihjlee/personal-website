import type { Metadata } from "next";
import { ResearchGrid } from "@/components/research/ResearchGrid";
import { getResearch } from "@/lib/research";

export const metadata: Metadata = {
  title: "Research",
};

export default function ResearchPage() {
  const publications = getResearch();

  return (
    <div
      style={{
        minHeight: "100svh",
        background: "var(--background)",
        paddingTop: 36,
      }}
    >
      <div
        className="page-grid-wrap"
        style={{
          borderTop: "1px solid var(--border)",
          height: "calc(100svh - 36px)",
          padding: "24px 16px",
        }}
      >
        <ResearchGrid publications={publications} />
      </div>
    </div>
  );
}
