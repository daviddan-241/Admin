import React, { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { usePlatformConfig } from "@/hooks/use-platform-config";
import { Lock, Star, ShieldCheck, Crown, Sparkles, Heart, PlayCircle, Image as ImageIcon, CheckCircle2, ChevronRight, MessageCircle, AlertCircle } from "lucide-react";
import { Link } from "wouter";

const IMAGES = [
  "https://i.ibb.co/PGCnqyX5/IMG-5005.jpg",
  "https://i.ibb.co/vC3TShzm/IMG-5006.jpg",
  "https://i.ibb.co/BHyHr4v0/IMG-5007.jpg",
  "https://i.ibb.co/hFkvzFym/IMG-5008.jpg",
  "https://i.ibb.co/WpWxr9WM/IMG-5009.jpg",
  "https://i.ibb.co/hxBn0NXK/IMG-5010.jpg",
  "https://i.ibb.co/WvbbPvxn/IMG-5011.jpg",
  "https://i.ibb.co/8nhzv5hj/IMG-5012.jpg",
  "https://i.ibb.co/LdymsBR4/IMG-5013.jpg",
  "https://i.ibb.co/hRr72q4D/IMG-5014.jpg",
  "https://i.ibb.co/gM7CT8VD/IMG-5015.jpg",
  "https://i.ibb.co/fV9Yw83z/IMG-5016.jpg",
  "https://i.ibb.co/6JBGW4P7/IMG-5017.jpg",
  "https://i.ibb.co/5gp94kvZ/IMG-5018.jpg",
  "https://i.ibb.co/MyMqXLGh/IMG-5019.jpg",
  "https://i.ibb.co/s9yDDmhf/IMG-5020.jpg",
  "https://i.ibb.co/BYn8yRX/IMG-5022.jpg",
  "https://i.ibb.co/fGNhhPJw/IMG-5023.jpg",
  "https://i.ibb.co/5Wg31yZk/IMG-5024.jpg",
];

const BASE_URL = import.meta.env.BASE_URL;
const VIDEOS = [
  { src: `${BASE_URL}videos/sophie1.mp4`, label: "Lifestyle Vlog" },
  { src: `${BASE_URL}videos/sophie2.mp4`, label: "Behind the Scenes" },
  { src: `${BASE_URL}videos/sophie3.mp4`, label: "Exclusive Clip" },
  { src: `${BASE_URL}videos/sophie4.mp4`, label: "For My Fans" },
  { src: `${BASE_URL}videos/sophie5.mp4`, label: "Private Session" },
];

const PERKS = [
  "Full uncensored photo & video library",
  "Priority DMs — I respond to members first",
  "Exclusive behind-the-scenes content",
  "Early access to custom request slots",
  "Members-only live Q&A sessions",
  "Discount on 1-on-1 calls",
  "Direct line — no algorithm, no filter",
];

const CONTENT = [
  { type: "photo" as const, locked: false, img: IMAGES[0], label: "Miami Days" },
  { type: "photo" as const, locked: false, img: IMAGES[1], label: "Lifestyle" },
  { type: "photo" as const, locked: true,  img: IMAGES[2], label: "🔒 VIP Only" },
  { type: "video" as const, locked: false, src: VIDEOS[0].src, thumb: IMAGES[3], label: "Vlog" },
  { type: "photo" as const, locked: true,  img: IMAGES[4], label: "🔒 VIP Only" },
  { type: "photo" as const, locked: false, img: IMAGES[5], label: "Summer" },
  { type: "photo" as const, locked: true,  img: IMAGES[6], label: "🔒 Exclusive" },
  { type: "video" as const, locked: true,  src: VIDEOS[1].src, thumb: IMAGES[7], label: "🔒 VIP Exclusive" },
  { type: "photo" as const, locked: true,  img: IMAGES[8], label: "🔒 VIP Only" },
  { type: "photo" as const, locked: false, img: IMAGES[9], label: "Beach Day" },
  { type: "photo" as const, locked: true,  img: IMAGES[10], label: "🔒 Members Only" },
  { type: "video" as const, locked: true,  src: VIDEOS[2].src, thumb: IMAGES[11], label: "🔒 Private Clip" },
];

export default function Members() {
  const { toast } = useToast();
  const { config } = usePlatformConfig();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [selectedId, setSelectedId] = useState("quarterly");
  const [dmSent, setDmSent] = useState(false);

  const TIERS = [
    { id: "monthly",   name: "Monthly",   price: config.subMonthly,   per: "per month",        badge: null },
    { id: "quarterly", name: "3-Month",   price: config.subQuarterly, per: "per quarter",      badge: "Most Popular" },
    { id: "lifetime",  name: "Lifetime",  price: config.subLifetime,  per: "one-time forever", badge: "Best Value" },
  ];
  const selectedTier = TIERS.find(t => t.id === selectedId) || TIERS[1];

  useEffect(() => {
    if (localStorage.getItem("sr_subscribed") === "true") setIsSubscribed(true);
  }, []);

  const handleDmToSubscribe = () => {
    setDmSent(true);
    toast({
      title: "Great! Head to Messages 💬",
      description: `Send Sophie a DM saying you want the ${selectedTier.name} plan ($${selectedTier.price}) and she'll set you up personally.`,
    });
  };

  return (
    <Layout>
      {/* ─── HERO ─── */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
        <img src={IMAGES[0]} alt="" className="absolute inset-0 w-full h-full object-cover object-top opacity-40" crossOrigin="anonymous" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/40" />
        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/30 rounded-full px-5 py-2 mb-6">
            <Crown className="w-4 h-4 text-amber-400" />
            <span className="text-amber-400 text-xs font-bold tracking-widest uppercase">Private Members Club</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-4">
            The Inner <span style={{color:"#c9a84c"}}>Circle</span>
          </h1>
          <p className="text-white/60 text-lg max-w-xl mx-auto">
            No algorithms. No censorship. Just my most exclusive content — reserved for members only.
          </p>
        </div>
      </section>

      {/* ─── PRIVATE CONTENT GRID ─── */}
      <section className="py-20 bg-black border-t border-white/5">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <p className="text-amber-400 text-xs font-bold tracking-[0.3em] uppercase mb-2">Private Library</p>
            <h2 className="text-3xl font-serif font-bold text-white">Exclusive Feed</h2>
            <p className="text-white/40 text-sm mt-2">{CONTENT.filter(c => c.locked).length} pieces of exclusive content locked behind VIP</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {CONTENT.map((c, i) => (
              <div key={i} className="group relative aspect-square overflow-hidden rounded-xl ring-1 ring-white/5">
                {c.type === "video" ? (
                  isSubscribed || !c.locked
                    ? <video src={c.src} className="w-full h-full object-cover" controls={!c.locked} playsInline preload="metadata" poster={c.thumb} />
                    : <img src={c.thumb} alt="" className="w-full h-full object-cover" crossOrigin="anonymous" />
                ) : (
                  <img src={c.img} alt={c.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" crossOrigin="anonymous" />
                )}
                {c.locked && !isSubscribed && (
                  <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{background:"rgba(201,168,76,0.15)",border:"1px solid rgba(201,168,76,0.4)"}}>
                      <Lock className="w-5 h-5 text-amber-400" />
                    </div>
                    <p className="text-white font-semibold text-sm">Members Only</p>
                  </div>
                )}
                <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-white text-xs font-medium">{c.label}</p>
                </div>
              </div>
            ))}
          </div>
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

                {/* Photo preview strip */}
                <div className="mt-10">
                  <p className="text-white/30 text-xs uppercase tracking-widest mb-3">Preview</p>
                  <div className="flex gap-2 overflow-hidden">
                    {IMAGES.slice(12, 17).map((img, i) => (
                      <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 ring-1 ring-white/10">
                        <img src={img} alt="" className="w-full h-full object-cover" crossOrigin="anonymous" />
                        {i > 1 && (
                          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                            <Lock className="w-3 h-3 text-amber-400" />
                          </div>
                        )}
                      </div>
                    ))}
                    <div className="w-16 h-16 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 text-xs font-bold shrink-0">
                      +{IMAGES.length - 5} more
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing + DM to Pay */}
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

                {/* Payment notice */}
                <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-4 mb-5 flex gap-3 items-start">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-amber-400 text-xs font-bold mb-1">Payment via DM</p>
                    <p className="text-white/50 text-xs leading-relaxed">Online checkout is temporarily unavailable. Send Sophie a DM to arrange your subscription — she'll confirm and activate your access personally.</p>
                  </div>
                </div>

                {!dmSent ? (
                  <div className="space-y-3">
                    <Link href="/messages">
                      <button
                        onClick={handleDmToSubscribe}
                        className="w-full h-14 rounded-xl font-black text-lg tracking-wider text-black hover:scale-[1.01] active:scale-[0.99] transition-transform shadow-xl flex items-center justify-center gap-3"
                        style={{background:"linear-gradient(135deg,#c9a84c,#f0d080,#c9a84c)"}}
                      >
                        <MessageCircle className="w-5 h-5" />
                        DM Sophie to Subscribe — ${selectedTier.price}
                      </button>
                    </Link>
                    <p className="text-center text-white/30 text-xs flex items-center justify-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Secure · Personally confirmed by Sophie
                    </p>
                  </div>
                ) : (
                  <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-5 text-center">
                    <CheckCircle2 className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <p className="text-white font-bold mb-1">Almost there!</p>
                    <p className="text-white/50 text-sm mb-4">Go to Messages and tell Sophie you want the {selectedTier.name} plan (${selectedTier.price}). She'll confirm and activate your VIP access.</p>
                    <Link href="/messages">
                      <button className="h-10 px-6 rounded-xl font-bold text-sm text-black" style={{background:"linear-gradient(135deg,#c9a84c,#f0d080,#c9a84c)"}}>
                        Open Messages <ChevronRight className="w-4 h-4 inline" />
                      </button>
                    </Link>
                  </div>
                )}
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
            <button onClick={() => { localStorage.removeItem("sr_subscribed"); setIsSubscribed(false); }} className="text-white/30 text-sm hover:text-white/50 transition-colors underline">
              Not your account? Sign out
            </button>
          </div>
        </section>
      )}
    </Layout>
  );
}
