import React, { useState, useEffect, useRef } from "react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  Instagram, Twitter, Music2, Globe, Lock, Heart,
  Play, Pause, Volume2, VolumeX, Maximize2, X
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "";
const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type Post = {
  id: number;
  imageUrl: string;
  videoUrl?: string | null;
  thumbnailUrl?: string | null;
  mediaType?: string;
  caption: string | null;
  content?: string | null;
  platform: string;
  isPrivate: boolean;
  watermark: boolean;
  createdAt: string;
};

const PLATFORM_CONFIG: Record<string, { icon: React.ReactNode; label: string; gradient: string }> = {
  instagram: { icon: <Instagram className="w-3 h-3" />, label: "Instagram", gradient: "from-purple-500 via-pink-500 to-orange-400" },
  twitter: { icon: <Twitter className="w-3 h-3" />, label: "X / Twitter", gradient: "from-sky-500 to-blue-600" },
  x: { icon: <Twitter className="w-3 h-3" />, label: "X / Twitter", gradient: "from-sky-500 to-blue-600" },
  tiktok: { icon: <Music2 className="w-3 h-3" />, label: "TikTok", gradient: "from-pink-500 to-red-600" },
  custom: { icon: <Globe className="w-3 h-3" />, label: "Exclusive", gradient: "from-amber-500 to-yellow-600" },
};

function resolveUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (url.startsWith("/uploads/")) return `${API_BASE}${url}`;
  return url;
}

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
          HANNAH BROOKS
        </span>
      </div>
      <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full">
        <img src="/logo-hb.png" alt="" className="w-3 h-3 rounded-full object-cover"
          onError={e => { const t = e.target as HTMLImageElement; t.style.display="none"; }} />
        <span className="text-white/50 text-[9px] font-medium">@hannahbrooks</span>
      </div>
    </div>
  );
}

function VideoCard({ post, onClick }: { post: Post; onClick: () => void }) {
  const vidRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!vidRef.current) return;
    if (playing) { vidRef.current.pause(); setPlaying(false); }
    else { vidRef.current.play().catch(() => {}); setPlaying(true); }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!vidRef.current) return;
    vidRef.current.muted = !vidRef.current.muted;
    setMuted(vidRef.current.muted);
  };

  return (
    <div
      className="relative break-inside-avoid rounded-2xl overflow-hidden cursor-pointer group border border-white/5 hover:border-amber-400/30 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(201,168,76,0.15)] hover:-translate-y-0.5 block bg-black"
      style={{ aspectRatio: "9/16" }}
      onClick={onClick}
    >
      <video
        ref={vidRef}
        src={resolveUrl(post.videoUrl)}
        poster={resolveUrl(post.thumbnailUrl || post.imageUrl)}
        className="w-full h-full object-cover"
        loop muted playsInline preload="metadata"
        onEnded={() => setPlaying(false)}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
      <div className="absolute top-2 left-2 z-10"><PlatformBadge platform={post.platform} /></div>
      <div className="absolute top-2 right-2 z-10">
        <span className="bg-black/60 backdrop-blur text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-white/10 flex items-center gap-1">
          <Play className="w-2 h-2 fill-white" /> VIDEO
        </span>
      </div>
      <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between">
        <button onClick={toggle} className="w-9 h-9 rounded-full bg-black/60 backdrop-blur border border-white/20 flex items-center justify-center hover:bg-black/80 transition-colors">
          {playing ? <Pause className="w-4 h-4 text-white fill-white" /> : <Play className="w-4 h-4 text-white fill-white ml-0.5" />}
        </button>
        <div className="flex items-center gap-2">
          <button onClick={toggleMute} className="w-7 h-7 rounded-full bg-black/60 backdrop-blur border border-white/10 flex items-center justify-center hover:bg-black/80 transition-colors">
            {muted ? <VolumeX className="w-3 h-3 text-white/60" /> : <Volume2 className="w-3 h-3 text-white" />}
          </button>
          <button onClick={(e) => { e.stopPropagation(); onClick(); }} className="w-7 h-7 rounded-full bg-black/60 backdrop-blur border border-white/10 flex items-center justify-center hover:bg-black/80 transition-colors">
            <Maximize2 className="w-3 h-3 text-white/60" />
          </button>
        </div>
      </div>
      {(post.caption || post.content) && (
        <div className="absolute bottom-14 left-3 right-3 z-10">
          <p className="text-white text-xs line-clamp-2 leading-relaxed drop-shadow">{post.caption || post.content}</p>
        </div>
      )}
      {post.watermark && post.platform === "custom" && <Watermark />}
    </div>
  );
}

