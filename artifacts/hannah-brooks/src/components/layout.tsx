import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Instagram, Twitter, Music2 } from "lucide-react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/feed", label: "Feed" },
  { href: "/store", label: "Boutique" },
  { href: "/messages", label: "Messages" },
  { href: "/calls", label: "Calls" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/85 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="font-serif text-2xl font-bold tracking-tight text-white hover:text-primary transition-colors">
            HANNAH BROOKS
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                  ${location === l.href ? "text-white bg-white/8" : "text-muted-foreground hover:text-white hover:bg-white/5"}`}
              >
                {l.label}
              </Link>
            ))}
            <div className="w-px h-5 bg-white/10 mx-2" />
            <Link
              href="/members"
              className="px-4 py-1.5 rounded-full text-sm font-bold bg-gradient-to-r from-primary to-rose-400 text-white hover:shadow-[0_0_18px_rgba(225,29,72,0.45)] transition-all duration-200"
            >
              VIP Members
            </Link>
          </nav>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 text-muted-foreground hover:text-white transition-colors rounded-lg hover:bg-white/5"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile nav */}
        {open && (
          <div className="md:hidden border-t border-white/5 bg-background/98 backdrop-blur-xl px-4 py-3 space-y-1 animate-in slide-in-from-top-2 duration-200">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`block px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
                  ${location === l.href ? "text-white bg-white/8" : "text-muted-foreground hover:text-white hover:bg-white/5"}`}
              >
                {l.label}
              </Link>
            ))}
            <Link href="/members" onClick={() => setOpen(false)}
              className="block px-3 py-2.5 rounded-xl text-sm font-bold text-secondary hover:bg-secondary/10 transition-colors">
              ⭐ VIP Members
            </Link>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="py-14 border-t border-border/40 bg-card/20 mt-auto">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-10 mb-10">
            <div>
              <h2 className="font-serif text-2xl font-bold text-white mb-3">Hannah Brooks</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                British creator, entertainer &amp; fitness enthusiast. Follow along for exclusive content and behind-the-scenes moments.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4 text-xs uppercase tracking-widest">Quick Links</h4>
              <div className="space-y-2">
                {[...navLinks, { href: "/members", label: "VIP Members" }].map((l) => (
                  <Link key={l.href} href={l.href} className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4 text-xs uppercase tracking-widest">Follow Hannah</h4>
              <div className="space-y-3">
                <a href="https://instagram.com/hannahbrooks" target="_blank" rel="noreferrer"
                  className="flex items-center gap-3 text-sm text-muted-foreground hover:text-white transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Instagram className="w-4 h-4 text-white" />
                  </div>
                  @hannahbrooks
                </a>
                <a href="https://x.com/hannahbrooksxx" target="_blank" rel="noreferrer"
                  className="flex items-center gap-3 text-sm text-muted-foreground hover:text-white transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-black border border-white/20 flex items-center justify-center">
                    <Twitter className="w-4 h-4 text-white" />
                  </div>
                  @hannahbrooksxx
                </a>
                <a href="https://tiktok.com/@hannahbrooksxxx" target="_blank" rel="noreferrer"
                  className="flex items-center gap-3 text-sm text-muted-foreground hover:text-white transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-600 to-red-600 flex items-center justify-center">
                    <Music2 className="w-4 h-4 text-white" />
                  </div>
                  @hannahbrooksxxx
                </a>
                <a href="https://onlyfans.com/hannahbrooks" target="_blank" rel="noreferrer"
                  className="flex items-center gap-3 text-sm text-muted-foreground hover:text-secondary transition-colors font-medium">
                  <div className="w-8 h-8 rounded-lg bg-[#00AFF0]/15 border border-[#00AFF0]/30 flex items-center justify-center text-[#00AFF0] text-xs font-bold">
                    OF
                  </div>
                  OnlyFans
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-white/5 pt-6 text-center">
            <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Hannah Brooks. All rights reserved. · 18+ only</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
