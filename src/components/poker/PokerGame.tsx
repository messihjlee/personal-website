"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PlayingCard } from "./PlayingCard";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { compareHands, deal, evaluateHand, type Card } from "@/lib/poker";

type Phase = "dealing" | "betting" | "reveal" | "result";
type Outcome = "win" | "lose" | "push";

interface PokerGameProps {
  onClose: () => void;
}

export function PokerGame({ onClose }: PokerGameProps) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("dealing");
  const [dealt, setDealt] = useState(false);
  const [folded, setFolded] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const hands = useMemo(() => deal(), []);
  const { player, opponent } = hands;

  const outcome: Outcome = useMemo(() => {
    const cmp = compareHands(player, opponent);
    return cmp > 0 ? "win" : cmp < 0 ? "lose" : "push";
  }, [player, opponent]);

  const playerEval = useMemo(() => evaluateHand(player), [player]);
  const opponentEval = useMemo(() => evaluateHand(opponent), [opponent]);

  const addTimer = (fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  };

  // deal in, then open betting
  useEffect(() => {
    const raf = requestAnimationFrame(() => setDealt(true));
    addTimer(() => setPhase("betting"), 1050);
    return () => {
      cancelAnimationFrame(raf);
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, []);

  // after the reveal flip settles, show the result
  useEffect(() => {
    if (phase !== "reveal") return;
    addTimer(() => setPhase("result"), 1500);
  }, [phase]);

  // a loss (or a fold) funnels to the donation page after a beat
  useEffect(() => {
    if (phase === "result" && (folded || outcome === "lose")) {
      addTimer(() => router.push("/donate"), 3000);
    }
  }, [phase, outcome, folded, router]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const finalOutcome: Outcome = folded ? "lose" : outcome;
  const showResult = phase === "result";
  const playerWon = finalOutcome === "win";
  const opponentWon = finalOutcome === "lose";
  // you see your own hand as soon as it's dealt; the opponent's stays hidden
  // until the showdown
  const opponentFaceUp = phase === "reveal" || phase === "result";
  const playerFaceUp = phase !== "dealing";

  function renderRow(
    cards: Card[],
    side: "opponent" | "player",
    faceUp: boolean,
    won: boolean,
  ) {
    return (
      <div className={`poker-row poker-row--${side}`}>
        {cards.map((card, i) => (
          <div
            key={i}
            className="poker-slot"
            style={{
              transitionDelay: dealt ? `${i * 90 + (side === "opponent" ? 120 : 0)}ms` : "0ms",
              opacity: dealt ? 1 : 0,
              transform: dealt
                ? "translateY(0)"
                : `translateY(${side === "opponent" ? -40 : 40}px)`,
            }}
          >
            <PlayingCard
              card={card}
              faceUp={faceUp}
              highlight={showResult && won}
              style={{ transitionDelay: faceUp ? `${i * 70}ms` : "0ms" }}
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className="poker-overlay"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "var(--background)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "clamp(14px, 3vh, 30px)",
        padding: "48px 12px clamp(16px, 4vh, 40px)",
        overflow: "hidden",
        animation: "pokerFade 0.4s ease",
      }}
    >
      {/* same centered logo header as every other page */}
      <SiteHeader />

      {/* opponent side */}
      <div style={{ textAlign: "center", width: "100%", minHeight: 22 }}>
        <HandLabel hand={showResult ? opponentEval.name : undefined} won={showResult && opponentWon} />
      </div>

      {/* the tilted table — centered in the middle of the screen */}
      <div style={{ perspective: 1100, width: "100%", display: "flex", alignItems: "center" }}>
        <div
          style={{
            width: "100%",
            transformStyle: "preserve-3d",
            transform: "rotateX(14deg)",
            display: "flex",
            flexDirection: "column",
            gap: "clamp(24px, 6vh, 64px)",
          }}
        >
          {renderRow(opponent, "opponent", opponentFaceUp, opponentWon)}
          {renderRow(player, "player", playerFaceUp, playerWon)}
        </div>
      </div>

      {/* player side + HUD */}
      <div style={{ textAlign: "center", width: "100%", minHeight: 132 }}>
        <HandLabel hand={showResult ? playerEval.name : undefined} won={showResult && playerWon} />

        {phase === "dealing" && (
          <p style={hudMuted}>dealing…</p>
        )}

        {phase === "betting" && (
          <div style={{ marginTop: 10 }}>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 12 }}>
              <button
                onClick={() => {
                  setFolded(true);
                  setPhase("result");
                }}
                style={{ ...chipStyle, minWidth: 96 }}
              >
                fold
              </button>
              <button onClick={() => setPhase("reveal")} style={{ ...chipStyle, minWidth: 96 }}>
                check
              </button>
            </div>
          </div>
        )}

        {phase === "reveal" && <p style={hudMuted}>showdown…</p>}

        {showResult && (
          <ResultPanel outcome={finalOutcome} onClose={onClose} router={router} />
        )}
      </div>
    </div>
  );
}

function HandLabel({ hand, won }: { hand?: string; won?: boolean }) {
  if (!hand) return null;
  return (
    <span
      style={{
        fontSize: 15,
        letterSpacing: "0.02em",
        color: "var(--foreground)",
        fontWeight: won ? 700 : 500,
      }}
    >
      {hand}
    </span>
  );
}

function ResultPanel({
  outcome,
  onClose,
  router,
}: {
  outcome: Outcome;
  onClose: () => void;
  router: ReturnType<typeof useRouter>;
}) {
  if (outcome === "lose") {
    return (
      <div style={{ marginTop: 12 }}>
        <p style={hudTitle}>the house wins</p>
        <p style={hudMuted}>funding the research… redirecting</p>
        <button onClick={() => router.push("/donate")} style={{ ...chipStyle, marginTop: 12 }}>
          continue →
        </button>
      </div>
    );
  }
  if (outcome === "push") {
    return (
      <div style={{ marginTop: 12 }}>
        <p style={hudTitle}>push — it&apos;s a tie</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 10 }}>
          <button onClick={onClose} style={chipStyle}>deal again</button>
        </div>
      </div>
    );
  }
  return (
    <div style={{ marginTop: 12 }}>
      <p style={hudTitle}>you win 🎉</p>
      <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 10, flexWrap: "wrap" }}>
        <button onClick={onClose} style={chipStyle}>deal again</button>
        <button onClick={() => router.push("/donate")} style={{ ...chipStyle, ...chipGhost }}>
          fund the research anyway →
        </button>
      </div>
    </div>
  );
}

const hudMuted: React.CSSProperties = {
  fontSize: 15,
  letterSpacing: "0.04em",
  color: "var(--muted)",
  marginTop: 8,
};

const hudTitle: React.CSSProperties = {
  fontSize: 15,
  letterSpacing: "0.02em",
  color: "var(--foreground)",
  fontWeight: 700,
};

// both bet/result buttons share one clean outlined style so they read as a set
const chipStyle: React.CSSProperties = {
  fontFamily: "inherit",
  fontSize: 15,
  fontWeight: 500,
  letterSpacing: "0.04em",
  color: "var(--foreground)",
  background: "transparent",
  border: "1px solid var(--border)",
  padding: "8px 22px",
  cursor: "pointer",
};

const chipGhost: React.CSSProperties = {
  border: "1px solid transparent",
  color: "var(--muted)",
};
