import { getResearch } from "@/lib/research";
import { ResearchCard } from "./ResearchCard";

export function ResearchList() {
  const publications = getResearch();
  const selected = publications.filter((p) => p.selected);
  const others = publications.filter((p) => !p.selected);

  return (
    <div>
      {selected.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            Selected Publications
          </h2>
          <div className="mt-4">
            {selected.map((pub) => (
              <ResearchCard key={pub.title} pub={pub} />
            ))}
          </div>
        </div>
      )}

      {others.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-semibold tracking-tight">
            Other Publications
          </h2>
          <div className="mt-4">
            {others.map((pub) => (
              <ResearchCard key={pub.title} pub={pub} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
