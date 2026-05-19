import React from "react";

const GOLD_GRAD = "linear-gradient(135deg,#c9a84c,#f0d080,#c9a84c)";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  gold?: boolean;
  onClick?: () => void;
}

export default function GlassCard({ children, className = "", style, gold = false, onClick }: GlassCardProps) {
  const baseStyle: React.CSSProperties = gold ? {
    borderColor: "rgba(201,168,76,0.3)",
    boxShadow: "0 0 20px rgba(201,168,76,0.08), inset 0 0 20px rgba(201,168,76,0.02)",
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
