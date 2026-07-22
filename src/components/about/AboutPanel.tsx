"use client";

import { useCallback, useRef, useState } from "react";
import { BAR_H, NavBar } from "@/components/ui/CardWindow";
import { Pane } from "@/components/ui/Pane";

interface Section {
  title: string;
  rendered: React.ReactNode;
}

const WINDOW_W = 680;

// The window height now follows the section on screen, so a six-line page no
// longer sits in a pane sized for the ten-line one. We measure the live content
// and add the fixed chrome around it; the height is clamped to a floor (so a
// one-liner still reads as a window) and a ceiling (so the longest section stays
// a comfortable size and simply scrolls past it).
const MIN_H = 180;
const MAX_H = 460;
// body padding: 28 top + 24 bottom (see the scroll container below)
const BODY_PAD_V = 28 + 24;
// title bar + nav bar, each with its hairline border
const CHROME_H = (BAR_H + 1) * 2;

export function AboutPanel({ sections }: { sections: Section[] }) {
  const [index, setIndex] = useState(0);

  // the natural height of the section currently rendered
  const [contentH, setContentH] = useState(MAX_H - CHROME_H - BODY_PAD_V);

  // A callback ref, not useRef + effect: Pane mounts its children late (it
  // renders nothing until it has computed a position), so an effect keyed on
  // the section index runs while the node is still absent and never fires
  // again for the first page. The callback ref instead runs the moment the
  // node attaches. The ResizeObserver then covers everything after: a new
  // section changes the content height, and a viewport-width change rewraps
  // the prose — both reach us as a size change on the same node.
  const roRef = useRef<ResizeObserver | null>(null);
  const measureRef = useCallback((node: HTMLDivElement | null) => {
    roRef.current?.disconnect();
    if (!node) return;
    const update = () => setContentH(node.scrollHeight);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(node);
    roRef.current = ro;
  }, []);

  const windowH = Math.max(MIN_H, Math.min(MAX_H, CHROME_H + BODY_PAD_V + contentH));

  return (
    <Pane
      id="about"
      label="about"
      subtitle={sections[index].title}
      width={WINDOW_W}
      height={windowH}
      footer={
        <NavBar
          index={index}
          total={sections.length}
          onPrev={() => setIndex((i) => Math.max(0, i - 1))}
          onNext={() => setIndex((i) => Math.min(sections.length - 1, i + 1))}
        />
      }
    >
      <div
        style={{
          padding: "28px 28px 24px",
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          display: "flex",
          fontSize: "0.9375rem",
          lineHeight: 1.85,
          color: "var(--foreground)",
        }}
      >
        {/* only the active section is mounted, so its measured height is the
            one we size to; margin auto keeps short prose centred, while a
            section taller than the cap still scrolls from its top */}
        <div ref={measureRef} style={{ margin: "auto", width: "100%" }}>
          {sections[index].rendered}
        </div>
      </div>
    </Pane>
  );
}
