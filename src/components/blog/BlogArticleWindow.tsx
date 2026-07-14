"use client";

import { useState, useEffect } from "react";
import { MDXRemote } from "next-mdx-remote";
import type { MDXRemoteSerializeResult } from "next-mdx-remote";
import Image from "next/image";
import { useDraggable } from "@/hooks/useDraggable";
import { CardWindow } from "@/components/ui/CardWindow";

interface ArticleData {
  title: string;
  date: string;
  tags: string[];
  coverImage: string;
  mdxSource: MDXRemoteSerializeResult;
}

type WinState = "normal" | "fullscreen" | "closed";

const mdxComponents = {
  ColumnImages: ({ data }: { data: string }) => {
    const images: { src: string; alt: string }[] = JSON.parse(
      Buffer.from(data, "base64").toString("utf8")
    );
    return (
      <div style={{ display: "flex", gap: "0.75rem", margin: "1.5rem 0" }}>
        {images.map((img, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={i} src={img.src} alt={img.alt} style={{ flex: 1, minWidth: 0, maxWidth: "100%", height: "auto" }} />
        ))}
      </div>
    );
  },
  CVButton: ({ href }: { href: string }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "inline-block", marginTop: "1rem", fontSize: 12, letterSpacing: "0.14em",
        color: "var(--foreground)", border: "1px solid var(--border)", padding: "8px 18px",
        textDecoration: "none", fontFamily: "inherit", cursor: "pointer",
      }}
    >
      cv
    </a>
  ),
  h1: (props: React.ComponentProps<"h1">) => (
    <h1 style={{ fontSize: 20, fontWeight: 600, marginTop: "2rem", marginBottom: "0.75rem", lineHeight: 1.3, fontFamily: "inherit" }} {...props} />
  ),
  h2: (props: React.ComponentProps<"h2">) => (
    <h2 style={{ fontSize: 17, fontWeight: 600, marginTop: "1.75rem", marginBottom: "0.5rem", lineHeight: 1.3, fontFamily: "inherit" }} {...props} />
  ),
  h3: (props: React.ComponentProps<"h3">) => (
    <h3 style={{ fontSize: 14, fontWeight: 600, marginTop: "1.5rem", marginBottom: "0.5rem", fontFamily: "inherit" }} {...props} />
  ),
  p: (props: React.ComponentProps<"p">) => (
    <p style={{ marginBottom: "1rem", lineHeight: 1.85 }} {...props} />
  ),
  a: (props: React.ComponentProps<"a">) => (
    <a style={{ textDecoration: "underline", textUnderlineOffset: 4 }} {...props} />
  ),
  ul: (props: React.ComponentProps<"ul">) => (
    <ul style={{ marginBottom: "1rem", paddingLeft: "1.5rem", listStyleType: "disc" }} {...props} />
  ),
  ol: (props: React.ComponentProps<"ol">) => (
    <ol style={{ marginBottom: "1rem", paddingLeft: "1.5rem", listStyleType: "decimal" }} {...props} />
  ),
  hr: (props: React.ComponentProps<"hr">) => (
    <hr style={{ margin: "1.5rem 0", borderColor: "var(--border)" }} {...props} />
  ),
  blockquote: (props: React.ComponentProps<"blockquote">) => (
    <blockquote style={{ borderLeft: "2px solid var(--border)", paddingLeft: "1rem", margin: "1.5rem 0", fontStyle: "italic", color: "var(--foreground)", fontWeight: 600 }} {...props} />
  ),
  code: (props: React.ComponentProps<"code">) => (
    <code style={{ background: "var(--card)", padding: "2px 6px", fontSize: "0.875em" }} {...props} />
  ),
  pre: (props: React.ComponentProps<"pre">) => (
    <pre style={{ marginBottom: "1rem", overflowX: "auto", border: "1px solid var(--border)", background: "var(--card)", padding: "1rem", fontSize: "0.875em" }} {...props} />
  ),
  img: (props: React.ComponentProps<"img">) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img style={{ maxWidth: "100%", height: "auto" }} alt={props.alt ?? ""} {...props} />
  ),
};


