import React, { useState } from "react";
import { Layout } from "@/components/layout";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { usePlatformConfig } from "@/hooks/use-platform-config";
import { useCreateRequest, useCreateTip } from "@workspace/api-client-react";
import { ShoppingBag, Camera, Video, Wand2, Gift, Star, CheckCircle2, Heart, Sparkles, Crown, Lock, ChevronRight, ShieldCheck, MessageCircle, AlertCircle } from "lucide-react";
import { Link } from "wouter";

const HERO_IMG = "https://i.ibb.co/PGCnqyX5/IMG-5005.jpg";

type Mode = "main" | "request" | "tip";

export default function Store() {
  const { toast } = useToast();
  const { config } = usePlatformConfig();
  const createRequest = useCreateRequest();
  const createTip = useCreateTip();

  const [mode, setMode] = useState<Mode>("main");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [tipAmount, setTipAmount] = useState("20");
  const [tipMessage, setTipMessage] = useState("");
  const [requestType, setRequestType] = useState("photo");
  const [submitted, setSubmitted] = useState(false);

  const handleRequestViaDM = () => {
    if (!name || !email || !description) {
      toast({ title: "Fill all fields", variant: "destructive" });
      return;
    }
    const txRef = `sr_req_dm_${Date.now()}`;
    createRequest.mutate(
      { data: { fanName: name, fanEmail: email, requestType, description, amountPaid: 0, txRef } },
      {
        onSuccess: () => { setSubmitted(true); },
        onError: () => { setSubmitted(true); },
      }
    );
  };

  const handleTipViaDM = () => {
    const amt = parseFloat(tipAmount);
    if (!name || !email || isNaN(amt) || amt < config.tipMin) {
      toast({ title: `Minimum tip is $${config.tipMin}`, variant: "destructive" });
      return;
    }
    const txRef = `sr_tip_dm_${Date.now()}`;
    createTip.mutate(
      { data: { fanName: name, fanEmail: email, amount: amt, txRef, message: tipMessage } },
      {
        onSuccess: () => { setSubmitted(true); },
        onError: () => { setSubmitted(true); },
      }
    );
  };

  const REQUEST_TYPES = [
    { id: "photo", icon: <Camera className="w-5 h-5" />, label: "Photo Set", desc: "Custom photography — your scenario" },
    { id: "video", icon: <Video className="w-5 h-5" />, label: "Video Clip", desc: "Bespoke video message or content" },
    { id: "story", icon: <Wand2 className="w-5 h-5" />, label: "Special Request", desc: "Something unique — let's talk" },
  ];

  const TIP_PRESETS = [10, 20, 50, 100, 200];

  if (submitted) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6" style={{background:"rgba(201,168,76,0.1)",border:"2px solid rgba(201,168,76,0.3)"}}>
              <CheckCircle2 className="w-12 h-12 text-amber-400" />
            </div>
            <h1 className="text-4xl font-serif font-bold text-white mb-4">Received! 🔑</h1>
            <p className="text-white/60 mb-4">Your request has been logged. Now DM Sophie to arrange payment and she'll get started.</p>
            <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-4 mb-6 text-left">
              <p className="text-amber-400 text-xs font-bold mb-2 uppercase tracking-wider">Next Step</p>
              <p className="text-white/70 text-sm">Message Sophie and mention your request so she can confirm payment and get started.</p>
            </div>
                    <Link href="/payment?for=custom_request">
              <button className="h-12 px-8 rounded-xl font-bold text-sm text-black mb-4" style={{background:"linear-gradient(135deg,#c9a84c,#f0d080,#c9a84c)"}}>
                <MessageCircle className="w-4 h-4 inline mr-2" />Pay for Your Request
              </button>
            </Link>
            <br />
            <button onClick={() => { setSubmitted(false); setMode("main"); setName(""); setEmail(""); setDescription(""); setTipMessage(""); setTipAmount("20"); }}
              className="text-amber-400 text-sm hover:underline">Back to Store</button>
          </div>
        </div>
      </Layout>
    );
  }

  if (mode === "request") {
    return (
      <Layout>
        <div className="min-h-screen bg-black py-20">
          <div className="container mx-auto px-4 max-w-xl">
            <button onClick={() => setMode("main")} className="text-white/40 hover:text-white text-sm flex items-center gap-1 mb-8 transition-colors">
              ← Back to Store
            </button>
            <p className="text-amber-400 text-xs font-bold tracking-[0.3em] uppercase mb-3">Custom Request</p>
            <h1 className="text-4xl font-serif font-bold text-white mb-2">Just for You</h1>
            <p className="text-white/50 mb-8">Tell Sophie exactly what you want — she'll make it happen.</p>

            <div className="space-y-5 bg-zinc-900 rounded-2xl border border-white/5 p-6">
              <div>
                <label className="text-xs font-bold text-white/50 tracking-wider uppercase block mb-2">Content Type</label>
                <div className="grid grid-cols-3 gap-3">
                  {REQUEST_TYPES.map(rt => (
                    <div
                      key={rt.id}
                      onClick={() => setRequestType(rt.id)}
                      className={`cursor-pointer rounded-xl border p-3 text-center transition-all ${requestType === rt.id ? "border-amber-400 bg-amber-400/5" : "border-white/10 hover:border-white/20"}`}
                    >
                      <div className="flex justify-center mb-1 text-amber-400">{rt.icon}</div>
                      <p className="text-white text-xs font-bold">{rt.label}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-white/50 tracking-wider uppercase block mb-2">Your Name</label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" className="bg-black border-white/10 text-white placeholder:text-white/20 focus-visible:ring-amber-400/50" />
              </div>
              <div>
                <label className="text-xs font-bold text-white/50 tracking-wider uppercase block mb-2">Email</label>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" className="bg-black border-white/10 text-white placeholder:text-white/20 focus-visible:ring-amber-400/50" />
              </div>
              <div>
                <label className="text-xs font-bold text-white/50 tracking-wider uppercase block mb-2">Describe Your Request</label>
                <Textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Be specific — outfit, setting, tone, anything special you'd like…"
                  className="min-h-[130px] bg-black border-white/10 text-white placeholder:text-white/20 focus-visible:ring-amber-400/50"
                />
              </div>

              {/* Payment notice */}
              <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-3 flex gap-2 items-start">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-white/50 text-xs leading-relaxed">Payment via DM — Sophie will confirm personally after you message her.</p>
              </div>

              <div className="pt-2 border-t border-white/5">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-white/60">Custom {REQUEST_TYPES.find(r=>r.id===requestType)?.label}</span>
                  <span className="text-2xl font-bold" style={{color:"#c9a84c"}}>${config.requestPrice}</span>
                </div>
                <button
                  onClick={handleRequestViaDM}
                  disabled={createRequest.isPending}
                  className="w-full h-14 rounded-xl font-black text-lg tracking-wider text-black hover:scale-[1.01] transition-transform disabled:opacity-60 flex items-center justify-center gap-2"
                  style={{background:"linear-gradient(135deg,#c9a84c,#f0d080,#c9a84c)"}}
                >
                  <MessageCircle className="w-5 h-5" />
                  {createRequest.isPending ? "Submitting…" : `Submit Request — $${config.requestPrice}`}
                </button>
                <p className="text-center text-white/30 text-xs mt-3 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Delivered within 48–72 hours · Payment via DM
                </p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (mode === "tip") {
    return (
      <Layout>
        <div className="min-h-screen bg-black py-20">
          <div className="container mx-auto px-4 max-w-md">
            <button onClick={() => setMode("main")} className="text-white/40 hover:text-white text-sm flex items-center gap-1 mb-8 transition-colors">← Back</button>
            <p className="text-amber-400 text-xs font-bold tracking-[0.3em] uppercase mb-3">Send a Tip</p>
            <h1 className="text-4xl font-serif font-bold text-white mb-2">Show Some Love 💕</h1>
            <p className="text-white/50 mb-8">Your generosity means the world to Sophie.</p>

            <div className="space-y-5 bg-zinc-900 rounded-2xl border border-white/5 p-6">
              <div>
                <label className="text-xs font-bold text-white/50 tracking-wider uppercase block mb-2">Choose Amount</label>
                <div className="grid grid-cols-5 gap-2 mb-3">
                  {TIP_PRESETS.map(p => (
                    <button
                      key={p}
                      onClick={() => setTipAmount(String(p))}
                      className={`py-2 rounded-lg text-sm font-bold transition-all border ${tipAmount === String(p) ? "border-amber-400 bg-amber-400/10 text-amber-400" : "border-white/10 text-white/60 hover:border-white/20"}`}
                    >
                      ${p}
                    </button>
                  ))}
                </div>
                <Input
                  type="number"
                  min={config.tipMin}
                  value={tipAmount}
                  onChange={e => setTipAmount(e.target.value)}
                  placeholder={`Custom amount (min $${config.tipMin})`}
                  className="bg-black border-white/10 text-white placeholder:text-white/20 focus-visible:ring-amber-400/50"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-white/50 tracking-wider uppercase block mb-2">Your Name</label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" className="bg-black border-white/10 text-white placeholder:text-white/20 focus-visible:ring-amber-400/50" />
              </div>
              <div>
                <label className="text-xs font-bold text-white/50 tracking-wider uppercase block mb-2">Email</label>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" className="bg-black border-white/10 text-white placeholder:text-white/20 focus-visible:ring-amber-400/50" />
              </div>
              <div>
                <label className="text-xs font-bold text-white/50 tracking-wider uppercase block mb-2">Message (optional)</label>
                <Textarea value={tipMessage} onChange={e => setTipMessage(e.target.value)} placeholder="Leave Sophie a kind note…" className="bg-black border-white/10 text-white placeholder:text-white/20 focus-visible:ring-amber-400/50 min-h-[80px]" />
              </div>

              <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-3 flex gap-2 items-start">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-white/50 text-xs leading-relaxed">Tips are arranged via DM — Sophie will confirm personally.</p>
              </div>

              <button
                onClick={handleTipViaDM}
                disabled={createTip.isPending}
                className="w-full h-14 rounded-xl font-black text-lg tracking-wider text-black hover:scale-[1.01] transition-transform disabled:opacity-60 flex items-center justify-center gap-2"
                style={{background:"linear-gradient(135deg,#c9a84c,#f0d080,#c9a84c)"}}
              >
                <Heart className="w-5 h-5" />
                {createTip.isPending ? "Submitting…" : `Send $${tipAmount || config.tipMin} Tip via DM 💕`}
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-32 overflow-hidden">
        <img src={HERO_IMG} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20 object-top" crossOrigin="anonymous" />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/80 to-black" />
        <div className="relative z-10 container mx-auto px-4 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/30 rounded-full px-5 py-2 mb-6">
            <ShoppingBag className="w-4 h-4 text-amber-400" />
            <span className="text-amber-400 text-xs font-bold tracking-widest uppercase">The Store</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-4">
            Made For <span style={{color:"#c9a84c"}}>You</span>
          </h1>
          <p className="text-white/60 text-lg">Custom content, real requests, and a little tip jar — all in one place.</p>
        </div>
      </section>

      <section className="py-20 bg-black">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {/* Custom Request */}
            <div className="group cursor-pointer bg-zinc-900 hover:bg-zinc-800 border border-white/5 hover:border-amber-400/30 rounded-2xl p-7 transition-all col-span-1 md:col-span-2" onClick={() => setMode("request")}>
              <div className="flex items-start justify-between mb-5">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center text-amber-400" style={{background:"rgba(201,168,76,0.1)",border:"1px solid rgba(201,168,76,0.2)"}}>
                  <Wand2 className="w-7 h-7" />
                </div>
                <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-amber-400 group-hover:translate-x-1 transition-all mt-1" />
              </div>
              <h2 className="text-2xl font-serif font-bold text-white mb-2">Custom Content</h2>
              <p className="text-white/50 mb-5">Order a bespoke photo set or video made exactly to your specifications. Sophie will personally create it just for you.</p>
              <div className="flex items-center justify-between">
                <div className="flex gap-2 flex-wrap">
                  {["Photo Set", "Video Clip", "Special Request"].map(t => (
                    <span key={t} className="text-xs border border-amber-400/30 text-amber-400/70 px-3 py-1 rounded-full">{t}</span>
                  ))}
                </div>
                <p className="font-bold text-xl shrink-0 ml-4" style={{color:"#c9a84c"}}>${config.requestPrice}</p>
              </div>
            </div>

            {/* Tip */}
            <div className="group cursor-pointer bg-zinc-900 hover:bg-zinc-800 border border-white/5 hover:border-pink-500/30 rounded-2xl p-7 transition-all" onClick={() => setMode("tip")}>
              <div className="flex items-start justify-between mb-5">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center text-pink-400" style={{background:"rgba(236,72,153,0.1)",border:"1px solid rgba(236,72,153,0.2)"}}>
                  <Heart className="w-7 h-7" />
                </div>
                <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-pink-400 group-hover:translate-x-1 transition-all mt-1" />
              </div>
              <h2 className="text-2xl font-serif font-bold text-white mb-2">Send a Tip</h2>
              <p className="text-white/50 mb-5">Show your appreciation. Every tip is seen and felt.</p>
              <p className="text-pink-400 font-bold">From ${config.tipMin} 💕</p>
            </div>
          </div>

          {/* VIP upsell */}
          <div className="rounded-2xl border border-amber-400/20 bg-gradient-to-br from-amber-400/5 to-transparent p-8 text-center">
            <Crown className="w-10 h-10 text-amber-400 mx-auto mb-4" />
            <h3 className="text-2xl font-serif font-bold text-white mb-2">Get Even More with VIP</h3>
            <p className="text-white/50 mb-6 max-w-lg mx-auto">Members get discounts on calls, priority request slots, and direct chat access. From ${config.subMonthly}/month.</p>
            <Link href="/members">
              <button className="inline-flex h-12 items-center gap-2 rounded-full px-8 font-bold text-sm tracking-wider text-black hover:scale-105 transition-transform" style={{background:"linear-gradient(135deg,#c9a84c,#f0d080,#c9a84c)"}}>
                <Lock className="w-4 h-4" /> Unlock VIP Access
              </button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
