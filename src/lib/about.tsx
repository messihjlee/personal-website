import { readFileSync } from "fs";
import { join } from "path";
import { MdxContent } from "@/components/blog/MdxContent";
import type { AboutSection } from "@/components/ui/WindowLayer";

const SECTIONS = [
  { slug: "researcher", title: "researcher" },
  { slug: "research", title: "research" },
  { slug: "person", title: "person" },
  { slug: "now", title: "now" },
  { slug: "connect", title: "connect" },
];

// The about window's sections, rendered from the markdown files. Built on the
// server and handed to the client WindowLayer as ready-made nodes.
export function getAboutSections(): AboutSection[] {
  return SECTIONS.map(({ slug, title }) => ({
    title,
    rendered: (
      <MdxContent
        source={readFileSync(join(process.cwd(), `src/content/about/${slug}.md`), "utf-8")}
      />
    ),
  }));
}
