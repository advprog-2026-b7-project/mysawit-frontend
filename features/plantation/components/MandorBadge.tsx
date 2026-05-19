"use client";

interface MandorBadgeProps {
  name: string | null | undefined;
}

export default function MandorBadge({ name }: MandorBadgeProps) {
  if (name) {
    return (
      <span
        style={{
          background: "#FFA088",
          borderRadius: 9999,
          padding: "4px 12px",
          fontFamily: "'Lato', sans-serif",
          fontWeight: 700,
          fontSize: 13,
          color: "#793423",
          display: "inline-block",
        }}
      >
        {name}
      </span>
    );
  }

  return (
    <span
      style={{
        background: "rgba(237,232,228,0.5)",
        borderRadius: 9999,
        padding: "4px 12px",
        fontFamily: "'Lato', sans-serif",
        fontWeight: 400,
        fontSize: 13,
        color: "#211A18",
        display: "inline-block",
      }}
    >
      No Mandor
    </span>
  );
}
