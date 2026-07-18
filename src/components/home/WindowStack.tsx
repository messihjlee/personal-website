"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { PokerGame } from "@/components/poker/PokerGame";
import { PLAY_PARAM } from "@/lib/constants";

interface StackItem {
  href: string;
  label: string;
  sub: string;
  game?: boolean;
}

// "test your luck" sits in the middle — it launches the poker game instead of
// navigating, so the nav cards flank it two-per-side.
const ITEMS: StackItem[] = [
  { href: "/blog",     label: "blog",           sub: "writing"  },
  { href: "/about",    label: "about",          sub: "profile"  },
  { href: "#",         label: "test your luck", sub: "poker", game: true },
  { href: "/research", label: "research",       sub: "research" },
  { href: "/contact",  label: "contact",        sub: "links"    },
];

// Home cards are pre-baked images (public/cards/home-{i}.png) in ITEMS order:
// a royal flush of spades whose rank has been replaced with the nav word. The
// art is borderless; the edge comes from the .card-window frame the blog and
// research panes use.
//
// Positions below are each card's top-left corner as a multiple of the card
// width W (card height = (67/50)·W). GAP_* are the empty space between
// neighbouring cards, also in units of W.
const H_OVER_W = 67 / 50;
const GAP_X = 0.16;
const GAP_Y = 0.14;
const ROW_STEP = H_OVER_W + GAP_Y; // center-to-center vertical step, in W

// Dice-5 (quincunx): four nav cards in the corners, game card centered.
const DICE_LEFT = [0, 1 + GAP_X, (1 + GAP_X) / 2, 0, 1 + GAP_X];
const DICE_TOP = [0, 0, ROW_STEP, 2 * ROW_STEP, 2 * ROW_STEP];

const STEP_X = 1 + GAP_X; // horizontal card pitch, in W

// The layout reflows with viewport width: narrow → dice-5, medium → 3-over-2,
// wide → a single row of five. In every arrangement the game card sits center.
const LAYOUTS = {
  dice: {
    // three card-heights tall, so cap by viewport height too (leaving room
    // for the fixed header)
    cardWidth: "clamp(84px, min(20vh, 44vw), 240px)",
    left: DICE_LEFT,
    top: DICE_TOP,
    cw: 2 + GAP_X,
    ch: 3 * H_OVER_W + 2 * GAP_Y,
  },
  threeTwo: {
    cardWidth: "clamp(130px, 26vw, 230px)",
    // top: blog(0) · game(2) · about(1); bottom: research(3) · contact(4)
    left: [0, 2 * STEP_X, STEP_X, STEP_X / 2, STEP_X / 2 + STEP_X],
    top: [0, 0, 0, ROW_STEP, ROW_STEP],
    cw: 3 + 2 * GAP_X,
    ch: 2 * H_OVER_W + GAP_Y,
  },
  row: {
    cardWidth: "clamp(110px, 17vw, 210px)",
    left: [0, STEP_X, 2 * STEP_X, 3 * STEP_X, 4 * STEP_X],
    top: [0, 0, 0, 0, 0],
    cw: 5 + 4 * GAP_X,
    ch: H_OVER_W,
  },
} as const;

type LayoutName = keyof typeof LAYOUTS;
function pickLayout(w: number): LayoutName {
  if (w >= 1180) return "row";
  if (w >= 740) return "threeTwo";
  return "dice";
}

// Entrance "deal": each card fades + springs up on load. Order is the four
// corners first (reading order), then the center "test your luck" card last.
const DEAL_ORDER = [0, 1, 4, 2, 3]; // per ITEMS index → stagger position
const DEAL_STEP = 90; // ms between cards

const FRICTION = 0.94;
const MIN_VELOCITY = 0.35;
// cards roam the whole page edge-to-edge — no margin, and free to slide up under
// the header (its logos float transparently and don't capture the pointer). The
// clamp only stops a card from leaving the page entirely.
const EDGE_PADDING = 0;

// how far the pointer must travel from where it went down before a
// gesture counts as a drag rather than a click — trackpad taps and real
// mouse clicks both carry a few px of incidental jitter
const MOVE_THRESHOLD = 6;

