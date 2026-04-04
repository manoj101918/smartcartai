"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

export interface ReminderItem {
  id: string;
  title: string;
  barcode: string;
  price: number;
}

interface RemindersPanelProps {
  reminders: ReminderItem[];
  onAdd: (barcode: string) => void;
}

export function RemindersPanel({ reminders, onAdd }: RemindersPanelProps) {
  if (reminders.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-[#E3F2FD]">Did you forget?</h3>
      <AnimatePresence>
        {reminders.map((r, i) => (
          <motion.div
            key={r.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ delay: 0.05 * i }}
            className="flex items-center justify-between gap-3 rounded-xl border border-[#00BFA5]/25 bg-[#00BFA5]/5 px-3 py-2.5"
          >
            <div className="min-w-0">
              <p className="truncate text-sm text-[#E3F2FD]">{r.title}</p>
              <p className="text-xs text-[#78909C]">₹{r.price.toFixed(0)}</p>
            </div>
            <Button
              type="button"
              size="sm"
              className="shrink-0 bg-[#00BFA5] text-[#030303] hover:bg-[#26C9B0]"
              onClick={() => onAdd(r.barcode)}
            >
              Add
            </Button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
