import { getRedis } from "@/lib/redis";

const PAGES = ["home", "about", "research", "blog", "contact"];

const DUMMY = {
  visits:   { home: 312, about: 148, research: 201, blog: 179, contact: 64 },
  sessions: { home: 312, about: 121, research: 187, blog: 163, contact: 58 },
  transitions: {
    home:     { about: 89, research: 112, blog: 76, contact: 18 },
    about:    { home: 24, research: 55, blog: 31, contact: 22 },
    research: { home: 14, about: 18, blog: 97, contact: 12 },
    blog:     { home: 21, about: 27, research: 71, contact: 9  },
    contact:  { home: 8,  about: 6,  research: 5,  blog: 4    },
  },
  crossVisit: {
    researchThenBlog: 57,
    blogThenResearch: 41,
    bothTotal: 98,
    pctOfResearch: Math.round((98 / 187) * 100),
    pctOfBlog: Math.round((98 / 163) * 100),
  },
};

export async function GET() {
  const redis = getRedis();
  if (!redis) {
    return Response.json(DUMMY);
  }

  const pipeline = redis.pipeline();

  for (const p of PAGES) {
    pipeline.get(`page:${p}`);
    pipeline.get(`sessions:${p}`);
  }

  for (const from of PAGES) {
    for (const to of PAGES) {
      if (from !== to) pipeline.get(`trans:${from}:${to}`);
    }
  }

  pipeline.get("cross:research_then_blog");
  pipeline.get("cross:blog_then_research");

  const results = (await pipeline.exec()) as (string | null)[];

  let i = 0;
  const visits: Record<string, number> = {};
  const sessions: Record<string, number> = {};

  for (const p of PAGES) {
    visits[p] = Number(results[i++]) || 0;
    sessions[p] = Number(results[i++]) || 0;
  }

  const transitions: Record<string, Record<string, number>> = {};
  for (const from of PAGES) {
    transitions[from] = {};
    for (const to of PAGES) {
      if (from !== to) transitions[from][to] = Number(results[i++]) || 0;
    }
  }

  const researchThenBlog = Number(results[i++]) || 0;
  const blogThenResearch = Number(results[i++]) || 0;
  const bothTotal = researchThenBlog + blogThenResearch;

  return Response.json({
    visits,
    sessions,
    transitions,
    crossVisit: {
      researchThenBlog,
      blogThenResearch,
      bothTotal,
      pctOfResearch:
        sessions.research > 0
          ? Math.round((bothTotal / sessions.research) * 100)
          : 0,
      pctOfBlog:
        sessions.blog > 0
          ? Math.round((bothTotal / sessions.blog) * 100)
          : 0,
    },
  });
}
