"use client";

import { motion } from "framer-motion";

const DEMOS = [
  { label: "Chips", barcode: "1000000000001" },
  { label: "Cola", barcode: "1000000000002" },
  { label: "Bread", barcode: "1000000000003" },
  { label: "Milk", barcode: "1000000000004" },
  { label: "Oats", barcode: "1000000000005" },
] as const;

interface DemoChipsProps {
  onPick: (barcode: string) => void;
}

export function DemoChips({ onPick }: DemoChipsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {DEMOS.map((d, i) => (
        <motion.button
          key={d.barcode}
          type="button"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 * i }}
          onClick={() => onPick(d.barcode)}
          className="rounded-full border border-[#00BFA5]/35 bg-[#00BFA5]/10 px-3 py-1.5 text-xs font-medium text-[#00BFA5] shadow-[0_0_16px_rgba(0,191,165,0.2)] transition hover:bg-[#00BFA5]/20"
        >
          {d.label}
        </motion.button>
      ))}
    </div>
  );
}
