import React, { useEffect, useRef, useState, useCallback } from "react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Send, Lock, Sparkles, Star, ArrowLeft, CheckCheck, ChevronDown,
  Mic, MicOff, Paperclip, ImageIcon, X, Play, Pause, Camera
} from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const API = `${BASE}/api`;
const MSG_PRICE = 4.99;
const FREE_LIMIT = 5;
const POLL_INTERVAL = 3000;
const TOKEN_KEY = "hb_chat_token";
const PROFILE_KEY = "hb_chat_profile";

type MsgType = "text" | "voice" | "image" | "file";
type Attachment = { type: MsgType; url: string; name: string; size: number; mime: string };

type ChatMessage = {
  id: number;
  sessionId: number;
  senderType: "fan" | "hannah";
  message: string;
  amountPaid: number;
  isRead: boolean;
  createdAt: string;
};
type ChatSession = {
  id: number;
  fanName: string;
  fanEmail: string;
  fanToken: string;
  fanAvatarUrl?: string | null;
  freeUsed: number;
};

function parseAttachment(msg: string): Attachment | null {
  if (!msg.startsWith("[ATTACHMENT]")) return null;
  try { return JSON.parse(msg.slice("[ATTACHMENT]".length)) as Attachment; } catch { return null; }
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

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
    <div className={`flex items-center gap-3 min-w-[180px] px-1 py-0.5`}>
      <button onClick={toggle}
        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all active:scale-95
          ${isHannah ? "bg-[#c9a84c] text-black shadow-[0_2px_12px_rgba(201,168,76,0.5)]" : "bg-white/20 text-white"}`}>
        {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
      </button>
      <div className="flex-1 flex flex-col gap-1.5">
        <div className={`h-1 rounded-full overflow-hidden ${isHannah ? "bg-black/20" : "bg-white/20"}`}>
          <div className={`h-full rounded-full transition-all ${isHannah ? "bg-black/60" : "bg-white/80"}`} style={{ width: `${pct}%` }} />
        </div>
        <span className={`text-[10px] font-mono ${isHannah ? "text-black/60" : "text-white/60"}`}>
          {formatDuration(playing ? current : duration)}
        </span>
      </div>
      <div className={`flex items-center gap-0.5 ${isHannah ? "opacity-60" : "opacity-40"}`}>
        {[...Array(12)].map((_, i) => (
          <div key={i} className={`w-0.5 rounded-full ${isHannah ? "bg-black" : "bg-white"}`}
            style={{ height: `${4 + Math.sin(i * 1.2) * 10 + 6}px` }} />
        ))}
      </div>
    </div>
  );
}

function FilePreview({ att, isHannah }: { att: Attachment; isHannah: boolean }) {
  if (att.type === "voice") return <VoicePlayer url={att.url} isHannah={isHannah} />;
  const fullUrl = att.url.startsWith("http") ? att.url : `${BASE}${att.url}`;
  if (att.type === "image") {
    return (
      <a href={fullUrl} target="_blank" rel="noreferrer" className="block">
        <img src={fullUrl} alt={att.name} className="max-w-[200px] rounded-xl object-cover cursor-pointer hover:opacity-90 transition-opacity" />
      </a>
    );
  }
  const kb = Math.round(att.size / 1024);
  return (
    <a href={fullUrl} target="_blank" rel="noreferrer"
      className={`flex items-center gap-2 px-3 py-2 rounded-xl ${isHannah ? "bg-black/10" : "bg-white/10"}`}>
      <Paperclip className="w-4 h-4 shrink-0" />
      <div className="min-w-0">
        <p className="text-sm font-medium truncate max-w-[140px]">{att.name}</p>
        <p className="text-[10px] opacity-60">{kb}KB</p>
      </div>
    </a>
  );
}

function HannahAvatar({ size = "sm" }: { size?: "sm" | "md" | "lg" }) {
  const s = { sm: "w-9 h-9", md: "w-14 h-14", lg: "w-20 h-20" }[size];
  return (
    <div className={`${s} rounded-full shrink-0 relative overflow-hidden shadow-lg border border-amber-400/20`}>
      <img src="/logo-sr.png" alt="Sophie" className="w-full h-full object-cover" onError={e => {
        const t = e.target as HTMLImageElement;
        t.style.display="none";
        t.parentElement!.style.background="linear-gradient(135deg,#c9a84c,#f0d080)";
        t.parentElement!.innerHTML='<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-weight:900;color:#000;font-size:12px;font-family:serif">SR</div>';
      }} />
    </div>
  );
}

function FanAvatar({ avatarUrl, name, size = "sm" }: { avatarUrl?: string | null; name: string; size?: "sm" | "md" }) {
  const s = size === "sm" ? "w-9 h-9 text-xs" : "w-14 h-14 text-base";
  if (avatarUrl) {
    const fullUrl = avatarUrl.startsWith("http") ? avatarUrl : `${BASE}${avatarUrl}`;
    return <img src={fullUrl} alt={name} className={`${s} rounded-full object-cover shrink-0 shadow-md`} />;
  }
  return (
    <div className={`${s} rounded-full bg-gradient-to-br from-slate-600 to-slate-800 border border-white/10 flex items-center justify-center font-bold text-white shrink-0 shadow-md`}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

function MessageBubble({ msg, fanName, fanAvatarUrl }: { msg: ChatMessage; fanName: string; fanAvatarUrl?: string | null }) {
  const isHannah = msg.senderType === "hannah";
  const att = parseAttachment(msg.message);
  const time = new Date(msg.createdAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className={`flex items-end gap-2 mb-2 ${isHannah ? "justify-start" : "justify-end"}`}>
      {isHannah && <HannahAvatar size="sm" />}
      <div className={`max-w-[75%] flex flex-col gap-0.5 ${isHannah ? "items-start" : "items-end"}`}>
        {isHannah && (
          <span className="text-[11px] ml-1 flex items-center gap-1" style={{ color: "#c9a84c" }}>
            <Star className="w-3 h-3" /> Sophie Rain
          </span>
        )}
        <div className={`rounded-2xl overflow-hidden shadow-lg
          ${isHannah
            ? "rounded-tl-sm text-black"
            : "rounded-br-sm text-white bg-[#1a1a2e] border border-white/10"}`}
          style={isHannah ? { background: "linear-gradient(135deg,#c9a84c,#f0d080)" } : {}}>
          {att ? (
            <div className="px-2 py-2"><FilePreview att={att} isHannah={isHannah} /></div>
          ) : (
            <p className="px-4 py-3 text-sm leading-relaxed">{msg.message}</p>
          )}
        </div>
        <div className={`flex items-center gap-1 text-[10px] text-white/30 ${isHannah ? "ml-1" : "mr-1 flex-row-reverse"}`}>
          <span>{time}</span>
          {!isHannah && (
            <CheckCheck className={`w-3.5 h-3.5 ${msg.isRead ? "" : "opacity-40"}`}
              style={msg.isRead ? { color: "#c9a84c" } : {}} />
          )}
        </div>
      </div>
      {!isHannah && <FanAvatar avatarUrl={fanAvatarUrl} name={fanName} size="sm" />}
    </div>
  );
}

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
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        onRecorded(blob);
        stream.getTracks().forEach((t) => t.stop());
      };
      mr.start();
      mediaRef.current = mr;
      setRecording(true);
      setSecs(0);
      timerRef.current = setInterval(() => setSecs((s) => s + 1), 1000);
    } catch {
      alert("Microphone permission is required to send voice notes.");
    }
  };

  const stop = () => {
    mediaRef.current?.stop();
    if (timerRef.current) clearInterval(timerRef.current);
    setRecording(false);
  };

  if (recording) {
    return (
      <button onClick={stop}
        className="flex items-center gap-2 h-11 px-4 rounded-2xl text-white font-semibold text-sm animate-pulse"
        style={{ background: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.4)" }}>
        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        <span className="font-mono text-red-400">{formatDuration(secs)}</span>
        <span className="text-red-400 text-xs">Tap to stop</span>
      </button>
    );
  }

  return (
    <button onClick={start} disabled={disabled}
      className="w-11 h-11 rounded-2xl flex items-center justify-center transition-all shrink-0 bg-white/5 text-white/50 hover:bg-white/10 hover:text-white disabled:opacity-30">
      <Mic className="w-5 h-5" />
    </button>
  );
}

export default function Messages() {
  const { toast } = useToast();
  const savedProfile = (() => { try { return JSON.parse(localStorage.getItem(PROFILE_KEY) || "{}"); } catch { return {}; } })();

  const [step, setStep] = useState<"start" | "chat">(() => localStorage.getItem(TOKEN_KEY) ? "chat" : "start");
  const [name, setName] = useState(savedProfile.name || "");
  const [email, setEmail] = useState(savedProfile.email || "");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(savedProfile.avatarUrl || null);
  const [starting, setStarting] = useState(false);
  const [session, setSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [lastAt, setLastAt] = useState<string | null>(null);
  const sseRef = useRef<EventSource | null>(null);
  const [atBottom, setAtBottom] = useState(true);
  const [typingDots, setTypingDots] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const token = useRef<string | null>(localStorage.getItem(TOKEN_KEY));
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const freeUsed = session?.freeUsed ?? 0;
  const freeLeft = Math.max(0, FREE_LIMIT - freeUsed);
  const isFree = freeUsed < FREE_LIMIT;


  const scrollToBottom = useCallback((smooth = true) => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "auto" });
  }, []);

  const loadSession = useCallback(async (tok: string) => {
    try {
      const r = await fetch(`${API}/chat/${tok}`);
      if (!r.ok) { localStorage.removeItem(TOKEN_KEY); token.current = null; setStep("start"); return; }
      const data = await r.json();
      setSession(data.session);
      setMessages(data.messages);
      if (data.messages.length > 0) setLastAt(data.messages[data.messages.length - 1].createdAt);
      setTimeout(() => scrollToBottom(false), 100);
    } catch { setStep("start"); }
  }, [scrollToBottom]);

  useEffect(() => {
    if (step === "chat" && token.current) loadSession(token.current);
  }, [step, loadSession]);

  useEffect(() => {
    if (step !== "chat" || !token.current) return;
    const es = new EventSource(`${API}/chat/${token.current}/stream`);
    sseRef.current = es;

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as { type: string; messages?: ChatMessage[]; freeUsed?: number };
        if (data.type === "messages" && data.messages?.length) {
          setTypingDots(true);
          setTimeout(() => setTypingDots(false), 1500);
          setMessages((prev) => {
            const existingIds = new Set(prev.map((m) => m.id));
            const newMsgs = (data.messages ?? []).filter((m) => !existingIds.has(m.id));
            if (newMsgs.length === 0) return prev;
            const hasHannahReply = newMsgs.some((m) => m.senderType === "hannah");
            if (hasHannahReply) toast({ title: "💫 Sophie replied!", description: "You have a new message." });
            return [...prev, ...newMsgs];
          });
          if (data.freeUsed !== undefined) {
            setSession((s) => s ? { ...s, freeUsed: data.freeUsed! } : s);
          }
          if (atBottom) setTimeout(() => scrollToBottom(), 80);
        }
      } catch {}
    };

    es.onerror = () => { /* EventSource auto-reconnects */ };

    return () => { es.close(); sseRef.current = null; };
  }, [step, atBottom, scrollToBottom, toast]);

  useEffect(() => {
    if (messages.length > 0 && atBottom) scrollToBottom(false);
  }, [messages.length, atBottom, scrollToBottom]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 80);
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      setAvatarUrl(url);
      const profile = { name, email, avatarUrl: url };
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    };
    reader.readAsDataURL(file);
  };

  const startChat = async () => {
    if (!name.trim() || !email.trim()) { toast({ title: "Please enter your name and email", variant: "destructive" }); return; }
    setStarting(true);
    try {
      const r = await fetch(`${API}/chat/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), name: name.trim(), avatarUrl }),
      });
      if (!r.ok) throw new Error();
      const data = await r.json();
      localStorage.setItem(TOKEN_KEY, data.session.fanToken);
      localStorage.setItem(PROFILE_KEY, JSON.stringify({ name: name.trim(), email: email.trim(), avatarUrl }));
      token.current = data.session.fanToken;
      setSession(data.session);
      setMessages(data.messages);
      if (data.messages.length > 0) setLastAt(data.messages[data.messages.length - 1].createdAt);
      setStep("chat");
      setTimeout(() => scrollToBottom(false), 150);
    } catch { toast({ title: "Couldn't start chat. Please try again.", variant: "destructive" }); }
    setStarting(false);
  };

  const doSend = async (overrides?: { txRef: string; amountPaid: number }) => {
    if (!input.trim() || !token.current) return;
    setSending(true);
    try {
      const body: Record<string, unknown> = { message: input.trim() };
      if (overrides) { body.txRef = overrides.txRef; body.amountPaid = overrides.amountPaid; }
      const r = await fetch(`${API}/chat/${token.current}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (r.status === 402) { toast({ title: "Free messages used up", description: "Pay to send more.", variant: "destructive" }); return; }
      if (!r.ok) throw new Error();
      const msg = await r.json();
      setMessages((prev) => [...prev, msg]);
      setLastAt(msg.createdAt);
      setSession((s) => s ? { ...s, freeUsed: s.freeUsed + (overrides ? 0 : 1) } : s);
      setInput("");
      setTimeout(() => scrollToBottom(), 80);
    } catch { toast({ title: "Failed to send. Please try again.", variant: "destructive" }); }
    setSending(false);
  };

  const uploadAttachment = async (file: File, msgType?: string) => {
    if (!token.current) return;
    setSending(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      if (msgType) fd.append("msgType", msgType);
      const r = await fetch(`${API}/chat/${token.current}/upload`, { method: "POST", body: fd });
      if (r.status === 402) { toast({ title: "Free messages used up", variant: "destructive" }); setSending(false); return; }
      if (!r.ok) throw new Error();
      const msg = await r.json();
      setMessages((prev) => [...prev, msg]);
      setLastAt(msg.createdAt);
      setSession((s) => s ? { ...s, freeUsed: s.freeUsed + 1 } : s);
      setTimeout(() => scrollToBottom(), 80);
    } catch { toast({ title: "Upload failed. Please try again.", variant: "destructive" }); }
    setSending(false);
    setPendingFile(null);
  };

  const handleVoiceRecorded = (blob: Blob) => {
    const file = new File([blob], `voice-${Date.now()}.webm`, { type: "audio/webm" });
    uploadAttachment(file, "voice");
  };

  const handleSend = () => {
    if (!input.trim()) return;
    if (isFree) { doSend(); return; }
    toast({
      title: "DM to arrange payment 💬",
      description: `Free messages used. Send Sophie a DM to continue — she'll arrange payment personally ($${MSG_PRICE}/msg).`,
    });
  };

  const reset = () => {
    localStorage.removeItem(TOKEN_KEY);
    token.current = null;
    setStep("start"); setSession(null); setMessages([]);
  };

  // ── START SCREEN ─────────────────────────────────────────────────────────
  if (step === "start") {
    return (
      <Layout>
        <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
          style={{ background: "radial-gradient(ellipse at top,#1a1000 0%,#060606 70%)" }}>
          {/* Hannah profile */}
          <div className="flex flex-col items-center mb-10">
            <div className="relative mb-4">
              <HannahAvatar size="lg" />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-400 border-2 border-[#060606] shadow-lg" />
            </div>
            <h1 className="text-3xl font-serif font-bold text-white mb-1">Sophie Rain</h1>
            <p className="text-white/40 text-sm">Miami Creator · Online Now</p>
            <div className="flex items-center gap-2 mt-3 rounded-full px-4 py-1.5 border"
              style={{ background: "rgba(201,168,76,0.08)", borderColor: "rgba(201,168,76,0.2)" }}>
              <Sparkles className="w-4 h-4" style={{ color: "#c9a84c" }} />
              <span className="text-sm font-medium" style={{ color: "#c9a84c" }}>First {FREE_LIMIT} messages free</span>
            </div>
          </div>

          {/* Your profile setup */}
          <div className="w-full max-w-sm">
            <div className="rounded-3xl p-7 space-y-5 backdrop-blur-md"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div>
                <h2 className="text-white font-semibold text-lg mb-1">Start your conversation</h2>
                <p className="text-white/40 text-sm">Set up your profile — Sophie sees this when she replies.</p>
              </div>

              {/* Avatar upload */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                  <button onClick={() => avatarInputRef.current?.click()}
                    className="w-16 h-16 rounded-full overflow-hidden relative group transition-all"
                    style={{ background: "rgba(255,255,255,0.06)", border: "2px solid rgba(201,168,76,0.3)" }}>
                    {avatarUrl
                      ? <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      : <Camera className="w-6 h-6 text-white/30 mx-auto mt-4" />}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                      <Camera className="w-5 h-5 text-white" />
                    </div>
                  </button>
                </div>
                <div className="flex-1 text-sm text-white/40">
                  <p className="font-medium text-white/60 mb-0.5">Your photo</p>
                  <p>Tap to add a profile picture (optional)</p>
                </div>
              </div>

              <Input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)}
                className="bg-black/50 border-white/10 text-white h-12 rounded-xl placeholder:text-white/20" />
              <Input type="email" placeholder="Your email" value={email} onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && startChat()}
                className="bg-black/50 border-white/10 text-white h-12 rounded-xl placeholder:text-white/20" />

              <button onClick={startChat} disabled={starting}
                className="w-full h-12 rounded-xl font-bold text-black tracking-wide transition-all active:scale-95"
                style={{ background: "linear-gradient(135deg,#c9a84c,#f0d080,#c9a84c)" }}>
                {starting ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Starting…</span> : "Start Chatting →"}
              </button>
              <p className="text-xs text-center text-white/20">Already chatted? Your conversation resumes automatically.</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // ── CHAT SCREEN ───────────────────────────────────────────────────────────
  return (
    <Layout>
      <div className="flex flex-col" style={{ height: "calc(100dvh - 64px)", background: "#0a0a0a" }}>
        {/* Chat header */}
        <div className="flex-shrink-0 flex items-center gap-3 px-4 py-3 border-b backdrop-blur-xl"
          style={{ borderColor: "rgba(201,168,76,0.1)", background: "rgba(10,8,0,0.95)" }}>
          <button onClick={reset} className="text-white/40 hover:text-white transition-colors p-1 rounded-xl hover:bg-white/5">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <HannahAvatar size="sm" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white text-sm">Sophie Rain</span>
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-[10px] text-green-400 font-medium">Online</span>
            </div>
            <p className="text-[11px] text-white/30 truncate">Replies personally · Miami Creator</p>
          </div>
          {isFree ? (
            <div className="flex items-center gap-1.5 rounded-full px-3 py-1 shrink-0 border"
              style={{ background: "rgba(201,168,76,0.1)", borderColor: "rgba(201,168,76,0.2)" }}>
              <Sparkles className="w-3.5 h-3.5" style={{ color: "#c9a84c" }} />
              <span className="text-xs font-semibold" style={{ color: "#c9a84c" }}>{freeLeft} free</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1 shrink-0">
              <Lock className="w-3 h-3 text-white/30" />
              <span className="text-xs text-white/30">${MSG_PRICE}/msg</span>
            </div>
          )}
        </div>

        {/* Messages area */}
        <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto px-4 py-4"
          style={{ background: "radial-gradient(ellipse at top,#120e00 0%,#0a0a0a 60%)" }}>
          {/* Subtle gold pattern overlay */}
          <div className="pointer-events-none absolute inset-0 opacity-[0.015]"
            style={{ backgroundImage: "repeating-linear-gradient(45deg,#c9a84c 0px,#c9a84c 1px,transparent 1px,transparent 20px)" }} />

          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center pb-16">
              <HannahAvatar size="md" />
              <h3 className="text-white font-semibold text-lg mt-5 mb-2">Chat with Sophie</h3>
              <p className="text-white/30 text-sm max-w-xs">Say hi! Sophie reads every message personally and replies as soon as she can.</p>
              <div className="mt-6 flex gap-2 flex-wrap justify-center">
                {["👋 Hey Sophie!", "💗 Big fan!", "🔥 Love your content", "✨ You're amazing!"].map((q) => (
                  <button key={q} onClick={() => setInput(q)}
                    className="text-xs rounded-full px-3 py-1.5 text-white/60 hover:text-white transition-all border border-white/10 hover:border-white/20">
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <MessageBubble key={msg.id} msg={msg} fanName={session?.fanName ?? "You"}
              fanAvatarUrl={msg.senderType === "fan" ? (session?.fanAvatarUrl ?? avatarUrl) : null} />
          ))}

          {/* Typing indicator */}
          {typingDots && (
            <div className="flex items-end gap-2 mb-3">
              <HannahAvatar size="sm" />
              <div className="px-4 py-3 rounded-2xl rounded-tl-sm flex gap-1 items-center"
                style={{ background: "rgba(201,168,76,0.15)", border: "1px solid rgba(201,168,76,0.2)" }}>
                {[0, 1, 2].map((i) => (
                  <div key={i} className="w-2 h-2 rounded-full" style={{ background: "#c9a84c", animation: `bounce 1.4s ${i * 0.2}s infinite` }} />
                ))}
              </div>
            </div>
          )}

          {!atBottom && (
            <button onClick={() => scrollToBottom()}
              className="fixed bottom-24 right-6 w-10 h-10 rounded-full flex items-center justify-center shadow-xl z-10"
              style={{ background: "linear-gradient(135deg,#c9a84c,#f0d080)" }}>
              <ChevronDown className="w-5 h-5 text-black" />
            </button>
          )}
        </div>

        {/* File preview bar */}
        {pendingFile && (
          <div className="flex-shrink-0 flex items-center gap-3 px-4 py-3 border-t border-white/5 bg-white/5">
            <div className="flex-1 flex items-center gap-2">
              <Paperclip className="w-4 h-4 text-white/50 shrink-0" />
              <span className="text-sm text-white/70 truncate">{pendingFile.name}</span>
              <span className="text-xs text-white/30">{Math.round(pendingFile.size / 1024)}KB</span>
            </div>
            <button onClick={() => { uploadAttachment(pendingFile); }} disabled={sending}
              className="text-xs font-bold px-3 py-1.5 rounded-lg text-black transition-all"
              style={{ background: "linear-gradient(135deg,#c9a84c,#f0d080)" }}>
              {sending ? "Sending…" : "Send"}
            </button>
            <button onClick={() => setPendingFile(null)} className="text-white/30 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Input bar */}
        <div className="flex-shrink-0 border-t border-white/5 px-3 py-3"
          style={{ background: "rgba(10,8,0,0.95)", paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}>
          {!isFree && (
            <div className="flex items-center gap-1.5 mb-2 text-xs text-white/30">
              <Lock className="w-3 h-3" />
              <span>Free messages used · DM Sophie to arrange payment (${MSG_PRICE}/msg)</span>
            </div>
          )}
          <div className="flex items-end gap-2">
            {/* File attach */}
            <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) setPendingFile(f); e.target.value = ""; }} />
            <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadAttachment(f, "image"); e.target.value = ""; }} />
            <button onClick={() => fileInputRef.current?.click()} disabled={sending}
              className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 bg-white/5 text-white/40 hover:bg-white/10 hover:text-white transition-all disabled:opacity-30">
              <Paperclip className="w-5 h-5" />
            </button>
            <button onClick={() => imageInputRef.current?.click()} disabled={sending}
              className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 bg-white/5 text-white/40 hover:bg-white/10 hover:text-white transition-all disabled:opacity-30">
              <ImageIcon className="w-5 h-5" />
            </button>

            {/* Text input */}
            <div className="flex-1 rounded-2xl overflow-hidden border border-white/10 focus-within:border-[rgba(201,168,76,0.4)] transition-colors"
              style={{ background: "rgba(255,255,255,0.04)" }}>
              <textarea value={input} onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="Message Sophie…" rows={1}
                className="w-full bg-transparent text-white text-sm px-4 py-3 resize-none placeholder:text-white/20 outline-none max-h-[120px]"
                style={{ fieldSizing: "content" } as React.CSSProperties} />
            </div>

            {/* Voice recorder */}
            <VoiceRecorder onRecorded={handleVoiceRecorded} disabled={sending} />

            {/* Send button */}
            {input.trim() && (
              <button onClick={handleSend} disabled={sending}
                className="w-11 h-11 rounded-2xl flex items-center justify-center transition-all shrink-0 active:scale-95"
                style={{ background: "linear-gradient(135deg,#c9a84c,#f0d080)", boxShadow: "0 4px 20px rgba(201,168,76,0.4)" }}>
                {sending
                  ? <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  : <Send className="w-4 h-4 text-black" />}
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>
    </Layout>
  );
}
