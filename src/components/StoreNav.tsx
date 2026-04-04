"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

export interface NavLine {
  name: string;
  aisle: number;
}

interface StoreNavProps {
  items: NavLine[];
}

export function StoreNav({ items }: StoreNavProps) {
  const [open, setOpen] = useState(false);
  const grouped = items.reduce<Record<number, string[]>>((acc, it) => {
    const a = it.aisle || 0;
    if (!acc[a]) acc[a] = [];
    acc[a].push(it.name);
    return acc;
  }, {});

  const aisles = Object.keys(grouped)
    .map(Number)
    .sort((a, b) => a - b);

  if (aisles.length === 0) {
    return (
      <p className="text-sm text-[#78909C]">Add items to see aisle routing.</p>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/[0.08] bg-[#0D1B2A]/80 p-2 backdrop-blur-md"
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm font-medium text-[#E3F2FD]"
      >
        Store navigation
        <ChevronDown
          className={`size-4 text-[#78909C] transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-2 overflow-hidden px-3 pb-3"
          >
            {aisles.map((aisle) => (
              <div
                key={aisle}
                className="rounded-xl border border-white/[0.06] bg-[#1A2B3C]/60 px-3 py-2"
              >
                <p className="text-sm text-[#E3F2FD]">
                  <span className="font-semibold text-[#00BFA5]">
                    Aisle {aisle}
                  </span>
                  <span className="text-[#78909C]"> → </span>
                  {grouped[aisle].join(", ")}
                </p>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
