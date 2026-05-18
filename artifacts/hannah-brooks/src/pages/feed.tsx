import React, { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Instagram, Twitter, Music2, Globe, Lock, Play, Heart, Eye } from "lucide-react";

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

function PlatformBadge({ platform }: { platform: string }) {
  const config: Record<string, { icon: React.ReactNode; label: string; cls: string }> = {
    instagram: { icon: <Instagram className="w-3 h-3" />, label: "Instagram", cls: "from-purple-500 to-pink-500" },
    twitter: { icon: <Twitter className="w-3 h-3" />, label: "X / Twitter", cls: "from-sky-500 to-blue-600" },
    tiktok: { icon: <Music2 className="w-3 h-3" />, label: "TikTok", cls: "from-pink-500 to-red-500" },
    custom: { icon: <Globe className="w-3 h-3" />, label: "Exclusive", cls: "from-rose-500 to-primary" },
  };
  const c = config[platform] ?? config.custom;
  return (
    <div className={`inline-flex items-center gap-1 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gradient-to-r ${c.cls} shadow-sm`}>
      {c.icon} {c.label}
    </div>
  );
}

function Watermark() {
  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
      {/* Diagonal watermark text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="text-white/15 font-serif font-bold text-3xl tracking-widest whitespace-nowrap"
          style={{ transform: "rotate(-35deg)", textShadow: "0 0 20px rgba(225,29,72,0.3)" }}
        >
          HANNAH BROOKS
        </div>
      </div>
      {/* Corner watermark */}
      <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full">
        <div className="w-3 h-3 rounded-full bg-primary flex items-center justify-center">
          <span className="text-[6px] font-bold text-white">HB</span>
        </div>
        <span className="text-white/60 text-[9px] font-medium">hannahbrooks.com</span>
      </div>
    </div>
  );
}

export default function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Post | null>(null);
  const isSubscribed = typeof window !== "undefined" && !!localStorage.getItem("hb_subscribed");

  useEffect(() => {
    fetch(`${BASE}/api/posts`)
      .then((r) => r.json())
      .then((data) => { setPosts(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const publicPosts = posts.filter((p) => !p.isPrivate);
  const vipPosts = posts.filter((p) => p.isPrivate);

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Hero */}
        <div className="pt-16 pb-10 text-center px-4">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 text-primary text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            Live Feed
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-4">Hannah's World</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Behind-the-scenes moments, exclusive content, and daily life — all in one place.
          </p>
        </div>

        {/* Feed Grid */}
        <div className="container mx-auto px-4 max-w-6xl pb-20">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-square rounded-2xl bg-card/30 border border-white/5 animate-pulse" />
              ))}
            </div>
          ) : publicPosts.length === 0 && vipPosts.length === 0 ? (
            <div className="text-center py-24 text-muted-foreground">
              <Heart className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
              <p>Content coming soon. Follow Hannah on socials for updates!</p>
            </div>
          ) : (
            <>
              {/* Public posts */}
              {publicPosts.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-6">
                  {publicPosts.map((post) => (
                    <div
                      key={post.id}
                      onClick={() => setSelected(post)}
                      className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer group border border-white/5 hover:border-white/20 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(225,29,72,0.2)] hover:-translate-y-0.5"
                    >
                      <img
                        src={post.imageUrl}
                        alt={post.caption || "Hannah Brooks"}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.src = "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=400&h=400&fit=crop";
                        }}
                      />
                      {post.watermark && <Watermark />}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
                      <div className="absolute top-2 left-2">
                        <PlatformBadge platform={post.platform} />
                      </div>
                      {post.caption && (
                        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                          <p className="text-white text-xs line-clamp-2 leading-relaxed">{post.caption}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* VIP locked posts */}
              {vipPosts.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-secondary/40 to-transparent" />
                    <div className="flex items-center gap-2 text-secondary text-sm font-semibold">
                      <Lock className="w-4 h-4" /> VIP Exclusive
                    </div>
                    <div className="h-px flex-1 bg-gradient-to-r from-secondary/40 via-transparent to-transparent" />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                    {vipPosts.map((post) => (
                      <div key={post.id} className="relative aspect-square rounded-2xl overflow-hidden border border-secondary/20 group">
                        {/* Blurred preview */}
                        <img
                          src={post.imageUrl}
                          alt="VIP content"
                          className="w-full h-full object-cover blur-lg scale-110"
                          onError={(e) => {
                            e.currentTarget.src = "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=400&h=400&fit=crop";
                          }}
                        />
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
                        {/* Lock overlay */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                          <div className="w-12 h-12 rounded-full bg-secondary/20 border border-secondary/40 flex items-center justify-center mb-3">
                            <Lock className="w-6 h-6 text-secondary" />
                          </div>
                          <p className="text-white font-semibold text-sm mb-1">VIP Only</p>
                          <p className="text-white/50 text-xs mb-3">Members unlock exclusive content</p>
                          {!isSubscribed && (
                            <Link href="/members">
                              <Button size="sm" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 text-xs rounded-full px-4">
                                Unlock Access
                              </Button>
                            </Link>
                          )}
                        </div>
                        <div className="absolute top-2 left-2">
                          <PlatformBadge platform={post.platform} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Social links */}
          <div className="mt-16 bg-card/30 border border-white/5 rounded-3xl p-8 text-center">
            <h3 className="text-2xl font-serif font-bold text-white mb-2">Follow Across Platforms</h3>
            <p className="text-muted-foreground text-sm mb-8">Never miss a moment</p>
            <div className="flex flex-wrap justify-center gap-4">
              {[
                { href: "https://instagram.com/hannahbrooks", label: "Instagram", icon: <Instagram className="w-5 h-5" />, cls: "from-purple-500 to-pink-500" },
                { href: "https://x.com/hannahbrooksxx", label: "X / Twitter", icon: <Twitter className="w-5 h-5" />, cls: "from-sky-400 to-blue-600" },
                { href: "https://tiktok.com/@hannahbrooksxxx", label: "TikTok", icon: <Music2 className="w-5 h-5" />, cls: "from-pink-500 to-red-600" },
                { href: "/members", label: "VIP Members", icon: <Lock className="w-5 h-5" />, cls: "from-rose-500 to-primary", internal: true },
              ].map((s) =>
                s.internal ? (
                  <Link key={s.label} href="/members">
                    <button className={`flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r ${s.cls} text-white text-sm font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200`}>
                      {s.icon} {s.label}
                    </button>
                  </Link>
                ) : (
                  <a key={s.label} href={s.href} target="_blank" rel="noreferrer">
                    <button className={`flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r ${s.cls} text-white text-sm font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200`}>
                      {s.icon} {s.label}
                    </button>
                  </a>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="relative max-w-2xl w-full bg-card/80 border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-square">
              <img src={selected.imageUrl} alt={selected.caption || ""} className="w-full h-full object-cover" />
              {selected.watermark && <Watermark />}
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <PlatformBadge platform={selected.platform} />
                <span className="text-xs text-muted-foreground">
                  {new Date(selected.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                </span>
              </div>
              {selected.caption && <p className="text-white/90 text-sm leading-relaxed">{selected.caption}</p>}
              <button onClick={() => setSelected(null)} className="mt-4 text-muted-foreground hover:text-white text-sm transition-colors">
                Close ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
