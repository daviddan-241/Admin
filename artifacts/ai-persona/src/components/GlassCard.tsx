import React from "react";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  neon?: boolean;
  onClick?: () => void;
}

export default function GlassCard({ children, className = "", style, neon = false, onClick }: GlassCardProps) {
  const baseStyle: React.CSSProperties = neon ? {
    borderColor: "rgba(0,245,255,0.25)",
    boxShadow: "0 0 20px rgba(0,245,255,0.08), inset 0 0 20px rgba(0,245,255,0.02)",
    ...style,
  } : style ?? {};

  return (
    <div
      onClick={onClick}
      className={`glass rounded-2xl ${onClick ? "cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-transform" : ""} ${className}`}
      style={baseStyle}
    >
      {children}
    </div>
  );
}
