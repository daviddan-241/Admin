import React, { useEffect, useState } from "react";
import { Layout } from "@/components/layout";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { usePlatformConfig } from "@/hooks/use-platform-config";
import { useCreateCall } from "@workspace/api-client-react";
import { Video, MessageCircle, Star, CheckCircle2, ShieldCheck, Calendar, Clock, User, Mail, ChevronRight } from "lucide-react";

import imgHero from "@assets/IMG_2411_1779144779567.jpeg";

declare global {
  interface Window { FlutterwaveCheckout: (c: any) => void; }
}

export default function Calls() {
  const { toast } = useToast();
  const { config } = usePlatformConfig();
  const createCall = useCreateCall();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedId, setSelectedId] = useState("zoom-15");
  const [isSuccess, setIsSuccess] = useState(false);

  const CALL_OPTIONS = [
    { id: "wa-5",     type: "whatsapp", mins: 5,  price: config.callWa5,      label: "Quick Chat",   desc: "WhatsApp video — a quick hello, any topic",        icon: <MessageCircle className="w-6 h-6" />, color: "#25d366" },
    { id: "zoom-15",  type: "video",    mins: 15, price: config.callZoom15,   label: "Catch Up",     desc: "FaceTime or Zoom — a proper chat, your questions",  icon: <Video className="w-6 h-6" />,         color: "#2681ff" },
    { id: "zoom-30",  type: "video",    mins: 30, price: config.callZoom30,   label: "Deep Dive",    desc: "Zoom — long form, real quality time",              icon: <Video className="w-6 h-6" />,         color: "#c9a84c" },
    { id: "priv-60",  type: "private",  mins: 60, price: config.callPrivate60,label: "Private 1:1",  desc: "Exclusive session — ask anything, total privacy",   icon: <Star className="w-6 h-6" />,          color: "#a855f7" },
  ];

  const selected = CALL_OPTIONS.find(o => o.id === selectedId) || CALL_OPTIONS[1];

  useEffect(() => {
    const s = document.createElement("script");
    s.src = "https://checkout.flutterwave.com/v3.js";
    s.async = true;
    document.body.appendChild(s);
    return () => { document.body.removeChild(s); };
  }, []);

  const handlePayment = () => {
    if (!name || !email || !date) {
      toast({ title: "Fill all fields", description: "Name, email, and preferred date/time are required.", variant: "destructive" });
      return;
    }
    if (typeof window.FlutterwaveCheckout !== "function") {
      toast({ title: "Payment loading…", variant: "destructive" });
      return;
    }
    const txRef = `hb_call_${Date.now()}`;
    window.FlutterwaveCheckout({
      public_key: config.flutterwavePublicKey || "FLWPUBK_TEST-REPLACE",
      tx_ref: txRef,
      amount: selected.price,
      currency: config.currency,
      payment_options: "card",
      customer: { email, name },
      customizations: { title: "Hannah Brooks", description: `${selected.mins} Min ${selected.label}`, logo: `${window.location.origin}${import.meta.env.BASE_URL}logo-hb.png` },
      callback: (data: any) => {
        if (data.status === "successful") {
          createCall.mutate(
            { data: { fanName: name, fanEmail: email, preferredDate: new Date(date).toISOString(), durationMinutes: selected.mins, amountPaid: selected.price, txRef, notes } },
            {
              onSuccess: () => { setIsSuccess(true); },
              onError: () => { setIsSuccess(true); },
            }
          );
        }
      },
      onclose: () => {},
    });
  };

  if (isSuccess) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6" style={{background:"rgba(201,168,76,0.1)",border:"2px solid rgba(201,168,76,0.3)"}}>
              <CheckCircle2 className="w-12 h-12 text-amber-400" />
            </div>
            <h1 className="text-4xl font-serif font-bold text-white mb-4">Call Booked!</h1>
            <p className="text-white/60 mb-8">Hannah will confirm your session via email within 24 hours. Check your inbox — including spam.</p>
            <button onClick={() => setIsSuccess(false)} className="text-amber-400 text-sm hover:underline">Book another session</button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-32 overflow-hidden">
        <img src={imgHero} alt="" className="absolute inset-0 w-full h-full object-cover opacity-25 object-top" />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/80 to-black" />
        <div className="relative z-10 container mx-auto px-4 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/30 rounded-full px-5 py-2 mb-6">
            <Video className="w-4 h-4 text-amber-400" />
            <span className="text-amber-400 text-xs font-bold tracking-widest uppercase">Book a Call</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-4">
            Real Time<br />With <span style={{color:"#c9a84c"}}>Hannah</span>
          </h1>
          <p className="text-white/60 text-lg max-w-xl mx-auto">
            No scripts, no filters — just us on a video call. Ask me anything.
          </p>
        </div>
      </section>

      <section className="py-20 bg-black">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Options */}
            <div>
              <p className="text-amber-400 text-xs font-bold tracking-[0.3em] uppercase mb-6">Select Duration</p>
              <div className="space-y-4">
                {CALL_OPTIONS.map(opt => (
                  <div
                    key={opt.id}
                    onClick={() => setSelectedId(opt.id)}
                    className={`group cursor-pointer rounded-2xl border p-5 transition-all ${selectedId === opt.id ? "border-amber-400 bg-amber-400/5" : "border-white/10 bg-zinc-900 hover:border-white/20"}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{background:`${opt.color}18`,border:`1px solid ${opt.color}40`,color:opt.color}}>
                        {opt.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-white font-bold">{opt.label}</p>
                          <p className="font-bold text-lg" style={{color:"#c9a84c"}}>${opt.price}</p>
                        </div>
                        <p className="text-white/50 text-sm mt-0.5">{opt.mins} min · {opt.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-5 rounded-2xl bg-zinc-900 border border-white/5">
                <p className="text-white/50 text-xs font-bold tracking-wider uppercase mb-4">What to expect</p>
                {["WhatsApp, FaceTime, or Zoom — your choice", "Confirmation email within 24 hours", "100% private & confidential", "All topics welcome — no judgment"].map(item => (
                  <div key={item} className="flex items-center gap-2 py-2 border-b border-white/5 last:border-0">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <p className="text-white/70 text-sm">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Booking form */}
            <div>
              <p className="text-amber-400 text-xs font-bold tracking-[0.3em] uppercase mb-6">Your Details</p>
              <div className="space-y-5 bg-zinc-900 rounded-2xl border border-white/5 p-6">
                <div>
                  <label className="text-xs font-bold text-white/50 tracking-wider uppercase block mb-2"><User className="w-3 h-3 inline mr-1" />Full Name</label>
                  <Input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" className="bg-black border-white/10 text-white placeholder:text-white/20 focus-visible:ring-amber-400/50" />
                </div>
                <div>
                  <label className="text-xs font-bold text-white/50 tracking-wider uppercase block mb-2"><Mail className="w-3 h-3 inline mr-1" />Email Address</label>
                  <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" className="bg-black border-white/10 text-white placeholder:text-white/20 focus-visible:ring-amber-400/50" />
                </div>
                <div>
                  <label className="text-xs font-bold text-white/50 tracking-wider uppercase block mb-2"><Calendar className="w-3 h-3 inline mr-1" />Preferred Date & Time</label>
                  <Input type="datetime-local" value={date} onChange={e => setDate(e.target.value)} className="bg-black border-white/10 text-white focus-visible:ring-amber-400/50" />
                </div>
                <div>
                  <label className="text-xs font-bold text-white/50 tracking-wider uppercase block mb-2">Notes (optional)</label>
                  <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Topics, questions, or anything you'd like Hannah to know…" className="bg-black border-white/10 text-white placeholder:text-white/20 focus-visible:ring-amber-400/50 min-h-[90px]" />
                </div>

                <div className="pt-2 border-t border-white/5">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-white/60 font-medium">{selected.label} · {selected.mins} min</span>
                    <span className="text-2xl font-bold" style={{color:"#c9a84c"}}>${selected.price}</span>
                  </div>
                  <button
                    onClick={handlePayment}
                    className="w-full h-14 rounded-xl font-black text-lg tracking-wider text-black hover:scale-[1.01] active:scale-[0.99] transition-transform shadow-xl"
                    style={{background:"linear-gradient(135deg,#c9a84c,#f0d080,#c9a84c)"}}
                  >
                    Book & Pay ${selected.price}
                  </button>
                  <p className="text-center text-white/30 text-xs mt-3 flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Secure · Discreet · Instant confirmation
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
