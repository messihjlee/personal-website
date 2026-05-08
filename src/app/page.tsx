import Link from "next/link";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const NAV_LINKS = [
  { href: "/blog",     label: "BLOG",     sub: "writing"  },
  { href: "/about",    label: "ABOUT",    sub: "profile"  },
  { href: "/research", label: "RESEARCH", sub: "research" },
  { href: "/contact",  label: "CONTACT",  sub: "links"    },
];

export default function Home() {
  return (
    <div
      style={{
        display: "flex",
        height: "100svh",
        width: "100vw",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--background)",
        padding: "0 16px",
      }}
    >
      <div style={{ maxWidth: 510, width: "100%" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <div
            style={{
              fontSize: 15,
              letterSpacing: "0.22em",
              color: "var(--foreground)",
              textTransform: "uppercase",
            }}
          >
            FINDING-COLOR
          </div>
          <ThemeToggle />
        </div>
        <div style={{ height: 1, background: "var(--border)", marginBottom: 36 }} />

        <div style={{ border: "1px solid var(--border)" }}>
          {NAV_LINKS.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "21px 24px",
                borderBottom:
                  i < NAV_LINKS.length - 1 ? "1px solid var(--border)" : undefined,
                color: "var(--muted)",
                textDecoration: "none",
                cursor: "pointer",
              }}
            >
              <span
                style={{
                  fontSize: 16,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "var(--foreground)",
                }}
              >
                {link.label}
              </span>
              <span style={{ fontSize: 15, letterSpacing: "0.08em", color: "var(--muted)" }}>
                {link.sub}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
