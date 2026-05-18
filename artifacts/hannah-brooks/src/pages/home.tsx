import React, { useState } from "react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

// Photos
import imgHero from "@assets/IMG_2411_1779144779567.jpeg";
import imgSportsBra from "@assets/IMG_2413_1779144779567.jpeg";
import imgBikiniBunny from "@assets/IMG_2414_1779144779567.jpeg";
import imgSportswear from "@assets/IMG_2412_1779144779567.jpeg";
import imgChampagne from "@assets/IMG_2415_1779144779567.jpeg";
import imgLeopard from "@assets/IMG_2409_1779144779567.jpeg";
import imgTartan from "@assets/IMG_2408_1779144779567.jpeg";
import imgUnionJack from "@assets/IMG_2410_1779144779567.jpeg";
import imgTealLace from "@assets/IMG_2407_1779144779567.jpeg";
import imgPurpleSports from "@assets/ff67c966-f09a-4535-929d-0faa2edcf33b_1779144779567.jpeg";
import imgBlueTop from "@assets/86671805-56d9-497f-80f6-9e767d6d775f_1779144779567.jpeg";
import imgGymshark from "@assets/IMG_2406_1779144779567.jpeg";
import imgBlackSheer from "@assets/621a6159-c0fd-4251-aee5-12d5784ad850_1779144779567.jpeg";
import imgGolfSkirt from "@assets/4213f549-3b25-453e-8b15-244f70907615_1779144779567.jpeg";

// Videos — served from public/videos/ with clean filenames
const vidKaraoke = `${import.meta.env.BASE_URL}videos/karaoke.mp4`;
const vidHighFive = `${import.meta.env.BASE_URL}videos/highfive.mp4`;
const vidDogs = `${import.meta.env.BASE_URL}videos/frenchies.mp4`;
const vidLife1 = `${import.meta.env.BASE_URL}videos/lifestyle1.mov`;
const vidLife2 = `${import.meta.env.BASE_URL}videos/lifestyle2.mov`;

