import React, { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { usePlatformConfig } from "@/hooks/use-platform-config";
import { Star, Lock, Heart, Sparkles, MessageCircle, Video, ChevronRight, Instagram, Twitter } from "lucide-react";

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
  { src: `${BASE_URL}videos/sophie1.mp4`, label: "Lifestyle" },
  { src: `${BASE_URL}videos/sophie2.mp4`, label: "Behind the Scenes" },
  { src: `${BASE_URL}videos/sophie3.mp4`, label: "Day in My Life" },
  { src: `${BASE_URL}videos/sophie4.mp4`, label: "Exclusive Clip" },
  { src: `${BASE_URL}videos/sophie5.mp4`, label: "For My Fans" },
];

export default function Home() {
  const { toast } = useToast();
  const { config } = usePlatformConfig();
  const [formState, setFormState] = useState({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeGalleryIdx, setActiveGalleryIdx] = useState(0);

  const galleryImages = IMAGES;

  useEffect(() => {
    const t = setInterval(() => setActiveGalleryIdx(i => (i + 1) % galleryImages.length), 3500);
    return () => clearInterval(t);
  }, []);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      toast({ title: "Message sent ✨", description: "Thank you for reaching out. I'll be in touch." });
      setFormState({ name: "", email: "", message: "" });
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <Layout>
      {/* ─── HERO ────────────────────────────────────── */}
      <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden">
        {galleryImages.map((img, i) => (
          <div key={i} className={`absolute inset-0 transition-opacity duration-1000 ${i === activeGalleryIdx ? "opacity-100" : "opacity-0"}`}>
            <img src={img} alt="" className="w-full h-full object-cover object-top" crossOrigin="anonymous" />
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30 z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40 z-10" />

        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
          <div className="flex justify-center mb-8">
            <div className="w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden border-4 border-amber-400/30 drop-shadow-2xl shadow-2xl shadow-amber-400/20">
              <img src="/logo-hb.png" alt="Hannah Brooks" className="w-full h-full object-cover"
                onError={e => { const t = e.target as HTMLImageElement; t.style.display="none"; t.parentElement!.style.background="linear-gradient(135deg,#c9a84c,#f0d080)"; t.parentElement!.innerHTML='<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-weight:900;color:#000;font-size:36px;font-family:serif">HB</div>'; }} />
            </div>
          </div>
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold font-serif mb-4 tracking-tighter text-white drop-shadow-2xl">
            HANNAH<br /><span style={{color:"#c9a84c"}}>BROOKS</span>
          </h1>
          <p className="text-lg md:text-xl text-white/80 font-light mb-3 tracking-[0.25em] uppercase">
            {config.creatorTagline}
          </p>
          <div className="flex items-center justify-center gap-2 mb-10">
            <span className="h-px w-16 bg-amber-400/60" />
            <Star className="w-4 h-4 text-amber-400" fill="currentColor" />
            <Star className="w-4 h-4 text-amber-400" fill="currentColor" />
            <Star className="w-4 h-4 text-amber-400" fill="currentColor" />
            <span className="h-px w-16 bg-amber-400/60" />
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/members">
              <button className="inline-flex h-14 items-center justify-center rounded-full px-10 text-sm font-bold tracking-widest uppercase text-black shadow-2xl hover:scale-105 active:scale-95 transition-transform" style={{background:"linear-gradient(135deg,#c9a84c,#f0d080,#c9a84c)"}}>
                <Lock className="w-4 h-4 mr-2" /> Unlock VIP Access
              </button>
            </Link>
            <a href="#about" className="inline-flex h-14 items-center justify-center rounded-full border border-white/30 bg-black/30 backdrop-blur px-10 text-sm font-medium text-white tracking-widest uppercase hover:bg-white/10 hover:scale-105 transition-transform">
              Explore More
            </a>
          </div>
          <p className="mt-6 text-white/40 text-sm tracking-wider">18+ · Adult content locked behind VIP</p>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1 opacity-60">
          <div className="w-px h-12 bg-gradient-to-b from-transparent to-white/60" />
          <span className="text-white/60 text-xs tracking-[0.2em] uppercase">Scroll</span>
        </div>
      </section>

      {/* ─── STATS BAR ───────────────────────────────── */}
      <section className="border-y border-white/5 bg-black py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { num: "14.2M+", label: "TikTok Followers" },
              { num: "8.7M+", label: "Instagram Fans" },
              { num: "#1", label: "OnlyFans Earner" },
              { num: "★ 4.9", label: "Member Rating" },
            ].map(s => (
              <div key={s.label}>
                <p className="text-2xl md:text-3xl font-bold font-serif" style={{color:"#c9a84c"}}>{s.num}</p>
                <p className="text-white/50 text-sm mt-1 tracking-wider uppercase">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ABOUT ───────────────────────────────────── */}
      <section id="about" className="py-28 bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="relative aspect-[3/4] overflow-hidden rounded-2xl">
                <img src={IMAGES[3]} alt="Hannah Brooks" className="object-cover w-full h-full hover:scale-105 transition-transform duration-1000" crossOrigin="anonymous" />
                <div className="absolute inset-0 ring-1 ring-inset ring-amber-400/20 rounded-2xl" />
              </div>
              <div className="absolute -bottom-6 -right-6 w-36 h-36 overflow-hidden rounded-2xl ring-4 ring-black shadow-2xl">
                <img src={IMAGES[8]} alt="" className="object-cover w-full h-full" crossOrigin="anonymous" />
              </div>
              <div className="absolute top-8 -left-4 bg-black/80 backdrop-blur border border-amber-400/30 rounded-xl px-4 py-3 shadow-xl">
                <p className="text-amber-400 text-xs font-bold tracking-wider uppercase mb-1">Exclusive Content</p>
                <p className="text-white text-sm font-medium">Available for Members</p>
              </div>
            </div>
            <div className="space-y-7">
              <div>
                <p className="text-amber-400 text-xs font-bold tracking-[0.3em] uppercase mb-3">About Hannah</p>
                <h2 className="text-4xl md:text-5xl font-serif font-bold text-white leading-tight">Behind<br />the Velvet<br />Ropes</h2>
              </div>
              <div className="h-px bg-gradient-to-r from-amber-400/60 to-transparent" />
              <p className="text-lg text-white/70 leading-relaxed">
                {config.creatorBio}
              </p>
              <p className="text-white/50 leading-relaxed">
                I built this platform for my realest fans — no middlemen, no algorithms, just us. Everything here is personal, private, and made just for you.
              </p>
              <div className="flex flex-wrap gap-3">
                {["Fitness", "Lifestyle", "Adult Content", "Custom Requests"].map(tag => (
                  <span key={tag} className="px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider border border-amber-400/30 text-amber-400/80">{tag}</span>
                ))}
              </div>
              <Link href="/members">
                <button className="inline-flex items-center gap-2 font-bold tracking-wider text-amber-400 hover:text-amber-300 transition-colors group">
                  Join the Inner Circle <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── MASONRY GALLERY ─────────────────────────── */}
      <section className="py-24 bg-black border-t border-white/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-amber-400 text-xs font-bold tracking-[0.3em] uppercase mb-3">Gallery</p>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-white">Visual Highlights</h2>
            <p className="text-white/50 mt-4 max-w-xl mx-auto">A curated glimpse. The full uncensored collection is behind VIP.</p>
          </div>
          <div className="columns-2 md:columns-3 lg:columns-4 gap-3 md:gap-4 space-y-3 md:space-y-4">
            {IMAGES.slice(0, 12).map((img, i) => (
              <div key={i} className="break-inside-avoid group relative overflow-hidden rounded-xl ring-1 ring-white/5">
                <img src={img} alt="" className="w-full object-cover group-hover:scale-105 transition-transform duration-700" crossOrigin="anonymous" />
                {i % 4 === 0 && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="flex items-center gap-1 text-amber-400 text-xs font-bold tracking-wider"><Lock className="w-3 h-3" /> VIP</span>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/members">
              <button className="inline-flex h-12 items-center gap-2 rounded-full px-8 font-bold text-sm tracking-wider text-black hover:scale-105 transition-transform" style={{background:"linear-gradient(135deg,#c9a84c,#f0d080,#c9a84c)"}}>
                <Lock className="w-4 h-4" /> Unlock All Content
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── VIDEOS ──────────────────────────────────── */}
      <section className="py-24 bg-background border-t border-white/5">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-16">
            <div>
              <p className="text-amber-400 text-xs font-bold tracking-[0.3em] uppercase mb-3">Video</p>
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-white">Life in Motion</h2>
            </div>
            <Link href="/feed">
              <button className="text-amber-400 text-sm font-semibold hover:text-amber-300 transition-colors flex items-center gap-1">
                Full Feed <ChevronRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
          <div className="flex overflow-x-auto pb-6 -mx-4 px-4 gap-5 snap-x" style={{scrollbarWidth:"none"}}>
            {VIDEOS.map((v, i) => (
              <div key={i} className="shrink-0 w-[240px] md:w-[280px] snap-center group">
                <div className="relative aspect-[9/16] rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-2xl">
                  <video src={v.src} className="w-full h-full object-cover" controls playsInline preload="metadata" poster={IMAGES[i]} />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 pointer-events-none">
                    <p className="text-white font-semibold text-sm">{v.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SERVICES PREVIEW ────────────────────────── */}
      <section className="py-24 bg-black border-t border-white/5">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-16">
            <p className="text-amber-400 text-xs font-bold tracking-[0.3em] uppercase mb-3">Services</p>
            <h2 className="text-4xl font-serif font-bold text-white">Connect With Sophie</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: <MessageCircle className="w-7 h-7" />, title: "Private DMs", desc: "Send a personal message. First few on me — then pay via DM.", href: "/messages", price: `from $${config.msgPrice}` },
              { icon: <Video className="w-7 h-7" />, title: "1-on-1 Calls", desc: "FaceTime, Zoom, or WhatsApp video. Real time with Sophie.", href: "/calls", price: `from $${config.callWa5}` },
              { icon: <Sparkles className="w-7 h-7" />, title: "Custom Content", desc: "Request bespoke photos or videos made just for you.", href: "/store", price: `from $${config.requestPrice}` },
            ].map(s => (
              <Link key={s.title} href={s.href}>
                <div className="group relative bg-zinc-900 hover:bg-zinc-800 border border-white/5 hover:border-amber-400/30 rounded-2xl p-7 transition-all cursor-pointer h-full">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-5 text-amber-400" style={{background:"rgba(201,168,76,0.1)"}}>
                    {s.icon}
                  </div>
                  <h3 className="text-white font-bold text-lg mb-2">{s.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed mb-4">{s.desc}</p>
                  <p className="text-amber-400 font-bold text-sm">{s.price}</p>
                  <ChevronRight className="absolute top-7 right-7 w-5 h-5 text-white/20 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SOCIALS ─────────────────────────────────── */}
      <section className="py-20 border-t border-white/5 bg-background">
        <div className="container mx-auto px-4 text-center">
          <p className="text-amber-400 text-xs font-bold tracking-[0.3em] uppercase mb-4">Follow Me</p>
          <h2 className="text-3xl font-serif font-bold text-white mb-12">Find Me Everywhere</h2>
          <div className="flex flex-wrap justify-center gap-6 md:gap-10">
            {[
              { label: "TikTok", handle: "@sophieraiin", href: config.tiktokUrl, icon: "TT", color: "#ff0050" },
              { label: "X / Twitter", handle: "@sophieraiin", href: config.twitterUrl, icon: "X", color: "#1da1f2" },
              { label: "OnlyFans", handle: "sophierain", href: config.onlyfansUrl, icon: "OF", color: "#00aff0" },
              { label: "Instagram", handle: "@sophieraiin", href: config.instagramUrl, icon: "IG", color: "#e1306c" },
            ].map(s => (
              <a key={s.label} href={s.href} target="_blank" rel="noreferrer" className="flex flex-col items-center group">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3 text-white font-black text-lg group-hover:scale-110 transition-transform shadow-lg" style={{background:s.color+"22",border:`1px solid ${s.color}40`}}>
                  <span style={{color:s.color}}>{s.icon}</span>
                </div>
                <p className="text-white/70 text-xs font-semibold group-hover:text-white transition-colors">{s.handle}</p>
                <p className="text-white/30 text-xs">{s.label}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─────────────────────────────────────── */}
      <section className="py-36 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={IMAGES[0]} alt="" className="w-full h-full object-cover opacity-30" crossOrigin="anonymous" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/60" />
        </div>
        <div className="relative z-10 container mx-auto px-4 text-center max-w-3xl">
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 rounded-full flex items-center justify-center font-serif font-black text-black text-2xl opacity-90" style={{background:"linear-gradient(135deg,#c9a84c,#f0d080,#c9a84c)"}}>SR</div>
          </div>
          <h2 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6 leading-tight">
            No Algorithms.<br />No Limits.<br />Just <span style={{color:"#c9a84c"}}>Us.</span>
          </h2>
          <p className="text-xl text-white/70 mb-10 font-light leading-relaxed max-w-xl mx-auto">
            My exclusive members club. Uncensored content, priority DMs, and access to all of me.
          </p>
          <Link href="/members">
            <button className="inline-flex h-16 items-center gap-3 rounded-full px-12 text-lg font-black tracking-wider text-black shadow-2xl hover:scale-105 active:scale-95 transition-transform" style={{background:"linear-gradient(135deg,#c9a84c,#f0d080,#c9a84c)"}}>
              <Lock className="w-5 h-5" /> Join VIP — From ${config.subMonthly}/mo
            </button>
          </Link>
        </div>
      </section>

      {/* ─── CONTACT ─────────────────────────────────── */}
      <section className="py-24 bg-black border-t border-white/5">
        <div className="container mx-auto px-4 max-w-lg">
          <div className="text-center mb-12">
            <p className="text-amber-400 text-xs font-bold tracking-[0.3em] uppercase mb-3">Business</p>
            <h2 className="text-4xl font-serif font-bold text-white">Get in Touch</h2>
            <p className="text-white/50 mt-3">Collabs, brand deals, bookings — say hello.</p>
          </div>
          <form onSubmit={handleContactSubmit} className="space-y-5 bg-zinc-900 p-8 rounded-2xl border border-white/5">
            <div>
              <label className="text-xs font-bold text-white/50 tracking-wider uppercase block mb-2">Name</label>
              <Input value={formState.name} onChange={e => setFormState(s => ({ ...s, name: e.target.value }))} required placeholder="Your name" className="bg-black border-white/10 text-white placeholder:text-white/20 focus-visible:ring-amber-400/50" />
            </div>
            <div>
              <label className="text-xs font-bold text-white/50 tracking-wider uppercase block mb-2">Email</label>
              <Input type="email" value={formState.email} onChange={e => setFormState(s => ({ ...s, email: e.target.value }))} required placeholder="your@email.com" className="bg-black border-white/10 text-white placeholder:text-white/20 focus-visible:ring-amber-400/50" />
            </div>
            <div>
              <label className="text-xs font-bold text-white/50 tracking-wider uppercase block mb-2">Message</label>
              <Textarea value={formState.message} onChange={e => setFormState(s => ({ ...s, message: e.target.value }))} required placeholder="Tell me about your inquiry…" className="min-h-[110px] bg-black border-white/10 text-white placeholder:text-white/20 focus-visible:ring-amber-400/50" />
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full h-12 rounded-xl font-bold text-sm tracking-wider text-black transition-opacity hover:opacity-90 disabled:opacity-50" style={{background:"linear-gradient(135deg,#c9a84c,#f0d080,#c9a84c)"}}>
              {isSubmitting ? "Sending…" : "Send Message"}
            </button>
          </form>
        </div>
      </section>
    </Layout>
  );
}
