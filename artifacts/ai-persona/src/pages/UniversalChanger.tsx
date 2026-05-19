import React, { useState, useRef, useEffect } from "react";
import { Link2, Camera, Mic, Monitor, CheckCircle, Copy, ExternalLink, Play, ChevronRight, Globe, Video, Zap, Shield } from "lucide-react";
import GlassCard from "../components/GlassCard";

const GOLD = "#c9a84c";
const GOLD_GRAD = "linear-gradient(135deg,#c9a84c,#f0d080,#c9a84c)";

type Platform = {
  id: string;
  name: string;
  icon: string;
  color: string;
  urlPattern: string;
  setupSteps: string[];
  note?: string;
};

const PLATFORMS: Platform[] = [
  {
    id: "zoom", name: "Zoom", icon: "🎥", color: "#2D8CFF", urlPattern: "zoom.us/j/...",
    setupSteps: [
      "Open the AI Persona Studio Live Preview — start your camera & enable Face Swap and Voice Convert",
      "In Zoom → Settings → Video → Camera — select 'OBS Virtual Camera'",
      "In Zoom → Settings → Audio → Microphone — select 'VB-Audio Virtual Cable' or similar",
      "Join your Zoom meeting — participants will see and hear your persona",
    ],
    note: "Enable OBS Virtual Camera in the Live Preview tab first",
  },
  {
    id: "meet", name: "Google Meet", icon: "📹", color: "#00897B", urlPattern: "meet.google.com/...",
    setupSteps: [
      "Open Live Preview tab → Start Camera → Enable Face Swap + Voice Convert",
      "In Google Meet → More options (⋮) → Settings → Video → select 'OBS Virtual Camera'",
      "Under Audio → Microphone → select 'VB-Cable Input' or your virtual audio device",
      "Start or join your Meet — your persona is now live",
    ],
  },
  {
    id: "teams", name: "Microsoft Teams", icon: "🔷", color: "#5B5EA6", urlPattern: "teams.microsoft.com/...",
    setupSteps: [
      "Start Live Preview — ensure Face Swap and Voice Convert are active",
      "In Teams → Settings (Ctrl+,) → Devices → Camera → 'OBS Virtual Camera'",
      "Microphone → select your virtual audio cable output",
      "Join a Teams meeting — your transformation is active",
    ],
    note: "Teams may require OBS Virtual Camera to be started before launching Teams",
  },
  {
    id: "whereby", name: "Whereby", icon: "🌐", color: "#7A5AF8", urlPattern: "whereby.com/...",
    setupSteps: [
      "Open Live Preview and activate your persona transformation",
      "Open Whereby in Chrome — click the camera icon before joining",
      "Select 'OBS Virtual Camera' from the camera dropdown",
      "Select your virtual microphone for voice conversion",
    ],
  },
  {
    id: "discord", name: "Discord", icon: "🎮", color: "#5865F2", urlPattern: "discord.com/channels/...",
    setupSteps: [
      "Start Live Preview with Face Swap + Voice Convert enabled",
      "In Discord → User Settings → Voice & Video → Input Device → virtual mic",
      "Camera → select 'OBS Virtual Camera' in any video call",
      "Start a video call in any server — persona active",
    ],
  },
  {
    id: "custom", name: "Any Website", icon: "🔗", color: GOLD, urlPattern: "Paste any URL...",
    setupSteps: [
      "Start Live Preview in this app — enable Face Swap and Voice Convert",
      "Install OBS Studio (free) and enable the Virtual Camera output",
      "In your target browser/app — select 'OBS Virtual Camera' as your camera",
      "Select your virtual audio cable as microphone for voice conversion",
    ],
    note: "Works with any browser-based video platform",
  },
];

const PREREQS = [
  { label: "OBS Studio", url: "https://obsproject.com", desc: "Free, provides Virtual Camera output" },
  { label: "VB-Cable (Windows)", url: "https://vb-audio.com/Cable", desc: "Virtual audio cable for voice routing" },
  { label: "BlackHole (Mac)", url: "https://existential.audio/blackhole", desc: "macOS virtual audio driver" },
  { label: "V4L2Loopback (Linux)", url: "https://github.com/umlaeute/v4l2loopback", desc: "Linux virtual camera driver" },
];

function Step({ n, text }: { n: number; text: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold text-black mt-0.5"
        style={{ background: GOLD_GRAD }}>
        {n}
      </div>
      <p className="text-sm leading-relaxed" style={{ color: "rgba(232,223,200,0.75)" }}>{text}</p>
    </div>
  );
}

