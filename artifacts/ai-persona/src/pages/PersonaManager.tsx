import React, { useState } from "react";
import { Users, Plus, Edit3, Trash2, Play, Pause, Copy, Star } from "lucide-react";
import GlassCard from "../components/GlassCard";

type Persona = {
  id: string;
  name: string;
  description: string;
  status: "active" | "idle" | "training";
  voiceProfile: string;
  faceModel: string;
  personality: string;
  replyMode: "autonomous" | "approval" | "off";
  messagesHandled: number;
  accuracy: number;
  color: string;
};

const DEMO: Persona[] = [
  { id: "1", name: "Hannah (Main)", description: "Primary persona — luxury British creator", status: "active", voiceProfile: "hannah-v3.pth", faceModel: "hannah-face-v2.onnx", personality: "Warm, flirty, British accent. Loves fans. Calls everyone 'darling'. Teases but never over-promises. Premium creator energy.", replyMode: "autonomous", messagesHandled: 1247, accuracy: 96, color: "var(--gold)" },
  { id: "2", name: "Hannah (Business)", description: "Professional tone for brand deals", status: "idle", voiceProfile: "hannah-v3.pth", faceModel: "hannah-face-v2.onnx", personality: "Professional, confident, concise. Uses formal language for brand deals and business inquiries. No flirting.", replyMode: "approval", messagesHandled: 89, accuracy: 94, color: "#00ff88" },
  { id: "3", name: "Aria (Alt)", description: "Alternative persona for separate brand", status: "idle", voiceProfile: "aria-v1.pth", faceModel: "aria-face-v1.onnx", personality: "Mysterious, artistic, European accent. Fashion-forward. Intellectual discussions.", replyMode: "off", messagesHandled: 234, accuracy: 91, color: "var(--gold2)" },
];

const statusColor: Record<string, string> = {
  active: "#00ff88",
  idle: "rgba(232,223,200,0.35)",
  training: "#ffaa00",
};

