import React, { useState, useEffect } from "react";
import { Settings, Key, RefreshCw, Save, Twitter, Music2, Globe, ToggleLeft, ToggleRight, CheckCircle, Eye, EyeOff, Zap } from "lucide-react";
import GlassCard from "../components/GlassCard";
import { api, setAdminKey, type PlatformSettings, type SocialConfig } from "../lib/api";

function Section({ title, icon, desc, children }: { title: string; icon: React.ReactNode; desc: string; children: React.ReactNode }) {
  return (
    <GlassCard className="overflow-hidden">
      <div className="flex items-start gap-3 p-5 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.15)", color: "var(--gold)" }}>
          {icon}
        </div>
        <div>
          <p className="font-bold text-white">{title}</p>
          <p className="text-xs text-white/30 mt-0.5">{desc}</p>
        </div>
      </div>
      <div className="p-5">{children}</div>
    </GlassCard>
  );
}

function Field({ label, value, onChange, type = "text", placeholder = "", hint = "" }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; hint?: string;
}) {
  const [show, setShow] = useState(false);
  const isSecret = type === "password";
  return (
    <div className="py-3 border-b last:border-0" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
      <label className="text-xs mono text-white/40 uppercase tracking-widest block mb-1">{label}</label>
      {hint && <p className="text-xs text-white/25 mb-2">{hint}</p>}
      <div className="flex gap-2">
        <input
          type={isSecret && !show ? "password" : "text"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 text-sm"
        />
        {isSecret && (
          <button onClick={() => setShow(s => !s)} className="p-2.5 rounded-xl glass border" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
            {show ? <EyeOff size={14} className="text-white/40" /> : <Eye size={14} className="text-white/40" />}
          </button>
        )}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Partial<PlatformSettings>>({});
  const [syncConfig, setSyncConfig] = useState<Partial<SocialConfig>>({});
  const [adminKey, setAdminKeyLocal] = useState(localStorage.getItem("persona_admin_key") || "hannah2024!");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState<"x" | "tiktok" | "all" | null>(null);
  const [saved, setSaved] = useState(false);
  const [syncResult, setSyncResult] = useState<{ platform: string; synced: number; errors: string[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    Promise.all([api.settings(), api.syncConfig()])
      .then(([s, c]) => {
        setSettings(s);
        setSyncConfig(c);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const saveAll = async () => {
    setSaving(true);
    try {
      setAdminKey(adminKey);
      await api.updateSettings(settings);
      if (syncConfig.xHandle !== undefined || syncConfig.tiktokHandle !== undefined || syncConfig.enabled !== undefined) {
        await api.updateSyncConfig(syncConfig);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const syncNow = async (platform: "x" | "tiktok" | "all") => {
    setSyncing(platform);
    setSyncResult(null);
    try {
      if (platform === "all") {
        const res = await api.syncAll();
        const x = res.x ?? { synced: 0, errors: [] };
        const tt = res.tiktok ?? { synced: 0, errors: [] };
        setSyncResult({ platform: "All", synced: (x.synced || 0) + (tt.synced || 0), errors: [...(x.errors || []), ...(tt.errors || [])] });
      } else if (platform === "x") {
        const res = await api.syncX(syncConfig.xHandle || "");
        setSyncResult({ platform: "X/Twitter", ...res });
      } else {
        const res = await api.syncTikTok(syncConfig.tiktokHandle || "");
        setSyncResult({ platform: "TikTok", ...res });
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Sync failed");
    } finally {
      setSyncing(null);
    }
  };

  const set = (key: keyof PlatformSettings, val: string) => setSettings(s => ({ ...s, [key]: val }));

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-white/40 text-sm mt-1">Live platform configuration — connected to real API</p>
        </div>
        <button onClick={load} className="p-2 rounded-xl glass" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
          <RefreshCw size={14} className={`${loading ? "animate-spin" : ""} text-white/40`} />
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl text-sm" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}>
          {error} — check admin key below.
        </div>
      )}

      <Section title="Admin Access" icon={<Key size={16} />} desc="Admin key for API authentication">
        <Field label="Admin Password / Key" value={adminKey} onChange={setAdminKeyLocal} type="password"
          placeholder="hannah2024!" hint="Default is hannah2024! — change in Admin Portal → Settings" />
      </Section>

      <Section title="Social Sync" icon={<Globe size={16} />} desc="Configure real-time social media syncing from X/Twitter and TikTok">
        <div className="flex items-center justify-between py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
          <div>
            <div className="text-sm font-semibold text-white">Auto-Sync Enabled</div>
            <div className="text-xs text-white/30 mt-0.5">Automatically pull new posts on a schedule</div>
          </div>
          <button onClick={() => setSyncConfig(s => ({ ...s, enabled: !s.enabled }))}>
            {syncConfig.enabled
              ? <ToggleRight size={28} style={{ color: "var(--gold)" }} />
              : <ToggleLeft size={28} className="text-white/30" />}
          </button>
        </div>

        <div className="py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
          <label className="text-xs mono text-white/40 uppercase tracking-widest block mb-2">Sync Interval (hours)</label>
          <input type="number" min={1} max={24}
            value={syncConfig.intervalHours ?? 6}
            onChange={(e) => setSyncConfig(s => ({ ...s, intervalHours: parseInt(e.target.value, 10) }))}
            className="w-32 text-sm" />
        </div>

        <div className="flex items-center gap-2 pt-3 pb-2">
          <Twitter size={14} style={{ color: "#1DA1F2" }} />
          <span className="text-xs mono text-white/40 uppercase tracking-widest">X / Twitter Handle</span>
        </div>
        <div className="flex gap-2 mb-4">
          <input type="text"
            value={syncConfig.xHandle ?? ""}
            onChange={(e) => setSyncConfig(s => ({ ...s, xHandle: e.target.value }))}
            placeholder="@hannahbrooksxx"
            className="flex-1 text-sm" />
          <button onClick={() => syncNow("x")} disabled={!syncConfig.xHandle || syncing !== null}
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl"
            style={{ background: "rgba(29,161,242,0.15)", color: "#1DA1F2", border: "1px solid rgba(29,161,242,0.3)", opacity: !syncConfig.xHandle || syncing !== null ? 0.5 : 1 }}>
            {syncing === "x" ? <RefreshCw size={12} className="animate-spin" /> : <Zap size={12} />}
            Sync Now
          </button>
        </div>

        <div className="flex items-center gap-2 pb-2">
          <Music2 size={14} style={{ color: "#ff006e" }} />
          <span className="text-xs mono text-white/40 uppercase tracking-widest">TikTok Handle</span>
        </div>
        <div className="flex gap-2">
          <input type="text"
            value={syncConfig.tiktokHandle ?? ""}
            onChange={(e) => setSyncConfig(s => ({ ...s, tiktokHandle: e.target.value }))}
            placeholder="@hannahbrooksxxx"
            className="flex-1 text-sm" />
          <button onClick={() => syncNow("tiktok")} disabled={!syncConfig.tiktokHandle || syncing !== null}
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl"
            style={{ background: "rgba(255,0,110,0.15)", color: "#ff006e", border: "1px solid rgba(255,0,110,0.3)", opacity: !syncConfig.tiktokHandle || syncing !== null ? 0.5 : 1 }}>
            {syncing === "tiktok" ? <RefreshCw size={12} className="animate-spin" /> : <Zap size={12} />}
            Sync Now
          </button>
        </div>

        <div className="flex gap-2 mt-4 pt-4 border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
          <button onClick={() => syncNow("all")} disabled={syncing !== null}
            className="flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-xl text-black"
            style={{ background: "linear-gradient(135deg,var(--gold),var(--gold2))", opacity: syncing !== null ? 0.6 : 1 }}>
            {syncing === "all" ? <RefreshCw size={14} className="animate-spin" /> : <Zap size={14} />}
            Sync All Platforms Now
          </button>
        </div>

        {syncResult && (
          <div className="mt-4 p-3 rounded-xl text-sm" style={{ background: "rgba(0,255,136,0.05)", border: "1px solid rgba(0,255,136,0.15)" }}>
            <span className="font-bold" style={{ color: "#00ff88" }}>{syncResult.platform}:</span>{" "}
            <span className="text-white/70">{syncResult.synced} new posts synced</span>
            {syncResult.errors.length > 0 && (
              <p className="text-xs text-red-400 mt-1">{syncResult.errors.join(", ")}</p>
            )}
          </div>
        )}
      </Section>

      <Section title="Platform Profile" icon={<Settings size={16} />} desc="Creator profile and social links — shown on the fan platform">
        <Field label="Creator Bio" value={String(settings.creatorBio ?? "")} onChange={(v) => set("creatorBio", v)} placeholder="Your bio…" />
        <Field label="Creator Tagline" value={String(settings.creatorTagline ?? "")} onChange={(v) => set("creatorTagline", v)} placeholder="British Creator · Entertainer" />
        <Field label="Instagram URL" value={String(settings.instagramUrl ?? "")} onChange={(v) => set("instagramUrl", v)} placeholder="https://instagram.com/…" />
        <Field label="Twitter / X URL" value={String(settings.twitterUrl ?? "")} onChange={(v) => set("twitterUrl", v)} placeholder="https://x.com/…" />
        <Field label="TikTok URL" value={String(settings.tiktokUrl ?? "")} onChange={(v) => set("tiktokUrl", v)} placeholder="https://tiktok.com/@…" />
        <Field label="OnlyFans URL" value={String(settings.onlyfansUrl ?? "")} onChange={(v) => set("onlyfansUrl", v)} placeholder="https://onlyfans.com/…" />
        <Field label="WhatsApp Number" value={String(settings.whatsappNumber ?? "")} onChange={(v) => set("whatsappNumber", v)} placeholder="447700000000" />
      </Section>

      <Section title="API Keys" icon={<Key size={16} />} desc="Social sync API keys — set via Replit secrets for security">
        <div className="space-y-2 text-xs text-white/40">
          <p>API keys are managed securely via environment secrets and are never shown in full here.</p>
          <p>Set these in the Replit <strong className="text-white/60">Secrets</strong> panel:</p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li><code className="text-white/60">X_BEARER_TOKEN</code> — X/Twitter API v2 Bearer Token</li>
            <li><code className="text-white/60">RAPIDAPI_KEY</code> — RapidAPI key for TikTok scraper</li>
            <li><code className="text-white/60">FLW_PUBLIC_KEY</code> / <code className="text-white/60">FLW_SECRET_KEY</code> — Flutterwave payments</li>
            <li><code className="text-white/60">ADMIN_PASSWORD</code> — Admin portal password</li>
          </ul>
          <div className="mt-3 flex gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg"
              style={{ background: syncConfig.hasXToken ? "rgba(0,255,136,0.08)" : "rgba(255,68,68,0.08)", border: `1px solid ${syncConfig.hasXToken ? "rgba(0,255,136,0.2)" : "rgba(255,68,68,0.2)"}`, color: syncConfig.hasXToken ? "#00ff88" : "#f87171" }}>
              {syncConfig.hasXToken ? <CheckCircle size={10} /> : "✗"} X Token
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg"
              style={{ background: syncConfig.hasRapidApiKey ? "rgba(0,255,136,0.08)" : "rgba(255,68,68,0.08)", border: `1px solid ${syncConfig.hasRapidApiKey ? "rgba(0,255,136,0.2)" : "rgba(255,68,68,0.2)"}`, color: syncConfig.hasRapidApiKey ? "#00ff88" : "#f87171" }}>
              {syncConfig.hasRapidApiKey ? <CheckCircle size={10} /> : "✗"} RapidAPI Key
            </div>
          </div>
        </div>
      </Section>

      <GlassCard className="p-5 flex items-center justify-between" style={{ border: "1px solid rgba(201,168,76,0.15)" } as React.CSSProperties}>
        <div>
          <p className="font-semibold text-white">Save All Settings</p>
          <p className="text-xs text-white/30 mt-0.5">Saves to live platform immediately</p>
        </div>
        <button onClick={saveAll} disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-black"
          style={{ background: saved ? "#00ff88" : "linear-gradient(135deg,var(--gold),var(--gold2))", boxShadow: "0 4px 20px rgba(201,168,76,0.3)", opacity: saving ? 0.7 : 1 }}>
          {saved ? <><CheckCircle size={14} /> Saved!</> : saving ? <><RefreshCw size={14} className="animate-spin" /> Saving…</> : <><Save size={14} /> Save Changes</>}
        </button>
      </GlassCard>
    </div>
  );
}
