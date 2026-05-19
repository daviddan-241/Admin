import React, { useState } from "react";

const GOLD = "#c9a84c";
const GOLD_GRAD = "linear-gradient(135deg,#c9a84c,#f0d080,#c9a84c)";

function getAppUrls() {
  const { protocol, hostname, port } = window.location;
  const currentPort = port || "5000";

  // Replit dev domain: format is  WORKSPACE-PORT.CLUSTER.replit.dev
  if (hostname.includes(".replit.dev")) {
    const studioHost = hostname.replace(`-${currentPort}.`, "-3000.");
    return {
      fan:     `${protocol}//${hostname}`,
      admin:   `${protocol}//${hostname}/admin`,
      persona: `${protocol}//${studioHost}`,
    };
  }

  // repl.co legacy domain (port 5000 is the default, no port in URL)
  if (hostname.endsWith(".repl.co")) {
    return {
      fan:     `${protocol}//${hostname}`,
      admin:   `${protocol}//${hostname}/admin`,
      persona: `${protocol}//${hostname}:3000`,
    };
  }

  // Local development
  const base = `${protocol}//${hostname}`;
  return {
    fan:     `${base}:5000`,
    admin:   `${base}:5000/admin`,
    persona: `${base}:3000`,
  };
}

const APPS = [
  {
    key: "fan",
    label: "Fan Platform",
    sub: "Public site · Hannah Brooks",
    icon: "🌐",
    color: "#38bdf8",
    external: false,
  },
  {
    key: "admin",
    label: "Creator Admin",
    sub: "Private portal · same tab",
    icon: "🔐",
    color: GOLD,
    external: false,
  },
  {
    key: "persona",
    label: "AI Persona Studio",
    sub: "AI Chat, Personas, Training",
    icon: "🤖",
    color: "#c084fc",
    external: true,
  },
] as const;

export default function AppSwitcher() {
  const [open, setOpen] = useState(false);
  const urls = getAppUrls();

  const isFan   = !window.location.pathname.startsWith("/admin");
  const isAdmin =  window.location.pathname.startsWith("/admin");

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col items-end gap-2">
      {open && (
        <div
          className="rounded-2xl shadow-2xl overflow-hidden"
          style={{
            width: 252,
            background: "rgba(8,7,5,0.98)",
            border: "1px solid rgba(201,168,76,0.22)",
            backdropFilter: "blur(24px)",
          }}
        >
          {/* header */}
          <div className="px-4 pt-3.5 pb-2.5 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <p className="text-white font-bold text-sm">Hannah Brooks</p>
            <p className="text-white/25 text-[11px]">Switch experience</p>
          </div>

          {/* app list */}
          <div className="p-2 space-y-1">
            {APPS.map((app) => {
              const url  = urls[app.key as keyof typeof urls];
              const here = (app.key === "fan" && isFan) || (app.key === "admin" && isAdmin);

              return (
                <a
                  key={app.key}
                  href={url}
                  target={app.external ? "_blank" : "_self"}
                  rel="noreferrer"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all hover:bg-white/[0.04] no-underline"
                  style={{
                    border: here ? `1px solid ${app.color}35` : "1px solid transparent",
                    background: here ? `${app.color}0a` : "transparent",
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0"
                    style={{ background: `${app.color}15`, border: `1px solid ${app.color}28` }}
                  >
                    {app.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-white leading-tight">{app.label}</div>
                    <div className="text-[10px] text-white/30 mt-0.5 leading-tight truncate">{app.sub}</div>
                  </div>
                  {here && (
                    <span
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
                      style={{ background: `${app.color}20`, color: app.color }}
                    >
                      HERE
                    </span>
                  )}
                  {app.external && !here && (
                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" className="shrink-0 opacity-30">
                      <path d="M2 10L10 2M10 2H5M10 2V7" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  )}
                </a>
              );
            })}
          </div>

          {/* port hint */}
          <div className="mx-2 mb-2 px-3 py-1.5 rounded-xl text-center" style={{ background: "rgba(192,132,252,0.06)", border: "1px solid rgba(192,132,252,0.1)" }}>
            <p className="text-[10px] text-white/25">
              AI Studio also accessible via{" "}
              <span className="font-bold" style={{ color: "rgba(192,132,252,0.55)" }}>port 3000</span>
              {" "}in the preview pane
            </p>
          </div>
        </div>
      )}

      {/* toggle button */}
      <button
        onClick={() => setOpen((o) => !o)}
        title={open ? "Close" : "Switch App"}
        className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 select-none"
        style={{
          background: open ? "rgba(20,16,6,0.97)" : GOLD_GRAD,
          border: "1px solid rgba(201,168,76,0.35)",
          boxShadow: open ? "0 2px 12px rgba(0,0,0,0.4)" : "0 4px 24px rgba(201,168,76,0.38)",
          fontSize: 20,
          color: open ? GOLD : "#000",
        }}
      >
        {open ? "✕" : "⊞"}
      </button>
    </div>
  );
}
