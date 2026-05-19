import React, { useEffect, useRef, useState } from "react";
import { Layout } from "@/components/layout";
import { ExternalLink, RefreshCw, Cpu, Zap } from "lucide-react";

function getStudioUrl(): string {
  if (typeof window === "undefined") return "";
  const { hostname, protocol } = window.location;
  if (hostname.includes(".replit.dev")) {
    return `${protocol}//${hostname.replace(/-\d+\.replit\.dev/, "-3000.replit.dev")}`;
  }
  if (hostname.includes(".repl.co")) {
    return `${protocol}//${hostname.replace(/-\d+\.repl\.co/, "-3000.repl.co")}`;
  }
  return `${protocol}//${hostname}:3000`;
}

export default function Studio() {
  const [url, setUrl] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [key, setKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    setUrl(getStudioUrl());
  }, []);

  const reload = () => {
    setLoaded(false);
    setError(false);
    setKey(k => k + 1);
  };

  return (
    <Layout>
      <div className="flex flex-col" style={{ height: "calc(100dvh - 64px)", background: "#060606" }}>
        {/* Studio toolbar */}
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 border-b"
          style={{ borderColor: "rgba(201,168,76,0.12)", background: "rgba(10,8,0,0.95)" }}>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#c9a84c" }} />
              <span className="text-sm font-semibold text-white">AI Persona Studio</span>
            </div>
            <span className="hidden sm:flex items-center gap-1 text-xs text-white/30 border border-white/10 rounded-full px-2 py-0.5">
              <Cpu className="w-3 h-3" />
              Port 3000
            </span>
            <span className="hidden sm:flex items-center gap-1 text-xs rounded-full px-2 py-0.5"
              style={{ color: "#c9a84c", background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.2)" }}>
              <Zap className="w-3 h-3" />
              Live
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={reload}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-all">
              <RefreshCw className={`w-4 h-4 ${!loaded && !error ? "animate-spin" : ""}`} />
            </button>
            {url && (
              <a href={url} target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium text-white/50 hover:text-white hover:bg-white/5 transition-all border border-white/10">
                <ExternalLink className="w-3.5 h-3.5" />
                Open in new tab
              </a>
            )}
          </div>
        </div>

        {/* Loading / Error state */}
        {!loaded && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none"
            style={{ background: "rgba(6,6,6,0.95)" }}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 animate-pulse"
              style={{ background: "linear-gradient(135deg,#c9a84c,#f0d080)" }}>
              <Cpu className="w-6 h-6 text-black" />
            </div>
            <p className="text-white font-semibold text-base">Loading AI Persona Studio…</p>
            <p className="text-white/30 text-sm mt-1">Connecting to port 3000</p>
          </div>
        )}

        {error && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
              style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.2)" }}>
              <Cpu className="w-8 h-8" style={{ color: "#c9a84c" }} />
            </div>
            <h3 className="text-white font-semibold text-xl mb-2">AI Persona Studio</h3>
            <p className="text-white/40 text-sm mb-1 max-w-sm">
              Start the <strong className="text-white/60">AI Persona Studio</strong> workflow in Replit to use this feature.
            </p>
            <p className="text-white/30 text-xs mb-6">Make sure port 3000 is running</p>
            <div className="flex gap-3">
              <button onClick={reload}
                className="flex items-center gap-2 h-10 px-5 rounded-xl text-sm font-medium text-black transition-all hover:brightness-110"
                style={{ background: "linear-gradient(135deg,#c9a84c,#f0d080)" }}>
                <RefreshCw className="w-4 h-4" />
                Try again
              </button>
              {url && (
                <a href={url} target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 h-10 px-5 rounded-xl text-sm font-medium text-white/50 border border-white/10 hover:text-white hover:border-white/20 transition-all">
                  <ExternalLink className="w-4 h-4" />
                  Open direct
                </a>
              )}
            </div>
          </div>
        )}

        {/* iframe */}
        {url && (
          <iframe
            key={key}
            ref={iframeRef}
            src={url}
            title="AI Persona Studio"
            className="flex-1 w-full border-0"
            style={{ display: error ? "none" : "block" }}
            allow="camera; microphone; autoplay; clipboard-write"
            onLoad={() => setLoaded(true)}
            onError={() => { setError(true); setLoaded(false); }}
          />
        )}
      </div>
    </Layout>
  );
}
