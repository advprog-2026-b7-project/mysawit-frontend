"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { plantationClient } from "@/features/plantation/api";

interface CoordPair {
  x: string;
  y: string;
}

const COORD_LABELS = ["NW (North-West)", "NE (North-East)", "SW (South-West)", "SE (South-East)"];

const inputStyle: React.CSSProperties = {
  background: "#FFFFFF",
  border: "1px solid #DBC1B9",
  borderRadius: 12,
  height: 50,
  padding: "14px 16px",
  fontFamily: "'Lato', sans-serif",
  fontSize: 14,
  color: "#1B1C1B",
  width: "100%",
  outline: "none",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  fontFamily: "'Lato', sans-serif",
  fontWeight: 700,
  fontSize: 12,
  color: "#52443D",
  textTransform: "uppercase",
  letterSpacing: "0.6px",
  display: "block",
  marginBottom: 6,
};

export default function PlantationCreateForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [area, setArea] = useState("");
  const [coords, setCoords] = useState<CoordPair[]>([
    { x: "", y: "" },
    { x: "", y: "" },
    { x: "", y: "" },
    { x: "", y: "" },
  ]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const updateCoord = (idx: number, axis: "x" | "y", value: string) => {
    setCoords((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [axis]: value };
      return next;
    });
  };

  const clearForm = () => {
    setName("");
    setCode("");
    setArea("");
    setCoords([
      { x: "", y: "" },
      { x: "", y: "" },
      { x: "", y: "" },
      { x: "", y: "" },
    ]);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) { setError("Plantation name is required."); return; }
    if (!code.trim()) { setError("Plantation code is required."); return; }
    const parsedArea = parseFloat(area);
    if (!area || isNaN(parsedArea) || parsedArea <= 0) { setError("Area must be a positive number."); return; }

    const coordinates: number[][] = [];
    for (let i = 0; i < coords.length; i++) {
      const xVal = parseInt(coords[i].x, 10);
      const yVal = parseInt(coords[i].y, 10);
      if (coords[i].x === "" || coords[i].y === "") {
        setError(`${COORD_LABELS[i]} coordinates are required.`);
        return;
      }
      if (isNaN(xVal) || isNaN(yVal)) {
        setError(`${COORD_LABELS[i]} coordinates must be valid numbers.`);
        return;
      }
      coordinates.push([xVal, yVal]);
    }

    setLoading(true);
    try {
      await plantationClient.createPlantation({ name, code, area: parsedArea, coordinates });
      router.push("/admin/plantations");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create plantation.");
    } finally {
      setLoading(false);
    }
  };

  const getFocusStyle = (id: string): React.CSSProperties =>
    focusedInput === id
      ? { borderColor: "#BB7354", boxShadow: "0 0 0 2px rgba(187,115,84,0.2)" }
      : {};

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 700,
            fontSize: 50,
            color: "#8A4B2F",
            margin: 0,
            lineHeight: 1.1,
          }}
        >
          Create Plantation
        </h1>
        <p
          style={{
            fontFamily: "'Lato', sans-serif",
            fontWeight: 400,
            fontSize: 16,
            color: "#52443D",
            marginTop: 8,
            marginBottom: 0,
          }}
        >
          Register a new plantation to the system
        </p>
      </div>

      {/* Error banner */}
      {error && (
        <div
          style={{
            background: "rgba(186,26,26,0.08)",
            border: "1px solid rgba(186,26,26,0.2)",
            borderRadius: 8,
            padding: "12px 16px",
            marginBottom: 20,
            fontFamily: "'Lato', sans-serif",
            fontSize: 14,
            color: "#BA1A1A",
          }}
        >
          {error}
        </div>
      )}

      {/* Form card */}
      <form
        onSubmit={handleSubmit}
        style={{
          background: "#FFFFFF",
          border: "1px solid #DBC1B9",
          boxShadow: "0px 4px 20px rgba(91,32,18,0.06)",
          borderRadius: 12,
          padding: 32,
        }}
      >
        {/* Section 1: Plantation Info */}
        <div style={{ marginBottom: 32 }}>
          <p
            style={{
              fontFamily: "'Lato', sans-serif",
              fontWeight: 700,
              fontSize: 12,
              color: "#52443D",
              textTransform: "uppercase",
              letterSpacing: "0.6px",
              borderBottom: "1px solid rgba(216,194,186,0.3)",
              paddingBottom: 8,
              marginBottom: 24,
              marginTop: 0,
            }}
          >
            Plantation Info
          </p>

          {/* 2-col grid: code + name */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
            <div>
              <label htmlFor="code" style={labelStyle}>
                Plantation Code
              </label>
              <input
                id="code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. PLT-001"
                style={{ ...inputStyle, ...getFocusStyle("code") }}
                onFocus={() => setFocusedInput("code")}
                onBlur={() => setFocusedInput(null)}
              />
            </div>
            <div>
              <label htmlFor="name" style={labelStyle}>
                Plantation Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Kebun Sawit Utara"
                style={{ ...inputStyle, ...getFocusStyle("name") }}
                onFocus={() => setFocusedInput("name")}
                onBlur={() => setFocusedInput(null)}
              />
            </div>
          </div>

          {/* Area */}
          <div>
            <label htmlFor="area" style={labelStyle}>
              Area Size (Hectares)
            </label>
            <div style={{ position: "relative" }}>
              <input
                id="area"
                type="number"
                min="0.01"
                step="0.01"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="e.g. 50.5"
                style={{
                  ...inputStyle,
                  ...getFocusStyle("area"),
                  paddingRight: 50,
                }}
                onFocus={() => setFocusedInput("area")}
                onBlur={() => setFocusedInput(null)}
              />
              <span
                style={{
                  position: "absolute",
                  right: 16,
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontFamily: "'Lato', sans-serif",
                  fontWeight: 700,
                  fontSize: 13,
                  color: "#8A4B2F",
                }}
              >
                Ha
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Boundary Coordinates */}
        <div>
          <p
            style={{
              fontFamily: "'Lato', sans-serif",
              fontWeight: 700,
              fontSize: 12,
              color: "#52443D",
              textTransform: "uppercase",
              letterSpacing: "0.6px",
              borderBottom: "1px solid rgba(216,194,186,0.3)",
              paddingBottom: 8,
              marginBottom: 24,
              marginTop: 0,
            }}
          >
            Boundary Coordinates
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {COORD_LABELS.map((label, idx) => (
              <div
                key={label}
                style={{
                  background: "rgba(237,228,228,0.5)",
                  border: "1px solid rgba(219,193,185,0.4)",
                  borderRadius: 10,
                  padding: 16,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "#8A4B2F",
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: "'Lato', sans-serif",
                      fontWeight: 700,
                      fontSize: 12,
                      color: "#5B2012",
                    }}
                  >
                    {label}
                  </span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <label
                      htmlFor={`coord-${idx}-x`}
                      style={{
                        fontFamily: "'Lato', sans-serif",
                        fontWeight: 700,
                        fontSize: 10,
                        color: "#86736C",
                        textTransform: "uppercase",
                        display: "block",
                        marginBottom: 4,
                      }}
                    >
                      X Axis
                    </label>
                    <input
                      id={`coord-${idx}-x`}
                      type="number"
                      value={coords[idx].x}
                      onChange={(e) => updateCoord(idx, "x", e.target.value)}
                      placeholder="0"
                      style={{
                        background: "#FFFFFF",
                        border: "1px solid #DBC1B9",
                        borderRadius: 8,
                        padding: "4px 8px",
                        height: 30,
                        fontFamily: "'Lato', sans-serif",
                        fontSize: 13,
                        color: "#1B1C1B",
                        width: "100%",
                        outline: "none",
                        boxSizing: "border-box",
                        ...(focusedInput === `coord-${idx}-x`
                          ? { borderColor: "#BB7354", boxShadow: "0 0 0 2px rgba(187,115,84,0.2)" }
                          : {}),
                      }}
                      onFocus={() => setFocusedInput(`coord-${idx}-x`)}
                      onBlur={() => setFocusedInput(null)}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`coord-${idx}-y`}
                      style={{
                        fontFamily: "'Lato', sans-serif",
                        fontWeight: 700,
                        fontSize: 10,
                        color: "#86736C",
                        textTransform: "uppercase",
                        display: "block",
                        marginBottom: 4,
                      }}
                    >
                      Y Axis
                    </label>
                    <input
                      id={`coord-${idx}-y`}
                      type="number"
                      value={coords[idx].y}
                      onChange={(e) => updateCoord(idx, "y", e.target.value)}
                      placeholder="0"
                      style={{
                        background: "#FFFFFF",
                        border: "1px solid #DBC1B9",
                        borderRadius: 8,
                        padding: "4px 8px",
                        height: 30,
                        fontFamily: "'Lato', sans-serif",
                        fontSize: 13,
                        color: "#1B1C1B",
                        width: "100%",
                        outline: "none",
                        boxSizing: "border-box",
                        ...(focusedInput === `coord-${idx}-y`
                          ? { borderColor: "#BB7354", boxShadow: "0 0 0 2px rgba(187,115,84,0.2)" }
                          : {}),
                      }}
                      onFocus={() => setFocusedInput(`coord-${idx}-y`)}
                      onBlur={() => setFocusedInput(null)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 32 }}>
          <button
            type="button"
            onClick={clearForm}
            style={{
              border: "1px solid #DBC1B9",
              borderRadius: 9999,
              padding: "12px 32px",
              fontFamily: "'Lato', sans-serif",
              fontWeight: 700,
              fontSize: 14,
              color: "#5B2012",
              background: "#FFFFFF",
              cursor: "pointer",
            }}
          >
            Clear Form
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading ? "#C8956D" : "#BB7354",
              borderRadius: 9999,
              padding: "12px 40px",
              fontFamily: "'Lato', sans-serif",
              fontWeight: 700,
              fontSize: 14,
              color: "#FFFFFF",
              cursor: loading ? "not-allowed" : "pointer",
              border: "none",
            }}
          >
            {loading ? "Registering..." : "Register Plantation"}
          </button>
        </div>
      </form>
    </div>
  );
}
