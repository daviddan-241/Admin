import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  MessageSquare, Phone, Sparkles, Gift, ImagePlus, LayoutDashboard,
  Send, CheckCircle, XCircle, Clock, Trash2, Bell, BellOff, Eye, EyeOff,
  LogOut, TrendingUp, Users, DollarSign, Star, RefreshCw, Instagram,
  Twitter, Music2, Globe
} from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const API = `${BASE}/api`;

type Tab = "dashboard" | "messages" | "calls" | "requests" | "tips" | "feed";

type Message = {
  id: number; fanName: string; fanEmail: string; message: string;
  amountPaid: number; status: string; reply: string | null; createdAt: string; txRef: string;
};
type Call = {
  id: number; fanName: string; fanEmail: string; preferredDate: string;
  durationMinutes: number; amountPaid: number; status: string; notes: string | null; createdAt: string;
};
type ContentRequest = {
  id: number; fanName: string; fanEmail: string; requestType: string;
  description: string; amountPaid: number; status: string; createdAt: string;
};
type Tip = {
  id: number; fanName: string; fanEmail: string; amount: number;
  message: string | null; createdAt: string;
};
type Post = {
  id: number; imageUrl: string; caption: string | null; platform: string;
  isPrivate: boolean; watermark: boolean; createdAt: string;
};
type Stats = {
  totalMessages: number; totalCalls: number; totalRequests: number;
  totalTips: number; totalRevenue: number;
};
type Activity = {
  type: "message" | "call" | "request" | "tip";
  fanName: string; amount: number; detail: string; timestamp: string;
};

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
  }, [authed, fetchAll]);

  useEffect(() => {
    if (!authed) return;
    const es = new EventSource(`${API}/events`);
    esRef.current = es;
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data) as Activity & { type: string };
        if (data.type === "connected") return;
        setActivity((prev) => [data as Activity, ...prev].slice(0, 50));
        fetchAll();
        if (notifEnabled && Notification.permission === "granted") {
          const icons: Record<string, string> = { message: "💬", call: "📹", request: "✨", tip: "💝" };
          new Notification(`${icons[data.type] || "🔔"} Hannah Brooks`, {
            body: data.detail,
            icon: "/favicon.ico",
          });
        }
      } catch {}
    };
    return () => es.close();
  }, [authed, notifEnabled, fetchAll]);

  const enableNotifications = async () => {
    const perm = await Notification.requestPermission();
    setNotifEnabled(perm === "granted");
    toast({ title: perm === "granted" ? "Notifications enabled" : "Permission denied" });
  };

  const sendReply = async (id: number) => {
    const reply = replyMap[id];
    if (!reply?.trim()) return;
    setLoadingReply(id);
    await fetch(`${API}/messages/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
      body: JSON.stringify({ reply }),
    });
    setReplyMap((p) => { const n = { ...p }; delete n[id]; return n; });
    setLoadingReply(null);
    toast({ title: "Reply sent!" });
    fetchAll();
  };

  const updateCallStatus = async (id: number, status: string) => {
    await fetch(`${API}/calls/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
      body: JSON.stringify({ status }),
    });
    fetchAll();
  };

  const deletePost = async (id: number) => {
    await fetch(`${API}/posts/${id}`, { method: "DELETE", headers: { "x-admin-key": adminKey } });
    fetchAll();
  };

  const addPost = async () => {
    if (!newPost.imageUrl) return;
    setAddingPost(true);
    await fetch(`${API}/posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
      body: JSON.stringify({ ...newPost, watermark: true }),
    });
    setNewPost({ imageUrl: "", caption: "", platform: "instagram", isPrivate: false });
    setAddingPost(false);
    toast({ title: "Post added to feed!" });
    fetchAll();
  };

  const logout = () => {
    sessionStorage.removeItem("hb_admin_key");
    setAuthed(false);
    setAdminKey("");
  };

  if (!authed) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-serif font-bold text-white">Admin Panel</h1>
            <p className="text-muted-foreground mt-2 text-sm">Hannah Brooks Creator Dashboard</p>
          </div>
          <div className="bg-card/50 border border-white/10 rounded-2xl p-6 space-y-4 backdrop-blur">
            <Input
              type="password"
              placeholder="Enter admin password"
              value={pwInput}
              onChange={(e) => setPwInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && login()}
              className="bg-black/60 border-white/10 text-white h-12 rounded-xl"
            />
            <Button onClick={login} className="w-full h-12 rounded-xl bg-primary text-white font-bold">
              Sign In
            </Button>
          </div>
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
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur border-b border-white/5 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
            <Star className="w-4 h-4 text-primary" />
          </div>
          <span className="font-serif font-bold text-lg text-white">HB Admin</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Activity bell */}
          <div className="relative">
            <Button
              size="sm"
              variant="ghost"
              onClick={enableNotifications}
              className="text-muted-foreground hover:text-white"
            >
              {notifEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
            </Button>
            {activity.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-primary rounded-full" />
            )}
          </div>
          <Button size="sm" variant="ghost" onClick={fetchAll} className="text-muted-foreground hover:text-white">
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={logout} className="text-muted-foreground hover:text-white">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-56 shrink-0 min-h-[calc(100vh-57px)] border-r border-white/5 bg-black/40 p-3 hidden md:block">
          <nav className="space-y-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${tab === t.id ? "bg-primary/15 text-primary border border-primary/20" : "text-muted-foreground hover:text-white hover:bg-white/5"}`}
              >
                <span className="flex items-center gap-2">{t.icon}{t.label}</span>
                {t.count !== undefined && t.count > 0 && (
                  <span className="bg-primary text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center">{t.count}</span>
                )}
              </button>
            ))}
          </nav>

          {/* Recent Activity */}
          {activity.length > 0 && (
            <div className="mt-6">
              <p className="text-xs font-medium text-muted-foreground px-3 mb-2 uppercase tracking-wider">Live Activity</p>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {activity.slice(0, 10).map((a, i) => (
                  <div key={i} className="px-3 py-2 rounded-lg bg-white/5 text-xs">
                    <div className="flex items-center gap-1 text-white/80 mb-0.5">
                      <span>{a.type === "message" ? "💬" : a.type === "call" ? "📹" : a.type === "tip" ? "💝" : "✨"}</span>
                      <span className="font-medium truncate">{a.fanName}</span>
                    </div>
                    {a.amount > 0 && <div className="text-secondary font-bold">${a.amount}</div>}
                    <div className="text-muted-foreground">{timeAgo(a.timestamp)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
          {/* Mobile tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 md:hidden">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all
                  ${tab === t.id ? "bg-primary/15 text-primary border-primary/20" : "text-muted-foreground border-white/10"}`}
              >
                {t.icon}{t.label}
                {t.count !== undefined && t.count > 0 && (
                  <span className="bg-primary text-white rounded-full px-1.5 min-w-[16px] text-center">{t.count}</span>
                )}
              </button>
            ))}
          </div>

          {/* DASHBOARD */}
          {tab === "dashboard" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-serif font-bold text-white">Dashboard</h2>
              {stats && (
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                  {[
                    { label: "Total Revenue", value: `$${stats.totalRevenue.toFixed(2)}`, icon: <DollarSign className="w-5 h-5" />, color: "text-secondary" },
                    { label: "Messages", value: stats.totalMessages, icon: <MessageSquare className="w-5 h-5" />, color: "text-primary" },
                    { label: "Calls", value: stats.totalCalls, icon: <Phone className="w-5 h-5" />, color: "text-blue-400" },
                    { label: "Requests", value: stats.totalRequests, icon: <Sparkles className="w-5 h-5" />, color: "text-purple-400" },
                    { label: "Tips", value: stats.totalTips, icon: <Gift className="w-5 h-5" />, color: "text-emerald-400" },
                  ].map((s) => (
                    <div key={s.label} className="bg-card/40 border border-white/5 rounded-2xl p-5">
                      <div className={`${s.color} mb-3`}>{s.icon}</div>
                      <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                      <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Recent Messages needing reply */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" /> Awaiting Reply
                </h3>
                <div className="space-y-3">
                  {messages.filter(m => m.status !== "replied" && m.status !== "free").slice(0, 3).map((m) => (
                    <div key={m.id} className="bg-card/40 border border-white/5 rounded-xl p-4 flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-primary">{m.fanName}</span>
                          <span className={statusBadge(m.status)}>{m.status}</span>
                        </div>
                        <p className="text-sm text-white/70 truncate">{m.message}</p>
                      </div>
                      <Button size="sm" onClick={() => setTab("messages")} className="shrink-0 bg-primary/20 text-primary hover:bg-primary/30 border border-primary/20">
                        Reply
                      </Button>
                    </div>
                  ))}
                  {messages.filter(m => m.status !== "replied" && m.status !== "free").length === 0 && (
                    <div className="text-center py-8 text-muted-foreground text-sm border border-white/5 rounded-xl">
                      <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-400" />
                      All messages replied!
                    </div>
                  )}
                </div>
              </div>

              {/* Recent calls */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Phone className="w-5 h-5 text-blue-400" /> Pending Calls
                </h3>
                <div className="space-y-3">
                  {calls.filter(c => c.status === "pending").slice(0, 3).map((c) => (
                    <div key={c.id} className="bg-card/40 border border-white/5 rounded-xl p-4 flex items-start justify-between gap-4">
                      <div>
                        <div className="font-medium text-white">{c.fanName} — {c.durationMinutes} min</div>
                        <div className="text-sm text-muted-foreground">{new Date(c.preferredDate).toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">{c.fanEmail}</div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => updateCallStatus(c.id, "confirmed")} className="bg-green-500/20 text-green-300 border border-green-500/20 hover:bg-green-500/30">
                          Confirm
                        </Button>
                      </div>
                    </div>
                  ))}
                  {calls.filter(c => c.status === "pending").length === 0 && (
                    <div className="text-center py-8 text-muted-foreground text-sm border border-white/5 rounded-xl">No pending calls</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* MESSAGES */}
          {tab === "messages" && (
            <div className="space-y-4">
              <h2 className="text-2xl font-serif font-bold text-white">Messages ({messages.length})</h2>
              {messages.map((m) => (
                <div key={m.id} className="bg-card/40 border border-white/5 rounded-2xl p-5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-white">{m.fanName}</span>
                        <span className={statusBadge(m.status)}>{m.status}</span>
                        {m.amountPaid > 0 && <span className="text-secondary text-sm font-bold">${m.amountPaid}</span>}
                      </div>
                      <div className="text-xs text-muted-foreground">{m.fanEmail} · {timeAgo(m.createdAt)}</div>
                    </div>
                  </div>
                  <div className="bg-black/40 rounded-xl p-4 mb-3">
                    <p className="text-white/90 text-sm leading-relaxed">{m.message}</p>
                  </div>
                  {m.reply && (
                    <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-3">
                      <div className="flex items-center gap-1 text-xs text-primary mb-1">
                        <Star className="w-3 h-3" /> Hannah's Reply
                      </div>
                      <p className="text-white/80 text-sm">{m.reply}</p>
                    </div>
                  )}
                  {m.status !== "replied" && (
                    <div className="flex gap-2">
                      <Textarea
                        placeholder="Write your reply as Hannah..."
                        value={replyMap[m.id] || ""}
                        onChange={(e) => setReplyMap((p) => ({ ...p, [m.id]: e.target.value }))}
                        className="bg-black/50 border-white/10 text-white resize-none text-sm min-h-[80px] rounded-xl"
                      />
                      <Button
                        onClick={() => sendReply(m.id)}
                        disabled={loadingReply === m.id || !replyMap[m.id]?.trim()}
                        className="bg-primary text-white hover:bg-primary/90 px-4 rounded-xl shrink-0"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
              {messages.length === 0 && (
                <div className="text-center py-16 text-muted-foreground border border-white/5 rounded-2xl">
                  No messages yet
                </div>
              )}
            </div>
          )}

          {/* CALLS */}
          {tab === "calls" && (
            <div className="space-y-4">
              <h2 className="text-2xl font-serif font-bold text-white">Call Bookings ({calls.length})</h2>
              {calls.map((c) => (
                <div key={c.id} className="bg-card/40 border border-white/5 rounded-2xl p-5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-white">{c.fanName}</span>
                        <span className={statusBadge(c.status)}>{c.status}</span>
                        <span className="text-secondary font-bold text-sm">${c.amountPaid}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">{c.fanEmail} · {timeAgo(c.createdAt)}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                    <div className="bg-black/40 rounded-xl p-3">
                      <div className="text-xs text-muted-foreground mb-1">Duration</div>
                      <div className="text-white font-medium">{c.durationMinutes} minutes</div>
                    </div>
                    <div className="bg-black/40 rounded-xl p-3">
                      <div className="text-xs text-muted-foreground mb-1">Preferred Time</div>
                      <div className="text-white font-medium">{new Date(c.preferredDate).toLocaleString()}</div>
                    </div>
                    {c.notes && (
                      <div className="bg-black/40 rounded-xl p-3 col-span-2">
                        <div className="text-xs text-muted-foreground mb-1">Notes</div>
                        <div className="text-white/80">{c.notes}</div>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {c.status === "pending" && (
                      <Button size="sm" onClick={() => updateCallStatus(c.id, "confirmed")} className="bg-green-500/20 text-green-300 border border-green-500/20">
                        <CheckCircle className="w-4 h-4 mr-1" /> Confirm
                      </Button>
                    )}
                    {c.status === "confirmed" && (
                      <Button size="sm" onClick={() => updateCallStatus(c.id, "completed")} className="bg-blue-500/20 text-blue-300 border border-blue-500/20">
                        <CheckCircle className="w-4 h-4 mr-1" /> Mark Completed
                      </Button>
                    )}
                    <a href={`https://wa.me/${c.fanEmail.replace(/\D/g, "")}?text=Hi ${encodeURIComponent(c.fanName)}! This is Hannah confirming your video call.`}
                      target="_blank" rel="noreferrer">
                      <Button size="sm" variant="outline" className="border-white/10 text-white/70">WhatsApp Fan</Button>
                    </a>
                  </div>
                </div>
              ))}
              {calls.length === 0 && (
                <div className="text-center py-16 text-muted-foreground border border-white/5 rounded-2xl">No bookings yet</div>
              )}
            </div>
          )}

          {/* REQUESTS */}
          {tab === "requests" && (
            <div className="space-y-4">
              <h2 className="text-2xl font-serif font-bold text-white">Custom Requests ({requests.length})</h2>
              {requests.map((r) => (
                <div key={r.id} className="bg-card/40 border border-white/5 rounded-2xl p-5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-white">{r.fanName}</span>
                        <span className={statusBadge(r.status)}>{r.status}</span>
                        <span className="text-secondary font-bold text-sm">${r.amountPaid}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">{r.fanEmail} · {timeAgo(r.createdAt)}</div>
                    </div>
                  </div>
                  <div className="bg-black/40 rounded-xl p-4">
                    <div className="text-xs text-muted-foreground mb-1">Request Type: {r.requestType}</div>
                    <p className="text-white/90 text-sm">{r.description}</p>
                  </div>
                </div>
              ))}
              {requests.length === 0 && (
                <div className="text-center py-16 text-muted-foreground border border-white/5 rounded-2xl">No requests yet</div>
              )}
            </div>
          )}

          {/* TIPS */}
          {tab === "tips" && (
            <div className="space-y-4">
              <h2 className="text-2xl font-serif font-bold text-white">Tips & Gifts ({tips.length})</h2>
              {tips.map((t) => (
                <div key={t.id} className="bg-card/40 border border-white/5 rounded-2xl p-5 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-white">{t.fanName}</span>
                      <span className="text-emerald-400 font-bold text-lg">${t.amount}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">{t.fanEmail} · {timeAgo(t.createdAt)}</div>
                    {t.message && <p className="text-sm text-white/70 mt-2 italic">"{t.message}"</p>}
                  </div>
                  <Gift className="w-8 h-8 text-emerald-400/40 shrink-0" />
                </div>
              ))}
              {tips.length === 0 && (
                <div className="text-center py-16 text-muted-foreground border border-white/5 rounded-2xl">No tips yet</div>
              )}
            </div>
          )}

          {/* FEED */}
          {tab === "feed" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-serif font-bold text-white">Social Feed Manager</h2>

              {/* Add new post */}
              <div className="bg-card/40 border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <ImagePlus className="w-5 h-5 text-primary" /> Add New Post
                </h3>
                <div className="space-y-4">
                  <Input
                    placeholder="Image URL (paste a direct image link)"
                    value={newPost.imageUrl}
                    onChange={(e) => setNewPost((p) => ({ ...p, imageUrl: e.target.value }))}
                    className="bg-black/50 border-white/10 text-white rounded-xl"
                  />
                  <Textarea
                    placeholder="Caption (optional)"
                    value={newPost.caption}
                    onChange={(e) => setNewPost((p) => ({ ...p, caption: e.target.value }))}
                    className="bg-black/50 border-white/10 text-white rounded-xl resize-none min-h-[80px]"
                  />
                  <div className="flex gap-4 items-center flex-wrap">
                    <select
                      value={newPost.platform}
                      onChange={(e) => setNewPost((p) => ({ ...p, platform: e.target.value }))}
                      className="bg-black/60 border border-white/10 text-white rounded-xl px-3 py-2 text-sm"
                    >
                      <option value="instagram">Instagram</option>
                      <option value="twitter">X / Twitter</option>
                      <option value="tiktok">TikTok</option>
                      <option value="custom">Custom Upload</option>
                    </select>
                    <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newPost.isPrivate}
                        onChange={(e) => setNewPost((p) => ({ ...p, isPrivate: e.target.checked }))}
                        className="rounded"
                      />
                      Private (VIP only)
                    </label>
                  </div>
                  {newPost.imageUrl && (
                    <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-white/10">
                      <img src={newPost.imageUrl} alt="preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = "none")} />
                    </div>
                  )}
                  <Button onClick={addPost} disabled={addingPost || !newPost.imageUrl} className="bg-primary text-white hover:bg-primary/90 rounded-xl">
                    {addingPost ? "Publishing..." : "Publish to Feed"}
                  </Button>
                </div>
              </div>

              {/* Existing posts */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {posts.map((p) => (
                  <div key={p.id} className="relative rounded-xl overflow-hidden border border-white/10 group aspect-square">
                    <img src={p.imageUrl} alt={p.caption || ""} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all" />
                    <div className="absolute top-2 left-2 flex items-center gap-1 text-white/90 text-xs bg-black/50 px-1.5 py-0.5 rounded-full backdrop-blur">
                      {platformIcon(p.platform)} {p.platform}
                    </div>
                    {p.isPrivate && (
                      <div className="absolute top-2 right-2 bg-primary/80 text-white text-xs px-1.5 py-0.5 rounded-full">VIP</div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-200">
                      {p.caption && <p className="text-white text-xs mb-2 line-clamp-2">{p.caption}</p>}
                      <Button
                        size="sm"
                        onClick={() => deletePost(p.id)}
                        className="w-full bg-red-500/20 text-red-300 border border-red-500/20 hover:bg-red-500/40 text-xs"
                      >
                        <Trash2 className="w-3 h-3 mr-1" /> Remove
                      </Button>
                    </div>
                  </div>
                ))}
                {posts.length === 0 && (
                  <div className="col-span-full text-center py-16 text-muted-foreground border border-white/5 rounded-2xl">
                    No posts yet. Add your first post above.
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