function ImageCard({ post, onClick, index }: { post: Post; onClick: () => void; index: number }) {
  return (
    <div onClick={onClick} className="relative break-inside-avoid rounded-2xl overflow-hidden cursor-pointer group border border-white/5 hover:border-amber-400/30 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(201,168,76,0.15)] hover:-translate-y-0.5 block">
      <img
        src={resolveUrl(post.imageUrl)}
        alt={post.caption || post.content || "Sophie Rain"}
        className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
        style={{ aspectRatio: index % 5 === 0 ? "1/1.3" : index % 3 === 0 ? "1/0.8" : "1/1" }}
        loading="lazy"
        onError={(e) => { e.currentTarget.src = "/sophie-avatar.png"; }}
      />
      {post.watermark && post.platform === "custom" && <Watermark />}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
      <div className="absolute top-2 left-2"><PlatformBadge platform={post.platform} /></div>
      {(post.caption || post.content) && (
        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-200">
          <p className="text-white text-xs line-clamp-2 leading-relaxed">{post.caption || post.content}</p>
        </div>
      )}
    </div>
  );
}

function Lightbox({ post, onClose }: { post: Post; onClose: () => void }) {
  const vidRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(false);
  const isVideo = post.mediaType === "video" || !!post.videoUrl;

  useEffect(() => {
    if (isVideo && vidRef.current) vidRef.current.play().catch(() => setPlaying(false));
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const togglePlay = () => {
    if (!vidRef.current) return;
    if (playing) { vidRef.current.pause(); setPlaying(false); }
    else { vidRef.current.play().catch(() => {}); setPlaying(true); }
  };
  const toggleMute = () => {
    if (!vidRef.current) return;
    vidRef.current.muted = !vidRef.current.muted;
    setMuted(vidRef.current.muted);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/97 backdrop-blur-xl flex items-center justify-center p-4" onClick={onClose}>
      <div className="relative max-w-2xl w-full bg-zinc-900/90 border border-white/10 rounded-3xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-black/60 backdrop-blur flex items-center justify-center border border-white/10 hover:bg-white/10 transition-colors">
          <X className="w-4 h-4 text-white" />
        </button>
        <div className="relative">
          {isVideo ? (
            <div className="relative">
              <video ref={vidRef} src={resolveUrl(post.videoUrl)} poster={resolveUrl(post.thumbnailUrl || post.imageUrl)} className="w-full max-h-[70vh] object-contain bg-black" loop playsInline onEnded={() => setPlaying(false)} />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <button onClick={togglePlay} className="w-11 h-11 rounded-full bg-black/70 backdrop-blur border border-white/20 flex items-center justify-center hover:bg-black/90 transition-colors">
                  {playing ? <Pause className="w-5 h-5 text-white fill-white" /> : <Play className="w-5 h-5 text-white fill-white ml-0.5" />}
                </button>
                <button onClick={toggleMute} className="w-9 h-9 rounded-full bg-black/70 backdrop-blur border border-white/20 flex items-center justify-center hover:bg-black/90 transition-colors">
                  {muted ? <VolumeX className="w-4 h-4 text-white/60" /> : <Volume2 className="w-4 h-4 text-white" />}
                </button>
              </div>
            </div>
          ) : (
            <>
              <img src={resolveUrl(post.imageUrl)} alt={post.caption || ""} className="w-full max-h-[70vh] object-contain bg-black" />
              {post.watermark && post.platform === "custom" && <Watermark />}
            </>
          )}
        </div>
        <div className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <PlatformBadge platform={post.platform} />
              {isVideo && (
                <span className="text-[10px] bg-amber-400/15 border border-amber-400/30 text-amber-400 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Play className="w-2 h-2 fill-current" /> VIDEO
                </span>
              )}
            </div>
            <span className="text-xs text-white/30">
              {new Date(post.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
            </span>
          </div>
          {(post.caption || post.content) && <p className="text-white/90 text-sm leading-relaxed">{post.caption || post.content}</p>}
        </div>
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

  // Initial load
  useEffect(() => {
    fetch(`${BASE}/api/posts`)
      .then((r) => r.json())
      .then((data) => { setPosts(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Real-time SSE: new posts from admin appear instantly
  useEffect(() => {
    const apiBase = API_BASE || window.location.origin;
    const sse = new EventSource(`${apiBase}/api/events`);

    sse.onmessage = (e) => {
      try {
        const event = JSON.parse(e.data) as {
          type: string;
          post?: Post;
          postId?: number;
        };

        if (event.type === "new_post" && event.post) {
          setPosts((prev) => {
            if (prev.some((p) => p.id === event.post!.id)) return prev;
            return [event.post as Post, ...prev];
          });
        } else if (event.type === "delete_post" && event.postId) {
          setPosts((prev) => prev.filter((p) => p.id !== event.postId));
        }
      } catch { /* ignore malformed events */ }
    };

    sse.onerror = () => {
      // SSE will auto-reconnect — no action needed
    };

    return () => sse.close();
  }, []);

  const platforms = ["all", ...Array.from(new Set(posts.map((p) => p.platform)))];
  const visible = posts.filter((p) => filter === "all" || p.platform === filter);
  const publicPosts = visible.filter((p) => !p.isPrivate);
  const vipPosts = visible.filter((p) => p.isPrivate);
  const videoPosts = publicPosts.filter(p => p.mediaType === "video" || !!p.videoUrl);
  const imagePosts = publicPosts.filter(p => p.mediaType !== "video" && !p.videoUrl);

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <div className="pt-16 pb-10 text-center px-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-amber-400/5 to-transparent pointer-events-none" />
          <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/20 rounded-full px-4 py-1.5 text-amber-400 text-sm font-medium mb-5">
            <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" /> Live Feed
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-3">Sophie's World</h1>
          <p className="text-white/40 max-w-lg mx-auto text-base">
            Behind-the-scenes moments, exclusive videos, and Miami life.
          </p>
          {platforms.length > 2 && (
            <div className="flex flex-wrap justify-center gap-2 mt-8">
              {platforms.map((p) => {
                const c = p === "all" ? null : PLATFORM_CONFIG[p];
                return (
                  <button key={p} onClick={() => setFilter(p)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-all
                      ${filter === p
                        ? "bg-amber-400 text-black border-amber-400 shadow-lg"
                        : "bg-white/5 border-white/10 text-white/50 hover:text-white hover:border-white/20"}`}
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
                <div key={i} className="aspect-square rounded-2xl bg-white/5 border border-white/5 animate-pulse" />
              ))}
            </div>
          ) : publicPosts.length === 0 && vipPosts.length === 0 ? (
            <div className="text-center py-24 text-white/20">
              <Heart className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>Content coming soon — follow Sophie on socials for updates!</p>
            </div>
          ) : (
            <>
              {videoPosts.length > 0 && (
                <div className="mb-12">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="flex items-center gap-2">
                      <Play className="w-5 h-5 text-amber-400 fill-amber-400" />
                      <h2 className="text-lg font-bold text-white">Videos</h2>
                      <span className="text-xs bg-amber-400/10 border border-amber-400/20 text-amber-400 px-2 py-0.5 rounded-full font-bold">{videoPosts.length}</span>
                    </div>
                    <div className="h-px flex-1 bg-white/5" />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {videoPosts.map((post) => (
                      <VideoCard key={post.id} post={post} onClick={() => setSelected(post)} />
                    ))}
                  </div>
                </div>
              )}

              {imagePosts.length > 0 && (
                <div className="mb-8">
                  {videoPosts.length > 0 && (
                    <div className="flex items-center gap-3 mb-5">
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-amber-400" />
                        <h2 className="text-lg font-bold text-white">Photos</h2>
                        <span className="text-xs bg-amber-400/10 border border-amber-400/20 text-amber-400 px-2 py-0.5 rounded-full font-bold">{imagePosts.length}</span>
                      </div>
                      <div className="h-px flex-1 bg-white/5" />
                    </div>
                  )}
                  <div className="columns-2 md:columns-3 gap-3 md:gap-4 space-y-3 md:space-y-4">
                    {imagePosts.map((post, i) => (
                      <ImageCard key={post.id} post={post} onClick={() => setSelected(post)} index={i} />
                    ))}
                  </div>
                </div>
              )}

              {vipPosts.length > 0 && (
                <div className="mt-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />
                    <div className="flex items-center gap-2 text-amber-400 text-sm font-bold">
                      <Lock className="w-4 h-4" /> VIP Exclusive ({vipPosts.length})
                    </div>
                    <div className="h-px flex-1 bg-gradient-to-r from-amber-400/30 via-transparent to-transparent" />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {vipPosts.map((post) => {
                      const isVideo = post.mediaType === "video" || !!post.videoUrl;
                      return (
                        <div key={post.id} onClick={() => isSubscribed ? setSelected(post) : undefined}
                          className={`relative aspect-square rounded-2xl overflow-hidden border ${isSubscribed ? "border-amber-400/30 cursor-pointer hover:border-amber-400/60" : "border-amber-400/10"} group transition-all`}
                        >
                          <img src={resolveUrl(post.thumbnailUrl || post.imageUrl)} alt="VIP content"
                            className={`w-full h-full object-cover transition-transform duration-500 ${isSubscribed ? "group-hover:scale-105" : "blur-xl scale-110"}`}
                            loading="lazy" />
                          {isVideo && isSubscribed && (
                            <div className="absolute top-2 right-2">
                              <span className="bg-black/60 backdrop-blur text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-white/10 flex items-center gap-1">
                                <Play className="w-2 h-2 fill-white" /> VIDEO
                              </span>
                            </div>
                          )}
                          {!isSubscribed && (
                            <>
                              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                                <div className="w-12 h-12 rounded-full bg-amber-400/20 border border-amber-400/40 flex items-center justify-center mb-3">
                                  <Lock className="w-6 h-6 text-amber-400" />
                                </div>
                                <p className="text-white font-bold text-sm mb-1">VIP Only</p>
                                <p className="text-white/50 text-[11px] mb-4">Members unlock {isVideo ? "this video" : "this content"}</p>
                                <Link href="/members">
                                  <Button size="sm" className="bg-amber-400 text-black hover:bg-amber-300 text-xs rounded-full px-4 font-bold">
                                    Unlock Access
                                  </Button>
                                </Link>
                              </div>
                            </>
                          )}
                          <div className="absolute top-2 left-2"><PlatformBadge platform={post.platform} /></div>
                          <div className="absolute top-2 right-2">
                            <span className="bg-amber-400 text-black text-[10px] font-bold px-2 py-0.5 rounded-full">VIP</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          <div className="mt-16 bg-white/3 border border-white/5 rounded-3xl p-8 text-center">
            <h3 className="text-2xl font-serif font-bold text-white mb-2">Follow Sophie Everywhere</h3>
            <p className="text-white/40 text-sm mb-7">Never miss a moment — videos drop daily 🎬</p>
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
                <button className="flex items-center gap-2 px-5 py-2.5 rounded-full text-black text-sm font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200" style={{ background: "linear-gradient(135deg,#c9a84c,#f0d080)" }}>
                  <Lock className="w-4 h-4" /> VIP Members
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {selected && <Lightbox post={selected} onClose={() => setSelected(null)} />}
    </Layout>
  );
}
