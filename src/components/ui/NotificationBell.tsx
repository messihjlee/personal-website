"use client";

import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { notifications, type NotificationItem } from "@/lib/notifications";
import { NewsWindow } from "./NewsWindow";

// The header bell: a dropdown of notification short-titles, each opening into a
// draggable news window. Mirrors the nav dropdown next to it — same frame,
// same click-outside-to-close behaviour.
export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState(false);
  const [active, setActive] = useState<NotificationItem | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const hasUnread = !seen && notifications.length > 0;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function toggle() {
    setOpen((v) => !v);
    setSeen(true); // opening the tray clears the unread dot
  }

  return (
    <>
      <div ref={ref} style={{ position: "relative", display: "inline-flex" }}>
        <button
          onClick={toggle}
          aria-label="Notifications"
          title="notifications"
          style={{
            position: "relative",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            background: "none",
            border: "none",
            color: open ? "var(--foreground)" : "var(--muted)",
            width: 24,
            height: 24,
            padding: 0,
            cursor: "pointer",
            transition: "color 0.15s",
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "var(--foreground)")}
          onMouseLeave={(e) => {
            if (!open) (e.currentTarget as HTMLButtonElement).style.color = "var(--muted)";
          }}
        >
          <Bell size={16} strokeWidth={1.75} />
          {hasUnread && (
            <span
              aria-hidden
              style={{
                position: "absolute",
                top: 1,
                right: 1,
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#a8372d",
                border: "1px solid var(--background)",
              }}
            />
          )}
        </button>

        {open && (
          <div
            className="notif-tray"
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              right: 0,
              background: "var(--background)",
              border: "var(--card-ink) solid var(--border)",
              borderRadius: "var(--radius-btn)",
              overflow: "hidden",
              width: 250,
              zIndex: 100,
            }}
          >
            <div
              style={{
                padding: "9px 14px",
                fontSize: 10,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "var(--muted)",
                borderBottom: "1px solid var(--border)",
              }}
            >
              notifications
            </div>
            {notifications.length === 0 ? (
              <div style={{ padding: "14px", fontSize: 12, color: "var(--muted)" }}>
                nothing new
              </div>
            ) : (
              notifications.map((item, i) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActive(item);
                    setOpen(false);
                  }}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    background: "none",
                    border: "none",
                    borderBottom: i < notifications.length - 1 ? "1px solid var(--border)" : undefined,
                    padding: "10px 14px",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    color: "var(--foreground)",
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "var(--card)")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "none")}
                >
                  <span style={{ display: "block", fontSize: 12, lineHeight: 1.45, letterSpacing: "0.02em" }}>
                    {item.shortTitle}
                  </span>
                  <span style={{ display: "block", fontSize: 10, letterSpacing: "0.12em", color: "var(--muted)", marginTop: 3 }}>
                    {item.date}
                  </span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {active && <NewsWindow item={active} onClose={() => setActive(null)} />}
    </>
  );
}
