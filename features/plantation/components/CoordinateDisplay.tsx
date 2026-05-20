"use client";

interface CoordinateDisplayProps {
  coordinates: number[][];
}

export default function CoordinateDisplay({ coordinates }: CoordinateDisplayProps) {
  if (!coordinates || coordinates.length === 0) {
    return (
      <span
        style={{
          fontFamily: "'Courier New', monospace",
          fontSize: 13,
          color: "#53433D",
        }}
      >
        —
      </span>
    );
  }

  const parts = coordinates.map((pair) => `(${pair[0]}, ${pair[1]})`);

  return (
    <span
      style={{
        fontFamily: "'Courier New', monospace",
        fontSize: 13,
        color: "#53433D",
      }}
    >
      {parts.join(" → ")}
    </span>
  );
}
