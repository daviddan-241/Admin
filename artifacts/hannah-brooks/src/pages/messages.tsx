import React, { useEffect, useState } from "react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useCreateMessage, useListMessages, getListMessagesQueryKey } from "@workspace/api-client-react";
import { Send, Heart, Mail, User } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export default function Messages() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const PRICE = 4.99;

  const { data: messages } = useListMessages();
  const createMessage = useCreateMessage();

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.flutterwave.com/v3.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = () => {
    if (!name || !email || !message) {
      toast({ title: "Missing fields", description: "Please fill out all fields.", variant: "destructive" });
      return;
    }
    if (message.length > 500) {
      toast({ title: "Message too long", description: "Maximum 500 characters allowed.", variant: "destructive" });
      return;
    }
    if (typeof window.FlutterwaveCheckout !== "function") {
      toast({ title: "Error", description: "Payment gateway loading, please wait.", variant: "destructive" });
      return;
    }

    const txRef = `hb_msg_${Date.now()}`;

    window.FlutterwaveCheckout({
      public_key: "FLWPUBK_TEST-REPLACE-WITH-YOUR-KEY",
      tx_ref: txRef,
      amount: PRICE,
      currency: "USD",
      payment_options: "card,mobilemoney",
      customer: {
        email: email,
        name: name,
      },
      customizations: {
        title: "Hannah Brooks",
        description: "Private Message",
      },
      callback: function (data: any) {
        if (data.status === "successful") {
          createMessage.mutate(
            {
              data: {
                fanName: name,
                fanEmail: email,
                message: message,
                amountPaid: PRICE,
                txRef: txRef,
              },
            },
            {
              onSuccess: () => {
                setIsSuccess(true);
                toast({ title: "Message Sent!", description: "Hannah will reply soon." });
                queryClient.invalidateQueries({ queryKey: getListMessagesQueryKey() });
              },
              onError: () => {
                toast({ title: "Error", description: "Failed to save message.", variant: "destructive" });
              },
            }
          );
        }
      },
      onclose: function () {},
    });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 max-w-5xl">
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-6 shadow-[0_0_30px_rgba(225,29,72,0.2)]">
            <Send className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6">Direct Messages</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Send me a private message and I will reply personally. Perfect for quick questions, greetings, or just to say hi.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div className="bg-card/50 border border-white/10 p-8 rounded-3xl backdrop-blur-md shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-700">
            {isSuccess ? (
              <div className="text-center py-12">
                <Heart className="w-16 h-16 text-primary mx-auto mb-6 animate-pulse" />
                <h3 className="text-2xl font-serif font-bold text-white mb-4">Message Sent Successfully</h3>
                <p className="text-muted-foreground mb-8">Thank you so much! I will read this and get back to you at {email} as soon as possible.</p>
                <Button onClick={() => setIsSuccess(false)} variant="outline" className="border-white/20 text-white">Send Another</Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-medium text-white mb-2">Compose Your Message</h3>
                  <p className="text-sm text-muted-foreground">Price: ${PRICE}</p>
                </div>
                
                <div className="space-y-4">
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                    <Input 
                      placeholder="Your Name" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10 bg-black/50 border-white/10 h-12 rounded-xl text-white"
                    />
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                    <Input 
                      type="email" 
                      placeholder="Your Email (for reply)" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-black/50 border-white/10 h-12 rounded-xl text-white"
                    />
                  </div>
                  <div className="relative">
                    <Textarea 
                      placeholder="Your message (max 500 characters)" 
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      maxLength={500}
                      className="bg-black/50 border-white/10 min-h-[150px] rounded-xl text-white resize-none"
                    />
                    <div className="absolute bottom-3 right-3 text-xs text-muted-foreground">
                      {message.length}/500
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={handlePayment} 
                  disabled={createMessage.isPending}
                  className="w-full h-14 rounded-xl text-lg font-bold bg-primary text-white hover:bg-primary/90 shadow-[0_0_20px_rgba(225,29,72,0.3)]"
                >
                  {createMessage.isPending ? "Processing..." : `Pay $${PRICE} to Send`}
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-100">
            <div>
              <h2 className="text-2xl font-serif font-bold text-white mb-6 border-b border-white/10 pb-4">Recent Fan Love</h2>
              {(!messages || messages.length === 0) ? (
                <div className="text-center py-12 border border-white/5 rounded-2xl bg-card/30">
                  <Heart className="w-8 h-8 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-muted-foreground">Be the first to send a message!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.slice(0, 5).map((msg) => (
                    <div key={msg.id} className="p-4 rounded-xl bg-card/40 border border-white/5">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-primary">{msg.fanName}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(msg.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-white/80 italic">
                        "{msg.message.length > 80 ? msg.message.substring(0, 80) + "..." : msg.message}"
                      </p>
                      {msg.reply && (
                        <div className="mt-3 pt-3 border-t border-white/10 flex gap-2">
                          <div className="w-1 h-full bg-secondary rounded-full"></div>
                          <p className="text-xs text-secondary-foreground/90 bg-secondary/10 px-3 py-2 rounded-lg">Hannah replied!</p>
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
    </Layout>
  );
}