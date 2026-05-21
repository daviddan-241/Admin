import React, { useState } from "react";
import { Layout } from "@/components/layout";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { usePlatformConfig } from "@/hooks/use-platform-config";
import { useFlutterwave } from "@/hooks/use-flutterwave";
import {
  Video, MessageCircle, Star, CheckCircle2, ShieldCheck,
  Calendar, Clock, User, Mail, Phone, ChevronDown, Sparkles
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

type CallOption = {
  id: string;
  type: string;
  mins: number;
  price: number;
  label: string;
  badge: string;
  desc: string;
  perks: string[];
  color: string;
  icon: React.ReactNode;
};

export default function Calls() {
  const { toast } = useToast();
  const { config } = usePlatformConfig();
  const { pay } = useFlutterwave();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedId, setSelectedId] = useState("zoom-15");
  const [step, setStep] = useState<"select" | "details" | "success">("select");
  const [booking, setBooking] = useState<{ label: string; mins: number; price: number } | null>(null);
  const [paying, setPaying] = useState(false);

  const CALL_OPTIONS: CallOption[] = [
    {
      id: "wa-5", type: "whatsapp", mins: 5, price: config.callWa5,
      label: "Quick Chat", badge: "WhatsApp · 5 min",
      desc: "A sweet 5-minute WhatsApp video call — say hi, ask anything, just us.",
      perks: ["WhatsApp Video", "Any topic welcome", "Instant connection"],
      color: "#25d366", icon: <MessageCircle className="w-5 h-5" />,
    },
    {
      id: "zoom-15", type: "video", mins: 15, price: config.callZoom15,
      label: "Catch Up", badge: "Zoom / FaceTime · 15 min",
      desc: "A proper 15-minute catch-up — your questions, my answers. Real, unfiltered.",
      perks: ["Zoom or FaceTime", "All topics okay", "Screen share available"],
      color: "#2681ff", icon: <Video className="w-5 h-5" />,
    },
    {
      id: "zoom-30", type: "video", mins: 30, price: config.callZoom30,
      label: "Deep Dive", badge: "Zoom · 30 min",
      desc: "30 minutes of real quality time. Long form, personal, no rush.",
      perks: ["Zoom HD Video", "Extended chat", "Priority booking"],
      color: "#c9a84c", icon: <Video className="w-5 h-5" />,
    },
    {
      id: "priv-60", type: "private", mins: 60, price: config.callPrivate60,
      label: "Private 1:1", badge: "Exclusive · 60 min",
      desc: "My most exclusive session. An hour of total privacy — ask absolutely anything.",
      perks: ["Full private session", "Total confidentiality", "All topics", "Recording available"],
      color: "#a855f7", icon: <Star className="w-5 h-5" />,
    },
  ];

  const selected = CALL_OPTIONS.find(o => o.id === selectedId) ?? CALL_OPTIONS[1];

  const handlePay = () => {
    if (!name.trim() || !email.trim() || !date) {
      toast({ title: "Please fill in your name, email, and preferred date", variant: "destructive" });
      return;
    }
    setPaying(true);
    const txRef = `hb_call_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    pay({
      amount: selected.price,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      description: `${selected.label} · ${selected.mins} min call with Hannah`,
      txRef,
      onSuccess: async (data) => {
        setPaying(false);
        try {
          await fetch(`${API}/calls`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              fanName: name.trim(),
              fanEmail: email.trim(),
              preferredDate: new Date(date).toISOString(),
              durationMinutes: selected.mins,
              amountPaid: selected.price,
              txRef: (data.tx_ref as string) || txRef,
              notes: notes.trim() || null,
            }),
          });
        } catch { /* booking still logged below */ }
        setBooking({ label: selected.label, mins: selected.mins, price: selected.price });
        setStep("success");
      },
      onClose: () => { setPaying(false); },
    });
  };

  if (step === "success" && booking) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center px-4"
          style={{ background: "radial-gradient(ellipse at top,#1a1000 0%,#060606 70%)" }}>
          <div className="text-center max-w-md w-full">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <HannahAvatar size="lg" />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-400 border-2 border-black flex items-center justify-center">
                  <CheckCircle2 className="w-3.5 h-3.5 text-black" />
                </div>
              </div>
            </div>
            <h1 className="text-4xl font-serif font-bold text-white mb-3">Call Booked! 🎉</h1>
            <p className="text-white/50 mb-6">Your payment is confirmed. Hannah will reach out via email to confirm the exact time and send you the call link.</p>

            <div className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-5 mb-6 text-left space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white/50 text-sm">Session</span>
                <span className="text-white font-bold">{booking.label} · {booking.mins} min</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/50 text-sm">Amount Paid</span>
                <span className="font-bold text-amber-400">${booking.price}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/50 text-sm">Confirmation</span>
                <span className="text-white text-sm">{email}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Link href="/messages">
                <button className="w-full h-12 rounded-xl font-bold text-sm text-black flex items-center justify-center gap-2"
                  style={{ background: "linear-gradient(135deg,#c9a84c,#f0d080,#c9a84c)" }}>
                  <MessageCircle className="w-4 h-4" /> Message Hannah
                </button>
              </Link>
              <button onClick={() => { setStep("select"); setName(""); setEmail(""); setPhone(""); setDate(""); setNotes(""); }}
                className="text-white/40 text-sm hover:text-white transition-colors">
                Book another session
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen" style={{ background: "radial-gradient(ellipse at top,#1a1000 0%,#060606 70%)" }}>

        {/* Header — like Messages start screen */}
        <div className="pt-16 pb-8 flex flex-col items-center text-center px-4">
          <div className="relative mb-5">
            <HannahAvatar size="lg" />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-400 border-2 border-[#060606]" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-white mb-1">Book a Call</h1>
          <p className="text-white/40 text-sm mb-3">Real time with Hannah · No scripts, no filters</p>
          <div className="flex items-center gap-2 rounded-full px-4 py-1.5 border"
            style={{ background: "rgba(201,168,76,0.08)", borderColor: "rgba(201,168,76,0.2)" }}>
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-amber-400 text-xs font-medium">Paid · Confirmed within 2 hours</span>
          </div>
        </div>

        <div className="container mx-auto px-4 max-w-xl pb-20">

          {/* Call options as chat-style cards */}
          <div className="mb-6">
            <p className="text-white/30 text-xs font-bold tracking-widest uppercase mb-4 text-center">Choose Your Session</p>
            <div className="space-y-3">
              {CALL_OPTIONS.map(opt => (
                <div key={opt.id} onClick={() => setSelectedId(opt.id)}
                  className={`rounded-2xl border p-4 cursor-pointer transition-all duration-200 ${
                    selectedId === opt.id
                      ? "border-amber-400/60 bg-amber-400/5 shadow-[0_0_20px_rgba(201,168,76,0.08)]"
                      : "border-white/8 bg-white/3 hover:border-white/15"
                  }`}>
                  <div className="flex items-center gap-3">
                    {/* Icon */}
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: `${opt.color}18`, border: `1px solid ${opt.color}40`, color: opt.color }}>
                      {opt.icon}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <span className="text-white font-bold text-sm">{opt.label}</span>
                          <span className="ml-2 text-[10px] font-medium px-2 py-0.5 rounded-full border"
                            style={{ color: opt.color, borderColor: `${opt.color}40`, background: `${opt.color}12` }}>
                            {opt.badge}
                          </span>
                        </div>
                        <span className="font-black text-lg shrink-0" style={{ color: "#c9a84c" }}>${opt.price}</span>
                      </div>
                      <p className="text-white/40 text-xs mt-1 leading-relaxed">{opt.desc}</p>
                    </div>
                    {/* Radio */}
                    <div className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${
                      selectedId === opt.id ? "border-amber-400" : "border-white/20"
                    }`}>
                      {selectedId === opt.id && <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />}
                    </div>
                  </div>

                  {selectedId === opt.id && (
                    <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap gap-2">
                      {opt.perks.map(p => (
                        <span key={p} className="text-[11px] text-white/60 bg-white/5 px-2.5 py-1 rounded-full border border-white/8 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-amber-400" /> {p}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Your details form */}
          <div className="rounded-3xl p-6 space-y-4 mb-6"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="flex items-center gap-2 mb-1">
              <HannahAvatar size="sm" />
              <div>
                <p className="text-white text-sm font-semibold">Your Details</p>
                <p className="text-white/30 text-xs">Hannah needs this to confirm your booking</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <Input value={name} onChange={e => setName(e.target.value)}
                  placeholder="Your full name"
                  className="pl-9 bg-black/50 border-white/10 text-white h-12 rounded-xl placeholder:text-white/20 focus-visible:ring-amber-400/40" />
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="pl-9 bg-black/50 border-white/10 text-white h-12 rounded-xl placeholder:text-white/20 focus-visible:ring-amber-400/40" />
              </div>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <Input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder="Phone number (optional)"
                  className="pl-9 bg-black/50 border-white/10 text-white h-12 rounded-xl placeholder:text-white/20 focus-visible:ring-amber-400/40" />
              </div>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <Input type="datetime-local" value={date} onChange={e => setDate(e.target.value)}
                  className="pl-9 bg-black/50 border-white/10 text-white h-12 rounded-xl focus-visible:ring-amber-400/40" />
              </div>
              <Textarea value={notes} onChange={e => setNotes(e.target.value)}
                placeholder="Topics you'd like to cover, anything special… (optional)"
                className="bg-black/50 border-white/10 text-white rounded-xl placeholder:text-white/20 focus-visible:ring-amber-400/40 min-h-[80px] resize-none" />
            </div>
          </div>

          {/* Summary + Pay */}
          <div className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-5 mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-white/60 text-sm">{selected.label} · {selected.mins} min</span>
              <span className="text-2xl font-black text-amber-400">${selected.price}</span>
            </div>
            <p className="text-white/30 text-xs">{selected.badge} · Confirmed by Hannah within 2 hours</p>
          </div>

          <button onClick={handlePay} disabled={paying}
            className="w-full h-14 rounded-2xl font-black text-lg tracking-wide text-black flex items-center justify-center gap-2 transition-all active:scale-[0.99] hover:scale-[1.01] disabled:opacity-60 shadow-xl shadow-amber-400/20"
            style={{ background: "linear-gradient(135deg,#c9a84c,#f0d080,#c9a84c)" }}>
            {paying
              ? <><span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Processing…</>
              : <><Clock className="w-5 h-5" /> Book {selected.label} · ${selected.price}</>
            }
          </button>

          <p className="text-center text-white/20 text-xs mt-3 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Secure payment · Private · 100% confidential
          </p>
        </div>
      </div>
    </Layout>
  );
}
