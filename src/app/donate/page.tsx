import type { Metadata } from "next";
import { DonatePanel } from "@/components/donate/DonatePanel";

export const metadata: Metadata = {
  title: "Support",
};

export default function DonatePage() {
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
        <DonatePanel />
      </div>
    </div>
  );
}
