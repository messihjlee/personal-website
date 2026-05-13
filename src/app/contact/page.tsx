import type { Metadata } from "next";
import { Mail, Github, GraduationCap } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact",
};

const links = [
  {
    label: "Email",
    href: "mailto:messihjlee@gmail.com",
    icon: Mail,
    display: "messihjlee@gmail.com",
  },
  {
    label: "GitHub",
    href: "https://github.com/messihjlee",
    icon: Github,
    display: "github.com/messihjlee",
  },
  {
    label: "Google Scholar",
    href: "https://scholar.google.com/citations?user=qUz4nA8AAAAJ",
    icon: GraduationCap,
    display: "Google Scholar",
  },
];

export default function ContactPage() {
  return (
    <div
      style={{
        minHeight: "100svh",
        background: "var(--background)",
        paddingTop: 36,
      }}
    >
      <div
        style={{
          borderTop: "1px solid var(--border)",
          minHeight: "calc(100svh - 36px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 16px",
        }}
      >
        <div style={{ maxWidth: 510, width: "100%" }}>
          <div
            style={{
              fontSize: 15,
              letterSpacing: "0.18em",
              color: "var(--foreground)",
              marginBottom: 12,
            }}
          >
            contact
          </div>
          <div style={{ height: 1, background: "var(--border)", marginBottom: 36 }} />

          <div style={{ border: "1px solid var(--border)" }}>
            {links.map((link, i) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 21,
                  padding: "21px 24px",
                  borderBottom:
                    i < links.length - 1 ? "1px solid var(--border)" : undefined,
                  color: "var(--muted)",
                  textDecoration: "none",
                  cursor: "pointer",
                }}
              >
                <link.icon size={24} style={{ flexShrink: 0, color: "var(--foreground)" }} />
                <div>
                  <div
                    style={{
                      fontSize: 16,
                      letterSpacing: "0.15em",
                      color: "var(--foreground)",
                      marginBottom: 3,
                    }}
                  >
                    {link.label.toLowerCase()}
                  </div>
                  <div style={{ fontSize: 15, letterSpacing: "0.08em", color: "var(--foreground)" }}>
                    {link.display}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
