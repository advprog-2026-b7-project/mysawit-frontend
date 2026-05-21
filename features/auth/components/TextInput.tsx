"use client";

import React from "react";

interface TextInputProps {
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  id?: string;
}

export default function TextInput({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  id,
}: TextInputProps) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <label
        htmlFor={id}
        style={{
          display: "block",
          fontFamily: "'Lato', sans-serif",
          fontWeight: 700,
          fontSize: "11.2px",
          color: "#525252",
          marginBottom: "6px",
          letterSpacing: "0.01em",
        }}
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="auth-input"
        style={{
          width: "100%",
          border: error ? "0.8px solid #EF4444" : "0.8px solid #D1D5DB",
          borderRadius: "6.4px",
          height: "38.4px",
          padding: "0 12.8px",
          fontFamily: "'Lato', sans-serif",
          fontWeight: 400,
          fontSize: "12.8px",
          color: "#1C1C15",
          boxSizing: "border-box",
          backgroundColor: "white",
          transition: "border-color 0.15s ease",
        }}
        onFocus={(e) => {
          e.target.style.borderColor = error ? "#EF4444" : "#BB7354";
          e.target.style.boxShadow = "0 0 0 2px rgba(187,115,84,0.12)";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = error ? "#EF4444" : "#D1D5DB";
          e.target.style.boxShadow = "none";
        }}
      />
      {error && (
        <span
          style={{
            display: "block",
            fontFamily: "'Lato', sans-serif",
            fontWeight: 400,
            fontSize: "11px",
            color: "#EF4444",
            marginTop: "4px",
          }}
        >
          {error}
        </span>
      )}
    </div>
  );
}