export default function UniversalChanger() {
  const [selected, setSelected] = useState<Platform>(PLATFORMS[0]);
  const [urlInput, setUrlInput] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const [faceSwap, setFaceSwap] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);
  const [copied, setCopied] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (cameraActive) {
      navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
        if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); }
      }).catch(() => setCameraActive(false));
    } else {
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
        videoRef.current.srcObject = null;
      }
    }
  }, [cameraActive]);

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 1500);
  };

  const openUrl = () => {
    const url = urlInput.trim();
    if (!url) return;
    const full = url.startsWith("http") ? url : `https://${url}`;
    window.open(full, "_blank");
  };

  const isReady = cameraActive;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#e8dfc8" }}>Universal Persona Changer</h1>
        <p className="text-sm mt-1" style={{ color: "rgba(232,223,200,0.4)" }}>
          Use your AI persona on any video platform — Zoom, Meet, Teams, Discord, or any website
        </p>
      </div>

      {/* How it works banner */}
      <GlassCard className="p-5" style={{ border: `1px solid rgba(201,168,76,0.25)` }}>
        <div className="flex items-start gap-3 mb-4">
          <Zap size={18} style={{ color: GOLD }} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold" style={{ color: "#e8dfc8" }}>How it works</p>
            <p className="text-xs mt-0.5" style={{ color: "rgba(232,223,200,0.4)" }}>
              AI Persona Studio routes your transformed video and voice through a virtual camera and virtual microphone. Any app that accepts a camera input will show your persona instead of your real face.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: <Camera size={14} />, label: "Your real camera", sub: "Input source" },
            { icon: <Zap size={14} />, label: "AI transforms you", sub: "Face + Voice" },
            { icon: <Globe size={14} />, label: "Any platform sees your persona", sub: "Virtual camera out" },
          ].map((s, i) => (
            <div key={i} className="text-center p-3 rounded-xl" style={{ background: "rgba(201,168,76,0.04)", border: "1px solid rgba(201,168,76,0.1)" }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-2 text-black"
                style={{ background: GOLD_GRAD }}>{s.icon}</div>
              <p className="text-xs font-semibold" style={{ color: "#e8dfc8" }}>{s.label}</p>
              <p className="text-[10px] mt-0.5" style={{ color: "rgba(232,223,200,0.35)" }}>{s.sub}</p>
            </div>
          ))}
        </div>
      </GlassCard>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Platform selector */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-xs font-bold mono uppercase tracking-widest" style={{ color: "rgba(232,223,200,0.3)" }}>Select Platform</h2>
          {PLATFORMS.map((p) => (
            <GlassCard key={p.id} onClick={() => setSelected(p)}
              className="p-4 transition-all"
              style={selected.id === p.id
                ? { border: `1px solid ${GOLD}`, boxShadow: `0 0 12px rgba(201,168,76,0.2)` }
                : { border: "1px solid rgba(201,168,76,0.08)" }}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{p.icon}</span>
                <div className="flex-1">
                  <p className="font-semibold text-sm" style={{ color: "#e8dfc8" }}>{p.name}</p>
                  <p className="text-xs mono" style={{ color: "rgba(232,223,200,0.3)" }}>{p.urlPattern}</p>
                </div>
                {selected.id === p.id && (
                  <CheckCircle size={16} style={{ color: GOLD }} />
                )}
              </div>
            </GlassCard>
          ))}

          {/* URL launcher */}
          <GlassCard className="p-4" style={{ border: "1px solid rgba(201,168,76,0.12)" }}>
            <p className="text-xs mono uppercase tracking-widest mb-3" style={{ color: "rgba(232,223,200,0.35)" }}>
              Open Meeting URL
            </p>
            <div className="flex gap-2">
              <input
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Paste any meeting link..."
                onKeyDown={(e) => e.key === "Enter" && openUrl()}
              />
              <button onClick={openUrl}
                className="px-4 rounded-xl font-bold text-xs text-black shrink-0"
                style={{ background: GOLD_GRAD }}>
                Open
              </button>
            </div>
            <p className="text-[10px] mt-2" style={{ color: "rgba(232,223,200,0.25)" }}>
              Opens in a new tab — make sure your persona is active first
            </p>
          </GlassCard>
        </div>

        {/* Setup guide + live test */}
        <div className="lg:col-span-3 space-y-4">
          {/* Live mini-preview */}
          <GlassCard className="overflow-hidden" style={{ border: "1px solid rgba(201,168,76,0.15)" }}>
            <div className="px-5 py-3 border-b flex items-center justify-between"
              style={{ borderColor: "rgba(201,168,76,0.08)" }}>
              <span className="text-sm font-semibold" style={{ color: "#e8dfc8" }}>Live Persona Preview</span>
              <div className="flex gap-2">
                {[
                  { label: "Face", active: faceSwap, toggle: () => setFaceSwap(!faceSwap) },
                  { label: "Voice", active: voiceActive, toggle: () => setVoiceActive(!voiceActive) },
                ].map((t) => (
                  <button key={t.label} onClick={t.toggle}
                    className="text-xs px-3 py-1 rounded-full font-bold transition-all"
                    style={t.active
                      ? { background: GOLD_GRAD, color: "#000" }
                      : { background: "rgba(201,168,76,0.08)", color: "rgba(232,223,200,0.5)", border: "1px solid rgba(201,168,76,0.15)" }}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="relative bg-black/80" style={{ aspectRatio: "16/9" }}>
              <video ref={videoRef} className="w-full h-full object-cover" muted playsInline
                style={{ display: cameraActive ? "block" : "none", filter: faceSwap ? "contrast(1.05) saturate(1.1)" : "none" }} />
              {!cameraActive && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{ background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.2)" }}>
                    <Camera size={24} style={{ color: GOLD }} />
                  </div>
                  <button onClick={() => setCameraActive(true)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-black"
                    style={{ background: GOLD_GRAD, boxShadow: "0 4px 16px rgba(201,168,76,0.3)" }}>
                    <Play size={14} /> Start Test Camera
                  </button>
                </div>
              )}
              {cameraActive && (
                <>
                  {faceSwap && (
                    <div className="absolute top-3 inset-x-0 flex justify-center">
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold"
                        style={{ background: "rgba(201,168,76,0.85)", color: "#000" }}>
                        ✦ PERSONA ACTIVE — Hannah (Main)
                      </div>
                    </div>
                  )}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-xs font-bold text-white">LIVE</span>
                    </div>
                    <button onClick={() => { setCameraActive(false); setFaceSwap(false); setVoiceActive(false); }}
                      className="text-xs text-red-400 font-bold">
                      Stop
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Status bar */}
            <div className="px-5 py-3 flex items-center gap-4 flex-wrap"
              style={{ background: "rgba(0,0,0,0.3)" }}>
              {[
                { label: "Camera", ok: cameraActive },
                { label: "Face Swap", ok: faceSwap },
                { label: "Voice", ok: voiceActive },
                { label: "Virtual Cam Out", ok: cameraActive },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-1.5 text-xs mono">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: s.ok ? "#4ade80" : "rgba(255,255,255,0.2)" }} />
                  <span style={{ color: s.ok ? "#e8dfc8" : "rgba(232,223,200,0.35)" }}>{s.label}</span>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Setup guide */}
          <GlassCard className="p-6" style={{ border: `1px solid rgba(201,168,76,0.15)` }}>
            <div className="flex items-center gap-2 mb-5">
              <span className="text-xl">{selected.icon}</span>
              <h3 className="font-bold" style={{ color: "#e8dfc8" }}>{selected.name} — Setup Guide</h3>
            </div>
            {selected.note && (
              <div className="flex items-start gap-2 p-3 rounded-xl mb-4 text-xs"
                style={{ background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.2)" }}>
                <Shield size={14} style={{ color: GOLD }} className="shrink-0 mt-0.5" />
                <span style={{ color: "rgba(232,223,200,0.7)" }}>{selected.note}</span>
              </div>
            )}
            <div className="space-y-4">
              {selected.setupSteps.map((step, i) => (
                <Step key={i} n={i + 1} text={step} />
              ))}
            </div>

            <div className="mt-6 pt-4 border-t" style={{ borderColor: "rgba(201,168,76,0.08)" }}>
              <div className={`flex items-center gap-2 p-3 rounded-xl text-sm font-semibold ${isReady ? "text-green-400" : ""}`}
                style={isReady
                  ? { background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.2)" }
                  : { background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.15)" }}>
                {isReady
                  ? <><CheckCircle size={16} className="text-green-400" /> Persona is active — you're ready to go!</>
                  : <><Camera size={16} style={{ color: GOLD }} /> <span style={{ color: "rgba(232,223,200,0.6)" }}>Start the test camera above to verify your persona</span></>}
              </div>
            </div>
          </GlassCard>

          {/* Prerequisites */}
          <GlassCard className="p-5" style={{ border: "1px solid rgba(201,168,76,0.1)" }}>
            <h3 className="text-xs font-bold mono uppercase tracking-widest mb-4" style={{ color: "rgba(232,223,200,0.3)" }}>
              Required Software
            </h3>
            <div className="space-y-3">
              {PREREQS.map((r) => (
                <div key={r.label} className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: "rgba(201,168,76,0.03)", border: "1px solid rgba(201,168,76,0.08)" }}>
                  <div className="flex-1">
                    <p className="text-sm font-semibold" style={{ color: "#e8dfc8" }}>{r.label}</p>
                    <p className="text-xs mt-0.5" style={{ color: "rgba(232,223,200,0.35)" }}>{r.desc}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => copy(r.url, r.label)}
                      className="p-2 rounded-lg transition-colors"
                      style={{ background: "rgba(201,168,76,0.08)", color: GOLD }}>
                      {copied === r.label ? <CheckCircle size={13} /> : <Copy size={13} />}
                    </button>
                    <a href={r.url} target="_blank" rel="noreferrer"
                      className="p-2 rounded-lg transition-colors"
                      style={{ background: "rgba(201,168,76,0.08)", color: GOLD }}>
                      <ExternalLink size={13} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
