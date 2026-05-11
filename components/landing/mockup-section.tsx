"use client";

import { motion } from "framer-motion";

const easing = [0.25, 0.1, 0, 1] as const;
import { IndianRupee, Home, TrendingUp, UserCheck } from "lucide-react";

const stats = [
  {
    label: "Total Revenue",
    value: "₹2,45,000",
    change: "+12.5%",
    icon: IndianRupee,
    color: "text-emerald-400",
    barColor: "bg-emerald-500",
  },
  {
    label: "Active Tenants",
    value: "24",
    change: "+3",
    icon: UserCheck,
    color: "text-indigo-400",
    barColor: "bg-indigo-500",
  },
  { label: "Properties", value: "8", change: "", icon: Home, color: "text-violet-400", barColor: "bg-violet-500" },
  {
    label: "Collection Rate",
    value: "94.2%",
    change: "+2.1%",
    icon: TrendingUp,
    color: "text-amber-400",
    barColor: "bg-amber-500",
  },
];

const recentPayments = [
  { name: "Rahul Sharma", amount: "₹18,000", status: "Paid", time: "2 min ago" },
  { name: "Priya Patel", amount: "₹22,500", status: "Paid", time: "1 hour ago" },
  { name: "Amit Kumar", amount: "₹15,000", status: "Partial", time: "3 hours ago" },
  { name: "Sneha Reddy", amount: "₹20,000", status: "Pending", time: "Overdue" },
];

export function MockupSection() {
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
            Powerful Dashboard
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
            Everything at Your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">
              Fingertips
            </span>
          </h2>
          <p className="mt-4 text-slate-400 text-lg max-w-lg mx-auto">
            A clean, intuitive dashboard that gives you complete control.
          </p>
        </motion.div>

        <motion.div
          className="relative mx-auto max-w-5xl"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: easing }}
        >
          <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] bg-slate-900/80 backdrop-blur-xl shadow-[0_0_80px_rgba(99,102,241,0.06)]">
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/[0.06] bg-slate-900/50">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              <div className="ml-4 flex-1 max-w-[200px] mx-auto">
                <div className="h-6 rounded-md bg-white/[0.06] flex items-center justify-center">
                  <span className="text-[10px] text-slate-500 font-mono">app.rentmaster.io/dashboard</span>
                </div>
              </div>
            </div>

            <div className="p-5 md:p-6 space-y-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {stats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <motion.div
                      key={stat.label}
                      className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-3.5"
                      whileHover={{ scale: 1.02, y: -2 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Icon className={`w-4 h-4 ${stat.color}`} />
                        {stat.change && (
                          <span className="text-[10px] font-medium text-emerald-400">+{stat.change}</span>
                        )}
                      </div>
                      <p className="text-lg font-bold text-white">{stat.value}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{stat.label}</p>
                    </motion.div>
                  );
                })}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-4">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                    Monthly Revenue
                  </h4>
                  <div className="flex items-end gap-1.5 h-24">
                    {[45, 62, 38, 78, 55, 90, 72, 85, 48, 68, 92, 80].map((h, i) => (
                      <motion.div
                        key={i}
                        className="flex-1 rounded-sm bg-gradient-to-t from-indigo-500 to-violet-400 opacity-80"
                        style={{ height: `${h}%` }}
                        initial={{ height: 0 }}
                        whileInView={{ height: `${h}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: i * 0.05, ease: "easeOut" }}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between mt-2 text-[9px] text-slate-600">
                    <span>Jan</span>
                    <span>Mar</span>
                    <span>May</span>
                    <span>Jul</span>
                    <span>Sep</span>
                    <span>Nov</span>
                  </div>
                </div>

                <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-4">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                    Recent Payments
                  </h4>
                  <div className="space-y-2.5">
                    {recentPayments.map((payment) => (
                      <div key={payment.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-[10px] font-bold text-white">
                            {payment.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </div>
                          <div>
                            <p className="text-xs font-medium text-white">{payment.name}</p>
                            <p className="text-[10px] text-slate-500">{payment.time}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-semibold text-white">{payment.amount}</p>
                          <span
                            className={`text-[9px] font-medium ${
                              payment.status === "Paid"
                                ? "text-emerald-400"
                                : payment.status === "Partial"
                                  ? "text-amber-400"
                                  : "text-rose-400"
                            }`}
                          >
                            {payment.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <motion.div
            className="absolute -bottom-4 -right-4 w-72 h-72 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none -z-10"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </div>
    </section>
  );
}