export default function Home() {
  const { toast } = useToast();
  const [formState, setFormState] = useState({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      toast({ title: "Message sent", description: "Thanks for reaching out! I'll get back to you soon." });
      setFormState({ name: "", email: "", message: "" });
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <Layout>
      {/* 1. Hero Section */}
      <section className="relative w-full h-[90vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={imgHero} alt="Hannah Brooks" className="w-full h-full object-cover object-top opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-transparent to-transparent" />
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold font-serif mb-4 tracking-tighter text-white drop-shadow-lg">
            HANNAH BROOKS
          </h1>
          <p className="text-xl md:text-2xl text-white/90 font-light mb-8 max-w-2xl mx-auto tracking-wide">
            British Creator &bull; Entertainer &bull; Fitness Lover
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/members" className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-sm font-semibold text-primary-foreground shadow transition-colors hover:bg-primary/90">
              Unlock VIP Access
            </Link>
            <a href="#about" className="inline-flex h-12 items-center justify-center rounded-full border border-white/20 bg-black/40 backdrop-blur px-8 text-sm font-medium text-white transition-colors hover:bg-white/10">
              Explore More
            </a>
          </div>
        </div>
      </section>

      {/* 2. About Section */}
      <section id="about" className="py-24 bg-background relative border-t border-white/5">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative aspect-[3/4] md:aspect-square overflow-hidden rounded-2xl">
              <img src={imgGolfSkirt} alt="Hannah on the golf course" className="object-cover w-full h-full hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-2xl" />
            </div>
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-white">Behind the Scenes</h2>
              <div className="h-1 w-20 bg-primary rounded-full"></div>
              <p className="text-lg text-muted-foreground leading-relaxed">
                I'm Hannah — a British content creator, adult entertainer, fitness lover, and dog mum. Whether I'm hitting the gym, singing my heart out at karaoke, or practicing my swing on the golf course, I live life with passion and unapologetic confidence.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                This space is my exclusive digital home where I share the sides of my life you won't see anywhere else. Velvet ropes, zero boundaries.
              </p>
              <div className="pt-4">
                <Link href="/members" className="text-primary hover:text-primary/80 font-semibold tracking-wide uppercase text-sm border-b border-primary/30 pb-1 hover:border-primary transition-all">
                  Join the Inner Circle &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Photo Gallery */}
      <section className="py-24 bg-card/30 border-t border-white/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-white">Visuals</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">A glimpse into the lifestyle.</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <div className="grid gap-4 md:gap-6">
              <img src={imgTealLace} alt="Gallery" className="w-full rounded-lg object-cover" />
              <img src={imgSportsBra} alt="Gallery" className="w-full rounded-lg object-cover" />
              <img src={imgBlackSheer} alt="Gallery" className="w-full rounded-lg object-cover" />
            </div>
            <div className="grid gap-4 md:gap-6">
              <img src={imgBikiniBunny} alt="Gallery" className="w-full rounded-lg object-cover" />
              <img src={imgLeopard} alt="Gallery" className="w-full rounded-lg object-cover" />
              <img src={imgUnionJack} alt="Gallery" className="w-full rounded-lg object-cover" />
            </div>
            <div className="grid gap-4 md:gap-6">
              <img src={imgTartan} alt="Gallery" className="w-full rounded-lg object-cover" />
              <img src={imgGymshark} alt="Gallery" className="w-full rounded-lg object-cover" />
              <img src={imgChampagne} alt="Gallery" className="w-full rounded-lg object-cover" />
            </div>
            <div className="grid gap-4 md:gap-6">
              <img src={imgPurpleSports} alt="Gallery" className="w-full rounded-lg object-cover" />
              <img src={imgBlueTop} alt="Gallery" className="w-full rounded-lg object-cover" />
              <img src={imgSportswear} alt="Gallery" className="w-full rounded-lg object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* 4. Video Highlights */}
      <section className="py-24 bg-background border-t border-white/5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">Highlights</h2>
              <p className="text-muted-foreground text-lg">Life in motion. Karaoke, comedy, and everything in between.</p>
            </div>
          </div>

          <div className="flex overflow-x-auto pb-8 -mx-4 px-4 gap-6 snap-x hide-scrollbar">
            {[
              { src: vidKaraoke, title: "Karaoke Nights" },
              { src: vidHighFive, title: "Story Time" },
              { src: vidDogs, title: "Dog Mum Life" },
              { src: vidLife1, title: "Lifestyle" },
              { src: vidLife2, title: "Behind the Scenes" }
            ].map((vid, idx) => (
              <div key={idx} className="shrink-0 w-[280px] md:w-[320px] snap-center">
                <div className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-muted group ring-1 ring-white/10 shadow-xl">
                  <video 
                    src={vid.src} 
                    className="w-full h-full object-cover"
                    controls
                    playsInline
                    preload="metadata"
                    poster={imgHero} // Use hero as rough poster fallback
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none transition-opacity duration-300 group-hover:opacity-0" />
                  <div className="absolute bottom-4 left-4 pointer-events-none transition-opacity duration-300 group-hover:opacity-0">
                    <p className="text-white font-medium drop-shadow-md">{vid.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Social Links */}
      <section className="py-20 bg-accent text-accent-foreground border-y border-white/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-serif font-bold mb-10">Connect With Me</h2>
          <div className="flex flex-wrap justify-center gap-6 md:gap-12">
            <a href="https://tiktok.com/@hannahbrooksxxx" target="_blank" rel="noreferrer" className="flex flex-col items-center group">
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-3 group-hover:bg-white/20 transition-colors ring-1 ring-white/20">
                <span className="text-xl font-bold">TT</span>
              </div>
              <span className="font-medium text-white/80 group-hover:text-white transition-colors">@hannahbrooksxxx</span>
            </a>
            <a href="https://x.com/hannahbrooksxx" target="_blank" rel="noreferrer" className="flex flex-col items-center group">
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-3 group-hover:bg-white/20 transition-colors ring-1 ring-white/20">
                <span className="text-xl font-bold">X</span>
              </div>
              <span className="font-medium text-white/80 group-hover:text-white transition-colors">@hannahbrooksxx</span>
            </a>
            <a href="https://onlyfans.com/hannahbrooks" target="_blank" rel="noreferrer" className="flex flex-col items-center group">
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-3 group-hover:bg-white/20 transition-colors ring-1 ring-white/20">
                <span className="text-xl font-bold">OF</span>
              </div>
              <span className="font-medium text-white/80 group-hover:text-white transition-colors">hannahbrooks</span>
            </a>
          </div>
        </div>
      </section>

      {/* 6. Contact Form */}
      <section className="py-24 bg-background relative">
        <div className="container mx-auto px-4 max-w-xl">
          <div className="text-center mb-12 space-y-4">
            <h2 className="text-4xl font-serif font-bold text-white">Get in Touch</h2>
            <p className="text-muted-foreground">Business inquiries, bookings, or just saying hello.</p>
          </div>
          
          <form onSubmit={handleContactSubmit} className="space-y-6 bg-card/50 p-8 rounded-2xl border border-white/5 backdrop-blur-sm">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-white/80">Name</label>
              <Input 
                id="name" 
                value={formState.name} 
                onChange={e => setFormState(s => ({ ...s, name: e.target.value }))}
                required 
                className="bg-black/50 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-primary"
                placeholder="Your name"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-white/80">Email</label>
              <Input 
                id="email" 
                type="email"
                value={formState.email} 
                onChange={e => setFormState(s => ({ ...s, email: e.target.value }))}
                required 
                className="bg-black/50 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-primary"
                placeholder="your@email.com"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="message" className="text-sm font-medium text-white/80">Message</label>
              <Textarea 
                id="message" 
                value={formState.message} 
                onChange={e => setFormState(s => ({ ...s, message: e.target.value }))}
                required 
                className="min-h-[120px] bg-black/50 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-primary"
                placeholder="What's on your mind?"
              />
            </div>
            <Button type="submit" disabled={isSubmitting} className="w-full h-12 text-md rounded-xl bg-white text-black hover:bg-white/90 font-semibold shadow-lg">
              {isSubmitting ? "Sending..." : "Send Message"}
            </Button>
          </form>
        </div>
      </section>

      {/* 7. CTA Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={imgHero} alt="Background" className="w-full h-full object-cover opacity-20 filter saturate-0" />
          <div className="absolute inset-0 bg-primary/20 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/20" />
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center max-w-3xl">
          <h2 className="text-5xl md:text-6xl font-serif font-bold text-white mb-6">Join the VIP Club</h2>
          <p className="text-xl text-white/80 mb-10 leading-relaxed font-light">
            Ready to see more? Unlock my exclusive, uncensored content hub. No algorithms, no rules — just you and me.
          </p>
          <Link href="/members" className="inline-flex h-14 items-center justify-center rounded-full bg-primary px-10 text-lg font-bold text-primary-foreground shadow-xl transition-all hover:bg-primary/90 hover:scale-105 active:scale-95 ring-4 ring-primary/20">
            Unlock Full Access Now
          </Link>
        </div>
      </section>

      {/* Adding a global style block just for the hide-scrollbar utility */}
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </Layout>
  );
}
