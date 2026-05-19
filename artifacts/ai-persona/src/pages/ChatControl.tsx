import React, { useState, useEffect } from "react";
import { MessageSquare, CheckCircle, X, Clock, RefreshCw, Send, ToggleLeft, ToggleRight, User } from "lucide-react";
import GlassCard from "../components/GlassCard";
import { api, type ChatSession, type ChatMessage } from "../lib/api";

type SessionWithLatest = ChatSession & { latestMessage?: ChatMessage };

const AI_REPLIES: Record<string, string> = {
  default: "Thank you so much for reaching out darling! 🥰 I love hearing from my fans. How can I make your day special today? 💫",
  custom: "Absolutely darling! I do offer custom content — head to my Requests page and fill in the form, I'll get back to you personally! 💕",
  call: "I'd love to do a personal call with you! 💖 Head to my Calls page to book a session — I have options starting from just $29.99 ✨",
  vip: "My VIP membership gives you access to all my exclusive content! 🔥 Head to the Members page to unlock everything 💋",
  onlyfans: "You can find all my exclusive content in my Members section — it's like OnlyFans but even more personal! 💖",
};

function generateAiReply(message: string): string {
  const msg = message.toLowerCase();
  if (msg.includes("custom") || msg.includes("request") || msg.includes("content")) return AI_REPLIES.custom;
  if (msg.includes("call") || msg.includes("zoom") || msg.includes("whatsapp") || msg.includes("video")) return AI_REPLIES.call;
  if (msg.includes("vip") || msg.includes("subscribe") || msg.includes("membership") || msg.includes("access")) return AI_REPLIES.vip;
  if (msg.includes("onlyfans") || msg.includes("only fans") || msg.includes("exclusive")) return AI_REPLIES.onlyfans;
  return AI_REPLIES.default;
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

export default function ChatControl() {
  const [sessions, setSessions] = useState<SessionWithLatest[]>([]);
  const [selectedSession, setSelectedSession] = useState<SessionWithLatest | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [replyText, setReplyText] = useState("");
  const [aiReply, setAiReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [mode, setMode] = useState<"autonomous" | "approval">("approval");
  const [error, setError] = useState<string | null>(null);

  const loadSessions = () => {
    setLoading(true);
    setError(null);
    api.chatSessions()
      .then(setSessions)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadSessions(); }, []);

  const openSession = (s: SessionWithLatest) => {
    setSelectedSession(s);
    setReplyText("");
    setAiReply("");
    api.chatMessages(s.id).then((msgs) => {
      setMessages(msgs);
      const lastFanMsg = [...msgs].reverse().find(m => m.senderType === "fan");
      if (lastFanMsg) setAiReply(generateAiReply(lastFanMsg.message));
    }).catch(() => {});
  };

  const sendReply = async (text: string) => {
    if (!selectedSession || !text.trim()) return;
    setSending(true);
    try {
      const msg = await api.sendReply(selectedSession.id, text);
      setMessages(prev => [...prev, msg]);
      setReplyText("");
      setAiReply("");
    } catch {
    } finally {
      setSending(false);
    }
  };

  const fanMessages = messages.filter(m => m.senderType === "fan");
  const unread = sessions.filter(s => s.unreadCount > 0);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Chat Control</h1>
          <p className="text-white/40 text-sm mt-1">Real fan messages — review & reply with AI assist</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={loadSessions} className="p-2 rounded-xl glass" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
            <RefreshCw size={14} className={`${loading ? "animate-spin" : ""} text-white/40`} />
          </button>
          <div className="flex items-center gap-3 glass px-4 py-2.5 rounded-xl" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
            <span className="text-sm font-semibold text-white/70">Auto Mode</span>
            <button onClick={() => setMode(m => m === "autonomous" ? "approval" : "autonomous")}>
              {mode === "autonomous"
                ? <ToggleRight size={28} style={{ color: "#ff006e" }} />
                : <ToggleLeft size={28} className="text-white/30" />}
            </button>
            <span className="text-sm font-bold" style={{ color: mode === "autonomous" ? "#ff006e" : "rgba(232,223,200,0.4)" }}>
              {mode === "autonomous" ? "AUTO" : "REVIEW"}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Sessions", value: sessions.length, color: "var(--gold)" },
          { label: "Unread", value: unread.length, color: "#ffaa00" },
          { label: "Fan Messages", value: sessions.reduce((a, s) => a + (s.freeUsed || 0), 0), color: "#00ff88" },
        ].map((s) => (
          <GlassCard key={s.label} className="p-4 text-center">
            <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs text-white/35 mono mt-1">{s.label}</div>
          </GlassCard>
        ))}
      </div>

      {error && (
        <div className="p-4 rounded-2xl text-sm" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}>
          Could not load chat sessions: {error}. Check your admin key in Settings.
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h2 className="font-bold text-white flex items-center gap-2 text-sm">
            <Clock size={14} style={{ color: "#ffaa00" }} /> Fan Sessions ({sessions.length})
          </h2>

          {loading && (
            <GlassCard className="p-10 text-center">
              <div className="text-white/30 text-sm">Loading sessions…</div>
            </GlassCard>
          )}

          {!loading && sessions.length === 0 && !error && (
            <GlassCard className="p-10 text-center">
              <MessageSquare size={32} className="mx-auto mb-3 text-white/20" />
              <p className="text-white/30 text-sm">No fan sessions yet.</p>
              <p className="text-white/20 text-xs mt-1">Sessions appear when fans start chatting on the platform.</p>
            </GlassCard>
          )}

          {sessions.map((s) => (
            <GlassCard key={s.id}
              onClick={() => openSession(s)}
              className="p-4 cursor-pointer transition-all"
              style={{
                border: selectedSession?.id === s.id
                  ? "1px solid rgba(201,168,76,0.4)"
                  : s.unreadCount > 0 ? "1px solid rgba(255,170,0,0.2)" : "1px solid rgba(255,255,255,0.04)"
              } as React.CSSProperties}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm text-black shrink-0"
                  style={{ background: "linear-gradient(135deg,var(--gold),var(--gold2))" }}>
                  {s.fanName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white text-sm truncate">{s.fanName}</span>
                    {s.unreadCount > 0 && (
                      <span className="text-[10px] mono font-bold px-1.5 py-0.5 rounded-full ml-2 shrink-0"
                        style={{ background: "rgba(255,170,0,0.2)", color: "#ffaa00", border: "1px solid rgba(255,170,0,0.3)" }}>
                        {s.unreadCount} new
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-xs text-white/30 truncate">{s.fanEmail}</span>
                    {s.lastMessageAt && <span className="text-[10px] text-white/25 shrink-0 ml-2">{timeAgo(s.lastMessageAt)}</span>}
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        <div>
          {selectedSession ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-black"
                  style={{ background: "linear-gradient(135deg,var(--gold),var(--gold2))" }}>
                  {selectedSession.fanName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold text-white text-sm">{selectedSession.fanName}</div>
                  <div className="text-xs text-white/30">{selectedSession.fanEmail}</div>
                </div>
              </div>

              <GlassCard className="overflow-hidden" style={{ maxHeight: "320px", overflowY: "auto" } as React.CSSProperties}>
                {messages.length === 0 ? (
                  <div className="p-8 text-center text-white/30 text-sm">No messages yet</div>
                ) : (
                  <div className="p-4 space-y-3">
                    {messages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.senderType === "hannah" ? "justify-end" : "justify-start"}`}>
                        <div className="max-w-[80%] rounded-2xl px-4 py-2.5"
                          style={msg.senderType === "hannah"
                            ? { background: "linear-gradient(135deg,rgba(201,168,76,0.2),rgba(240,208,128,0.15))", border: "1px solid rgba(201,168,76,0.2)" }
                            : { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.06)" }}>
                          <p className="text-sm text-white/80 leading-relaxed">{msg.message}</p>
                          <p className="text-[10px] text-white/25 mt-1">{timeAgo(msg.createdAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </GlassCard>

              {fanMessages.length > 0 && aiReply && (
                <GlassCard className="p-4" style={{ border: "1px solid rgba(201,168,76,0.15)" } as React.CSSProperties}>
                  <div className="text-[10px] mono font-bold mb-2" style={{ color: "var(--gold)" }}>AI SUGGESTED REPLY</div>
                  <p className="text-sm text-white/70 leading-relaxed mb-3">{aiReply}</p>
                  <button onClick={() => sendReply(aiReply)} disabled={sending}
                    className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl text-black"
                    style={{ background: "var(--gold)", opacity: sending ? 0.6 : 1 }}>
                    <CheckCircle size={12} /> Use This Reply
                  </button>
                </GlassCard>
              )}

              <GlassCard className="p-4">
                <div className="text-[10px] mono font-bold mb-2 text-white/30">CUSTOM REPLY</div>
                <div className="flex gap-2">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply…"
                    rows={3}
                    className="flex-1 text-sm"
                    style={{ resize: "vertical" }}
                  />
                  <button onClick={() => sendReply(replyText)} disabled={sending || !replyText.trim()}
                    className="px-3 rounded-xl text-black self-end mb-0"
                    style={{ background: "var(--gold)", opacity: sending || !replyText.trim() ? 0.5 : 1 }}>
                    <Send size={14} />
                  </button>
                </div>
              </GlassCard>
            </div>
          ) : (
            <GlassCard className="h-full flex items-center justify-center p-10">
              <div className="text-center">
                <User size={32} className="mx-auto mb-3 text-white/20" />
                <p className="text-white/30 text-sm">Select a fan session to view messages and reply</p>
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}
