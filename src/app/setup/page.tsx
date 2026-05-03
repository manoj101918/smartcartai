"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import type { DietGoal } from "@/lib/cart";
import { saveSessionPrefs } from "@/lib/cart";
import { cn } from "@/lib/utils";

const DIETS: { id: DietGoal; title: string; emoji: string; blurb: string }[] = [
  {
    id: "weight-loss",
    title: "Weight Loss",
    emoji: "🥗",
    blurb: "Stricter sugar & junk alerts.",
  },
  {
    id: "high-protein",
    title: "High Protein",
    emoji: "💪",
    blurb: "Prioritise protein-rich picks.",
  },
  {
    id: "balanced",
    title: "Balanced",
    emoji: "⚖️",
    blurb: "All-round mindful shopping.",
  },
];

export default function SetupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [budget, setBudget] = useState(500);
  const [diet, setDiet] = useState<DietGoal>("balanced");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const trimmed = name.trim() || "Shopper";
      const session = crypto.randomUUID();
      saveSessionPrefs({
        name: trimmed,
        budget,
        diet,
        session,
      });
      router.push("/scanner");
    } catch {
      toast.error("Could not save your preferences. Please try again.");
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#030303] px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg"
      >
        <Card className="border-white/[0.08] bg-[#0D1B2A]/90 text-[#E3F2FD] shadow-[0_0_32px_rgba(0,191,165,0.15)] backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-2xl text-[#E3F2FD]">
              Let&apos;s personalise SmartCart
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-2"
              >
                <Label htmlFor="name" className="text-[#78909C]">
                  Your name
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Priya"
                  className="border-white/10 bg-[#1A2B3C]/60 text-[#E3F2FD] placeholder:text-[#78909C]"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <Label className="text-[#78909C]">Trip budget</Label>
                  <span className="text-sm font-semibold tabular-nums text-[#00BFA5]">
                    ₹{budget}
                  </span>
                </div>
                <Slider
                  value={[budget]}
                  min={100}
                  max={2000}
                  step={10}
                  onValueChange={(v) => {
                    const n = Array.isArray(v) ? v[0] : v;
                    setBudget(typeof n === "number" ? n : 500);
                  }}
                  className="py-1"
                />
                <p className="text-xs text-[#78909C]">Between ₹100 and ₹2000</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-3"
              >
                <Label className="text-[#78909C]">Diet goal</Label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {DIETS.map((d, i) => (
                    <motion.button
                      key={d.id}
                      type="button"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35 + i * 0.08 }}
                      onClick={() => setDiet(d.id)}
                      className={cn(
                        "rounded-2xl border p-4 text-left transition",
                        diet === d.id
                          ? "border-[#00BFA5] bg-[#00BFA5]/10 shadow-[0_0_24px_rgba(0,191,165,0.35)]"
                          : "border-white/[0.08] bg-[#1A2B3C]/50 hover:border-[#00BFA5]/25"
                      )}
                    >
                      <p className="text-2xl">{d.emoji}</p>
                      <p className="mt-2 font-semibold text-[#E3F2FD]">
                        {d.title}
                      </p>
                      <p className="mt-1 text-xs text-[#78909C]">{d.blurb}</p>
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
              >
                <Button
                  type="submit"
                  className="h-11 w-full rounded-full bg-[#00BFA5] text-[#030303] shadow-[0_0_24px_rgba(0,191,165,0.35)] hover:bg-[#26C9B0]"
                >
                  Continue to scanner
                </Button>
              </motion.div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
