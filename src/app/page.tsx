"use client";

import { motion } from "framer-motion";
import {
  Apple,
  Bell,
  Flame,
  LineChart,
  MapPin,
  QrCode,
  ScanLine,
  Sparkles,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { HeroGeometric } from "@/components/ui/shape-landing-hero";

const FEATURES = [
  {
    title: "AI Swap Engine",
    desc: "Instant healthier or cheaper alternatives with aisle hints.",
    icon: Sparkles,
  },
  {
    title: "Budget Guard",
    desc: "Live spend bar with colour cues before you overshoot.",
    icon: Wallet,
  },
  {
    title: "Diet Mode",
    desc: "Weight loss, high protein, or balanced goals shape warnings.",
    icon: Apple,
  },
  {
    title: "Combo Deals",
    desc: "Natural pairings like bread + peanut butter for bundle value.",
    icon: Flame,
  },
  {
    title: "Store Navigation",
    desc: "Aisle-sorted pickup path so you never backtrack.",
    icon: MapPin,
  },
  {
    title: "Smart Reminders",
    desc: "Nudges for forgotten companions (milk with oats, sauce with pasta).",
    icon: Bell,
  },
  {
    title: "Deal Analyser",
    desc: "Benchmarks branded prices against store-brand savings.",
    icon: LineChart,
  },
  {
    title: "QR Checkout",
    desc: "Pay in-app and skip the queue with a single scan.",
    icon: QrCode,
  },
  {
    title: "Smart Insights",
    desc: "Post-trip savings, categories, and health compliance at a glance.",
    icon: ScanLine,
  },
] as const;

const DEMO_CHIPS: {
  code: string;
  label: string;
  hint: string;
}[] = [
  {
    code: "1000000000001",
    label: "Lays ₹100",
    hint: "Junk + salt tags → diet warnings & swap ideas.",
  },
  {
    code: "1000000000002",
    label: "Cola ₹60",
    hint: "High sugar → weight-loss alerts & drink swaps.",
  },
  {
    code: "1000000000003",
    label: "Bread ₹45",
    hint: "Combo pairs → peanut butter / butter reminders.",
  },
  {
    code: "1000000000004",
    label: "Milk ₹68",
    hint: "Pairs with oats, tea, coffee — combo suggestions.",
  },
  {
    code: "1000000000005",
    label: "Oats ₹180",
    hint: "Healthy protein item → positive AI reinforcement.",
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-dvh bg-[#030303] text-[#E3F2FD]">
      <HeroGeometric />

      <section id="features" className="border-t border-white/[0.06] px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center text-3xl font-semibold sm:text-4xl"
          >
            Everything you need in one cart
          </motion.h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-[#78909C] sm:text-base">
            Nine intelligent layers that work together from scan to exit.
          </p>
          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.05 * i, duration: 0.5 }}
                className="rounded-2xl border border-white/[0.08] bg-[#0D1B2A]/80 p-5 shadow-[0_0_24px_rgba(0,191,165,0.08)] backdrop-blur-md"
              >
                <div className="mb-3 inline-flex size-10 items-center justify-center rounded-xl bg-[#00BFA5]/15 text-[#00BFA5]">
                  <f.icon className="size-5" />
                </div>
                <h3 className="text-lg font-semibold text-[#E3F2FD]">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#78909C]">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/[0.06] px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center text-3xl font-semibold"
          >
            How it works
          </motion.h2>
          <div className="mt-12 flex flex-col items-stretch gap-8 md:flex-row md:items-center md:justify-center">
            {[
              { n: 1, t: "Scan Product", d: "Point the camera or tap a demo chip." },
              { n: 2, t: "AI Analyses", d: "Gemini returns JSON insights in seconds." },
              { n: 3, t: "Walk Out", d: "Pay with QR and skip the checkout line." },
            ].map((step, idx) => (
              <div key={step.n} className="flex flex-1 items-center gap-4">
                <div className="flex flex-1 flex-col items-center text-center">
                  <div className="flex size-12 items-center justify-center rounded-full bg-[#00BFA5] text-lg font-bold text-[#030303] shadow-[0_0_24px_rgba(0,191,165,0.35)]">
                    {step.n}
                  </div>
                  <p className="mt-3 font-semibold text-[#E3F2FD]">{step.t}</p>
                  <p className="mt-1 text-sm text-[#78909C]">{step.d}</p>
                </div>
                {idx < 2 && (
                  <motion.div
                    className="hidden md:flex"
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ repeat: Infinity, duration: 1.6, repeatType: "reverse" }}
                  >
                    <span className="text-2xl text-[#00BFA5]">→</span>
                  </motion.div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-8 flex justify-center gap-6 md:hidden">
            <motion.span
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 1.4 }}
              className="text-[#00BFA5]"
            >
              ↓
            </motion.span>
          </div>
        </div>
      </section>

      <section
        id="demo"
        className="border-t border-white/[0.06] px-4 py-20"
      >
        <div className="mx-auto max-w-4xl text-center">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-semibold"
          >
            Demo barcodes
          </motion.h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-[#78909C]">
            Tap a chip to see what it triggers in the scanner. Use these codes
            in manual entry too.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {DEMO_CHIPS.map((d, i) => (
              <motion.button
                key={d.code}
                type="button"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.05 * i }}
                onClick={() => {
                  void navigator.clipboard.writeText(d.code);
                  toast.success(`${d.label} — ${d.hint}`);
                }}
                className="rounded-full border border-white/[0.1] bg-[#1A2B3C]/80 px-4 py-2 text-xs font-medium text-[#E3F2FD] shadow-[0_0_16px_rgba(0,191,165,0.12)] transition hover:border-[#00BFA5]/40 hover:text-[#00BFA5]"
              >
                {d.label}
              </motion.button>
            ))}
          </div>
          <div className="mt-10">
            <Link
              href="/setup"
              className="inline-flex h-11 items-center justify-center rounded-full bg-[#00BFA5] px-8 text-sm font-semibold text-[#030303] shadow-[0_0_24px_rgba(0,191,165,0.35)]"
            >
              Open onboarding
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/[0.06] px-4 py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="text-center sm:text-left">
            <p className="text-lg font-semibold text-[#00BFA5]">SmartCart AI</p>
            <p className="text-sm text-[#78909C]">
              Scan. Save. Stroll out — no queue.
            </p>
          </div>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="text-sm text-[#78909C] underline-offset-4 hover:text-[#00BFA5] hover:underline"
          >
            GitHub
          </a>
        </div>
      </footer>
    </main>
  );
}
