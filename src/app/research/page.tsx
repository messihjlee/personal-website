import type { Metadata } from "next";
import { RouteWindow } from "@/lib/minimized";

export const metadata: Metadata = {
  title: "Research",
};

export default function ResearchPage() {
  return <RouteWindow id="research" />;
}
