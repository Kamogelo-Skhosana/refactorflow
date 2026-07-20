import { ImageResponse } from "next/og";

export const alt = "RefactorFlow - Same answer. Completely different process.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: 56,
          background: "#0a0a0a",
          color: "#ffffff",
          fontFamily: "Arial",
        }}
      >
        <div style={{ display: "flex", color: "#10b981", fontSize: 26, fontWeight: 800, letterSpacing: -1 }}>RefactorFlow</div>
        <div style={{ display: "flex", marginTop: 48, fontSize: 64, lineHeight: 1.05, fontWeight: 800, letterSpacing: -3, maxWidth: 640 }}>Same answer.<br />Completely different process.</div>
        <div style={{ display: "flex", marginTop: 20, color: "rgba(255,255,255,0.56)", fontSize: 24, maxWidth: 570 }}>Developer behavior intelligence for the work behind every solution.</div>
        <div style={{ display: "flex", position: "absolute", right: 55, bottom: 54, width: 380, height: 260, borderRadius: 20, background: "#111827", border: "1px solid rgba(255,255,255,0.1)", overflow: "hidden" }}>
          <div style={{ display: "flex", flexDirection: "column", width: "50%", padding: 24, borderRight: "1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ display: "flex", color: "#10b981", fontSize: 15, fontWeight: 700 }}>Developer A</div>
            <div style={{ display: "flex", marginTop: 26, color: "rgba(255,255,255,0.74)", fontFamily: "monospace", fontSize: 14 }}>def range(n):<br />  print(n)</div>
            <div style={{ display: "flex", marginTop: "auto", color: "#10b981", fontSize: 42, fontWeight: 800 }}>12</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", width: "50%", padding: 24 }}>
            <div style={{ display: "flex", color: "#f59e0b", fontSize: 15, fontWeight: 700 }}>Developer B</div>
            <div style={{ display: "flex", marginTop: 26, color: "rgba(255,255,255,0.45)", fontFamily: "monospace", fontSize: 14 }}>def range(n):<br />  try again<br />  print(n)</div>
            <div style={{ display: "flex", marginTop: "auto", color: "#f59e0b", fontSize: 42, fontWeight: 800 }}>61</div>
          </div>
        </div>
        <div style={{ display: "flex", marginTop: "auto", color: "rgba(255,255,255,0.38)", fontSize: 20 }}>Free to start  |  refactorflow.com</div>
      </div>
    ),
    { ...size },
  );
}
