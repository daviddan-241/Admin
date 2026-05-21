import { useEffect, useCallback } from "react";
import { usePlatformConfig } from "./use-platform-config";

declare global {
  interface Window {
    FlutterwaveCheckout?: (config: Record<string, unknown>) => void;
  }
}

let scriptLoaded = false;

export function useFlutterwave() {
  const { config } = usePlatformConfig();

  useEffect(() => {
    if (scriptLoaded) return;
    const existing = document.querySelector('script[src*="flutterwave"]');
    if (existing) { scriptLoaded = true; return; }
    const script = document.createElement("script");
    script.src = "https://checkout.flutterwave.com/v3.js";
    script.async = true;
    script.onload = () => { scriptLoaded = true; };
    document.head.appendChild(script);
  }, []);

  const pay = useCallback(({
    amount,
    name,
    email,
    phone = "",
    description,
    txRef,
    onSuccess,
    onClose,
  }: {
    amount: number;
    name: string;
    email: string;
    phone?: string;
    description: string;
    txRef: string;
    onSuccess: (data: Record<string, unknown>) => void;
    onClose?: () => void;
  }) => {
    if (!window.FlutterwaveCheckout) {
      alert("Payment gateway is loading — please try again in a moment.");
      return;
    }
    const pubKey = config.flutterwavePublicKey;
    if (!pubKey) {
      alert("Payments are being set up. Please contact Hannah directly to complete this booking.");
      return;
    }
    window.FlutterwaveCheckout({
      public_key: pubKey,
      tx_ref: txRef,
      amount,
      currency: config.currency || "USD",
      payment_options: "card,ussd,banktransfer",
      customer: { email, name, phonenumber: phone },
      customizations: {
        title: "Hannah Brooks",
        description,
        logo: `${window.location.origin}/logo-hb.png`,
      },
      callback: onSuccess,
      onclose: onClose ?? (() => {}),
    });
  }, [config]);

  return { pay, hasKey: !!config.flutterwavePublicKey };
}
