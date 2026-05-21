import React, { useState, useEffect } from "react";
import { Cookie, X, ChevronDown, ChevronUp, ShieldCheck } from "lucide-react";

const COOKIE_KEY = "sophie_rain_cookies_accepted";

type Prefs = { necessary: boolean; analytics: boolean; marketing: boolean };

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [prefs, setPrefs] = useState<Prefs>({ necessary: true, analytics: true, marketing: true });

  useEffect(() => {
    const stored = localStorage.getItem(COOKIE_KEY);
    if (!stored) {
      const t = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  function accept(all: boolean) {
    const saved: Prefs = all
      ? { necessary: true, analytics: true, marketing: true }
      : { ...prefs, necessary: true };
    localStorage.setItem(COOKIE_KEY, JSON.stringify(saved));
    setVisible(false);
  }

  function decline() {
    localStorage.setItem(COOKIE_KEY, JSON.stringify({ necessary: true, analytics: false, marketing: false }));
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[999] p-4 md:p-6">
      <div
        className="max-w-4xl mx-auto rounded-2xl border border-amber-400/20 shadow-2xl overflow-hidden"
        style={{ background: "linear-gradient(135deg,#0e0e0e 0%,#1a1508 100%)", backdropFilter: "blur(24px)" }}
      >
        {/* Top row */}
        <div className="flex items-start gap-4 p-5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
            style={{ background: "linear-gradient(135deg,#c9a84c,#f0d080)" }}>
            <Cookie className="w-5 h-5 text-black" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-bold text-white text-sm">We use cookies 🍪</p>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-black"
                style={{ background: "linear-gradient(90deg,#c9a84c,#f0d080)" }}>GDPR</span>
            </div>
            <p className="text-xs text-white/50 leading-relaxed">
              Hannah Brooks uses cookies to improve your experience, personalise content, and analyse traffic.
              You can choose which cookies you allow below.
            </p>
          </div>

          <button onClick={decline}
            className="text-white/30 hover:text-white/60 transition-colors shrink-0 mt-0.5">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Expandable preferences */}
        {expanded && (
          <div className="px-5 pb-4 space-y-3 border-t border-white/5 pt-4">
            {([
              { key: "necessary", label: "Necessary", desc: "Session, security, login — always on.", locked: true },
              { key: "analytics", label: "Analytics", desc: "Anonymous page views and usage stats.", locked: false },
              { key: "marketing", label: "Marketing", desc: "Personalised content and promotions.", locked: false },
            ] as { key: keyof Prefs; label: string; desc: string; locked: boolean }[]).map(({ key, label, desc, locked }) => (
              <label key={key} className="flex items-center justify-between gap-4 cursor-pointer group">
                <div>
                  <p className="text-xs font-semibold text-white/80 flex items-center gap-1.5">
                    {label}
                    {locked && <ShieldCheck className="w-3 h-3 text-amber-400" />}
                  </p>
                  <p className="text-[11px] text-white/35">{desc}</p>
                </div>
                <button
                  type="button"
                  disabled={locked}
                  onClick={() => !locked && setPrefs(p => ({ ...p, [key]: !p[key] }))}
                  className={`relative w-10 h-5 rounded-full transition-all shrink-0 ${
                    prefs[key] ? "bg-amber-500" : "bg-white/10"
                  } ${locked ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${prefs[key] ? "translate-x-5" : "translate-x-0"}`} />
                </button>
              </label>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-2 px-5 pb-5 pt-2">
          <button
            onClick={() => accept(true)}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-sm text-black transition-all hover:opacity-90 active:scale-95"
            style={{ background: "linear-gradient(90deg,#c9a84c,#f0d080)" }}
          >
            Accept All
          </button>
          <button
            onClick={() => accept(false)}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-sm text-white/70 border border-white/10 bg-white/5 hover:bg-white/10 transition-all active:scale-95"
          >
            Save Preferences
          </button>
          <button
            onClick={decline}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-sm text-white/40 hover:text-white/60 transition-colors"
          >
            Decline Optional
          </button>
          <button
            onClick={() => setExpanded(e => !e)}
            className="ml-auto flex items-center gap-1 text-xs text-white/30 hover:text-white/60 transition-colors whitespace-nowrap"
          >
            {expanded ? <><ChevronUp className="w-3 h-3" /> Less</> : <><ChevronDown className="w-3 h-3" /> Customize</>}
          </button>
        </div>

        {/* Footer links */}
        <div className="border-t border-white/5 px-5 py-2.5 flex items-center gap-4">
          <a href="/privacy" className="text-[11px] text-white/25 hover:text-white/50 transition-colors">Privacy Policy</a>
          <a href="/terms" className="text-[11px] text-white/25 hover:text-white/50 transition-colors">Terms of Use</a>
          <span className="text-[11px] text-white/15">· Hannah Brooks © {new Date().getFullYear()}</span>
        </div>
      </div>
    </div>
  );
}
