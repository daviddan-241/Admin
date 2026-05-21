import React, { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Instagram, Twitter, Music2, Globe, Lock, Heart, Play } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type Post = {
  id: number;
  imageUrl: string;
  caption: string | null;
  platform: string;
  isPrivate: boolean;
  watermark: boolean;
  createdAt: string;
};

const PLATFORM_CONFIG: Record<string, { icon: React.ReactNode; label: string; gradient: string }> = {
  instagram: { icon: <Instagram className="w-3 h-3" />, label: "Instagram", gradient: "from-purple-500 via-pink-500 to-orange-400" },
  twitter: { icon: <Twitter className="w-3 h-3" />, label: "X / Twitter", gradient: "from-sky-500 to-blue-600" },
  tiktok: { icon: <Music2 className="w-3 h-3" />, label: "TikTok", gradient: "from-pink-500 to-red-600" },
  custom: { icon: <Globe className="w-3 h-3" />, label: "Exclusive", gradient: "from-rose-500 to-primary" },
};

function PlatformBadge({ platform }: { platform: string }) {
  const c = PLATFORM_CONFIG[platform] ?? PLATFORM_CONFIG.custom;
  return (
    <div className={`inline-flex items-center gap-1 text-white text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r ${c.gradient} shadow-sm`}>
      {c.icon} {c.label}
    </div>
  );
}

function Watermark() {
  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-white/12 font-serif font-bold text-3xl tracking-widest rotate-[-35deg] whitespace-nowrap drop-shadow">
          SOPHIE RAIN
        </span>
      </div>
      <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full">
        <div className="w-3 h-3 rounded-full bg-primary flex items-center justify-center">
          <span className="text-[6px] font-bold text-white">SR</span>
        </div>
        <span className="text-white/50 text-[9px] font-medium">sophieraiin</span>
      </div>
    </div>
  );
}

