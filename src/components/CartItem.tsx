"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LocalCartItem } from "@/lib/cart";

interface CartItemProps {
  item: LocalCartItem;
  onRemove: (cartItemId: string) => void;
}

export function CartItem({ item, onRemove }: CartItemProps) {
  return (
    <motion.li
      layout
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 12 }}
      transition={{ type: "spring", stiffness: 380, damping: 28 }}
      className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-[#0D1B2A]/90 px-3 py-2.5 backdrop-blur-md"
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-[#E3F2FD]">
          {item.name}
        </p>
        <p className="text-xs text-[#78909C]">
          Qty {item.quantity} · ₹{item.price.toFixed(0)} each
        </p>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold tabular-nums text-[#00BFA5]">
          ₹{(item.price * item.quantity).toFixed(0)}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 shrink-0 text-[#78909C] hover:bg-white/5 hover:text-[#EF5350]"
          onClick={() => onRemove(item.cartItemId)}
          aria-label={`Remove ${item.name}`}
        >
          <X className="size-4" />
        </Button>
      </div>
    </motion.li>
  );
}
