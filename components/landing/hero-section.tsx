"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { SignUpButton, SignInButton } from "@clerk/nextjs";

function FloatingOrb({
  className,
  size,
  color,
  delay,
}: {
  className?: string;
  size: number;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl pointer-events-none ${className}`}
      style={{ width: size, height: size, background: color }}
      animate={{
        x: [0, 40, -30, 20, 0],
        y: [0, -50, 30, -20, 0],
        scale: [1, 1.15, 0.95, 1.05, 1],
      }}
      transition={{ duration: 12 + delay, repeat: Infinity, ease: "easeInOut", delay }}
    />
  );
}

function FloatingShape({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <motion.div
      className={className}
      animate={{ y: [0, -15, 0], rotate: [0, 5, -5, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
}

const easing = [0.25, 0.1, 0, 1] as const;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: easing } },
};

export function HeroSection({ isSignedIn }: { isSignedIn: boolean }) {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-24 pb-16">
      <FloatingOrb className="top-1/4 left-1/4" size={600} color="rgba(99,102,241,0.12)" delay={0} />
      <FloatingOrb className="bottom-1/4 right-1/4" size={500} color="rgba(16,185,129,0.08)" delay={3} />
      <FloatingOrb className="top-1/3 right-1/3" size={400} color="rgba(244,63,94,0.06)" delay={6} />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 opacity-20">
          <FloatingShape>
            <div className="w-16 h-16 border border-indigo-500/30 rounded-full" />
          </FloatingShape>
        </div>
        <div className="absolute bottom-32 right-16 opacity-20">
          <FloatingShape>
            <div className="w-24 h-24 border border-emerald-500/20 rounded-2xl rotate-45" />
          </FloatingShape>
        </div>
        <div className="absolute top-1/2 right-24 opacity-15">
          <FloatingShape>
            <div className="w-12 h-12 border border-rose-500/30 rounded-full" />
          </FloatingShape>
        </div>
      </div>

      <motion.div
        className="relative z-10 max-w-5xl mx-auto px-4 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="mb-6">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            Trusted by 500+ Property Managers
          </span>
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.05]"
        >
          <span className="text-white">Manage Your </span>
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-emerald-400">
            Rental Properties
          </span>
          <br />
          <span className="text-white">Like a Pro</span>
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="mt-6 text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed font-light"
        >
          Track rent, manage electricity bills, handle partial payments, and generate beautiful receipts — all in one
          place.
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          {isSignedIn ? (
            <a
              href="/dashboard"
              className="group relative inline-flex items-center justify-center gap-2 bg-white text-slate-950 px-8 py-3.5 rounded-full font-semibold text-base overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.1)]"
            >
              <span className="relative z-10 flex items-center gap-2">
                Go to Dashboard <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-100 to-emerald-100 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          ) : (
            <>
              <SignUpButton mode="modal" forceRedirectUrl="/onboarding/role">
                <button className="group relative inline-flex items-center justify-center gap-2 bg-white text-slate-950 px-8 py-3.5 rounded-full font-semibold text-base overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.12)]">
                  <span className="relative z-10 flex items-center gap-2">
                    Get Started Free <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-100 to-emerald-100 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </SignUpButton>
              <SignInButton mode="modal" forceRedirectUrl="/onboarding/role">
                <button className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-semibold text-base border border-white/10 text-slate-300 hover:text-white hover:border-white/25 transition-all hover:scale-105 active:scale-95">
                  Sign In
                </button>
              </SignInButton>
            </>
          )}
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="mt-12 flex items-center justify-center gap-8 text-sm text-slate-500"
        >
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            No credit card
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Free forever tier
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Cancel anytime
          </span>
        </motion.div>
      </motion.div>

      <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-[#030712] to-transparent pointer-events-none" />
    </section>
  );
}
