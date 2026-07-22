"use client";

/**
 * The pane used across the site: a pixel playing card crossed with a window.
 *
 * The frame (ink border, stepped corners, corner indices) comes from the home
 * page cards; the title bar, traffic-light dots and nav bar come from the old
 * window design. Panels supply their own body and footer, so blog, research,
 * about and contact all sit in an identical frame.
 */

export const SUIT = "♠";

// the eight directions a window can be resized from; two-letter values are the
// corners. See ResizeHandles below and useDraggable's startResize.
export type ResizeDir = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

export function CardWindow({
  label,
  subtitle,
  onClose,
  onActivate,
  dragProps,
  onResizeStart,
  footer,
  style,
  className,
  innerRef,
  children,
}: {
  label: string;
  subtitle?: string;
  onClose?: () => void;
  // pressed anywhere in the window — used to raise it above overlapping windows
  onActivate?: () => void;
  dragProps?: {
    onMouseDown?: (e: React.MouseEvent) => void;
    onTouchStart?: (e: React.TouchEvent) => void;
  };
  // when set, the window shows resize handles on every edge and corner
  onResizeStart?: (dir: ResizeDir, e: React.PointerEvent) => void;
  footer?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  innerRef?: React.Ref<HTMLDivElement>;
  children?: React.ReactNode;
}) {
  const draggable = !!dragProps;

  return (
    <div
      ref={innerRef}
      onPointerDown={onActivate}
      className={className ? `card-window ${className}` : "card-window"}
      style={style}
    >
      {onResizeStart && <ResizeHandles onResizeStart={onResizeStart} />}
      <div className="card-window-inner">
        <div
          onMouseDown={draggable ? dragProps?.onMouseDown : undefined}
          onTouchStart={draggable ? dragProps?.onTouchStart : undefined}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            minHeight: BAR_H,
            padding: "0 14px",
            borderBottom: "1px solid var(--border)",
            flexShrink: 0,
            background: "var(--card)",
            userSelect: "none",
            cursor: draggable ? "grab" : "default",
            touchAction: "none",
          }}
        >
          <span className="card-index" style={{ flex: 1, marginRight: 12 }}>
            <span style={{ fontSize: 15 }}>{SUIT}</span>
            <span
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                minWidth: 0,
              }}
            >
              {subtitle ? `${label} · ${subtitle}` : label}
            </span>
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            {onClose ? (
              <button onClick={onClose} aria-label="Close" title="close" style={dotStyle("#ff5f57")} />
            ) : (
              <span style={dotStyle("#ff5f57")} />
            )}
          </div>
        </div>

        {children}

        {footer}
      </div>
    </div>
  );
}

// grab widths for the resize strips: a thin band along each edge, a larger
// square at each corner so both axes are easy to catch
const EDGE_GRAB = 7;
const CORNER_GRAB = 15;

const RESIZE_HANDLES: { dir: ResizeDir; style: React.CSSProperties }[] = [
  { dir: "n", style: { top: 0, left: 0, right: 0, height: EDGE_GRAB, cursor: "ns-resize" } },
  { dir: "s", style: { bottom: 0, left: 0, right: 0, height: EDGE_GRAB, cursor: "ns-resize" } },
  { dir: "e", style: { top: 0, right: 0, bottom: 0, width: EDGE_GRAB, cursor: "ew-resize" } },
  { dir: "w", style: { top: 0, left: 0, bottom: 0, width: EDGE_GRAB, cursor: "ew-resize" } },
  { dir: "ne", style: { top: 0, right: 0, width: CORNER_GRAB, height: CORNER_GRAB, cursor: "nesw-resize" } },
  { dir: "nw", style: { top: 0, left: 0, width: CORNER_GRAB, height: CORNER_GRAB, cursor: "nwse-resize" } },
  { dir: "se", style: { bottom: 0, right: 0, width: CORNER_GRAB, height: CORNER_GRAB, cursor: "nwse-resize" } },
  { dir: "sw", style: { bottom: 0, left: 0, width: CORNER_GRAB, height: CORNER_GRAB, cursor: "nesw-resize" } },
];

