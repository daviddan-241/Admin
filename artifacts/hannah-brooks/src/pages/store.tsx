import React, { useState } from "react";
import { Layout } from "@/components/layout";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { usePlatformConfig } from "@/hooks/use-platform-config";
import { useFlutterwave } from "@/hooks/use-flutterwave";
import {
  Camera, Video, Wand2, Gift, Star, CheckCircle2, Heart, Sparkles,
  Crown, Lock, ChevronRight, ShieldCheck, User, Mail, ArrowLeft
} from "lucide-react";
import { Link } from "wouter";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const API = `${BASE}/api`;
const LOGO = "/logo-hb.png";

function HannahAvatar({ size = "sm" }: { size?: "sm" | "md" | "lg" }) {
  const s = { sm: "w-10 h-10", md: "w-14 h-14", lg: "w-20 h-20" }[size];
  return (
    <div className={`${s} rounded-full shrink-0 overflow-hidden border-2 border-amber-400/30 shadow-lg shadow-amber-400/10`}>
      <img src={LOGO} alt="Hannah" className="w-full h-full object-cover"
        onError={e => {
          const t = e.target as HTMLImageElement;
          t.style.display = "none";
          t.parentElement!.style.background = "linear-gradient(135deg,#c9a84c,#f0d080)";
          t.parentElement!.innerHTML = '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-weight:900;color:#000;font-size:12px;font-family:serif">HB</div>';
        }} />
    </div>
  );
}

type Mode = "main" | "request" | "tip";

const REQUEST_TYPES = [
  { id: "photo", icon: <Camera className="w-5 h-5" />, label: "Photo Set", desc: "Custom photography, your scenario" },
  { id: "video", icon: <Video className="w-5 h-5" />, label: "Video Clip", desc: "Bespoke video message or content" },
  { id: "story", icon: <Wand2 className="w-5 h-5" />, label: "Special Request", desc: "Something unique — let's talk" },
];

const TIP_PRESETS = [10, 20, 50, 100, 200];

