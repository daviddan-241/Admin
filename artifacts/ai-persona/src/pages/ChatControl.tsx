import React, { useState } from "react";
import { MessageSquare, CheckCircle, X, Clock, Zap, Edit3, Send, ToggleLeft, ToggleRight, Brain } from "lucide-react";
import GlassCard from "../components/GlassCard";

type QueueMsg = {
  id: string;
  platform: string;
  from: string;
  message: string;
  aiReply: string;
  confidence: number;
  createdAt: string;
  status: "pending" | "approved" | "rejected" | "sent";
};

const DEMO_QUEUE: QueueMsg[] = [
  { id: "1", platform: "Platform Chat", from: "Michael_T", message: "Hey Hannah! You're absolutely stunning, would love to chat more 💖", aiReply: "Aww thank you so much darling! That's so sweet of you to say 🥰 I love connecting with my fans. How are you doing today? 💫", confidence: 97, createdAt: "2m ago", status: "pending" },
  { id: "2", platform: "Platform Chat", from: "JamesUK", message: "Do you do custom content?", aiReply: "Yes I do! 😊 I offer custom videos and photos starting from $49.99. Just head to my requests page and fill out the form, darling — I'll get back to you personally! 💕", confidence: 94, createdAt: "5m ago", status: "pending" },
  { id: "3", platform: "Platform Chat", from: "fanboy_99", message: "What's your OnlyFans?", aiReply: "You can find all my exclusive content on my Members page — link's in my bio! VIP membership gives you access to everything 🔥 Use code DARLING for 20% off!", confidence: 91, createdAt: "8m ago", status: "sent" },
  { id: "4", platform: "Platform Chat", from: "Chris_L", message: "Can we do a video call?", aiReply: "Absolutely darling! I love doing personal calls with my special fans 💖 Head to my Calls page to book a session — I have WhatsApp 5-minute calls from just $29.99! ✨", confidence: 96, createdAt: "12m ago", status: "approved" },
];

const PLATFORM_COLOR: Record<string, string> = {
  "Platform Chat": "var(--gold)",
  "Instagram": "var(--gold2)",
  "Twitter": "#1DA1F2",
  "TikTok": "#ff006e",
};

