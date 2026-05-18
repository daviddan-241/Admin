import React, { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Lock, Unlock, Star, ShieldCheck, PlayCircle, Image as ImageIcon } from "lucide-react";

// Photos
import imgHero from "@assets/IMG_2411_1779144779567.jpeg";
import imgSportsBra from "@assets/IMG_2413_1779144779567.jpeg";
import imgBikiniBunny from "@assets/IMG_2414_1779144779567.jpeg";
import imgSportswear from "@assets/IMG_2412_1779144779567.jpeg";
import imgChampagne from "@assets/IMG_2415_1779144779567.jpeg";
import imgLeopard from "@assets/IMG_2409_1779144779567.jpeg";
import imgUnionJack from "@assets/IMG_2410_1779144779567.jpeg";
import imgTealLace from "@assets/IMG_2407_1779144779567.jpeg";

// Videos — served from public/videos/ with clean filenames
const vidKaraoke = `${import.meta.env.BASE_URL}videos/karaoke.mp4`;
const vidLife1 = `${import.meta.env.BASE_URL}videos/lifestyle1.mov`;

// Flutterwave Types
declare global {
  interface Window {
    FlutterwaveCheckout: (config: any) => void;
  }
}

const TIERS = [
  { id: "monthly", name: "Monthly", price: 9.99, duration: "per month", popular: false },
  { id: "quarterly", name: "3-Month", price: 24.99, duration: "per quarter", popular: true },
  { id: "lifetime", name: "Lifetime", price: 49.99, duration: "one-time", popular: false },
];

