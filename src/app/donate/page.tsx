import type { Metadata } from "next";
import { RouteWindow } from "@/lib/minimized";

export const metadata: Metadata = {
  title: "Support",
};

export default function DonatePage() {
  return <RouteWindow id="support" />;
}
