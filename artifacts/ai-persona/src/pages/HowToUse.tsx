import React, { useState } from "react";
import { BookOpen, ChevronDown, ChevronRight, ExternalLink, Zap, MessageSquare, Users, Brain, BarChart3, Rss, Settings, Shield, Globe, CheckCircle, AlertCircle, Gift } from "lucide-react";
import GlassCard from "../components/GlassCard";

const GOLD = "#c9a84c";

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-black mt-0.5"
        style={{ background: "linear-gradient(135deg,#c9a84c,#f0d080,#c9a84c)" }}>
        {n}
      </div>
      <div className="flex-1 pb-6 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
        <div className="font-bold text-white mb-2">{title}</div>
        <div className="text-sm text-white/55 leading-relaxed space-y-1">{children}</div>
      </div>
    </div>
  );
}

function Accordion({ title, icon, badge, children }: { title: string; icon: React.ReactNode; badge?: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <GlassCard className="overflow-hidden">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-3 p-4 text-left"
        style={{ borderBottom: open ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.2)", color: GOLD }}>
            {icon}
          </div>
          <span className="font-semibold text-white">{title}</span>
          {badge && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full mono"
              style={{ background: "rgba(0,255,136,0.12)", color: "#4ade80", border: "1px solid rgba(0,255,136,0.25)" }}>
              {badge}
            </span>
          )}
        </div>
        {open ? <ChevronDown size={16} style={{ color: GOLD }} /> : <ChevronRight size={16} style={{ color: "rgba(255,255,255,0.3)" }} />}
      </button>
      {open && <div className="p-4 text-sm text-white/55 leading-relaxed space-y-3">{children}</div>}
    </GlassCard>
  );
}

function Tag({ color = GOLD, children }: { color?: string; children: React.ReactNode }) {
  return (
    <span className="inline-block text-[11px] font-bold px-2 py-0.5 rounded mono mr-1"
      style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}>
      {children}
    </span>
  );
}

