"use client";

interface PlantationCodeBadgeProps {
  code: string;
}

export default function PlantationCodeBadge({ code }: PlantationCodeBadgeProps) {
  return (
    <span
      style={{
        background: "#EDE8E4",
        borderRadius: 4,
        padding: "4px 8px",
        fontFamily: "'Courier New', monospace",
        fontSize: 13,
        color: "#5B2012",
        display: "inline-block",
      }}
    >
      {code}
    </span>
  );
}
