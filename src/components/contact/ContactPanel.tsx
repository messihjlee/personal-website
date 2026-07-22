"use client";

import { useState } from "react";
import { Mail, Github, GraduationCap, BookOpen } from "lucide-react";
import { NavBar } from "@/components/ui/CardWindow";
import { Pane } from "@/components/ui/Pane";

interface WindowEntry {
  id: string;
  title: string;
  icon: React.ReactNode;
  note: string;
  linkLabel: string;
  href: string;
}

const WINDOWS: WindowEntry[] = [
  {
    id: "email",
    title: "email",
    icon: <Mail size={32} strokeWidth={1.5} />,
    note: "Want to reach out directly or inquire about a possible collaboration opportunity?",
    linkLabel: "messihjlee@gmail.com",
    href: "mailto:messihjlee@gmail.com",
  },
  {
    id: "github",
    title: "github",
    icon: <Github size={32} strokeWidth={1.5} />,
    note: "Curious about what projects I'm currently working on?",
    linkLabel: "github.com/messihjlee",
    href: "https://github.com/messihjlee",
  },
  {
    id: "scholar",
    title: "google scholar",
    icon: <GraduationCap size={32} strokeWidth={1.5} />,
    note: "Want to browse my published work and citation record?",
    linkLabel: "Google Scholar profile",
    href: "https://scholar.google.com/citations?user=qUz4nA8AAAAJ",
  },
  {
    id: "researchgate",
    title: "researchgate",
    icon: <BookOpen size={32} strokeWidth={1.5} />,
    note: "Looking for preprints, full texts, or research updates?",
    linkLabel: "ResearchGate profile",
    href: "https://www.researchgate.net/profile/Messi-Lee",
  },
];

export function ContactPanel() {
  const [index, setIndex] = useState(0);
  const entry = WINDOWS[index];

  return (
    <Pane
      id="contact"
      label="contact"
      subtitle={entry.title}
      width={680}
      height={360}
      footer={
        <NavBar
          index={index}
          total={WINDOWS.length}
          onPrev={() => setIndex((i) => Math.max(0, i - 1))}
          onNext={() => setIndex((i) => Math.min(WINDOWS.length - 1, i + 1))}
        />
      }
    >
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          padding: "32px 28px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 22,
          textAlign: "center",
        }}
      >
        <div style={{ color: "var(--foreground)", opacity: 0.75 }}>{entry.icon}</div>

        <p
          style={{
            fontSize: "1rem",
            lineHeight: 1.8,
            color: "var(--foreground)",
            margin: 0,
            letterSpacing: "0.04em",
            maxWidth: 420,
          }}
        >
          {entry.note}
        </p>

        <a
          href={entry.href}
          target={entry.id === "email" ? undefined : "_blank"}
          rel="noopener noreferrer"
          style={{
            display: "inline-block",
            fontSize: "0.875rem",
            letterSpacing: "0.10em",
            color: "var(--foreground)",
            textDecoration: "none",
            borderBottom: "1px solid var(--border)",
            paddingBottom: 2,
          }}
        >
          {entry.linkLabel} →
        </a>
      </div>
    </Pane>
  );
}
