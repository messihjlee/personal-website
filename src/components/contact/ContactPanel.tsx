"use client";

import { useState } from "react";
import { Mail, Github, GraduationCap, BookOpen } from "lucide-react";

interface WindowEntry {
  id: string;
  title: string;
  color: string;
  icon: React.ReactNode;
  note: string;
  linkLabel: string;
  href: string;
}

type WinState = "normal" | "minimized" | "closed";

const WINDOWS: WindowEntry[] = [
  {
    id: "email",
    title: "email",
    color: "#ff5f57",
    icon: <Mail size={32} strokeWidth={1.5} />,
    note: "Want to reach out directly or inquire about a possible collaboration opportunity?",
    linkLabel: "messihjlee@gmail.com",
    href: "mailto:messihjlee@gmail.com",
  },
  {
    id: "github",
    title: "github",
    color: "#f5a623",
    icon: <Github size={32} strokeWidth={1.5} />,
    note: "Curious about what projects I'm currently working on?",
    linkLabel: "github.com/messihjlee",
    href: "https://github.com/messihjlee",
  },
  {
    id: "scholar",
    title: "google scholar",
    color: "#27c93f",
    icon: <GraduationCap size={32} strokeWidth={1.5} />,
    note: "Want to browse my published work and citation record?",
    linkLabel: "Google Scholar profile",
    href: "https://scholar.google.com/citations?user=qUz4nA8AAAAJ",
  },
  {
    id: "researchgate",
    title: "researchgate",
    color: "#4fc3f7",
    icon: <BookOpen size={32} strokeWidth={1.5} />,
    note: "Looking for preprints, full texts, or research updates?",
    linkLabel: "ResearchGate profile",
    href: "https://www.researchgate.net/profile/Messi-Lee",
  },
];

function ContactWindow({ entry }: { entry: WindowEntry }) {
  const [win, setWin] = useState<WinState>("normal");

  if (win === "closed") {
    return (
      <button
        onClick={() => setWin("normal")}
        style={{
          fontSize: 10,
          letterSpacing: "0.14em",
          color: "var(--muted)",
          background: "none",
          border: "1px solid var(--border)",
          padding: "6px 14px",
          cursor: "pointer",
          fontFamily: "inherit",
          alignSelf: "start",
        }}
      >
        {entry.title}
      </button>
    );
  }

  const isMinimized = win === "minimized";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        border: "1px solid var(--border)",
        background: "var(--background)",
      }}
    >
      {/* Title bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "9px 14px",
          borderBottom: isMinimized ? "none" : "1px solid var(--border)",
          flexShrink: 0,
          background: "var(--card)",
          userSelect: "none",
        }}
      >
        <span
          style={{
            fontSize: 10,
            letterSpacing: "0.14em",
            color: "var(--muted)",
          }}
        >
          contact · {entry.title}
        </span>

        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <button
            onClick={() => setWin("closed")}
            aria-label="Close"
            title="close"
            style={dotStyle("#ff5f57")}
          />
          <button
            onClick={() => setWin(isMinimized ? "normal" : "minimized")}
            aria-label="Minimize"
            title="minimize"
            style={dotStyle("#f5a623")}
          />
          {/* green dot is decorative / placeholder */}
          <span style={dotStyle("#27c93f")} />
        </div>
      </div>

      {!isMinimized && (
        <div
          style={{
            padding: "28px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          <div style={{ color: "var(--foreground)", opacity: 0.75 }}>
            {entry.icon}
          </div>

          <p
            style={{
              fontSize: 14,
              lineHeight: 1.8,
              color: "var(--foreground)",
              margin: 0,
              letterSpacing: "0.04em",
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
              fontSize: 13,
              letterSpacing: "0.10em",
              color: "var(--foreground)",
              textDecoration: "none",
              borderBottom: "1px solid var(--border)",
              paddingBottom: 2,
              alignSelf: "start",
            }}
          >
            {entry.linkLabel} →
          </a>
        </div>
      )}
    </div>
  );
}

export function ContactPanel() {
  return (
    <div
      className="contact-grid"
      style={{
        width: "100%",
        maxWidth: 720,
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: 16,
      }}
    >
      {WINDOWS.map((entry) => (
        <ContactWindow key={entry.id} entry={entry} />
      ))}
    </div>
  );
}

function dotStyle(color: string): React.CSSProperties {
  return {
    width: 12,
    height: 12,
    borderRadius: "50%",
    background: color,
    border: "none",
    cursor: "pointer",
    padding: 0,
    flexShrink: 0,
    display: "inline-block",
  };
}
