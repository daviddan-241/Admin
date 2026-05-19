import React, { useState, useRef, useEffect } from "react";
import { Monitor, Mic, Camera, Sliders, Zap, Radio, Eye, EyeOff, Settings2, RefreshCw } from "lucide-react";
import GlassCard from "../components/GlassCard";

export default function LivePreview() {
  const [cameraActive, setCameraActive] = useState(false);
  const [faceSwap, setFaceSwap] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);
  const [obsConnected, setObsConnected] = useState(false);
  const [latency, setLatency] = useState(0);
  const [faceConfidence, setFaceConfidence] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (cameraActive) {
      navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
        if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); }
      }).catch(() => setCameraActive(false));
      const interval = setInterval(() => {
        setLatency(80 + Math.floor(Math.random() * 30));
        setFaceConfidence(faceSwap ? 92 + Math.random() * 6 : 0);
      }, 500);
      return () => clearInterval(interval);
    } else {
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
        videoRef.current.srcObject = null;
      }
    }
  }, [cameraActive, faceSwap]);

  const CONTROLS = [
    { label: "Face Swap", desc: "LivePortrait + InsightFace", active: faceSwap, toggle: () => setFaceSwap(!faceSwap), color: "var(--neon)" },
    { label: "Voice Convert", desc: "RVC v2 real-time", active: voiceActive, toggle: () => setVoiceActive(!voiceActive), color: "var(--neon2)" },
    { label: "OBS Camera", desc: "Virtual webcam output", active: obsConnected, toggle: () => setObsConnected(!obsConnected), color: "#00ff88" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Live Preview</h1>
          <p className="text-white/40 text-sm mt-1">Real-time face transformation & voice conversion</p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl glass border ${cameraActive ? "border-green-500/30" : "border-white/10"}`}>
          <div className={`w-2 h-2 rounded-full ${cameraActive ? "bg-green-400 animate-pulse" : "bg-white/20"}`} />
          <span className="text-xs mono font-bold" style={{ color: cameraActive ? "#00ff88" : "rgba(255,255,255,0.3)" }}>
            {cameraActive ? "CAMERA ACTIVE" : "CAMERA OFF"}
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Video preview */}
        <div className="lg:col-span-2 space-y-4">
          <GlassCard className="overflow-hidden" style={{ border: cameraActive && faceSwap ? "1px solid var(--neon)" : "1px solid rgba(255,255,255,0.06)" } as React.CSSProperties}>
            <div className="relative aspect-video bg-black/80 flex items-center justify-center">
              <video ref={videoRef} className="w-full h-full object-cover" muted playsInline
                style={{ display: cameraActive ? "block" : "none", filter: faceSwap ? "saturate(1.1)" : "none" }} />

              {!cameraActive && (
                <div className="flex flex-col items-center gap-4 text-center px-6">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(0,245,255,0.05)", border: "2px solid rgba(0,245,255,0.2)" }}>
                    <Camera size={28} style={{ color: "var(--neon)" }} />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Camera not active</p>
                    <p className="text-white/40 text-sm mt-1">Enable camera below to start real-time transformation</p>
                  </div>
                  <button onClick={() => setCameraActive(true)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-black"
                    style={{ background: "linear-gradient(135deg,var(--neon),var(--neon2))" }}>
                    <Camera size={14} /> Start Camera
                  </button>
                </div>
              )}

              {/* Overlays when active */}
              {cameraActive && (
                <>
                  {/* Scan corners */}
                  <div className="absolute top-3 left-3 w-6 h-6 border-l-2 border-t-2 pointer-events-none" style={{ borderColor: "var(--neon)" }} />
                  <div className="absolute top-3 right-3 w-6 h-6 border-r-2 border-t-2 pointer-events-none" style={{ borderColor: "var(--neon)" }} />
                  <div className="absolute bottom-3 left-3 w-6 h-6 border-l-2 border-b-2 pointer-events-none" style={{ borderColor: "var(--neon)" }} />
                  <div className="absolute bottom-3 right-3 w-6 h-6 border-r-2 border-b-2 pointer-events-none" style={{ borderColor: "var(--neon)" }} />

                  {faceSwap && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs mono font-bold"
                      style={{ background: "rgba(0,245,255,0.15)", border: "1px solid rgba(0,245,255,0.4)", color: "var(--neon)" }}>
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                      FACE SWAP ACTIVE · {faceConfidence.toFixed(1)}% conf
                    </div>
                  )}

                  {/* Latency */}
                  <div className="absolute bottom-4 right-4 text-xs mono font-bold px-2 py-1 rounded-lg"
                    style={{ background: "rgba(0,0,0,0.6)", color: latency < 100 ? "#00ff88" : "#ffaa00" }}>
                    {latency}ms
                  </div>

                  {/* Landmark overlay dots */}
                  {faceSwap && [...Array(8)].map((_, i) => (
                    <div key={i} className="absolute w-1.5 h-1.5 rounded-full pointer-events-none"
                      style={{
                        background: "var(--neon)",
                        top: `${25 + (i < 4 ? i * 10 : (i - 4) * 10 + 5)}%`,
                        left: `${30 + (i % 2 === 0 ? 0 : 35)}%`,
                        boxShadow: "0 0 4px var(--neon)",
                        opacity: 0.7,
                      }} />
                  ))}
                </>
              )}
            </div>

            {/* Camera toggle */}
            {cameraActive && (
              <div className="px-5 py-3 flex items-center justify-between border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                <span className="text-xs text-white/40 mono">Live output · {faceSwap ? "Transformed" : "Raw"}</span>
                <button onClick={() => { setCameraActive(false); setFaceSwap(false); setVoiceActive(false); }}
                  className="text-xs text-red-400 hover:text-red-300 mono font-bold transition-colors">
                  STOP CAMERA
                </button>
              </div>
            )}
          </GlassCard>

          {/* Sliders */}
          {cameraActive && faceSwap && (
            <GlassCard className="p-5">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Sliders size={16} style={{ color: "var(--neon)" }} /> Fine Controls
              </h3>
              <div className="space-y-4">
                {[
                  { label: "Blend Strength", value: 85, color: "var(--neon)" },
                  { label: "Expression Transfer", value: 70, color: "var(--neon2)" },
                  { label: "Lighting Adapt", value: 60, color: "#00ff88" },
                  { label: "Lip Sync", value: 90, color: "#ffaa00" },
                ].map((s) => (
                  <div key={s.label}>
                    <div className="flex items-center justify-between text-xs mono mb-1.5">
                      <span className="text-white/50">{s.label}</span>
                      <span style={{ color: s.color }}>{s.value}%</span>
                    </div>
                    <div className="h-1.5 rounded-full cursor-pointer" style={{ background: "rgba(255,255,255,0.08)" }}>
                      <div className="h-full rounded-full" style={{ width: `${s.value}%`, background: `linear-gradient(90deg,${s.color}80,${s.color})` }} />
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          {/* Controls */}
          <GlassCard className="p-5">
            <h3 className="font-semibold text-white mb-4">Transformation Controls</h3>
            <div className="space-y-3">
              {CONTROLS.map((c) => (
                <div key={c.label} className="flex items-center justify-between p-3 rounded-xl transition-all"
                  style={{ background: c.active ? `${c.color}08` : "rgba(255,255,255,0.03)", border: `1px solid ${c.active ? c.color + "30" : "rgba(255,255,255,0.06)"}` }}>
                  <div>
                    <div className="font-semibold text-white text-sm">{c.label}</div>
                    <div className="text-xs text-white/30">{c.desc}</div>
                  </div>
                  <button onClick={c.toggle} disabled={!cameraActive && c.label === "Face Swap"}
                    className="relative w-12 h-6 rounded-full transition-all disabled:opacity-40"
                    style={{ background: c.active ? c.color : "rgba(255,255,255,0.1)" }}>
                    <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all"
                      style={{ left: c.active ? "calc(100% - 22px)" : "2px" }} />
                  </button>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Active persona */}
          <GlassCard className="p-5" style={{ border: "1px solid rgba(0,245,255,0.15)" } as React.CSSProperties}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs mono text-white/40 uppercase tracking-widest">Active Persona</span>
              <RefreshCw size={12} className="text-white/30" />
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-black"
                style={{ background: "linear-gradient(135deg,var(--neon),var(--neon2))" }}>H</div>
              <div>
                <div className="font-semibold text-white">Hannah (Main)</div>
                <div className="text-xs text-white/35">v3.2 · 96% accuracy</div>
              </div>
            </div>
          </GlassCard>

          {/* Live stats */}
          {cameraActive && (
            <GlassCard className="p-5">
              <h3 className="text-xs mono text-white/40 uppercase tracking-widest mb-4">Live Metrics</h3>
              <div className="space-y-3">
                {[
                  { label: "Frame Rate", value: "30 FPS", color: "#00ff88" },
                  { label: "Face Latency", value: `${latency}ms`, color: latency < 100 ? "#00ff88" : "#ffaa00" },
                  { label: "Voice Latency", value: voiceActive ? "91ms" : "—", color: "var(--neon2)" },
                  { label: "Render Quality", value: "1080p", color: "var(--neon)" },
                  { label: "OBS Status", value: obsConnected ? "Connected" : "Disconnected", color: obsConnected ? "#00ff88" : "rgba(255,255,255,0.3)" },
                ].map((m) => (
                  <div key={m.label} className="flex items-center justify-between text-xs">
                    <span className="text-white/40 mono">{m.label}</span>
                    <span className="mono font-bold" style={{ color: m.color }}>{m.value}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}
