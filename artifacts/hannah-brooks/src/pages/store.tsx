import React, { useEffect, useState } from "react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useCreateRequest, useCreateTip } from "@workspace/api-client-react";
import { ShoppingBag, Video, Send, Gift, Sparkles, Wand2 } from "lucide-react";
import { Link } from "wouter";

export default function Store() {
  const { toast } = useToast();
  const createRequest = useCreateRequest();
  const createTip = useCreateTip();

  const [requestMode, setRequestMode] = useState(false);
  const [tipMode, setTipMode] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");

  const REQUEST_PRICE = 14.99;

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.flutterwave.com/v3.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleRequestPayment = () => {
    if (!name || !email || !description) {
      toast({ title: "Missing fields", description: "Please fill out all fields.", variant: "destructive" });
      return;
    }
    
    if (typeof window.FlutterwaveCheckout !== "function") {
      toast({ title: "Error", description: "Payment gateway loading, please wait.", variant: "destructive" });
      return;
    }

    const txRef = `hb_req_${Date.now()}`;

    window.FlutterwaveCheckout({
      public_key: "FLWPUBK_TEST-REPLACE-WITH-YOUR-KEY",
      tx_ref: txRef,
      amount: REQUEST_PRICE,
      currency: "USD",
      payment_options: "card",
      customer: { email: email, name: name },
      customizations: { title: "Hannah Brooks", description: "Custom Content Request" },
      callback: function (data: any) {
        if (data.status === "successful") {
          createRequest.mutate({
            data: {
              fanName: name,
              fanEmail: email,
              requestType: "custom",
              description: description,
              amountPaid: REQUEST_PRICE,
              txRef: txRef,
            }
          }, {
            onSuccess: () => {
              toast({ title: "Request Submitted!", description: "I will review your request shortly." });
              setRequestMode(false);
              setDescription("");
            }
          });
        }
      },
      onclose: function () {},
    });
  };

  const handleTipPayment = () => {
    const tipAmount = parseFloat(amount);
    if (!name || !email || isNaN(tipAmount) || tipAmount < 1) {
      toast({ title: "Invalid fields", description: "Please provide valid details and minimum $1 tip.", variant: "destructive" });
      return;
    }
    
    if (typeof window.FlutterwaveCheckout !== "function") return;

    const txRef = `hb_tip_${Date.now()}`;

    window.FlutterwaveCheckout({
      public_key: "FLWPUBK_TEST-REPLACE-WITH-YOUR-KEY",
      tx_ref: txRef,
      amount: tipAmount,
      currency: "USD",
      payment_options: "card",
      customer: { email: email, name: name },
      customizations: { title: "Hannah Brooks", description: "Tip / Gift" },
      callback: function (data: any) {
        if (data.status === "successful") {
          createTip.mutate({
            data: {
              fanName: name,
              fanEmail: email,
              amount: tipAmount,
              message: description || null,
              txRef: txRef,
            }
          }, {
            onSuccess: () => {
              toast({ title: "Thank You!", description: "Your tip is incredibly appreciated." });
              setTipMode(false);
              setAmount("");
              setDescription("");
            }
          });
        }
      },
      onclose: function () {},
    });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/5 border border-white/10 text-white mb-6 shadow-[0_0_30px_rgba(255,255,255,0.1)]">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6">The Boutique</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Exclusive services, custom requests, and ways to connect.
          </p>
        </div>

        {requestMode ? (
          <div className="max-w-2xl mx-auto bg-card border border-white/10 p-8 rounded-3xl shadow-2xl animate-in zoom-in-95 duration-300">
            <h2 className="text-2xl font-serif font-bold mb-6 flex items-center gap-2">
              <Wand2 className="text-primary" /> Custom Content Request
            </h2>
            <div className="space-y-4 mb-6">
              <Input placeholder="Your Name" value={name} onChange={e => setName(e.target.value)} className="bg-black/50 border-white/10" />
              <Input type="email" placeholder="Your Email" value={email} onChange={e => setEmail(e.target.value)} className="bg-black/50 border-white/10" />
              <Textarea placeholder="Describe what you want me to create..." value={description} onChange={e => setDescription(e.target.value)} className="bg-black/50 border-white/10 min-h-[120px]" />
            </div>
            <div className="flex gap-4">
              <Button onClick={() => setRequestMode(false)} variant="outline" className="flex-1 border-white/20 text-white">Cancel</Button>
              <Button onClick={handleRequestPayment} className="flex-1 bg-primary text-white hover:bg-primary/90">Pay ${REQUEST_PRICE}</Button>
            </div>
          </div>
        ) : tipMode ? (
          <div className="max-w-2xl mx-auto bg-card border border-white/10 p-8 rounded-3xl shadow-2xl animate-in zoom-in-95 duration-300">
            <h2 className="text-2xl font-serif font-bold mb-6 flex items-center gap-2">
              <Gift className="text-secondary" /> Send a Tip
            </h2>
            <div className="space-y-4 mb-6">
              <Input placeholder="Your Name" value={name} onChange={e => setName(e.target.value)} className="bg-black/50 border-white/10" />
              <Input type="email" placeholder="Your Email" value={email} onChange={e => setEmail(e.target.value)} className="bg-black/50 border-white/10" />
              <Input type="number" placeholder="Amount ($USD)" value={amount} onChange={e => setAmount(e.target.value)} className="bg-black/50 border-white/10" min="1" step="1" />
              <Textarea placeholder="Optional message..." value={description} onChange={e => setDescription(e.target.value)} className="bg-black/50 border-white/10" />
            </div>
            <div className="flex gap-4">
              <Button onClick={() => setTipMode(false)} variant="outline" className="flex-1 border-white/20 text-white">Cancel</Button>
              <Button onClick={handleTipPayment} className="flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/90">Send Tip</Button>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Messages */}
            <Link href="/messages" className="group block bg-card/40 border border-white/5 hover:border-primary/50 p-8 rounded-3xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(225,29,72,0.15)] hover:-translate-y-1">
              <Send className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-2xl font-serif font-bold text-white mb-2">Direct Message</h3>
              <p className="text-muted-foreground mb-4">Send a private message and get a personal reply.</p>
              <div className="text-lg font-bold text-white">$4.99</div>
            </Link>

            {/* Calls */}
            <Link href="/calls" className="group block bg-card/40 border border-white/5 hover:border-secondary/50 p-8 rounded-3xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(234,179,8,0.15)] hover:-translate-y-1">
              <Video className="w-8 h-8 text-secondary mb-4" />
              <h3 className="text-2xl font-serif font-bold text-white mb-2">Video Calls</h3>
              <p className="text-muted-foreground mb-4">Book a 1-on-1 FaceTime or Zoom call.</p>
              <div className="text-lg font-bold text-white">From $19.99</div>
            </Link>

            {/* Custom Request */}
            <div onClick={() => setRequestMode(true)} className="group cursor-pointer bg-card/40 border border-white/5 hover:border-purple-500/50 p-8 rounded-3xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] hover:-translate-y-1">
              <Wand2 className="w-8 h-8 text-purple-400 mb-4" />
              <h3 className="text-2xl font-serif font-bold text-white mb-2">Custom Content</h3>
              <p className="text-muted-foreground mb-4">Request specific photos, shoutouts, or short videos.</p>
              <div className="text-lg font-bold text-white">${REQUEST_PRICE}</div>
            </div>

            {/* Tip */}
            <div onClick={() => setTipMode(true)} className="group cursor-pointer bg-card/40 border border-white/5 hover:border-emerald-500/50 p-8 rounded-3xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] hover:-translate-y-1">
              <Gift className="w-8 h-8 text-emerald-400 mb-4" />
              <h3 className="text-2xl font-serif font-bold text-white mb-2">Send a Tip</h3>
              <p className="text-muted-foreground mb-4">Show some love and support my content creation.</p>
              <div className="text-lg font-bold text-white">Any Amount</div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}