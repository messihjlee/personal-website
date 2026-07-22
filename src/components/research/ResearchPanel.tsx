"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp, ExternalLink, FileText } from "lucide-react";
import type { Publication } from "@/lib/research";
import { EDGE_MARGIN, paneHBounds, useDraggable } from "@/hooks/useDraggable";
import { BAR_H, BTN_W, CardWindow, NavBar } from "@/components/ui/CardWindow";
import { useWindowChrome } from "@/lib/minimized";

const WINDOW_TOP = 48;
const BOTTOM_RESERVED = 48;
const WINDOW_W = 600;
// height the window grows to when the full abstract is shown
const WINDOW_H_EXPANDED = 660;

// every item reserves the same block: 2 lines of title, 1 of authors, 7 of
// abstract — so the window is the same size whatever the item's text length
const TITLE_LINES = 2;
// title, authors and abstract in rem so they scale with the root font like the
// blog article body; each sits 20% above the base pane text. The reserved-line
// heights (h2/author boxes below) are rem too, so they grow with the text.
const TITLE_SIZE = 1.35; // rem
const TITLE_LH = 1.4;
const AUTHOR_SIZE = 0.975; // rem
const AUTHOR_LH = 1.6;
const ABSTRACT_LINES = 7;
const ABSTRACT_SIZE = 0.975; // rem
const ABSTRACT_LH = 1.8;
// px per rem at the base root size — the windowing system (centring, size.h) is
// all px, so the rem sizes above convert through this for the height math
const REM = 16;

// body padding (42) + gaps (36) + divider (1) + the three reserved text blocks,
// plus the title bar, link row and nav bar — used only to centre the window on
// open; the real height comes from the content
const COLLAPSED_H = Math.round(
  BAR_H * 2 + 55 + 79 +
    TITLE_SIZE * REM * TITLE_LH * TITLE_LINES +
    AUTHOR_SIZE * REM * AUTHOR_LH +
    ABSTRACT_SIZE * REM * ABSTRACT_LH * ABSTRACT_LINES,
);

function clamp(lines: number): React.CSSProperties {
  return {
    display: "-webkit-box",
    WebkitLineClamp: lines,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  };
}

// papers.bib mixes two author formats: BibTeX's "A and B and C", and a flat
// comma list where each name is itself "Surname, Initials" — so the comma form
// has to be re-paired rather than split on every comma.
function splitAuthors(authors: string): string[] {
  if (/\sand\s/.test(authors)) {
    return authors.split(/\s+and\s+/).map((a) => a.trim()).filter(Boolean);
  }
  const parts = authors.split(",").map((p) => p.trim()).filter(Boolean);
  const names: string[] = [];
  for (let i = 0; i < parts.length; i += 2) {
    names.push(parts[i + 1] ? `${parts[i]}, ${parts[i + 1]}` : parts[i]);
  }
  return names;
}

