import { useEffect, useState } from "react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export type PlatformConfig = {
  flutterwavePublicKey: string;
  currency: string;
  msgPrice: number;
  msgFreeLimit: number;
  subMonthly: number;
  subQuarterly: number;
  subLifetime: number;
  requestPrice: number;
  tipMin: number;
  callWa5: number;
  callZoom15: number;
  callZoom30: number;
  callPrivate60: number;
  whatsappNumber: string;
  instagramUrl: string;
  twitterUrl: string;
  tiktokUrl: string;
  onlyfansUrl: string;
  creatorBio: string;
  creatorTagline: string;
};

const DEFAULTS: PlatformConfig = {
  flutterwavePublicKey: "",
  currency: "USD",
  msgPrice: 9.99,
  msgFreeLimit: 3,
  subMonthly: 24.99,
  subQuarterly: 59.99,
  subLifetime: 149.99,
  requestPrice: 49.99,
  tipMin: 5,
  callWa5: 29.99,
  callZoom15: 79.99,
  callZoom30: 149.99,
  callPrivate60: 299.99,
  whatsappNumber: "447700000000",
  instagramUrl: "https://instagram.com/hannahbrooks",
  twitterUrl: "https://x.com/hannahbrooksxx",
  tiktokUrl: "https://tiktok.com/@hannahbrooksxxx",
  onlyfansUrl: "https://onlyfans.com/hannahbrooks",
  creatorBio: "British creator, adult entertainer, fitness lover, and dog mum. This is my exclusive digital home — velvet ropes, zero boundaries.",
  creatorTagline: "British Creator · Entertainer · Fitness Lover",
};

let cachedConfig: PlatformConfig | null = null;

export function usePlatformConfig() {
  const [config, setConfig] = useState<PlatformConfig>(cachedConfig ?? DEFAULTS);
  const [loading, setLoading] = useState(!cachedConfig);

  useEffect(() => {
    if (cachedConfig) return;
    fetch(`${BASE}/api/config/public`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data) {
          cachedConfig = { ...DEFAULTS, ...data };
          setConfig(cachedConfig!);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return { config, loading };
}
