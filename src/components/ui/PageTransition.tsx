"use client";

import { usePathname } from "next/navigation";

// keying on the path remounts the wrapper on every navigation, so the fade
// replays — the same entrance the poker table gets when it opens
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="page-fade">
      {children}
    </div>
  );
}