function formatAuthors(authors: string): string {
  const names = splitAuthors(authors);
  if (names.length <= 3) return names.join("; ");
  return `${names.slice(0, 3).join("; ")}, et al.`;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function ResearchPanel({ publications }: { publications: Publication[] }) {
  const items = useMemo(() => shuffle(publications), [publications]);
  const [index, setIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const { close, activate } = useWindowChrome({ id: "research", label: "research" });

  // whether the clamped abstract actually overflows depends on the rendered
  // width, so it has to be measured rather than counted
  const abstractRef = useRef<HTMLParagraphElement>(null);
  const [overflows, setOverflows] = useState(false);

  // the window element, measured after an expand/collapse to re-centre it
  const windowRef = useRef<HTMLDivElement>(null);
  const recenter = useRef(false);

  function goTo(i: number) {
    setIndex(i);
    setExpanded(false);
    // every article opens collapsed at the same height, so its own "expand"
    // starts fresh — otherwise the window kept the previous item's expanded size
    setSize((s) => ({ ...s, h: COLLAPSED_H }));
  }

  function toggleExpanded() {
    const next = !expanded;
    setExpanded(next);
    // the window now carries an explicit height (so it can be resized); expand
    // and collapse move it between the two designed sizes
    setSize((s) => ({ ...s, h: next ? WINDOW_H_EXPANDED : COLLAPSED_H }));
    recenter.current = true;
  }

  // the window is content-sized, so re-centring after expand/collapse has to
  // measure the height it actually ended up at
  useEffect(() => {
    if (!recenter.current || !windowRef.current) return;
    recenter.current = false;
    const h = windowRef.current.offsetHeight;
    const vh = window.innerHeight;
    setPos((p) => ({
      x: p?.x ?? 0,
      y: Math.max(WINDOW_TOP, (vh - BOTTOM_RESERVED - h) / 2),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expanded]);

  const { pos, setPos, size, setSize, onMouseDown, onTouchStart, startResize } = useDraggable(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const winW = Math.min(WINDOW_W, vw - 2 * EDGE_MARGIN);
    const winH = Math.min(COLLAPSED_H, vh - WINDOW_TOP - BOTTOM_RESERVED);
    return {
      x: Math.max(EDGE_MARGIN, (vw - winW) / 2),
      y: Math.max(WINDOW_TOP, (vh - BOTTOM_RESERVED - winH) / 2),
    };
  }, WINDOW_W, COLLAPSED_H);

  // pos is a dependency because the panel renders nothing until useDraggable has
  // placed it — without it this measures a null ref on mount and never re-runs,
  // so the expand button never appears for the item you land on first
  useEffect(() => {
    const el = abstractRef.current;
    if (!el || expanded) return;
    setOverflows(el.scrollHeight > el.clientHeight + 1);
  }, [index, expanded, pos]);

  const pub = items[index];

  // once expanded, the button stays live so it can collapse again
  const canExpand = expanded || overflows;

  const doiUrl = pub.doi ? `https://doi.org/${pub.doi}` : undefined;
  const arxivUrl = pub.arxiv ? `https://arxiv.org/abs/${pub.arxiv}` : undefined;
  const linkUrl = pub.url || doiUrl || arxivUrl;
  const pdfUrl = pub.pdf ? `/papers/${pub.pdf}` : undefined;

  if (!pos) return null;

  const windowStyle: React.CSSProperties = {
    position: "fixed",
    top: pos.y,
    ...paneHBounds(pos.x, size.w),
    // an explicit height so the window can be resized from any edge; it still
    // shrinks with the live position so the bottom never leaves the screen. No
    // height transition — it would lag the pointer while resizing.
    height: `min(${size.h}px, calc(100svh - ${Math.round(pos.y) + EDGE_MARGIN}px))`,
    zIndex: 10,
  };

  return (
    <CardWindow
      innerRef={windowRef}
      label="research"
      subtitle={`${pub.venue} · ${pub.year}`}
      onClose={close}
      onActivate={activate}
      dragProps={{ onMouseDown, onTouchStart }}
      onResizeStart={startResize}
      style={windowStyle}
      footer={
        <NavBar
          index={index}
          total={items.length}
          onPrev={() => goTo(Math.max(0, index - 1))}
          onNext={() => goTo(Math.min(items.length - 1, index + 1))}
        />
      }
    >
      {(
        <>
          {/* Content */}
          <div
            className="research-panel-body"
            style={{
              // always fill the window and scroll if the content is taller, so
              // the links row and nav bar stay pinned when the window is resized
              flex: 1,
              minHeight: 0,
              overflowY: "auto",
              padding: "22px 24px 20px",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <h2
              style={{
                fontSize: `${TITLE_SIZE}rem`,
                fontWeight: 600,
                lineHeight: TITLE_LH,
                color: "var(--foreground)",
                margin: 0,
                fontFamily: "inherit",
                height: `${TITLE_SIZE * TITLE_LH * TITLE_LINES}rem`,
                flexShrink: 0,
                ...clamp(TITLE_LINES),
              }}
            >
              {pub.title}
            </h2>
            <p
              style={{
                fontSize: `${AUTHOR_SIZE}rem`,
                lineHeight: AUTHOR_LH,
                color: "var(--foreground)",
                margin: 0,
                height: `${AUTHOR_SIZE * AUTHOR_LH}rem`,
                flexShrink: 0,
                ...clamp(1),
              }}
            >
              {formatAuthors(pub.authors)}
            </p>
            <div style={{ height: 1, background: "var(--border)", flexShrink: 0 }} />
            <p
              ref={abstractRef}
              style={{
                fontSize: `${ABSTRACT_SIZE}rem`,
                lineHeight: ABSTRACT_LH,
                color: "var(--foreground)",
                margin: 0,
                flexShrink: 0,
                // seven lines is a ceiling, not a reservation — a short abstract
                // shrinks the window rather than padding it out
                ...(expanded ? {} : clamp(ABSTRACT_LINES)),
              }}
            >
              {pub.abstract}
            </p>
          </div>

          {/* Links — anchored above the nav bar, so they don't move with the abstract */}
          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              padding: "12px 24px",
              flexShrink: 0,
              background: "var(--background)",
            }}
          >
            <button
              className="pixel-edge"
              onClick={toggleExpanded}
              disabled={!canExpand}
              style={{
                ...linkStyle,
                background: "none",
                cursor: canExpand ? "pointer" : "default",
                color: canExpand ? "var(--foreground)" : "var(--disabled)",
                fontFamily: "inherit",
              }}
            >
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              {expanded ? "collapse" : "expand"}
            </button>
            {pdfUrl && (
              <a className="pixel-edge" href={pdfUrl} target="_blank" rel="noopener noreferrer" style={linkStyle}>
                <FileText size={14} /> pdf
              </a>
            )}
            {linkUrl && (
              <a className="pixel-edge" href={linkUrl} target="_blank" rel="noopener noreferrer" style={linkStyle}>
                <ExternalLink size={14} /> paper
              </a>
            )}
          </div>
        </>
      )}
    </CardWindow>
  );
}

const linkStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  fontSize: 13,
  letterSpacing: "0.1em",
  color: "var(--foreground)",
  textDecoration: "none",
  border: "1px solid var(--border)",
  padding: "7px 0",
  width: BTN_W,
};
