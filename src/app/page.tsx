import { WindowStack } from "@/components/home/WindowStack";

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
      }}
    >
      <WindowStack />
    </div>
  );
}
