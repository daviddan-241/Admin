import React, { useEffect, useState } from "react";
import { Layout } from "@/components/layout";
import { Link } from "wouter";
import {
  Instagram, Twitter, Music2, Crown, Heart, MessageCircle,
  Video, Star, Sparkles, Lock, Globe, CheckCircle2, ChevronRight,
  Image as ImageIcon, Play
} from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const API = `${BASE}/api`;

const IMAGES = [
  "https://i.ibb.co/PGCnqyX5/IMG-5005.jpg",
  "https://i.ibb.co/vC3TShzm/IMG-5006.jpg",
  "https://i.ibb.co/BHyHr4v0/IMG-5007.jpg",
  "https://i.ibb.co/hFkvzFym/IMG-5008.jpg",
  "https://i.ibb.co/WpWxr9WM/IMG-5009.jpg",
  "https://i.ibb.co/hxBn0NXK/IMG-5010.jpg",
];

type Stats = {
  totalMessages?: number;
  totalPosts?: number;
  totalCalls?: number;
  totalTips?: number;
};

type Post = {
  id: number;
  platform: string;
  content: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
  isVip: boolean;
  publishedAt: string;
};

const GOLD = "#c9a84c";
const GOLD_GRAD = "linear-gradient(135deg,#c9a84c,#f0d080,#a07830)";

function SophieAvatarLarge() {
  return (
    <div
      className="relative rounded-full shadow-2xl overflow-hidden"
      style={{
        width: 120, height: 120,
        background: GOLD_GRAD,
        boxShadow: `0 0 60px rgba(201,168,76,0.4), 0 0 120px rgba(201,168,76,0.15)`,
      }}
    >
      <img
        src={IMAGES[0]}
        alt="Sophie Rain"
        className="w-full h-full object-cover object-top"
        crossOrigin="anonymous"
      />
    </div>
  );
}

const socialLinks = [
  { label: "Instagram", icon: Instagram, href: "https://instagram.com/sophieraiin", color: "#e1306c" },
  { label: "X / Twitter", icon: Twitter, href: "https://x.com/sophieraiin", color: "#1da1f2" },
  { label: "TikTok", icon: Music2, href: "https://tiktok.com/@sophieraiin", color: "#ffffff" },
];

const highlights = [
  "Miami-born creator 🌴",
  "Fitness, lifestyle & exclusive content",
  "Personal video calls & custom content",
  "VIP Members get everything 💕",
];

const vipPerks = [
  "Unlimited private messages",
  "Exclusive adult content gallery",
  "Priority video call booking",
  "Custom content requests",
  "Behind-the-scenes access",
  "Lifetime member badge",
];

