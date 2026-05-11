"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    quote:
      "RentMaster has completely transformed how I manage my 12 properties. The partial payment tracking and auto-generated receipts save me hours every month.",
    name: "Vikram Mehta",
    role: "Landlord, 12 properties",
    rating: 5,
    initials: "VM",
    gradient: "from-indigo-400 to-violet-500",
  },
  {
    quote:
      "The tenant portal is a game-changer. My tenants love being able to view their bills and download receipts anytime. No more WhatsApp requests for payment details!",
    name: "Ananya Gupta",
    role: "Property Manager, Mumbai",
    rating: 5,
    initials: "AG",
    gradient: "from-emerald-400 to-cyan-500",
  },
  {
    quote:
      "I was managing everything on spreadsheets. RentMaster made it effortless — billing, receipts, payment tracking. Worth every penny for the peace of mind.",
    name: "Rajesh Khanna",
    role: "Landlord, 8 properties",
    rating: 5,
    initials: "RK",
    gradient: "from-rose-400 to-pink-500",
  },
];

const easing = [0.25, 0.1, 0, 1] as const;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easing } },
};

export function TestimonialsSection() {
  return (
    <section className="relative py-24">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: easing }}
        >
          <span className="inline-block px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] text-xs font-medium text-slate-400 uppercase tracking-wider mb-4">
            Testimonials
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
            Loved by{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">
              Property Managers
            </span>
          </h2>
          <p className="mt-4 text-slate-400 text-lg max-w-lg mx-auto">
            See what landlords and property managers say about RentMaster.
          </p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-3 gap-5"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {testimonials.map((t) => (
            <motion.div
              key={t.name}
              variants={itemVariants}
              className="group relative rounded-2xl bg-white/[0.03] border border-white/[0.06] p-6 hover:bg-white/[0.06] transition-all duration-300"
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-sm text-slate-300 leading-relaxed mb-6">&ldquo;{t.quote}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center text-sm font-bold text-white`}
                >
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
