"use client";

import { useEffect, useState } from "react";

type Analytics = {
  visits: Record<string, number>;
  sessions: Record<string, number>;
  transitions: Record<string, Record<string, number>>;
  crossVisit: {
    researchThenBlog: number;
    blogThenResearch: number;
    bothTotal: number;
    pctOfResearch: number;
    pctOfBlog: number;
  };
};

const PAGES = ["home", "about", "research", "blog", "contact"];

const NODES: Record<string, { x: number; y: number }> = {
  home:     { x: 300, y: 60  },
  about:    { x: 100, y: 260 },
  research: { x: 200, y: 430 },
  blog:     { x: 400, y: 430 },
  contact:  { x: 500, y: 260 },
};

function quadCurve(
  x1: number, y1: number,
  x2: number, y2: number,
  offset: number
): string {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  return `M ${x1} ${y1} Q ${mx - (dy / len) * offset} ${my + (dx / len) * offset} ${x2} ${y2}`;
}

function isResearchBlogEdge(from: string, to: string) {
  return (from === "research" && to === "blog") || (from === "blog" && to === "research");
}

export function FlowGraph() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "80px 0", textAlign: "center", fontSize: 11, letterSpacing: "0.12em", color: "var(--muted)" }}>
        loading...
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ padding: "80px 0", textAlign: "center", fontSize: 11, letterSpacing: "0.12em", color: "var(--muted)" }}>
        could not load data
      </div>
    );
  }

  const hasData = PAGES.some((p) => data.sessions[p] > 0);

  let maxTrans = 1;
  for (const from of PAGES) {
    for (const to of PAGES) {
      if (from !== to) maxTrans = Math.max(maxTrans, data.transitions[from]?.[to] ?? 0);
    }
  }

  const maxSessions = Math.max(1, ...PAGES.map((p) => data.sessions[p]));

  const both30 =
    data.crossVisit.pctOfResearch >= 30 && data.crossVisit.pctOfBlog >= 30;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
      {/* Motivation */}
      <div
        style={{
          fontSize: 14,
          lineHeight: 1.85,
          color: "var(--foreground)",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <p style={{ margin: 0 }}>
          I&apos;ve been interested to see if those who are interested in my work
          also develop a personal interest in me as a person outside the lab, and
          vice versa.
        </p>
        <p style={{ margin: 0 }}>
          {hasData ? (
            <>
              About {data.crossVisit.pctOfResearch}% of people go from research
              to blog, and {data.crossVisit.pctOfBlog}% go from blog to
              research.{" "}
              {both30 ? (
                <span style={{ color: "#f5a623" }}>interesting finding, no?</span>
              ) : (
                <span style={{ color: "var(--muted)" }}>
                  the audiences remain largely separate.
                </span>
              )}
            </>
          ) : (
            <span style={{ color: "var(--muted)" }}>
              data is still accumulating — check back soon.
            </span>
          )}
        </p>
      </div>

      {/* Graph */}
      <div style={{ position: "relative" }}>
        {!hasData && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1,
            }}
          >
            <span style={{ fontSize: 10, letterSpacing: "0.14em", color: "var(--muted)", background: "var(--background)", padding: "4px 12px" }}>
              data accumulates as visitors browse
            </span>
          </div>
        )}

        <svg viewBox="0 0 600 510" style={{ width: "100%", maxWidth: 600, overflow: "visible" }}>
          <defs>
            <filter id="glow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Edges */}
          {PAGES.map((from) =>
            PAGES.map((to) => {
              if (from === to) return null;
              const count = data.transitions[from]?.[to] ?? 0;
              if (!hasData && !isResearchBlogEdge(from, to)) return null;
              if (hasData && count === 0) return null;

              const n1 = NODES[from];
              const n2 = NODES[to];
              const highlight = isResearchBlogEdge(from, to);
              const width = hasData ? Math.max(0.8, (count / maxTrans) * 7) : 0.8;
              const opacity = highlight ? 0.85 : Math.max(0.15, (count / maxTrans) * 0.65);
              const d = quadCurve(n1.x, n1.y, n2.x, n2.y, 22);

              return (
                <path
                  key={`${from}-${to}`}
                  d={d}
                  fill="none"
                  stroke={highlight ? "#f5a623" : "var(--foreground)"}
                  strokeWidth={width}
                  strokeOpacity={opacity}
                  filter={highlight ? "url(#glow)" : undefined}
                />
              );
            })
          )}

          {/* Nodes */}
          {PAGES.map((page) => {
            const { x, y } = NODES[page];
            const s = data.sessions[page];
            const r = Math.max(18, (s / maxSessions) * 30);
            const highlight = page === "research" || page === "blog";
            return (
              <g key={page}>
                <circle
                  cx={x}
                  cy={y}
                  r={r}
                  fill="var(--card)"
                  stroke={highlight ? "#f5a623" : "var(--border)"}
                  strokeWidth={highlight ? 1.5 : 1}
                />
                <text
                  x={x}
                  y={y + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  style={{
                    fontSize: 9,
                    fill: "var(--foreground)",
                    letterSpacing: "0.12em",
                    fontFamily: "inherit",
                    pointerEvents: "none",
                  }}
                >
                  {page}
                </text>
                <text
                  x={x}
                  y={y + r + 14}
                  textAnchor="middle"
                  style={{
                    fontSize: 9,
                    fill: "var(--foreground)",
                    letterSpacing: "0.08em",
                    fontFamily: "inherit",
                    opacity: 0.6,
                    pointerEvents: "none",
                  }}
                >
                  {s > 0 ? `${s}` : ""}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <StatCard
          label="of research visitors also read blog"
          value={hasData ? `${data.crossVisit.pctOfResearch}%` : "—"}
          sub={hasData ? `${data.crossVisit.bothTotal} of ${data.sessions.research} unique visitors` : "no data yet"}
        />
        <StatCard
          label="of blog visitors also explore research"
          value={hasData ? `${data.crossVisit.pctOfBlog}%` : "—"}
          sub={hasData ? `${data.crossVisit.bothTotal} of ${data.sessions.blog} unique visitors` : "no data yet"}
        />
      </div>

      {/* Page visit table */}
      {hasData && (
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 28 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.14em", color: "var(--foreground)", marginBottom: 16 }}>
            unique sessions per page
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {PAGES.map((p) => {
              const s = data.sessions[p];
              const pct = maxSessions > 0 ? (s / maxSessions) * 100 : 0;
              return (
                <div key={p} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 60, fontSize: 10, letterSpacing: "0.1em", color: "var(--foreground)", flexShrink: 0 }}>
                    {p}
                  </div>
                  <div style={{ flex: 1, height: 4, background: "var(--card)", borderRadius: 2, overflow: "hidden" }}>
                    <div
                      style={{
                        height: "100%",
                        width: `${pct}%`,
                        background: (p === "research" || p === "blog") ? "#f5a623" : "var(--foreground)",
                        opacity: 0.7,
                        borderRadius: 2,
                      }}
                    />
                  </div>
                  <div style={{ width: 32, fontSize: 10, letterSpacing: "0.08em", color: "var(--foreground)", textAlign: "right", flexShrink: 0 }}>
                    {s}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div
      style={{
        border: "1px solid #f5a623",
        padding: "20px 20px",
        background: "var(--card)",
      }}
    >
      <div style={{ fontSize: 9, letterSpacing: "0.12em", color: "var(--foreground)", marginBottom: 10, lineHeight: 1.5 }}>
        {label}
      </div>
      <div
        style={{
          fontSize: 40,
          fontWeight: 600,
          color: "#f5a623",
          lineHeight: 1,
          marginBottom: 8,
          letterSpacing: "-0.02em",
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 9, letterSpacing: "0.08em", color: "var(--foreground)", opacity: 0.7 }}>
        {sub}
      </div>
    </div>
  );
}
