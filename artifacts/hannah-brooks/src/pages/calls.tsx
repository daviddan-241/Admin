import React, { useEffect, useState } from "react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useCreateCall } from "@workspace/api-client-react";
import { Video, Calendar, Clock, User, Mail, CheckCircle2 } from "lucide-react";

const DURATIONS = [
  { mins: 5, price: 19.99, label: "Quick Hello" },
  { mins: 15, price: 39.99, label: "Catch Up" },
  { mins: 30, price: 69.99, label: "Deep Dive" },
];

export default function Calls() {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedDuration, setSelectedDuration] = useState(DURATIONS[1]);
  const [isSuccess, setIsSuccess] = useState(false);

  const createCall = useCreateCall();

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
    if (!name || !email || !date) {
      toast({ title: "Missing fields", description: "Please fill out name, email, and preferred date.", variant: "destructive" });
      return;
    }
    
    if (typeof window.FlutterwaveCheckout !== "function") {
      toast({ title: "Error", description: "Payment gateway loading, please wait.", variant: "destructive" });
      return;
    }

    const txRef = `hb_call_${Date.now()}`;

    window.FlutterwaveCheckout({
      public_key: "FLWPUBK_TEST-REPLACE-WITH-YOUR-KEY",
      tx_ref: txRef,
      amount: selectedDuration.price,
      currency: "USD",
      payment_options: "card",
      customer: {
        email: email,
        name: name,
      },
      customizations: {
        title: "Hannah Brooks",
        description: `${selectedDuration.mins} Min Video Call`,
      },
      callback: function (data: any) {
        if (data.status === "successful") {
          createCall.mutate(
            {
              data: {
                fanName: name,
                fanEmail: email,
                preferredDate: new Date(date).toISOString(),
                durationMinutes: selectedDuration.mins,
                amountPaid: selectedDuration.price,
                txRef: txRef,
                notes: notes,
              },
            },
            {
              onSuccess: () => {
                setIsSuccess(true);
                toast({ title: "Call Booked!", description: "Check your email for confirmation." });
              },
              onError: () => {
                toast({ title: "Error", description: "Failed to save booking.", variant: "destructive" });
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
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-secondary/10 text-secondary mb-6 border border-secondary/20 shadow-[0_0_40px_rgba(234,179,8,0.15)]">
            <Video className="w-10 h-10" />
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6">Video Calls</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Book a one-on-one FaceTime or video call. Let's chat, catch up, or celebrate a special occasion together.
          </p>
        </div>

        {isSuccess ? (
          <div className="max-w-2xl mx-auto bg-card/40 border border-white/10 p-12 rounded-3xl backdrop-blur-xl text-center shadow-2xl animate-in fade-in zoom-in duration-500">
            <CheckCircle2 className="w-20 h-20 text-green-400 mx-auto mb-6" />
            <h2 className="text-3xl font-serif font-bold text-white mb-4">Booking Confirmed!</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Thank you {name}! Your {selectedDuration.mins}-minute call has been booked.
            </p>
            <div className="bg-black/40 p-6 rounded-2xl text-left border border-white/5 mb-8">
              <h4 className="font-medium text-white mb-4 border-b border-white/10 pb-2">What happens next?</h4>
              <ul className="space-y-3 text-muted-foreground text-sm">
                <li className="flex gap-3"><span className="text-secondary">1.</span> I will review your preferred time ({new Date(date).toLocaleString()}).</li>
                <li className="flex gap-3"><span className="text-secondary">2.</span> I will email you at {email} to confirm the exact time and platform (FaceTime, Zoom, or WhatsApp).</li>
                <li className="flex gap-3"><span className="text-secondary">3.</span> We chat! Make sure you have a good internet connection.</li>
              </ul>
            </div>
            <Button onClick={() => setIsSuccess(false)} variant="outline" className="border-white/20 text-white">Book Another Call</Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1fr_400px] gap-8">
            <div className="bg-card/50 border border-white/10 p-8 rounded-3xl backdrop-blur-md shadow-2xl animate-in fade-in slide-in-from-left-8 duration-700">
              <h3 className="text-2xl font-serif font-medium text-white mb-8">Your Details</h3>
              
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/70 ml-1">Your Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                      <Input 
                        placeholder="John Doe" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)}
                        className="pl-10 bg-black/50 border-white/10 h-12 rounded-xl text-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/70 ml-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                      <Input 
                        type="email" 
                        placeholder="john@example.com" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 bg-black/50 border-white/10 h-12 rounded-xl text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/70 ml-1">Preferred Date & Time</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                    <Input 
                      type="datetime-local" 
                      value={date} 
                      onChange={(e) => setDate(e.target.value)}
                      className="pl-10 bg-black/50 border-white/10 h-12 rounded-xl text-white [color-scheme:dark]"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground ml-1">I will try my best to accommodate this time.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/70 ml-1">Notes (Optional)</label>
                  <Textarea 
                    placeholder="Anything specific you want to chat about?" 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="bg-black/50 border-white/10 min-h-[100px] rounded-xl text-white resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-700">
              <div className="bg-card/40 border border-white/10 p-6 rounded-3xl backdrop-blur-md">
                <h3 className="text-lg font-medium text-white mb-4">Select Duration</h3>
                <div className="space-y-3">
                  {DURATIONS.map((dur) => (
                    <div 
                      key={dur.mins}
                      onClick={() => setSelectedDuration(dur)}
                      className={`relative p-4 rounded-xl border cursor-pointer transition-all duration-300 flex items-center justify-between
                        ${selectedDuration.mins === dur.mins 
                          ? 'border-secondary bg-secondary/10 shadow-[0_0_20px_rgba(234,179,8,0.1)]' 
                          : 'border-white/10 bg-black/40 hover:bg-black/60'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${selectedDuration.mins === dur.mins ? 'bg-secondary text-secondary-foreground' : 'bg-white/5 text-muted-foreground'}`}>
                          <Clock className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-medium text-white">{dur.mins} Minutes</div>
                          <div className="text-xs text-muted-foreground">{dur.label}</div>
                        </div>
                      </div>
                      <div className="text-lg font-bold text-white">${dur.price}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-primary/20 to-secondary/20 p-[1px] rounded-3xl shadow-xl">
                <div className="bg-card/90 backdrop-blur-xl p-6 rounded-[23px]">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-muted-foreground">Total</span>
                    <span className="text-3xl font-serif font-bold text-white">${selectedDuration.price}</span>
                  </div>
                  <Button 
                    onClick={handlePayment} 
                    disabled={createCall.isPending}
                    className="w-full h-14 rounded-xl text-lg font-bold bg-white text-black hover:bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                  >
                    {createCall.isPending ? "Processing..." : "Book Call Now"}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-4 text-center">Secure payment via Flutterwave</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}