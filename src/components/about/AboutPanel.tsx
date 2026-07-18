"use client";

import { useState } from "react";
import { NavBar } from "@/components/ui/CardWindow";
import { Pane } from "@/components/ui/Pane";

interface Section {
  title: string;
  rendered: React.ReactNode;
}

const WINDOW_W = 680;
// sized to the longest section (~120 words), so the shorter ones don't sit in a
// half-empty pane; the body scrolls if a section ever outgrows it
const WINDOW_H = 420;

export function AboutPanel({ sections }: { sections: Section[] }) {
  const [index, setIndex] = useState(0);

  return (
    <Pane
      id="about"
      label="about"
      subtitle={sections[index].title}
      width={WINDOW_W}
      height={WINDOW_H}
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
          fontSize: 15,
          lineHeight: 1.85,
          color: "var(--foreground)",
        }}
      >
        {sections.map((s, i) => (
          <div
            key={s.title}
            // margin auto rather than justify/align center: a section taller
            // than the pane still scrolls from its top instead of being clipped
            style={{ display: i === index ? "block" : "none", margin: "auto", width: "100%" }}
          >
            {s.rendered}
          </div>
        ))}
      </div>
    </Pane>
  );
}
