import React, { useState } from "react";
import { Settings, Key, Brain, Mic, Monitor, Shield, Eye, EyeOff, Save } from "lucide-react";
import GlassCard from "../components/GlassCard";

function SecretField({ label, placeholder, hint }: { label: string; placeholder: string; hint?: string }) {
  const [val, setVal] = useState("");
  const [show, setShow] = useState(false);
  return (
    <div className="py-4 border-b last:border-0" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
      <label className="text-xs mono text-white/40 uppercase tracking-widest block mb-2">{label}</label>
      {hint && <p className="text-xs text-white/25 mb-2">{hint}</p>}
      <div className="flex gap-2">
        <input type={show ? "text" : "password"} value={val} onChange={e => setVal(e.target.value)} placeholder={placeholder} className="flex-1" />
        <button onClick={() => setShow(s => !s)} className="p-2.5 rounded-xl glass border" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          {show ? <EyeOff size={14} className="text-white/40" /> : <Eye size={14} className="text-white/40" />}
        </button>
        <button className="p-2.5 rounded-xl text-black" style={{ background: "linear-gradient(135deg,var(--gold),var(--gold2))" }}>
          <Save size={14} />
        </button>
      </div>
    </div>
  );
}

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

export default function SettingsPage() {
  const [gpu, setGpu] = useState("cuda");
  const [quality, setQuality] = useState("high");

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-white/40 text-sm mt-1">Configure AI models, API keys, and system preferences</p>
      </div>

      <Section title="LLM & AI API Keys" icon={<Key size={16} />} desc="Connect your AI model provider. OpenAI-compatible APIs supported.">
        <SecretField label="OpenAI API Key" placeholder="sk-..." hint="Used for GPT-4o auto-reply generation" />
        <SecretField label="Anthropic API Key" placeholder="sk-ant-..." hint="Alternative: Claude models" />
        <SecretField label="OpenRouter API Key" placeholder="sk-or-..." hint="Access Llama, Mistral, and more" />
        <SecretField label="Replicate API Token" placeholder="r8_..." hint="For hosted face/voice models" />
      </Section>

      <Section title="Voice Engine (RVC / XTTS)" icon={<Mic size={16} />} desc="Configure real-time voice conversion settings.">
        <div className="space-y-4">
          <div>
            <label className="text-xs mono text-white/40 uppercase tracking-widest block mb-2">Voice Model Path</label>
            <input type="text" placeholder="/models/voice/hannah-v3.pth" />
          </div>
          <div>
            <label className="text-xs mono text-white/40 uppercase tracking-widest block mb-2">Engine</label>
            <select>
              <option>RVC v2 (Real-time, fastest)</option>
              <option>XTTS v2 (Best quality)</option>
              <option>OpenVoice v2</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs mono text-white/40 block mb-2">Pitch Shift (semitones)</label>
              <input type="number" defaultValue={0} min={-12} max={12} />
            </div>
            <div>
              <label className="text-xs mono text-white/40 block mb-2">Buffer Size (ms)</label>
              <input type="number" defaultValue={64} />
            </div>
          </div>
        </div>
      </Section>

      <Section title="Face Engine (LivePortrait)" icon={<Monitor size={16} />} desc="Real-time face swapping and expression transfer settings.">
        <div className="space-y-4">
          <div>
            <label className="text-xs mono text-white/40 block mb-2">Face Model Path</label>
            <input type="text" placeholder="/models/face/hannah-face-v2.onnx" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs mono text-white/40 block mb-2">GPU Backend</label>
              <select value={gpu} onChange={e => setGpu(e.target.value)}>
                <option value="cuda">CUDA (NVIDIA)</option>
                <option value="mps">MPS (Apple)</option>
                <option value="cpu">CPU (Slow)</option>
              </select>
            </div>
            <div>
              <label className="text-xs mono text-white/40 block mb-2">Render Quality</label>
              <select value={quality} onChange={e => setQuality(e.target.value)}>
                <option value="ultra">Ultra (4K)</option>
                <option value="high">High (1080p)</option>
                <option value="medium">Medium (720p)</option>
                <option value="low">Low (360p, fastest)</option>
              </select>
            </div>
          </div>
        </div>
      </Section>

      <Section title="Security & Consent" icon={<Shield size={16} />} desc="Control consent verification, encryption, and abuse prevention.">
        <div className="space-y-4">
          {[
            { label: "Require Consent Verification", desc: "Block training without consent confirmation", enabled: true },
            { label: "Encrypt Uploaded Media", desc: "AES-256 encryption for all media files", enabled: true },
            { label: "Abuse Detection Filter", desc: "Prevent misuse via content analysis", enabled: true },
            { label: "Audit Logging", desc: "Log all AI actions for review", enabled: true },
            { label: "Auto-Delete Media", desc: "Delete source files after training completes", enabled: false },
          ].map((s) => (
            <div key={s.label} className="flex items-center justify-between py-3 border-b last:border-0" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
              <div>
                <div className="text-sm font-semibold text-white">{s.label}</div>
                <div className="text-xs text-white/30 mt-0.5">{s.desc}</div>
              </div>
              <div className={`w-11 h-6 rounded-full relative cursor-pointer transition-all ${s.enabled ? "" : ""}`}
                style={{ background: s.enabled ? "var(--gold)" : "rgba(255,255,255,0.1)" }}>
                <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all"
                  style={{ left: s.enabled ? "calc(100% - 22px)" : "2px" }} />
              </div>
            </div>
          ))}
        </div>
      </Section>

      <GlassCard className="p-5 flex items-center justify-between" style={{ border: "1px solid rgba(201,168,76,0.15)" } as React.CSSProperties}>
        <div>
          <p className="font-semibold text-white">Save All Settings</p>
          <p className="text-xs text-white/30 mt-0.5">Changes apply on next model load</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-black"
          style={{ background: "linear-gradient(135deg,var(--gold),var(--gold2))", boxShadow: "0 4px 20px rgba(201,168,76,0.3)" }}>
          <Save size={14} /> Save Changes
        </button>
      </GlassCard>
    </div>
  );
}
