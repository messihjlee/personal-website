"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface StackItem {
  href: string;
  label: string;
  sub: string;
}

const ITEMS: StackItem[] = [
  { href: "/blog",     label: "blog",     sub: "writing"  },
  { href: "/about",    label: "about",    sub: "profile"  },
  { href: "/research", label: "research", sub: "research" },
  { href: "/contact",  label: "contact",  sub: "links"    },
];

const FRICTION = 0.94;
const MIN_VELOCITY = 0.35;
const EDGE_PADDING = 12;
// how far the pointer must travel from where it went down before a
// gesture counts as a drag rather than a click — trackpad taps and real
// mouse clicks both carry a few px of incidental jitter
const MOVE_THRESHOLD = 6;

interface DragPoint {
  x: number;
  y: number;
}

export function WindowStack() {
  const [flipped, setFlipped] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [hoverCapable, setHoverCapable] = useState(false);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const draggingIndexRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const posRef = useRef<DragPoint[]>(ITEMS.map(() => ({ x: 0, y: 0 })));
  const velRef = useRef<DragPoint[]>(ITEMS.map(() => ({ x: 0, y: 0 })));
  const originRef = useRef<DragPoint[]>(ITEMS.map(() => ({ x: 0, y: 0 })));
  const rafRef = useRef<(number | null)[]>(ITEMS.map(() => null));
  const lastPointRef = useRef({ x: 0, y: 0, t: 0 });
  const startPointRef = useRef({ x: 0, y: 0 });
  const movedRef = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    setHoverCapable(mq.matches);
  }, []);

  useEffect(() => {
    if (flipped === null) return;
    function onOutside(e: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setFlipped(null);
      }
    }
    window.addEventListener("pointerdown", onOutside);
    return () => window.removeEventListener("pointerdown", onOutside);
  }, [flipped]);

  function applyTransform(i: number) {
    const el = cardRefs.current[i];
    if (el) el.style.transform = `translate(${posRef.current[i].x}px, ${posRef.current[i].y}px)`;
  }

  function clamp(i: number) {
    const el = cardRefs.current[i];
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    const origin = originRef.current[i];
    const minX = EDGE_PADDING - origin.x;
    const maxX = window.innerWidth - width - EDGE_PADDING - origin.x;
    const minY = EDGE_PADDING - origin.y;
    const maxY = window.innerHeight - height - EDGE_PADDING - origin.y;
    const p = posRef.current[i];
    if (p.x < minX) { p.x = minX; velRef.current[i].x = 0; }
    if (p.x > maxX) { p.x = maxX; velRef.current[i].x = 0; }
    if (p.y < minY) { p.y = minY; velRef.current[i].y = 0; }
    if (p.y > maxY) { p.y = maxY; velRef.current[i].y = 0; }
  }

  function stopGlide(i: number) {
    if (rafRef.current[i] != null) {
      cancelAnimationFrame(rafRef.current[i]!);
      rafRef.current[i] = null;
    }
  }

  function glide(i: number) {
    function step() {
      const v = velRef.current[i];
      posRef.current[i].x += v.x;
      posRef.current[i].y += v.y;
      v.x *= FRICTION;
      v.y *= FRICTION;
      clamp(i);
      applyTransform(i);
      if (Math.abs(v.x) > MIN_VELOCITY || Math.abs(v.y) > MIN_VELOCITY) {
        rafRef.current[i] = requestAnimationFrame(step);
      } else {
        rafRef.current[i] = null;
      }
    }
    rafRef.current[i] = requestAnimationFrame(step);
  }

  function onPointerDown(i: number, e: React.PointerEvent) {
    if (!hoverCapable) return;
    stopGlide(i);
    const el = cardRefs.current[i];
    if (el) {
      const rect = el.getBoundingClientRect();
      originRef.current[i] = { x: rect.left - posRef.current[i].x, y: rect.top - posRef.current[i].y };
    }
    movedRef.current = false;
    draggingIndexRef.current = i;
    setDraggingIndex(i);
    lastPointRef.current = { x: e.clientX, y: e.clientY, t: performance.now() };
    startPointRef.current = { x: e.clientX, y: e.clientY };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onPointerMove(i: number, e: React.PointerEvent) {
    if (draggingIndexRef.current !== i) return;
    const now = performance.now();
    const dt = Math.max(now - lastPointRef.current.t, 1);
    const dx = e.clientX - lastPointRef.current.x;
    const dy = e.clientY - lastPointRef.current.y;
    if (!movedRef.current) {
      const totalDx = e.clientX - startPointRef.current.x;
      const totalDy = e.clientY - startPointRef.current.y;
      if (Math.hypot(totalDx, totalDy) > MOVE_THRESHOLD) movedRef.current = true;
    }
    posRef.current[i].x += dx;
    posRef.current[i].y += dy;
    velRef.current[i] = { x: (dx / dt) * 16, y: (dy / dt) * 16 };
    lastPointRef.current = { x: e.clientX, y: e.clientY, t: now };
    clamp(i);
    applyTransform(i);
  }

  function onPointerUp(i: number) {
    if (draggingIndexRef.current !== i) return;
    draggingIndexRef.current = null;
    setDraggingIndex(null);
    glide(i);
  }

  function handleClick(e: React.MouseEvent, i: number) {
    if (movedRef.current) {
      e.preventDefault();
      movedRef.current = false;
      return;
    }
    // on hover-capable devices the front face is already showing on hover,
    // so a click just opens it — only touch needs the reveal-then-open step
    if (hoverCapable) return;
    if (flipped !== i) {
      e.preventDefault();
      setFlipped(i);
    }
  }

  return (
    <div ref={containerRef} className="home-card-grid" style={{ maxWidth: "100%" }}>
      {ITEMS.map((item, i) => {
        const isFlipped = flipped === i || (hoverCapable && hovered === i);
        const isDragging = draggingIndex === i;

        return (
          <Link
            key={item.href}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
            href={item.href}
            draggable={false}
            onDragStart={(e) => e.preventDefault()}
            onClick={(e) => handleClick(e, i)}
            onMouseEnter={() => hoverCapable && setHovered(i)}
            onMouseLeave={() => hoverCapable && setHovered((h) => (h === i ? null : h))}
            onPointerDown={(e) => onPointerDown(i, e)}
            onPointerMove={(e) => onPointerMove(i, e)}
            onPointerUp={() => onPointerUp(i)}
            onPointerCancel={() => onPointerUp(i)}
            style={{
              width: "100%",
              aspectRatio: "192 / 270",
              display: "block",
              textDecoration: "none",
              position: "relative",
              touchAction: hoverCapable ? "none" : undefined,
              cursor: hoverCapable ? (isDragging ? "grabbing" : "grab") : undefined,
              zIndex: isDragging ? 20 : isFlipped ? 10 : 1,
            }}
          >
            {/* pop layer: hover/flip lift, kept separate from the drag
                translate above so the two transforms don't fight */}
            <div
              style={{
                width: "100%",
                height: "100%",
                perspective: 1200,
                transform: isFlipped ? "translateY(-14px) scale(1.08)" : "none",
                transition: isDragging
                  ? "none"
                  : "transform 0.32s cubic-bezier(0.34, 1.56, 0.64, 1)",
              }}
            >
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: "100%",
                  transformStyle: "preserve-3d",
                  transition: "transform 0.5s cubic-bezier(0.4, 0.2, 0.2, 1)",
                  transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                }}
              >
                {/* Back face */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    backfaceVisibility: "hidden",
                    border: "1px solid var(--border)",
                    background:
                      "repeating-linear-gradient(135deg, var(--card), var(--card) 9px, var(--background) 9px, var(--background) 18px)",
                  }}
                />

                {/* Front face */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                    border: "1px solid var(--border)",
                    background: "var(--background)",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "13px 16px",
                      borderBottom: "1px solid var(--border)",
                      background: "var(--card)",
                      flexShrink: 0,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <span style={dotStyle("#ff5f57")} />
                      <span style={dotStyle("#f5a623")} />
                      <span style={dotStyle("#27c93f")} />
                    </div>
                    <span
                      style={{
                        fontSize: 13,
                        letterSpacing: "0.12em",
                        color: "var(--muted)",
                      }}
                    >
                      {item.sub}
                    </span>
                  </div>
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 14,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 26,
                        letterSpacing: "0.14em",
                        color: "var(--foreground)",
                      }}
                    >
                      {item.label}
                    </span>
                    {isFlipped && (
                      <span
                        style={{
                          fontSize: 13,
                          letterSpacing: "0.1em",
                          color: "var(--muted)",
                        }}
                      >
                        {hoverCapable ? "click to open" : "tap again to open"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function dotStyle(color: string): React.CSSProperties {
  return {
    width: 11,
    height: 11,
    borderRadius: "50%",
    background: color,
    display: "inline-block",
    flexShrink: 0,
  };
}
