import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const contentType = "image/png";
export const size = { width: 1200, height: 630 };

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          backgroundColor: "#0f0f0f",
          padding: "64px 80px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <span
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: "#888",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            nouchi.ci
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <span
            style={{
              fontSize: 56,
              fontWeight: 700,
              color: "#ffffff",
              lineHeight: 1,
              textTransform: "uppercase",
              letterSpacing: "-0.02em",
            }}
          >
            Tous les mots
          </span>
          <span
            style={{
              fontSize: 56,
              fontWeight: 700,
              color: "#888",
              lineHeight: 1,
              textTransform: "uppercase",
              letterSpacing: "-0.02em",
            }}
          >
            du nouchi
          </span>
          <span style={{ fontSize: 24, color: "#aaaaaa", lineHeight: 1.4 }}>
            {"L'argot urbain ivoirien documenté par la communauté"}
          </span>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <span style={{ fontSize: 16, color: "#555", letterSpacing: "0.05em" }}>
            Dictionnaire Nouchi — nouchi.ci
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
