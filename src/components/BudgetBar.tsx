"use client";

import { cn } from "@/lib/utils";

interface BudgetBarProps {
  spent: number;
  budget: number;
  className?: string;
}

export function BudgetBar({ spent, budget, className }: BudgetBarProps) {
  const safeBudget = budget > 0 ? budget : 1;
  const ratio = Math.min(spent / safeBudget, 1);
  const pct = ratio * 100;

  let barColor = "bg-[#00BFA5]";
  if (pct >= 100) barColor = "bg-[#EF5350]";
  else if (pct >= 85) barColor = "bg-[#E65100]";
  else if (pct >= 70) barColor = "bg-[#F9A825]";

  return (
    <div className={cn("w-full space-y-2", className)}>
      <div className="flex items-center justify-between text-xs text-[#78909C] sm:text-sm">
        <span>Budget</span>
        <span className="tabular-nums text-[#E3F2FD]">
          ₹{spent.toFixed(0)} / ₹{budget.toFixed(0)}
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full border border-white/[0.08] bg-[#1A2B3C]">
        <div
          className={cn(
            "h-full rounded-full transition-[width,background-color] duration-[400ms] ease-out",
            barColor
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
