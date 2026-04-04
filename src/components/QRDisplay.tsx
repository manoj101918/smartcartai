"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    QRCode?: new (
      el: HTMLElement,
      options: { text: string; width: number; height: number; colorDark: string; colorLight: string }
    ) => void;
  }
}

interface QRDisplayProps {
  qrReady: boolean;
  payload: string;
}

export function QRDisplay({ qrReady, payload }: QRDisplayProps) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!qrReady || !hostRef.current || !window.QRCode) return;
    const el = hostRef.current;
    el.innerHTML = "";
    try {
      new window.QRCode(el, {
        text: payload,
        width: 200,
        height: 200,
        colorDark: "#00BFA5",
        colorLight: "#030303",
      });
    } catch {
      el.textContent = "QR unavailable";
    }
  }, [qrReady, payload]);

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="rounded-2xl border border-[#00BFA5]/40 bg-[#0D1B2A] p-4 shadow-[0_0_32px_rgba(0,191,165,0.45)] animate-pulse"
      >
        <div
          ref={hostRef}
          className="flex min-h-[200px] min-w-[200px] items-center justify-center text-xs text-[#78909C]"
        />
      </div>
      <p className="text-center text-xs text-[#78909C]">
        Show this QR at the express kiosk to complete pickup.
      </p>
    </div>
  );
}
