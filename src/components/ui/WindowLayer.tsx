"use client";

import { Fragment } from "react";
import type { BlogPost } from "@/types";
import type { Publication } from "@/lib/research";
import { useWindows } from "@/lib/minimized";
import { BlogDesktop } from "@/components/blog/BlogDesktop";
import { ResearchPanel } from "@/components/research/ResearchPanel";
import { AboutPanel } from "@/components/about/AboutPanel";
import { ContactPanel } from "@/components/contact/ContactPanel";
import { DonatePanel } from "@/components/donate/DonatePanel";

export interface AboutSection {
  title: string;
  rendered: React.ReactNode;
}

interface WindowData {
  posts: BlogPost[];
  publications: Publication[];
  aboutSections: AboutSection[];
}

function renderPanel(id: string, data: WindowData): React.ReactNode {
  switch (id) {
    case "blog":
      return <BlogDesktop posts={data.posts} />;
    case "research":
      return <ResearchPanel publications={data.publications} />;
    case "about":
      return <AboutPanel sections={data.aboutSections} />;
    case "contact":
      return <ContactPanel />;
    case "support":
      return <DonatePanel />;
    // news ids ("news:*") are mounted by the header bell, not here
    default:
      return null;
  }
}

/**
 * Every window is mounted here, in the root layout, so any of them can float
 * over any page. Windows render in the order they were raised, so the most
 * recent sits on top.
 */
export function WindowLayer(data: WindowData) {
  const { open } = useWindows();

  return (
    <>
      {open.map((id) => (
        <Fragment key={id}>{renderPanel(id, data)}</Fragment>
      ))}
    </>
  );
}
