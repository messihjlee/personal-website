import type { Metadata } from "next";
import { RouteWindow } from "@/lib/minimized";

export const metadata: Metadata = {
  title: "About",
};

// Sections are read and rendered in the root layout (getAboutSections) so the
// window can float over any page; this route just opens it.
export default function AboutPage() {
  return <RouteWindow id="about" />;
}
