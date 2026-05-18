import React from "react";
import { Link } from "wouter";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="font-serif text-2xl font-bold tracking-tight text-white hover:text-primary transition-colors">
            HANNAH BROOKS
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Home
            </Link>
            <Link href="/members" className="text-sm font-medium text-secondary hover:text-white transition-colors">
              VIP Members
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        {children}
      </main>
      <footer className="py-12 border-t border-border/40 bg-card/30 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-serif text-3xl font-bold mb-6">Stay Connected</h2>
          <div className="flex justify-center gap-8 mb-8">
            <a href="https://tiktok.com/@hannahbrooksxxx" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors">TikTok</a>
            <a href="https://x.com/hannahbrooksxx" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors">X / Twitter</a>
            <a href="https://onlyfans.com/hannahbrooks" target="_blank" rel="noreferrer" className="text-secondary hover:text-white transition-colors">OnlyFans</a>
          </div>
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Hannah Brooks. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
