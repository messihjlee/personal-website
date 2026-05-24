import type { Metadata } from "next";
import { getAllPosts } from "@/lib/notion";
import { BlogPanel } from "@/components/blog/BlogPanel";

export const revalidate = 60;

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
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px 16px",
        }}
      >
        <BlogPanel posts={posts} />
      </div>
    </div>
  );
}
