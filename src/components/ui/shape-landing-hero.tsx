"use client";

import { motion } from "framer-motion";
import { Circle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

function ElegantShape({
  className,
  delay = 0,
  width = 400,
  height = 100,
  rotate = 0,
  gradient = "from-white/[0.08]",
}: {
  className?: string;
  delay?: number;
  width?: number;
  height?: number;
  rotate?: number;
  gradient?: string;
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: -120,
        rotate: rotate - 12,
      }}
      animate={{
        opacity: 1,
        y: 0,
        rotate,
      }}
      transition={{
        duration: 2.2,
        delay,
        ease: [0.23, 0.86, 0.39, 0.96],
        type: "spring",
        stiffness: 60,
        damping: 18,
      }}
      className={cn(
        "absolute overflow-hidden rounded-[2rem] border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm",
        className
      )}
      style={{ width, height }}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-[0.22]",
          gradient
        )}
      />
    </motion.div>
  );
}

function HeroGeometric({
  badge = "SmartCart AI",
  title1 = "Shop Smarter.",
  title2 = "Skip the Line.",
}: {
  badge?: string;
  title1?: string;
  title2?: string;
}) {
  const fadeUpVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 1,
        delay: 0.5 + i * 0.2,
        ease: [0.25, 0.4, 0.25, 1] as const,
      },
    }),
  };

  return (
    <div className="relative min-h-[88vh] w-full overflow-hidden bg-[#030303]">
      <div className="pointer-events-none absolute inset-0">
        <ElegantShape
          className="left-[-8%] top-[12%]"
          delay={0.1}
          width={520}
          height={140}
          rotate={12}
          gradient="from-[#00BFA5]/25"
        />
        <ElegantShape
          className="right-[-6%] top-[22%]"
          delay={0.25}
          width={440}
          height={120}
          rotate={-8}
          gradient="from-cyan-500/20"
        />
        <ElegantShape
          className="bottom-[18%] left-[10%]"
          delay={0.35}
          width={380}
          height={100}
          rotate={-18}
          gradient="from-emerald-500/15"
        />
        <ElegantShape
          className="bottom-[12%] right-[8%]"
          delay={0.45}
          width={460}
          height={130}
          rotate={16}
          gradient="from-teal-400/18"
        />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[88vh] max-w-5xl flex-col items-center justify-center px-6 py-24 text-center">
        <motion.div
          custom={0}
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-[#0D1B2A]/80 px-4 py-1.5 text-sm text-[#78909C] backdrop-blur-md"
        >
          <Circle className="size-2 fill-[#00BFA5] text-[#00BFA5]" />
          <span className="font-medium tracking-wide text-[#E3F2FD]">
            {badge}
          </span>
        </motion.div>

        <motion.h1
          custom={1}
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
          className="text-balance font-semibold tracking-tight text-[#E3F2FD]"
        >
          <span className="block text-4xl sm:text-6xl md:text-7xl">
            {title1}
          </span>
          <span className="mt-2 block bg-gradient-to-r from-[#00BFA5] to-cyan-300 bg-clip-text text-4xl text-transparent sm:text-6xl md:text-7xl">
            {title2}
          </span>
        </motion.h1>

        <motion.p
          custom={2}
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
          className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-[#78909C] sm:text-lg"
        >
          AI-powered grocery assistant that saves money, improves health, and
          eliminates checkout queues — in real time.
        </motion.p>

        <motion.div
          custom={3}
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Link
            href="/setup"
            className="inline-flex h-12 items-center justify-center rounded-full bg-[#00BFA5] px-8 text-sm font-semibold text-[#030303] shadow-[0_0_24px_rgba(0,191,165,0.35)] transition hover:brightness-110"
          >
            Start Shopping →
          </Link>
          <a
            href="#features"
            className="inline-flex h-12 items-center justify-center rounded-full border border-white/[0.12] bg-[#0D1B2A]/60 px-8 text-sm font-medium text-[#E3F2FD] backdrop-blur-md transition hover:border-[#00BFA5]/40 hover:text-[#00BFA5]"
          >
            See Features
          </a>
        </motion.div>
      </div>
    </div>
  );
}

export { HeroGeometric, ElegantShape };
