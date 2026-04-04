"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ComplianceCircle } from "@/components/ComplianceCircle";
import { InsightsChart } from "@/components/InsightsChart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { clearAppStorage, loadInsightsSnapshot } from "@/lib/cart";

export default function InsightsPage() {
  const router = useRouter();
  const [snap] = useState(() => loadInsightsSnapshot());

  const shareText = useMemo(() => {
    return `SmartCart AI: I saved ₹${snap.totalSaved.toFixed(0)} this trip with AI swaps. Next trip I could save ~₹${snap.nextTripEstimate.toFixed(0)}.`;
  }, [snap]);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: "SmartCart AI", text: shareText });
        return;
      }
      await navigator.clipboard.writeText(shareText);
      toast.success("Copied summary to clipboard");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Share failed";
      toast.error(msg);
    }
  };

  const handleNewCart = () => {
    try {
      clearAppStorage();
      router.push("/setup");
    } catch {
      toast.error("Could not reset session");
    }
  };

  return (
    <div className="min-h-dvh bg-[#030303] px-4 py-10 text-[#E3F2FD]">
      <div className="mx-auto max-w-lg space-y-8">
        <motion.header
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-[#00BFA5]">
            ₹{snap.totalSaved.toFixed(0)}
          </h1>
          <p className="mt-1 text-sm text-[#78909C]">
            Total saved with AI-powered swaps this trip
          </p>
        </motion.header>

        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
        >
          <Card className="border-white/[0.08] bg-[#0D1B2A]/90 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-lg text-[#E3F2FD]">
                Spend by category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <InsightsChart data={snap.categorySpend} />
            </CardContent>
          </Card>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="flex justify-center rounded-2xl border border-white/[0.08] bg-[#0D1B2A]/80 py-8 backdrop-blur-md"
        >
          <ComplianceCircle percent={snap.healthCompliance} />
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
        >
          <Card className="border-[#00BFA5]/25 bg-[#00BFA5]/5 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-lg text-[#E3F2FD]">
                Next trip estimate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-[#00BFA5]">
                You could save ₹{snap.nextTripEstimate.toFixed(0)} next trip
              </p>
              <p className="mt-2 text-sm text-[#78909C]">
                Based on your swap behaviour and basket mix.
              </p>
            </CardContent>
          </Card>
        </motion.section>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <Button
            type="button"
            variant="outline"
            className="flex-1 rounded-full border-white/15 bg-transparent text-[#E3F2FD] hover:bg-white/5"
            onClick={() => void handleShare()}
          >
            Share
          </Button>
          <Button
            type="button"
            className="flex-1 rounded-full bg-[#00BFA5] text-[#030303] shadow-[0_0_24px_rgba(0,191,165,0.35)] hover:bg-[#26C9B0]"
            onClick={handleNewCart}
          >
            Start New Cart
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
