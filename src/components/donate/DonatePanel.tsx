"use client";

import Link from "next/link";
import { PLAY_HREF, siteConfig, socialLinks } from "@/lib/constants";
import { actionBtnStyle, footerBarStyle } from "@/components/ui/CardWindow";
import { Pane } from "@/components/ui/Pane";

// The same window as contact, blog and about — supplied through the shared Pane,
// so this file is only the donation copy and its footer.
export function DonatePanel() {
  return (
    <Pane
      id="support"
      label="support"
      subtitle="research fund"
      width={560}
      height={420}
      footer={
        <div style={footerBarStyle}>
          {/* the table is an overlay on the home page, so this is the way back */}
          <Link
            href={PLAY_HREF}
            className="pixel-edge"
            style={{ ...actionBtnStyle, display: "inline-block", textDecoration: "none" }}
          >
            ← play again
          </Link>
          <a
            href={siteConfig.donationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="pixel-edge"
            style={{ ...actionBtnStyle, display: "inline-block", textDecoration: "none" }}
          >
            fund the research →
          </a>
        </div>
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
          justifyContent: "center",
          gap: 18,
        }}
      >
        <p style={noteStyle}>
          The house won — thanks for playing. I&apos;m an independent researcher funding this
          work out of my own pocket, and your support goes directly toward the API credits
          that keep the experiments running.
        </p>
        <p style={noteStyle}>
          Any amount genuinely helps and is deeply appreciated. Supporters are credited in the
          acknowledgements section of the work their funding makes possible.
        </p>

        <a
          href={socialLinks.email}
          style={{
            alignSelf: "start",
            fontSize: "0.8125rem",
            letterSpacing: "0.10em",
            color: "var(--muted)",
            textDecoration: "none",
            borderBottom: "1px solid var(--border)",
            paddingBottom: 2,
          }}
        >
          or reach out first →
        </a>
      </div>
    </Pane>
  );
}

const noteStyle: React.CSSProperties = {
  fontSize: "0.875rem",
  lineHeight: 1.8,
  color: "var(--foreground)",
  margin: 0,
  letterSpacing: "0.04em",
};