export default function HowToUse() {
  return (
    <div className="space-y-8 max-w-3xl mx-auto pb-16">
      {/* Hero */}
      <div className="text-center space-y-3 pt-4">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto"
          style={{ background: "linear-gradient(135deg,#c9a84c,#f0d080,#c9a84c)", boxShadow: "0 8px 32px rgba(201,168,76,0.35)" }}>
          <BookOpen size={26} color="#0d0b07" />
        </div>
        <h1 className="text-2xl font-bold text-white">AI Persona Studio — Guide</h1>
        <p className="text-white/40 text-sm max-w-md mx-auto">
          Everything you need to run Hannah's AI-powered creator platform. Read this once and you're set.
        </p>
      </div>

      {/* Quick status checks */}
      <GlassCard className="p-5" style={{ border: "1px solid rgba(201,168,76,0.2)" } as React.CSSProperties}>
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle size={16} style={{ color: "#4ade80" }} />
          <span className="font-bold text-white text-sm">Before You Start — Checklist</span>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { label: "Backend URL entered", hint: "The API server URL (Render / Replit app URL)" },
            { label: "Admin password set", hint: "ADMIN_PASSWORD env var — default: hannah2024!" },
            { label: "Database connected", hint: "DATABASE_URL set automatically by Render/Replit" },
            { label: "Flutterwave key set", hint: "FLUTTERWAVE_SECRET_KEY for payment verification" },
            { label: "X Bearer Token (optional)", hint: "X_BEARER_TOKEN for Twitter/X content sync" },
            { label: "RapidAPI key (optional)", hint: "RAPIDAPI_KEY for TikTok scraper (no watermarks)" },
          ].map((c) => (
            <div key={c.label} className="flex items-start gap-2">
              <div className="w-4 h-4 rounded border mt-0.5 shrink-0" style={{ borderColor: "rgba(201,168,76,0.4)", background: "rgba(201,168,76,0.08)" }} />
              <div>
                <div className="text-xs font-semibold text-white/70">{c.label}</div>
                <div className="text-[11px] text-white/30">{c.hint}</div>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Getting started steps */}
      <div>
        <h2 className="text-xs font-bold mono uppercase tracking-widest mb-4" style={{ color: "rgba(201,168,76,0.5)" }}>Getting Started</h2>
        <GlassCard className="p-5 space-y-0">
          <Step n={1} title="Connect to your backend">
            <p>On the Connect screen, paste your deployed app URL — e.g. <Tag>https://hannah-brooks.onrender.com</Tag></p>
            <p>The studio will test the connection automatically. If it fails, make sure your API server is running and the URL has no trailing slash.</p>
          </Step>
          <Step n={2} title="Sign in with your admin password">
            <p>Use the same password you set as <Tag>ADMIN_PASSWORD</Tag> on Render (default: <Tag>hannah2024!</Tag>).</p>
            <p>This password is also used for the main Creator Portal at <Tag>/admin</Tag>.</p>
          </Step>
          <Step n={3} title="Set up AI reply settings (optional)">
            <p>Go to <Tag color="#4ade80">Settings</Tag> → LLM section and paste your OpenAI-compatible API key if you want smarter AI replies instead of the built-in keyword replies.</p>
            <p>Without a key, the built-in human-like reply engine still works — it uses contextual templates with casual language, images, and gift card requests.</p>
          </Step>
          <Step n={4} title="Start the AI Chat Scheduler">
            <p>Open <Tag color="#4ade80">Chat Control</Tag>, scroll to the AI Scheduler panel, and click <Tag>Scan Now</Tag> to see fans who need a reply.</p>
            <p>Click <Tag>Start Auto</Tag> to enable automatic scanning every 30 minutes. Suggestions appear with an editable text, optional photo, and a <Tag color="#7c3aed">Schedule</Tag> button to delay the send.</p>
          </Step>
        </GlassCard>
      </div>

      {/* Feature deep-dives */}
      <div>
        <h2 className="text-xs font-bold mono uppercase tracking-widest mb-4" style={{ color: "rgba(201,168,76,0.5)" }}>Feature Guide</h2>
        <div className="space-y-3">

          <Accordion title="Chat Control" icon={<MessageSquare size={15} />} badge="CORE">
            <p><strong className="text-white/80">What it does:</strong> Shows all fan chat sessions. You can read conversations, send text/voice/file replies, and use AI-suggested replies.</p>
            <p><strong className="text-white/80">AI Scheduler:</strong> The scheduler scans for unanswered fan messages and generates a human-sounding reply suggestion. Suggestions include:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Casual language — lowercase, natural, emoji-rich</li>
              <li>Context-aware photos — shopping selfie if they mention mall, food pic if they mention restaurants, etc.</li>
              <li>Gift card requests — naturally triggers after 5+ messages (~18% chance)</li>
              <li>Variable delays — instant to 2 hours to feel realistic</li>
            </ul>
            <p><strong className="text-white/80">Approve:</strong> Click <Tag>Send Now</Tag> to send immediately. Click <Tag color="#7c3aed">Schedule</Tag> to auto-send after the AI-recommended delay (countdown shown).</p>
            <p><strong className="text-white/80">Edit:</strong> The text is always editable before sending. Change wording, remove the image, or adjust the gift card ask.</p>
          </Accordion>

          <Accordion title="Persona Manager" icon={<Users size={15} />}>
            <p><strong className="text-white/80">What it does:</strong> Create multiple AI personas with different personalities. Each persona has a name, personality prompt, reply style, and mode.</p>
            <p><strong className="text-white/80">Reply Modes:</strong></p>
            <ul className="list-disc pl-4 space-y-1">
              <li><Tag>auto</Tag> — replies go out automatically without review</li>
              <li><Tag>approval</Tag> — suggestions queue up for your review before sending</li>
              <li><Tag>off</Tag> — persona is disabled</li>
            </ul>
            <p><strong className="text-white/80">Tip:</strong> Keep one default persona active. Create a separate "VIP mode" persona with a more attentive tone for high-spending fans.</p>
          </Accordion>

          <Accordion title="Social Feed" icon={<Rss size={15} />} badge="LIVE">
            <p><strong className="text-white/80">What it does:</strong> Shows all synced posts from X/Twitter, TikTok, and Instagram. Posts appear on the fan platform Feed automatically.</p>
            <p><strong className="text-white/80">Sync triggers:</strong> Use the manual sync buttons per platform, or configure Auto-Sync in Settings to run every N hours.</p>
            <p><strong className="text-white/80">No watermarks:</strong> TikTok videos are fetched via RapidAPI scraper — no TikTok watermark on the video. Requires <Tag>RAPIDAPI_KEY</Tag>.</p>
            <p><strong className="text-white/80">Instagram:</strong> Requires an Instagram Basic Display API token and your Instagram user ID (configure in Settings).</p>
          </Accordion>

          <Accordion title="Analytics" icon={<BarChart3 size={15} />}>
            <p><strong className="text-white/80">What it does:</strong> Live charts showing messages, calls, revenue, and fan growth over time. All data comes from the real database.</p>
            <p>Revenue breakdown shows estimated earnings per category: messages, calls, requests, and tips. These are based on your configured prices in Settings.</p>
          </Accordion>

          <Accordion title="Training" icon={<Brain size={15} />}>
            <p><strong className="text-white/80">What it does:</strong> Upload videos and audio files to train the AI face/voice model. This creates a digital twin of Hannah for automated content.</p>
            <div className="flex items-start gap-2 p-3 rounded-lg" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)" }}>
              <AlertCircle size={14} style={{ color: "#fca5a5", flexShrink: 0, marginTop: 2 }} />
              <p style={{ color: "#fca5a5" }}><strong>Requires GPU hardware.</strong> Face swap (LivePortrait), voice cloning (XTTS v2), and real-time avatar all need an NVIDIA GPU. The UI is ready — wire in a RunPod or Vast.ai GPU worker URL in Settings → GPU Worker URL.</p>
            </div>
          </Accordion>

          <Accordion title="Settings" icon={<Settings size={15} />}>
            <p><strong className="text-white/80">Platform Config:</strong> Change prices for calls, requests, VIP membership. Update Hannah's bio, social handles, email settings.</p>
            <p><strong className="text-white/80">API Keys:</strong> Add your LLM API key (OpenAI/compatible), X Bearer Token, RapidAPI key. All saved securely in the database — not in code.</p>
            <p><strong className="text-white/80">Social Sync:</strong> Configure which platforms to auto-sync and how often (min 5 minutes). Turn sync on/off per platform.</p>
            <p><strong className="text-white/80">GPU Worker:</strong> Paste your RunPod/Vast.ai worker URL here once you have a GPU instance running the face/voice models.</p>
          </Accordion>

        </div>
      </div>

      {/* Admin portal link */}
      <GlassCard className="p-5" style={{ border: "1px solid rgba(201,168,76,0.2)" } as React.CSSProperties}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.2)", color: GOLD }}>
            <Shield size={18} />
          </div>
          <div className="flex-1">
            <div className="font-bold text-white mb-1">Creator Admin Portal</div>
            <p className="text-sm text-white/45 mb-3">
              The main Creator Portal lives at <Tag>/admin</Tag> on your fan platform. It has Dashboard, Messages, Calls, Requests, Tips, Feed, Social, GitHub push, and Settings — all in one place.
            </p>
            <div className="flex flex-wrap gap-2">
              <a href="/admin" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-black"
                style={{ background: "linear-gradient(135deg,#c9a84c,#f0d080,#c9a84c)" }}>
                <ExternalLink size={12} /> Open Admin Portal
              </a>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Gift card tips */}
      <GlassCard className="p-5" style={{ border: "1px solid rgba(124,58,237,0.25)" } as React.CSSProperties}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.25)", color: "#a78bfa" }}>
            <Gift size={18} />
          </div>
          <div className="flex-1">
            <div className="font-bold text-white mb-1">Gift Card Requests — How They Work</div>
            <p className="text-sm text-white/45 mb-2">
              After a fan has sent 5+ messages, the AI occasionally (1 in 5 scans) generates a gift card request message. It's phrased naturally:
            </p>
            <div className="rounded-xl p-3 text-sm italic text-white/50" style={{ background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.15)" }}>
              "hey babe 🥺 can I ask you something small? I really need an iTunes gift card for like $25 and you're honestly one of my favourites… could you help me out?? 🙏💕"
            </div>
            <p className="text-sm text-white/35 mt-2">
              The fan sends the gift card code in reply. You collect it from the Messages tab. Always edit the suggestion before sending to make it feel personal.
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Render deployment */}
      <GlassCard className="p-5" style={{ border: "1px solid rgba(74,222,128,0.15)" } as React.CSSProperties}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.2)", color: "#4ade80" }}>
            <Globe size={18} />
          </div>
          <div className="flex-1">
            <div className="font-bold text-white mb-1">Deploying to Render</div>
            <p className="text-sm text-white/45 mb-3">The repo includes a <Tag color="#4ade80">render.yaml</Tag> that sets up everything automatically.</p>
            <div className="space-y-2 text-sm text-white/45">
              <p><strong className="text-white/70">1.</strong> Connect your GitHub repo <Tag color="#4ade80">daviddan-241/Admin</Tag> to Render</p>
              <p><strong className="text-white/70">2.</strong> Render auto-detects <Tag color="#4ade80">render.yaml</Tag> and creates the web service + PostgreSQL database</p>
              <p><strong className="text-white/70">3.</strong> Set the secret env vars: <Tag>ADMIN_PASSWORD</Tag> <Tag>FLUTTERWAVE_SECRET_KEY</Tag> <Tag>X_BEARER_TOKEN</Tag> <Tag>RAPIDAPI_KEY</Tag></p>
              <p><strong className="text-white/70">4.</strong> Deploy. The API server serves the built frontend on port 10000 — one URL for everything</p>
              <p><strong className="text-white/70">5.</strong> Open AI Persona Studio separately and connect to your Render URL</p>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Quick reference */}
      <div>
        <h2 className="text-xs font-bold mono uppercase tracking-widest mb-4" style={{ color: "rgba(201,168,76,0.5)" }}>Quick Reference</h2>
        <GlassCard className="overflow-hidden">
          <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
            {[
              { label: "Fan Platform", value: "/ (root URL)", color: "#4ade80" },
              { label: "Admin Portal", value: "/admin", color: GOLD },
              { label: "API health check", value: "/api/health", color: "rgba(255,255,255,0.4)" },
              { label: "Default admin password", value: "hannah2024!", color: "#fca5a5" },
              { label: "AI scheduler interval", value: "Every 30 min (configurable)", color: "rgba(255,255,255,0.4)" },
              { label: "Gift card trigger", value: "After 5+ messages, ~18% chance", color: "#a78bfa" },
              { label: "Image reply scenarios", value: "shopping, food, gym, beach, selfie", color: GOLD },
              { label: "Max reply delay", value: "Up to 2.5 hours (weighted random)", color: "rgba(255,255,255,0.4)" },
              { label: "GitHub repo", value: "daviddan-241/Admin", color: "#4ade80" },
              { label: "Render build command", value: "see render.yaml in repo root", color: "rgba(255,255,255,0.4)" },
            ].map((r) => (
              <div key={r.label} className="flex items-center justify-between gap-4 px-4 py-3">
                <span className="text-xs text-white/40">{r.label}</span>
                <span className="text-xs font-mono font-bold" style={{ color: r.color }}>{r.value}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
