import { useState, useRef, useCallback, useEffect } from "react";

export interface Position {
  x: number;
  y: number;
}

const HEADER_H = 37;

export function useDraggable(getInitialPos: () => Position) {
  const [pos, setPos] = useState<Position | null>(null);
  const posRef = useRef<Position>({ x: 0, y: 0 });
  if (pos) posRef.current = pos;

  useEffect(() => {
    setPos(getInitialPos());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    e.preventDefault();
    const startMX = e.clientX;
    const startMY = e.clientY;
    const { x: startWX, y: startWY } = posRef.current;

    function onMove(ev: MouseEvent) {
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

  return { pos, onMouseDown, onTouchStart };
}
