"use client";

interface LoaderProps {
  size?: number;
  color?: string;
}

export default function Loader({ size = 40, color = "#BB7354" }: LoaderProps) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "32px 0",
      }}
    >
      <div
        style={{
          width: size,
          height: size,
          border: `4px solid #e0e0e0`,
          borderTopColor: color,
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
