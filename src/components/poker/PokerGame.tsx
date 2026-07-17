"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PlayingCard } from "./PlayingCard";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { actionBtnGhost, actionBtnStyle, BTN_W } from "@/components/ui/CardWindow";
import { bestHand, compareResults, dealHoldem, type Card } from "@/lib/poker";

// Heads-up hold'em against the house. A hand runs: two hole cards each plus the
// flop → check → turn → check → river → showdown. Folding at either check ends
// the hand where it stands, with no showdown.
type Phase = "dealing" | "betting" | "river" | "showdown" | "result";
type Outcome = "win" | "lose" | "push";
type Side = "opponent" | "board" | "player";

const FLOP = 3; // board cards face-up when the hand opens
const RIVER = 5; // ...and once both checks are in

// Hole cards land first, the board after; within a row each card follows the
// one before it. Positive y is the player's side of the table.
const ENTER_Y: Record<Side, number> = { player: 40, opponent: -40, board: -18 };
const ENTER_DELAY: Record<Side, number> = { player: 0, opponent: 120, board: 260 };

interface PokerGameProps {
  onClose: () => void;
}

export function PokerGame({ onClose }: PokerGameProps) {
  const router = useRouter();
  const [hands, setHands] = useState(dealHoldem);
  // bumped once per hand — it keys the table, so a new deal replays the entrance
  const [handNo, setHandNo] = useState(0);
  const [phase, setPhase] = useState<Phase>("dealing");
  const [boardShown, setBoardShown] = useState(FLOP);
  const [folded, setFolded] = useState(false);

  const { player, opponent, board } = hands;

  // each side plays the best five of the seven it can see
  const playerBest = useMemo(() => bestHand([...player, ...board]), [player, board]);
  const opponentBest = useMemo(() => bestHand([...opponent, ...board]), [opponent, board]);

  const outcome: Outcome = useMemo(() => {
    const cmp = compareResults(playerBest.result, opponentBest.result);
    return cmp > 0 ? "win" : cmp < 0 ? "lose" : "push";
  }, [playerBest, opponentBest]);

  // the beats the player doesn't drive: the deal, and the run to the showdown
  useEffect(() => {
    if (phase === "dealing") {
      const t = setTimeout(() => setPhase("betting"), 1050);
      return () => clearTimeout(t);
    }
    if (phase === "river") {
      const t = setTimeout(() => setPhase("showdown"), 1300);
      return () => clearTimeout(t);
    }
    if (phase === "showdown") {
      const t = setTimeout(() => setPhase("result"), 1500);
      return () => clearTimeout(t);
    }
  }, [phase]);

  // a loss (or a fold) funnels to the donation page after a beat
  useEffect(() => {
    if (phase !== "result" || (!folded && outcome !== "lose")) return;
    const t = setTimeout(() => router.push("/donate"), 3000);
    return () => clearTimeout(t);
  }, [phase, outcome, folded, router]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // a check buys the next street; the river asks nothing back, it just runs
  function check() {
    const next = boardShown + 1;
    setBoardShown(next);
    if (next === RIVER) setPhase("river");
  }

  function fold() {
    setFolded(true);
    setPhase("result");
  }

  // same table, fresh cards — winning shouldn't cost you your seat
  function dealAgain() {
    setHands(dealHoldem());
    setHandNo((n) => n + 1);
    setBoardShown(FLOP);
    setFolded(false);
    setPhase("dealing");
  }

  const finalOutcome: Outcome = folded ? "lose" : outcome;
  const showResult = phase === "result";
  const dealing = phase === "dealing";
  // fold and there's no showdown: nothing turns over and no hand gets named
  const showdown = !folded && (phase === "showdown" || phase === "result");
  const named = showResult && !folded;
  const playerWon = named && finalOutcome === "win";
  const opponentWon = named && finalOutcome === "lose";

  // at the showdown the winner's five playing cards lift — board cards
  // included, since they're part of the hand too
  const winners = useMemo(() => {
    if (!named) return new Set<Card>();
    if (finalOutcome === "win") return new Set(playerBest.cards);
    if (finalOutcome === "lose") return new Set(opponentBest.cards);
    return new Set([...playerBest.cards, ...opponentBest.cards]);
  }, [named, finalOutcome, playerBest, opponentBest]);

  function renderRow(cards: Card[], side: Side, isFaceUp: (i: number) => boolean) {
    return (
      <div className={`poker-row poker-row--${side}`}>
        {cards.map((card, i) => (
          <div
            key={i}
            className="poker-slot"
            style={
              {
                animationDelay: `${i * 90 + ENTER_DELAY[side]}ms`,
                "--deal-from": `${ENTER_Y[side]}px`,
              } as React.CSSProperties
            }
          >
            <PlayingCard card={card} faceUp={isFaceUp(i)} highlight={winners.has(card)} />
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

      <button className="pixel-edge" onClick={onClose} style={leaveStyle}>
        ← leave table
      </button>

      {/* opponent side */}
      <div style={{ textAlign: "center", width: "100%", minHeight: 22 }}>
        <HandLabel hand={named ? opponentBest.result.name : undefined} won={opponentWon} />
      </div>

      {/* the tilted table — centered in the middle of the screen */}
      <div style={{ perspective: 1100, width: "100%", display: "flex", alignItems: "center" }}>
        <div
          key={handNo}
          style={{
            width: "100%",
            transformStyle: "preserve-3d",
            transform: "rotateX(14deg)",
            display: "flex",
            flexDirection: "column",
            gap: "clamp(16px, 4vh, 44px)",
          }}
        >
          {renderRow(opponent, "opponent", () => showdown)}
          {renderRow(board, "board", (i) => !dealing && i < boardShown)}
          {renderRow(player, "player", () => !dealing)}
        </div>
      </div>

      {/* player side + HUD */}
      <div style={{ textAlign: "center", width: "100%", minHeight: 132 }}>
        <HandLabel hand={named ? playerBest.result.name : undefined} won={playerWon} />

        {dealing && <p style={hudMuted}>dealing…</p>}

        {phase === "betting" && (
          <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 22 }}>
            <button
              className="pixel-edge"
              onClick={fold}
              style={{ ...actionBtnStyle, padding: "8px 0", width: BTN_W }}
            >
              fold
            </button>
            <button
              className="pixel-edge"
              onClick={check}
              style={{ ...actionBtnStyle, padding: "8px 0", width: BTN_W }}
            >
              check
            </button>
          </div>
        )}

        {phase === "river" && <p style={hudMuted}>river…</p>}
        {phase === "showdown" && <p style={hudMuted}>showdown…</p>}

        {showResult && (
          <ResultPanel outcome={finalOutcome} onDealAgain={dealAgain} router={router} />
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
  onDealAgain,
  router,
}: {
  outcome: Outcome;
  onDealAgain: () => void;
  router: ReturnType<typeof useRouter>;
}) {
  if (outcome === "lose") {
    return (
      <div style={{ marginTop: 12 }}>
        <p style={hudTitle}>the house wins</p>
        <p style={hudMuted}>funding the research… redirecting</p>
        <button
          className="pixel-edge"
          onClick={() => router.push("/donate")}
          style={{ ...actionBtnStyle, marginTop: 12 }}
        >
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
          <button className="pixel-edge" onClick={onDealAgain} style={actionBtnStyle}>
            deal again
          </button>
        </div>
      </div>
    );
  }
  return (
    <div style={{ marginTop: 12 }}>
      <p style={hudTitle}>you win 🎉</p>
      <div
        style={{
          display: "flex",
          gap: 10,
          justifyContent: "center",
          marginTop: 10,
          flexWrap: "wrap",
        }}
      >
        <button className="pixel-edge" onClick={onDealAgain} style={actionBtnStyle}>
          deal again
        </button>
        <button
          className="pixel-edge"
          onClick={() => router.push("/donate")}
          style={{ ...actionBtnStyle, ...actionBtnGhost }}
        >
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

// The table is a full-screen overlay with no chrome of its own, and "deal
// again" now keeps you in your seat — so this is the way back out (as is Esc).
const leaveStyle: React.CSSProperties = {
  ...actionBtnStyle,
  position: "fixed",
  top: 8,
  left: 12,
  zIndex: 101,
  fontSize: 11,
  padding: "5px 12px",
  color: "var(--muted)",
};