export default function Profile() {
  const [stats, setStats] = useState<Stats>({});
  const [posts, setPosts] = useState<Post[]>([]);
  const [lightbox, setLightbox] = useState<Post | null>(null);

  useEffect(() => {
    fetch(`${API}/stats`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setStats(d); })
      .catch(() => {});

    fetch(`${API}/posts?limit=12`)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (Array.isArray(d)) setPosts(d);
        else if (d?.posts) setPosts(d.posts);
      })
      .catch(() => {});
  }, []);

  const publicPosts = posts.filter(p => !p.isVip).slice(0, 9);
  const vipPosts = posts.filter(p => p.isVip).slice(0, 6);

  return (
    <Layout>
      <div className="min-h-screen" style={{ background: "radial-gradient(ellipse at top,#1a1000 0%,#060606 70%)" }}>

        {/* ── Hero ────────────────────────────────────────────────── */}
        <div className="relative pt-16 pb-10 flex flex-col items-center px-4 text-center">
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: GOLD_GRAD }} />

          <div className="flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full border text-xs font-semibold"
            style={{ background: "rgba(74,222,128,0.08)", borderColor: "rgba(74,222,128,0.25)", color: "#4ade80" }}>
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Online Now
          </div>

          <SophieAvatarLarge />

          <div className="mt-4 flex items-center gap-2">
            <h1 className="text-4xl font-serif font-bold text-white">Sophie Rain</h1>
            <CheckCircle2 className="w-6 h-6 shrink-0" style={{ color: GOLD }} />
          </div>
          <p className="mt-1 text-white/40 text-sm tracking-widest uppercase">Miami Creator · Entertainer · Fitness</p>

          <div className="flex items-center gap-3 mt-5">
            {socialLinks.map(({ label, icon: Icon, href, color }) => (
              <a key={label} href={href} target="_blank" rel="noreferrer"
                className="w-10 h-10 rounded-full flex items-center justify-center border border-white/10 hover:border-white/30 transition-all hover:scale-110"
                style={{ background: "rgba(255,255,255,0.04)" }}
                title={label}>
                <Icon className="w-4 h-4" style={{ color }} />
              </a>
            ))}
            <a href="https://onlyfans.com/sophierain" target="_blank" rel="noreferrer"
              className="w-10 h-10 rounded-full flex items-center justify-center border border-[#00AFF0]/30 hover:border-[#00AFF0]/60 transition-all hover:scale-110"
              style={{ background: "rgba(0,175,240,0.05)" }}>
              <span className="text-[#00AFF0] text-xs font-black">OF</span>
            </a>
          </div>

          <div className="mt-7 max-w-md space-y-2">
            {highlights.map(h => (
              <p key={h} className="text-white/60 text-sm flex items-center justify-center gap-2">
                <span>{h}</span>
              </p>
            ))}
          </div>
        </div>

        {/* ── Live Stats ──────────────────────────────────────────── */}
        <div className="max-w-2xl mx-auto px-4 pb-10">
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Fans", value: "14.2M+" },
              { label: "Posts", value: stats.totalPosts ?? 0 },
              { label: "Calls", value: stats.totalCalls ?? 0 },
              { label: "Happy Fans", value: "99%" },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-2xl p-4 text-center border"
                style={{ background: "rgba(201,168,76,0.04)", borderColor: "rgba(201,168,76,0.12)" }}>
                <p className="text-2xl font-bold font-serif" style={{ color: GOLD }}>{value}</p>
                <p className="text-[11px] text-white/40 mt-0.5 uppercase tracking-wider">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Quick Actions ───────────────────────────────────────── */}
        <div className="max-w-2xl mx-auto px-4 pb-12">
          <div className="grid grid-cols-2 gap-3">
            <Link href="/messages">
              <div className="rounded-2xl p-5 border cursor-pointer hover:scale-[1.02] transition-all active:scale-100"
                style={{ background: "linear-gradient(135deg,rgba(201,168,76,0.12),rgba(201,168,76,0.04))", borderColor: "rgba(201,168,76,0.25)" }}>
                <MessageCircle className="w-6 h-6 mb-3" style={{ color: GOLD }} />
                <p className="font-semibold text-white text-sm">Chat with Me</p>
                <p className="text-white/40 text-xs mt-0.5">First 5 messages free</p>
                <div className="mt-3 flex items-center gap-1 text-xs font-medium" style={{ color: GOLD }}>
                  Start chatting <ChevronRight className="w-3 h-3" />
                </div>
              </div>
            </Link>
            <Link href="/calls">
              <div className="rounded-2xl p-5 border cursor-pointer hover:scale-[1.02] transition-all active:scale-100"
                style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}>
                <Video className="w-6 h-6 mb-3 text-white/70" />
                <p className="font-semibold text-white text-sm">Book a Call</p>
                <p className="text-white/40 text-xs mt-0.5">Video & WhatsApp calls</p>
                <div className="mt-3 flex items-center gap-1 text-xs font-medium text-white/40">
                  From $29.99 <ChevronRight className="w-3 h-3" />
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* ── Public Feed Preview ─────────────────────────────────── */}
        <div className="max-w-2xl mx-auto px-4 pb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-serif font-bold text-xl">Latest Posts</h2>
            <Link href="/feed" className="text-sm font-medium flex items-center gap-1" style={{ color: GOLD }}>
              View all <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {publicPosts.length === 0 ? (
            <div className="rounded-2xl border border-white/5 p-8 text-center">
              <ImageIcon className="w-8 h-8 text-white/20 mx-auto mb-3" />
              <p className="text-white/30 text-sm">Posts will appear here once synced</p>
              <p className="text-white/20 text-xs mt-1">Connect social accounts in admin → Social Sync</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {publicPosts.map(post => (
                <button key={post.id} onClick={() => setLightbox(post)}
                  className="relative aspect-square rounded-xl overflow-hidden group bg-white/5">
                  {post.imageUrl ? (
                    <img src={post.imageUrl} alt={post.content} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center p-2">
                      <p className="text-white/40 text-xs text-center line-clamp-4">{post.content}</p>
                    </div>
                  )}
                  {post.videoUrl && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-black/60 flex items-center justify-center">
                        <Play className="w-4 h-4 text-white ml-0.5" />
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Private / VIP Section ───────────────────────────────── */}
        <div className="max-w-2xl mx-auto px-4 pb-16">
          <div className="rounded-3xl overflow-hidden border" style={{ borderColor: "rgba(201,168,76,0.2)" }}>
            <div className="px-6 pt-7 pb-5"
              style={{ background: "linear-gradient(135deg,rgba(201,168,76,0.12) 0%,rgba(160,120,48,0.06) 100%)" }}>
              <div className="flex items-center gap-3 mb-2">
                <Crown className="w-6 h-6" style={{ color: GOLD }} />
                <h2 className="text-white font-serif font-bold text-xl">Private Members Area</h2>
              </div>
              <p className="text-white/50 text-sm">Exclusive content only available to VIP members. Adults only 18+.</p>
            </div>

            {/* Preview of blurred VIP content using Sophie's photos */}
            <div className="grid grid-cols-3 gap-1 px-1 pb-1 bg-black/40">
              {IMAGES.slice(0, 6).map((img, i) => (
                <div key={i} className="relative aspect-square overflow-hidden">
                  <img src={img} alt="" className="w-full h-full object-cover scale-110 blur-[10px]" crossOrigin="anonymous" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Lock className="w-5 h-5" style={{ color: GOLD }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="px-6 py-6" style={{ background: "rgba(10,8,0,0.8)" }}>
              <div className="grid grid-cols-2 gap-2 mb-6">
                {vipPerks.map(perk => (
                  <div key={perk} className="flex items-center gap-2 text-xs text-white/60">
                    <Star className="w-3.5 h-3.5 shrink-0" style={{ color: GOLD }} />
                    {perk}
                  </div>
                ))}
              </div>

              <Link href="/members">
                <button className="w-full h-13 rounded-2xl font-bold text-black tracking-wide transition-all hover:brightness-110 active:scale-95 flex items-center justify-center gap-2 py-3"
                  style={{ background: GOLD_GRAD, boxShadow: `0 8px 32px rgba(201,168,76,0.35)` }}>
                  <Crown className="w-5 h-5" />
                  Unlock Private Access
                </button>
              </Link>
              <p className="text-center text-white/20 text-xs mt-3">Monthly · Quarterly · Lifetime options — DM to subscribe</p>
            </div>
          </div>
        </div>

        {/* ── About & Values ──────────────────────────────────────── */}
        <div className="max-w-2xl mx-auto px-4 pb-20">
          <div className="rounded-3xl border border-white/5 p-7"
            style={{ background: "rgba(255,255,255,0.02)" }}>
            <h2 className="text-white font-serif font-bold text-xl mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5" style={{ color: GOLD }} />
              About Sophie
            </h2>
            <div className="space-y-3 text-white/50 text-sm leading-relaxed">
              <p>Hey! I'm Sophie Rain, born and raised in Miami, Florida. I went from working a normal waitressing job to becoming the #1 earner on OnlyFans — and I built this platform for the real ones 💕</p>
              <p>I personally read and reply to every single message. My fans are everything to me — this platform is our own special world, no algorithms or restrictions.</p>
              <p className="flex items-center gap-2">
                <Heart className="w-4 h-4 shrink-0" style={{ color: GOLD }} />
                <span>DM me anytime — I'm actually here and I love connecting with each of you!</span>
              </p>
            </div>

            <div className="flex flex-wrap gap-2 mt-5">
              {["🌴 Miami", "💪 Fitness", "📸 Creator", "🎮 Pokémon Go", "🎵 Music lover", "✝️ Christian"].map(t => (
                <span key={t} className="text-xs px-3 py-1 rounded-full border text-white/40"
                  style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {lightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          onClick={() => setLightbox(null)}>
          <div className="max-w-lg w-full rounded-2xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            {lightbox.imageUrl && (
              <img src={lightbox.imageUrl} alt={lightbox.content} className="w-full max-h-[60vh] object-contain bg-black" />
            )}
            <div className="p-4" style={{ background: "#111" }}>
              <p className="text-white/70 text-sm">{lightbox.content}</p>
              <p className="text-white/30 text-xs mt-1">{new Date(lightbox.publishedAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
