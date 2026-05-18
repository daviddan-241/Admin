import React, { useEffect, useState } from "react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useCreateCall } from "@workspace/api-client-react";
import { Video, Calendar, Clock, User, Mail, CheckCircle2, MessageCircle, MapPin, Phone, Star, ChevronRight } from "lucide-react";

// WhatsApp number — update this to Hannah's real number
const WHATSAPP_NUMBER = "447700000000";

const CALL_OPTIONS = [
  { id: "wa-5", type: "whatsapp", mins: 5, price: 14.99, label: "Quick Chat", desc: "WhatsApp video — a quick hello", icon: <MessageCircle className="w-5 h-5" /> },
  { id: "zoom-15", type: "video", mins: 15, price: 39.99, label: "Catch Up", desc: "FaceTime or Zoom — a proper chat", icon: <Video className="w-5 h-5" /> },
  { id: "zoom-30", type: "video", mins: 30, price: 69.99, label: "Deep Dive", desc: "FaceTime or Zoom — real quality time", icon: <Video className="w-5 h-5" /> },
  { id: "meet-60", type: "private", mins: 60, price: 149.99, label: "Private 1:1", desc: "Exclusive private session — ask anything", icon: <Star className="w-5 h-5" /> },
];

export default function Calls() {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [selected, setSelected] = useState(CALL_OPTIONS[1]);
  const [isSuccess, setIsSuccess] = useState(false);
  const createCall = useCreateCall();

  useEffect(() => {
    const s = document.createElement("script");
    s.src = "https://checkout.flutterwave.com/v3.js";
    s.async = true;
    document.body.appendChild(s);
    return () => { document.body.removeChild(s); };
  }, []);

  const handlePayment = () => {
    if (!name || !email || !date) {
      toast({ title: "Missing fields", description: "Please fill in name, email, and preferred time.", variant: "destructive" });
      return;
    }
    if (typeof window.FlutterwaveCheckout !== "function") {
      toast({ title: "Payment loading…", description: "Please wait and try again.", variant: "destructive" });
      return;
    }
    const txRef = `hb_call_${Date.now()}`;
    window.FlutterwaveCheckout({
      public_key: "FLWPUBK_TEST-REPLACE-WITH-YOUR-KEY",
      tx_ref: txRef,
      amount: selected.price,
      currency: "USD",
      payment_options: "card",
      customer: { email, name },
      customizations: { title: "Hannah Brooks", description: `${selected.mins} Min ${selected.label}` },
      callback: (data: any) => {
        if (data.status === "successful") {
          createCall.mutate(
            { data: { fanName: name, fanEmail: email, preferredDate: new Date(date).toISOString(), durationMinutes: selected.mins, amountPaid: selected.price, txRef, notes } },
            {
              onSuccess: () => { setIsSuccess(true); toast({ title: "Booked!", description: "Hannah will confirm your time soon." }); },
              onError: () => toast({ title: "Error", description: "Failed to save booking.", variant: "destructive" }),
            }
          );
        }
      },
      onclose: () => {},
    });
  };

  const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hi Hannah! I'd love to book a quick video call. My name is ${name || "[Your Name]"}.`)}`;

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Hero */}
        <div className="relative pt-16 pb-12 text-center px-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-secondary/5 to-transparent pointer-events-none" />
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-secondary/10 border border-secondary/20 text-secondary mb-6 shadow-[0_0_40px_rgba(234,179,8,0.15)]">
            <Video className="w-10 h-10" />
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-4">Book a Call</h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            One-on-one time with Hannah — via WhatsApp, FaceTime, Zoom, or an exclusive private session.
          </p>
        </div>

        <div className="container mx-auto px-4 max-w-6xl pb-20">
          {isSuccess ? (
            <div className="max-w-2xl mx-auto bg-card/40 border border-white/10 rounded-3xl p-12 text-center shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in duration-500">
              <CheckCircle2 className="w-20 h-20 text-green-400 mx-auto mb-6" />
              <h2 className="text-3xl font-serif font-bold text-white mb-4">All Booked!</h2>
              <p className="text-muted-foreground text-lg mb-8">
                Thank you, {name}! Your {selected.mins}-minute {selected.label} is confirmed.
              </p>
              <div className="bg-black/40 border border-white/5 rounded-2xl p-6 text-left space-y-3 mb-8">
                <h4 className="text-white font-semibold mb-4 border-b border-white/10 pb-3">What happens next</h4>
                <div className="flex gap-3 text-sm text-muted-foreground">
                  <span className="text-secondary font-bold shrink-0">1.</span>
                  Hannah will review your preferred time: <span className="text-white">{new Date(date).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}</span>
                </div>
                {selected.type === "whatsapp" ? (
                  <div className="flex gap-3 text-sm text-muted-foreground">
                    <span className="text-secondary font-bold shrink-0">2.</span>
                    Hannah will WhatsApp you to confirm. Make sure you're available!
                  </div>
                ) : selected.type === "private" ? (
                  <div className="flex gap-3 text-sm text-muted-foreground">
                    <span className="text-secondary font-bold shrink-0">2.</span>
                    Hannah's team will email <span className="text-white">{email}</span> with full details for your private session.
                  </div>
                ) : (
                  <div className="flex gap-3 text-sm text-muted-foreground">
                    <span className="text-secondary font-bold shrink-0">2.</span>
                    Hannah will email <span className="text-white">{email}</span> to confirm the platform (FaceTime, Zoom, or WhatsApp).
                  </div>
                )}
                <div className="flex gap-3 text-sm text-muted-foreground">
                  <span className="text-secondary font-bold shrink-0">3.</span>
                  We call — make sure you have a great connection!
                </div>
              </div>
              {selected.type === "whatsapp" && (
                <a href={whatsappLink} target="_blank" rel="noreferrer" className="mb-6 block">
                  <Button className="w-full bg-[#25D366] hover:bg-[#22be5c] text-white font-bold h-12 rounded-xl gap-2">
                    <MessageCircle className="w-5 h-5" /> Message Hannah on WhatsApp
                  </Button>
                </a>
              )}
              <Button onClick={() => setIsSuccess(false)} variant="outline" className="border-white/20 text-white rounded-xl">
                Book Another Call
              </Button>
            </div>
          ) : (
            <div className="grid lg:grid-cols-[1fr_360px] gap-8">
              {/* Left: form */}
              <div className="bg-card/50 border border-white/10 rounded-3xl p-8 backdrop-blur-md shadow-2xl">
                <h3 className="text-2xl font-serif font-medium text-white mb-8">Your Details</h3>
                <div className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-white/60 ml-1">Your Name</label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground" />
                        <Input placeholder="Jane Smith" value={name} onChange={(e) => setName(e.target.value)}
                          className="pl-10 bg-black/50 border-white/10 h-12 rounded-xl text-white" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-white/60 ml-1">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground" />
                        <Input type="email" placeholder="jane@email.com" value={email} onChange={(e) => setEmail(e.target.value)}
                          className="pl-10 bg-black/50 border-white/10 h-12 rounded-xl text-white" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-white/60 ml-1">Preferred Date & Time</label>
                    <div className="relative">
                      <Calendar className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground" />
                      <Input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)}
                        className="pl-10 bg-black/50 border-white/10 h-12 rounded-xl text-white [color-scheme:dark]" />
                    </div>
                    <p className="text-xs text-muted-foreground ml-1">All times in UK time (GMT/BST). Hannah does her best to accommodate.</p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-white/60 ml-1">Notes (optional)</label>
                    <Textarea placeholder="What would you like to talk about?" value={notes} onChange={(e) => setNotes(e.target.value)}
                      className="bg-black/50 border-white/10 min-h-[90px] rounded-xl text-white resize-none" />
                  </div>
                </div>
              </div>

              {/* Right: options */}
              <div className="space-y-5">
                {/* WhatsApp direct button */}
                <a href={whatsappLink} target="_blank" rel="noreferrer">
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#25D366]/10 border border-[#25D366]/30 hover:bg-[#25D366]/15 transition-all cursor-pointer group mb-2">
                    <div className="w-10 h-10 rounded-xl bg-[#25D366]/20 border border-[#25D366]/30 flex items-center justify-center text-[#25D366]">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-semibold text-sm">Chat on WhatsApp First</div>
                      <div className="text-muted-foreground text-xs">Ask Hannah a question before booking</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#25D366] group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </a>

                {/* Call type selection */}
                <div className="bg-card/40 border border-white/10 rounded-2xl p-5 backdrop-blur-md">
                  <h3 className="text-base font-semibold text-white mb-4">Choose Your Call Type</h3>
                  <div className="space-y-2.5">
                    {CALL_OPTIONS.map((opt) => (
                      <div
                        key={opt.id}
                        onClick={() => setSelected(opt)}
                        className={`relative p-4 rounded-xl border cursor-pointer transition-all duration-200 flex items-center gap-3
                          ${selected.id === opt.id
                            ? opt.type === "private" ? "border-secondary bg-secondary/10 shadow-[0_0_20px_rgba(234,179,8,0.1)]"
                              : "border-primary bg-primary/10 shadow-[0_0_15px_rgba(225,29,72,0.1)]"
                            : "border-white/8 bg-black/30 hover:bg-black/50 hover:border-white/15"}`}
                      >
                        <div className={`p-2 rounded-lg shrink-0 ${selected.id === opt.id
                          ? opt.type === "private" ? "bg-secondary text-black" : "bg-primary text-white"
                          : "bg-white/5 text-muted-foreground"}`}>
                          {opt.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white text-sm">{opt.label}</span>
                            <span className="text-xs text-muted-foreground">{opt.mins} min</span>
                            {opt.type === "whatsapp" && <span className="text-[10px] bg-[#25D366]/20 text-[#25D366] px-1.5 py-0.5 rounded-full font-medium">WhatsApp</span>}
                            {opt.type === "private" && <span className="text-[10px] bg-secondary/20 text-secondary px-1.5 py-0.5 rounded-full font-medium">Exclusive</span>}
                          </div>
                          <div className="text-xs text-muted-foreground">{opt.desc}</div>
                        </div>
                        <div className="text-white font-bold shrink-0">${opt.price}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Book CTA */}
                <div className="bg-gradient-to-br from-primary/20 to-secondary/10 p-[1px] rounded-2xl">
                  <div className="bg-card/90 backdrop-blur-xl p-5 rounded-[15px]">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <div className="text-muted-foreground text-sm">{selected.label} · {selected.mins} min</div>
                        <div className="text-3xl font-serif font-bold text-white">${selected.price}</div>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground text-xs">
                        <Clock className="w-3 h-3" /> {selected.mins}min
                      </div>
                    </div>
                    <Button
                      onClick={handlePayment}
                      disabled={createCall.isPending}
                      className="w-full h-13 rounded-xl font-bold bg-white text-black hover:bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.15)] text-sm"
                    >
                      {createCall.isPending ? "Processing…" : `Book ${selected.label} — $${selected.price}`}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center mt-3">Secure payment via Flutterwave</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
