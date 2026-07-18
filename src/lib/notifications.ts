// The news feed behind the header bell. Client-safe (no server imports) so the
// dropdown and the window pane can both read it directly. Newest first — the
// bell's unread dot and the dropdown order follow this array.
export interface NotificationItem {
  id: string;
  // the one-liner shown in the dropdown
  shortTitle: string;
  // the heading inside the opened window pane
  title: string;
  // ISO date, shown as the window subtitle and above the body
  date: string;
  // plain-text body; blank lines separate paragraphs
  body: string;
  // optional call-to-action shown as a button under the body. An off-site href
  // (http...) opens in a new tab; an on-site path ("/research") navigates.
  link?: { label: string; href: string };
}

export const notifications: NotificationItem[] = [
  {
    id: "nmi-accepted",
    shortTitle: "Paper accepted in principle at Nature Machine Intelligence",
    title: "Accepted in principle at Nature Machine Intelligence",
    date: "2026-07-18",
    body:
      "My paper “Implicit Bias-Like Patterns in Reasoning Models” has been accepted in principle at Nature Machine Intelligence.\n\nIt introduces the Reasoning Model Implicit Association Test (RM-IAT) to study implicit bias-like processing in step-by-step reasoning models. The pre-print is available now — check it out below.",
    link: { label: "read the pre-print →", href: "https://arxiv.org/abs/2503.11572" },
  },
];
