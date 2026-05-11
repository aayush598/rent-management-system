"use client";

import { motion } from "framer-motion";
import { IndianRupee, Home, FileText, UserRound, SlidersHorizontal, BarChart3 } from "lucide-react";

const features = [
  {
    icon: IndianRupee,
    title: "Smart Billing",
    description:
      "Auto-calculate electricity from meter readings. Water charges, rent, and custom fees all handled seamlessly.",
    gradient: "from-indigo-500/20 to-indigo-600/10",
    iconColor: "text-indigo-400",
    borderColor: "border-indigo-500/20",
    size: "md:col-span-1 md:row-span-2",
  },
  {
    icon: Home,
    title: "Partial Payments",
    description:
      "Accept payments per category — rent, water, electricity, or custom charges. Track exactly what's paid.",
    gradient: "from-emerald-500/20 to-emerald-600/10",
    iconColor: "text-emerald-400",
    borderColor: "border-emerald-500/20",
    size: "md:col-span-1",
  },
  {
    icon: FileText,
    title: "Instant Receipts",
    description: "Generate beautiful, professional receipts. Export as PDF, PNG, or share via WhatsApp and Gmail.",
    gradient: "from-violet-500/20 to-violet-600/10",
    iconColor: "text-violet-400",
    borderColor: "border-violet-500/20",
    size: "md:col-span-1 md:row-span-2",
  },
  {
    icon: UserRound,
    title: "Tenant Portal",
    description: "Tenants get their own portal to view bills, download receipts, and track payment history.",
    gradient: "from-cyan-500/20 to-cyan-600/10",
    iconColor: "text-cyan-400",
    borderColor: "border-cyan-500/20",
    size: "md:col-span-1",
  },
  {
    icon: SlidersHorizontal,
    title: "Custom Charges",
    description: "Define per-tenant custom charges — parking, maintenance, gym — with full tracking and receipts.",
    gradient: "from-rose-500/20 to-rose-600/10",
    iconColor: "text-rose-400",
    borderColor: "border-rose-500/20",
    size: "md:col-span-1",
  },
  {
    icon: BarChart3,
    title: "Dashboard Analytics",
    description: "Revenue trends, collection rates, payment calendars, and category-wise breakdowns at a glance.",
    gradient: "from-amber-500/20 to-amber-600/10",
    iconColor: "text-amber-400",
    borderColor: "border-amber-500/20",
    size: "md:col-span-1",
  },
];

const easing = [0.25, 0.1, 0, 1] as const;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easing } },
};

export function BentoFeatures() {
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
            Everything you need
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
            All-in-One{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">
              Property Management
            </span>
          </h2>
          <p className="mt-4 text-slate-400 text-lg max-w-lg mx-auto">
            From billing to receipts, every tool you need to manage your rental properties.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                className={`group relative p-6 rounded-2xl bg-white/[0.03] border ${feature.borderColor} hover:bg-white/[0.06] transition-all duration-300 ${feature.size}`}
              >
                <div
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                />
                <div className="relative z-10">
                  <div
                    className={`w-11 h-11 rounded-xl bg-white/[0.06] flex items-center justify-center mb-4 ${feature.iconColor}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
