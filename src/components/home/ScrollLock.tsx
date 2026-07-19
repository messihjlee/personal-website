"use client";

import { useEffect } from "react";

// Locks the document to the viewport while the home page is mounted. The home
// container already clips its own overflow, but on mobile the page itself can
// still rubber-band and the URL bar reveal shifts the view — which fights the
// card dragging. Pinning <html> defeats that; other routes stay scrollable
// because the class is removed on unmount.
export function ScrollLock() {
  useEffect(() => {
    document.documentElement.classList.add("home-locked");
    return () => document.documentElement.classList.remove("home-locked");
  }, []);

  return null;
}
