"use client";

import { GoogleLogin, CredentialResponse } from "@react-oauth/google";

interface GoogleButtonProps {
  onSuccess: (credential: string) => void;
  onError?: () => void;
  label?: string;
}

/**
 * Custom-styled Google sign-in button.
 * Renders our design visually; the real GoogleLogin component is
 * overlaid invisibly on top so the click triggers the Google popup
 * and returns the credential (idToken).
 */
export default function GoogleButton({
  onSuccess,
  onError,
  label = "Continue with Google",
}: GoogleButtonProps) {
  const handleSuccess = (response: CredentialResponse) => {
    if (response.credential) {
      onSuccess(response.credential);
    }
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "43.2px" }}>
      {/* Visible styled button — pointer-events disabled so clicks reach the overlay */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "12px",
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow:
            "0px 0px 2.4px rgba(0,0,0,0.084), 0px 1.6px 2.4px rgba(0,0,0,0.168)",
          padding: "0 12px",
          pointerEvents: "none",
        }}
      >
        {/* Google G multicolor SVG */}
        <svg
          width="19.2"
          height="19.2"
          viewBox="0 0 48 48"
          style={{ flexShrink: 0 }}
        >
          <path
            fill="#4285F4"
            d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"
          />
          <path
            fill="#34A853"
            d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"
          />
          <path
            fill="#FBBC05"
            d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z"
          />
          <path
            fill="#EA4335"
            d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"
          />
        </svg>
        <span
          style={{
            fontFamily: "'Lato', sans-serif",
            fontWeight: 400,
            fontSize: "16px",
            color: "rgba(0,0,0,0.54)",
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </span>
      </div>

      {/* Invisible GoogleLogin overlay — captures actual click */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0,
          overflow: "hidden",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={onError}
          width="600"
          size="large"
          type="standard"
          logo_alignment="left"
        />
      </div>
    </div>
  );
}
