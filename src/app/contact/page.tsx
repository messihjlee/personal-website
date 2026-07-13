import type { Metadata } from "next";
import { ContactPanel } from "@/components/contact/ContactPanel";

export const metadata: Metadata = {
  title: "Contact",
};

export default function ContactPage() {
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
        <ContactPanel />
      </div>
    </div>
  );
}
