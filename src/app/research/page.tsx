import type { Metadata } from "next";
import { ResearchPanel } from "@/components/research/ResearchPanel";
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
        style={{
          borderTop: "1px solid var(--border)",
          minHeight: "calc(100svh - 36px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px 16px",
        }}
      >
        <ResearchPanel publications={publications} />
      </div>
    </div>
  );
}
