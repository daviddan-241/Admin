import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  MessageSquare, Phone, Sparkles, Gift, ImagePlus, LayoutDashboard,
  Send, CheckCircle, Trash2, Bell, BellOff, Mic, Pause, Play,
  LogOut, DollarSign, Star, RefreshCw, Instagram,
  Twitter, Music2, Globe, Zap, Github, Settings, Clock,
  ToggleLeft, ToggleRight, AlertCircle, ExternalLink,
  Crown, Lock, Save, Key, CreditCard, User, Paperclip,
  Eye, EyeOff, ChevronRight, ArrowLeft, X, CheckCheck, Camera
} from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const API = `${BASE}/api`;
const logoHB = `${import.meta.env.BASE_URL}logo-hb.png`;
const GOLD = "#c9a84c";
const GOLD_GRAD = "linear-gradient(135deg,#c9a84c,#f0d080,#c9a84c)";

type Tab = "dashboard" | "chat" | "calls" | "requests" | "tips" | "feed" | "social" | "github" | "settings";

type ChatSession = { id: number; fanName: string; fanEmail: string; fanAvatarUrl?: string | null; freeUsed: number; lastMessageAt: string | null; createdAt: string; lastMessage?: { message: string; senderType: string } | null; unreadCount: number; };
type ChatMessage = { id: number; sessionId: number; senderType: "fan" | "hannah"; message: string; amountPaid: number; isRead: boolean; createdAt: string; };
type Call = { id: number; fanName: string; fanEmail: string; preferredDate: string; durationMinutes: number; amountPaid: number; status: string; notes: string | null; createdAt: string; };
type ContentRequest = { id: number; fanName: string; fanEmail: string; requestType: string; description: string; amountPaid: number; status: string; createdAt: string; };
type Tip = { id: number; fanName: string; fanEmail: string; amount: number; message: string | null; createdAt: string; };
type Post = { id: number; imageUrl: string; caption: string | null; platform: string; isPrivate: boolean; watermark: boolean; createdAt: string; };
type Stats = { totalMessages: number; totalCalls: number; totalRequests: number; totalTips: number; totalRevenue: number; };
type Activity = { type: "message" | "call" | "request" | "tip"; fanName: string; amount: number; detail: string; timestamp: string; };
type SocialConfig = { enabled: boolean; intervalHours: number; xHandle: string; tiktokHandle: string; hasXToken: boolean; hasRapidApiKey: boolean; };
type PlatformSettings = Record<string, string | number | boolean>;

// ── Utils ─────────────────────────────────────────────────────────────────
function parseAttachment(msg: string) {
  if (!msg.startsWith("[ATTACHMENT]")) return null;
  try { return JSON.parse(msg.slice("[ATTACHMENT]".length)) as { type: string; url: string; name: string; size: number }; } catch { return null; }
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    paid: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    free: "bg-zinc-500/20 text-zinc-300 border-zinc-500/30",
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
  if (p === "twitter" || p === "x") return <Twitter className={cls} />;
  if (p === "tiktok") return <Music2 className={cls} />;
  return <Globe className={cls} />;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ── GoldCard ─────────────────────────────────────────────────────────────
function GoldCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border ${className}`}
      style={{ background: "rgba(255,255,255,0.025)", borderColor: "rgba(201,168,76,0.1)" }}>
      {children}
    </div>
  );
}

// ── Fan Avatar ────────────────────────────────────────────────────────────
function FanAvatar({ session, size = "sm" }: { session: { fanName: string; fanAvatarUrl?: string | null }; size?: "sm" | "md" }) {
  const dim = size === "sm" ? "w-9 h-9 text-xs" : "w-12 h-12 text-sm";
  if (session.fanAvatarUrl) {
    const url = session.fanAvatarUrl.startsWith("http") ? session.fanAvatarUrl : `${BASE}${session.fanAvatarUrl}`;
    return <img src={url} alt={session.fanName} className={`${dim} rounded-full object-cover shrink-0`} />;
  }
  return (
    <div className={`${dim} rounded-full bg-gradient-to-br from-slate-600 to-slate-800 border border-white/10 flex items-center justify-center font-bold text-white shrink-0`}>
      {session.fanName.charAt(0).toUpperCase()}
    </div>
  );
}

// ── Hannah Avatar ─────────────────────────────────────────────────────────
function HannahAvatar({ size = "sm" }: { size?: "sm" | "md" }) {
  const dim = size === "sm" ? "w-9 h-9" : "w-12 h-12";
  return (
    <div className={`${dim} rounded-full shrink-0 flex items-center justify-center font-serif font-bold text-black shadow-lg`}
      style={{ background: GOLD_GRAD }}>
      HB
    </div>
  );
}

// ── Voice Recorder ────────────────────────────────────────────────────────
function VoiceRecorder({ onRecorded, disabled }: { onRecorded: (blob: Blob) => void; disabled: boolean }) {
  const [recording, setRecording] = useState(false);
  const [secs, setSecs] = useState(0);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => { onRecorded(new Blob(chunksRef.current, { type: "audio/webm" })); stream.getTracks().forEach((t) => t.stop()); };
      mr.start();
      mediaRef.current = mr;
      setRecording(true); setSecs(0);
      timerRef.current = setInterval(() => setSecs((s) => s + 1), 1000);
    } catch { alert("Microphone permission required."); }
  };

  const stop = () => {
    mediaRef.current?.stop();
    if (timerRef.current) clearInterval(timerRef.current);
    setRecording(false);
  };

  if (recording) {
    return (
      <button onClick={stop} className="flex items-center gap-2 h-11 px-4 rounded-2xl font-semibold text-sm animate-pulse"
        style={{ background: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.4)" }}>
        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        <span className="font-mono text-red-400 text-xs">{formatDuration(secs)}</span>
        <span className="text-red-400 text-xs">Stop</span>
      </button>
    );
  }

  return (
    <button onClick={start} disabled={disabled}
      className="w-11 h-11 rounded-2xl flex items-center justify-center transition-all shrink-0 hover:bg-white/10 disabled:opacity-30"
      style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)" }}>
      <Mic className="w-5 h-5" />
    </button>
  );
}

// ── Voice Player ──────────────────────────────────────────────────────────
function VoicePlayer({ url, isHannah }: { url: string; isHannah: boolean }) {
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fullUrl = url.startsWith("http") ? url : `${BASE}${url}`;

  useEffect(() => {
    const audio = new Audio(fullUrl);
    audioRef.current = audio;
    audio.onloadedmetadata = () => setDuration(Math.floor(audio.duration));
    audio.ontimeupdate = () => setCurrent(Math.floor(audio.currentTime));
    audio.onended = () => { setPlaying(false); setCurrent(0); };
    return () => { audio.pause(); };
  }, [fullUrl]);

  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) { audioRef.current.pause(); setPlaying(false); }
    else { audioRef.current.play(); setPlaying(true); }
  };

  const pct = duration ? (current / duration) * 100 : 0;

  return (
    <div className="flex items-center gap-3 min-w-[170px]">
      <button onClick={toggle}
        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all ${isHannah ? "text-black" : "text-white bg-white/20"}`}
        style={isHannah ? { background: GOLD_GRAD } : {}}>
        {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
      </button>
      <div className="flex-1 flex flex-col gap-1">
        <div className={`h-1 rounded-full ${isHannah ? "bg-black/15" : "bg-white/20"}`}>
          <div className={`h-full rounded-full ${isHannah ? "bg-black/50" : "bg-white/70"}`} style={{ width: `${pct}%`, transition: "width 0.5s linear" }} />
        </div>
        <span className={`text-[10px] font-mono ${isHannah ? "text-black/50" : "text-white/50"}`}>{formatDuration(playing ? current : duration)}</span>
      </div>
      <div className="flex items-center gap-0.5 opacity-30">
        {[...Array(10)].map((_, i) => (
          <div key={i} className={`w-0.5 rounded-full ${isHannah ? "bg-black" : "bg-white"}`}
            style={{ height: `${4 + Math.sin(i) * 8 + 6}px` }} />
        ))}
      </div>
    </div>
  );
}

