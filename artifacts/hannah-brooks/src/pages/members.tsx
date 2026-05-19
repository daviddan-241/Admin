import React, { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { usePlatformConfig } from "@/hooks/use-platform-config";
import { Lock, Star, ShieldCheck, Crown, Sparkles, Heart, PlayCircle, Image as ImageIcon, CheckCircle2, ChevronRight } from "lucide-react";

import imgHero from "@assets/IMG_2411_1779144779567.jpeg";
import imgSportsBra from "@assets/IMG_2413_1779144779567.jpeg";
import imgBikiniBunny from "@assets/IMG_2414_1779144779567.jpeg";
import imgChampagne from "@assets/IMG_2415_1779144779567.jpeg";
import imgLeopard from "@assets/IMG_2409_1779144779567.jpeg";
import imgTealLace from "@assets/IMG_2407_1779144779567.jpeg";
import imgBlackSheer from "@assets/621a6159-c0fd-4251-aee5-12d5784ad850_1779144779567.jpeg";
import imgGolfSkirt from "@assets/4213f549-3b25-453e-8b15-244f70907615_1779144779567.jpeg";

const vidKaraoke = `${import.meta.env.BASE_URL}videos/karaoke.mp4`;
const vidLife1 = `${import.meta.env.BASE_URL}videos/lifestyle1.mov`;

declare global {
  interface Window { FlutterwaveCheckout: (c: any) => void; }
}

const PERKS = [
  "Full uncensored photo & video library",
  "Priority DMs — I respond to members first",
  "Exclusive behind-the-scenes content",
  "Early access to custom request slots",
  "Members-only live Q&A sessions",
  "Discount on 1-on-1 calls",
  "Direct line — no algorithm, no filter",
];

export default function Members() {
  const { toast } = useToast();
  const { config } = usePlatformConfig();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [email, setEmail] = useState("");
  const [selectedId, setSelectedId] = useState("quarterly");

  const TIERS = [
    { id: "monthly",   name: "Monthly",   price: config.subMonthly,   per: "per month",    badge: null },
    { id: "quarterly", name: "3-Month",   price: config.subQuarterly, per: "per quarter",  badge: "Most Popular" },
    { id: "lifetime",  name: "Lifetime",  price: config.subLifetime,  per: "one-time forever", badge: "Best Value" },
  ];
  const selectedTier = TIERS.find(t => t.id === selectedId) || TIERS[1];

  useEffect(() => {
    if (localStorage.getItem("hb_subscribed") === "true") setIsSubscribed(true);
    const s = document.createElement("script");
    s.src = "https://checkout.flutterwave.com/v3.js";
    s.async = true;
    document.body.appendChild(s);
    return () => { document.body.removeChild(s); };
  }, []);

  const handlePayment = () => {
    if (!email) { toast({ title: "Email required", variant: "destructive" }); return; }
    if (typeof window.FlutterwaveCheckout !== "function") { toast({ title: "Payment loading…", variant: "destructive" }); return; }
    window.FlutterwaveCheckout({
      public_key: config.flutterwavePublicKey || "FLWPUBK_TEST-REPLACE",
      tx_ref: `hb_vip_${Date.now()}`,
      amount: selectedTier.price,
      currency: config.currency,
      payment_options: "card,mobilemoney,ussd",
      customer: { email, name: "VIP Member" },
      customizations: { title: "Hannah Brooks VIP", description: `${selectedTier.name} Membership`, logo: `${window.location.origin}${import.meta.env.BASE_URL}logo-hb.png` },
      callback: (data: any) => {
        if (data.status === "successful") {
          localStorage.setItem("hb_subscribed", "true");
          localStorage.setItem("hb_tier", selectedTier.id);
          setIsSubscribed(true);
          toast({ title: "Welcome to the Inner Circle 🔑", description: "VIP access is now unlocked." });
        }
      },
      onclose: () => {},
    });
  };

  const CONTENT = [
    { type: "photo", locked: false, img: imgTealLace, label: "Lingerie Set" },
    { type: "photo", locked: false, img: imgBikiniBunny, label: "Pool Day" },
    { type: "photo", locked: true,  img: imgBlackSheer, label: "🔒 VIP Only" },
    { type: "video", locked: false, src: vidKaraoke,   label: "Karaoke Night" },
    { type: "photo", locked: true,  img: imgChampagne, label: "🔒 VIP Only" },
    { type: "photo", locked: false, img: imgLeopard,   label: "Night Out" },
    { type: "photo", locked: true,  img: imgSportsBra, label: "🔒 Gym Session" },
    { type: "video", locked: true,  src: vidLife1,     label: "🔒 VIP Exclusive" },
    { type: "photo", locked: true,  img: imgGolfSkirt, label: "🔒 VIP Only" },
  ];

  return (
    <Layout>
      {/* ─── HERO ─── */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
        <img src={imgHero} alt="" className="absolute inset-0 w-full h-full object-cover object-top opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/40" />
        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/30 rounded-full px-5 py-2 mb-6">
            <Crown className="w-4 h-4 text-amber-400" />
            <span className="text-amber-400 text-xs font-bold tracking-widest uppercase">VIP Members Club</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-4">
            The Inner <span style={{color:"#c9a84c"}}>Circle</span>
          </h1>
          <p className="text-white/60 text-lg max-w-xl mx-auto">
            No algorithms. No censorship. Just my most exclusive content — reserved for members only.
          </p>
        </div>
      </section>

      {/* ─── CONTENT GRID ─── */}
      <section className="py-20 bg-black border-t border-white/5">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <p className="text-amber-400 text-xs font-bold tracking-[0.3em] uppercase mb-2">Content Library</p>
            <h2 className="text-3xl font-serif font-bold text-white">Exclusive Feed</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {CONTENT.map((c, i) => (
              <div key={i} className="group relative aspect-square overflow-hidden rounded-xl ring-1 ring-white/5">
                {c.type === "video" ? (
                  isSubscribed || !c.locked
                    ? <video src={c.src} className="w-full h-full object-cover" controls={!c.locked} playsInline preload="metadata" />
                    : <img src={imgHero} alt="" className="w-full h-full object-cover" />
                ) : (
                  <img src={c.img} alt={c.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                )}
                {c.locked && !isSubscribed && (
                  <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{background:"rgba(201,168,76,0.15)",border:"1px solid rgba(201,168,76,0.4)"}}>
                      <Lock className="w-5 h-5 text-amber-400" />
                    </div>
                    <p className="text-white font-semibold text-sm">VIP Only</p>
                  </div>
                )}
                <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-white text-xs font-medium">{c.label}</p>
                </div>
              </div>
            ))}
          </div>
          {!isSubscribed && (
            <div className="mt-8 text-center">
              <p className="text-white/40 text-sm">🔒 {CONTENT.filter(c => c.locked).length} pieces of exclusive content locked</p>
            </div>
          )}
        </div>
      </section>

      {/* ─── SUBSCRIPTION / PERKS ─── */}
      {!isSubscribed ? (
        <section className="py-24 bg-zinc-950 border-t border-white/5">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="grid md:grid-cols-2 gap-16 items-start">
              {/* Perks */}
              <div>
                <p className="text-amber-400 text-xs font-bold tracking-[0.3em] uppercase mb-4">What You Get</p>
                <h2 className="text-4xl font-serif font-bold text-white mb-8">VIP Membership<br />Includes Everything</h2>
                <div className="space-y-4">
                  {PERKS.map((p, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                      <p className="text-white/80">{p}</p>
                    </div>
                  ))}
                </div>
              </div>
              {/* Pricing */}
              <div>
                <p className="text-amber-400 text-xs font-bold tracking-[0.3em] uppercase mb-4">Choose Your Plan</p>
                <div className="space-y-3 mb-6">
                  {TIERS.map(tier => (
                    <div
                      key={tier.id}
                      onClick={() => setSelectedId(tier.id)}
                      className={`relative cursor-pointer rounded-2xl border p-5 transition-all ${selectedId === tier.id ? "border-amber-400 bg-amber-400/5" : "border-white/10 bg-zinc-900 hover:border-white/20"}`}
                    >
                      {tier.badge && (
                        <span className="absolute -top-3 right-4 text-xs font-bold px-3 py-1 rounded-full text-black" style={{background:"linear-gradient(135deg,#c9a84c,#f0d080)"}}>
                          {tier.badge}
                        </span>
                      )}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-bold text-lg">{tier.name}</p>
                          <p className="text-white/40 text-sm">{tier.per}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold" style={{color:"#c9a84c"}}>${tier.price}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-white/50 tracking-wider uppercase block mb-2">Your Email</label>
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="bg-black border-white/10 text-white placeholder:text-white/30 focus-visible:ring-amber-400/50"
                    />
                  </div>
                  <button
                    onClick={handlePayment}
                    className="w-full h-14 rounded-xl font-black text-lg tracking-wider text-black hover:scale-[1.01] active:scale-[0.99] transition-transform shadow-xl"
                    style={{background:"linear-gradient(135deg,#c9a84c,#f0d080,#c9a84c)"}}
                  >
                    Unlock VIP — ${selectedTier.price} {selectedTier.per}
                  </button>
                  <p className="text-center text-white/30 text-xs flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Secure payment via Flutterwave · Cancel anytime
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="py-24 bg-zinc-950 border-t border-white/5 text-center">
          <div className="container mx-auto px-4 max-w-xl">
            <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6" style={{background:"rgba(201,168,76,0.15)",border:"2px solid rgba(201,168,76,0.4)"}}>
              <Crown className="w-10 h-10 text-amber-400" />
            </div>
            <h2 className="text-4xl font-serif font-bold text-white mb-4">Welcome, VIP Member 🔑</h2>
            <p className="text-white/60 mb-8">You have full access to all exclusive content. Enjoy the inner circle.</p>
            <button onClick={() => { localStorage.removeItem("hb_subscribed"); setIsSubscribed(false); }} className="text-white/30 text-sm hover:text-white/50 transition-colors underline">
              Not your account? Sign out
            </button>
          </div>
        </section>
      )}
    </Layout>
  );
}