/**
 * The eight invisible grab strips laid over a window's edges and corners. They
 * sit above the body so a press near the edge starts a resize; corners stack
 * above the edges so the diagonal cursor wins where they overlap. The frame's
 * overflow: hidden trims them to the rounded corners.
 */
function ResizeHandles({
  onResizeStart,
}: {
  onResizeStart: (dir: ResizeDir, e: React.PointerEvent) => void;
}) {
  return (
    <>
      {RESIZE_HANDLES.map(({ dir, style }) => (
        <div
          key={dir}
          onPointerDown={(e) => onResizeStart(dir, e)}
          style={{
            position: "absolute",
            touchAction: "none",
            // corners (two-letter dirs) ride above the edges they overlap
            zIndex: dir.length === 2 ? 6 : 5,
            ...style,
          }}
        />
      ))}
    </>
  );
}

// title bar and nav bar share one height
export const BAR_H = 46;

export function dotStyle(color: string): React.CSSProperties {
  return {
    width: 12,
    height: 12,
    borderRadius: "50%",
    background: color,
    border: "none",
    cursor: "pointer",
    padding: 0,
    flexShrink: 0,
    display: "inline-block",
  };
}

// Every button on the site is this wide — nav, categories, links, read, show —
// so rows of them read as matched blocks rather than labels of varying length.
// It shrinks with the viewport so four fit across a phone (see --btn-w).
export const BTN_W = "var(--btn-w)";

export function navBtnStyle(disabled: boolean): React.CSSProperties {
  return {
    fontSize: 13,
    letterSpacing: "0.12em",
    color: disabled ? "var(--disabled)" : "var(--foreground)",
    background: "none",
    border: "1px solid var(--border)",
    padding: "6px 0",
    width: BTN_W,
    textAlign: "center",
    cursor: disabled ? "default" : "pointer",
    fontFamily: "inherit",
  };
}

/**
 * The wider action button: the same hairline, type and curve as navBtnStyle,
 * but sized to its label instead of the fixed BTN_W — for the prose-length
 * calls to action ("deal again", "fund the research →") that can't shrink into
 * a matched block. Pair with .pixel-edge, like every other button on the site.
 */
export const actionBtnStyle: React.CSSProperties = {
  fontFamily: "inherit",
  fontSize: 13,
  letterSpacing: "0.12em",
  color: "var(--foreground)",
  background: "none",
  border: "1px solid var(--border)",
  padding: "8px 22px",
  textAlign: "center",
  cursor: "pointer",
};

/** the same button, stepped back so it reads as the secondary of a pair */
export const actionBtnGhost: React.CSSProperties = {
  border: "1px solid transparent",
  color: "var(--muted)",
};

/** the bar a panel's actions sit in — the footer twin of the title bar */
export const footerBarStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 10,
  flexWrap: "wrap",
  minHeight: BAR_H,
  padding: "8px 14px",
  borderTop: "1px solid var(--border)",
  flexShrink: 0,
  background: "var(--card)",
};

/** the prev · counter · next bar every paging panel uses */
export function NavBar({
  index,
  total,
  onPrev,
  onNext,
}: {
  index: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  const isFirst = index === 0;
  const isLast = index === total - 1;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        minHeight: BAR_H,
        padding: "0 14px",
        borderTop: "1px solid var(--border)",
        flexShrink: 0,
        background: "var(--card)",
      }}
    >
      <button className="pixel-edge" onClick={onPrev} disabled={isFirst} style={navBtnStyle(isFirst)}>
        ← prev
      </button>
      <span style={{ fontSize: 13, letterSpacing: "0.12em", color: "var(--muted)" }}>
        {index + 1} / {total}
      </span>
      <button className="pixel-edge" onClick={onNext} disabled={isLast} style={navBtnStyle(isLast)}>
        next →
      </button>
    </div>
  );
}
