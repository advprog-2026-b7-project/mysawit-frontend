"use client";

export default function OrDivider() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        margin: "16px 0",
      }}
    >
      <div
        style={{
          flex: 1,
          height: "0.8px",
          backgroundColor: "rgba(0,0,0,0.3)",
        }}
      />
      <span
        style={{
          fontFamily: "'Lato', sans-serif",
          fontWeight: 700,
          fontSize: "11.2px",
          color: "#525252",
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}
      >
        or
      </span>
      <div
        style={{
          flex: 1,
          height: "0.8px",
          backgroundColor: "rgba(0,0,0,0.3)",
        }}
      />
    </div>
  );
}
