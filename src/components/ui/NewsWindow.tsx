"use client";

import Link from "next/link";
import { actionBtnStyle } from "@/components/ui/CardWindow";
import { Pane } from "@/components/ui/Pane";
import type { NotificationItem } from "@/lib/notifications";

// The pane a notification opens into — the shared Pane frame, launched from the
// header bell. It rides above the page's own panes (zIndex) and is dismissible:
// closing hands back to onClose so the bell can unmount it.
export function NewsWindow({ item, onClose }: { item: NotificationItem; onClose: () => void }) {
  return (
    <Pane id={`news:${item.id}`} label="news" subtitle={item.date} width={520} height={380} zIndex={60} onClose={onClose}>
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          padding: "28px 28px 24px",
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <div style={{ fontSize: "0.6875rem", letterSpacing: "0.14em", color: "var(--muted)" }}>{item.date}</div>
        <h2 style={{ fontSize: "1.125rem", fontWeight: 700, lineHeight: 1.4, color: "var(--foreground)", margin: 0 }}>
          {item.title}
        </h2>
        {item.body.split("\n\n").map((para, i) => (
          <p
            key={i}
            style={{
              fontSize: "0.875rem",
              lineHeight: 1.8,
              letterSpacing: "0.02em",
              color: "var(--foreground)",
              margin: 0,
            }}
          >
            {para}
          </p>
        ))}

        {item.link && <NewsLink link={item.link} onNavigate={onClose} />}
      </div>
    </Pane>
  );
}

// The body's call-to-action. Off-site (http…) opens in a new tab; an on-site
// path navigates and closes the news window so it doesn't linger over the page.
function NewsLink({
  link,
  onNavigate,
}: {
  link: NonNullable<NotificationItem["link"]>;
  onNavigate: () => void;
}) {
  const style: React.CSSProperties = { ...actionBtnStyle, alignSelf: "start", textDecoration: "none", marginTop: 4 };
  const external = /^https?:\/\//.test(link.href);

  if (external) {
    return (
      <a href={link.href} target="_blank" rel="noopener noreferrer" className="pixel-edge" style={style}>
        {link.label}
      </a>
    );
  }
  return (
    <Link href={link.href} onClick={onNavigate} className="pixel-edge" style={style}>
      {link.label}
    </Link>
  );
}
