import type { Metadata } from "next";
import { RouteWindow } from "@/lib/minimized";

export const metadata: Metadata = {
  title: "Blog",
};

// The blog window is mounted globally (WindowLayer); this route just brings it
// up. Its posts are fetched in the root layout.
export default function BlogPage() {
  return <RouteWindow id="blog" />;
}
