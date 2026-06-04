import React from "react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6 overflow-hidden relative">
      {/* Subtle background glow effects matching the site's style */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
      >
        <div
          style={{
            position: "absolute",
            top: "20%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "600px",
            height: "600px",
            background:
              "radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "10%",
            right: "10%",
            width: "300px",
            height: "300px",
            background:
              "radial-gradient(circle, rgba(109, 40, 217, 0.06) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />
      </div>

      <div className="relative z-10 text-center max-w-2xl mx-auto">
        {/* Logo mark */}
        <div className="flex items-center justify-center gap-3 mb-12">
          <div
            style={{
              background: "linear-gradient(135deg, #7c3aed, #a855f7)",
              borderRadius: "10px",
              padding: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
          <span
            style={{
              fontSize: "18px",
              fontWeight: "600",
              color: "white",
              letterSpacing: "-0.01em",
            }}
          >
            EduBoard
          </span>
        </div>

        {/* 404 large display */}
        <div
          style={{
            fontSize: "clamp(80px, 18vw, 160px)",
            fontWeight: "800",
            letterSpacing: "-0.06em",
            lineHeight: "1",
            marginBottom: "0",
            background: "linear-gradient(135deg, #ffffff 30%, #a78bfa 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            userSelect: "none",
          }}
        >
          404
        </div>

        {/* Divider line with glow */}
        <div
          style={{
            height: "1px",
            background:
              "linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.5), transparent)",
            margin: "24px auto",
            maxWidth: "320px",
          }}
        />

        {/* Heading */}
        <h1
          style={{
            fontSize: "clamp(20px, 3vw, 28px)",
            fontWeight: "600",
            color: "white",
            marginBottom: "16px",
            letterSpacing: "-0.02em",
          }}
        >
          This page doesn&apos;t exist
        </h1>

        {/* Description */}
        <p
          style={{
            fontSize: "16px",
            color: "rgba(148, 163, 184, 0.9)",
            lineHeight: "1.7",
            marginBottom: "12px",
            maxWidth: "460px",
            margin: "0 auto 12px",
          }}
        >
          The URL you entered couldn&apos;t be found. It may have been removed,
          renamed, or never existed in the first place.
        </p>
        <p
          style={{
            fontSize: "14px",
            color: "rgba(100, 116, 139, 0.8)",
            marginBottom: "40px",
          }}
        >
          Double-check the URL, or head back to safety below.
        </p>

        {/* CTA Button */}
        <button
          onClick={() => navigate("/")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
            color: "white",
            border: "none",
            borderRadius: "10px",
            padding: "14px 32px",
            fontSize: "15px",
            fontWeight: "600",
            cursor: "pointer",
            letterSpacing: "-0.01em",
            transition: "all 0.2s ease",
            boxShadow: "0 0 24px rgba(124, 58, 237, 0.3)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow =
              "0 0 36px rgba(124, 58, 237, 0.45)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow =
              "0 0 24px rgba(124, 58, 237, 0.3)";
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Go back to Home
        </button>

        {/* Footer hint */}
        <p
          style={{
            marginTop: "48px",
            fontSize: "13px",
            color: "rgba(71, 85, 105, 0.8)",
          }}
        >
          Error 404 &mdash; Page not found
        </p>
      </div>
    </div>
  );
};

export default NotFound;