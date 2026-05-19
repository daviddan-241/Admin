import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  MessageSquare, Phone, Sparkles, Gift, ImagePlus, LayoutDashboard,
  Send, CheckCircle, Trash2, Bell, BellOff,
  LogOut, DollarSign, Star, RefreshCw, Instagram,
  Twitter, Music2, Globe, Zap, Github, Settings, Clock,
  Play, ToggleLeft, ToggleRight, AlertCircle, ExternalLink,
  Crown, Lock, Save, Key, CreditCard, User, Link2, Palette,
  Eye, EyeOff, ChevronRight
} from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const API = `${BASE}/api`;
const logoHB = `${import.meta.env.BASE_URL}logo-hb.png`;

type Tab = "dashboard" | "messages" | "calls" | "requests" | "tips" | "feed" | "social" | "github" | "settings";

type Message = { id: number; fanName: string; fanEmail: string; message: string; amountPaid: number; status: string; reply: string | null; createdAt: string; txRef: string; };
type Call = { id: number; fanName: string; fanEmail: string; preferredDate: string; durationMinutes: number; amountPaid: number; status: string; notes: string | null; createdAt: string; };
type ContentRequest = { id: number; fanName: string; fanEmail: string; requestType: string; description: string; amountPaid: number; status: string; createdAt: string; };
type Tip = { id: number; fanName: string; fanEmail: string; amount: number; message: string | null; createdAt: string; };
type Post = { id: number; imageUrl: string; caption: string | null; platform: string; isPrivate: boolean; watermark: boolean; createdAt: string; };
type Stats = { totalMessages: number; totalCalls: number; totalRequests: number; totalTips: number; totalRevenue: number; };
type Activity = { type: "message" | "call" | "request" | "tip"; fanName: string; amount: number; detail: string; timestamp: string; };
type SocialConfig = { enabled: boolean; intervalHours: number; xHandle: string; tiktokHandle: string; hasXToken: boolean; hasRapidApiKey: boolean; };
type PlatformSettings = Record<string, string | number | boolean>;

function statusBadge(status: string) {
  const map: Record<string, string> = {
    paid: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    free: "bg-gray-500/20 text-gray-300 border-gray-500/30",
    replied: "bg-green-500/20 text-green-300 border-green-500/30",
    pending: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    confirmed: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    completed: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    handled: "bg-teal-500/20 text-teal-300 border-teal-500/30",
  };
  return `inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-medium ${map[status] ?? "bg-white/10 text-white/60 border-white/20"}`;
}

