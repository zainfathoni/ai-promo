import { ImageResponse } from "next/og";
import { promoEntries } from "@/data/promos";

export const runtime = "edge";
export const alt = "AI Promo";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

const titleStyle = {
  fontFamily: "Arial",
  fontSize: 72,
  fontWeight: 600,
  color: "#f8fafc",
  lineHeight: 1.05,
  letterSpacing: -1,
};

const bodyStyle = {
  fontFamily: "Arial",
  fontSize: 30,
  color: "#d1d5f8",
  lineHeight: 1.4,
};

const badgeStyle = {
  fontFamily: "Arial",
  fontSize: 22,
  letterSpacing: 4,
  textTransform: "uppercase" as const,
  color: "#facc15",
};

const shimmerStyle = {
  backgroundImage: "linear-gradient(120deg, #f97316, #facc15)",
  borderRadius: 999,
  color: "#0b1020",
  fontFamily: "Arial",
  fontSize: 22,
  fontWeight: 700,
  padding: "10px 22px",
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
};

const safeEntry = (promoId?: string | null) =>
  promoId ? promoEntries.find((entry) => entry.id === promoId) ?? null : null;

export default async function OpenGraphImage({
  searchParams,
}: {
  searchParams?: { promo?: string };
}) {
  const entry = safeEntry(searchParams?.promo);

  const title = entry?.title ?? "AI Promo";
  const description = entry?.description ?? "Free AI Promos & Deals";
  const category = entry?.category ?? "AI Promo";

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          backgroundColor: "#0b1020",
          fontFamily: "Arial",
          padding: "64px",
          boxSizing: "border-box",
          position: "relative",
          color: "#f8fafc",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle at 85% 15%, rgba(250, 204, 21, 0.35), transparent 55%), radial-gradient(circle at 15% 90%, rgba(249, 115, 22, 0.2), transparent 50%), linear-gradient(135deg, #0b1020, #111827)",
          }}
        />
        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "24px",
            width: "100%",
            background: "rgba(15, 23, 42, 0.75)",
            borderRadius: "36px",
            padding: "48px",
            border: "1px solid rgba(148, 163, 184, 0.2)",
            boxShadow: "0 30px 80px rgba(2,6,23,0.6)",
          }}
        >
          <div style={badgeStyle}>{category}</div>
          <div style={titleStyle}>{title}</div>
          <div style={bodyStyle}>{description}</div>
          <div style={shimmerStyle}>ai-promo.zainf.dev</div>
        </div>
      </div>
    ),
    size
  );
}
