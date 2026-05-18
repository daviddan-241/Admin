import React, { useEffect, useRef, useState, useCallback } from "react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Send, Lock, Sparkles, Star, ArrowLeft, CheckCheck, ChevronDown } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const API = `${BASE}/api`;
const MSG_PRICE = 4.99;
const FREE_LIMIT = 5;
const POLL_INTERVAL = 3000;
const TOKEN_KEY = "hb_chat_token";

type ChatMessage = {
  id: number;
  sessionId: number;
  senderType: "fan" | "hannah";
  message: string;
  amountPaid: number;
  isRead: boolean;
  createdAt: string;
};
type ChatSession = {
  id: number;
  fanName: string;
  fanEmail: string;
  fanToken: string;
  freeUsed: number;
};

function Avatar({ size = "sm" }: { size?: "sm" | "md" }) {
  const s = size === "sm" ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm";
  return (
    <div className={`${s} rounded-full bg-gradient-to-br from-primary to-rose-400 flex items-center justify-center font-serif font-bold text-white shrink-0 shadow-lg`}>
      HB
    </div>
  );
}

function MessageBubble({ msg, fanName }: { msg: ChatMessage; fanName: string }) {
  const isHannah = msg.senderType === "hannah";
  const time = new Date(msg.createdAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className={`flex items-end gap-2 mb-3 ${isHannah ? "justify-start" : "justify-end"}`}>
      {isHannah && <Avatar size="sm" />}
      <div className={`max-w-[75%] ${isHannah ? "items-start" : "items-end"} flex flex-col gap-1`}>
        {isHannah && (
          <span className="text-[11px] text-primary font-semibold ml-1 flex items-center gap-1">
            <Star className="w-3 h-3" /> Hannah Brooks
          </span>
        )}
        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm
          ${isHannah
            ? "bg-card/80 border border-primary/20 text-white rounded-tl-sm"
            : "bg-primary text-white rounded-br-sm shadow-[0_2px_15px_rgba(225,29,72,0.3)]"
          }`}
        >
          {msg.message}
        </div>
        <div className={`flex items-center gap-1 text-[10px] text-muted-foreground/60 ${isHannah ? "ml-1" : "mr-1 flex-row-reverse"}`}>
          <span>{time}</span>
          {!isHannah && <CheckCheck className="w-3 h-3 text-muted-foreground/40" />}
        </div>
      </div>
      {!isHannah && (
        <div className="w-8 h-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-[10px] font-semibold text-white/60 shrink-0">
          {fanName.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
}

export default function Messages() {
  const { toast } = useToast();
  const [step, setStep] = useState<"start" | "chat">(() =>
    localStorage.getItem(TOKEN_KEY) ? "chat" : "start"
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [starting, setStarting] = useState(false);
  const [session, setSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [lastAt, setLastAt] = useState<string | null>(null);
  const [atBottom, setAtBottom] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const token = useRef<string | null>(localStorage.getItem(TOKEN_KEY));

  const freeUsed = session?.freeUsed ?? 0;
  const freeLeft = Math.max(0, FREE_LIMIT - freeUsed);
  const isFree = freeUsed < FREE_LIMIT;

  // Load script
  useEffect(() => {
    const s = document.createElement("script");
    s.src = "https://checkout.flutterwave.com/v3.js";
    s.async = true;
    document.body.appendChild(s);
    return () => { document.body.removeChild(s); };
  }, []);

  const scrollToBottom = useCallback((smooth = true) => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "auto" });
  }, []);

  const loadSession = useCallback(async (tok: string) => {
    try {
      const r = await fetch(`${API}/chat/${tok}`);
      if (!r.ok) { localStorage.removeItem(TOKEN_KEY); token.current = null; setStep("start"); return; }
      const data = await r.json();
      setSession(data.session);
      setMessages(data.messages);
      if (data.messages.length > 0) setLastAt(data.messages[data.messages.length - 1].createdAt);
      setTimeout(() => scrollToBottom(false), 100);
    } catch { setStep("start"); }
  }, [scrollToBottom]);

  useEffect(() => {
    if (step === "chat" && token.current) loadSession(token.current);
  }, [step, loadSession]);

  // Polling
  useEffect(() => {
    if (step !== "chat" || !token.current) return;
    pollRef.current = setInterval(async () => {
      if (!token.current) return;
      try {
        const url = `${API}/chat/${token.current}/poll${lastAt ? `?since=${encodeURIComponent(lastAt)}` : ""}`;
        const r = await fetch(url);
        if (!r.ok) return;
        const data = await r.json();
        if (data.messages?.length > 0) {
          setMessages((prev) => {
            const existingIds = new Set(prev.map((m) => m.id));
            const newMsgs = data.messages.filter((m: ChatMessage) => !existingIds.has(m.id));
            if (newMsgs.length === 0) return prev;
            setLastAt(newMsgs[newMsgs.length - 1].createdAt);
            const hasHannahReply = newMsgs.some((m: ChatMessage) => m.senderType === "hannah");
            if (hasHannahReply) {
              toast({ title: "Hannah replied!", description: "You have a new message from Hannah." });
            }
            return [...prev, ...newMsgs];
          });
          setSession((s) => s ? { ...s, freeUsed: data.freeUsed } : s);
          if (atBottom) setTimeout(() => scrollToBottom(), 50);
        }
      } catch {}
    }, POLL_INTERVAL);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [step, lastAt, atBottom, scrollToBottom, toast]);

  useEffect(() => {
    if (messages.length > 0 && atBottom) scrollToBottom(false);
  }, [messages.length, atBottom, scrollToBottom]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 60);
  };

  const startChat = async () => {
    if (!name.trim() || !email.trim()) {
      toast({ title: "Please enter your name and email", variant: "destructive" });
      return;
    }
    setStarting(true);
    try {
      const r = await fetch(`${API}/chat/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), name: name.trim() }),
      });
      if (!r.ok) throw new Error();
      const data = await r.json();
      localStorage.setItem(TOKEN_KEY, data.session.fanToken);
      token.current = data.session.fanToken;
      setSession(data.session);
      setMessages(data.messages);
      if (data.messages.length > 0) setLastAt(data.messages[data.messages.length - 1].createdAt);
      setStep("chat");
      setTimeout(() => scrollToBottom(false), 150);
    } catch {
      toast({ title: "Couldn't start chat. Please try again.", variant: "destructive" });
    }
    setStarting(false);
  };

  const doSend = async (overrides?: { txRef: string; amountPaid: number }) => {
    if (!input.trim() || !token.current) return;
    setSending(true);
    try {
      const body: Record<string, unknown> = { message: input.trim() };
      if (overrides) { body.txRef = overrides.txRef; body.amountPaid = overrides.amountPaid; }
      const r = await fetch(`${API}/chat/${token.current}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (r.status === 402) {
        toast({ title: "Free messages used up", description: "Please pay to send more messages.", variant: "destructive" });
        return;
      }
      if (!r.ok) throw new Error();
      const msg = await r.json();
      setMessages((prev) => [...prev, msg]);
      setLastAt(msg.createdAt);
      setSession((s) => s ? { ...s, freeUsed: s.freeUsed + (overrides ? 0 : 1) } : s);
      setInput("");
      setTimeout(() => scrollToBottom(), 80);
    } catch {
      toast({ title: "Failed to send. Please try again.", variant: "destructive" });
    }
    setSending(false);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    if (isFree) { doSend(); return; }
    // Paid message
    if (typeof window.FlutterwaveCheckout !== "function") {
      toast({ title: "Payment loading…", description: "Please wait and try again.", variant: "destructive" });
      return;
    }
    const txRef = `hb_chat_${Date.now()}`;
    window.FlutterwaveCheckout({
      public_key: "FLWPUBK_TEST-REPLACE-WITH-YOUR-KEY",
      tx_ref: txRef,
      amount: MSG_PRICE,
      currency: "USD",
      payment_options: "card,mobilemoney",
      customer: { email: session?.fanEmail ?? "", name: session?.fanName ?? "" },
      customizations: { title: "Hannah Brooks", description: "Private Message" },
      callback: (data: any) => {
        if (data.status === "successful") doSend({ txRef, amountPaid: MSG_PRICE });
      },
      onclose: () => {},
    });
  };

  const reset = () => {
    localStorage.removeItem(TOKEN_KEY);
    token.current = null;
    setStep("start");
    setSession(null);
    setMessages([]);
    setName("");
    setEmail("");
  };

  // ─── START SCREEN ─────────────────────────────────────────────────────────
  if (step === "start") {
    return (
      <Layout>
        <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-16">
          {/* Profile */}
          <div className="flex flex-col items-center mb-10">
            <div className="relative mb-4">
              <Avatar size="md" />
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-green-400 border-2 border-background" />
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-1">Hannah Brooks</h1>
            <p className="text-muted-foreground text-sm">British Creator · Online Now</p>
            <div className="flex items-center gap-2 mt-3 bg-card/40 border border-white/10 rounded-full px-4 py-1.5">
              <Sparkles className="w-4 h-4 text-secondary" />
              <span className="text-sm text-white font-medium">First {FREE_LIMIT} messages are free</span>
            </div>
          </div>

          {/* Start form */}
          <div className="w-full max-w-sm">
            <div className="bg-card/50 border border-white/10 rounded-3xl p-7 backdrop-blur-md shadow-2xl space-y-4">
              <div>
                <h2 className="text-white font-semibold text-lg mb-1">Start a conversation</h2>
                <p className="text-muted-foreground text-sm">Hannah reads and replies personally — just enter your details to begin.</p>
              </div>
              <Input
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-black/50 border-white/10 text-white h-12 rounded-xl placeholder:text-muted-foreground/60"
              />
              <Input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && startChat()}
                className="bg-black/50 border-white/10 text-white h-12 rounded-xl placeholder:text-muted-foreground/60"
              />
              <Button
                onClick={startChat}
                disabled={starting}
                className="w-full h-12 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 shadow-[0_4px_20px_rgba(225,29,72,0.4)]"
              >
                {starting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Starting…
                  </span>
                ) : "Start Chatting →"}
              </Button>
              <p className="text-xs text-center text-muted-foreground/60">
                Already chatted? Your conversation will resume automatically.
              </p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // ─── CHAT SCREEN ───────────────────────────────────────────────────────────
  return (
    <Layout>
      <div className="flex flex-col" style={{ height: "calc(100dvh - 64px)" }}>
        {/* Chat header */}
        <div className="flex-shrink-0 flex items-center gap-3 px-4 py-3 border-b border-white/5 bg-card/30 backdrop-blur-xl">
          <button onClick={reset} className="text-muted-foreground hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <Avatar size="sm" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white text-sm">Hannah Brooks</span>
              <span className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-[10px] text-green-400 font-medium">Online</span>
            </div>
            <p className="text-[11px] text-muted-foreground truncate">Replies personally to every message</p>
          </div>
          {/* Free counter */}
          {isFree ? (
            <div className="flex items-center gap-1.5 bg-secondary/10 border border-secondary/20 rounded-full px-3 py-1 shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-secondary" />
              <span className="text-xs font-semibold text-secondary">{freeLeft} free</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-card/60 border border-white/10 rounded-full px-3 py-1 shrink-0">
              <Lock className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">${MSG_PRICE}/msg</span>
            </div>
          )}
        </div>

        {/* Messages area */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-4 py-4 space-y-1"
          style={{ background: "linear-gradient(180deg, #0a0a0a 0%, #0d0d0d 100%)" }}
        >
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center pb-12">
              <Avatar size="md" />
              <h3 className="text-white font-semibold text-lg mt-4 mb-2">Chat with Hannah</h3>
              <p className="text-muted-foreground text-sm max-w-xs">
                Say hi! Hannah reads every message personally and replies as soon as she can.
              </p>
              <div className="mt-5 flex gap-2 flex-wrap justify-center">
                {["👋 Hey Hannah!", "💗 Big fan!", "🔥 Love your content"].map((q) => (
                  <button key={q} onClick={() => setInput(q)}
                    className="text-xs bg-card/40 border border-white/10 rounded-full px-3 py-1.5 text-white/70 hover:text-white hover:border-white/20 transition-all">
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((msg) => (
            <MessageBubble key={msg.id} msg={msg} fanName={session?.fanName ?? "You"} />
          ))}
          {/* Scroll to bottom button */}
          {!atBottom && (
            <button
              onClick={() => scrollToBottom()}
              className="fixed bottom-24 right-6 w-9 h-9 bg-primary rounded-full flex items-center justify-center shadow-lg animate-bounce"
            >
              <ChevronDown className="w-5 h-5 text-white" />
            </button>
          )}
        </div>

        {/* Input bar */}
        <div className="flex-shrink-0 border-t border-white/5 bg-card/30 backdrop-blur-xl px-4 py-3">
          {!isFree && (
            <div className="flex items-center gap-1.5 mb-2 text-xs text-muted-foreground">
              <Lock className="w-3 h-3" />
              <span>Free messages used · Next message costs ${MSG_PRICE} via Flutterwave</span>
            </div>
          )}
          <div className="flex items-end gap-2">
            <div className="flex-1 bg-black/50 border border-white/10 rounded-2xl overflow-hidden focus-within:border-primary/40 transition-colors">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
                }}
                placeholder="Message Hannah…"
                rows={1}
                className="w-full bg-transparent text-white text-sm px-4 py-3 resize-none placeholder:text-muted-foreground/50 outline-none max-h-[120px]"
                style={{ fieldSizing: "content" } as React.CSSProperties}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={sending || !input.trim()}
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all shrink-0
                ${input.trim() && !sending
                  ? "bg-primary text-white shadow-[0_4px_15px_rgba(225,29,72,0.4)] hover:bg-primary/90 active:scale-95"
                  : "bg-white/5 text-muted-foreground cursor-not-allowed"}`}
            >
              {sending
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
