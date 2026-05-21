"use client";

import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({ label, error, id, style, ...props }: InputProps) {
  return (
    <div className="mb-4">
      {label && (
        <label
          htmlFor={id}
          className="mb-2 block"
          style={{
            fontFamily: "'Lato', sans-serif",
            fontWeight: 700,
            fontSize: 12,
            color: "#52443D",
            letterSpacing: 0.6,
            textTransform: "uppercase",
          }}
        >
          {label}
        </label>
      )}
      <input
        id={id}
        className="w-full focus:outline-none"
        style={{
          height: 50,
          background: "#FFFFFF",
          border: `1px solid ${error ? "#BA1A1A" : "#DBC1B9"}`,
          borderRadius: 12,
          padding: "14px 16px",
          fontFamily: "'Lato', sans-serif",
          fontWeight: 400,
          fontSize: 16,
          color: "#1B1C1B",
          ...style,
        }}
        {...props}
      />
      {error && <p className="mt-1 text-sm" style={{ color: "#BA1A1A" }}>{error}</p>}
    </div>
  );
}
