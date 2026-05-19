"use client";

import React from "react";
import Image from "next/image";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "white",
        fontFamily: "'Lato', sans-serif",
      }}
    >
      {/* Left panel */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: "32px 48px",
          minWidth: 0,
          overflowY: "auto",
        }}
      >
        {/* Logo — top-left, outside form area */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            flexShrink: 0,
          }}
        >
          <Image
            src="/logo-design.png"
            alt="nyawitt logo"
            width={48}
            height={48}
            style={{ objectFit: "contain", flexShrink: 0 }}
          />
          <span
            style={{
              fontFamily: "'Lato', sans-serif",
              fontWeight: 700,
              fontSize: "25px",
              color: "#5B2012",
              lineHeight: 1,
            }}
          >
            nyawitt
          </span>
        </div>

        {/* Form area — vertically centered */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            paddingBottom: "32px",
          }}
        >
          <div style={{ width: "100%", maxWidth: "420px" }}>{children}</div>
        </div>
      </div>

      {/* Right hero panel */}
      <div
        style={{
          width: "574px",
          flexShrink: 0,
          backgroundImage: "url('/login-image.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          minHeight: "100vh",
        }}
      />
    </div>
  );
}
