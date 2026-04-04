"use client";

import { motion } from "framer-motion";

interface ComplianceCircleProps {
  percent: number;
  size?: number;
}

export function ComplianceCircle({ percent, size = 160 }: ComplianceCircleProps) {
  const stroke = 10;
  const r = size / 2 - stroke;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, percent));
  const offset = c * (1 - clamped / 100);

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="#1A2B3C"
          strokeWidth={stroke}
          fill="none"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="#00BFA5"
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <p className="text-2xl font-bold tabular-nums text-[#00BFA5]">
        {clamped}%
      </p>
      <p className="text-center text-xs text-[#78909C]">
        Health compliance vs your diet goal
      </p>
    </div>
  );
}
