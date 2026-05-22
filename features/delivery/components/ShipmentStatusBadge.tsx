"use client";

import type { ShipmentStatus } from "@/features/delivery/deliveryTypes";

const LABEL: Record<ShipmentStatus, string> = {
  MEMUAT: "Memuat",
  MENGIRIM: "Mengirim",
  TIBA_DI_TUJUAN: "Tiba di Tujuan",
  DISETUJUI_MANDOR: "Disetujui Mandor",
  DITOLAK_MANDOR: "Ditolak Mandor",
  DISETUJUI_ADMIN: "Disetujui Admin",
  DITOLAK_ADMIN: "Ditolak Admin",
  DISETUJUI_PARSIAL: "Disetujui Parsial",
};

const STYLE: Record<ShipmentStatus, React.CSSProperties> = {
  MEMUAT: {
    background: "rgba(245,197,100,0.2)",
    color: "#8A4B2F",
    border: "1px solid rgba(138,75,47,0.2)",
  },
  MENGIRIM: {
    background: "rgba(187,115,84,0.15)",
    color: "#854E31",
    border: "1px solid rgba(133,78,49,0.25)",
  },
  TIBA_DI_TUJUAN: {
    background: "rgba(91,32,18,0.12)",
    color: "#5B2012",
    border: "1px solid rgba(91,32,18,0.2)",
  },
  DISETUJUI_MANDOR: {
    background: "rgba(91,32,18,0.1)",
    color: "#5B2012",
    border: "none",
  },
  DITOLAK_MANDOR: {
    background: "rgba(186,26,26,0.08)",
    color: "#BA1A1A",
    border: "1px solid rgba(186,26,26,0.2)",
  },
  DISETUJUI_ADMIN: {
    background: "rgba(91,32,18,0.18)",
    color: "#3D1509",
    border: "none",
  },
  DITOLAK_ADMIN: {
    background: "rgba(186,26,26,0.08)",
    color: "#BA1A1A",
    border: "1px solid rgba(186,26,26,0.2)",
  },
  DISETUJUI_PARSIAL: {
    background: "rgba(245,197,100,0.25)",
    color: "#7A4020",
    border: "1px solid rgba(122,64,32,0.2)",
  },
};

interface Props {
  status: ShipmentStatus;
}

export default function ShipmentStatusBadge({ status }: Props) {
  return (
    <span
      style={{
        display: "inline-block",
        borderRadius: 9999,
        padding: "4px 12px",
        fontFamily: "'Lato', sans-serif",
        fontWeight: 700,
        fontSize: 12,
        whiteSpace: "nowrap",
        ...STYLE[status],
      }}
    >
      {LABEL[status] ?? status}
    </span>
  );
}
