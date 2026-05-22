"use client";

import type { HarvestStatus } from "@/features/harvest/historyTypes";

interface HarvestStatusBadgeProps {
  status: HarvestStatus;
}

const badgeStyles: Record<HarvestStatus, React.CSSProperties> = {
  PENDING: {
    background: "rgba(245,197,100,0.2)",
    color: "#8A4B2F",
    border: "1px solid rgba(138,75,47,0.2)",
  },
  APPROVED: {
    background: "rgba(91,32,18,0.1)",
    color: "#5B2012",
    border: "none",
  },
  REJECTED: {
    background: "rgba(186,26,26,0.08)",
    color: "#BA1A1A",
    border: "1px solid rgba(186,26,26,0.2)",
  },
};

export default function HarvestStatusBadge({ status }: HarvestStatusBadgeProps) {
  return (
    <span
      style={{
        display: "inline-block",
        borderRadius: 9999,
        padding: "4px 12px",
        fontFamily: "'Lato', sans-serif",
        fontWeight: 700,
        fontSize: 12,
        ...badgeStyles[status],
      }}
    >
      {status}
    </span>
  );
}