export function BlogArticleWindow({
  slug,
  onClose,
  onMinimize,
  onTitleLoaded,
  minimized = false,
  windowIndex = 1,
}: {
  slug: string;
  onClose: () => void;
  onMinimize: () => void;
  onTitleLoaded?: (title: string) => void;
  minimized?: boolean;
  windowIndex?: number;
}) {
  const [article, setArticle] = useState<ArticleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [win, setWin] = useState<WinState>("normal");

  const { pos, onMouseDown, onTouchStart } = useDraggable(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const isMobile = vw < 720;
    const winW = Math.min(680, vw - 32);
    const winH = Math.min(680, vh - 84);
    return {
      x: Math.max(isMobile ? 16 : 20, (vw - winW) / 2 + windowIndex * (isMobile ? 16 : 30)),
      y: Math.max(44, (vh - winH) / 2 + windowIndex * (isMobile ? 20 : 24)),
    };
  });

  useEffect(() => {
    fetch(`/api/blog/${slug}`)
      .then((r) => r.json())
      .then((data: ArticleData) => {
        setArticle(data);
        setLoading(false);
        onTitleLoaded?.(data.title);
      })
      .catch(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  if (!pos) return null;
  if (minimized) return null;

  const shortTitle = article
    ? article.title.length > 48 ? article.title.slice(0, 48) + "…" : article.title
    : "loading…";

  if (win === "closed") {
    return (
      <button
        onClick={() => setWin("normal")}
        style={{
          position: "fixed",
          left: pos.x,
          top: pos.y,
          fontSize: 12, letterSpacing: "0.14em", color: "var(--muted)", background: "none",
          border: "1px solid var(--border)", padding: "8px 18px", cursor: "pointer", fontFamily: "inherit",
          zIndex: 10,
        }}
      >
        {article?.title ?? slug}
      </button>
    );
  }

  const isFullscreen = win === "fullscreen";

  const style: React.CSSProperties = isFullscreen
    ? { position: "fixed", top: 37, left: 0, right: 0, bottom: 0, zIndex: 50 }
    : {
        position: "fixed",
        left: pos.x,
        top: pos.y,
        width: "min(680px, calc(100vw - 32px))",
        height: "min(680px, calc(100svh - 84px))",
        zIndex: 10,
      };

  return (
    <CardWindow
      label="blog"
      subtitle={shortTitle}
      fullscreen={isFullscreen}
      onClose={onClose}
      onMinimize={onMinimize}
      onFullscreen={() => setWin(isFullscreen ? "normal" : "fullscreen")}
      dragProps={{ onMouseDown, onTouchStart }}
      style={style}
    >
      {articleBody(article, loading)}
    </CardWindow>
  );
}

function articleBody(article: ArticleData | null, loading: boolean) {
  if (loading) {
    return (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 48 }}>
        <span style={{ fontSize: 10, letterSpacing: "0.14em", color: "var(--muted)" }}>loading…</span>
      </div>
    );
  }

  if (!article) {
    return (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 48 }}>
        <span style={{ fontSize: 10, letterSpacing: "0.14em", color: "var(--muted)" }}>not found</span>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
      {article.coverImage && (
        <div style={{ position: "relative", width: "100%", aspectRatio: "16/7", flexShrink: 0 }}>
          <Image
            src={article.coverImage}
            alt={article.title}
            fill
            style={{ objectFit: "cover" }}
            sizes="(max-width: 680px) 100vw, 680px"
          />
        </div>
      )}
      <article style={{ padding: "28px 28px 40px" }}>
        <header style={{ marginBottom: 32 }}>
          <h1
            style={{
              fontSize: 20, fontWeight: 600, lineHeight: 1.35,
              color: "var(--foreground)", marginBottom: 12, fontFamily: "inherit",
            }}
          >
            {article.title}
          </h1>
          <time style={{ display: "block", fontSize: 10, letterSpacing: "0.12em", color: "var(--muted)", marginBottom: 12 }}>
            {new Date(article.date).toLocaleDateString("en-US", {
              year: "numeric", month: "long", day: "numeric",
            })}
          </time>
          {article.tags.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    background: "none", color: "var(--muted)", fontSize: 10,
                    letterSpacing: "0.14em", padding: "4px 10px",
                    border: "1px solid var(--border)",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>
        <div style={{ color: "var(--foreground)", fontSize: 15, lineHeight: 1.85 }}>
          <MDXRemote {...article.mdxSource} components={mdxComponents as never} />
        </div>
      </article>
    </div>
  );
}

