import React, { useState, useEffect } from "react";
import { Twitter, Music2, Instagram, Globe, RefreshCw, Zap, ExternalLink, Image } from "lucide-react";
import GlassCard from "../components/GlassCard";
import { api, type Post, type SocialConfig } from "../lib/api";

const PLATFORM_META: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  x: { label: "X / Twitter", color: "#1DA1F2", icon: <Twitter size={13} /> },
  twitter: { label: "X / Twitter", color: "#1DA1F2", icon: <Twitter size={13} /> },
  tiktok: { label: "TikTok", color: "#ff006e", icon: <Music2 size={13} /> },
  instagram: { label: "Instagram", color: "#e1306c", icon: <Instagram size={13} /> },
  custom: { label: "Custom", color: "rgba(201,168,76,1)", icon: <Globe size={13} /> },
};

function getPlatformMeta(p: string) {
  return PLATFORM_META[p] ?? PLATFORM_META.custom;
}

function timeAgo(iso: string | null) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}

export default function SocialFeed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [config, setConfig] = useState<SocialConfig | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<"x" | "tiktok" | "all" | null>(null);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    Promise.all([api.posts(), api.syncConfig()])
      .then(([p, c]) => { setPosts(p); setConfig(c); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const syncNow = async (platform: "x" | "tiktok" | "all") => {
    setSyncing(platform);
    setSyncResult(null);
    try {
      if (platform === "all") {
        const res = await api.syncAll();
        const x = res.x ?? { synced: 0, errors: [] };
        const tt = res.tiktok ?? { synced: 0, errors: [] };
        const total = (x.synced || 0) + (tt.synced || 0);
        setSyncResult(total > 0 ? `✓ ${total} new posts imported` : "Already up to date");
      } else if (platform === "x") {
        const res = await api.syncX(config?.xHandle || "");
        setSyncResult(res.synced > 0 ? `✓ ${res.synced} new X posts imported` : res.errors.length > 0 ? `Error: ${res.errors[0]}` : "Already up to date");
      } else {
        const res = await api.syncTikTok(config?.tiktokHandle || "");
        setSyncResult(res.synced > 0 ? `✓ ${res.synced} new TikTok posts imported` : res.errors.length > 0 ? `Error: ${res.errors[0]}` : "Already up to date");
      }
      await api.posts().then(setPosts);
    } catch (e: unknown) {
      setSyncResult(`Failed: ${e instanceof Error ? e.message : "Unknown error"}`);
    } finally {
      setSyncing(null);
    }
  };

  const platforms = ["all", ...Array.from(new Set(posts.map(p => p.platform)))];
  const filtered = filter === "all" ? posts : posts.filter(p => p.platform === filter);

  const counts = {
    total: posts.length,
    x: posts.filter(p => p.platform === "x" || p.platform === "twitter").length,
    tiktok: posts.filter(p => p.platform === "tiktok").length,
    instagram: posts.filter(p => p.platform === "instagram").length,
    custom: posts.filter(p => p.platform === "custom").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Social Feed</h1>
          <p className="text-white/40 text-sm mt-1">Real posts synced from X/Twitter, TikTok & Instagram</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={load} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass text-xs font-semibold"
            style={{ border: "1px solid rgba(255,255,255,0.08)", color: "rgba(232,223,200,0.5)" }}>
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
          {config?.xHandle && (
            <button onClick={() => syncNow("x")} disabled={syncing !== null}
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl"
              style={{ background: "rgba(29,161,242,0.12)", color: "#1DA1F2", border: "1px solid rgba(29,161,242,0.25)", opacity: syncing !== null ? 0.6 : 1 }}>
              {syncing === "x" ? <RefreshCw size={11} className="animate-spin" /> : <Twitter size={11} />}
              Sync X
            </button>
          )}
          {config?.tiktokHandle && (
            <button onClick={() => syncNow("tiktok")} disabled={syncing !== null}
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl"
              style={{ background: "rgba(255,0,110,0.12)", color: "#ff006e", border: "1px solid rgba(255,0,110,0.25)", opacity: syncing !== null ? 0.6 : 1 }}>
              {syncing === "tiktok" ? <RefreshCw size={11} className="animate-spin" /> : <Music2 size={11} />}
              Sync TikTok
            </button>
          )}
          <button onClick={() => syncNow("all")} disabled={syncing !== null}
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl text-black"
            style={{ background: "linear-gradient(135deg,var(--gold),var(--gold2))", opacity: syncing !== null ? 0.7 : 1 }}>
            {syncing === "all" ? <RefreshCw size={11} className="animate-spin" /> : <Zap size={11} />}
            Sync All
          </button>
        </div>
      </div>

      {syncResult && (
        <div className="px-4 py-2.5 rounded-xl text-sm font-medium"
          style={{ background: syncResult.startsWith("✓") ? "rgba(0,255,136,0.08)" : "rgba(239,68,68,0.08)", border: `1px solid ${syncResult.startsWith("✓") ? "rgba(0,255,136,0.2)" : "rgba(239,68,68,0.2)"}`, color: syncResult.startsWith("✓") ? "#00ff88" : "#f87171" }}>
          {syncResult}
        </div>
      )}

      {error && (
        <div className="px-4 py-3 rounded-xl text-sm" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}>
          {error} — ensure API keys are configured in Settings.
        </div>
      )}

      {config && (
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
            style={{ background: "rgba(29,161,242,0.06)", border: "1px solid rgba(29,161,242,0.15)" }}>
            <Twitter size={12} style={{ color: "#1DA1F2" }} />
            <span className="text-xs text-white/50">{config.xHandle || "No X handle"}</span>
            <span className={`text-[10px] font-bold mono ${config.hasXToken ? "text-green-400" : "text-red-400"}`}>
              {config.hasXToken ? "● TOKEN OK" : "● NO TOKEN"}
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
            style={{ background: "rgba(255,0,110,0.06)", border: "1px solid rgba(255,0,110,0.15)" }}>
            <Music2 size={12} style={{ color: "#ff006e" }} />
            <span className="text-xs text-white/50">{config.tiktokHandle || "No TikTok handle"}</span>
            <span className={`text-[10px] font-bold mono ${config.hasRapidApiKey ? "text-green-400" : "text-red-400"}`}>
              {config.hasRapidApiKey ? "● KEY OK" : "● NO KEY"}
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
            style={{ background: config.enabled ? "rgba(0,255,136,0.06)" : "rgba(255,255,255,0.03)", border: `1px solid ${config.enabled ? "rgba(0,255,136,0.2)" : "rgba(255,255,255,0.06)"}` }}>
            <span className="text-[10px] font-bold mono" style={{ color: config.enabled ? "#00ff88" : "rgba(232,223,200,0.3)" }}>
              {config.enabled ? `● AUTO-SYNC ON · every ${config.intervalHours}h` : "● AUTO-SYNC OFF"}
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total Posts", value: counts.total, color: "var(--gold)" },
          { label: "X / Twitter", value: counts.x, color: "#1DA1F2" },
          { label: "TikTok", value: counts.tiktok, color: "#ff006e" },
          { label: "Instagram", value: counts.instagram, color: "#e1306c" },
        ].map((s) => (
          <GlassCard key={s.label} className="p-4 text-center">
            <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs text-white/35 mono mt-1">{s.label}</div>
          </GlassCard>
        ))}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {platforms.map((p) => {
          const meta = p === "all" ? null : getPlatformMeta(p);
          const isActive = filter === p;
          return (
            <button key={p} onClick={() => setFilter(p)}
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition-all"
              style={isActive
                ? { background: meta ? `${meta.color}20` : "rgba(201,168,76,0.15)", color: meta ? meta.color : "var(--gold)", border: `1px solid ${meta ? meta.color + "40" : "rgba(201,168,76,0.3)"}` }
                : { background: "rgba(255,255,255,0.04)", color: "rgba(232,223,200,0.4)", border: "1px solid rgba(255,255,255,0.06)" }}>
              {meta && meta.icon}
              {p === "all" ? `All (${counts.total})` : meta?.label ?? p}
            </button>
          );
        })}
      </div>

      {loading ? (
        <GlassCard className="p-10 text-center">
          <RefreshCw size={24} className="mx-auto mb-3 animate-spin text-white/30" />
          <p className="text-white/30 text-sm">Loading posts…</p>
        </GlassCard>
      ) : filtered.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <Image size={36} className="mx-auto mb-3 text-white/20" />
          <p className="text-white/30 text-sm font-medium">No posts yet</p>
          <p className="text-white/20 text-xs mt-1">Click "Sync All" to pull your latest content from social platforms.</p>
          {(!config?.hasXToken || !config?.hasRapidApiKey) && (
            <p className="text-xs mt-3" style={{ color: "#ffaa00" }}>
              ⚠ Add API keys in Settings to enable social sync
            </p>
          )}
        </GlassCard>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((post) => {
            const meta = getPlatformMeta(post.platform);
            return (
              <GlassCard key={post.id} className="overflow-hidden group"
                style={{ border: `1px solid ${meta.color}18` } as React.CSSProperties}>
                {post.imageUrl && (
                  <div className="aspect-square overflow-hidden" style={{ background: "rgba(0,0,0,0.3)" }}>
                    <img
                      src={post.imageUrl}
                      alt={post.content || post.caption || ""}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  </div>
                )}
                {post.videoUrl && !post.imageUrl && (
                  <div className="aspect-video overflow-hidden" style={{ background: "rgba(0,0,0,0.5)" }}>
                    <video src={post.videoUrl} className="w-full h-full object-cover" muted playsInline />
                  </div>
                )}

                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 text-[10px] mono font-bold px-2 py-0.5 rounded-full"
                      style={{ background: `${meta.color}12`, color: meta.color, border: `1px solid ${meta.color}25` }}>
                      {meta.icon} {meta.label}
                    </div>
                    <span className="text-[10px] text-white/25 mono">{timeAgo(post.publishedAt || post.createdAt)}</span>
                  </div>
                  {(post.content || post.caption) && (
                    <p className="text-sm text-white/60 leading-relaxed line-clamp-3">
                      {post.content || post.caption}
                    </p>
                  )}
                  {post.externalId && (
                    <div className="mt-3 pt-3 border-t flex items-center gap-1 text-[10px] text-white/25 mono" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                      <ExternalLink size={9} />
                      {post.externalId.slice(0, 20)}…
                    </div>
                  )}
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
