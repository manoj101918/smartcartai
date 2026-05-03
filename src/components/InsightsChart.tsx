"use client";

import { motion } from "framer-motion";

interface InsightsChartProps {
  data: Record<string, number>;
}

export function InsightsChart({ data }: InsightsChartProps) {
  const entries = Object.entries(data).filter(([, v]) => v > 0);
  const max = Math.max(...entries.map(([, v]) => v), 1);

  if (entries.length === 0) {
    return (
      <p className="text-sm text-[#78909C]">No category data for this trip.</p>
    );
  }

  return (
    <div className="space-y-3">
      {entries.map(([label, value], i) => {
        const pct = (value / max) * 100;
        return (
          <div key={label} className="space-y-1">
            <div className="flex justify-between text-xs text-[#78909C]">
              <span className="text-[#E3F2FD]">{label}</span>
              <span className="tabular-nums">₹{value.toFixed(0)}</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#1A2B3C]">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[#00BFA5] to-cyan-400"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, delay: 0.08 * i, ease: "easeOut" }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
