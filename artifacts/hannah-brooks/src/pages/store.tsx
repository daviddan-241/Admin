import React, { useEffect, useState } from "react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useCreateRequest, useCreateTip } from "@workspace/api-client-react";
import { ShoppingBag, Video, Send, Gift, Wand2, MessageCircle, Star, ChevronRight, Heart, Sparkles, Lock, Camera, Music } from "lucide-react";
import { Link } from "wouter";

const WHATSAPP_NUMBER = "447700000000";

export default function Store() {
  const { toast } = useToast();
  const createRequest = useCreateRequest();
  const createTip = useCreateTip();

  const [mode, setMode] = useState<"main" | "request" | "tip">("main");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [requestType, setRequestType] = useState("photo");
  const REQUEST_PRICE = 14.99;

  useEffect(() => {
    const s = document.createElement("script");
    s.src = "https://checkout.flutterwave.com/v3.js";
    s.async = true;
    document.body.appendChild(s);
    return () => { document.body.removeChild(s); };
  }, []);

  const handleRequestPayment = () => {
    if (!name || !email || !description) {
      toast({ title: "Missing fields", description: "Please fill out all fields.", variant: "destructive" });
      return;
    }
    if (typeof window.FlutterwaveCheckout !== "function") return;
    const txRef = `hb_req_${Date.now()}`;
    window.FlutterwaveCheckout({
      public_key: "FLWPUBK_TEST-REPLACE-WITH-YOUR-KEY",
      tx_ref: txRef, amount: REQUEST_PRICE, currency: "USD", payment_options: "card",
      customer: { email, name },
      customizations: { title: "Hannah Brooks", description: "Custom Content Request" },
      callback: (data: any) => {
        if (data.status === "successful") {
          createRequest.mutate({ data: { fanName: name, fanEmail: email, requestType, description, amountPaid: REQUEST_PRICE, txRef } }, {
            onSuccess: () => { toast({ title: "Request submitted!", description: "Hannah will get to work on it soon." }); setMode("main"); setDescription(""); setName(""); setEmail(""); },
          });
        }
      },
      onclose: () => {},
    });
  };

  const handleTipPayment = () => {
    const tipAmount = parseFloat(amount);
    if (!name || !email || isNaN(tipAmount) || tipAmount < 1) {
      toast({ title: "Invalid input", description: "Please enter a valid amount (min $1).", variant: "destructive" });
      return;
    }
    if (typeof window.FlutterwaveCheckout !== "function") return;
    const txRef = `hb_tip_${Date.now()}`;
    window.FlutterwaveCheckout({
      public_key: "FLWPUBK_TEST-REPLACE-WITH-YOUR-KEY",
      tx_ref: txRef, amount: tipAmount, currency: "USD", payment_options: "card",
      customer: { email, name },
      customizations: { title: "Hannah Brooks", description: "Tip & Gift" },
      callback: (data: any) => {
        if (data.status === "successful") {
          createTip.mutate({ data: { fanName: name, fanEmail: email, amount: tipAmount, message: description || null, txRef } }, {
            onSuccess: () => { toast({ title: "Thank you! 💖", description: "Hannah really appreciates your support." }); setMode("main"); setAmount(""); setDescription(""); setName(""); setEmail(""); },
          });
        }
      },
      onclose: () => {},
    });
  };

  const QUICK_TIPS = [5, 10, 20, 50];

  const services = [
    {
      icon: <Send className="w-7 h-7" />, color: "text-primary", glow: "rgba(225,29,72,0.15)", border: "border-primary/40",
      title: "Direct Message", sub: "First 5 FREE · then $4.99", desc: "Send Hannah a private message and get a personal reply straight to your email.",
      cta: "Message Hannah", href: "/messages", isLink: true,
    },
    {
      icon: <Video className="w-7 h-7" />, color: "text-secondary", glow: "rgba(234,179,8,0.15)", border: "border-secondary/40",
      title: "Video Call", sub: "From $14.99", desc: "Book a one-on-one WhatsApp call, FaceTime, Zoom session, or an exclusive private meet.",
      cta: "Book a Call", href: "/calls", isLink: true,
    },
    {
      icon: <Wand2 className="w-7 h-7" />, color: "text-purple-400", glow: "rgba(168,85,247,0.15)", border: "border-purple-500/40",
      title: "Custom Content", sub: "$14.99", desc: "Request a personalised photo, shoutout video, or custom piece of content just for you.",
      cta: "Make a Request", onClick: () => setMode("request"),
    },
    {
      icon: <Gift className="w-7 h-7" />, color: "text-emerald-400", glow: "rgba(16,185,129,0.15)", border: "border-emerald-500/40",
      title: "Send a Tip", sub: "Any amount", desc: "Show your appreciation and support Hannah's content creation directly.",
      cta: "Send a Gift", onClick: () => setMode("tip"),
    },
    {
      icon: <MessageCircle className="w-7 h-7" />, color: "text-[#25D366]", glow: "rgba(37,211,102,0.15)", border: "border-[#25D366]/40",
      title: "WhatsApp Direct", sub: "Free to message", desc: "Say hi, ask a question, or just slide into Hannah's WhatsApp to start a conversation.",
      cta: "Open WhatsApp",
      href: `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi Hannah! I found you through your website 👋")}`,
      isExternal: true,
    },
    {
      icon: <Lock className="w-7 h-7" />, color: "text-secondary", glow: "rgba(234,179,8,0.12)", border: "border-secondary/40",
      title: "VIP Members", sub: "From $9.99/mo", desc: "Unlock the full private members area — exclusive content, photos, and more.",
      cta: "Join VIP", href: "/members", isLink: true,
    },
  ];

  const RequestForm = () => (
    <div className="max-w-2xl mx-auto bg-card border border-white/10 rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
          <Wand2 className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-2xl font-serif font-bold text-white">Custom Content Request</h2>
          <p className="text-muted-foreground text-sm">Personalised just for you — ${REQUEST_PRICE}</p>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: "photo", label: "Photo", icon: <Camera className="w-4 h-4" /> },
            { id: "video", label: "Video", icon: <Video className="w-4 h-4" /> },
            { id: "shoutout", label: "Shoutout", icon: <Music className="w-4 h-4" /> },
          ].map((t) => (
            <button key={t.id} onClick={() => setRequestType(t.id)}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-sm font-medium transition-all
                ${requestType === t.id ? "border-purple-500/50 bg-purple-500/10 text-purple-300" : "border-white/10 bg-black/40 text-muted-foreground hover:border-white/20"}`}>
              {t.icon}{t.label}
            </button>
          ))}
        </div>
        <Input placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)} className="bg-black/50 border-white/10 text-white rounded-xl h-11" />
        <Input type="email" placeholder="Your Email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-black/50 border-white/10 text-white rounded-xl h-11" />
        <Textarea placeholder="Describe exactly what you'd like Hannah to create…" value={description} onChange={(e) => setDescription(e.target.value)}
          className="bg-black/50 border-white/10 text-white rounded-xl resize-none min-h-[120px]" />
      </div>
      <div className="flex gap-3">
        <Button onClick={() => setMode("main")} variant="outline" className="flex-1 border-white/20 text-white rounded-xl">Cancel</Button>
        <Button onClick={handleRequestPayment} disabled={createRequest.isPending} className="flex-1 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold">
          {createRequest.isPending ? "Submitting…" : `Pay $${REQUEST_PRICE} & Submit`}
        </Button>
      </div>
    </div>
  );

  const TipForm = () => (
    <div className="max-w-2xl mx-auto bg-card border border-white/10 rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
          <Gift className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-2xl font-serif font-bold text-white">Send a Gift</h2>
          <p className="text-muted-foreground text-sm">Hannah reads every single message of support</p>
        </div>
      </div>
      <div className="space-y-4 mb-6">
        {/* Quick tip amounts */}
        <div className="flex gap-2">
          {QUICK_TIPS.map((v) => (
            <button key={v} onClick={() => setAmount(String(v))}
              className={`flex-1 py-2.5 rounded-xl border text-sm font-bold transition-all
                ${amount === String(v) ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300" : "border-white/10 bg-black/40 text-muted-foreground hover:border-white/20"}`}>
              ${v}
            </button>
          ))}
          <Input type="number" placeholder="Other" value={QUICK_TIPS.includes(Number(amount)) ? "" : amount}
            onChange={(e) => setAmount(e.target.value)} min="1"
            className="flex-1 bg-black/50 border-white/10 text-white rounded-xl text-center h-10 text-sm" />
        </div>
        <Input placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)} className="bg-black/50 border-white/10 text-white rounded-xl h-11" />
        <Input type="email" placeholder="Your Email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-black/50 border-white/10 text-white rounded-xl h-11" />
        <Textarea placeholder="Optional note to Hannah… (she'll see this!)" value={description} onChange={(e) => setDescription(e.target.value)}
          className="bg-black/50 border-white/10 text-white rounded-xl resize-none min-h-[80px]" />
      </div>
      <div className="flex gap-3">
        <Button onClick={() => setMode("main")} variant="outline" className="flex-1 border-white/20 text-white rounded-xl">Cancel</Button>
        <Button onClick={handleTipPayment} disabled={createTip.isPending} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold">
          {createTip.isPending ? "Sending…" : `Send $${amount || "??"} Gift`}
        </Button>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Hero */}
        <div className="relative pt-16 pb-12 text-center px-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-white/2 to-transparent pointer-events-none" />
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/5 border border-white/10 text-white mb-6">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-4">The Boutique</h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Exclusive ways to connect, create, and get personal with Hannah.
          </p>
        </div>

        <div className="container mx-auto px-4 max-w-6xl pb-20">
          {mode === "request" ? <RequestForm /> : mode === "tip" ? <TipForm /> : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 animate-in fade-in slide-in-from-bottom-6 duration-700">
              {services.map((s, i) => {
                const Inner = (
                  <div
                    className={`group relative h-full bg-card/30 border border-white/5 hover:${s.border} rounded-3xl p-7 transition-all duration-300 hover:shadow-[0_8px_32px_${s.glow}] hover:-translate-y-1 cursor-pointer flex flex-col`}
                    onClick={s.onClick}
                    style={s.onClick ? undefined : undefined}
                  >
                    <div className={`${s.color} mb-5 transition-transform duration-300 group-hover:scale-110`}>{s.icon}</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-serif font-bold text-white mb-1">{s.title}</h3>
                      <div className={`text-sm font-semibold ${s.color} mb-3`}>{s.sub}</div>
                      <p className="text-muted-foreground text-sm leading-relaxed">{s.desc}</p>
                    </div>
                    <div className={`mt-5 flex items-center gap-2 text-sm font-semibold ${s.color} group-hover:gap-3 transition-all duration-200`}>
                      {s.cta} <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                );
                if (s.isLink) return <Link key={i} href={s.href!}>{Inner}</Link>;
                if (s.isExternal) return <a key={i} href={s.href} target="_blank" rel="noreferrer">{Inner}</a>;
                return <div key={i}>{Inner}</div>;
              })}
            </div>
          )}

          {/* Fan love row */}
          {mode === "main" && (
            <div className="mt-16 flex items-center justify-center gap-4 text-muted-foreground text-sm">
              <Heart className="w-4 h-4 text-primary" />
              <span>Loved by fans worldwide — join the Hannah Brooks community today</span>
              <Heart className="w-4 h-4 text-primary" />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
