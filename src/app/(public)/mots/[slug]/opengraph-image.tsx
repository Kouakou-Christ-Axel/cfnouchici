import { ImageResponse } from "next/og";
import { getMotBySlug } from "@/lib/queries/mots";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const contentType = "image/png";
export const size = { width: 1200, height: 630 };

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let mot = null;
  try {
    mot = await getMotBySlug(slug);
  } catch {
    // DB unavailable at build time — render generic image
  }

  const motLabel = mot?.mot ?? "Nouchi";
  const definition = mot?.definition
    ? mot.definition.length > 100
      ? mot.definition.slice(0, 97) + "…"
      : mot.definition
    : "Dictionnaire du nouchi ivoirien";

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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
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

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <span
            style={{
              fontSize: 72,
              fontWeight: 700,
              color: "#ffffff",
              lineHeight: 1,
              textTransform: "uppercase",
              letterSpacing: "-0.02em",
            }}
          >
            {motLabel}
          </span>
          <span
            style={{
              fontSize: 24,
              color: "#aaaaaa",
              lineHeight: 1.4,
              maxWidth: 900,
            }}
          >
            {definition}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontSize: 16,
              color: "#555",
              letterSpacing: "0.05em",
            }}
          >
            Dictionnaire Nouchi — nouchi.ci
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
