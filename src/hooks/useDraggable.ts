import { useState, useRef, useCallback, useEffect } from "react";

export interface Position {
  x: number;
  y: number;
}

const HEADER_H = 37;
// how much of the window must stay on screen when the viewport shrinks under it
const KEEP_VISIBLE = 120;

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
        x: Math.min(Math.max(0, x), Math.max(0, window.innerWidth - KEEP_VISIBLE)),
        y: Math.min(Math.max(HEADER_H, y), Math.max(HEADER_H, window.innerHeight - KEEP_VISIBLE)),
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
        x: startWX + (ev.clientX - startMX),
        y: Math.max(HEADER_H, startWY + (ev.clientY - startMY)),
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
        y: Math.max(HEADER_H, startWY + (t.clientY - startMY)),
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