function platformIcon(p: string) {
  const cls = "w-4 h-4";
  if (p === "instagram") return <Instagram className={cls} />;
  if (p === "twitter") return <Twitter className={cls} />;
  if (p === "tiktok") return <Music2 className={cls} />;
  return <Globe className={cls} />;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function FieldRow({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 items-start py-4 border-b border-white/5 last:border-0">
      <div>
        <p className="text-sm font-semibold text-white/80">{label}</p>
        {hint && <p className="text-xs text-white/30 mt-0.5">{hint}</p>}
      </div>
      <div className="md:col-span-2">{children}</div>
    </div>
  );
}

export default function Admin() {
  const { toast } = useToast();
  const [authed, setAuthed] = useState(() => !!sessionStorage.getItem("hb_admin_key"));
  const [adminKey, setAdminKey] = useState(() => sessionStorage.getItem("hb_admin_key") || "");
  const [pwInput, setPwInput] = useState("");
  const [tab, setTab] = useState<Tab>("dashboard");
  const [messages, setMessages] = useState<Message[]>([]);
  const [calls, setCalls] = useState<Call[]>([]);
  const [requests, setRequests] = useState<ContentRequest[]>([]);
  const [tips, setTips] = useState<Tip[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [replyMap, setReplyMap] = useState<Record<number, string>>({});
  const [loadingReply, setLoadingReply] = useState<number | null>(null);
  const [newPost, setNewPost] = useState({ imageUrl: "", caption: "", platform: "instagram", isPrivate: false });
  const [addingPost, setAddingPost] = useState(false);

  // Social sync
  const [socialConfig, setSocialConfig] = useState<SocialConfig | null>(null);
  const [syncingX, setSyncingX] = useState(false);
  const [syncingTikTok, setSyncingTikTok] = useState(false);
  const [syncingAll, setSyncingAll] = useState(false);
  const [xHandleInput, setXHandleInput] = useState("");
  const [tiktokHandleInput, setTiktokHandleInput] = useState("");
  const [syncIntervalInput, setSyncIntervalInput] = useState("6");
  const [lastSyncResult, setLastSyncResult] = useState<Record<string, unknown> | null>(null);

  // GitHub
  const [githubPushing, setGithubPushing] = useState(false);
  const [githubResult, setGithubResult] = useState<Record<string, unknown> | null>(null);

  // Settings
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>({});
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [rawSecrets, setRawSecrets] = useState<Record<string, string>>({});

  const esRef = useRef<EventSource | null>(null);

  const fetchAll = useCallback(async () => {
    const h = { "x-admin-key": adminKey };
    const [msgRes, callRes, reqRes, tipRes, postRes, statRes] = await Promise.all([
      fetch(`${API}/messages`, { headers: h }),
      fetch(`${API}/calls`, { headers: h }),
      fetch(`${API}/requests`, { headers: h }),
      fetch(`${API}/tips`, { headers: h }),
      fetch(`${API}/posts`, { headers: h }),
      fetch(`${API}/stats`, { headers: h }),
    ]);
    if (msgRes.ok) setMessages(await msgRes.json());
    if (callRes.ok) setCalls(await callRes.json());
    if (reqRes.ok) setRequests(await reqRes.json());
    if (tipRes.ok) setTips(await tipRes.json());
    if (postRes.ok) setPosts(await postRes.json());
    if (statRes.ok) setStats(await statRes.json());
  }, [adminKey]);

  const fetchSocialConfig = useCallback(async () => {
    const res = await fetch(`${API}/social/config`, { headers: { "x-admin-key": adminKey } });
    if (res.ok) {
      const cfg = await res.json() as SocialConfig;
      setSocialConfig(cfg);
      setXHandleInput(cfg.xHandle || "");
      setTiktokHandleInput(cfg.tiktokHandle || "");
      setSyncIntervalInput(String(cfg.intervalHours || 6));
    }
  }, [adminKey]);

  const fetchSettings = useCallback(async () => {
    setSettingsLoading(true);
    const res = await fetch(`${API}/settings`, { headers: { "x-admin-key": adminKey } });
    if (res.ok) {
      const data = await res.json();
      setRawSecrets(data._raw || {});
      const { _raw, ...safe } = data;
      setPlatformSettings(safe);
    }
    setSettingsLoading(false);
  }, [adminKey]);

  const saveSettings = async (patch: PlatformSettings) => {
    setSettingsSaving(true);
    const res = await fetch(`${API}/settings`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
      body: JSON.stringify(patch),
    });
    if (res.ok) {
      toast({ title: "Settings saved!" });
      await fetchSettings();
    } else {
      toast({ title: "Save failed", variant: "destructive" });
    }
    setSettingsSaving(false);
  };

  const login = async () => {
    const res = await fetch(`${API}/admin/auth`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pwInput }),
    });
    const data = await res.json();
    if (data.authorized) {
      sessionStorage.setItem("hb_admin_key", data.key);
      setAdminKey(data.key);
      setAuthed(true);
    } else {
      toast({ title: "Incorrect password", variant: "destructive" });
    }
  };

  useEffect(() => {
    if (!authed) return;
    fetchAll();
    fetchSocialConfig();
    fetchSettings();
  }, [authed, fetchAll, fetchSocialConfig, fetchSettings]);

  useEffect(() => {
    if (!authed) return;
    const es = new EventSource(`${API}/events`);
    esRef.current = es;
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data) as (Activity & { type: string }) | { type: "connected" };
        if (data.type === "connected") return;
        setActivity((prev) => [data as Activity, ...prev].slice(0, 50));
        fetchAll();
        if (notifEnabled && Notification.permission === "granted") {
          const icons: Record<string, string> = { message: "💬", call: "📹", request: "✨", tip: "💝" };
          new Notification(`${icons[data.type] || "🔔"} Hannah Brooks`, { body: (data as Activity).detail, icon: "/favicon.ico" });
        }
      } catch {}
    };
    return () => es.close();
  }, [authed, notifEnabled, fetchAll]);

  const enableNotifications = async () => {
    const perm = await Notification.requestPermission();
    setNotifEnabled(perm === "granted");
    toast({ title: perm === "granted" ? "Notifications on" : "Permission denied" });
  };

  const sendReply = async (id: number) => {
    const reply = replyMap[id];
    if (!reply?.trim()) return;
    setLoadingReply(id);
    await fetch(`${API}/messages/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json", "x-admin-key": adminKey }, body: JSON.stringify({ reply }) });
    setReplyMap((p) => { const n = { ...p }; delete n[id]; return n; });
    setLoadingReply(null);
    toast({ title: "Reply sent!" });
    fetchAll();
  };

  const updateCallStatus = async (id: number, status: string) => {
    await fetch(`${API}/calls/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json", "x-admin-key": adminKey }, body: JSON.stringify({ status }) });
    fetchAll();
  };

  const deletePost = async (id: number) => {
    await fetch(`${API}/posts/${id}`, { method: "DELETE", headers: { "x-admin-key": adminKey } });
    fetchAll();
  };

  const addPost = async () => {
    if (!newPost.imageUrl) return;
    setAddingPost(true);
    await fetch(`${API}/posts`, { method: "POST", headers: { "Content-Type": "application/json", "x-admin-key": adminKey }, body: JSON.stringify({ ...newPost, watermark: false }) });
    setNewPost({ imageUrl: "", caption: "", platform: "instagram", isPrivate: false });
    setAddingPost(false);
    toast({ title: "Post published to feed!" });
    fetchAll();
  };

  const saveSocialConfig = async () => {
    const res = await fetch(`${API}/social/config`, { method: "POST", headers: { "Content-Type": "application/json", "x-admin-key": adminKey }, body: JSON.stringify({ xHandle: xHandleInput, tiktokHandle: tiktokHandleInput, intervalHours: parseInt(syncIntervalInput, 10) || 6, enabled: socialConfig?.enabled ?? false }) });
    if (res.ok) { const cfg = await res.json() as { config: SocialConfig }; setSocialConfig(cfg.config); toast({ title: "Social settings saved!" }); }
  };

  const toggleAutoSync = async () => {
    const res = await fetch(`${API}/social/config`, { method: "POST", headers: { "Content-Type": "application/json", "x-admin-key": adminKey }, body: JSON.stringify({ enabled: !socialConfig?.enabled }) });
    if (res.ok) { const cfg = await res.json() as { config: SocialConfig }; setSocialConfig(cfg.config); toast({ title: cfg.config.enabled ? "Auto-sync ON" : "Auto-sync OFF" }); }
  };

  const syncPlatform = async (platform: "x" | "tiktok" | "all") => {
    if (platform === "x") setSyncingX(true);
    else if (platform === "tiktok") setSyncingTikTok(true);
    else setSyncingAll(true);
    const handle = platform === "x" ? xHandleInput : platform === "tiktok" ? tiktokHandleInput : undefined;
    const endpoint = platform === "all" ? "/social/sync/all" : `/social/sync/${platform}`;
    const body = handle ? (platform === "x" ? { handle } : { handle }) : {};
    try {
      const res = await fetch(`${API}${endpoint}`, { method: "POST", headers: { "Content-Type": "application/json", "x-admin-key": adminKey }, body: JSON.stringify(body) });
      const data = await res.json();
      setLastSyncResult(data as Record<string, unknown>);
      if (res.ok) {
        const synced = typeof data.synced === "number" ? data.synced : ((data.x?.synced ?? 0) + (data.tiktok?.synced ?? 0));
        toast({ title: `Synced ${synced} new post${synced !== 1 ? "s" : ""}!` });
        fetchAll();
      } else {
        toast({ title: "Sync failed", description: data.error || data.message, variant: "destructive" });
      }
    } catch { toast({ title: "Network error", variant: "destructive" }); }
    if (platform === "x") setSyncingX(false);
    else if (platform === "tiktok") setSyncingTikTok(false);
    else setSyncingAll(false);
  };

  const pushToGitHub = async () => {
    setGithubPushing(true);
    setGithubResult(null);
    try {
      const res = await fetch(`${API}/social/github/push`, { method: "POST", headers: { "x-admin-key": adminKey } });
      const data = await res.json();
      setGithubResult(data as Record<string, unknown>);
      if (res.ok && data.ok) toast({ title: "Pushed to GitHub!" });
      else toast({ title: "GitHub push failed", description: data.error, variant: "destructive" });
    } catch { toast({ title: "Network error", variant: "destructive" }); }
    setGithubPushing(false);
  };

  const logout = () => { sessionStorage.removeItem("hb_admin_key"); setAuthed(false); setAdminKey(""); };

  // ─── LOGIN ───────────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div className="min-h-screen bg-[#060606] flex items-center justify-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-amber-900/10 via-transparent to-transparent" />
        <div className="w-full max-w-sm relative z-10">
          <div className="text-center mb-8">
            <img src={logoHB} alt="HB" className="w-20 h-20 object-contain mx-auto mb-5" onError={(e)=>{(e.target as HTMLImageElement).style.display="none"}} />
            <h1 className="text-3xl font-serif font-bold text-white">Creator Portal</h1>
            <p className="text-white/30 mt-2 text-sm tracking-wider">HANNAH BROOKS · PRIVATE ACCESS</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 backdrop-blur">
            <Input
              type="password"
              placeholder="Enter your password"
              value={pwInput}
              onChange={(e) => setPwInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && login()}
              className="bg-black/60 border-white/10 text-white h-12 rounded-xl placeholder:text-white/20"
            />
            <button onClick={login} className="w-full h-12 rounded-xl font-bold text-black tracking-widest" style={{background:"linear-gradient(135deg,#c9a84c,#f0d080,#c9a84c)"}}>
              Sign In
            </button>
          </div>
          <p className="text-center text-white/20 text-xs mt-6">Protected · Not for public access</p>
        </div>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: "messages", label: "Messages", icon: <MessageSquare className="w-4 h-4" />, count: messages.filter(m => m.status !== "replied").length },
    { id: "calls", label: "Calls", icon: <Phone className="w-4 h-4" />, count: calls.filter(c => c.status === "pending").length },
    { id: "requests", label: "Requests", icon: <Sparkles className="w-4 h-4" />, count: requests.filter(r => r.status === "pending").length },
    { id: "tips", label: "Tips", icon: <Gift className="w-4 h-4" /> },
    { id: "feed", label: "Feed", icon: <ImagePlus className="w-4 h-4" /> },
    { id: "social", label: "Social Sync", icon: <Zap className="w-4 h-4" /> },
    { id: "github", label: "GitHub", icon: <Github className="w-4 h-4" /> },
    { id: "settings", label: "Settings", icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#060606] text-white">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 bg-[#060606]/95 backdrop-blur border-b border-white/5 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={logoHB} alt="HB" className="w-8 h-8 object-contain" onError={(e)=>{(e.target as HTMLImageElement).style.display="none"}} />
          <span className="font-serif font-bold text-lg text-white">HB Creator <span style={{color:"#c9a84c"}}>Portal</span></span>
          <span className="hidden sm:inline text-xs text-white/20 border border-white/10 rounded-full px-2 py-0.5 tracking-wider">PRIVATE</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="relative">
            <Button size="sm" variant="ghost" onClick={enableNotifications} className="text-white/40 hover:text-white">
              {notifEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
            </Button>
            {activity.length > 0 && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full animate-pulse" style={{background:"#c9a84c"}} />}
          </div>
          <Button size="sm" variant="ghost" onClick={fetchAll} className="text-white/40 hover:text-white"><RefreshCw className="w-4 h-4" /></Button>
          <Button size="sm" variant="ghost" onClick={logout} className="text-white/40 hover:text-white"><LogOut className="w-4 h-4" /></Button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-56 shrink-0 min-h-[calc(100vh-57px)] border-r border-white/5 bg-black/60 p-3 hidden md:block">
          <nav className="space-y-0.5">
            {tabs.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${tab === t.id ? "text-amber-400 border border-amber-400/20" : "text-white/40 hover:text-white hover:bg-white/5"}`}
                style={tab === t.id ? {background:"rgba(201,168,76,0.08)"} : {}}
              >
                <span className="flex items-center gap-2.5">{t.icon}{t.label}</span>
                {t.count !== undefined && t.count > 0 && (
                  <span className="text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center text-black font-bold" style={{background:"#c9a84c"}}>{t.count}</span>
                )}
              </button>
            ))}
          </nav>

          {activity.length > 0 && (
            <div className="mt-6">
              <p className="text-xs font-bold text-white/20 px-3 mb-2 uppercase tracking-widest">Live Activity</p>
              <div className="space-y-1.5 max-h-64 overflow-y-auto">
                {activity.slice(0, 8).map((a, i) => (
                  <div key={i} className="px-3 py-2 rounded-lg bg-white/5 text-xs">
                    <div className="flex items-center gap-1 text-white/70 mb-0.5">
                      <span>{a.type === "message" ? "💬" : a.type === "call" ? "📹" : a.type === "tip" ? "💝" : "✨"}</span>
                      <span className="font-medium truncate">{a.fanName}</span>
                    </div>
                    {a.amount > 0 && <div className="font-bold" style={{color:"#c9a84c"}}>${a.amount}</div>}
                    <div className="text-white/30">{timeAgo(a.timestamp)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* Main content */}
        <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
          {/* Mobile tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 md:hidden">
            {tabs.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all
                  ${tab === t.id ? "text-amber-400 border-amber-400/20" : "text-white/40 border-white/10"}`}
                style={tab === t.id ? {background:"rgba(201,168,76,0.08)"} : {}}
              >
                {t.icon}{t.label}
                {t.count !== undefined && t.count > 0 && (
                  <span className="rounded-full px-1.5 min-w-[16px] text-center text-black text-xs font-bold" style={{background:"#c9a84c"}}>{t.count}</span>
                )}
              </button>
            ))}
          </div>

          {/* ─── DASHBOARD ─────────────────────────────────────────── */}
          {tab === "dashboard" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-serif font-bold text-white">Dashboard</h2>
                <p className="text-white/30 text-sm">{new Date().toLocaleDateString("en-GB", { weekday:"long", day:"numeric", month:"long" })}</p>
              </div>

              {stats && (
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                  {[
                    { label: "Revenue", value: `$${stats.totalRevenue.toFixed(2)}`, icon: <DollarSign className="w-5 h-5" />, color: "#c9a84c" },
                    { label: "Messages", value: stats.totalMessages, icon: <MessageSquare className="w-5 h-5" />, color: "#f472b6" },
                    { label: "Calls", value: stats.totalCalls, icon: <Phone className="w-5 h-5" />, color: "#60a5fa" },
                    { label: "Requests", value: stats.totalRequests, icon: <Sparkles className="w-5 h-5" />, color: "#c084fc" },
                    { label: "Tips", value: stats.totalTips, icon: <Gift className="w-5 h-5" />, color: "#34d399" },
                  ].map((s) => (
                    <div key={s.label} className="bg-white/3 border border-white/5 rounded-2xl p-5">
                      <div style={{color:s.color}} className="mb-3">{s.icon}</div>
                      <div className="text-2xl font-bold text-white">{s.value}</div>
                      <div className="text-xs text-white/30 mt-1 tracking-wider uppercase">{s.label}</div>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { id: "social" as Tab, icon: <Zap />, title: "Social Sync", desc: "Import from TikTok & X — no watermark", color: "#c9a84c", extra: socialConfig?.enabled ? "Auto-sync active 🟢" : null },
                  { id: "settings" as Tab, icon: <Settings />, title: "Platform Settings", desc: "API keys, prices, payment settings", color: "#c084fc", extra: null },
                  { id: "github" as Tab, icon: <Github />, title: "Push to GitHub", desc: "Backup your site code", color: "#a78bfa", extra: null },
                ].map(s => (
                  <button key={s.id} onClick={() => setTab(s.id)} className="bg-white/3 border border-white/5 hover:border-white/10 rounded-2xl p-5 text-left transition-all group">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{background:`${s.color}18`,color:s.color}}>
                      {s.icon}
                    </div>
                    <div className="font-semibold text-white">{s.title}</div>
                    <div className="text-sm text-white/40 mt-1">{s.desc}</div>
                    {s.extra && <div className="text-xs text-green-400 mt-2">{s.extra}</div>}
                  </button>
                ))}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-bold text-white/40 uppercase tracking-widest mb-3">Awaiting Reply</h3>
                  <div className="space-y-3">
                    {messages.filter(m => m.status !== "replied" && m.status !== "free").slice(0, 3).map((m) => (
                      <div key={m.id} className="bg-white/5 border border-white/5 rounded-xl p-4 flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-white">{m.fanName}</span>
                            <span className={statusBadge(m.status)}>{m.status}</span>
                          </div>
                          <p className="text-sm text-white/50 truncate">{m.message}</p>
                        </div>
                        <Button size="sm" onClick={() => setTab("messages")} className="shrink-0 text-amber-400 border border-amber-400/20 hover:bg-amber-400/10" style={{background:"rgba(201,168,76,0.08)"}}>
                          Reply
                        </Button>
                      </div>
                    ))}
                    {messages.filter(m => m.status !== "replied" && m.status !== "free").length === 0 && (
                      <div className="text-center py-8 text-white/20 text-sm border border-white/5 rounded-xl flex flex-col items-center gap-2">
                        <CheckCircle className="w-7 h-7 text-green-400" /> All caught up
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white/40 uppercase tracking-widest mb-3">Pending Calls</h3>
                  <div className="space-y-3">
                    {calls.filter(c => c.status === "pending").slice(0, 3).map((c) => (
                      <div key={c.id} className="bg-white/5 border border-white/5 rounded-xl p-4 flex items-start justify-between gap-4">
                        <div>
                          <div className="font-medium text-white">{c.fanName} — {c.durationMinutes} min</div>
                          <div className="text-sm text-white/40">{new Date(c.preferredDate).toLocaleString()}</div>
                        </div>
                        <Button size="sm" onClick={() => updateCallStatus(c.id, "confirmed")} className="bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20">
                          Confirm
                        </Button>
                      </div>
                    ))}
                    {calls.filter(c => c.status === "pending").length === 0 && (
                      <div className="text-center py-8 text-white/20 text-sm border border-white/5 rounded-xl">No pending calls</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── MESSAGES ──────────────────────────────────────────── */}
          {tab === "messages" && (
            <div className="space-y-4">
              <h2 className="text-2xl font-serif font-bold text-white">Messages <span className="text-white/30 font-normal text-lg">({messages.length})</span></h2>
              {messages.map((m) => (
                <div key={m.id} className="bg-white/5 border border-white/5 rounded-2xl p-5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-white">{m.fanName}</span>
                        <span className={statusBadge(m.status)}>{m.status}</span>
                        {m.amountPaid > 0 && <span className="font-bold text-sm" style={{color:"#c9a84c"}}>${m.amountPaid}</span>}
                      </div>
                      <div className="text-xs text-white/30">{m.fanEmail} · {timeAgo(m.createdAt)}</div>
                    </div>
                  </div>
                  <div className="bg-black/40 rounded-xl p-4 mb-3">
                    <p className="text-white/90 text-sm leading-relaxed">{m.message}</p>
                  </div>
                  {m.reply && (
                    <div className="rounded-xl p-4 mb-3 border" style={{background:"rgba(201,168,76,0.05)",borderColor:"rgba(201,168,76,0.15)"}}>
                      <div className="flex items-center gap-1 text-xs mb-1" style={{color:"#c9a84c"}}>
                        <Star className="w-3 h-3" /> Your Reply
                      </div>
                      <p className="text-white/80 text-sm">{m.reply}</p>
                    </div>
                  )}
                  {m.status !== "replied" && (
                    <div className="flex gap-2">
                      <Textarea placeholder="Write your reply…" value={replyMap[m.id] || ""} onChange={(e) => setReplyMap((p) => ({ ...p, [m.id]: e.target.value }))}
                        className="bg-black/50 border-white/10 text-white resize-none text-sm min-h-[80px] rounded-xl" />
                      <Button onClick={() => sendReply(m.id)} disabled={loadingReply === m.id || !replyMap[m.id]?.trim()}
                        className="rounded-xl shrink-0 border border-amber-400/20 text-amber-400 hover:bg-amber-400/10" style={{background:"rgba(201,168,76,0.08)"}}>
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
              {messages.length === 0 && <div className="text-center py-16 text-white/20 border border-white/5 rounded-2xl">No messages yet</div>}
            </div>
          )}

          {/* ─── CALLS ─────────────────────────────────────────────── */}
          {tab === "calls" && (
            <div className="space-y-4">
              <h2 className="text-2xl font-serif font-bold text-white">Call Bookings <span className="text-white/30 font-normal text-lg">({calls.length})</span></h2>
              {calls.map((c) => (
                <div key={c.id} className="bg-white/5 border border-white/5 rounded-2xl p-5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-white">{c.fanName}</span>
                        <span className={statusBadge(c.status)}>{c.status}</span>
                        <span className="font-bold text-sm" style={{color:"#c9a84c"}}>${c.amountPaid}</span>
                      </div>
                      <div className="text-xs text-white/30">{c.fanEmail} · {timeAgo(c.createdAt)}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                    <div className="bg-black/40 rounded-xl p-3"><div className="text-xs text-white/30 mb-1">Duration</div><div className="text-white font-medium">{c.durationMinutes} minutes</div></div>
                    <div className="bg-black/40 rounded-xl p-3"><div className="text-xs text-white/30 mb-1">Date</div><div className="text-white font-medium">{new Date(c.preferredDate).toLocaleString()}</div></div>
                    {c.notes && <div className="bg-black/40 rounded-xl p-3 col-span-2"><div className="text-xs text-white/30 mb-1">Notes</div><div className="text-white/80">{c.notes}</div></div>}
                  </div>
                  <div className="flex gap-2">
                    {c.status === "pending" && <Button size="sm" onClick={() => updateCallStatus(c.id, "confirmed")} className="bg-green-500/10 text-green-400 border border-green-500/20"><CheckCircle className="w-4 h-4 mr-1" /> Confirm</Button>}
                    {c.status === "confirmed" && <Button size="sm" onClick={() => updateCallStatus(c.id, "completed")} className="bg-blue-500/10 text-blue-400 border border-blue-500/20"><CheckCircle className="w-4 h-4 mr-1" /> Mark Completed</Button>}
                  </div>
                </div>
              ))}
              {calls.length === 0 && <div className="text-center py-16 text-white/20 border border-white/5 rounded-2xl">No bookings yet</div>}
            </div>
          )}

          {/* ─── REQUESTS ──────────────────────────────────────────── */}
          {tab === "requests" && (
            <div className="space-y-4">
              <h2 className="text-2xl font-serif font-bold text-white">Custom Requests <span className="text-white/30 font-normal text-lg">({requests.length})</span></h2>
              {requests.map((r) => (
                <div key={r.id} className="bg-white/5 border border-white/5 rounded-2xl p-5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-white">{r.fanName}</span>
                        <span className={statusBadge(r.status)}>{r.status}</span>
                        <span className="font-bold text-sm" style={{color:"#c9a84c"}}>${r.amountPaid}</span>
                      </div>
                      <div className="text-xs text-white/30">{r.fanEmail} · {timeAgo(r.createdAt)}</div>
                    </div>
                  </div>
                  <div className="bg-black/40 rounded-xl p-4">
                    <div className="text-xs text-white/30 mb-1 uppercase tracking-wider">Type: {r.requestType}</div>
                    <p className="text-white/90 text-sm">{r.description}</p>
                  </div>
                </div>
              ))}
              {requests.length === 0 && <div className="text-center py-16 text-white/20 border border-white/5 rounded-2xl">No requests yet</div>}
            </div>
          )}

          {/* ─── TIPS ──────────────────────────────────────────────── */}
          {tab === "tips" && (
            <div className="space-y-4">
              <h2 className="text-2xl font-serif font-bold text-white">Tips & Gifts <span className="text-white/30 font-normal text-lg">({tips.length})</span></h2>
              {tips.map((t) => (
                <div key={t.id} className="bg-white/5 border border-white/5 rounded-2xl p-5 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-white">{t.fanName}</span>
                      <span className="font-bold text-xl" style={{color:"#c9a84c"}}>${t.amount}</span>
                    </div>
                    <div className="text-xs text-white/30">{t.fanEmail} · {timeAgo(t.createdAt)}</div>
                    {t.message && <p className="text-sm text-white/60 mt-2 italic">"{t.message}"</p>}
                  </div>
                  <Gift className="w-8 h-8 shrink-0" style={{color:"rgba(201,168,76,0.4)"}} />
                </div>
              ))}
              {tips.length === 0 && <div className="text-center py-16 text-white/20 border border-white/5 rounded-2xl">No tips yet</div>}
            </div>
          )}

          {/* ─── FEED ──────────────────────────────────────────────── */}
          {tab === "feed" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-serif font-bold text-white">Feed Manager</h2>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><ImagePlus className="w-5 h-5" style={{color:"#c9a84c"}} /> Publish New Post</h3>
                <div className="space-y-4">
                  <Input placeholder="Image or video URL (paste a direct link)" value={newPost.imageUrl} onChange={(e) => setNewPost((p) => ({ ...p, imageUrl: e.target.value }))} className="bg-black/50 border-white/10 text-white rounded-xl placeholder:text-white/20" />
                  <Textarea placeholder="Caption (optional)" value={newPost.caption} onChange={(e) => setNewPost((p) => ({ ...p, caption: e.target.value }))} className="bg-black/50 border-white/10 text-white rounded-xl resize-none min-h-[80px] placeholder:text-white/20" />
                  <div className="flex gap-4 items-center flex-wrap">
                    <select value={newPost.platform} onChange={(e) => setNewPost((p) => ({ ...p, platform: e.target.value }))} className="bg-black/60 border border-white/10 text-white rounded-xl px-3 py-2 text-sm">
                      <option value="instagram">Instagram</option>
                      <option value="twitter">X / Twitter</option>
                      <option value="tiktok">TikTok</option>
                      <option value="custom">Custom Upload</option>
                    </select>
                    <label className="flex items-center gap-2 text-sm text-white/50 cursor-pointer select-none">
                      <input type="checkbox" checked={newPost.isPrivate} onChange={(e) => setNewPost((p) => ({ ...p, isPrivate: e.target.checked }))} className="rounded" />
                      <Lock className="w-3.5 h-3.5" /> VIP only
                    </label>
                  </div>
                  {newPost.imageUrl && (
                    <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-white/10">
                      <img src={newPost.imageUrl} alt="preview" className="w-full h-full object-cover" onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")} />
                    </div>
                  )}
                  <button onClick={addPost} disabled={addingPost || !newPost.imageUrl} className="h-11 px-6 rounded-xl font-bold text-sm text-black disabled:opacity-40 hover:scale-[1.01] transition-transform" style={{background:"linear-gradient(135deg,#c9a84c,#f0d080,#c9a84c)"}}>
                    {addingPost ? "Publishing…" : "Publish to Feed"}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {posts.map((p) => (
                  <div key={p.id} className="relative rounded-xl overflow-hidden border border-white/10 group aspect-square">
                    <img src={p.imageUrl} alt={p.caption || ""} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all" />
                    <div className="absolute top-2 left-2 flex items-center gap-1 text-white/90 text-xs bg-black/60 px-1.5 py-0.5 rounded-full backdrop-blur">
                      {platformIcon(p.platform)} {p.platform}
                    </div>
                    {p.isPrivate && <div className="absolute top-2 right-2 text-xs px-1.5 py-0.5 rounded-full font-bold text-black" style={{background:"#c9a84c"}}>VIP</div>}
                    <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-200">
                      {p.caption && <p className="text-white text-xs mb-2 line-clamp-2">{p.caption}</p>}
                      <Button size="sm" onClick={() => deletePost(p.id)} className="w-full bg-red-500/20 text-red-300 border border-red-500/20 hover:bg-red-500/40 text-xs">
                        <Trash2 className="w-3 h-3 mr-1" /> Remove
                      </Button>
                    </div>
                  </div>
                ))}
                {posts.length === 0 && <div className="col-span-full text-center py-16 text-white/20 border border-white/5 rounded-2xl">No posts yet. Use Social Sync or add manually above.</div>}
              </div>
            </div>
          )}

          {/* ─── SOCIAL SYNC ───────────────────────────────────────── */}
          {tab === "social" && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h2 className="text-2xl font-serif font-bold text-white">Social Sync</h2>
                <p className="text-white/30 text-sm mt-1">Import content from TikTok & X — watermark-free, automatically.</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center border ${socialConfig?.enabled ? "border-green-500/30" : "border-white/10"}`} style={socialConfig?.enabled ? {background:"rgba(74,222,128,0.1)"} : {background:"rgba(255,255,255,0.05)"}}>
                      <Zap className={`w-5 h-5 ${socialConfig?.enabled ? "text-green-400" : "text-white/30"}`} />
                    </div>
                    <div>
                      <div className="font-semibold text-white">Auto-Sync</div>
                      <div className="text-xs text-white/30">{socialConfig?.enabled ? `Running every ${socialConfig.intervalHours}h` : "Currently off"}</div>
                    </div>
                  </div>
                  <button onClick={toggleAutoSync} className="text-white/30 hover:text-white transition-colors">
                    {socialConfig?.enabled ? <ToggleRight className="w-8 h-8 text-green-400" /> : <ToggleLeft className="w-8 h-8" />}
                  </button>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
                <h3 className="font-semibold text-white flex items-center gap-2"><Key className="w-4 h-4 text-amber-400" /> API Keys Status</h3>
                {[
                  { label: "X Bearer Token", ok: socialConfig?.hasXToken, url: "https://developer.twitter.com/en/portal/dashboard" },
                  { label: "RapidAPI Key (TikTok)", ok: socialConfig?.hasRapidApiKey, url: "https://rapidapi.com/tikwm-tikwm-default/api/tiktok-scraper7" },
                ].map((k) => (
                  <div key={k.label} className="flex items-center justify-between gap-3 text-sm py-2 border-b border-white/5 last:border-0">
                    <div className="flex items-center gap-2">
                      {k.ok ? <CheckCircle className="w-4 h-4 text-green-400 shrink-0" /> : <AlertCircle className="w-4 h-4 text-yellow-400 shrink-0" />}
                      <span className={k.ok ? "text-white/70" : "text-yellow-400"}>{k.label}</span>
                    </div>
                    {!k.ok
                      ? <a href={k.url} target="_blank" rel="noreferrer" className="text-xs text-amber-400 flex items-center gap-1 hover:underline">Get key <ExternalLink className="w-3 h-3" /></a>
                      : <span className="text-green-400 text-xs font-bold">✓ Set</span>}
                  </div>
                ))}
                <p className="text-xs text-white/20 pt-1">Paste API keys in the Settings tab below to save them without leaving the admin.</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
                <h3 className="font-semibold text-white flex items-center gap-2"><Settings className="w-4 h-4" /> Account Handles</h3>
                <div>
                  <label className="text-xs text-white/30 mb-1.5 block">X / Twitter handle or URL</label>
                  <Input placeholder="@hannahbrooksxx or https://x.com/hannahbrooksxx" value={xHandleInput} onChange={(e) => setXHandleInput(e.target.value)} className="bg-black/50 border-white/10 text-white rounded-xl placeholder:text-white/20" />
                </div>
                <div>
                  <label className="text-xs text-white/30 mb-1.5 block">TikTok handle or URL</label>
                  <Input placeholder="@hannahbrooksxxx or https://tiktok.com/@hannahbrooksxxx" value={tiktokHandleInput} onChange={(e) => setTiktokHandleInput(e.target.value)} className="bg-black/50 border-white/10 text-white rounded-xl placeholder:text-white/20" />
                </div>
                <div>
                  <label className="text-xs text-white/30 mb-1.5 block flex items-center gap-1"><Clock className="w-3 h-3" /> Auto-sync every (hours)</label>
                  <Input type="number" min="1" max="24" value={syncIntervalInput} onChange={(e) => setSyncIntervalInput(e.target.value)} className="bg-black/50 border-white/10 text-white rounded-xl w-28" />
                </div>
                <button onClick={saveSocialConfig} className="h-10 px-5 rounded-xl font-semibold text-sm text-black" style={{background:"linear-gradient(135deg,#c9a84c,#f0d080)"}}>
                  Save Settings
                </button>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
                <h3 className="font-semibold text-white flex items-center gap-2"><Play className="w-4 h-4" /> Manual Sync Now</h3>
                <div className="flex flex-wrap gap-3">
                  <Button onClick={() => syncPlatform("x")} disabled={syncingX || syncingAll} className="bg-sky-500/10 text-sky-300 border border-sky-500/20 hover:bg-sky-500/20 rounded-xl">
                    <Twitter className="w-4 h-4 mr-2" />{syncingX ? "Syncing…" : "Sync X / Twitter"}
                  </Button>
                  <Button onClick={() => syncPlatform("tiktok")} disabled={syncingTikTok || syncingAll} className="bg-pink-500/10 text-pink-300 border border-pink-500/20 hover:bg-pink-500/20 rounded-xl">
                    <Music2 className="w-4 h-4 mr-2" />{syncingTikTok ? "Syncing…" : "Sync TikTok"}
                  </Button>
                  <button onClick={() => syncPlatform("all")} disabled={syncingAll || syncingX || syncingTikTok} className="h-9 px-4 rounded-xl font-semibold text-sm text-black disabled:opacity-40" style={{background:"linear-gradient(135deg,#c9a84c,#f0d080)"}}>
                    <span className="flex items-center gap-2"><Zap className="w-4 h-4" />{syncingAll ? "Syncing All…" : "Sync All"}</span>
                  </button>
                </div>
                {lastSyncResult && (
                  <div className="bg-black/40 rounded-xl p-4 text-xs font-mono text-white/50 overflow-x-auto">
                    <pre>{JSON.stringify(lastSyncResult, null, 2)}</pre>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ─── GITHUB ────────────────────────────────────────────── */}
          {tab === "github" && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h2 className="text-2xl font-serif font-bold text-white">Push to GitHub</h2>
                <p className="text-white/30 text-sm mt-1">Backup your entire site to GitHub with one click.</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
                <h3 className="font-semibold text-white flex items-center gap-2"><Settings className="w-4 h-4" /> One-Time Setup</h3>
                <ol className="space-y-3 text-sm text-white/40 list-none">
                  {[
                    "Create a new GitHub repository (can be private).",
                    "Go to GitHub → Settings → Developer settings → Personal access tokens → Generate new token. Enable repo scope.",
                    "In the Settings tab below, paste: https://YOUR_TOKEN@github.com/yourusername/your-repo.git as the GitHub Remote URL.",
                  ].map((s, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="w-6 h-6 rounded-full flex items-center justify-center font-bold shrink-0 text-xs text-amber-400" style={{background:"rgba(201,168,76,0.15)",border:"1px solid rgba(201,168,76,0.3)"}}>{i+1}</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ol>
                <a href="https://github.com/new" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm text-amber-400 hover:text-amber-300 transition-colors">
                  <ExternalLink className="w-3.5 h-3.5" /> Create GitHub repo
                </a>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
                <h3 className="font-semibold text-white flex items-center gap-2"><Github className="w-4 h-4" /> Push Now</h3>
                <p className="text-sm text-white/30">Commits all current code and pushes to your GitHub repo.</p>
                <button onClick={pushToGitHub} disabled={githubPushing} className="h-12 px-6 rounded-xl font-bold text-sm border border-purple-500/20 text-purple-300 hover:bg-purple-500/10 disabled:opacity-40 flex items-center gap-2 transition-colors" style={{background:"rgba(168,139,250,0.08)"}}>
                  <Github className="w-5 h-5" />{githubPushing ? "Pushing…" : "Push to GitHub"}
                </button>
                {githubResult && (
                  <div className={`rounded-xl p-4 text-sm border ${githubResult.ok ? "bg-green-500/5 border-green-500/20 text-green-400" : "bg-red-500/5 border-red-500/20 text-red-400"}`}>
                    {githubResult.ok
                      ? <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Successfully pushed to GitHub!</div>
                      : <div><div className="flex items-center gap-2 mb-2"><AlertCircle className="w-4 h-4" /> Push failed</div><div className="text-xs font-mono opacity-70">{String(githubResult.error ?? "")}</div></div>}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ─── SETTINGS ──────────────────────────────────────────── */}
          {tab === "settings" && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h2 className="text-2xl font-serif font-bold text-white">Platform Settings</h2>
                <p className="text-white/30 text-sm mt-1">Control every price, API key, and setting from here — no code changes needed.</p>
              </div>

              {settingsLoading ? (
                <div className="text-center py-16 text-white/30">Loading settings…</div>
              ) : (
                <>
                  {/* ── Payment / Flutterwave ─────────────────────── */}
                  <SettingsSection title="Payment — Flutterwave" icon={<CreditCard className="w-5 h-5 text-amber-400" />}
                    desc="Set your Flutterwave API keys. Get them from dashboard.flutterwave.com."
                  >
                    <SettingsField label="Public Key" hint="Starts with FLWPUBK_">
                      <Input defaultValue={String(platformSettings.flutterwavePublicKey || "")} onBlur={e => saveSettings({ flutterwavePublicKey: e.target.value })} placeholder="FLWPUBK_LIVE-..." className={inputCls} />
                    </SettingsField>
                    <SettingsField label="Secret Key" hint="Never share this — used server-side">
                      <SecretInput defaultValue={rawSecrets.flutterwaveSecretKey || ""} onSave={v => saveSettings({ flutterwaveSecretKey: v })} placeholder="FLWSECK_LIVE-..." />
                    </SettingsField>
                    <SettingsField label="Currency" hint="USD, GBP, EUR, NGN…">
                      <Input defaultValue={String(platformSettings.currency || "USD")} onBlur={e => saveSettings({ currency: e.target.value })} placeholder="USD" className={inputCls} />
                    </SettingsField>
                  </SettingsSection>

                  {/* ── Prices ───────────────────────────────────── */}
                  <SettingsSection title="Pricing" icon={<DollarSign className="w-5 h-5 text-amber-400" />}
                    desc="Set your prices. Changes apply instantly to the public site — no restart needed."
                  >
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { key: "msgPrice", label: "Message price ($)", hint: "Per paid message" },
                        { key: "msgFreeLimit", label: "Free messages", hint: "Before payment kicks in" },
                        { key: "subMonthly", label: "VIP Monthly ($)", hint: "" },
                        { key: "subQuarterly", label: "VIP 3-Month ($)", hint: "" },
                        { key: "subLifetime", label: "VIP Lifetime ($)", hint: "" },
                        { key: "requestPrice", label: "Custom Request ($)", hint: "" },
                        { key: "tipMin", label: "Minimum Tip ($)", hint: "" },
                        { key: "callWa5", label: "WhatsApp 5min ($)", hint: "" },
                        { key: "callZoom15", label: "Zoom 15min ($)", hint: "" },
                        { key: "callZoom30", label: "Zoom 30min ($)", hint: "" },
                        { key: "callPrivate60", label: "Private 1hr ($)", hint: "" },
                      ].map(({ key, label, hint }) => (
                        <div key={key}>
                          <label className="text-xs font-bold text-white/40 tracking-wider block mb-1.5">{label}</label>
                          {hint && <p className="text-xs text-white/20 mb-1">{hint}</p>}
                          <Input type="number" step="0.01" defaultValue={String(platformSettings[key] ?? "")} onBlur={e => saveSettings({ [key]: parseFloat(e.target.value) || 0 })} className={inputCls} />
                        </div>
                      ))}
                    </div>
                  </SettingsSection>

                  {/* ── Social API Keys ───────────────────────────── */}
                  <SettingsSection title="Social Media API Keys" icon={<Key className="w-5 h-5 text-amber-400" />}
                    desc="Enter your API keys here. They're saved in memory and applied immediately."
                  >
                    <SettingsField label="X / Twitter Bearer Token" hint="From developer.twitter.com → Keys & Tokens">
                      <SecretInput defaultValue={rawSecrets.xBearerToken || ""} onSave={v => saveSettings({ xBearerToken: v })} placeholder="AAAA..." />
                    </SettingsField>
                    <SettingsField label="RapidAPI Key" hint="From rapidapi.com — needed for TikTok sync">
                      <SecretInput defaultValue={rawSecrets.rapidApiKey || ""} onSave={v => saveSettings({ rapidApiKey: v })} placeholder="Your RapidAPI key" />
                    </SettingsField>
                    <SettingsField label="GitHub Remote URL" hint="Format: https://TOKEN@github.com/user/repo.git">
                      <SecretInput defaultValue={rawSecrets.githubRemote || ""} onSave={v => saveSettings({ githubRemote: v })} placeholder="https://ghp_...@github.com/..." />
                    </SettingsField>
                  </SettingsSection>

                  {/* ── Profile ──────────────────────────────────── */}
                  <SettingsSection title="Profile & Links" icon={<User className="w-5 h-5 text-amber-400" />}
                    desc="Your public profile info — shown on the homepage."
                  >
                    <SettingsField label="Bio">
                      <textarea
                        defaultValue={String(platformSettings.creatorBio || "")}
                        onBlur={e => saveSettings({ creatorBio: e.target.value })}
                        rows={3}
                        className="w-full bg-black border border-white/10 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-amber-400/30 resize-none placeholder:text-white/20"
                      />
                    </SettingsField>
                    <SettingsField label="Tagline" hint="Shown under your name on homepage">
                      <Input defaultValue={String(platformSettings.creatorTagline || "")} onBlur={e => saveSettings({ creatorTagline: e.target.value })} className={inputCls} />
                    </SettingsField>
                    <SettingsField label="WhatsApp Number" hint="International format, no +">
                      <Input defaultValue={String(platformSettings.whatsappNumber || "")} onBlur={e => saveSettings({ whatsappNumber: e.target.value })} placeholder="447700000000" className={inputCls} />
                    </SettingsField>
                    {[
                      { key: "instagramUrl", label: "Instagram URL" },
                      { key: "twitterUrl", label: "X / Twitter URL" },
                      { key: "tiktokUrl", label: "TikTok URL" },
                      { key: "onlyfansUrl", label: "OnlyFans URL" },
                    ].map(f => (
                      <SettingsField key={f.key} label={f.label}>
                        <Input defaultValue={String(platformSettings[f.key] || "")} onBlur={e => saveSettings({ [f.key]: e.target.value })} className={inputCls} />
                      </SettingsField>
                    ))}
                  </SettingsSection>

                  {/* ── Security ─────────────────────────────────── */}
                  <SettingsSection title="Security" icon={<Lock className="w-5 h-5 text-amber-400" />}
                    desc="Change your admin portal password. You'll be logged out after saving."
                  >
                    <SettingsField label="Admin Password">
                      <SecretInput defaultValue={rawSecrets.adminPassword || ""} onSave={v => { saveSettings({ adminPassword: v }); setTimeout(logout, 1500); }} placeholder="New password" />
                    </SettingsField>
                  </SettingsSection>
                </>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// ─── Helper sub-components ───────────────────────────────────────────────────

const inputCls = "bg-black border-white/10 text-white text-sm rounded-xl placeholder:text-white/20 focus-visible:ring-amber-400/30 w-full";

function SettingsSection({ title, icon, desc, children }: { title: string; icon: React.ReactNode; desc: string; children: React.ReactNode }) {
  return (
    <div className="bg-white/3 border border-white/5 rounded-2xl overflow-hidden">
      <div className="flex items-start gap-3 p-5 border-b border-white/5">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{background:"rgba(201,168,76,0.1)"}}>{icon}</div>
        <div>
          <p className="font-bold text-white">{title}</p>
          <p className="text-xs text-white/30 mt-0.5">{desc}</p>
        </div>
      </div>
      <div className="p-5 space-y-0">{children}</div>
    </div>
  );
}

function SettingsField({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="py-4 border-b border-white/5 last:border-0">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-[140px]">
          <p className="text-sm font-semibold text-white/70">{label}</p>
          {hint && <p className="text-xs text-white/25 mt-0.5">{hint}</p>}
        </div>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}

function SecretInput({ defaultValue, onSave, placeholder }: { defaultValue: string; onSave: (v: string) => void; placeholder?: string }) {
  const [val, setVal] = React.useState(defaultValue);
  const [show, setShow] = React.useState(false);
  return (
    <div className="flex gap-2">
      <Input
        type={show ? "text" : "password"}
        value={val}
        onChange={e => setVal(e.target.value)}
        placeholder={placeholder}
        className="bg-black border-white/10 text-white text-sm rounded-xl placeholder:text-white/20 focus-visible:ring-amber-400/30"
      />
      <button type="button" onClick={() => setShow(s => !s)} className="p-2 text-white/30 hover:text-white transition-colors rounded-lg border border-white/10">
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
      <button type="button" onClick={() => onSave(val)} className="px-3 py-2 rounded-xl text-sm font-bold text-black hover:opacity-90 transition-opacity whitespace-nowrap" style={{background:"linear-gradient(135deg,#c9a84c,#f0d080)"}}>
        <Save className="w-4 h-4" />
      </button>
    </div>
  );
}
