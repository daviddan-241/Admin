import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, CheckCircle, Clock, RefreshCw, Send, ToggleLeft, ToggleRight, User, Sparkles, Mic } from "lucide-react";
import GlassCard from "../components/GlassCard";
import { api, type ChatSession, type ChatMessage } from "../lib/api";

type SessionRow = ChatSession & { unreadCount: number; lastMessage: ChatMessage | null };

function timeAgo(iso: string | null) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function ChatControl() {
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [selectedSession, setSelectedSession] = useState<SessionRow | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [replyText, setReplyText] = useState("");
  const [aiReply, setAiReply] = useState("");
  const [loadingAi, setLoadingAi] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [mode, setMode] = useState<"autonomous" | "approval">("approval");
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadSessions = () => {
    setLoading(true);
    setError(null);
    api.chatSessions()
      .then(setSessions)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadSessions(); }, []);

  const loadMessages = (s: SessionRow) => {
    api.chatMessages(s.id).then(({ messages: msgs }) => {
      setMessages(msgs);
      setTimeout(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, 80);
    }).catch(() => {});
  };

  const openSession = (s: SessionRow) => {
    setSelectedSession(s);
    setReplyText("");
    setAiReply("");
    setMessages([]);
    loadMessages(s);
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(() => loadMessages(s), 5000);
  };

  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

  const suggestAiReply = async () => {
    if (!selectedSession) return;
    setLoadingAi(true);
    try {
      const { suggestion } = await api.aiSuggestReply(selectedSession.id);
      setAiReply(suggestion);
    } catch {
      setAiReply("Thank you so much for reaching out darling! 🥰 How can I make your day special today? 💫");
    } finally {
      setLoadingAi(false);
    }
  };

  const sendReply = async (text: string) => {
    if (!selectedSession || !text.trim()) return;
    setSending(true);
    try {
      const msg = await api.sendReply(selectedSession.id, text);
      setMessages(prev => [...prev, msg]);
      setReplyText("");
      setAiReply("");
      loadSessions();
      setTimeout(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, 80);
    } catch {
    } finally {
      setSending(false);
    }
  };

  const unread = sessions.filter(s => s.unreadCount > 0);
  const fanMsgs = messages.filter(m => m.senderType === "fan");

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
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
        {/* Session list */}
        <div className="space-y-3">
          <h2 className="font-bold text-white flex items-center gap-2 text-sm">
            <Clock size={14} style={{ color: "#ffaa00" }} /> Fan Sessions ({sessions.length})
          </h2>

          {loading && (
            <GlassCard className="p-10 text-center">
              <div className="text-white/30 text-sm animate-pulse">Loading sessions…</div>
            </GlassCard>
          )}

          {!loading && sessions.length === 0 && !error && (
            <GlassCard className="p-10 text-center">
              <MessageSquare size={32} className="mx-auto mb-3 text-white/20" />
              <p className="text-white/30 text-sm">No fan sessions yet.</p>
              <p className="text-white/20 text-xs mt-1">Sessions appear when fans start chatting on the platform.</p>
            </GlassCard>
          )}

          <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
            {sessions.map((s) => (
              <GlassCard key={s.id}
                onClick={() => openSession(s)}
                className="p-4 cursor-pointer transition-all hover:scale-[1.01]"
                style={{
                  border: selectedSession?.id === s.id
                    ? "1px solid rgba(201,168,76,0.5)"
                    : s.unreadCount > 0 ? "1px solid rgba(255,170,0,0.25)" : "1px solid rgba(255,255,255,0.05)"
                } as React.CSSProperties}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-black shrink-0"
                    style={{ background: "linear-gradient(135deg,var(--gold),var(--gold2))" }}>
                    {s.fanName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white text-sm truncate">{s.fanName}</span>
                      {s.unreadCount > 0 && (
                        <span className="text-[10px] mono font-bold px-2 py-0.5 rounded-full ml-2 shrink-0"
                          style={{ background: "rgba(255,170,0,0.2)", color: "#ffaa00", border: "1px solid rgba(255,170,0,0.4)" }}>
                          {s.unreadCount} new
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-xs text-white/30 truncate">
                        {s.lastMessage ? s.lastMessage.message.slice(0, 40) : s.fanEmail}
                      </span>
                      {s.lastMessageAt && <span className="text-[10px] text-white/25 shrink-0 ml-2">{timeAgo(s.lastMessageAt)}</span>}
                    </div>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* Message thread + reply */}
        <div>
          {selectedSession ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm text-black shrink-0"
                  style={{ background: "linear-gradient(135deg,var(--gold),var(--gold2))" }}>
                  {selectedSession.fanName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-white text-sm">{selectedSession.fanName}</div>
                  <div className="text-xs text-white/30">{selectedSession.fanEmail}</div>
                </div>
                <button onClick={suggestAiReply} disabled={loadingAi || fanMsgs.length === 0}
                  className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl text-black disabled:opacity-40"
                  style={{ background: "linear-gradient(135deg,var(--gold),var(--gold2))" }}>
                  <Sparkles size={12} />{loadingAi ? "Thinking…" : "AI Suggest"}
                </button>
              </div>

              {/* Message thread */}
              <GlassCard className="overflow-hidden" ref={scrollRef}
                style={{ maxHeight: "280px", overflowY: "auto" } as React.CSSProperties}>
                {messages.length === 0 ? (
                  <div className="p-8 text-center text-white/30 text-sm animate-pulse">Loading messages…</div>
                ) : (
                  <div className="p-4 space-y-3">
                    {messages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.senderType === "hannah" ? "justify-end" : "justify-start"}`}>
                        <div className="max-w-[82%] rounded-2xl px-4 py-2.5"
                          style={msg.senderType === "hannah"
                            ? { background: "linear-gradient(135deg,rgba(201,168,76,0.2),rgba(240,208,128,0.15))", border: "1px solid rgba(201,168,76,0.25)" }
                            : { background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.07)" }}>
                          <p className="text-sm text-white/85 leading-relaxed">{msg.message}</p>
                          <div className="flex items-center justify-between mt-1 gap-3">
                            <p className="text-[10px] text-white/25">{timeAgo(msg.createdAt)}</p>
                            {msg.senderType === "fan" && (msg.amountPaid as unknown as number) > 0 && (
                              <span className="text-[10px] font-bold" style={{ color: "var(--gold)" }}>
                                ${(msg.amountPaid as unknown as number).toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </GlassCard>

              {/* AI suggested reply */}
              {aiReply && (
                <GlassCard className="p-4" style={{ border: "1px solid rgba(201,168,76,0.2)" } as React.CSSProperties}>
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={12} style={{ color: "var(--gold)" }} />
                    <span className="text-[10px] mono font-bold uppercase tracking-widest" style={{ color: "var(--gold)" }}>AI Suggested Reply</span>
                  </div>
                  <p className="text-sm text-white/75 leading-relaxed mb-3">{aiReply}</p>
                  <div className="flex gap-2">
                    <button onClick={() => sendReply(aiReply)} disabled={sending}
                      className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl text-black disabled:opacity-50"
                      style={{ background: "linear-gradient(135deg,var(--gold),var(--gold2))" }}>
                      <CheckCircle size={12} /> Send This
                    </button>
                    <button onClick={() => setReplyText(aiReply)}
                      className="text-xs font-semibold px-3 py-2 rounded-xl text-white/50 hover:text-white/70 transition-colors"
                      style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
                      Edit First
                    </button>
                    <button onClick={() => setAiReply("")}
                      className="text-xs font-semibold px-3 py-2 rounded-xl text-white/30 hover:text-white/50 transition-colors ml-auto"
                      style={{ border: "1px solid rgba(255,255,255,0.05)" }}>
                      Dismiss
                    </button>
                  </div>
                </GlassCard>
              )}

              {/* Custom reply box */}
              <GlassCard className="p-4">
                <div className="text-[10px] mono font-bold mb-2 text-white/30 uppercase tracking-widest">Your Reply</div>
                <div className="flex gap-2">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) sendReply(replyText); }}
                    placeholder="Type your reply… (Cmd+Enter to send)"
                    rows={3}
                    className="flex-1 text-sm"
                    style={{ resize: "vertical" }}
                  />
                  <button onClick={() => sendReply(replyText)} disabled={sending || !replyText.trim()}
                    className="px-3 rounded-xl text-black self-end"
                    style={{ background: "var(--gold)", opacity: sending || !replyText.trim() ? 0.4 : 1 }}>
                    <Send size={14} />
                  </button>
                </div>
              </GlassCard>
            </div>
          ) : (
            <GlassCard className="h-full flex items-center justify-center p-14">
              <div className="text-center">
                <User size={36} className="mx-auto mb-3 text-white/15" />
                <p className="text-white/30 text-sm">Select a fan session</p>
                <p className="text-white/15 text-xs mt-1">View messages and reply with AI assist</p>
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}
