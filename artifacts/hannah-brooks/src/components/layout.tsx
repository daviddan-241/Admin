import React, { useState, useContext } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Instagram, Twitter, Music2, Sun, Moon, Crown } from "lucide-react";
import { ThemeContext } from "@/App";

const logoHB = `${import.meta.env.BASE_URL}logo-hb.png`;

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
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-black/90 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <img
              src={logoHB}
              alt="Hannah Brooks"
              className="w-9 h-9 object-contain group-hover:opacity-80 transition-opacity"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
            <span className="font-serif text-xl font-bold tracking-tight text-white group-hover:opacity-80 transition-opacity hidden sm:block" style={{letterSpacing:"0.05em"}}>
              HANNAH <span style={{color:"#c9a84c"}}>BROOKS</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium tracking-wide transition-colors
                  ${location === l.href
                    ? "text-white"
                    : "text-white/50 hover:text-white hover:bg-white/5"}`}
              >
                {l.label}
              </Link>
            ))}
            <div className="w-px h-5 bg-white/10 mx-2" />
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <Link href="/members">
              <button className="ml-1 inline-flex items-center gap-2 h-9 px-5 rounded-full font-bold text-xs tracking-widest text-black hover:scale-105 transition-transform" style={{background:"linear-gradient(135deg,#c9a84c,#f0d080,#c9a84c)"}}>
                <Crown className="w-3 h-3" /> VIP ACCESS
              </button>
            </Link>
          </nav>

          {/* Mobile controls */}
          <div className="flex items-center gap-1 md:hidden">
            <button onClick={toggleTheme} aria-label="Toggle theme" className="p-2 text-white/40 hover:text-white transition-colors rounded-lg">
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button onClick={() => setOpen(!open)} className="p-2 text-white/40 hover:text-white transition-colors rounded-lg">
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {open && (
          <div className="md:hidden border-t border-white/5 bg-black/98 backdrop-blur-xl px-4 py-3 space-y-1 animate-in slide-in-from-top-2 duration-200">
            {navLinks.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
                className={`block px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
                  ${location === l.href ? "text-white bg-white/5" : "text-white/50 hover:text-white hover:bg-white/5"}`}>
                {l.label}
              </Link>
            ))}
            <Link href="/members" onClick={() => setOpen(false)}>
              <button className="w-full mt-2 h-10 rounded-xl font-bold text-xs tracking-widest text-black" style={{background:"linear-gradient(135deg,#c9a84c,#f0d080,#c9a84c)"}}>
                VIP ACCESS
              </button>
            </Link>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="py-16 border-t border-white/5 bg-zinc-950 mt-auto">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-10 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <img src={logoHB} alt="HB" className="w-10 h-10 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                <span className="font-serif text-xl font-bold text-white">HANNAH <span style={{color:"#c9a84c"}}>BROOKS</span></span>
              </div>
              <p className="text-white/40 text-sm leading-relaxed max-w-xs">
                British creator, adult entertainer, fitness lover, and dog mum. Exclusive digital home — velvet ropes, zero boundaries.
              </p>
              <p className="text-white/20 text-xs mt-4">18+ Only · Adult Content Platform</p>
            </div>
            <div>
              <h4 className="text-white/30 font-bold mb-4 text-xs uppercase tracking-widest">Navigate</h4>
              <div className="space-y-2">
                {[...navLinks, { href: "/members", label: "VIP Members" }].map((l) => (
                  <Link key={l.href} href={l.href} className="block text-sm text-white/50 hover:text-white/80 transition-colors">
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-white/30 font-bold mb-4 text-xs uppercase tracking-widest">Social</h4>
              <div className="space-y-3">
                <a href="https://instagram.com/hannahbrooks" target="_blank" rel="noreferrer"
                  className="flex items-center gap-3 text-sm text-white/50 hover:text-white/80 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0">
                    <Instagram className="w-4 h-4 text-white" />
                  </div>@hannahbrooks
                </a>
                <a href="https://x.com/hannahbrooksxx" target="_blank" rel="noreferrer"
                  className="flex items-center gap-3 text-sm text-white/50 hover:text-white/80 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-white/10 flex items-center justify-center shrink-0">
                    <Twitter className="w-4 h-4 text-white" />
                  </div>@hannahbrooksxx
                </a>
                <a href="https://tiktok.com/@hannahbrooksxxx" target="_blank" rel="noreferrer"
                  className="flex items-center gap-3 text-sm text-white/50 hover:text-white/80 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-600 to-red-600 flex items-center justify-center shrink-0">
                    <Music2 className="w-4 h-4 text-white" />
                  </div>@hannahbrooksxxx
                </a>
                <a href="https://onlyfans.com/hannahbrooks" target="_blank" rel="noreferrer"
                  className="flex items-center gap-3 text-sm text-white/50 hover:text-white/80 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-[#00AFF0]/10 border border-[#00AFF0]/30 flex items-center justify-center shrink-0">
                    <span className="text-[#00AFF0] text-xs font-black">OF</span>
                  </div>OnlyFans
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-white/20">© {new Date().getFullYear()} Hannah Brooks · All rights reserved</p>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <p className="text-xs text-white/20">Platform Online</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
