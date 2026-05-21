import React, { useState } from "react";

const GOLD = "#c9a84c";
const GOLD_GRAD = "linear-gradient(135deg,#c9a84c,#f0d080,#c9a84c)";

function getAppUrls() {
  const { protocol, hostname } = window.location;
  const base = `${protocol}//${hostname}`;
  return {
    fan:     base + "/",
    profile: base + "/profile",
    admin:   base + "/admin",
    studio:  base + "/studio",
  };
}

const APPS = [
  {
    key: "fan",
    label: "Fan Platform",
    sub: "Home · Feed · Chat · Boutique",
    icon: "🌐",
    color: "#38bdf8",
    external: false,
  },
  {
    key: "profile",
    label: "Hannah's Profile",
    sub: "Public profile · Posts · VIP",
    icon: "👑",
    color: GOLD,
    external: false,
  },
  {
    key: "admin",
    label: "Creator Admin",
    sub: "Private portal · password protected",
    icon: "🔐",
    color: "#f59e0b",
    external: false,
  },
  {
    key: "studio",
    label: "AI Persona Studio",
    sub: "Embedded · AI Chat · Training",
    icon: "🤖",
    color: "#c084fc",
    external: false,
  },
] as const;

export default function AppSwitcher() {
  const [open, setOpen] = useState(false);
  const urls = getAppUrls();

  const currentPath = window.location.pathname;

  function isHere(key: string) {
    if (key === "fan") return currentPath === "/" || (!currentPath.startsWith("/admin") && !currentPath.startsWith("/profile") && !currentPath.startsWith("/studio") && !currentPath.startsWith("/messages") && !currentPath.startsWith("/feed") && !currentPath.startsWith("/calls") && !currentPath.startsWith("/store") && !currentPath.startsWith("/members"));
    return currentPath.startsWith(`/${key}`);
  }

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col items-end gap-2">
      {open && (
        <div
          className="rounded-2xl shadow-2xl overflow-hidden"
          style={{
            width: 260,
            background: "rgba(8,7,5,0.98)",
            border: "1px solid rgba(201,168,76,0.22)",
            backdropFilter: "blur(24px)",
          }}
        >
          {/* header */}
          <div className="px-4 pt-3.5 pb-2.5 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <p className="text-white font-bold text-sm">Sophie Rain</p>
            <p className="text-white/25 text-[11px]">Switch experience · all on port 5000</p>
          </div>

          {/* app list */}
          <div className="p-2 space-y-1">
            {APPS.map((app) => {
              const url  = urls[app.key as keyof typeof urls];
              const here = isHere(app.key);

              return (
                <a
                  key={app.key}
                  href={url}
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
                </a>
              );
            })}
          </div>

          {/* connection hint */}
          <div className="mx-2 mb-2 px-3 py-1.5 rounded-xl text-center" style={{ background: "rgba(201,168,76,0.04)", border: "1px solid rgba(201,168,76,0.1)" }}>
            <p className="text-[10px] text-white/25">
              All 4 experiences accessible from{" "}
              <span className="font-bold" style={{ color: "rgba(201,168,76,0.5)" }}>port 5000</span>
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
