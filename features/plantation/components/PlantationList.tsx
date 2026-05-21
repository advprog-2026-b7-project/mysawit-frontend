"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { plantationClient } from "@/features/plantation/api";
import type { PlantationListItem } from "@/features/plantation/types";
import PlantationCodeBadge from "./PlantationCodeBadge";
import MandorBadge from "./MandorBadge";

export default function PlantationList() {
  const router = useRouter();
  const [plantations, setPlantations] = useState<PlantationListItem[]>([]);
  const [nameFilter, setNameFilter] = useState("");
  const [codeFilter, setCodeFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchPlantations = useCallback(async (name: string, code: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await plantationClient.getAll({ name: name || undefined, code: code || undefined });
      setPlantations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load plantations.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchPlantations("", "");
  }, [fetchPlantations]);

  const handleNameChange = (val: string) => {
    setNameFilter(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void fetchPlantations(val, codeFilter);
    }, 300);
  };

  const handleCodeChange = (val: string) => {
    setCodeFilter(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void fetchPlantations(nameFilter, val);
    }, 300);
  };

  const handleReset = () => {
    setNameFilter("");
    setCodeFilter("");
    void fetchPlantations("", "");
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
        <div>
          <h1
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 700,
              fontSize: 50,
              color: "#5B2012",
              margin: 0,
              lineHeight: 1.1,
            }}
          >
            Plantations
          </h1>
          <p
            style={{
              fontFamily: "'Lato', sans-serif",
              fontWeight: 400,
              fontSize: 16,
              color: "#52443D",
              margin: "8px 0 0",
            }}
          >
            Manage all registered plantations
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push("/admin/plantations/create")}
          style={{
            background: "#BB7354",
            borderRadius: 9999,
            padding: "10px 24px",
            fontFamily: "'Lato', sans-serif",
            fontWeight: 700,
            fontSize: 14,
            color: "#FFFFFF",
            border: "none",
            cursor: "pointer",
          }}
        >
          + New Plantation
        </button>
      </div>

      {/* Filter bar */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, alignItems: "center" }}>
        <div style={{ position: "relative", width: 300 }}>
          <svg
            style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#8A4B2F" }}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={nameFilter}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Search by name..."
            style={{
              width: "100%",
              height: 46,
              background: "#FFFFFF",
              border: "1px solid rgba(91,32,18,0.1)",
              borderRadius: 10,
              padding: "0 16px 0 38px",
              fontFamily: "'Lato', sans-serif",
              fontSize: 14,
              color: "#1B1C1B",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ position: "relative", width: 200 }}>
          <svg
            style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#8A4B2F" }}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={codeFilter}
            onChange={(e) => handleCodeChange(e.target.value)}
            placeholder="Search by code..."
            style={{
              width: "100%",
              height: 46,
              background: "#FFFFFF",
              border: "1px solid rgba(91,32,18,0.1)",
              borderRadius: 10,
              padding: "0 16px 0 38px",
              fontFamily: "'Lato', sans-serif",
              fontSize: 14,
              color: "#1B1C1B",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        <button
          type="button"
          onClick={handleReset}
          style={{
            background: "#FFFFFF",
            border: "1px solid #DBC1B9",
            borderRadius: 8,
            padding: "8px 16px",
            fontFamily: "'Lato', sans-serif",
            fontSize: 14,
            color: "#52443D",
            cursor: "pointer",
          }}
        >
          Reset
        </button>
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            background: "rgba(186,26,26,0.08)",
            border: "1px solid rgba(186,26,26,0.2)",
            borderRadius: 8,
            padding: "12px 16px",
            marginBottom: 16,
            fontFamily: "'Lato', sans-serif",
            fontSize: 14,
            color: "#BA1A1A",
          }}
        >
          {error}
        </div>
      )}

      {/* Table */}
      <div
        style={{
          background: "#FFFFFF",
          border: "1px solid #DBC1B9",
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0px 4px 20px rgba(91,32,18,0.06)",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#F6F3F1" }}>
              {["Name", "Code", "Area (Ha)", "Mandor", "Actions"].map((col) => (
                <th
                  key={col}
                  style={{
                    padding: "14px 20px",
                    fontFamily: "'Lato', sans-serif",
                    fontWeight: 700,
                    fontSize: 14,
                    color: "#52443D",
                    textTransform: "uppercase",
                    letterSpacing: "0.7px",
                    textAlign: col === "Actions" ? "right" : "left",
                  }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={5}
                  style={{ padding: 40, textAlign: "center", color: "#52443D", fontFamily: "'Lato', sans-serif" }}
                >
                  Loading...
                </td>
              </tr>
            ) : plantations.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  style={{ padding: 40, textAlign: "center", color: "#52443D", fontFamily: "'Lato', sans-serif" }}
                >
                  No plantations found.
                </td>
              </tr>
            ) : (
              plantations.map((p) => (
                <tr key={p.id} style={{ borderTop: "1px solid #DBC1B9" }}>
                  <td style={{ padding: "16px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          background: "#EDE8E4",
                          border: "1px solid #DBC1B9",
                          borderRadius: 8,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontFamily: "'Lato', sans-serif",
                          fontWeight: 700,
                          fontSize: 14,
                          color: "#5B2012",
                          flexShrink: 0,
                        }}
                      >
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                      <span
                        style={{
                          fontFamily: "'Lato', sans-serif",
                          fontWeight: 700,
                          fontSize: 16,
                          color: "#5B2012",
                        }}
                      >
                        {p.name}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: "16px 20px" }}>
                    <PlantationCodeBadge code={p.code} />
                  </td>
                  <td style={{ padding: "16px 20px" }}>
                    <span style={{ fontFamily: "'Lato', sans-serif", fontWeight: 400, fontSize: 16, color: "#53433D" }}>
                      {p.area} ha
                    </span>
                  </td>
                  <td style={{ padding: "16px 20px" }}>
                    <MandorBadge name={p.mandorName ?? null} />
                  </td>
                  <td style={{ padding: "16px 20px", textAlign: "right" }}>
                    <button
                      type="button"
                      onClick={() => router.push(`/admin/plantations/${p.id}`)}
                      style={{
                        fontFamily: "'Lato', sans-serif",
                        fontWeight: 700,
                        fontSize: 14,
                        color: "#854E31",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      Detail →
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
