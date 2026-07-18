import { WindowStack } from "@/components/home/WindowStack";
import { RouteWindow } from "@/lib/minimized";

export default function Home() {
  return (
    <div
      style={{
        display: "flex",
        height: "100svh",
        width: "100vw",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--background)",
        padding: "36px 16px 0",
        overflow: "hidden",
      }}
    >
      <RouteWindow id={null} />
      <WindowStack />
    </div>
  );
}
