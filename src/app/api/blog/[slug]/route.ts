import { NextResponse } from "next/server";
import { getPostBySlug } from "@/lib/notion";
import { serialize } from "next-mdx-remote/serialize";
import rehypePrettyCode from "rehype-pretty-code";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const mdxSource = await serialize(post.content, {
    mdxOptions: {
      rehypePlugins: [
        [rehypePrettyCode as never, { theme: "github-dark-dimmed", keepBackground: true }],
      ],
    },
  });

  return NextResponse.json({
    title: post.title,
    date: post.date,
    tags: post.tags,
    coverImage: post.coverImage,
    slug: post.slug,
    mdxSource,
  });
}
