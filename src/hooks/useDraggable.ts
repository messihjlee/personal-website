import { useState, useRef, useCallback, useEffect } from "react";
import { BAR_H, type ResizeDir } from "@/components/ui/CardWindow";

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  w: number;
  h: number;
}

const HEADER_H = 37;
// how much of the window must stay on screen when the viewport shrinks under it
const KEEP_VISIBLE = 120;
// the smallest a window can be resized to, so it can't collapse to nothing
const MIN_W = 280;
const MIN_H = 180;

// The gap kept between a dragged window and the viewport edge. Horizontally the
// window lives inside a [EDGE_MARGIN, 100vw - EDGE_MARGIN] band (see paneHBounds)
// and shrinks symmetrically when pushed past either side; the bottom holds its
// margin the same way, by the pane shrinking its height.
export const EDGE_MARGIN = 24;

// A pane's horizontal placement. `x` is the free left the drag sets; `width` is
// the pane's natural width. The window is drawn as its intersection with the
// [EDGE_MARGIN, 100vw - EDGE_MARGIN] band, so pushing it past the left or the
// right pins that edge and shrinks the width — the two sides behave identically.
export function paneHBounds(x: number, width: number): { left: string; width: string } {
  const rx = Math.round(x);
  const m = EDGE_MARGIN;
  return {
    left: `max(${rx}px, ${m}px)`,
    width: `calc(min(${rx + width}px, 100vw - ${m}px) - max(${rx}px, ${m}px))`,
  };
}

// Dragging down shrinks the pane (calc above), so without a floor it would
// vanish under its own title bar. Stop it where the shrink leaves exactly the
// title bar showing, one EDGE_MARGIN above the bottom — so the bar you grab is
// always in view. Returns the largest allowed y for the current viewport.
function maxY() {
  return Math.max(HEADER_H, window.innerHeight - BAR_H - EDGE_MARGIN);
}

// Bound the free horizontal position so the window can shrink against either
// edge (see paneHBounds) but never slide fully off. paneHBounds draws the pane
// as its intersection with the [EDGE_MARGIN, 100vw - EDGE_MARGIN] band; once the
// left edge crosses the right margin (or the right edge crosses the left one)
// that intersection is empty and the window disappears. Clamp x so at least
// KEEP_VISIBLE px of the pane always stays inside the band on whichever side
// it's pushed toward.
function clampX(x: number, width: number) {
  const m = EDGE_MARGIN;
  const W = window.innerWidth;
  // pushed left, the right edge (x + width) must stay KEEP_VISIBLE past m;
  // pushed right, the left edge (x) must stay KEEP_VISIBLE inside W - m
  const min = m + KEEP_VISIBLE - width;
  const max = W - m - KEEP_VISIBLE;
  // guard the degenerate case (viewport narrower than KEEP_VISIBLE bands) where
  // min could exceed max, so the clamp range never inverts; paneHBounds fills
  // the band from whatever x lands here
  return Math.min(Math.max(min, x), Math.max(min, max));
}

export function useDraggable(
  getInitialPos: () => Position,
  width: number,
  height: number,
) {
  const [pos, setPos] = useState<Position | null>(null);
  // the window's live size; the user can resize it from any edge or corner
  const [size, setSize] = useState<Size>({ w: width, h: height });

  // the handlers read the live size without re-subscribing — the horizontal
  // clamp needs the current width, and a resize starts from the current box
  const sizeRef = useRef<Size>({ w: width, h: height });
  useEffect(() => {
    sizeRef.current = size;
  }, [size]);

  // the drag handlers read the live position without re-subscribing
  const posRef = useRef<Position>({ x: 0, y: 0 });
  useEffect(() => {
    if (pos) posRef.current = pos;
  }, [pos]);

  // once the user has dragged the window, it's theirs — a resize nudges it back
  // on screen but no longer re-centres it
  const draggedRef = useRef(false);

  // getInitialPos closes over fresh values each render; keep the latest without
  // making the effects below depend on it
  const initialPosRef = useRef(getInitialPos);

  useEffect(() => {
    initialPosRef.current = getInitialPos;
  });

  useEffect(() => {
    setPos(initialPosRef.current());
  }, []);

  // the window is fixed-positioned, so it doesn't reflow on its own: recompute
  // on resize, or it drifts off screen as the viewport shrinks
  useEffect(() => {
    function onResize() {
      if (!draggedRef.current) {
        setPos(initialPosRef.current());
        return;
      }
      const { x, y } = posRef.current;
      setPos({
        x: clampX(x, sizeRef.current.w),
        y: Math.min(Math.max(HEADER_H, y), maxY()),
      });
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    e.preventDefault();
    const startMX = e.clientX;
    const startMY = e.clientY;
    const { x: startWX, y: startWY } = posRef.current;

    function onMove(ev: MouseEvent) {
      draggedRef.current = true;
      setPos({
        // x is clamped so the pane can shrink against either edge but always
        // keeps KEEP_VISIBLE px on screen. y clamps too: the top can't slide
        // under the header, and the bottom stops where the title bar still shows.
        x: clampX(startWX + (ev.clientX - startMX), sizeRef.current.w),
        y: Math.min(maxY(), Math.max(HEADER_H, startWY + (ev.clientY - startMY))),
      });
    }
    function onUp() {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, []);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    const touch = e.touches[0];
    const startMX = touch.clientX;
    const startMY = touch.clientY;
    const { x: startWX, y: startWY } = posRef.current;

    function onMove(ev: TouchEvent) {
      ev.preventDefault();
      draggedRef.current = true;
      const t = ev.touches[0];
      setPos({
        x: clampX(startWX + (t.clientX - startMX), sizeRef.current.w),
        y: Math.min(maxY(), Math.max(HEADER_H, startWY + (t.clientY - startMY))),
      });
    }
    function onEnd() {
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
    }
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onEnd);
  }, []);

  // Resize from an edge or corner. Pointer events cover mouse and touch alike.
  // Each direction moves the edges it names: the opposite edge stays pinned, so
  // an "e" drag grows the width, a "w" drag walks the left edge in and pins the
  // right, and the north/west drags stop at MIN_H/MIN_W (and under the header).
  const startResize = useCallback((dir: ResizeDir, e: React.PointerEvent) => {
    e.preventDefault();
    const startMX = e.clientX;
    const startMY = e.clientY;
    const p0 = { ...posRef.current };
    const s0 = { ...sizeRef.current };

    function onMove(ev: PointerEvent) {
      draggedRef.current = true;
      const dx = ev.clientX - startMX;
      const dy = ev.clientY - startMY;
      let { x, y } = p0;
      let { w, h } = s0;
      if (dir.includes("e")) w = Math.max(MIN_W, s0.w + dx);
      if (dir.includes("s")) h = Math.max(MIN_H, s0.h + dy);
      if (dir.includes("w")) {
        // pin the right edge; the left edge follows the cursor down to MIN_W
        const right = p0.x + s0.w;
        x = Math.min(p0.x + dx, right - MIN_W);
        w = right - x;
      }
      if (dir.includes("n")) {
        // pin the bottom edge; the top follows the cursor, never above the header
        const bottom = p0.y + s0.h;
        y = Math.max(HEADER_H, Math.min(p0.y + dy, bottom - MIN_H));
        h = bottom - y;
      }
      setPos({ x, y });
      setSize({ w, h });
    }
    function onUp() {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }, []);

  return { pos, setPos, size, setSize, onMouseDown, onTouchStart, startResize };
}
