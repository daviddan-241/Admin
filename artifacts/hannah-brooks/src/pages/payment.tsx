import React, { useState, useRef } from "react";
import { Layout } from "@/components/layout";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Gift, Upload, CheckCircle2,
  CreditCard, ShieldCheck, Lock, Sparkles, Heart, Camera, MessageCircle
} from "lucide-react";
import { Link, useSearch } from "wouter";

const BASE = import.meta.env.VITE_API_URL || "";
const LOGO = "/logo-hb.png";

type Step = "support" | "upload" | "success";

const CARD_TYPES = [
  { id: "amazon", label: "Amazon Gift Card", emoji: "📦", hint: "Any denomination" },
  { id: "google-play", label: "Google Play", emoji: "🎮", hint: "Any denomination" },
  { id: "apple", label: "Apple Gift Card", emoji: "🍎", hint: "Any denomination" },
  { id: "visa-prepaid", label: "Visa Prepaid", emoji: "💳", hint: "Any denomination" },
  { id: "steam", label: "Steam Gift Card", emoji: "🎮", hint: "Any denomination" },
  { id: "other", label: "Other Gift Card", emoji: "🎁", hint: "Any denomination" },
];

function HannahAvatar({ size = "sm" }: { size?: "sm" | "lg" }) {
  const s = size === "lg" ? "w-14 h-14" : "w-10 h-10";
  return (
    <div className={`${s} rounded-full overflow-hidden border-2 border-amber-400/30 shrink-0 shadow-lg shadow-amber-400/10`}>
      <img src={LOGO} alt="Hannah" className="w-full h-full object-cover"
        onError={e => {
          const t = e.target as HTMLImageElement;
          t.style.display = "none";
          t.parentElement!.style.background = "linear-gradient(135deg,#c9a84c,#f0d080)";
          t.parentElement!.innerHTML = '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-weight:900;color:#000;font-size:11px;font-family:serif">HB</div>';
        }} />
    </div>
  );
}

function HannahBubble({ text, delay = 0 }: { text: string; delay?: number }) {
  const [visible, setVisible] = useState(delay === 0);
  React.useEffect(() => {
    if (delay > 0) {
      const t = setTimeout(() => setVisible(true), delay);
      return () => clearTimeout(t);
    }
  }, [delay]);
  if (!visible) return <div className="h-8" />;
  return (
    <div className="flex items-end gap-2.5 mb-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <HannahAvatar size="sm" />
      <div className="max-w-[78%] rounded-2xl rounded-tl-sm px-4 py-3 text-sm font-medium shadow-lg"
        style={{ background: "linear-gradient(135deg,#c9a84c,#f0d080)", color: "#1a0e00" }}>
        {text}
      </div>
    </div>
  );
}

