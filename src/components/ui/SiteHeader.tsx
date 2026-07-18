"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Home } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { NotificationBell } from "./NotificationBell";

// Home isn't here: it's an icon control of its own, next to the theme toggle.
const NAV = [
  { href: "/blog",     label: "blog"     },
  { href: "/about",    label: "about"    },
  { href: "/research", label: "research" },
  { href: "/contact",  label: "contact"  },
];

// the header's icon controls share one hit box — see ThemeToggle
const iconBtnStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  background: "none",
  border: "none",
  color: "var(--foreground)",
  width: 24,
  height: 24,
  padding: 0,
  cursor: "pointer",
};

const labelStyle: React.CSSProperties = {
  fontSize: 10,
  letterSpacing: "0.14em",
  color: "var(--foreground)",
  textDecoration: "none",
};

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const navItems = NAV.filter((item) => item.href !== pathname);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 36,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 20px",
        // transparent so the icons read as floating logos rather than sitting on
        // a bar; the strip itself ignores the pointer so anything behind it
        // stays draggable, only the icon cluster below opts back in
        background: "transparent",
        pointerEvents: "none",
        zIndex: 50,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16, pointerEvents: "auto" }}>
        {/* Scroll-down arrow nav trigger */}
        <div ref={ref} style={{ position: "relative" }}>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Open navigation"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px 2px",
              color: open ? "var(--foreground)" : "var(--muted)",
              display: "flex",
              alignItems: "center",
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "var(--foreground)")}
            onMouseLeave={(e) => {
              if (!open) (e.currentTarget as HTMLButtonElement).style.color = "var(--muted)";
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {open && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                right: 0,
                background: "var(--background)",
                border: "var(--card-ink) solid var(--border)",
                borderRadius: "var(--radius-btn)",
                // so the item dividers follow the curve instead of squaring it off
                overflow: "hidden",
                minWidth: 120,
                zIndex: 100,
              }}
            >
              {navItems.map((item, i) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  style={{
                    display: "block",
                    padding: "10px 16px",
                    borderBottom: i < navItems.length - 1 ? "1px solid var(--border)" : undefined,
                    ...labelStyle,
                    fontSize: 12,
                  }}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Home sits between the nav dropdown and the theme toggle, an icon
            control of its own rather than a dropdown entry. It's dropped on the
            home page itself, the same way the dropdown leaves out the page
            you're already on. */}
        {pathname !== "/" && (
          <Link href="/" aria-label="Home" title="home" style={iconBtnStyle}>
            <Home size={16} strokeWidth={1.75} />
          </Link>
        )}

        <NotificationBell />

        <ThemeToggle />
      </div>
    </div>
  );
}
