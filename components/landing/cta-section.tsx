"use client";

import { motion } from "framer-motion";
import { ArrowRight, Shield, Zap, Headphones } from "lucide-react";
import { SignUpButton } from "@clerk/nextjs";

const perks = [
  { icon: Shield, text: "Secure & private" },
  { icon: Zap, text: "Lightning fast" },
  { icon: Headphones, text: "Priority support" },
];

export function CTASection() {
  return (
    <section className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/5 to-emerald-500/5" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-indigo-600/10 to-emerald-600/10 blur-[120px] rounded-full pointer-events-none" />

      <motion.div
        className="relative z-10 max-w-3xl mx-auto px-4 text-center"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.25, 0.1, 0, 1] as const }}
      >
        <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tight leading-[1.1]">
          Ready to Simplify Your{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">
            Property Management
          </span>
          ?
        </h2>
        <p className="mt-6 text-lg text-slate-400 max-w-xl mx-auto">
          Join thousands of landlords who trust RentMaster. Start for free — no credit card required.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <SignUpButton mode="modal" forceRedirectUrl="/onboarding/role">
            <button className="group relative inline-flex items-center justify-center gap-2 bg-white text-slate-950 px-8 py-3.5 rounded-full font-semibold text-base overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.1)]">
              <span className="relative z-10 flex items-center gap-2">
                Get Started Free <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-100 to-emerald-100 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </SignUpButton>
        </div>

        <div className="mt-8 flex items-center justify-center gap-6 text-sm text-slate-500">
          {perks.map((perk) => {
            const Icon = perk.icon;
            return (
              <span key={perk.text} className="flex items-center gap-1.5">
                <Icon className="w-3.5 h-3.5 text-emerald-400" />
                {perk.text}
              </span>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}
