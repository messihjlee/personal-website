import type { Metadata } from "next";
import { RouteWindow } from "@/lib/minimized";

export const metadata: Metadata = {
  title: "Contact",
};

export default function ContactPage() {
  return <RouteWindow id="contact" />;
}
