"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    Quagga?: {
      init: (
        config: Record<string, unknown>,
        cb: (err?: unknown) => void
      ) => void;
      start: () => void;
      stop: () => void;
      onDetected: (cb: (data: { codeResult: { code: string } }) => void) => void;
      offDetected: (cb: (data: { codeResult: { code: string } }) => void) => void;
    };
  }
}

interface ScannerViewProps {
  quaggaReady: boolean;
  onBarcode: (code: string) => void;
  active: boolean;
  className?: string;
}

export function ScannerView({
  quaggaReady,
  onBarcode,
  active,
  className,
}: ScannerViewProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const handlerRef = useRef<
    ((d: { codeResult: { code: string } }) => void) | undefined
  >(undefined);
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (!active || !quaggaReady || !hostRef.current) return;
    const host = hostRef.current;
    const Quagga = window.Quagga;
    if (!Quagga) {
      setError("Scanner library not loaded");
      return;
    }

    const onDetected = (data: { codeResult: { code: string } }) => {
      const code = data?.codeResult?.code;
      if (code) {
        setFlash(true);
        setTimeout(() => setFlash(false), 150);
        onBarcode(code);
      }
    };
    handlerRef.current = onDetected;

    Quagga.init(
      {
        inputStream: {
          name: "Live",
          type: "LiveStream",
          target: host,
          constraints: {
            width: { min: 480, ideal: 1280, max: 1920 },
            height: { min: 360, ideal: 720, max: 1080 },
            facingMode: "environment",
            focusMode: "continuous",
          },
        },
        locator: {
          patchSize: "medium",
          halfSample: true,
        },
        numOfWorkers: 2,
        frequency: 8,
        decoder: {
          readers: [
            "code_128_reader",
            "ean_reader",
            "ean_8_reader",
            "upc_reader",
            "upc_e_reader",
          ],
        },
        locate: true,
      },
      (err?: unknown) => {
        if (err) {
          setError("Camera unavailable — use manual entry or demo chips.");
          return;
        }
        try {
          Quagga.onDetected(onDetected);
          Quagga.start();
        } catch {
          setError("Could not start camera.");
        }
      }
    );

    return () => {
      try {
        if (handlerRef.current) {
          Quagga.offDetected(handlerRef.current);
        }
        Quagga.stop();
      } catch {
        /* ignore */
      }
    };
  }, [active, quaggaReady, onBarcode]);

  return (
    <div
      className={cn(
        "relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-black/60 shadow-[0_0_24px_rgba(0,191,165,0.15)]",
        className
      )}
    >
      <div ref={hostRef} className="absolute inset-0 [&_video]:h-full [&_video]:w-full [&_video]:object-cover [&_canvas]:hidden" />
      
      <AnimatePresence>
        {flash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="absolute inset-0 z-10 bg-white"
          />
        )}
      </AnimatePresence>

      {!active && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#030303]/80 text-center text-sm text-[#78909C]">
          Camera paused
        </div>
      )}
      {error && (
        <div className="absolute bottom-0 left-0 right-0 z-20 bg-[#0D1B2A]/95 px-3 py-2 text-center text-xs text-[#F9A825]">
          {error}
        </div>
      )}
      <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden rounded-2xl">
        <motion.div
          className="absolute left-0 right-0 h-0.5 bg-[#66BB6A]/90 shadow-[0_0_12px_rgba(102,187,106,0.9)]"
          initial={{ top: "5%" }}
          animate={{ top: ["5%", "92%", "5%"] }}
          transition={{
            duration: 2.8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>
      <div className="pointer-events-none absolute inset-4 z-40 rounded-xl border border-[#00BFA5]/25" />
    </div>
  );
}
