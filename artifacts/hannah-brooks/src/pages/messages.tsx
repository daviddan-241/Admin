import React, { useEffect, useState } from "react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useCreateMessage, useListMessages, getListMessagesQueryKey } from "@workspace/api-client-react";
import { Send, Heart, Mail, User, Lock, Sparkles, MessageCircle, CheckCircle2, Star } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

const FREE_LIMIT = 5;
const PAID_PRICE = 4.99;
const STORAGE_KEY = "hb_free_msg_count";

function getFreeCount(): number {
  return parseInt(localStorage.getItem(STORAGE_KEY) || "0", 10);
}
function incrementFreeCount() {
  localStorage.setItem(STORAGE_KEY, String(getFreeCount() + 1));
}

export default function Messages() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [freeCount, setFreeCount] = useState(getFreeCount);
  const freeRemaining = Math.max(0, FREE_LIMIT - freeCount);
  const isFree = freeCount < FREE_LIMIT;

  const { data: messages } = useListMessages();
  const createMessage = useCreateMessage();

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.flutterwave.com/v3.js";
    script.async = true;
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  const saveMessage = (txRef: string, amountPaid: number) => {
    createMessage.mutate(
      { data: { fanName: name, fanEmail: email, message, amountPaid, txRef } },
      {
        onSuccess: () => {
          setIsSuccess(true);
          toast({ title: "Message sent!", description: "Hannah will read this and get back to you." });
          queryClient.invalidateQueries({ queryKey: getListMessagesQueryKey() });
        },
        onError: () => toast({ title: "Error", description: "Failed to save. Please try again.", variant: "destructive" }),
      }
    );
  };

  const handleFreeSubmit = () => {
    if (!name || !email || !message) {
      toast({ title: "Missing fields", description: "Please fill out all fields.", variant: "destructive" });
      return;
    }
    const txRef = `hb_free_${Date.now()}`;
    saveMessage(txRef, 0);
    incrementFreeCount();
    setFreeCount(getFreeCount());
  };

  const handlePaidSubmit = () => {
    if (!name || !email || !message) {
      toast({ title: "Missing fields", description: "Please fill out all fields.", variant: "destructive" });
      return;
    }
    if (typeof window.FlutterwaveCheckout !== "function") {
      toast({ title: "Payment loading…", description: "Please wait a moment and try again.", variant: "destructive" });
      return;
    }
    const txRef = `hb_msg_${Date.now()}`;
    window.FlutterwaveCheckout({
      public_key: "FLWPUBK_TEST-REPLACE-WITH-YOUR-KEY",
      tx_ref: txRef,
      amount: PAID_PRICE,
      currency: "USD",
      payment_options: "card,mobilemoney",
      customer: { email, name },
      customizations: { title: "Hannah Brooks", description: "Private Message" },
      callback: (data: any) => { if (data.status === "successful") saveMessage(txRef, PAID_PRICE); },
      onclose: () => {},
    });
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Hero */}
        <div className="relative pt-16 pb-12 text-center px-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 border border-primary/20 text-primary mb-6 shadow-[0_0_40px_rgba(225,29,72,0.2)]">
            <MessageCircle className="w-10 h-10" />
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-4">Message Hannah</h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Send a private message directly — Hannah reads and replies to every single one personally.
          </p>

          {/* Free messages counter */}
          <div className="mt-8 inline-flex items-center gap-3 bg-card/60 border border-white/10 rounded-2xl px-5 py-3 backdrop-blur">
            {isFree ? (
              <>
                <Sparkles className="w-5 h-5 text-secondary" />
                <div className="text-left">
                  <div className="text-white font-semibold text-sm">
                    {freeRemaining} free message{freeRemaining !== 1 ? "s" : ""} remaining
                  </div>
                  <div className="text-muted-foreground text-xs">First {FREE_LIMIT} messages are on Hannah</div>
                </div>
                <div className="flex gap-1">
                  {Array.from({ length: FREE_LIMIT }).map((_, i) => (
                    <div key={i} className={`w-2 h-2 rounded-full ${i < freeCount ? "bg-muted-foreground/30" : "bg-secondary"}`} />
                  ))}
                </div>
              </>
            ) : (
              <>
                <Lock className="w-5 h-5 text-muted-foreground" />
                <div className="text-left">
                  <div className="text-white font-semibold text-sm">Free messages used up</div>
                  <div className="text-muted-foreground text-xs">Further messages are ${PAID_PRICE} each</div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="container mx-auto px-4 max-w-5xl pb-20">
          <div className="grid md:grid-cols-[1fr_380px] gap-8 items-start">
            {/* Form */}
            <div className="bg-card/50 border border-white/10 rounded-3xl p-8 backdrop-blur-md shadow-2xl">
              {isSuccess ? (
                <div className="text-center py-12">
                  <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-6" />
                  <h3 className="text-2xl font-serif font-bold text-white mb-3">Message Sent!</h3>
                  <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
                    Hannah will read your message and reply directly to <span className="text-white font-medium">{email}</span> soon.
                  </p>
                  <Button onClick={() => { setIsSuccess(false); setName(""); setEmail(""); setMessage(""); }}
                    variant="outline" className="border-white/20 text-white rounded-xl">
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-semibold text-white">Your Message</h3>
                    {isFree ? (
                      <span className="bg-secondary/20 text-secondary border border-secondary/30 text-xs px-3 py-1 rounded-full font-medium">
                        FREE ({freeRemaining} left)
                      </span>
                    ) : (
                      <span className="bg-primary/15 text-primary border border-primary/25 text-xs px-3 py-1 rounded-full font-medium">
                        ${PAID_PRICE}
                      </span>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="relative">
                      <User className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-10 bg-black/50 border-white/10 h-12 rounded-xl text-white placeholder:text-muted-foreground/60"
                      />
                    </div>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="Your email (Hannah replies here)"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 bg-black/50 border-white/10 h-12 rounded-xl text-white placeholder:text-muted-foreground/60"
                      />
                    </div>
                    <div className="relative">
                      <Textarea
                        placeholder="Write your message to Hannah… She loves hearing from fans!"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        maxLength={500}
                        className="bg-black/50 border-white/10 min-h-[140px] rounded-xl text-white resize-none placeholder:text-muted-foreground/60"
                      />
                      <div className="absolute bottom-3 right-3 text-xs text-muted-foreground/60">{message.length}/500</div>
                    </div>
                  </div>

                  <Button
                    onClick={isFree ? handleFreeSubmit : handlePaidSubmit}
                    disabled={createMessage.isPending}
                    className={`w-full h-14 rounded-xl text-base font-bold transition-all duration-200
                      ${isFree
                        ? "bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-[0_0_20px_rgba(234,179,8,0.25)]"
                        : "bg-primary text-white hover:bg-primary/90 shadow-[0_0_20px_rgba(225,29,72,0.3)]"}`}
                  >
                    {createMessage.isPending ? (
                      <span className="flex items-center gap-2"><span className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />Sending…</span>
                    ) : isFree ? (
                      <span className="flex items-center gap-2"><Send className="w-4 h-4" />Send Free Message</span>
                    ) : (
                      <span className="flex items-center gap-2"><Lock className="w-4 h-4" />Pay ${PAID_PRICE} & Send</span>
                    )}
                  </Button>

                  {!isFree && (
                    <p className="text-xs text-center text-muted-foreground">
                      Secure payment via Flutterwave · No subscription required
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* How it works */}
              <div className="bg-card/30 border border-white/5 rounded-2xl p-5">
                <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <Star className="w-4 h-4 text-secondary" /> How it works
                </h4>
                <div className="space-y-3">
                  {[
                    { n: "1", text: "Write your message to Hannah" },
                    { n: "2", text: `First ${FREE_LIMIT} messages are completely free` },
                    { n: "3", text: "Hannah personally reads every message" },
                    { n: "4", text: "Get a genuine reply straight to your email" },
                  ].map((step) => (
                    <div key={step.n} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary text-xs font-bold shrink-0 mt-0.5">
                        {step.n}
                      </div>
                      <p className="text-sm text-muted-foreground">{step.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Fan Messages */}
              <div>
                <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-primary" /> Recent Fan Love
                </h4>
                {(!messages || messages.length === 0) ? (
                  <div className="text-center py-10 border border-white/5 rounded-2xl bg-card/20">
                    <Heart className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm">Be the first to send a message!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.filter(m => m.status !== "free" || m.reply).slice(0, 5).map((msg) => (
                      <div key={msg.id} className="p-4 rounded-xl bg-card/40 border border-white/5 hover:border-white/10 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-primary text-sm">{msg.fanName}</span>
                          <span className="text-xs text-muted-foreground/60">
                            {new Date(msg.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                          </span>
                        </div>
                        <p className="text-sm text-white/70 italic leading-relaxed">
                          "{msg.message.length > 90 ? msg.message.substring(0, 90) + "…" : msg.message}"
                        </p>
                        {msg.reply && (
                          <div className="mt-3 pt-3 border-t border-white/10">
                            <div className="flex items-center gap-1 text-xs text-secondary mb-1">
                              <Star className="w-3 h-3" /> Hannah replied
                            </div>
                            <p className="text-xs text-white/60 italic">
                              "{msg.reply.length > 80 ? msg.reply.substring(0, 80) + "…" : msg.reply}"
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