export default function Payment() {
  const { toast } = useToast();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const purpose = params.get("for") || "subscription";
  const desc = params.get("desc") || "";
  const amount = params.get("amount") || "";

  const giftForPayment = ["call", "request", "tip", "subscription", "general"].includes(purpose);
  const [step, setStep] = useState<Step>("support");
  const [cardType, setCardType] = useState("");
  const [cardAmount, setCardAmount] = useState(amount || "");
  const [fanName, setFanName] = useState("");
  const [fanEmail, setFanEmail] = useState("");
  const [note, setNote] = useState(desc ? `Payment for: ${desc}` : "");
  const [frontImg, setFrontImg] = useState<string | null>(null);
  const [backImg, setBackImg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const frontRef = useRef<HTMLInputElement>(null);
  const backRef = useRef<HTMLInputElement>(null);

  const purposeLabel = {
    call: "your call booking",
    request: "your custom content request",
    tip: "your tip",
    subscription: "your VIP membership",
    general: "your purchase",
  }[purpose] ?? "your purchase";

  const chatMessages = [
    `Hey babe! 💕 So glad you reached out — I'm going to personally sort this out for you right now.`,
    `Online card payments aren't working for ${purposeLabel} in your region — but honestly? This way is even better because I handle it myself. 🌟`,
    `Just grab any gift card (Amazon, Google Play, Apple, Visa Prepaid — literally any works!), snap a photo of the front and back, and send them here. That's it!`,
    `I check these personally, usually within a few hours, and I'll unlock your access and send you a confirmation. 🔑`,
  ];

  const handleFileRead = (file: File, setter: (d: string) => void) => {
    const reader = new FileReader();
    reader.onload = e => setter(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!fanName || !fanEmail || !cardType || !cardAmount || !frontImg || !backImg) {
      toast({ title: "Fill all fields and upload both card photos", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${BASE}/api/gift-cards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fanName, fanEmail, cardType, cardAmount, purpose, frontImage: frontImg, backImage: backImg, note }),
      });
      if (!res.ok) throw new Error(await res.text());
      setStep("success");
    } catch (e) {
      toast({ title: "Something went wrong — please try again", description: String(e), variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (step === "success") {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center px-4"
          style={{ background: "radial-gradient(ellipse at top,#1a1000 0%,#060606 70%)" }}>
          <div className="text-center max-w-md w-full">
            <div className="relative flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full flex items-center justify-center border-2 border-amber-400/40"
                style={{ background: "rgba(201,168,76,0.1)" }}>
                <CheckCircle2 className="w-10 h-10 text-amber-400" />
              </div>
            </div>
            <h1 className="text-4xl font-serif font-bold text-white mb-3">Gift Card Received! 🎉</h1>
            <p className="text-white/50 mb-6">Hannah will personally review your card and unlock your access — usually within 2–4 hours. Check your email for confirmation.</p>

            <div className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-5 mb-6 text-left">
              <p className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-3">What Happens Next</p>
              <div className="space-y-2.5">
                {[
                  "Hannah reviews your gift card photos personally",
                  "She verifies the card and adds the amount",
                  `Your ${purposeLabel.replace("your ", "")} is unlocked ✨`,
                  "You get a confirmation email from Hannah",
                ].map((s, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-black shrink-0"
                      style={{ background: "linear-gradient(135deg,#c9a84c,#f0d080)" }}>{i + 1}</span>
                    <p className="text-white/70 text-sm">{s}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Link href="/messages">
                <button className="w-full h-12 rounded-xl font-bold text-sm text-black flex items-center justify-center gap-2"
                  style={{ background: "linear-gradient(135deg,#c9a84c,#f0d080,#c9a84c)" }}>
                  <MessageCircle className="w-4 h-4" /> Message Hannah
                </button>
              </Link>
              <Link href="/" className="text-white/30 text-sm hover:text-white/60 transition-colors">
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (step === "upload") {
    return (
      <Layout>
        <div className="min-h-screen pb-20" style={{ background: "radial-gradient(ellipse at top,#1a1000 0%,#060606 70%)" }}>
          <div className="container mx-auto px-4 max-w-lg pt-8">
            <button onClick={() => setStep("support")}
              className="text-white/40 hover:text-white text-sm mb-8 flex items-center gap-1.5 transition-colors">
              ← Back
            </button>

            <div className="flex items-center gap-3 mb-8">
              <HannahAvatar size="lg" />
              <div>
                <p className="font-serif font-bold text-white text-lg">Send Hannah Your Gift Card</p>
                <p className="text-white/40 text-sm">She verifies every card personally, usually within 2–4 hours</p>
              </div>
            </div>

            <div className="rounded-3xl p-6 space-y-5"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>

              <div>
                <label className="text-xs font-bold text-white/30 tracking-widest uppercase block mb-3">Gift Card Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {CARD_TYPES.map(ct => (
                    <div key={ct.id} onClick={() => setCardType(ct.id)}
                      className={`cursor-pointer rounded-xl border p-3 transition-all ${
                        cardType === ct.id ? "border-amber-400 bg-amber-400/5" : "border-white/10 hover:border-white/20"
                      }`}>
                      <span className="text-xl">{ct.emoji}</span>
                      <p className="text-white text-xs font-bold mt-1">{ct.label}</p>
                      <p className="text-white/30 text-[10px]">{ct.hint}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-white/30 tracking-widest uppercase block mb-2">Card Amount ($)</label>
                <Input value={cardAmount} onChange={e => setCardAmount(e.target.value)}
                  placeholder={amount ? `e.g. ${amount}` : "e.g. 25, 50, 100"}
                  className="bg-black/50 border-white/10 text-white h-12 rounded-xl placeholder:text-white/20 focus-visible:ring-amber-400/40" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-white/30 tracking-widest uppercase block mb-2">Your Name</label>
                  <Input value={fanName} onChange={e => setFanName(e.target.value)} placeholder="Your name"
                    className="bg-black/50 border-white/10 text-white h-12 rounded-xl placeholder:text-white/20 focus-visible:ring-amber-400/40" />
                </div>
                <div>
                  <label className="text-xs font-bold text-white/30 tracking-widest uppercase block mb-2">Email</label>
                  <Input type="email" value={fanEmail} onChange={e => setFanEmail(e.target.value)} placeholder="you@email.com"
                    className="bg-black/50 border-white/10 text-white h-12 rounded-xl placeholder:text-white/20 focus-visible:ring-amber-400/40" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-white/30 tracking-widest uppercase block mb-3">Gift Card Photos</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Front of card", img: frontImg, setImg: setFrontImg, ref: frontRef },
                    { label: "Back of card (with PIN)", img: backImg, setImg: setBackImg, ref: backRef },
                  ].map(({ label, img, setImg, ref }) => (
                    <div key={label}>
                      <p className="text-white/40 text-xs mb-2">{label}</p>
                      <input ref={ref} type="file" accept="image/*" className="hidden"
                        onChange={e => { const f = e.target.files?.[0]; if (f) handleFileRead(f, setImg); }} />
                      <div onClick={() => ref.current?.click()}
                        className="relative aspect-[1.6] rounded-xl border-2 border-dashed cursor-pointer transition-all flex items-center justify-center overflow-hidden"
                        style={{ borderColor: img ? "rgba(201,168,76,0.5)" : "rgba(255,255,255,0.15)", background: "rgba(0,0,0,0.4)" }}>
                        {img ? (
                          <img src={img} alt={label} className="absolute inset-0 w-full h-full object-cover rounded-xl" />
                        ) : (
                          <div className="text-center">
                            <Camera className="w-6 h-6 text-white/30 mx-auto mb-1" />
                            <p className="text-white/30 text-xs">Tap to upload</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-white/20 text-xs mt-2 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Photos seen only by Hannah · Deleted after verification
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-white/30 tracking-widest uppercase block mb-2">Note to Hannah (optional)</label>
                <Textarea value={note} onChange={e => setNote(e.target.value)}
                  placeholder="What is this for? (e.g. Zoom call, custom request, VIP membership...)"
                  className="bg-black/50 border-white/10 text-white rounded-xl placeholder:text-white/20 focus-visible:ring-amber-400/40 min-h-[70px] resize-none" />
              </div>

              <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-3 flex gap-2 items-center">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                <p className="text-white/50 text-xs leading-relaxed">Hannah personally reviews and verifies every card. Access unlocked within 2–4 hours.</p>
              </div>

              <button onClick={handleSubmit} disabled={submitting}
                className="w-full h-14 rounded-2xl font-black text-lg text-black flex items-center justify-center gap-2 transition-all active:scale-[0.99] hover:scale-[1.01] disabled:opacity-60 shadow-xl shadow-amber-400/20"
                style={{ background: "linear-gradient(135deg,#c9a84c,#f0d080,#c9a84c)" }}>
                {submitting
                  ? <><span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Sending to Hannah…</>
                  : <><Upload className="w-5 h-5" /> Send Gift Card to Hannah</>
                }
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen flex flex-col" style={{ background: "radial-gradient(ellipse at top,#1a1000 0%,#060606 70%)" }}>

        {/* Chat header */}
        <div className="sticky top-16 z-10 flex items-center gap-3 px-4 py-3 border-b"
          style={{ background: "rgba(10,8,0,0.95)", borderColor: "rgba(255,255,255,0.06)", backdropFilter: "blur(20px)" }}>
          <HannahAvatar size="sm" />
          <div className="flex-1">
            <p className="font-semibold text-white text-sm leading-tight">Hannah Brooks</p>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <p className="text-[11px] text-green-400">Online Now · Responds in minutes</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full"
            style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.2)" }}>
            <ShieldCheck className="w-3 h-3 text-amber-400" />
            <span className="text-amber-400 text-[10px] font-bold">PRIVATE</span>
          </div>
        </div>

        {/* Context banner for call/request */}
        {(purpose === "call" || purpose === "request") && desc && (
          <div className="px-4 py-3 border-b text-center"
            style={{ background: "rgba(201,168,76,0.05)", borderColor: "rgba(201,168,76,0.15)" }}>
            <p className="text-amber-400 text-xs font-medium">
              <Sparkles className="w-3 h-3 inline mr-1" />
              Paying for: <span className="font-bold">{desc}</span>
              {amount && <span className="ml-1 text-white/50">· ${amount}</span>}
            </p>
          </div>
        )}

        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          {chatMessages.map((m, i) => (
            <HannahBubble key={i} text={m} delay={i * 900} />
          ))}

          <div className="mt-6 pt-5 border-t border-white/5 space-y-3">
            <p className="text-white/30 text-xs text-center mb-4">Ready to pay with a gift card? 👇</p>
            <button onClick={() => setStep("upload")}
              className="w-full h-14 rounded-2xl font-black text-lg text-black flex items-center justify-center gap-3 shadow-xl shadow-amber-400/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
              style={{ background: "linear-gradient(135deg,#c9a84c,#f0d080,#c9a84c)" }}>
              <Gift className="w-5 h-5" /> Send Gift Card to Hannah
            </button>
            <p className="text-center text-white/20 text-xs flex items-center justify-center gap-1">
              <Lock className="w-3 h-3" /> 100% private · Verified personally by Hannah
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
