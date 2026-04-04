"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import type { AISuggestionRow } from "@/lib/supabase";

interface AICardProps {
  row: AISuggestionRow;
  productName: string;
  onSwap: (row: AISuggestionRow) => void;
  onKeep: (id: string) => void;
  onDismiss: (id: string) => void;
}

export function AICard({
  row,
  productName,
  onSwap,
  onKeep,
  onDismiss,
}: AICardProps) {
  const [remaining, setRemaining] = useState(1);
  const dismissRef = useRef(onDismiss);
  dismissRef.current = onDismiss;

  useEffect(() => {
    const start = Date.now();
    const duration = 9000;
    const id = window.setInterval(() => {
      const elapsed = Date.now() - start;
      const r = Math.max(0, 1 - elapsed / duration);
      setRemaining(r);
      if (elapsed >= duration) {
        window.clearInterval(id);
        dismissRef.current(row.id);
      }
    }, 50);
    return () => window.clearInterval(id);
  }, [row.id]);

  const sections = useMemo(() => {
    const out: { key: string; tone: "warn" | "teal" | "blue" | "gold"; icon: string; text: string }[] = [];
    if (row.warning)
      out.push({
        key: "w",
        tone: "warn",
        icon: "⚠️",
        text: row.warning,
      });
    if (row.swap_name)
      out.push({
        key: "s",
        tone: "teal",
        icon: "💡",
        text: `${row.swap_name} · ₹${Number(row.swap_price ?? 0).toFixed(0)} — ${row.swap_reason ?? ""}`,
      });
    if (row.combo_offer)
      out.push({
        key: "c",
        tone: "blue",
        icon: "🔥",
        text: row.combo_offer,
      });
    if (row.deal_alert)
      out.push({
        key: "d",
        tone: "gold",
        icon: "💰",
        text: row.deal_alert,
      });
    if (row.reminder)
      out.push({
        key: "r",
        tone: "teal",
        icon: "🧭",
        text: row.reminder,
      });
    if (out.length === 0) {
      out.push({
        key: "n",
        tone: "teal",
        icon: "✨",
        text: `Smart tip for ${productName}: compare unit prices on shelf labels.`,
      });
    }
    return out;
  }, [row, productName]);

  const toneClass = (t: (typeof sections)[0]["tone"]) => {
    if (t === "warn") return "border-[#E65100]/40 bg-[#E65100]/10 text-[#FFCCBC]";
    if (t === "teal") return "border-[#00BFA5]/35 bg-[#00BFA5]/10 text-[#E0F2F1]";
    if (t === "blue") return "border-sky-500/35 bg-sky-500/10 text-sky-100";
    return "border-[#F9A825]/40 bg-[#F9A825]/10 text-[#FFF8E1]";
  };

  return (
    <motion.div
      layout
      initial={{ x: 120, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 120, opacity: 0 }}
      transition={{ type: "spring", stiffness: 420, damping: 32 }}
      className="w-full max-w-sm rounded-2xl border border-white/[0.08] bg-[#0D1B2A]/95 p-4 shadow-[0_0_24px_rgba(0,191,165,0.2)] backdrop-blur-md"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#78909C]">
          AI insight
        </p>
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-[#1A2B3C]">
          <div
            className="h-full rounded-full bg-[#00BFA5] transition-[width] duration-100 ease-linear"
            style={{ width: `${remaining * 100}%` }}
          />
        </div>
      </div>

      <div className="space-y-2">
        {sections.map((s) => (
          <div
            key={s.key}
            className={`rounded-xl border px-3 py-2 text-sm ${toneClass(s.tone)}`}
          >
            <span className="mr-1.5">{s.icon}</span>
            {s.text}
          </div>
        ))}
      </div>

      {row.swap_name && (
        <div className="mt-4 flex gap-2">
          <Button
            type="button"
            className="flex-1 bg-[#00BFA5] text-[#030303] shadow-[0_0_20px_rgba(0,191,165,0.35)] hover:bg-[#26C9B0]"
            onClick={() => onSwap(row)}
          >
            Swap It
          </Button>
          <Button
            type="button"
            variant="outline"
            className="flex-1 border-white/15 bg-transparent text-[#E3F2FD] hover:bg-white/5"
            onClick={() => onKeep(row.id)}
          >
            Keep
          </Button>
        </div>
      )}
    </motion.div>
  );
}