export default function Members() {
  const { toast } = useToast();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [email, setEmail] = useState("");
  const [selectedTier, setSelectedTier] = useState(TIERS[1]);

  useEffect(() => {
    // Check subscription state
    const subState = localStorage.getItem("hb_subscribed");
    if (subState === "true") {
      setIsSubscribed(true);
    }

    // Load Flutterwave script
    const script = document.createElement("script");
    script.src = "https://checkout.flutterwave.com/v3.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = () => {
    if (!email) {
      toast({ title: "Email required", description: "Please enter your email to continue.", variant: "destructive" });
      return;
    }

    if (typeof window.FlutterwaveCheckout !== "function") {
      toast({ title: "Error", description: "Payment gateway is loading, please try again in a moment.", variant: "destructive" });
      return;
    }

    window.FlutterwaveCheckout({
      public_key: "FLWPUBK_TEST-REPLACE-WITH-YOUR-KEY",
      tx_ref: `hb_${Date.now()}`,
      amount: selectedTier.price,
      currency: "USD",
      payment_options: "card,mobilemoney,ussd",
      customer: {
        email: email,
        name: "VIP Member",
      },
      customizations: {
        title: "Hannah Brooks VIP",
        description: `${selectedTier.name} Access`,
        logo: "https://st2.depositphotos.com/4403291/7418/v/450/depositphotos_74189661-stock-illustration-online-shop-log.jpg",
      },
      callback: function (data: any) {
        if (data.status === "successful") {
          localStorage.setItem("hb_subscribed", "true");
          setIsSubscribed(true);
          toast({ title: "Payment Successful!", description: "Welcome to the VIP club." });
        }
      },
      onclose: function() {
        // Handle modal close
      }
    });
  };

  const handleLogoutMock = () => {
    localStorage.removeItem("hb_subscribed");
    setIsSubscribed(false);
  };

  // The unlocked exclusive content
  const exclusiveContent = [
    { type: "image", src: imgTealLace, title: "Friday Night Out" },
    { type: "video", src: vidKaraoke, title: "Karaoke Chaos", poster: imgHero },
    { type: "image", src: imgLeopard, title: "Leopard Print Mood" },
    { type: "image", src: imgChampagne, title: "Celebrations" },
    { type: "video", src: vidLife1, title: "Morning Routine", poster: imgSportsBra },
    { type: "image", src: imgUnionJack, title: "British Pride" },
    { type: "image", src: imgBikiniBunny, title: "Bunny Ears" },
    { type: "image", src: imgSportswear, title: "Gym Session" },
  ];

  if (isSubscribed) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 max-w-6xl animate-in fade-in duration-700">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-4 border-b border-white/10 pb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium mb-4">
                <Unlock className="w-4 h-4" /> VIP Access Unlocked
              </div>
              <h1 className="text-4xl font-serif font-bold text-white">Members Area</h1>
              <p className="text-muted-foreground mt-2">Welcome to the inner circle. All exclusive content is now available.</p>
            </div>
            <Button variant="outline" className="border-white/20 text-white/70 hover:text-white" onClick={handleLogoutMock}>
              Sign Out
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {exclusiveContent.map((item, idx) => (
              <div key={idx} className="group relative rounded-xl overflow-hidden bg-card border border-white/5 shadow-xl">
                <div className="aspect-[3/4] relative">
                  {item.type === "video" ? (
                    <video 
                      src={item.src} 
                      className="w-full h-full object-cover" 
                      controls 
                      poster={item.poster}
                    />
                  ) : (
                    <img src={item.src} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  )}
                  
                  {/* Overlay for type icon */}
                  <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 backdrop-blur flex items-center justify-center pointer-events-none">
                    {item.type === "video" ? <PlayCircle className="w-4 h-4 text-white" /> : <ImageIcon className="w-4 h-4 text-white" />}
                  </div>
                </div>
                <div className="p-4 bg-card/90 backdrop-blur absolute bottom-0 w-full border-t border-white/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="font-medium text-white">{item.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">Exclusive</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="relative min-h-[90vh] flex flex-col items-center justify-center py-20 px-4 overflow-hidden">
        {/* Blurred Background Grid */}
        <div className="absolute inset-0 z-0 grid grid-cols-2 md:grid-cols-4 gap-2 p-2 opacity-30 select-none">
          {exclusiveContent.slice(0, 8).map((item, idx) => (
            <div key={idx} className="aspect-[3/4] bg-muted rounded-xl overflow-hidden filter blur-xl scale-110">
              {item.type === "image" && <img src={item.src} className="w-full h-full object-cover" />}
            </div>
          ))}
        </div>
        
        {/* Overlay to darken */}
        <div className="absolute inset-0 z-0 bg-background/80 backdrop-blur-md" />

        <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(255,255,255,0.1)]">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-white mb-4">Gated Access</h1>
          <p className="text-xl text-muted-foreground mb-12 max-w-xl">
            Subscribe to unlock exclusive photos, behind-the-scenes videos, and direct interaction. 
          </p>

          <div className="grid md:grid-cols-3 gap-6 w-full mb-12">
            {TIERS.map((tier) => (
              <div 
                key={tier.id}
                onClick={() => setSelectedTier(tier)}
                className={`relative p-6 rounded-2xl border cursor-pointer transition-all duration-300 flex flex-col items-center
                  ${selectedTier.id === tier.id 
                    ? 'border-primary bg-primary/10 shadow-[0_0_30px_rgba(225,29,72,0.2)] scale-105 z-10' 
                    : 'border-white/10 bg-card/50 hover:bg-card hover:border-white/30'}`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <Star className="w-3 h-3" /> Most Popular
                  </div>
                )}
                <h3 className="text-lg font-medium text-white/80 mb-2">{tier.name}</h3>
                <div className="text-4xl font-bold text-white mb-1">${tier.price}</div>
                <div className="text-sm text-muted-foreground mb-6">{tier.duration}</div>
                
                <div className={`w-full h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors
                  ${selectedTier.id === tier.id ? 'bg-primary text-white' : 'bg-white/5 text-white/70'}`}>
                  Select
                </div>
              </div>
            ))}
          </div>

          <div className="w-full max-w-md bg-card/60 border border-white/10 p-8 rounded-3xl backdrop-blur-xl shadow-2xl">
            <h3 className="text-xl font-medium text-white mb-6 text-left flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" /> Secure Checkout
            </h3>
            <div className="space-y-4">
              <div className="space-y-2 text-left">
                <label className="text-sm font-medium text-white/70 ml-1">Email Address</label>
                <Input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email to unlock" 
                  className="bg-black/50 border-white/10 h-12 rounded-xl text-white focus-visible:ring-primary"
                />
              </div>
              <Button 
                onClick={handlePayment}
                className="w-full h-14 rounded-xl text-lg font-bold bg-white text-black hover:bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
              >
                Pay ${selectedTier.price} & Unlock
              </Button>
              <p className="text-xs text-muted-foreground mt-4 text-center">
                Payments processed securely by Flutterwave.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
