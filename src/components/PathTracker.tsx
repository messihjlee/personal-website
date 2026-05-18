"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

function getSessionId(): string {
  let id = sessionStorage.getItem("_sid");
  if (!id) {
    id = Date.now().toString(36) + Math.random().toString(36).slice(2);
    sessionStorage.setItem("_sid", id);
  }
  return id;
}

function pageLabel(path: string): string {
  if (path === "/") return "home";
  const seg = path.split("/")[1];
  return ["about", "research", "blog", "contact"].includes(seg) ? seg : "";
}

export function PathTracker() {
  const pathname = usePathname();
  const prevRef = useRef<string>("");

  useEffect(() => {
    if (pathname === "/found") return;
    const page = pageLabel(pathname);
    if (!page) return;

    const prev = prevRef.current || null;
    prevRef.current = page;

    const sid = getSessionId();
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: sid, page, prevPage: prev }),
    }).catch(() => {});
  }, [pathname]);

  return null;
}
