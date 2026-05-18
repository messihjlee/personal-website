import { redis } from "@/lib/redis";
import { NextResponse } from "next/server";

const PAGES = new Set(["home", "about", "research", "blog", "contact"]);

export async function POST(req: Request) {
  try {
    const { sessionId, page, prevPage } = (await req.json()) as {
      sessionId: string;
      page: string;
      prevPage: string | null;
    };

    if (!sessionId || !PAGES.has(page)) return new NextResponse("ok");

    const [alreadyVisited, sessionPages] = await Promise.all([
      redis.sismember(`session:${sessionId}:pages`, page),
      redis.smembers(`session:${sessionId}:pages`),
    ]);

    const pipeline = redis.pipeline();

    pipeline.incr(`page:${page}`);

    if (!alreadyVisited) {
      pipeline.incr(`sessions:${page}`);
      pipeline.sadd(`session:${sessionId}:pages`, page);
      pipeline.expire(`session:${sessionId}:pages`, 86400);

      const visited = sessionPages as string[];
      if (page === "blog" && visited.includes("research")) {
        pipeline.incr("cross:research_then_blog");
      } else if (page === "research" && visited.includes("blog")) {
        pipeline.incr("cross:blog_then_research");
      }
    }

    if (prevPage && PAGES.has(prevPage) && prevPage !== page) {
      pipeline.incr(`trans:${prevPage}:${page}`);
    }

    await pipeline.exec();
    return new NextResponse("ok");
  } catch {
    return new NextResponse("error", { status: 500 });
  }
}
