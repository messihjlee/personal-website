import { useState, useRef, useCallback, useEffect } from "react";
import { BAR_H } from "@/components/ui/CardWindow";

export interface Position {
  x: number;
  y: number;
}

const HEADER_H = 37;
// how much of the window must stay on screen when the viewport shrinks under it
const KEEP_VISIBLE = 120;

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

export function useDraggable(getInitialPos: () => Position) {
  const [pos, setPos] = useState<Position | null>(null);

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
        x: Math.min(Math.max(EDGE_MARGIN, x), Math.max(EDGE_MARGIN, window.innerWidth - KEEP_VISIBLE)),
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
        // x runs free; paneHBounds shrinks the window into view on either side.
        // y still clamps: the top can't slide under the header, and the bottom
        // stops where the shrink leaves the title bar showing.
        x: startWX + (ev.clientX - startMX),
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
        x: startWX + (t.clientX - startMX),
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

  return { pos, setPos, onMouseDown, onTouchStart };
}