export default function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Post | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const isSubscribed = !!localStorage.getItem("sr_subscribed");

  useEffect(() => {
    fetch(`${BASE}/api/posts`)
      .then((r) => r.json())
      .then((data) => { setPosts(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const platforms = ["all", ...Array.from(new Set(posts.map((p) => p.platform)))];
  const visible = posts.filter((p) => filter === "all" || p.platform === filter);
  const publicPosts = visible.filter((p) => !p.isPrivate);
  const vipPosts = visible.filter((p) => p.isPrivate);

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="pt-16 pb-10 text-center px-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 text-primary text-sm font-medium mb-5">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" /> Live Feed
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-3">Sophie's World</h1>
          <p className="text-muted-foreground max-w-lg mx-auto text-base">
            Behind-the-scenes moments, exclusive content, and Miami life.
          </p>

          {/* Platform filter */}
          {platforms.length > 2 && (
            <div className="flex flex-wrap justify-center gap-2 mt-8">
              {platforms.map((p) => {
                const c = p === "all" ? null : PLATFORM_CONFIG[p];
                return (
                  <button
                    key={p}
                    onClick={() => setFilter(p)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-all
                      ${filter === p
                        ? "bg-white text-black border-white shadow-lg"
                        : "bg-card/30 border-white/10 text-muted-foreground hover:text-white hover:border-white/20"}`}
                  >
                    {c?.icon} {p === "all" ? "All Posts" : c?.label ?? p}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="container mx-auto px-4 max-w-6xl pb-20">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="aspect-square rounded-2xl bg-card/30 border border-white/5 animate-pulse" />
              ))}
            </div>
          ) : publicPosts.length === 0 && vipPosts.length === 0 ? (
            <div className="text-center py-24 text-muted-foreground">
              <Heart className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>Content coming soon — follow Hannah on socials for updates!</p>
            </div>
          ) : (
            <>
              {/* Public posts grid */}
              {publicPosts.length > 0 && (
                <div className="columns-2 md:columns-3 gap-3 md:gap-4 space-y-3 md:space-y-4 mb-8">
                  {publicPosts.map((post, i) => (
                    <div
                      key={post.id}
                      onClick={() => setSelected(post)}
                      className="relative break-inside-avoid rounded-2xl overflow-hidden cursor-pointer group border border-white/5 hover:border-white/20 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(225,29,72,0.2)] hover:-translate-y-0.5 block"
                    >
                      <img
                        src={post.imageUrl}
                        alt={post.caption || "Sophie Rain"}
                        className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        style={{ aspectRatio: i % 5 === 0 ? "1/1.3" : i % 3 === 0 ? "1/0.8" : "1/1" }}
                        loading="lazy"
                        onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&fit=crop"; }}
                      />
                      {/* Only watermark custom uploads, NOT platform content */}
                      {post.watermark && post.platform === "custom" && <Watermark />}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
                      <div className="absolute top-2 left-2"><PlatformBadge platform={post.platform} /></div>
                      {post.caption && (
                        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-200">
                          <p className="text-white text-xs line-clamp-2 leading-relaxed">{post.caption}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* VIP private section */}
              {vipPosts.length > 0 && (
                <div className="mt-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-secondary/40 to-transparent" />
                    <div className="flex items-center gap-2 text-secondary text-sm font-bold">
                      <Lock className="w-4 h-4" /> VIP Exclusive ({vipPosts.length})
                    </div>
                    <div className="h-px flex-1 bg-gradient-to-r from-secondary/40 via-transparent to-transparent" />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {vipPosts.map((post) => (
                      <div
                        key={post.id}
                        onClick={() => isSubscribed ? setSelected(post) : undefined}
                        className={`relative aspect-square rounded-2xl overflow-hidden border ${isSubscribed ? "border-secondary/30 cursor-pointer hover:border-secondary/60" : "border-secondary/10"} group transition-all`}
                      >
                        <img
                          src={post.imageUrl}
                          alt="VIP content"
                          className={`w-full h-full object-cover transition-transform duration-500 ${isSubscribed ? "group-hover:scale-105" : "blur-xl scale-110"}`}
                          loading="lazy"
                        />
                        {!isSubscribed && (
                          <>
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                              <div className="w-12 h-12 rounded-full bg-secondary/20 border border-secondary/40 flex items-center justify-center mb-3">
                                <Lock className="w-6 h-6 text-secondary" />
                              </div>
                              <p className="text-white font-bold text-sm mb-1">VIP Only</p>
                              <p className="text-white/50 text-[11px] mb-4">Members unlock this content</p>
                              <Link href="/members">
                                <Button size="sm" className="bg-secondary text-black hover:bg-secondary/90 text-xs rounded-full px-4 font-bold">
                                  Unlock Access
                                </Button>
                              </Link>
                            </div>
                          </>
                        )}
                        <div className="absolute top-2 left-2"><PlatformBadge platform={post.platform} /></div>
                        <div className="absolute top-2 right-2">
                          <span className="bg-secondary text-black text-[10px] font-bold px-2 py-0.5 rounded-full">VIP</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Socials row */}
          <div className="mt-16 bg-card/20 border border-white/5 rounded-3xl p-8 text-center">
            <h3 className="text-2xl font-serif font-bold text-white mb-2">Follow on Every Platform</h3>
            <p className="text-muted-foreground text-sm mb-7">Never miss a moment from Sophie</p>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                { href: "https://instagram.com/sophieraiin", label: "Instagram", icon: <Instagram className="w-4 h-4" />, cls: "from-purple-500 via-pink-500 to-orange-400" },
                { href: "https://x.com/sophieraiin", label: "X / Twitter", icon: <Twitter className="w-4 h-4" />, cls: "from-sky-400 to-blue-600" },
                { href: "https://tiktok.com/@sophieraiin", label: "TikTok", icon: <Music2 className="w-4 h-4" />, cls: "from-pink-500 to-red-600" },
              ].map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noreferrer">
                  <button className={`flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r ${s.cls} text-white text-sm font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200`}>
                    {s.icon} {s.label}
                  </button>
                </a>
              ))}
              <Link href="/members">
                <button className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-rose-500 to-primary text-white text-sm font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200">
                  <Lock className="w-4 h-4" /> VIP Members
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="relative max-w-xl w-full bg-card/80 border border-white/10 rounded-3xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="relative">
              <img src={selected.imageUrl} alt={selected.caption || ""} className="w-full max-h-[70vh] object-contain" />
              {selected.watermark && selected.platform === "custom" && <Watermark />}
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <PlatformBadge platform={selected.platform} />
                <span className="text-xs text-muted-foreground">
                  {new Date(selected.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                </span>
              </div>
              {selected.caption && <p className="text-white/90 text-sm leading-relaxed">{selected.caption}</p>}
              <button onClick={() => setSelected(null)} className="mt-4 text-muted-foreground hover:text-white text-sm transition-colors">Close ✕</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