interface DragPoint {
  x: number;
  y: number;
}

export function WindowStack() {
  const [hovered, setHovered] = useState<number | null>(null);
  const [hoverCapable, setHoverCapable] = useState(false);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [gameOpen, setGameOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [layoutName, setLayoutName] = useState<LayoutName>("dice");
  const draggingIndexRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
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

  // trigger the one-time entrance "deal" on mount
  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  // "play again" on the donate page sends you back here with ?play=1 — sit the
  // player straight back down at the table. Read off location rather than
  // useSearchParams, which would drag this static page behind a suspense
  // boundary for a param only ever read on the client.
  useEffect(() => {
    if (!new URLSearchParams(window.location.search).has(PLAY_PARAM)) return;
    setGameOpen(true);
    // strip the param back off, so leaving the table leaves a clean url that
    // won't deal you back in on a reload
    window.history.replaceState(null, "", window.location.pathname);
  }, []);

  // reflow the arrangement (dice / 3-over-2 / single row) with viewport width
  useEffect(() => {
    const update = () => setLayoutName(pickLayout(window.innerWidth));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

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
    // a drag that ends over the card shouldn't count as a click
    if (movedRef.current) {
      e.preventDefault();
      movedRef.current = false;
      return;
    }
    // cards are face-up, so the game card opens on a single click and the nav
    // cards just follow their link
    if (ITEMS[i].game) {
      e.preventDefault(); // href="#" is a no-op; the click opens the game
      setGameOpen(true);
    }
  }

  const layout = LAYOUTS[layoutName];

  return (
    <>
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: `calc(${layout.cardWidth} * ${layout.cw})`,
        height: `calc(${layout.cardWidth} * ${layout.ch})`,
        maxWidth: "100%",
        transition: "width 0.4s ease, height 0.4s ease",
      }}
    >
      {ITEMS.map((item, i) => {
        const isHovered = hoverCapable && hovered === i;
        const isDragging = draggingIndex === i;

        return (
          <Link
            key={item.label}
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
              width: layout.cardWidth,
              aspectRatio: "50 / 67",
              display: "block",
              textDecoration: "none",
              position: "absolute",
              left: `calc(${layout.cardWidth} * ${layout.left[i]})`,
              top: `calc(${layout.cardWidth} * ${layout.top[i]})`,
              transition: isDragging
                ? "none"
                : "left 0.4s ease, top 0.4s ease, width 0.4s ease",
              touchAction: hoverCapable ? "none" : undefined,
              cursor: hoverCapable ? (isDragging ? "grabbing" : "grab") : undefined,
              zIndex: isDragging ? 20 : isHovered ? 10 : item.game ? 2 : 1,
            }}
          >
            {/* entrance layer: one-time deal-in on load, staggered per card.
                Separate from the pop/drag layers so it only ever animates once */}
            <div
              style={{
                width: "100%",
                height: "100%",
                opacity: mounted ? 1 : 0,
                transform: mounted ? "none" : "translateY(26px)",
                transition:
                  "opacity 0.5s ease, transform 0.55s cubic-bezier(0.34, 1.56, 0.64, 1)",
                transitionDelay: `${DEAL_ORDER[i] * DEAL_STEP + 40}ms`,
              }}
            >
            {/* the card face, baked face-up (the nav word is part of the card
                art, in the rank position). The art is borderless — the edge is
                the .card-window frame every other pane on the site wears.
                A gentle lift on hover — but not while dragging: the lift lives
                on this child, so the drag clamp (which measures the Link box)
                can't see it, and a lifted card would ride ~10px over the top
                edge. Dropping it during the drag keeps the card at the clamp. */}
            <div
              className="card-window home-card"
              style={{
                backgroundImage: `url(/cards/home-${i}.png)`,
                transform: isHovered && !isDragging ? "translateY(-10px) scale(1.05)" : "none",
                transition: isDragging
                  ? "none"
                  : "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
              }}
            />
            </div>
          </Link>
        );
      })}
    </div>
    {gameOpen && <PokerGame onClose={() => setGameOpen(false)} />}
    </>
  );
}
