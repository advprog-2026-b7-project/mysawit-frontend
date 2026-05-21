"use client";

interface PrimaryButtonProps {
  label: string;
  onClick?: () => void;
  loading?: boolean;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

export default function PrimaryButton({
  label,
  onClick,
  loading = false,
  disabled = false,
  type = "button",
}: PrimaryButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      style={{
        width: "100%",
        height: "38.4px",
        backgroundColor: "#BB7354",
        border: "none",
        borderRadius: "6.4px",
        fontFamily: "'Lato', sans-serif",
        fontWeight: 700,
        fontSize: "11.2px",
        color: "white",
        cursor: isDisabled ? "not-allowed" : "pointer",
        opacity: isDisabled ? 0.6 : 1,
        transition: "opacity 0.2s, background-color 0.15s",
        letterSpacing: "0.02em",
      }}
      onMouseEnter={(e) => {
        if (!isDisabled) {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#a5623e";
        }
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#BB7354";
      }}
    >
      {loading ? "Loading..." : label}
    </button>
  );
}
