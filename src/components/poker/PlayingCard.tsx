import type { CSSProperties } from "react";
import type { Card } from "@/lib/poker";

// card-faces.png is a 13×4 grid: columns A..K, rows Hearts/Diamonds/Spades/Clubs
const FACE_COLS = 13;
const FACE_ROWS = 4;

export function faceSpriteStyle(card: Card): CSSProperties {
  return {
    backgroundImage: "url(/cards/card-faces.png)",
    backgroundSize: `${FACE_COLS * 100}% ${FACE_ROWS * 100}%`,
    backgroundPosition: `${(card.col / (FACE_COLS - 1)) * 100}% ${(card.suit / (FACE_ROWS - 1)) * 100}%`,
    imageRendering: "pixelated",
  };
}

// One neutral-grey back, identical on every card.
export const greyBackStyle: CSSProperties = {
  backgroundImage: "url(/cards/back-grey.png)",
  backgroundSize: "100% 100%",
  imageRendering: "pixelated",
};

interface PlayingCardProps {
  card: Card;
  faceUp: boolean;
  highlight?: boolean;
  style?: CSSProperties;
}

// A single pixel-art card that flips between its back and face. The parent
// element controls the size (this fills 100% of it and keeps the 49:67 ratio).
export function PlayingCard({ card, faceUp, highlight, style }: PlayingCardProps) {
  return (
    <div
      style={{
        aspectRatio: "49 / 67",
        perspective: 700,
        transition: "transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.3s",
        transform: highlight ? "translateY(-10px) scale(1.06)" : "none",
        filter: highlight ? "drop-shadow(0 6px 14px rgba(0,0,0,0.45))" : "none",
        ...style,
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          transformStyle: "preserve-3d",
          transition: "transform 0.5s cubic-bezier(0.4, 0.2, 0.2, 1)",
          transform: faceUp ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", ...greyBackStyle }} />
        <div
          style={{
            position: "absolute",
            inset: 0,
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            ...faceSpriteStyle(card),
          }}
        />
      </div>
    </div>
  );
}
