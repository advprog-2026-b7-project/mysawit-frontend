"use client";

import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  loading?: boolean;
}

export default function Button({
  children,
  variant = "primary",
  loading = false,
  disabled,
  className = "",
  style,
  ...props
}: ButtonProps) {
  const baseClasses =
    "inline-flex items-center justify-center transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";

  const variantStyles: Record<NonNullable<ButtonProps["variant"]>, React.CSSProperties> = {
    primary: {
      background: "#BB7354",
      border: "1px solid #BB7354",
      color: "#FFFFFF",
    },
    secondary: {
      background: "#FFFFFF",
      border: "1px solid #DBC1B9",
      color: "#5B2012",
    },
    danger: {
      background: "transparent",
      border: "none",
      color: "#BA1A1A",
      paddingLeft: 0,
      paddingRight: 0,
    },
  };

  return (
    <button
      className={`${baseClasses} ${className}`}
      style={{
        borderRadius: 9999,
        padding: variant === "danger" ? "8px 0" : "12px 32px",
        fontFamily: "'Lato', sans-serif",
        fontWeight: 700,
        fontSize: 14,
        ...variantStyles[variant],
        ...style,
      }}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? "Loading..." : children}
    </button>
  );
}
