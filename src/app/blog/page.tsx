import type { Metadata } from "next";
import { getAllPosts } from "@/lib/notion";
import { BlogDesktop } from "@/components/blog/BlogDesktop";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Blog",
};

export default async function BlogPage() {
  const posts = await getAllPosts();

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
        }}
      >
        <BlogDesktop posts={posts} />
      </div>
    </div>
  );
}
