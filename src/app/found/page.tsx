import type { Metadata } from "next";
import { FlowGraph } from "@/components/found/FlowGraph";

export const metadata: Metadata = {
  title: "visitor flows",
  robots: { index: false, follow: false },
};

export default function FoundPage() {
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
          flexDirection: "column",
          alignItems: "center",
          padding: "48px 16px 80px",
        }}
      >
        <div style={{ width: "100%", maxWidth: 640 }}>
          <div style={{ marginBottom: 44 }}>
            <div
              style={{
                fontSize: 9,
                letterSpacing: "0.2em",
                color: "var(--muted)",
                marginBottom: 10,
                textTransform: "uppercase",
              }}
            >
              secret · visitor flows
            </div>
            <h1
              style={{
                fontSize: 22,
                fontWeight: 500,
                margin: 0,
                letterSpacing: "0.02em",
              }}
            >
              how people move through this site
            </h1>
          </div>

          <FlowGraph />
        </div>
      </div>
    </div>
  );
}
