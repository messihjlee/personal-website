"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";

const NAV = [
  { href: "/",         label: "home"     },
  { href: "/blog",     label: "blog"     },
  { href: "/about",    label: "about"    },
  { href: "/research", label: "research" },
  { href: "/contact",  label: "contact"  },
];

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
        background: "var(--background)",
        zIndex: 50,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
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

        <ThemeToggle />
      </div>
    </div>
  );
}