// ── Chat Bubble ───────────────────────────────────────────────────────────
function ChatBubble({ msg, session }: { msg: ChatMessage; session: ChatSession }) {
  const isHannah = msg.senderType === "hannah";
  const att = parseAttachment(msg.message);
  const time = new Date(msg.createdAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  const fullUrl = att?.url ? (att.url.startsWith("http") ? att.url : `${BASE}${att.url}`) : "";

  return (
    <div className={`flex items-end gap-2 mb-2 ${isHannah ? "justify-end" : "justify-start"}`}>
      {!isHannah && <FanAvatar session={session} size="sm" />}
      <div className={`max-w-[72%] flex flex-col gap-0.5 ${isHannah ? "items-end" : "items-start"}`}>
        {!isHannah && <span className="text-[11px] text-white/30 ml-1">{session.fanName}</span>}
        {isHannah && <span className="text-[11px] mr-1 font-semibold" style={{ color: GOLD }}>You (Hannah) ✨</span>}
        <div className={`rounded-2xl overflow-hidden shadow-md ${isHannah ? "rounded-br-sm" : "rounded-bl-sm"}`}
          style={isHannah
            ? { background: GOLD_GRAD, color: "#000" }
            : { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", color: "#fff" }}>
          {att ? (
            <div className="px-2 py-2">
              {att.type === "voice" && <VoicePlayer url={att.url} isHannah={isHannah} />}
              {att.type === "image" && <a href={fullUrl} target="_blank" rel="noreferrer"><img src={fullUrl} alt="" className="max-w-[200px] rounded-xl" /></a>}
              {att.type === "file" && (
                <a href={fullUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-2">
                  <Paperclip className="w-4 h-4 shrink-0" />
                  <div><p className="text-sm font-medium truncate max-w-[140px]">{att.name}</p><p className="text-[10px] opacity-50">{Math.round(att.size / 1024)}KB</p></div>
                </a>
              )}
            </div>
          ) : (
            <p className="px-4 py-3 text-sm leading-relaxed">{msg.message}</p>
          )}
        </div>
        <div className={`flex items-center gap-1 text-[10px] text-white/25 ${isHannah ? "mr-1 flex-row-reverse" : "ml-1"}`}>
          <span>{time}</span>
          {isHannah && <CheckCheck className="w-3 h-3" style={{ color: msg.isRead ? GOLD : "rgba(255,255,255,0.2)" }} />}
        </div>
      </div>
      {isHannah && <HannahAvatar size="sm" />}
    </div>
  );
}

// ── Main Admin Component ─────────────────────────────────────────────────
export default function Admin() {
  const { toast } = useToast();
  const [authed, setAuthed] = useState(() => !!sessionStorage.getItem("hb_admin_key"));
  const [adminKey, setAdminKey] = useState(() => sessionStorage.getItem("hb_admin_key") || "");
  const [pwInput, setPwInput] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [tab, setTab] = useState<Tab>("dashboard");

  // Data
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatReply, setChatReply] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [showChatList, setShowChatList] = useState(true);
  const [calls, setCalls] = useState<Call[]>([]);
  const [requests, setRequests] = useState<ContentRequest[]>([]);
  const [tips, setTips] = useState<Tip[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [newPost, setNewPost] = useState({ imageUrl: "", caption: "", platform: "instagram", isPrivate: false });
  const [addingPost, setAddingPost] = useState(false);
  const [socialConfig, setSocialConfig] = useState<SocialConfig | null>(null);
  const [syncingX, setSyncingX] = useState(false);
  const [syncingTikTok, setSyncingTikTok] = useState(false);
  const [syncingAll, setSyncingAll] = useState(false);
  const [xHandleInput, setXHandleInput] = useState("");
  const [tiktokHandleInput, setTiktokHandleInput] = useState("");
  const [syncIntervalInput, setSyncIntervalInput] = useState("6");
  const [lastSyncResult, setLastSyncResult] = useState<Record<string, unknown> | null>(null);
  const [githubPushing, setGithubPushing] = useState(false);
  const [githubResult, setGithubResult] = useState<{ success?: boolean; error?: string } | null>(null);
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>({});
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [rawSecrets, setRawSecrets] = useState<Record<string, string>>({});

  const chatScrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const esRef = useRef<EventSource | null>(null);
  const chatPollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const h = { "x-admin-key": adminKey };

  // ── Data fetching ──────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    const [sessRes, callRes, reqRes, tipRes, postRes, statRes] = await Promise.all([
      fetch(`${API}/chat/admin/sessions`, { headers: h }),
      fetch(`${API}/calls`, { headers: h }),
      fetch(`${API}/requests`, { headers: h }),
      fetch(`${API}/tips`, { headers: h }),
      fetch(`${API}/posts`, { headers: h }),
      fetch(`${API}/stats`, { headers: h }),
    ]);
    if (sessRes.ok) { const data = await sessRes.json(); setChatSessions(data); }
    if (callRes.ok) setCalls(await callRes.json());
    if (reqRes.ok) setRequests(await reqRes.json());
    if (tipRes.ok) setTips(await tipRes.json());
    if (postRes.ok) setPosts(await postRes.json());
    if (statRes.ok) setStats(await statRes.json());
  }, [adminKey]);

  const fetchSocialConfig = useCallback(async () => {
    const res = await fetch(`${API}/social/sync/config`, { headers: h });
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
    const res = await fetch(`${API}/settings`, { headers: h });
    if (res.ok) {
      const data = await res.json();
      setRawSecrets(data._raw || {});
      const { _raw, ...safe } = data;
      setPlatformSettings(safe);
    }
    setSettingsLoading(false);
  }, [adminKey]);

  const fetchChatMessages = useCallback(async (session: ChatSession) => {
    const res = await fetch(`${API}/chat/admin/${session.id}/messages`, { headers: h });
    if (res.ok) {
      const data = await res.json();
      setChatMessages(data.messages);
      setTimeout(() => {
        if (chatScrollRef.current) chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
      }, 80);
    }
  }, [adminKey]);

  const saveSettings = async (patch: PlatformSettings) => {
    setSettingsSaving(true);
    const res = await fetch(`${API}/settings`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...h },
      body: JSON.stringify(patch),
    });
    if (res.ok) { toast({ title: "✓ Settings saved" }); await fetchSettings(); }
    else toast({ title: "Save failed", variant: "destructive" });
    setSettingsSaving(false);
  };

  const login = async () => {
    const res = await fetch(`${API}/admin/auth`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pwInput }),
    });
    const data = await res.json();
    if (data.authorized) {
      sessionStorage.setItem("hb_admin_key", data.key);
      setAdminKey(data.key); setAuthed(true);
    } else toast({ title: "Incorrect password", variant: "destructive" });
  };

  useEffect(() => {
    if (!authed) return;
    fetchAll(); fetchSocialConfig(); fetchSettings();
  }, [authed, fetchAll, fetchSocialConfig, fetchSettings]);

  // SSE activity
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

  // Poll chat messages when a session is selected
  useEffect(() => {
    if (!selectedSession) { if (chatPollRef.current) clearInterval(chatPollRef.current); return; }
    fetchChatMessages(selectedSession);
    chatPollRef.current = setInterval(() => fetchChatMessages(selectedSession), 4000);
    return () => { if (chatPollRef.current) clearInterval(chatPollRef.current); };
  }, [selectedSession?.id, fetchChatMessages]);

  const selectSession = (s: ChatSession) => {
    setSelectedSession(s);
    setShowChatList(false);
    setChatMessages([]);
  };

  const sendReply = async () => {
    if (!chatReply.trim() || !selectedSession) return;
    setSendingReply(true);
    const res = await fetch(`${API}/chat/admin/${selectedSession.id}/reply`, {
      method: "POST", headers: { "Content-Type": "application/json", ...h },
      body: JSON.stringify({ message: chatReply }),
    });
    if (res.ok) {
      const msg = await res.json();
      setChatMessages((prev) => [...prev, msg]);
      setChatReply("");
      setTimeout(() => { if (chatScrollRef.current) chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight; }, 80);
      fetchAll();
    } else toast({ title: "Failed to send", variant: "destructive" });
    setSendingReply(false);
  };

  const sendVoiceReply = async (blob: Blob) => {
    if (!selectedSession) return;
    const fd = new FormData();
    fd.append("file", new File([blob], `voice-${Date.now()}.webm`, { type: "audio/webm" }));
    setSendingReply(true);
    const res = await fetch(`${API}/chat/admin/${selectedSession.id}/reply-media`, { method: "POST", headers: h, body: fd });
    if (res.ok) {
      const msg = await res.json();
      setChatMessages((prev) => [...prev, msg]);
      setTimeout(() => { if (chatScrollRef.current) chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight; }, 80);
    }
    setSendingReply(false);
  };

  const sendFileReply = async (file: File) => {
    if (!selectedSession) return;
    const fd = new FormData();
    fd.append("file", file);
    setSendingReply(true);
    const res = await fetch(`${API}/chat/admin/${selectedSession.id}/reply-media`, { method: "POST", headers: h, body: fd });
    if (res.ok) {
      const msg = await res.json();
      setChatMessages((prev) => [...prev, msg]);
      setTimeout(() => { if (chatScrollRef.current) chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight; }, 80);
    }
    setSendingReply(false);
  };

  const updateCallStatus = async (id: number, status: string) => {
    await fetch(`${API}/calls/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json", ...h }, body: JSON.stringify({ status }) });
    fetchAll();
  };

  const deletePost = async (id: number) => {
    await fetch(`${API}/posts/${id}`, { method: "DELETE", headers: h });
    fetchAll();
  };

  const addPost = async () => {
    if (!newPost.imageUrl) return;
    setAddingPost(true);
    await fetch(`${API}/posts`, { method: "POST", headers: { "Content-Type": "application/json", ...h }, body: JSON.stringify({ ...newPost, watermark: false }) });
    setNewPost({ imageUrl: "", caption: "", platform: "instagram", isPrivate: false });
    setAddingPost(false);
    toast({ title: "Published to feed!" });
    fetchAll();
  };

  const saveSocialConfig = async () => {
    const res = await fetch(`${API}/social/sync/config`, {
      method: "PATCH", headers: { "Content-Type": "application/json", ...h },
      body: JSON.stringify({ xHandle: xHandleInput, tiktokHandle: tiktokHandleInput, intervalHours: parseInt(syncIntervalInput, 10) || 6 }),
    });
    if (res.ok) { setSocialConfig(await res.json()); toast({ title: "Social settings saved!" }); }
  };

  const toggleAutoSync = async () => {
    const res = await fetch(`${API}/social/sync/config`, {
      method: "PATCH", headers: { "Content-Type": "application/json", ...h },
      body: JSON.stringify({ enabled: !socialConfig?.enabled }),
    });
    if (res.ok) { const cfg = await res.json() as SocialConfig; setSocialConfig(cfg); toast({ title: cfg.enabled ? "Auto-sync ON 🟢" : "Auto-sync OFF" }); }
  };

  const syncPlatform = async (platform: "x" | "tiktok" | "all") => {
    if (platform === "x") setSyncingX(true);
    else if (platform === "tiktok") setSyncingTikTok(true);
    else setSyncingAll(true);
    const handle = platform === "x" ? xHandleInput : platform === "tiktok" ? tiktokHandleInput : undefined;
    const endpoint = platform === "all" ? "/social/sync/all" : `/social/sync/${platform}`;
    try {
      const res = await fetch(`${API}${endpoint}`, { method: "POST", headers: { "Content-Type": "application/json", ...h }, body: JSON.stringify(handle ? { handle } : {}) });
      const data = await res.json();
      setLastSyncResult(data as Record<string, unknown>);
      if (res.ok) {
        const synced = typeof data.synced === "number" ? data.synced : ((data.x?.synced ?? 0) + (data.tiktok?.synced ?? 0));
        toast({ title: `Synced ${synced} new post${synced !== 1 ? "s" : ""}!` });
        fetchAll();
      } else toast({ title: "Sync failed", description: data.error, variant: "destructive" });
    } catch { toast({ title: "Network error", variant: "destructive" }); }
    if (platform === "x") setSyncingX(false);
    else if (platform === "tiktok") setSyncingTikTok(false);
    else setSyncingAll(false);
  };

  const pushToGitHub = async () => {
    setGithubPushing(true); setGithubResult(null);
    try {
      const res = await fetch(`${API}/social/github/push`, { method: "POST", headers: h });
      const data = await res.json();
      setGithubResult(data);
      if (res.ok && data.success) toast({ title: "✓ Pushed to GitHub!" });
      else toast({ title: "Push failed", description: data.error, variant: "destructive" });
    } catch { toast({ title: "Network error", variant: "destructive" }); }
    setGithubPushing(false);
  };

  const enableNotifications = async () => {
    const perm = await Notification.requestPermission();
    setNotifEnabled(perm === "granted");
    toast({ title: perm === "granted" ? "Notifications enabled" : "Permission denied" });
  };

  const logout = () => { sessionStorage.removeItem("hb_admin_key"); setAuthed(false); setAdminKey(""); };

  // ── LOGIN ─────────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
        style={{ background: "radial-gradient(ellipse at top,#1a1000 0%,#060606 70%)" }}>
        {/* Decorative circles */}
        <div className="absolute w-[500px] h-[500px] rounded-full opacity-5 blur-3xl pointer-events-none"
          style={{ background: GOLD_GRAD, top: "-200px", left: "50%", transform: "translateX(-50%)" }} />
        <div className="w-full max-w-[360px] relative z-10">
          <div className="text-center mb-10">
            <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center font-serif font-bold text-3xl text-black shadow-2xl"
              style={{ background: GOLD_GRAD, boxShadow: "0 8px 40px rgba(201,168,76,0.4)" }}>HB</div>
            <h1 className="text-3xl font-serif font-bold text-white">Creator Portal</h1>
            <p className="text-white/25 mt-2 text-sm tracking-[0.2em] uppercase">Hannah Brooks · Private</p>
          </div>
          <div className="rounded-3xl p-7 space-y-4 backdrop-blur-xl"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,168,76,0.15)" }}>
            <div className="relative">
              <Input type={showPw ? "text" : "password"} placeholder="Enter your password" value={pwInput}
                onChange={(e) => setPwInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && login()}
                className="bg-black/60 border-white/10 text-white h-13 rounded-xl placeholder:text-white/20 pr-12 h-12" />
              <button onClick={() => setShowPw(s => !s)} className="absolute right-3 top-3 text-white/30 hover:text-white transition-colors">
                {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <button onClick={login}
              className="w-full h-13 rounded-xl font-bold text-black tracking-wider transition-all active:scale-98 h-12 text-sm"
              style={{ background: GOLD_GRAD, boxShadow: "0 4px 20px rgba(201,168,76,0.3)" }}>
              Sign In to Portal
            </button>
          </div>
          <p className="text-center text-white/15 text-xs mt-8 tracking-wider">PROTECTED · NOT FOR PUBLIC ACCESS</p>
        </div>
      </div>
    );
  }

  const unreadChats = chatSessions.reduce((a, s) => a + (s.unreadCount || 0), 0);
  const pendingCalls = calls.filter(c => c.status === "pending").length;
  const pendingReqs = requests.filter(r => r.status === "pending").length;

  const tabs: { id: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-[18px] h-[18px]" /> },
    { id: "chat", label: "Messages", icon: <MessageSquare className="w-[18px] h-[18px]" />, count: unreadChats },
    { id: "calls", label: "Calls", icon: <Phone className="w-[18px] h-[18px]" />, count: pendingCalls },
    { id: "requests", label: "Requests", icon: <Sparkles className="w-[18px] h-[18px]" />, count: pendingReqs },
    { id: "tips", label: "Tips", icon: <Gift className="w-[18px] h-[18px]" /> },
    { id: "feed", label: "Feed", icon: <ImagePlus className="w-[18px] h-[18px]" /> },
    { id: "social", label: "Social", icon: <Zap className="w-[18px] h-[18px]" /> },
    { id: "github", label: "GitHub", icon: <Github className="w-[18px] h-[18px]" /> },
    { id: "settings", label: "Settings", icon: <Settings className="w-[18px] h-[18px]" /> },
  ];

  return (
    <div className="min-h-screen text-white" style={{ background: "#070706" }}>
      {/* ── Top Bar ──────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 border-b backdrop-blur-xl"
        style={{ borderColor: "rgba(201,168,76,0.1)", background: "rgba(7,7,6,0.95)" }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center font-serif font-bold text-black text-sm"
            style={{ background: GOLD_GRAD }}>HB</div>
          <div>
            <span className="font-serif font-bold text-base text-white">Hannah Brooks</span>
            <span className="ml-2 text-xs font-medium px-2 py-0.5 rounded-full border"
              style={{ color: GOLD, borderColor: "rgba(201,168,76,0.3)", background: "rgba(201,168,76,0.08)" }}>
              Creator Portal
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {activity.length > 0 && (
            <div className="relative">
              <div className="w-2 h-2 rounded-full animate-pulse absolute -top-0.5 -right-0.5" style={{ background: GOLD }} />
            </div>
          )}
          <button onClick={enableNotifications} className="p-2 rounded-xl text-white/30 hover:text-white transition-colors hover:bg-white/5">
            {notifEnabled ? <Bell className="w-4 h-4" style={{ color: GOLD }} /> : <BellOff className="w-4 h-4" />}
          </button>
          <button onClick={fetchAll} className="p-2 rounded-xl text-white/30 hover:text-white transition-colors hover:bg-white/5">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={logout} className="p-2 rounded-xl text-white/30 hover:text-white transition-colors hover:bg-white/5">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="flex" style={{ minHeight: "calc(100vh - 57px)" }}>
        {/* ── Desktop Sidebar ───────────────────────────────────────── */}
        <aside className="hidden md:flex flex-col w-56 shrink-0 border-r p-3 sticky top-[57px] h-[calc(100vh-57px)] overflow-y-auto"
          style={{ borderColor: "rgba(201,168,76,0.08)", background: "rgba(0,0,0,0.5)" }}>
          <nav className="space-y-0.5 flex-1">
            {tabs.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={tab === t.id
                  ? { color: GOLD, background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.2)" }
                  : { color: "rgba(255,255,255,0.35)", border: "1px solid transparent" }}>
                <span className="flex items-center gap-2.5">{t.icon}{t.label}</span>
                {t.count !== undefined && t.count > 0 && (
                  <span className="text-[10px] rounded-full px-1.5 py-0.5 min-w-[18px] text-center text-black font-bold"
                    style={{ background: GOLD }}>{t.count}</span>
                )}
              </button>
            ))}
          </nav>

          {/* Live Activity */}
          {activity.length > 0 && (
            <div className="mt-4 pt-4 border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
              <p className="text-[10px] font-bold text-white/20 px-3 mb-2 uppercase tracking-widest">Live</p>
              <div className="space-y-1.5">
                {activity.slice(0, 5).map((a, i) => (
                  <div key={i} className="px-3 py-2 rounded-xl text-xs" style={{ background: "rgba(255,255,255,0.04)" }}>
                    <div className="flex items-center gap-1 text-white/60 mb-0.5">
                      <span>{a.type === "message" ? "💬" : a.type === "call" ? "📹" : a.type === "tip" ? "💝" : "✨"}</span>
                      <span className="font-medium truncate">{a.fanName}</span>
                    </div>
                    {a.amount > 0 && <div className="font-bold text-xs" style={{ color: GOLD }}>${a.amount}</div>}
                    <div className="text-white/25">{timeAgo(a.timestamp)} ago</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* ── Main Content ──────────────────────────────────────────── */}
        <main className="flex-1 overflow-x-hidden pb-20 md:pb-6">
          {/* Mobile tab scroll */}
          <div className="flex gap-2 px-4 pt-4 pb-2 overflow-x-auto md:hidden" style={{ scrollbarWidth: "none" }}>
            {tabs.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all border"
                style={tab === t.id
                  ? { color: GOLD, background: "rgba(201,168,76,0.1)", borderColor: "rgba(201,168,76,0.25)" }
                  : { color: "rgba(255,255,255,0.35)", borderColor: "rgba(255,255,255,0.08)" }}>
                {t.icon}{t.label}
                {t.count !== undefined && t.count > 0 && (
                  <span className="rounded-full px-1.5 text-black text-[10px] font-bold" style={{ background: GOLD }}>{t.count}</span>
                )}
              </button>
            ))}
          </div>

          <div className="px-4 md:px-6 py-4 md:py-6">

            {/* ─── DASHBOARD ──────────────────────────────────────── */}
            {tab === "dashboard" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-serif font-bold text-white">Dashboard</h2>
                  <span className="text-white/25 text-sm">{new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}</span>
                </div>

                {/* Stats */}
                {stats && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    {[
                      { label: "Revenue", value: `$${stats.totalRevenue.toFixed(2)}`, icon: <DollarSign className="w-5 h-5" />, color: GOLD },
                      { label: "Messages", value: chatSessions.length, icon: <MessageSquare className="w-5 h-5" />, color: "#f472b6" },
                      { label: "Calls", value: stats.totalCalls, icon: <Phone className="w-5 h-5" />, color: "#60a5fa" },
                      { label: "Requests", value: stats.totalRequests, icon: <Sparkles className="w-5 h-5" />, color: "#c084fc" },
                      { label: "Tips", value: stats.totalTips, icon: <Gift className="w-5 h-5" />, color: "#34d399" },
                    ].map((s) => (
                      <GoldCard key={s.label} className="p-5">
                        <div style={{ color: s.color }} className="mb-3">{s.icon}</div>
                        <div className="text-2xl font-bold text-white">{s.value}</div>
                        <div className="text-[11px] text-white/25 mt-1 uppercase tracking-widest">{s.label}</div>
                      </GoldCard>
                    ))}
                  </div>
                )}

                {/* Quick actions */}
                <div className="grid sm:grid-cols-3 gap-4">
                  {[
                    { id: "chat" as Tab, icon: <MessageSquare />, title: "Fan Messages", desc: `${unreadChats} unread · Reply personally`, color: GOLD },
                    { id: "social" as Tab, icon: <Zap />, title: "Social Sync", desc: "Import from TikTok & X", color: "#60a5fa" },
                    { id: "github" as Tab, icon: <Github />, title: "Push to GitHub", desc: "Backup your site now", color: "#c084fc" },
                  ].map((s) => (
                    <button key={s.id} onClick={() => setTab(s.id)}
                      className="text-left rounded-2xl p-5 transition-all hover:scale-[1.01] active:scale-[0.99] border"
                      style={{ background: "rgba(255,255,255,0.025)", borderColor: `${s.color}20` }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                        style={{ background: `${s.color}15`, color: s.color }}>{s.icon}</div>
                      <div className="font-semibold text-white text-sm">{s.title}</div>
                      <div className="text-xs text-white/35 mt-1">{s.desc}</div>
                    </button>
                  ))}
                </div>

                {/* Pending calls */}
                {calls.filter(c => c.status === "pending").length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-white/25 uppercase tracking-widest mb-3">Pending Calls</h3>
                    <div className="space-y-3">
                      {calls.filter(c => c.status === "pending").slice(0, 3).map((c) => (
                        <GoldCard key={c.id} className="p-4 flex items-center justify-between gap-4">
                          <div>
                            <div className="font-semibold text-white text-sm">{c.fanName} — {c.durationMinutes}min</div>
                            <div className="text-xs text-white/30">{new Date(c.preferredDate).toLocaleString()}</div>
                          </div>
                          <button onClick={() => updateCallStatus(c.id, "confirmed")}
                            className="text-xs font-bold px-3 py-1.5 rounded-lg text-white border border-green-500/30 bg-green-500/10 hover:bg-green-500/20 transition-colors">
                            Confirm
                          </button>
                        </GoldCard>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ─── CHAT (WhatsApp-like) ──────────────────────────── */}
            {tab === "chat" && (
              <div className="flex gap-0 h-[calc(100vh-160px)] rounded-2xl overflow-hidden border" style={{ borderColor: "rgba(201,168,76,0.12)" }}>
                {/* Session list */}
                <div className={`flex flex-col ${showChatList || !selectedSession ? "flex" : "hidden"} md:flex w-full md:w-72 lg:w-80 border-r shrink-0`}
                  style={{ borderColor: "rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.6)" }}>
                  <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                    <h2 className="text-base font-bold text-white">Fan Chats</h2>
                    <span className="text-xs text-white/30">{chatSessions.length} conversations</span>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {chatSessions.length === 0 && (
                      <div className="flex flex-col items-center justify-center h-full text-center p-6">
                        <MessageSquare className="w-8 h-8 text-white/15 mb-3" />
                        <p className="text-white/25 text-sm">No fan conversations yet</p>
                      </div>
                    )}
                    {chatSessions.map((s) => {
                      const lastMsg = s.lastMessage?.message || "";
                      const att = parseAttachment(lastMsg);
                      const preview = att ? `📎 ${att.type === "voice" ? "Voice note" : att.name}` : lastMsg.slice(0, 50);
                      const isSelected = selectedSession?.id === s.id;

                      return (
                        <button key={s.id} onClick={() => selectSession(s)}
                          className="w-full flex items-center gap-3 px-4 py-3 border-b text-left transition-all"
                          style={{
                            borderColor: "rgba(255,255,255,0.04)",
                            background: isSelected ? "rgba(201,168,76,0.08)" : "transparent",
                          }}>
                          <div className="relative shrink-0">
                            <FanAvatar session={s} size="sm" />
                            {s.unreadCount > 0 && (
                              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-black"
                                style={{ background: GOLD }}>{s.unreadCount}</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-white text-sm truncate">{s.fanName}</span>
                              {s.lastMessageAt && <span className="text-[10px] text-white/25 shrink-0">{timeAgo(s.lastMessageAt)}</span>}
                            </div>
                            <p className="text-xs text-white/35 truncate mt-0.5">
                              {s.lastMessage?.senderType === "hannah" ? "You: " : ""}{preview || "No messages yet"}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Chat window */}
                {selectedSession ? (
                  <div className={`flex flex-col flex-1 ${!showChatList ? "flex" : "hidden md:flex"}`}
                    style={{ background: "radial-gradient(ellipse at top,#0e0a00 0%,#070706 60%)" }}>
                    {/* Chat header */}
                    <div className="flex items-center gap-3 px-4 py-3 border-b backdrop-blur-xl"
                      style={{ borderColor: "rgba(201,168,76,0.1)", background: "rgba(7,7,6,0.9)" }}>
                      <button onClick={() => setShowChatList(true)} className="md:hidden p-1 text-white/40 hover:text-white">
                        <ArrowLeft className="w-5 h-5" />
                      </button>
                      <FanAvatar session={selectedSession} size="sm" />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-white text-sm">{selectedSession.fanName}</div>
                        <div className="text-xs text-white/30">{selectedSession.fanEmail}</div>
                      </div>
                      <div className="text-xs px-2 py-1 rounded-full border" style={{ color: GOLD, borderColor: "rgba(201,168,76,0.2)", background: "rgba(201,168,76,0.08)" }}>
                        {selectedSession.freeUsed} msgs sent
                      </div>
                    </div>

                    {/* Messages */}
                    <div ref={chatScrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
                      {chatMessages.length === 0 && (
                        <div className="flex items-center justify-center h-full text-white/20 text-sm">No messages yet</div>
                      )}
                      {chatMessages.map((msg) => (
                        <ChatBubble key={msg.id} msg={msg} session={selectedSession} />
                      ))}
                    </div>

                    {/* Reply input */}
                    <div className="flex-shrink-0 border-t px-3 py-3" style={{ borderColor: "rgba(255,255,255,0.05)", background: "rgba(7,7,6,0.95)" }}>
                      <input ref={fileInputRef as any} type="file" className="hidden"
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) sendFileReply(f); (e.target as HTMLInputElement).value = ""; }} />
                      <div className="flex items-end gap-2">
                        <button onClick={() => (fileInputRef.current as HTMLInputElement)?.click()} disabled={sendingReply}
                          className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 hover:bg-white/10 disabled:opacity-30 transition-colors"
                          style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)" }}>
                          <Paperclip className="w-5 h-5" />
                        </button>
                        <div className="flex-1 rounded-2xl border overflow-hidden focus-within:border-[rgba(201,168,76,0.3)] transition-colors"
                          style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
                          <textarea value={chatReply} onChange={(e) => setChatReply(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
                            placeholder={`Reply to ${selectedSession.fanName}…`} rows={1}
                            className="w-full bg-transparent text-white text-sm px-4 py-3 resize-none outline-none placeholder:text-white/20 max-h-[120px]"
                            style={{ fieldSizing: "content" } as React.CSSProperties} />
                        </div>
                        <VoiceRecorder onRecorded={sendVoiceReply} disabled={sendingReply} />
                        {chatReply.trim() && (
                          <button onClick={sendReply} disabled={sendingReply}
                            className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-all active:scale-95"
                            style={{ background: GOLD_GRAD, boxShadow: "0 4px 15px rgba(201,168,76,0.35)" }}>
                            {sendingReply ? <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <Send className="w-4 h-4 text-black" />}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="hidden md:flex flex-1 items-center justify-center flex-col gap-3 text-white/20">
                    <MessageSquare className="w-12 h-12" />
                    <p>Select a conversation to start replying</p>
                  </div>
                )}
              </div>
            )}

            {/* ─── CALLS ──────────────────────────────────────────── */}
            {tab === "calls" && (
              <div className="space-y-4">
                <h2 className="text-2xl font-serif font-bold text-white">Call Bookings <span className="text-white/25 font-normal text-lg ml-1">({calls.length})</span></h2>
                {calls.map((c) => (
                  <GoldCard key={c.id} className="p-5">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-white">{c.fanName}</span>
                          <span className={statusBadge(c.status)}>{c.status}</span>
                          <span className="font-bold text-sm" style={{ color: GOLD }}>${c.amountPaid}</span>
                        </div>
                        <div className="text-xs text-white/30 mt-1">{c.fanEmail} · {timeAgo(c.createdAt)} ago</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="rounded-xl p-3" style={{ background: "rgba(0,0,0,0.3)" }}>
                        <div className="text-xs text-white/30 mb-1">Duration</div>
                        <div className="text-white font-semibold">{c.durationMinutes} minutes</div>
                      </div>
                      <div className="rounded-xl p-3" style={{ background: "rgba(0,0,0,0.3)" }}>
                        <div className="text-xs text-white/30 mb-1">Date</div>
                        <div className="text-white font-semibold text-sm">{new Date(c.preferredDate).toLocaleString()}</div>
                      </div>
                      {c.notes && (
                        <div className="col-span-2 rounded-xl p-3" style={{ background: "rgba(0,0,0,0.3)" }}>
                          <div className="text-xs text-white/30 mb-1">Notes</div>
                          <div className="text-white/80 text-sm">{c.notes}</div>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {c.status === "pending" && (
                        <button onClick={() => updateCallStatus(c.id, "confirmed")}
                          className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl text-white border border-green-500/30 bg-green-500/10 hover:bg-green-500/20 transition-colors">
                          <CheckCircle className="w-4 h-4" /> Confirm
                        </button>
                      )}
                      {c.status === "confirmed" && (
                        <button onClick={() => updateCallStatus(c.id, "completed")}
                          className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl text-white border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 transition-colors">
                          <CheckCircle className="w-4 h-4" /> Mark Completed
                        </button>
                      )}
                    </div>
                  </GoldCard>
                ))}
                {calls.length === 0 && <div className="text-center py-20 text-white/20 border border-white/5 rounded-2xl">No bookings yet</div>}
              </div>
            )}

            {/* ─── REQUESTS ───────────────────────────────────────── */}
            {tab === "requests" && (
              <div className="space-y-4">
                <h2 className="text-2xl font-serif font-bold text-white">Custom Requests <span className="text-white/25 font-normal text-lg ml-1">({requests.length})</span></h2>
                {requests.map((r) => (
                  <GoldCard key={r.id} className="p-5">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-white">{r.fanName}</span>
                          <span className={statusBadge(r.status)}>{r.status}</span>
                          <span className="font-bold text-sm" style={{ color: GOLD }}>${r.amountPaid}</span>
                        </div>
                        <div className="text-xs text-white/30 mt-1">{r.fanEmail} · {timeAgo(r.createdAt)} ago</div>
                      </div>
                    </div>
                    <div className="rounded-xl p-4" style={{ background: "rgba(0,0,0,0.4)" }}>
                      <div className="text-[10px] text-white/30 mb-1 uppercase tracking-widest">Type: {r.requestType}</div>
                      <p className="text-white/80 text-sm leading-relaxed">{r.description}</p>
                    </div>
                  </GoldCard>
                ))}
                {requests.length === 0 && <div className="text-center py-20 text-white/20 border border-white/5 rounded-2xl">No requests yet</div>}
              </div>
            )}

            {/* ─── TIPS ───────────────────────────────────────────── */}
            {tab === "tips" && (
              <div className="space-y-4">
                <h2 className="text-2xl font-serif font-bold text-white">Tips & Gifts <span className="text-white/25 font-normal text-lg ml-1">({tips.length})</span></h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tips.map((t) => (
                    <GoldCard key={t.id} className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white/60 border border-white/10"
                          style={{ background: "rgba(255,255,255,0.05)" }}>
                          {t.fanName.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-2xl font-bold" style={{ color: GOLD }}>${t.amount}</span>
                      </div>
                      <div className="font-semibold text-white text-sm">{t.fanName}</div>
                      <div className="text-xs text-white/30 mb-2">{t.fanEmail} · {timeAgo(t.createdAt)} ago</div>
                      {t.message && <p className="text-sm text-white/50 italic border-t border-white/5 pt-2 mt-2">"{t.message}"</p>}
                    </GoldCard>
                  ))}
                </div>
                {tips.length === 0 && <div className="text-center py-20 text-white/20 border border-white/5 rounded-2xl">No tips yet</div>}
              </div>
            )}

            {/* ─── FEED ───────────────────────────────────────────── */}
            {tab === "feed" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-serif font-bold text-white">Feed Manager</h2>
                <GoldCard className="p-6">
                  <h3 className="font-bold text-white flex items-center gap-2 mb-5">
                    <ImagePlus className="w-5 h-5" style={{ color: GOLD }} /> Publish New Post
                  </h3>
                  <div className="space-y-4">
                    <Input placeholder="Paste image/video URL" value={newPost.imageUrl}
                      onChange={(e) => setNewPost((p) => ({ ...p, imageUrl: e.target.value }))}
                      className="bg-black/50 border-white/10 text-white rounded-xl placeholder:text-white/20" />
                    <Textarea placeholder="Caption (optional)" value={newPost.caption}
                      onChange={(e) => setNewPost((p) => ({ ...p, caption: e.target.value }))}
                      className="bg-black/50 border-white/10 text-white rounded-xl resize-none placeholder:text-white/20" />
                    <div className="flex gap-4 items-center flex-wrap">
                      <select value={newPost.platform} onChange={(e) => setNewPost((p) => ({ ...p, platform: e.target.value }))}
                        className="bg-black/60 border border-white/10 text-white rounded-xl px-3 py-2 text-sm">
                        <option value="instagram">Instagram</option>
                        <option value="twitter">X / Twitter</option>
                        <option value="tiktok">TikTok</option>
                        <option value="custom">Custom</option>
                      </select>
                      <label className="flex items-center gap-2 text-sm text-white/40 cursor-pointer">
                        <input type="checkbox" checked={newPost.isPrivate}
                          onChange={(e) => setNewPost((p) => ({ ...p, isPrivate: e.target.checked }))} className="rounded" />
                        <Lock className="w-3.5 h-3.5" /> VIP only
                      </label>
                    </div>
                    {newPost.imageUrl && (
                      <div className="w-28 h-28 rounded-xl overflow-hidden border border-white/10">
                        <img src={newPost.imageUrl} alt="preview" className="w-full h-full object-cover"
                          onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")} />
                      </div>
                    )}
                    <button onClick={addPost} disabled={addingPost || !newPost.imageUrl}
                      className="h-11 px-6 rounded-xl font-bold text-sm text-black disabled:opacity-40 transition-all"
                      style={{ background: GOLD_GRAD }}>
                      {addingPost ? "Publishing…" : "Publish to Feed"}
                    </button>
                  </div>
                </GoldCard>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {posts.map((p) => (
                    <div key={p.id} className="relative rounded-2xl overflow-hidden aspect-square group border border-white/5">
                      <img src={p.imageUrl} alt={p.caption || ""} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all" />
                      <div className="absolute top-2 left-2 flex items-center gap-1 text-white/80 text-xs bg-black/60 px-2 py-0.5 rounded-full backdrop-blur">
                        {platformIcon(p.platform)} {p.platform}
                      </div>
                      {p.isPrivate && <div className="absolute top-2 right-2 text-[10px] px-1.5 py-0.5 rounded-full font-bold text-black" style={{ background: GOLD }}>VIP</div>}
                      <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-200">
                        <button onClick={() => deletePost(p.id)}
                          className="w-full text-xs font-bold py-1.5 rounded-lg text-red-300 border border-red-500/30 bg-red-500/20 hover:bg-red-500/30 transition-colors">
                          <Trash2 className="w-3 h-3 inline mr-1" /> Remove
                        </button>
                      </div>
                    </div>
                  ))}
                  {posts.length === 0 && <div className="col-span-full text-center py-20 text-white/20 border border-white/5 rounded-2xl">No posts yet</div>}
                </div>
              </div>
            )}

            {/* ─── SOCIAL ─────────────────────────────────────────── */}
            {tab === "social" && (
              <div className="space-y-6 max-w-2xl">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-white">Social Sync</h2>
                  <p className="text-white/30 text-sm mt-1">Watermark-free import from TikTok & X, auto or manual.</p>
                </div>

                <GoldCard className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center border"
                        style={socialConfig?.enabled ? { background: "rgba(74,222,128,0.1)", borderColor: "rgba(74,222,128,0.3)" } : { background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }}>
                        <Zap className={`w-5 h-5 ${socialConfig?.enabled ? "text-green-400" : "text-white/30"}`} />
                      </div>
                      <div>
                        <div className="font-semibold text-white">Auto-Sync</div>
                        <div className="text-xs text-white/30">{socialConfig?.enabled ? `Running every ${socialConfig.intervalHours}h` : "Off"}</div>
                      </div>
                    </div>
                    <button onClick={toggleAutoSync} className="transition-colors">
                      {socialConfig?.enabled ? <ToggleRight className="w-8 h-8 text-green-400" /> : <ToggleLeft className="w-8 h-8 text-white/30" />}
                    </button>
                  </div>
                </GoldCard>

                <GoldCard className="p-5 space-y-4">
                  <h3 className="font-semibold text-white">Account Handles</h3>
                  <div>
                    <label className="text-xs text-white/30 mb-1.5 block">X / Twitter handle</label>
                    <Input placeholder="@hannahbrooksxx" value={xHandleInput} onChange={(e) => setXHandleInput(e.target.value)}
                      className="bg-black/50 border-white/10 text-white rounded-xl placeholder:text-white/20" />
                  </div>
                  <div>
                    <label className="text-xs text-white/30 mb-1.5 block">TikTok handle</label>
                    <Input placeholder="@hannahbrooksxxx" value={tiktokHandleInput} onChange={(e) => setTiktokHandleInput(e.target.value)}
                      className="bg-black/50 border-white/10 text-white rounded-xl placeholder:text-white/20" />
                  </div>
                  <div>
                    <label className="text-xs text-white/30 mb-1.5 block">Auto-sync every (hours)</label>
                    <Input type="number" min="1" max="24" value={syncIntervalInput} onChange={(e) => setSyncIntervalInput(e.target.value)}
                      className="bg-black/50 border-white/10 text-white rounded-xl w-28" />
                  </div>
                  <button onClick={saveSocialConfig} className="h-10 px-5 rounded-xl font-bold text-sm text-black" style={{ background: GOLD_GRAD }}>
                    Save Settings
                  </button>
                </GoldCard>

                <GoldCard className="p-5 space-y-4">
                  <h3 className="font-semibold text-white">Manual Sync</h3>
                  <div className="flex flex-wrap gap-3">
                    <button onClick={() => syncPlatform("x")} disabled={syncingX || syncingAll}
                      className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl border border-sky-500/30 text-sky-300 bg-sky-500/10 hover:bg-sky-500/20 disabled:opacity-40 transition-colors">
                      <Twitter className="w-4 h-4" />{syncingX ? "Syncing…" : "Sync X / Twitter"}
                    </button>
                    <button onClick={() => syncPlatform("tiktok")} disabled={syncingTikTok || syncingAll}
                      className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl border border-pink-500/30 text-pink-300 bg-pink-500/10 hover:bg-pink-500/20 disabled:opacity-40 transition-colors">
                      <Music2 className="w-4 h-4" />{syncingTikTok ? "Syncing…" : "Sync TikTok"}
                    </button>
                    <button onClick={() => syncPlatform("all")} disabled={syncingAll || syncingX || syncingTikTok}
                      className="flex items-center gap-2 text-sm font-bold px-4 py-2.5 rounded-xl text-black disabled:opacity-40" style={{ background: GOLD_GRAD }}>
                      <Zap className="w-4 h-4" />{syncingAll ? "Syncing…" : "Sync All"}
                    </button>
                  </div>
                  {lastSyncResult && (
                    <div className="rounded-xl p-4 text-xs font-mono text-white/40 overflow-x-auto" style={{ background: "rgba(0,0,0,0.4)" }}>
                      <pre>{JSON.stringify(lastSyncResult, null, 2)}</pre>
                    </div>
                  )}
                </GoldCard>
              </div>
            )}

            {/* ─── GITHUB ─────────────────────────────────────────── */}
            {tab === "github" && (
              <div className="space-y-6 max-w-2xl">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-white">Push to GitHub</h2>
                  <p className="text-white/30 text-sm mt-1">Your GITHUB_PERSONAL_ACCESS_TOKEN is auto-used to push to the repo.</p>
                </div>

                <GoldCard className="p-6 space-y-4">
                  <div className="rounded-xl p-4 border" style={{ background: "rgba(201,168,76,0.05)", borderColor: "rgba(201,168,76,0.15)" }}>
                    <p className="text-sm font-semibold" style={{ color: GOLD }}>🔑 Token detected</p>
                    <p className="text-xs text-white/40 mt-1">GITHUB_PERSONAL_ACCESS_TOKEN secret will be used to push to:<br />
                      <span className="text-white/60">github.com/daviddan-241/Hannah-brooks-love</span></p>
                  </div>
                  <button onClick={pushToGitHub} disabled={githubPushing}
                    className="flex items-center gap-2 h-12 px-6 rounded-xl font-bold text-sm border border-purple-500/30 text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 disabled:opacity-40 transition-colors">
                    <Github className="w-5 h-5" />{githubPushing ? "Pushing to GitHub…" : "Push to GitHub Now"}
                  </button>
                  {githubResult && (
                    <div className={`rounded-xl p-4 text-sm border ${githubResult.success ? "bg-green-500/5 border-green-500/20 text-green-400" : "bg-red-500/5 border-red-500/20 text-red-400"}`}>
                      {githubResult.success
                        ? <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Successfully pushed!</div>
                        : <div><div className="flex items-center gap-2 mb-1"><AlertCircle className="w-4 h-4" /> Push failed</div><p className="text-xs opacity-70">{githubResult.error}</p></div>}
                    </div>
                  )}
                </GoldCard>
              </div>
            )}

            {/* ─── SETTINGS ───────────────────────────────────────── */}
            {tab === "settings" && (
              <div className="space-y-6 max-w-3xl">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-white">Platform Settings</h2>
                  <p className="text-white/30 text-sm mt-1">Control all prices, API keys, and branding — no code changes needed.</p>
                </div>

                {settingsLoading ? (
                  <div className="text-center py-20 text-white/30">Loading settings…</div>
                ) : (
                  <>
                    <SettingsSection title="Payment — Flutterwave" icon={<CreditCard className="w-5 h-5" style={{ color: GOLD }} />}
                      desc="Get keys from dashboard.flutterwave.com">
                      <SF label="Public Key" hint="Starts with FLWPUBK_">
                        <Input defaultValue={String(platformSettings.flutterwavePublicKey || "")} onBlur={e => saveSettings({ flutterwavePublicKey: e.target.value })} placeholder="FLWPUBK_LIVE-..." className={IC} />
                      </SF>
                      <SF label="Secret Key" hint="Server-side only — never shared">
                        <SecretInput defaultValue={rawSecrets.flutterwaveSecretKey || ""} onSave={v => saveSettings({ flutterwaveSecretKey: v })} placeholder="FLWSECK_LIVE-..." />
                      </SF>
                      <SF label="Currency">
                        <Input defaultValue={String(platformSettings.currency || "USD")} onBlur={e => saveSettings({ currency: e.target.value })} placeholder="USD" className={IC} />
                      </SF>
                    </SettingsSection>

                    <SettingsSection title="Pricing" icon={<DollarSign className="w-5 h-5" style={{ color: GOLD }} />}
                      desc="All prices apply instantly to the public site.">
                      <div className="grid grid-cols-2 gap-4 py-4">
                        {[
                          { key: "msgPrice", label: "Message ($)" },
                          { key: "msgFreeLimit", label: "Free messages" },
                          { key: "subMonthly", label: "VIP Monthly ($)" },
                          { key: "subQuarterly", label: "VIP 3-Month ($)" },
                          { key: "subLifetime", label: "VIP Lifetime ($)" },
                          { key: "requestPrice", label: "Custom Request ($)" },
                          { key: "tipMin", label: "Min Tip ($)" },
                          { key: "callWa5", label: "WhatsApp 5min ($)" },
                          { key: "callZoom15", label: "Zoom 15min ($)" },
                          { key: "callZoom30", label: "Zoom 30min ($)" },
                          { key: "callPrivate60", label: "Private 1hr ($)" },
                        ].map(({ key, label }) => (
                          <div key={key}>
                            <label className="text-xs font-bold text-white/35 tracking-wider block mb-1.5">{label}</label>
                            <Input type="number" step="0.01" defaultValue={String(platformSettings[key] ?? "")}
                              onBlur={e => saveSettings({ [key]: parseFloat(e.target.value) || 0 })} className={IC} />
                          </div>
                        ))}
                      </div>
                    </SettingsSection>

                    <SettingsSection title="Social API Keys" icon={<Key className="w-5 h-5" style={{ color: GOLD }} />}
                      desc="Paste your API keys here. Applied immediately, no restart needed.">
                      <SF label="X / Twitter Bearer Token" hint="From developer.twitter.com">
                        <SecretInput defaultValue={rawSecrets.xBearerToken || ""} onSave={v => saveSettings({ xBearerToken: v })} placeholder="AAAA..." />
                      </SF>
                      <SF label="RapidAPI Key" hint="For TikTok sync — from rapidapi.com">
                        <SecretInput defaultValue={rawSecrets.rapidApiKey || ""} onSave={v => saveSettings({ rapidApiKey: v })} placeholder="Your RapidAPI key" />
                      </SF>
                      <SF label="GitHub Remote URL" hint="Optional override: https://TOKEN@github.com/user/repo.git">
                        <SecretInput defaultValue={rawSecrets.githubRemote || ""} onSave={v => saveSettings({ githubRemote: v })} placeholder="https://ghp_...@github.com/..." />
                      </SF>
                    </SettingsSection>

                    <SettingsSection title="Profile & Links" icon={<User className="w-5 h-5" style={{ color: GOLD }} />}
                      desc="Your public profile information shown on the homepage.">
                      <SF label="Bio">
                        <textarea defaultValue={String(platformSettings.creatorBio || "")}
                          onBlur={e => saveSettings({ creatorBio: e.target.value })} rows={3}
                          className="w-full bg-black border border-white/10 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-1 resize-none placeholder:text-white/20"
                          style={{ "--tw-ring-color": "rgba(201,168,76,0.3)" } as React.CSSProperties} />
                      </SF>
                      <SF label="Tagline">
                        <Input defaultValue={String(platformSettings.creatorTagline || "")} onBlur={e => saveSettings({ creatorTagline: e.target.value })} className={IC} />
                      </SF>
                      <SF label="WhatsApp Number">
                        <Input defaultValue={String(platformSettings.whatsappNumber || "")} onBlur={e => saveSettings({ whatsappNumber: e.target.value })} placeholder="447700000000" className={IC} />
                      </SF>
                      {["instagramUrl", "twitterUrl", "tiktokUrl", "onlyfansUrl"].map(key => (
                        <SF key={key} label={key.replace("Url", "").replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase()) + " URL"}>
                          <Input defaultValue={String(platformSettings[key] || "")} onBlur={e => saveSettings({ [key]: e.target.value })} className={IC} />
                        </SF>
                      ))}
                    </SettingsSection>

                    <SettingsSection title="Security" icon={<Lock className="w-5 h-5" style={{ color: GOLD }} />}
                      desc="Change your admin portal password. You'll be logged out after saving.">
                      <SF label="Admin Password">
                        <SecretInput defaultValue={rawSecrets.adminPassword || ""} onSave={v => { saveSettings({ adminPassword: v }); setTimeout(logout, 1500); }} placeholder="New password" />
                      </SF>
                    </SettingsSection>
                  </>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ── Mobile bottom tab bar ─────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t flex items-center justify-around px-1 safe-pb"
        style={{
          borderColor: "rgba(201,168,76,0.1)",
          background: "rgba(7,7,6,0.97)",
          backdropFilter: "blur(20px)",
          paddingBottom: "max(8px, env(safe-area-inset-bottom))",
        }}>
        {tabs.slice(0, 6).map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="relative flex flex-col items-center gap-0.5 px-2 py-2 rounded-xl transition-all min-w-[48px]"
            style={{ color: tab === t.id ? GOLD : "rgba(255,255,255,0.3)" }}>
            {t.count !== undefined && t.count > 0 && (
              <span className="absolute -top-0.5 right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-black"
                style={{ background: GOLD }}>{t.count}</span>
            )}
            {t.icon}
            <span className="text-[9px] font-semibold tracking-wide">{t.label}</span>
          </button>
        ))}
        {/* More button */}
        <button onClick={() => setTab("settings")}
          className="flex flex-col items-center gap-0.5 px-2 py-2 rounded-xl"
          style={{ color: ["settings", "github", "social"].includes(tab) ? GOLD : "rgba(255,255,255,0.3)" }}>
          <Settings className="w-[18px] h-[18px]" />
          <span className="text-[9px] font-semibold tracking-wide">More</span>
        </button>
      </nav>

      <style>{`
        @media (max-width: 768px) {
          main { padding-bottom: calc(72px + env(safe-area-inset-bottom)); }
        }
        * { -webkit-tap-highlight-color: transparent; }
        textarea { field-sizing: content; }
      `}</style>
    </div>
  );
}

// ── Settings helpers ──────────────────────────────────────────────────────
const IC = "bg-black border-white/10 text-white text-sm rounded-xl placeholder:text-white/20 w-full";

function SettingsSection({ title, icon, desc, children }: { title: string; icon: React.ReactNode; desc: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(201,168,76,0.1)" }}>
      <div className="flex items-start gap-3 p-5 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(201,168,76,0.1)" }}>{icon}</div>
        <div><p className="font-bold text-white">{title}</p><p className="text-xs text-white/30 mt-0.5">{desc}</p></div>
      </div>
      <div className="p-5 space-y-0">{children}</div>
    </div>
  );
}

function SF({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="py-4 border-b last:border-0" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
      <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-6">
        <div className="sm:min-w-[160px] sm:shrink-0">
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
      <Input type={show ? "text" : "password"} value={val} onChange={e => setVal(e.target.value)} placeholder={placeholder}
        className="bg-black border-white/10 text-white text-sm rounded-xl placeholder:text-white/20 flex-1" />
      <button type="button" onClick={() => setShow(s => !s)}
        className="p-2 text-white/30 hover:text-white transition-colors rounded-xl border border-white/10">
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
      <button type="button" onClick={() => onSave(val)}
        className="px-3 py-2 rounded-xl text-sm font-bold text-black hover:opacity-90 transition-opacity whitespace-nowrap"
        style={{ background: "linear-gradient(135deg,#c9a84c,#f0d080)" }}>
        <Save className="w-4 h-4" />
      </button>
    </div>
  );
}
