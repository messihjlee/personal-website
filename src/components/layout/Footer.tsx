import { siteConfig } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="py-8">
      <div className="mx-auto max-w-3xl px-8">
        <p className="text-sm text-muted">
          &copy; {new Date().getFullYear()} {siteConfig.name}
        </p>
        <p className="text-sm text-muted">
          Card back designs:{" "}
          <a
            href="https://opengameart.org/content/pixel-poker-cards"
            target="_blank"
            rel="noopener noreferrer"
          >
            Pixel Poker Cards
          </a>{" "}
          (CC BY 4.0)
        </p>
      </div>
    </footer>
  );
}