export default function PersonaManager() {
  const [personas, setPersonas] = useState<Persona[]>(DEMO);
  const [selected, setSelected] = useState<Persona | null>(DEMO[0]);
  const [editing, setEditing] = useState(false);
  const [editBuf, setEditBuf] = useState("");

  const activate = (id: string) => {
    setPersonas(p => p.map(x => ({ ...x, status: x.id === id ? "active" : (x.status === "active" ? "idle" : x.status) })));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Persona Manager</h1>
          <p className="text-white/40 text-sm mt-1">Create, configure, and switch between AI personas</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-black"
          style={{ background: "linear-gradient(135deg,var(--gold),var(--gold2))" }}>
          <Plus size={16} /> New Persona
        </button>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Persona list */}
        <div className="lg:col-span-2 space-y-3">
          {personas.map((p) => (
            <GlassCard key={p.id} onClick={() => setSelected(p)} className={`p-4 transition-all cursor-pointer ${selected?.id === p.id ? "neon-border" : ""}`}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm"
                  style={{ background: `${p.color}15`, border: `1px solid ${p.color}30`, color: p.color }}>
                  {p.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white text-sm">{p.name}</span>
                    {p.status === "active" && <Star size={10} className="text-yellow-400" />}
                  </div>
                  <p className="text-xs text-white/35 truncate">{p.description}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs">
                    <span className="mono font-bold" style={{ color: statusColor[p.status] }}>● {p.status.toUpperCase()}</span>
                    <span className="text-white/30">{p.messagesHandled} msgs</span>
                    <span style={{ color: "#00ff88" }}>{p.accuracy}% acc</span>
                  </div>
                </div>
                {p.status !== "active" && (
                  <button onClick={(e) => { e.stopPropagation(); activate(p.id); }}
                    className="p-1.5 rounded-lg text-white/30 hover:text-white transition-colors"
                    style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
                    <Play size={12} />
                  </button>
                )}
                {p.status === "active" && (
                  <div className="px-2 py-0.5 rounded-full text-[9px] mono font-bold"
                    style={{ background: "rgba(0,255,136,0.15)", color: "#00ff88", border: "1px solid rgba(0,255,136,0.3)" }}>
                    LIVE
                  </div>
                )}
              </div>
            </GlassCard>
          ))}

          <button className="w-full py-3 rounded-xl text-sm text-white/30 hover:text-white transition-colors border-2 border-dashed flex items-center justify-center gap-2"
            style={{ borderColor: "rgba(255,255,255,0.08)" }}>
            <Plus size={16} /> Add Persona
          </button>
        </div>

        {/* Persona detail */}
        {selected && (
          <div className="lg:col-span-3 space-y-4">
            <GlassCard className="p-6" style={{ border: `1px solid ${selected.color}20` } as React.CSSProperties}>
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg"
                    style={{ background: `${selected.color}15`, border: `1px solid ${selected.color}30`, color: selected.color }}>
                    {selected.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="font-bold text-white text-lg">{selected.name}</h2>
                    <p className="text-white/40 text-sm">{selected.description}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setEditing(!editing); setEditBuf(selected.personality); }}
                    className="p-2 rounded-xl text-white/40 hover:text-white transition-colors"
                    style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
                    <Edit3 size={14} />
                  </button>
                  <button className="p-2 rounded-xl text-white/40 hover:text-white transition-colors"
                    style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
                    <Copy size={14} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-5">
                {[
                  { label: "Face Model", value: selected.faceModel },
                  { label: "Voice Profile", value: selected.voiceProfile },
                  { label: "Reply Mode", value: selected.replyMode.toUpperCase() },
                  { label: "Accuracy", value: `${selected.accuracy}%` },
                ].map((f) => (
                  <div key={f.label} className="rounded-xl p-3" style={{ background: "rgba(0,0,0,0.3)" }}>
                    <div className="text-xs text-white/30 mono mb-1">{f.label}</div>
                    <div className="text-sm font-semibold text-white">{f.value}</div>
                  </div>
                ))}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-white/40 mono uppercase tracking-widest">Personality Prompt</span>
                  {editing && (
                    <button onClick={() => setEditing(false)}
                      className="text-xs px-3 py-1 rounded-lg font-bold text-black"
                      style={{ background: "linear-gradient(135deg,var(--gold),var(--gold2))" }}>
                      Save
                    </button>
                  )}
                </div>
                {editing ? (
                  <textarea value={editBuf} onChange={(e) => setEditBuf(e.target.value)} rows={5}
                    className="text-sm leading-relaxed" style={{ resize: "vertical" }} />
                ) : (
                  <div className="rounded-xl p-4 text-sm text-white/70 leading-relaxed"
                    style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.05)" }}>
                    {selected.personality}
                  </div>
                )}
              </div>
            </GlassCard>

            {/* Reply mode control */}
            <GlassCard className="p-5">
              <h3 className="font-semibold text-white mb-4">Auto-Reply Mode</h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: "autonomous", label: "Autonomous", desc: "Replies automatically", color: "#ff006e" },
                  { id: "approval", label: "Human Review", desc: "You approve each reply", color: "#ffaa00" },
                  { id: "off", label: "Off", desc: "No auto-replies", color: "rgba(232,223,200,0.35)" },
                ].map((m) => (
                  <button key={m.id}
                    className="p-3 rounded-xl text-left transition-all"
                    style={selected.replyMode === m.id
                      ? { background: `${m.color}15`, border: `1px solid ${m.color}`, boxShadow: `0 0 12px ${m.color}30` }
                      : { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div className="text-sm font-semibold text-white mb-1">{m.label}</div>
                    <div className="text-xs text-white/35">{m.desc}</div>
                  </button>
                ))}
              </div>
            </GlassCard>
          </div>
        )}
      </div>
    </div>
  );
}
