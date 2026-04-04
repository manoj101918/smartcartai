"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { QRDisplay } from "@/components/QRDisplay";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  categorySpendMap,
  cartSubtotal,
  computeHealthCompliance,
  loadCart,
  loadSessionPrefs,
  mergeCartLine,
  saveCart,
  saveInsightsSnapshot,
  type LocalCartItem,
} from "@/lib/cart";
import { findProductByNameLike, getProduct, insertCartItem, supabase } from "@/lib/supabase";

const USE_REAL_PAYMENT = false;

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<LocalCartItem[]>([]);
  const [paying, setPaying] = useState(false);
  const [success, setSuccess] = useState(false);
  const [qrReady, setQrReady] = useState(false);
  const [orderId] = useState(() => crypto.randomUUID());

  useEffect(() => {
    const c = loadCart();
    if (c.length === 0) {
      router.replace("/scanner");
      return;
    }
    setCart(c);
  }, [router]);

  const prefs = loadSessionPrefs();
  const subtotal = cartSubtotal(cart);
  const gst = subtotal * 0.05;
  const total = subtotal + gst;
  const aiSavings = cart.reduce((s, i) => s + (i.swapSaved ?? 0), 0);


  const qrPayload = useMemo(
    () =>
      JSON.stringify({
        app: "SmartCart",
        total: Math.round(total * 100) / 100,
        orderId,
      }),
    [total, orderId]
  );


  const handlePay = async () => {
    if (USE_REAL_PAYMENT) {
      toast.error("Real payments are disabled in this build.");
      return;
    }
    setPaying(true);
    try {
      await new Promise((r) => setTimeout(r, 1800));
      const diet = prefs.diet ?? "balanced";
      const totalSaved = aiSavings;
      const categorySpend = categorySpendMap(cart);
      const healthCompliance = computeHealthCompliance(cart, diet);
      const nextTripEstimate = Math.round(totalSaved * 1.15 + 40);
      saveInsightsSnapshot({
        totalSaved,
        categorySpend,
        healthCompliance,
        nextTripEstimate,
      });
      saveCart([]);
      setCart([]);
      setSuccess(true);
      window.setTimeout(() => router.push("/insights"), 3000);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Payment failed";
      toast.error(msg);
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="min-h-dvh bg-[#030303] px-4 py-8 text-[#E3F2FD]">
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"
        strategy="afterInteractive"
        onLoad={() => setQrReady(true)}
        onError={() => toast.error("Failed to load QR library.")}
      />

      <div className="mx-auto max-w-lg space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Link
            href="/scanner"
            className="text-sm text-[#78909C] hover:text-[#00BFA5]"
          >
            ← Back to scanner
          </Link>
          <h1 className="mt-4 text-2xl font-semibold">Checkout</h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <Card className="border-white/[0.08] bg-[#0D1B2A]/90 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg text-[#E3F2FD]">
                Cart summary
              </CardTitle>
              {aiSavings > 0 && (
                <Badge className="border-[#00BFA5]/40 bg-[#00BFA5]/15 text-[#00BFA5]">
                  AI saved ~₹{aiSavings.toFixed(0)}
                </Badge>
              )}
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between text-[#78909C]">
                <span>Subtotal</span>
                <span className="tabular-nums text-[#E3F2FD]">
                  ₹{subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-[#78909C]">
                <span>GST (5%)</span>
                <span className="tabular-nums text-[#E3F2FD]">
                  ₹{gst.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-3 text-base font-semibold">
                <span>Total</span>
                <span className="tabular-nums text-[#00BFA5]">
                  ₹{total.toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>


        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex flex-col items-center rounded-2xl border border-white/[0.08] bg-[#0D1B2A]/60 p-6 backdrop-blur-md"
        >
          <h2 className="mb-4 text-sm font-semibold text-[#E3F2FD]">
            Pay with QR
          </h2>
          <QRDisplay qrReady={qrReady} payload={qrPayload} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
        >
          <Button
            type="button"
            disabled={paying || success}
            onClick={() => void handlePay()}
            className="h-12 w-full rounded-full bg-[#00BFA5] text-base font-semibold text-[#030303] shadow-[0_0_24px_rgba(0,191,165,0.35)] hover:bg-[#26C9B0] disabled:opacity-60"
          >
            {paying ? (
              <span className="inline-flex items-center gap-2">
                <span className="size-4 animate-spin rounded-full border-2 border-[#030303] border-t-transparent" />
                Processing…
              </span>
            ) : (
              "Pay now (sandbox)"
            )}
          </Button>
          <p className="mt-2 text-center text-xs text-[#78909C]">
            Razorpay sandbox · USE_REAL_PAYMENT={String(USE_REAL_PAYMENT)}
          </p>
        </motion.div>
      </div>

      {success && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#030303]/95 px-6 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <svg viewBox="0 0 100 100" className="mb-6 size-28 text-[#00BFA5]">
            <motion.circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeDasharray={276}
              initial={{ strokeDashoffset: 276 }}
              animate={{ strokeDashoffset: 0 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
            />
            <motion.path
              d="M28 52 L45 68 L72 36"
              fill="none"
              stroke="currentColor"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={80}
              initial={{ strokeDashoffset: 80 }}
              animate={{ strokeDashoffset: 0 }}
              transition={{ duration: 0.6, delay: 0.35, ease: "easeOut" }}
            />
          </svg>
          <p className="text-center text-2xl font-semibold text-[#E3F2FD]">
            Payment Confirmed! Walk Out 🚀
          </p>
          <p className="mt-2 text-sm text-[#78909C]">
            Redirecting to your insights…
          </p>
        </motion.div>
      )}
    </div>
  );
}
