"use client";

import { useState } from "react";
import { ExternalLink, FileText, X } from "lucide-react";
import type { Publication } from "@/lib/research";

function truncate(s: string, max: number) {
  return s.length > max ? s.slice(0, max) + "…" : s;
}

function truncateWords(s: string, n: number) {
  const words = s.split(" ");
  return words.length > n ? words.slice(0, n).join(" ") + "…" : s;
}

function PubCard({
  pub,
  onClick,
}: {
  pub: Publication;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        alignItems: "flex-start",
        width: "100%",
        height: "100%",
        padding: "14px",
        border: "1px solid var(--border)",
        background: "var(--card)",
        cursor: "pointer",
        textAlign: "left",
        fontFamily: "inherit",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Abstract overlay — grey mask + centered text on hover */}
      {pub.abstract && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            background: "rgba(20,21,24,0.92)",
            opacity: hovered ? 1 : 0,
            transition: "opacity 0.18s ease",
            pointerEvents: "none",
            padding: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
          }}
        >
          <p
            style={{
              fontSize: 13,
              lineHeight: 1.7,
              color: "rgba(255,255,255,0.85)",
              margin: 0,
              textAlign: "left",
              display: "-webkit-box",
              WebkitLineClamp: 6,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {pub.abstract}
          </p>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 8, position: "relative", width: "100%" }}>
        <div
          className="pub-card-date"
          style={{ letterSpacing: "0.1em", color: "var(--muted)" }}
        >
          {pub.month ? `${pub.month} ${pub.year}` : pub.year}
        </div>
        <p
          className="pub-card-title"
          style={{ lineHeight: 1.5, color: "var(--foreground)", margin: 0 }}
        >
          <span className="pub-title-full">{truncate(pub.title, 120)}</span>
          <span className="pub-title-short">{truncateWords(pub.title, 5)}</span>
        </p>
      </div>
    </button>
  );
}

function PubModal({
  pub,
  onClose,
}: {
  pub: Publication;
  onClose: () => void;
}) {
  const doiUrl = pub.doi ? `https://doi.org/${pub.doi}` : undefined;
  const arxivUrl = pub.arxiv ? `https://arxiv.org/abs/${pub.arxiv}` : undefined;
  const linkUrl = pub.url || doiUrl || arxivUrl;
  const pdfUrl = pub.pdf ? `/papers/${pub.pdf}` : undefined;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--background)",
          border: "1px solid var(--border)",
          width: "100%",
          maxWidth: 640,
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Modal header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 16px",
            borderBottom: "1px solid var(--border)",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontSize: 10,
              letterSpacing: "0.14em",
              color: "var(--foreground)",
            }}
          >
            {pub.venue} · {pub.year}
          </span>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: "none",
              border: "none",
              color: "var(--muted)",
              cursor: "pointer",
              padding: 4,
              display: "flex",
            }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Modal body */}
        <div style={{ overflowY: "auto", padding: "20px 16px", flex: 1 }}>
          <h2
            style={{
              fontSize: 16,
              fontWeight: 600,
              lineHeight: 1.4,
              color: "var(--foreground)",
              margin: "0 0 10px",
              fontFamily: "inherit",
            }}
          >
            {pub.title}
          </h2>
          <p
            style={{
              fontSize: 11,
              color: "var(--foreground)",
              margin: "0 0 20px",
              lineHeight: 1.6,
            }}
          >
            {pub.authors}
          </p>
          <div style={{ height: 1, background: "var(--border)", marginBottom: 20 }} />
          <p
            style={{
              fontSize: 13,
              color: "var(--foreground)",
              lineHeight: 1.8,
              margin: 0,
            }}
          >
            {pub.abstract}
          </p>
        </div>

        {/* Modal footer — links */}
        {(pdfUrl || linkUrl || arxivUrl) && (
          <div
            style={{
              display: "flex",
              gap: 12,
              padding: "12px 16px",
              borderTop: "1px solid var(--border)",
              flexShrink: 0,
            }}
          >
            {pdfUrl && (
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 10,
                  letterSpacing: "0.1em",
                  color: "var(--foreground)",
                  textDecoration: "none",
                  border: "1px solid var(--border)",
                  padding: "4px 10px",
                }}
              >
                <FileText size={12} /> pdf
              </a>
            )}
            {arxivUrl && (
              <a
                href={arxivUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 10,
                  letterSpacing: "0.1em",
                  color: "var(--foreground)",
                  textDecoration: "none",
                  border: "1px solid var(--border)",
                  padding: "4px 10px",
                }}
              >
                <ExternalLink size={12} /> arxiv
              </a>
            )}
            {linkUrl && linkUrl !== arxivUrl && (
              <a
                href={linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 10,
                  letterSpacing: "0.1em",
                  color: "var(--foreground)",
                  textDecoration: "none",
                  border: "1px solid var(--border)",
                  padding: "4px 10px",
                }}
              >
                <ExternalLink size={12} /> paper
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const PAGE_SIZE = 9;

export function ResearchGrid({ publications }: { publications: Publication[] }) {
  const [selected, setSelected] = useState<Publication | null>(null);
  const [page, setPage] = useState(0);

  const totalPages = Math.ceil(publications.length / PAGE_SIZE);
  const paged = publications.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const padded = [...paged, ...Array(PAGE_SIZE - paged.length).fill(null)] as (Publication | null)[];

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: 12 }}>
        <div
          className="research-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gridTemplateRows: "repeat(3, 1fr)",
            gap: 12,
            width: "100%",
            flex: 1,
          }}
        >
          {padded.map((pub, i) => (
            <div key={pub ? pub.title : `empty-${i}`} style={{ minHeight: 0, minWidth: 0 }}>
              {pub && <PubCard pub={pub} onClick={() => setSelected(pub)} />}
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              style={{
                fontSize: 10,
                letterSpacing: "0.12em",
                color: page === 0 ? "var(--disabled)" : "var(--foreground)",
                background: "none",
                border: "1px solid var(--border)",
                padding: "4px 12px",
                cursor: page === 0 ? "default" : "pointer",
                fontFamily: "inherit",
              }}
            >
              prev
            </button>
            <span style={{ fontSize: 10, letterSpacing: "0.12em", color: "var(--muted)", alignSelf: "center" }}>
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              style={{
                fontSize: 10,
                letterSpacing: "0.12em",
                color: page === totalPages - 1 ? "var(--disabled)" : "var(--foreground)",
                background: "none",
                border: "1px solid var(--border)",
                padding: "4px 12px",
                cursor: page === totalPages - 1 ? "default" : "pointer",
                fontFamily: "inherit",
              }}
            >
              next
            </button>
          </div>
        )}
      </div>

      {selected && (
        <PubModal pub={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