export default function Store() {
  const { toast } = useToast();
  const { config } = usePlatformConfig();
  const { pay } = useFlutterwave();

  const [mode, setMode] = useState<Mode>("main");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [tipAmount, setTipAmount] = useState("20");
  const [tipMessage, setTipMessage] = useState("");
  const [requestType, setRequestType] = useState("photo");
  const [paying, setPaying] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [successMode, setSuccessMode] = useState<"request" | "tip">("request");

  const resetForms = () => {
    setName(""); setEmail(""); setDescription("");
    setTipMessage(""); setTipAmount("20");
    setSubmitted(false); setMode("main");
  };

  const handlePayRequest = () => {
    if (!name.trim() || !email.trim() || !description.trim()) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }
    setPaying(true);
    const txRef = `hb_req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    pay({
      amount: config.requestPrice,
      name: name.trim(),
      email: email.trim(),
      description: `Custom ${REQUEST_TYPES.find(r => r.id === requestType)?.label} request`,
      txRef,
      onSuccess: async (data) => {
        setPaying(false);
        try {
          await fetch(`${API}/requests`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              fanName: name.trim(),
              fanEmail: email.trim(),
              requestType,
              description: description.trim(),
              amountPaid: config.requestPrice,
              txRef: (data.tx_ref as string) || txRef,
            }),
          });
        } catch { /* already logged */ }
        setSuccessMode("request");
        setSubmitted(true);
      },
      onClose: () => { setPaying(false); },
    });
  };

  const handlePayTip = () => {
    const amt = parseFloat(tipAmount);
    if (!name.trim() || !email.trim() || isNaN(amt) || amt < config.tipMin) {
      toast({ title: `Minimum tip is $${config.tipMin}`, variant: "destructive" });
      return;
    }
    setPaying(true);
    const txRef = `hb_tip_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    pay({
      amount: amt,
      name: name.trim(),
      email: email.trim(),
      description: tipMessage.trim() ? `Tip: ${tipMessage.trim()}` : "Tip for Hannah",
      txRef,
      onSuccess: async (data) => {
        setPaying(false);
        try {
          await fetch(`${API}/tips`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              fanName: name.trim(),
              fanEmail: email.trim(),
              amount: amt,
              txRef: (data.tx_ref as string) || txRef,
              message: tipMessage.trim() || null,
            }),
          });
        } catch { /* logged */ }
        setSuccessMode("tip");
        setSubmitted(true);
      },
      onClose: () => { setPaying(false); },
    });
  };

  if (submitted) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center px-4"
          style={{ background: "radial-gradient(ellipse at top,#1a1000 0%,#060606 70%)" }}>
          <div className="text-center max-w-md w-full">
            <div className="relative flex justify-center mb-6">
              <HannahAvatar size="lg" />
              <div className="absolute -bottom-1 right-[calc(50%-14px)] w-6 h-6 rounded-full bg-green-400 border-2 border-black flex items-center justify-center">
                <CheckCircle2 className="w-3.5 h-3.5 text-black" />
              </div>
            </div>
            <h1 className="text-4xl font-serif font-bold text-white mb-3">
              {successMode === "tip" ? "Thank You! 💕" : "Request Received! ✨"}
            </h1>
            <p className="text-white/50 mb-6">
              {successMode === "tip"
                ? "Your tip has been sent to Hannah. She'll see it and reply personally — she genuinely appreciates every single one."
                : "Your request is confirmed and paid. Hannah will start working on it and deliver within 48–72 hours."}
            </p>
            <div className="flex flex-col gap-3">
              <Link href="/messages">
                <button className="w-full h-12 rounded-xl font-bold text-sm text-black flex items-center justify-center gap-2"
                  style={{ background: "linear-gradient(135deg,#c9a84c,#f0d080,#c9a84c)" }}>
                  Message Hannah
                </button>
              </Link>
              <button onClick={resetForms} className="text-white/30 text-sm hover:text-white/60 transition-colors">
                Back to Store
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (mode === "request") {
    return (
      <Layout>
        <div className="min-h-screen pb-20" style={{ background: "radial-gradient(ellipse at top,#1a1000 0%,#060606 70%)" }}>
          <div className="container mx-auto px-4 max-w-lg pt-8">
            <button onClick={() => setMode("main")}
              className="flex items-center gap-1.5 text-white/40 hover:text-white text-sm mb-8 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Store
            </button>

            {/* Profile header */}
            <div className="flex flex-col items-center text-center mb-8">
              <div className="relative mb-4">
                <HannahAvatar size="lg" />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-400 border-2 border-black" />
              </div>
              <h1 className="text-3xl font-serif font-bold text-white mb-1">Custom Content</h1>
              <p className="text-white/40 text-sm">Tell Hannah exactly what you want — she'll make it happen.</p>
              <div className="flex items-center gap-2 mt-3 rounded-full px-4 py-1.5 border"
                style={{ background: "rgba(201,168,76,0.08)", borderColor: "rgba(201,168,76,0.2)" }}>
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-amber-400 text-xs font-medium">Delivered within 48–72 hours</span>
              </div>
            </div>

            <div className="rounded-3xl p-6 space-y-4"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>

              {/* Content type */}
              <div>
                <label className="text-xs font-bold text-white/30 tracking-widest uppercase block mb-3">Content Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {REQUEST_TYPES.map(rt => (
                    <div key={rt.id} onClick={() => setRequestType(rt.id)}
                      className={`cursor-pointer rounded-xl border p-3 text-center transition-all ${
                        requestType === rt.id ? "border-amber-400 bg-amber-400/5" : "border-white/10 hover:border-white/20"
                      }`}>
                      <div className="flex justify-center mb-1.5 text-amber-400">{rt.icon}</div>
                      <p className="text-white text-xs font-bold">{rt.label}</p>
                      <p className="text-white/30 text-[10px] mt-0.5 leading-tight">{rt.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="Your name"
                  className="pl-9 bg-black/50 border-white/10 text-white h-12 rounded-xl placeholder:text-white/20 focus-visible:ring-amber-400/40" />
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com"
                  className="pl-9 bg-black/50 border-white/10 text-white h-12 rounded-xl placeholder:text-white/20 focus-visible:ring-amber-400/40" />
              </div>
              <Textarea value={description} onChange={e => setDescription(e.target.value)}
                placeholder="Be specific — outfit, setting, tone, anything special you'd like…"
                className="min-h-[110px] bg-black/50 border-white/10 text-white rounded-xl placeholder:text-white/20 focus-visible:ring-amber-400/40 resize-none" />

              {/* Price + button */}
              <div className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-white/60 text-sm">Custom {REQUEST_TYPES.find(r => r.id === requestType)?.label}</span>
                  <span className="text-2xl font-black text-amber-400">${config.requestPrice}</span>
                </div>
              </div>

              <button onClick={handlePayRequest} disabled={paying}
                className="w-full h-14 rounded-2xl font-black text-lg text-black flex items-center justify-center gap-2 transition-all active:scale-[0.99] hover:scale-[1.01] disabled:opacity-60 shadow-xl shadow-amber-400/20"
                style={{ background: "linear-gradient(135deg,#c9a84c,#f0d080,#c9a84c)" }}>
                {paying
                  ? <><span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Processing…</>
                  : <>Pay & Submit Request · ${config.requestPrice}</>
                }
              </button>
              <p className="text-center text-white/20 text-xs flex items-center justify-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Secure payment · Delivered privately
              </p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (mode === "tip") {
    return (
      <Layout>
        <div className="min-h-screen pb-20" style={{ background: "radial-gradient(ellipse at top,#1a1000 0%,#060606 70%)" }}>
          <div className="container mx-auto px-4 max-w-md pt-8">
            <button onClick={() => setMode("main")}
              className="flex items-center gap-1.5 text-white/40 hover:text-white text-sm mb-8 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Store
            </button>

            <div className="flex flex-col items-center text-center mb-8">
              <div className="relative mb-4">
                <HannahAvatar size="lg" />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-400 border-2 border-black" />
              </div>
              <h1 className="text-3xl font-serif font-bold text-white mb-1">Send a Tip 💕</h1>
              <p className="text-white/40 text-sm">Your support means the world to Hannah.</p>
            </div>

            <div className="rounded-3xl p-6 space-y-4"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>

              <div>
                <label className="text-xs font-bold text-white/30 tracking-widest uppercase block mb-3">Choose Amount</label>
                <div className="grid grid-cols-5 gap-2 mb-3">
                  {TIP_PRESETS.map(p => (
                    <button key={p} onClick={() => setTipAmount(String(p))}
                      className={`py-2.5 rounded-xl text-sm font-bold transition-all border ${
                        tipAmount === String(p)
                          ? "border-amber-400 bg-amber-400/10 text-amber-400 shadow-sm shadow-amber-400/20"
                          : "border-white/10 text-white/60 hover:border-white/20 hover:text-white"
                      }`}>
                      ${p}
                    </button>
                  ))}
                </div>
                <Input type="number" min={config.tipMin} value={tipAmount} onChange={e => setTipAmount(e.target.value)}
                  placeholder={`Custom (min $${config.tipMin})`}
                  className="bg-black/50 border-white/10 text-white h-12 rounded-xl placeholder:text-white/20 focus-visible:ring-amber-400/40" />
              </div>

              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="Your name"
                  className="pl-9 bg-black/50 border-white/10 text-white h-12 rounded-xl placeholder:text-white/20 focus-visible:ring-amber-400/40" />
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com"
                  className="pl-9 bg-black/50 border-white/10 text-white h-12 rounded-xl placeholder:text-white/20 focus-visible:ring-amber-400/40" />
              </div>
              <Textarea value={tipMessage} onChange={e => setTipMessage(e.target.value)}
                placeholder="Leave Hannah a sweet note… (optional)"
                className="bg-black/50 border-white/10 text-white rounded-xl placeholder:text-white/20 focus-visible:ring-amber-400/40 min-h-[80px] resize-none" />

              <button onClick={handlePayTip} disabled={paying}
                className="w-full h-14 rounded-2xl font-black text-lg text-black flex items-center justify-center gap-2 transition-all active:scale-[0.99] hover:scale-[1.01] disabled:opacity-60 shadow-xl shadow-pink-400/10"
                style={{ background: "linear-gradient(135deg,#ec4899,#f472b6,#ec4899)" }}>
                {paying
                  ? <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing…</>
                  : <><Heart className="w-5 h-5" /> Send ${tipAmount || config.tipMin} Tip 💕</>
                }
              </button>
              <p className="text-center text-white/20 text-xs flex items-center justify-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Secure · Hannah sees every tip personally
              </p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Main store landing
  return (
    <Layout>
      <div className="min-h-screen" style={{ background: "radial-gradient(ellipse at top,#1a1000 0%,#060606 70%)" }}>

        {/* Header */}
        <div className="pt-16 pb-10 flex flex-col items-center text-center px-4">
          <div className="relative mb-5">
            <HannahAvatar size="lg" />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-400 border-2 border-[#060606]" />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-2">Hannah's Boutique</h1>
          <p className="text-white/40 max-w-md">Custom content, personal requests, and a tip jar — all just for you.</p>
        </div>

        <div className="container mx-auto px-4 max-w-2xl pb-20">
          <div className="grid gap-4">

            {/* Custom Request card */}
            <div onClick={() => setMode("request")}
              className="group cursor-pointer rounded-3xl p-6 border transition-all hover:border-amber-400/30 hover:shadow-[0_8px_30px_rgba(201,168,76,0.08)]"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 text-amber-400"
                  style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.2)" }}>
                  <Wand2 className="w-7 h-7" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h2 className="text-xl font-serif font-bold text-white">Custom Content</h2>
                    <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                  </div>
                  <p className="text-white/40 text-sm mb-3 leading-relaxed">Order a bespoke photo set or video made exactly to your specs. Hannah creates it personally just for you.</p>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex gap-2">
                      {["Photo Set", "Video Clip", "Special"].map(t => (
                        <span key={t} className="text-[11px] border border-amber-400/30 text-amber-400/70 px-2.5 py-0.5 rounded-full">{t}</span>
                      ))}
                    </div>
                    <span className="font-black text-xl text-amber-400">${config.requestPrice}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tip card */}
            <div onClick={() => setMode("tip")}
              className="group cursor-pointer rounded-3xl p-6 border transition-all hover:border-pink-500/30 hover:shadow-[0_8px_30px_rgba(236,72,153,0.06)]"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 text-pink-400"
                  style={{ background: "rgba(236,72,153,0.1)", border: "1px solid rgba(236,72,153,0.2)" }}>
                  <Heart className="w-7 h-7" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h2 className="text-xl font-serif font-bold text-white">Send a Tip</h2>
                    <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-pink-400 group-hover:translate-x-1 transition-all" />
                  </div>
                  <p className="text-white/40 text-sm mb-3">Show some love — every tip is seen and felt by Hannah personally.</p>
                  <span className="text-pink-400 font-bold">From ${config.tipMin} 💕</span>
                </div>
              </div>
            </div>

            {/* VIP upsell */}
            <div className="rounded-3xl border border-amber-400/20 p-6 text-center"
              style={{ background: "linear-gradient(135deg, rgba(201,168,76,0.05), rgba(0,0,0,0))" }}>
              <Crown className="w-9 h-9 text-amber-400 mx-auto mb-3" />
              <h3 className="text-xl font-serif font-bold text-white mb-2">More with VIP</h3>
              <p className="text-white/40 text-sm mb-5 max-w-sm mx-auto">Members get priority request slots, discounts on calls, and direct chat access. From ${config.subMonthly}/month.</p>
              <Link href="/members">
                <button className="inline-flex h-11 items-center gap-2 rounded-full px-8 font-bold text-sm text-black hover:scale-105 transition-transform"
                  style={{ background: "linear-gradient(135deg,#c9a84c,#f0d080,#c9a84c)" }}>
                  <Lock className="w-3.5 h-3.5" /> Unlock VIP Access
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
