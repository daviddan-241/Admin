import React, { useState } from "react";
import { Upload, Video, Mic, Brain, CheckCircle, Clock, AlertCircle, Play, X } from "lucide-react";
import GlassCard from "../components/GlassCard";

type TrainStep = "upload" | "processing" | "done";

export default function Training() {
  const [step, setStep] = useState<TrainStep>("upload");
  const [videoFiles, setVideoFiles] = useState<File[]>([]);
  const [audioFiles, setAudioFiles] = useState<File[]>([]);
  const [personality, setPersonality] = useState("");
  const [dragging, setDragging] = useState<"video" | "audio" | null>(null);
  const [progress, setProgress] = useState(0);
  const [trainingJob, setTrainingJob] = useState<string | null>(null);

  const simulateTrain = () => {
    if (videoFiles.length === 0 && audioFiles.length === 0) return;
    setStep("processing");
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) { clearInterval(interval); setStep("done"); return 100; }
        return p + Math.random() * 3;
      });
    }, 200);
    setTrainingJob(`job_${Date.now()}`);
  };

  const TRAIN_STAGES = [
    { label: "Extracting facial embeddings", icon: <Video size={16} />, done: progress > 20, active: progress > 0 && progress <= 20 },
    { label: "Training face swap model", icon: <Brain size={16} />, done: progress > 45, active: progress > 20 && progress <= 45 },
    { label: "Processing voice samples", icon: <Mic size={16} />, done: progress > 65, active: progress > 45 && progress <= 65 },
    { label: "Training voice conversion", icon: <Brain size={16} />, done: progress > 80, active: progress > 65 && progress <= 80 },
    { label: "Optimizing for real-time", icon: <CheckCircle size={16} />, done: progress > 95, active: progress > 80 && progress <= 95 },
    { label: "Building persona profile", icon: <CheckCircle size={16} />, done: progress >= 100, active: progress > 95 && progress < 100 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Persona Training</h1>
        <p className="text-white/40 text-sm mt-1">Upload reference media to train a new or existing AI persona</p>
      </div>

      {step === "done" ? (
        <GlassCard className="p-10 text-center" style={{ border: "1px solid rgba(0,255,136,0.3)" } as React.CSSProperties}>
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: "rgba(0,255,136,0.1)", border: "2px solid rgba(0,255,136,0.4)" }}>
            <CheckCircle size={32} className="text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Training Complete!</h2>
          <p className="text-white/40 mb-6">Your persona is ready. Face model, voice profile, and personality engine are all trained.</p>
          <div className="flex justify-center gap-4">
            <button onClick={() => { setStep("upload"); setProgress(0); setVideoFiles([]); setAudioFiles([]); }}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white/60 border border-white/10 hover:border-white/20">
              Train Another
            </button>
            <button className="px-5 py-2.5 rounded-xl text-sm font-bold text-black"
              style={{ background: "linear-gradient(135deg,var(--gold),var(--gold2))" }}>
              <Play size={14} className="inline mr-2" /> Go Live Now
            </button>
          </div>
        </GlassCard>
      ) : step === "processing" ? (
        <div className="space-y-4">
          <GlassCard className="p-6" style={{ border: "1px solid rgba(201,168,76,0.2)" } as React.CSSProperties}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-white">Training in Progress</h2>
              <span className="mono text-sm font-bold" style={{ color: "var(--gold)" }}>{Math.floor(progress)}%</span>
            </div>
            <div className="h-2 rounded-full mb-6" style={{ background: "rgba(255,255,255,0.06)" }}>
              <div className="h-full rounded-full transition-all duration-300"
                style={{ width: `${progress}%`, background: "linear-gradient(90deg,var(--gold),var(--gold2))", boxShadow: "0 0 10px rgba(201,168,76,0.5)" }} />
            </div>
            <div className="space-y-3">
              {TRAIN_STAGES.map((s, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all ${s.done ? "bg-green-400/20 text-green-400" : s.active ? "" : "opacity-30 text-white/30"}`}
                    style={s.active ? { background: "rgba(201,168,76,0.15)", color: "var(--gold)", animation: "pulse 1.5s infinite" } : {}}>
                    {s.done ? <CheckCircle size={12} /> : s.icon}
                  </div>
                  <span className={s.done ? "text-white/60 line-through" : s.active ? "text-white" : "text-white/30"}>{s.label}</span>
                  {s.active && <span className="mono text-xs animate-pulse" style={{ color: "var(--gold)" }}>processing…</span>}
                  {s.done && <span className="text-green-400 text-xs mono">✓</span>}
                </div>
              ))}
            </div>
          </GlassCard>
          <div className="text-xs text-white/25 text-center mono">Job ID: {trainingJob} · Estimated 8–15 min on GPU</div>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Video upload */}
          <GlassCard className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Video size={18} style={{ color: "var(--gold)" }} />
              <h2 className="font-bold text-white">Video Samples</h2>
              <span className="text-xs text-white/30">2–10 videos required</span>
            </div>
            <div
              className="rounded-xl border-2 border-dashed p-8 text-center mb-4 transition-all cursor-pointer"
              style={{ borderColor: dragging === "video" ? "var(--gold)" : "rgba(255,255,255,0.1)", background: dragging === "video" ? "rgba(201,168,76,0.05)" : "transparent" }}
              onDragOver={(e) => { e.preventDefault(); setDragging("video"); }}
              onDragLeave={() => setDragging(null)}
              onDrop={(e) => { e.preventDefault(); setDragging(null); const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("video")); setVideoFiles(p => [...p, ...files]); }}
              onClick={() => document.getElementById("video-input")?.click()}
            >
              <Upload size={32} className="mx-auto mb-3 text-white/20" />
              <p className="text-sm text-white/40">Drop video files here or click to browse</p>
              <p className="text-xs text-white/20 mt-1">MP4, MOV, AVI · Max 500MB each</p>
              <input id="video-input" type="file" accept="video/*" multiple className="hidden"
                onChange={(e) => setVideoFiles(p => [...p, ...Array.from(e.target.files || [])])} />
            </div>
            {videoFiles.map((f, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg mb-2 text-sm"
                style={{ background: "rgba(201,168,76,0.05)", border: "1px solid rgba(201,168,76,0.1)" }}>
                <Video size={14} style={{ color: "var(--gold)" }} />
                <span className="text-white/70 flex-1 truncate">{f.name}</span>
                <span className="text-white/30 text-xs">{(f.size / 1024 / 1024).toFixed(1)}MB</span>
                <button onClick={() => setVideoFiles(p => p.filter((_, j) => j !== i))} className="text-white/30 hover:text-red-400">
                  <X size={12} />
                </button>
              </div>
            ))}
            <div className="text-xs text-white/30 mt-2">
              Tip: Upload clear frontal-face videos with good lighting, natural expressions, and various head angles.
            </div>
          </GlassCard>

          {/* Audio upload */}
          <GlassCard className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Mic size={18} style={{ color: "var(--gold2)" }} />
              <h2 className="font-bold text-white">Voice Samples</h2>
              <span className="text-xs text-white/30">1–5 minutes ideal</span>
            </div>
            <div
              className="rounded-xl border-2 border-dashed p-8 text-center mb-4 transition-all cursor-pointer"
              style={{ borderColor: dragging === "audio" ? "var(--gold2)" : "rgba(255,255,255,0.1)", background: dragging === "audio" ? "rgba(240,208,128,0.05)" : "transparent" }}
              onDragOver={(e) => { e.preventDefault(); setDragging("audio"); }}
              onDragLeave={() => setDragging(null)}
              onDrop={(e) => { e.preventDefault(); setDragging(null); const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("audio")); setAudioFiles(p => [...p, ...files]); }}
              onClick={() => document.getElementById("audio-input")?.click()}
            >
              <Mic size={32} className="mx-auto mb-3 text-white/20" />
              <p className="text-sm text-white/40">Drop audio files here or click to browse</p>
              <p className="text-xs text-white/20 mt-1">WAV, MP3, FLAC · Clean audio, minimal noise</p>
              <input id="audio-input" type="file" accept="audio/*" multiple className="hidden"
                onChange={(e) => setAudioFiles(p => [...p, ...Array.from(e.target.files || [])])} />
            </div>
            {audioFiles.map((f, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg mb-2 text-sm"
                style={{ background: "rgba(240,208,128,0.05)", border: "1px solid rgba(240,208,128,0.1)" }}>
                <Mic size={14} style={{ color: "var(--gold2)" }} />
                <span className="text-white/70 flex-1 truncate">{f.name}</span>
                <span className="text-white/30 text-xs">{(f.size / 1024 / 1024).toFixed(1)}MB</span>
                <button onClick={() => setAudioFiles(p => p.filter((_, j) => j !== i))} className="text-white/30 hover:text-red-400"><X size={12} /></button>
              </div>
            ))}
          </GlassCard>

          {/* Personality config */}
          <GlassCard className="p-6 lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Brain size={18} style={{ color: "#ffaa00" }} />
              <h2 className="font-bold text-white">Personality Configuration</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs mono text-white/40 mb-2 block uppercase tracking-widest">Personality Prompt</label>
                <textarea value={personality} onChange={(e) => setPersonality(e.target.value)}
                  rows={5} placeholder="Describe personality, tone, speaking style, topics to discuss, things to avoid..."
                  className="text-sm leading-relaxed" style={{ resize: "vertical" }} />
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs mono text-white/40 mb-2 block uppercase tracking-widest">Persona Name</label>
                  <input type="text" placeholder="e.g. Hannah (Main)" />
                </div>
                <div>
                  <label className="text-xs mono text-white/40 mb-2 block uppercase tracking-widest">LLM Model</label>
                  <select>
                    <option>GPT-4o (Recommended)</option>
                    <option>GPT-4-turbo</option>
                    <option>Llama 3 70B</option>
                    <option>Mistral Large</option>
                    <option>Claude 3.5 Sonnet</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs mono text-white/40 mb-2 block uppercase tracking-widest">Voice Model</label>
                  <select>
                    <option>XTTS v2 (Best quality)</option>
                    <option>RVC v2 (Fastest)</option>
                    <option>OpenVoice v2</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between gap-4 pt-5 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <div className="text-sm text-white/40">
                {videoFiles.length > 0 && <span className="mr-4">{videoFiles.length} video{videoFiles.length !== 1 ? "s" : ""}</span>}
                {audioFiles.length > 0 && <span className="mr-4">{audioFiles.length} audio file{audioFiles.length !== 1 ? "s" : ""}</span>}
                {!videoFiles.length && !audioFiles.length && "Upload media to begin"}
              </div>
              <button onClick={simulateTrain} disabled={videoFiles.length === 0 && audioFiles.length === 0}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-black disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: "linear-gradient(135deg,var(--gold),var(--gold2))", boxShadow: "0 4px 20px rgba(201,168,76,0.3)" }}>
                <Brain size={16} /> Start Training
              </button>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