export default function ChatControl() {
  const [queue, setQueue] = useState<QueueMsg[]>(DEMO_QUEUE);
  const [mode, setMode] = useState<"autonomous" | "approval">("approval");
  const [editId, setEditId] = useState<string | null>(null);
  const [editBuf, setEditBuf] = useState("");

  const pending = queue.filter(m => m.status === "pending");
  const approved = queue.filter(m => m.status === "approved" || m.status === "sent");
  const rejected = queue.filter(m => m.status === "rejected");

  const approve = (id: string) => setQueue(q => q.map(m => m.id === id ? { ...m, status: "approved" } : m));
  const reject = (id: string) => setQueue(q => q.map(m => m.id === id ? { ...m, status: "rejected" } : m));
  const saveEdit = (id: string) => {
    setQueue(q => q.map(m => m.id === id ? { ...m, aiReply: editBuf } : m));
    setEditId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Chat Control</h1>
          <p className="text-white/40 text-sm mt-1">AI-generated replies — review, edit, approve, or auto-send</p>
        </div>
        <div className="flex items-center gap-3 glass px-4 py-2.5 rounded-xl" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
          <span className="text-sm font-semibold text-white/70">Auto Mode</span>
          <button onClick={() => setMode(m => m === "autonomous" ? "approval" : "autonomous")}>
            {mode === "autonomous"
              ? <ToggleRight size={28} style={{ color: "#ff006e" }} />
              : <ToggleLeft size={28} className="text-white/30" />}
          </button>
          <span className="text-sm font-bold" style={{ color: mode === "autonomous" ? "#ff006e" : "rgba(232,223,200,0.4)" }}>
            {mode === "autonomous" ? "AUTONOMOUS" : "REVIEW"}
          </span>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Pending Review", value: pending.length, color: "#ffaa00" },
          { label: "Approved", value: approved.length, color: "#00ff88" },
          { label: "Rejected", value: rejected.length, color: "#ff006e" },
          { label: "Sent Today", value: 142, color: "var(--gold)" },
        ].map((s) => (
          <GlassCard key={s.label} className="p-4 text-center">
            <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs text-white/35 mono mt-1">{s.label}</div>
          </GlassCard>
        ))}
      </div>

      {/* Mode banner */}
      {mode === "autonomous" && (
        <div className="flex items-center gap-3 p-4 rounded-2xl"
          style={{ background: "rgba(255,0,110,0.08)", border: "1px solid rgba(255,0,110,0.2)" }}>
          <Zap size={18} style={{ color: "#ff006e" }} />
          <div>
            <span className="font-bold text-white text-sm">Autonomous Mode Active</span>
            <p className="text-xs text-white/40 mt-0.5">AI replies are being sent automatically without review. Switch to Review mode to approve each reply manually.</p>
          </div>
        </div>
      )}

      {/* Queue */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-white flex items-center gap-2">
            <Clock size={16} style={{ color: "#ffaa00" }} /> Pending Review
            {pending.length > 0 && <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: "rgba(255,170,0,0.2)", color: "#ffaa00" }}>{pending.length}</span>}
          </h2>
          {pending.length > 0 && (
            <button onClick={() => setQueue(q => q.map(m => m.status === "pending" ? { ...m, status: "approved" } : m))}
              className="text-xs font-bold px-3 py-1.5 rounded-lg text-black" style={{ background: "#00ff88" }}>
              Approve All
            </button>
          )}
        </div>

        {pending.map((msg) => (
          <GlassCard key={msg.id} className="overflow-hidden" style={{ border: "1px solid rgba(255,170,0,0.15)" } as React.CSSProperties}>
            <div className="p-5">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-black"
                    style={{ background: "linear-gradient(135deg,#666,#999)" }}>
                    {msg.from.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="font-semibold text-white text-sm">{msg.from}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-white/30">{msg.createdAt}</span>
                      <span className="text-[10px] mono px-1.5 py-0.5 rounded-full"
                        style={{ background: `${PLATFORM_COLOR[msg.platform]}15`, color: PLATFORM_COLOR[msg.platform], border: `1px solid ${PLATFORM_COLOR[msg.platform]}30` }}>
                        {msg.platform}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-xs mono px-2 py-0.5 rounded-full"
                  style={{ background: msg.confidence > 90 ? "rgba(0,255,136,0.1)" : "rgba(255,170,0,0.1)", color: msg.confidence > 90 ? "#00ff88" : "#ffaa00", border: `1px solid ${msg.confidence > 90 ? "rgba(0,255,136,0.3)" : "rgba(255,170,0,0.3)"}` }}>
                  <Brain size={10} className="inline mr-1" />{msg.confidence}%
                </div>
              </div>

              {/* Fan message */}
              <div className="rounded-xl p-3 mb-3" style={{ background: "rgba(0,0,0,0.3)" }}>
                <p className="text-sm text-white/60 leading-relaxed">{msg.message}</p>
              </div>

              {/* AI reply */}
              <div className="rounded-xl p-3 mb-4" style={{ background: "rgba(201,168,76,0.05)", border: "1px solid rgba(201,168,76,0.15)" }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] mono font-bold" style={{ color: "var(--gold)" }}>AI GENERATED REPLY</span>
                  <button onClick={() => { setEditId(msg.id); setEditBuf(msg.aiReply); }} className="text-white/30 hover:text-white transition-colors">
                    <Edit3 size={12} />
                  </button>
                </div>
                {editId === msg.id ? (
                  <div className="space-y-2">
                    <textarea value={editBuf} onChange={(e) => setEditBuf(e.target.value)} rows={3} className="text-sm" style={{ resize: "vertical" }} />
                    <div className="flex gap-2">
                      <button onClick={() => saveEdit(msg.id)} className="text-xs px-3 py-1 rounded-lg font-bold text-black" style={{ background: "var(--gold)" }}>Save</button>
                      <button onClick={() => setEditId(null)} className="text-xs px-3 py-1 rounded-lg text-white/40 border border-white/10">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-[#e8dfc8]/80 leading-relaxed">{msg.aiReply}</p>
                )}
              </div>

              <div className="flex gap-2">
                <button onClick={() => approve(msg.id)}
                  className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl text-black"
                  style={{ background: "#00ff88" }}>
                  <CheckCircle size={12} /> Approve & Send
                </button>
                <button onClick={() => reject(msg.id)}
                  className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl text-red-400 border border-red-500/20 bg-red-500/10 hover:bg-red-500/20">
                  <X size={12} /> Reject
                </button>
              </div>
            </div>
          </GlassCard>
        ))}

        {pending.length === 0 && (
          <GlassCard className="p-10 text-center">
            <CheckCircle size={32} className="mx-auto mb-3 text-green-400 opacity-50" />
            <p className="text-white/30">No messages pending review</p>
          </GlassCard>
        )}

        {/* Sent/approved history */}
        {approved.length > 0 && (
          <div>
            <h2 className="font-bold text-white flex items-center gap-2 mt-4 mb-3">
              <CheckCircle size={16} className="text-green-400" /> Sent
            </h2>
            {approved.map((msg) => (
              <GlassCard key={msg.id} className="p-4 mb-3 opacity-60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white text-sm">{msg.from}</span>
                    <span className="text-xs text-white/30">{msg.createdAt}</span>
                  </div>
                  <span className="text-xs text-green-400 mono font-bold">✓ SENT</span>
                </div>
                <p className="text-xs text-white/40 mt-1 truncate">{msg.aiReply}</p>
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
