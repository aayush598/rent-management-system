"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useUser, UserButton } from "@clerk/nextjs";

/* ═══════════════════════════════════════════
   FONTS — add to layout.tsx:
   import { Instrument_Serif, DM_Mono, Plus_Jakarta_Sans } from "next/font/google"
   
   globals.css add:
   @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Mono:wght@400;500&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
═══════════════════════════════════════════ */

/* ── Hooks ──────────────────────────────── */
function useCountUp(target: number, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (ts: number) => {
      if (!startTime) startTime = ts;
      const p = Math.min((ts - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 4);
      setCount(Math.floor(ease * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setInView(true);
      },
      { threshold },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

/* ── Stat counter ───────────────────────── */
function Stat({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const { ref, inView } = useInView(0.3);
  const count = useCountUp(value, 1800, inView);
  return (
    <div ref={ref} className="flex flex-col items-center gap-1.5">
      <span className="font-mono text-4xl md:text-5xl font-medium text-amber-400 tabular-nums leading-none">
        {count.toLocaleString()}
        {suffix}
      </span>
      <span className="text-sm text-slate-400 font-sans tracking-wide">{label}</span>
    </div>
  );
}

/* ── Floating badge ─────────────────────── */
function Badge({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`absolute flex items-center gap-2 bg-slate-800/90 backdrop-blur-sm border border-slate-700/60 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 shadow-lg shadow-black/30 ${className}`}
    >
      {children}
    </div>
  );
}

/* ── Dashboard mockup ───────────────────── */
function DashboardMockup() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((p) => p + 1), 3200);
    return () => clearInterval(t);
  }, []);

  const payments = [
    {
      initials: "RS",
      name: "Rahul Sharma",
      time: "2 min ago",
      amount: "₹18,000",
      status: "paid",
      color: "bg-emerald-500",
    },
    {
      initials: "PP",
      name: "Priya Patel",
      time: "1 hour ago",
      amount: "₹22,500",
      status: "paid",
      color: "bg-violet-500",
    },
    {
      initials: "AK",
      name: "Amit Kumar",
      time: "3 hrs ago",
      amount: "₹15,000",
      status: "partial",
      color: "bg-amber-500",
    },
    {
      initials: "SR",
      name: "Sneha Reddy",
      time: "Overdue",
      amount: "₹20,000",
      status: "pending",
      color: "bg-rose-500",
    },
  ];

  const bars = [38, 55, 42, 70, 58, 82, 66, 91, 74, 88, 95, 78];
  const months = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Browser chrome */}
      <div className="rounded-2xl overflow-hidden border border-slate-700/60 shadow-[0_32px_80px_rgba(0,0,0,0.6)] bg-slate-900">
        {/* Title bar */}
        <div className="flex items-center gap-3 px-4 py-3 bg-slate-800/80 border-b border-slate-700/50">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-rose-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-400/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="flex items-center gap-2 bg-slate-700/60 rounded-lg px-4 py-1.5 text-xs font-mono text-slate-400">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
                />
              </svg>
              app.rentmaster.io/dashboard
            </div>
          </div>
        </div>

        {/* Dashboard body */}
        <div className="p-4 space-y-4 bg-slate-900">
          {/* Stat row */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Total Revenue", value: "₹2,45,000", delta: "+12.5%", color: "text-emerald-400" },
              { label: "Active Tenants", value: "24", delta: "+3", color: "text-emerald-400" },
              { label: "Properties", value: "8", delta: "", color: "" },
              { label: "Collection Rate", value: "94.2%", delta: "+2.1%", color: "text-emerald-400" },
            ].map((s, i) => (
              <div key={i} className="bg-slate-800/70 rounded-xl p-3 border border-slate-700/40">
                <p className="text-slate-400 text-[10px] font-mono mb-1">{s.label}</p>
                <p className="text-white text-sm font-semibold font-mono">{s.value}</p>
                {s.delta && <p className={`text-[10px] font-mono mt-0.5 ${s.color}`}>{s.delta}</p>}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-5 gap-3">
            {/* Chart */}
            <div className="col-span-3 bg-slate-800/70 rounded-xl p-3 border border-slate-700/40">
              <p className="text-slate-400 text-[10px] font-mono mb-3">Monthly Revenue</p>
              <div className="flex items-end gap-1 h-16">
                {bars.map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                    <div
                      className="w-full rounded-sm transition-all duration-700"
                      style={{
                        height: `${h}%`,
                        background: i === 11 ? "rgb(251 191 36)" : i >= 9 ? "rgb(99 102 241 / 0.7)" : "rgb(71 85 105)",
                        transitionDelay: `${i * 40}ms`,
                      }}
                    />
                    <span className="text-[7px] text-slate-600 font-mono">{months[i]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Payments */}
            <div className="col-span-2 bg-slate-800/70 rounded-xl p-3 border border-slate-700/40">
              <p className="text-slate-400 text-[10px] font-mono mb-2">Recent Payments</p>
              <div className="space-y-1.5">
                {payments.map((p, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-1.5 transition-all duration-500"
                    style={{ opacity: tick % 4 === i ? 1 : 0.7 }}
                  >
                    <div
                      className={`w-5 h-5 rounded-full ${p.color} flex items-center justify-center text-[7px] font-bold text-white flex-shrink-0`}
                    >
                      {p.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[8px] text-white font-mono truncate">{p.name}</p>
                      <p className="text-[7px] text-slate-500 font-mono">{p.time}</p>
                    </div>
                    <span
                      className={`text-[7px] font-mono font-bold px-1 py-0.5 rounded ${
                        p.status === "paid"
                          ? "text-emerald-400 bg-emerald-400/10"
                          : p.status === "partial"
                            ? "text-amber-400 bg-amber-400/10"
                            : "text-rose-400 bg-rose-400/10"
                      }`}
                    >
                      {p.amount}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating badges */}
      <Badge className="-top-4 -left-6 animate-float-slow">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-emerald-300">₹18,000 received</span>
      </Badge>
      <Badge className="-bottom-4 -right-4 animate-float-medium">
        <svg className="w-3 h-3 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Receipt generated</span>
      </Badge>
      <Badge className="top-1/3 -right-8 animate-float-fast">
        <svg className="w-3 h-3 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
        <span className="text-violet-300">Tenant linked</span>
      </Badge>
    </div>
  );
}

/* ── Receipt mockup ─────────────────────── */
function ReceiptMockup() {
  return (
    <div className="bg-white rounded-2xl shadow-[0_24px_60px_rgba(0,0,0,0.4)] p-5 w-72 border border-slate-200/20 transform rotate-1 hover:rotate-0 transition-transform duration-500">
      <div
        className="h-14 rounded-xl mb-4 flex items-center justify-between px-4"
        style={{ background: "linear-gradient(135deg, #1e1b4b, #4c1d95)" }}
      >
        <div>
          <p className="text-white text-xs font-semibold">RentMaster</p>
          <p className="text-purple-200 text-[10px]">Payment Receipt</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
      </div>
      <div className="space-y-2 mb-4">
        {[
          ["Tenant", "Rahul Sharma"],
          ["Month", "January 2026"],
          ["Property", "A-101, Sunrise Apt"],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between text-[11px]">
            <span className="text-slate-400">{k}</span>
            <span className="text-slate-800 font-medium">{v}</span>
          </div>
        ))}
      </div>
      <div className="border-t border-dashed border-slate-200 pt-3 mb-3 space-y-1.5">
        {[
          ["Rent", "₹15,000"],
          ["Water Charge", "₹800"],
          ["Electricity (180u)", "₹1,800"],
          ["Parking", "₹500"],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between text-[11px]">
            <span className="text-slate-500">{k}</span>
            <span className="text-slate-700">{v}</span>
          </div>
        ))}
      </div>
      <div className="bg-slate-50 rounded-xl p-3 flex justify-between items-center">
        <span className="text-xs font-semibold text-slate-600">Total</span>
        <span className="text-sm font-bold text-slate-900">₹18,100</span>
      </div>
      <div className="mt-3 flex gap-2">
        <button className="flex-1 text-[10px] font-semibold py-1.5 rounded-lg bg-violet-600 text-white">PDF</button>
        <button className="flex-1 text-[10px] font-semibold py-1.5 rounded-lg bg-emerald-600 text-white">
          WhatsApp
        </button>
        <button className="flex-1 text-[10px] font-semibold py-1.5 rounded-lg bg-slate-200 text-slate-700">PNG</button>
      </div>
    </div>
  );
}

/* ── Feature card variants ──────────────── */
function FeatureCard({
  icon,
  title,
  description,
  highlight,
  className = "",
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  highlight?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className={`group relative rounded-2xl border border-slate-700/50 bg-slate-900/60 backdrop-blur-sm p-6 overflow-hidden cursor-default transition-all duration-500 ${hovered ? "border-amber-500/30 shadow-[0_0_40px_rgba(251,191,36,0.06)]" : ""} ${className}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Gradient top bar */}
      <div
        className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent transition-opacity duration-500 ${hovered ? "opacity-100" : "opacity-0"}`}
      />
      {/* Glow */}
      <div
        className={`absolute -top-24 -right-24 w-48 h-48 rounded-full bg-amber-500/5 blur-3xl transition-opacity duration-700 ${hovered ? "opacity-100" : "opacity-0"}`}
      />

      <div className="relative z-10">
        <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700/60 flex items-center justify-center mb-4 group-hover:border-amber-500/40 transition-colors duration-300">
          {icon}
        </div>
        {highlight && (
          <span className="inline-block text-[10px] font-mono font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-full px-2 py-0.5 mb-3 uppercase tracking-wider">
            {highlight}
          </span>
        )}
        <h3 className="text-white font-semibold text-base mb-2 font-sans">{title}</h3>
        <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
        {children}
      </div>
    </div>
  );
}

/* ── Testimonial card ───────────────────── */
function TestimonialCard({
  quote,
  name,
  subtitle,
  initials,
  color,
  delay = 0,
}: {
  quote: string;
  name: string;
  subtitle: string;
  initials: string;
  color: string;
  delay?: number;
}) {
  const { ref, inView } = useInView(0.2);
  return (
    <div
      ref={ref}
      className="relative bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 transition-all duration-700"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(24px)",
        transitionDelay: `${delay}ms`,
      }}
    >
      <div className="absolute top-0 left-6 w-px h-4 bg-amber-500/50" />
      <svg className="w-6 h-6 text-amber-500/40 mb-3" fill="currentColor" viewBox="0 0 24 24">
        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
      </svg>
      <p className="text-slate-300 text-sm leading-relaxed mb-5">"{quote}"</p>
      <div className="flex items-center gap-3">
        <div
          className={`w-9 h-9 rounded-full ${color} flex items-center justify-center text-xs font-bold text-white flex-shrink-0`}
        >
          {initials}
        </div>
        <div>
          <p className="text-white text-sm font-semibold">{name}</p>
          <p className="text-slate-500 text-xs font-mono">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

/* ── Marquee row ────────────────────────── */
function Marquee({ items }: { items: string[] }) {
  return (
    <div className="overflow-hidden w-full" aria-hidden>
      <div className="flex gap-8 animate-marquee whitespace-nowrap">
        {[...items, ...items].map((item, i) => (
          <span key={i} className="text-sm font-mono text-slate-600 flex items-center gap-3">
            <span className="w-1 h-1 rounded-full bg-amber-500/50 inline-block" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── Pricing card ───────────────────────── */
function PricingCard({
  plan,
  price,
  period,
  features,
  highlighted,
  badge,
}: {
  plan: string;
  price: string;
  period: string;
  features: string[];
  highlighted?: boolean;
  badge?: string;
}) {
  return (
    <div
      className={`relative rounded-2xl p-6 border transition-all duration-300 hover:-translate-y-1 ${
        highlighted
          ? "bg-gradient-to-b from-amber-500/10 to-slate-900 border-amber-500/40 shadow-[0_0_60px_rgba(251,191,36,0.08)]"
          : "bg-slate-900/60 border-slate-700/50 hover:border-slate-600"
      }`}
    >
      {highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-amber-500 text-slate-900 text-[10px] font-bold font-mono px-3 py-1 rounded-full uppercase tracking-wider">
            {badge}
          </span>
        </div>
      )}
      <div className="mb-5">
        <h3 className="text-slate-400 text-sm font-mono mb-2 uppercase tracking-widest">{plan}</h3>
        <div className="flex items-baseline gap-1">
          <span className="text-white text-4xl font-bold font-mono">{price}</span>
          {period && <span className="text-slate-500 text-sm font-mono">{period}</span>}
        </div>
      </div>
      <ul className="space-y-2.5 mb-6">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm text-slate-400">
            <svg
              className={`w-4 h-4 mt-0.5 flex-shrink-0 ${highlighted ? "text-amber-400" : "text-emerald-500"}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            {f}
          </li>
        ))}
      </ul>
      <button
        className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
          highlighted
            ? "bg-amber-500 text-slate-900 hover:bg-amber-400 shadow-lg shadow-amber-500/20"
            : "bg-slate-800 text-white border border-slate-700 hover:bg-slate-700"
        }`}
      >
        Get Started
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════ */
export default function LandingPage() {
  const { isSignedIn } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };
    window.addEventListener("mousemove", fn);
    return () => window.removeEventListener("mousemove", fn);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Mono:ital,wght@0,400;0,500;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        :root {
          --bg: #080c14;
          --surface: #0f1623;
          --surface2: #141d2e;
          --border: rgba(255,255,255,0.07);
          --amber: #fbbf24;
          --amber-dim: rgba(251,191,36,0.12);
          --text: #f8fafc;
          --muted: #94a3b8;
        }

        * { box-sizing: border-box; }

        body {
          background: var(--bg);
          color: var(--text);
          font-family: 'Plus Jakarta Sans', sans-serif;
          overflow-x: hidden;
        }

        .font-serif  { font-family: 'Instrument Serif', serif; }
        .font-mono   { font-family: 'DM Mono', monospace; }
        .font-sans   { font-family: 'Plus Jakarta Sans', sans-serif; }

        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(-1deg); }
          50%       { transform: translateY(-10px) rotate(1deg); }
        }
        @keyframes float-medium {
          0%, 100% { transform: translateY(0px) rotate(1deg); }
          50%       { transform: translateY(-7px) rotate(-1deg); }
        }
        @keyframes float-fast {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-5px); }
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes shimmer {
          from { background-position: -200% 0; }
          to   { background-position: 200% 0; }
        }
        @keyframes orbit {
          from { transform: rotate(0deg) translateX(120px) rotate(0deg); }
          to   { transform: rotate(360deg) translateX(120px) rotate(-360deg); }
        }
        @keyframes orbit2 {
          from { transform: rotate(180deg) translateX(160px) rotate(-180deg); }
          to   { transform: rotate(540deg) translateX(160px) rotate(-540deg); }
        }

        .animate-float-slow   { animation: float-slow 5s ease-in-out infinite; }
        .animate-float-medium { animation: float-medium 4s ease-in-out infinite; }
        .animate-float-fast   { animation: float-fast 3.2s ease-in-out infinite; }
        .animate-marquee      { animation: marquee 28s linear infinite; }
        .animate-fade-up      { animation: fade-up 0.7s ease forwards; }
        .animate-fade-in      { animation: fade-in 1s ease forwards; }

        .hero-glow {
          background: radial-gradient(ellipse 60% 50% at 50% -10%, rgba(251,191,36,0.12) 0%, transparent 70%),
                      radial-gradient(ellipse 40% 40% at 80% 60%, rgba(99,102,241,0.08) 0%, transparent 60%);
        }

        .grid-pattern {
          background-image:
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 48px 48px;
        }

        .shimmer-text {
          background: linear-gradient(105deg, #fbbf24 0%, #f59e0b 30%, #fff8e7 50%, #f59e0b 70%, #fbbf24 100%);
          background-size: 200% 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s ease-in-out infinite;
        }

        .glass {
          background: rgba(15, 22, 35, 0.7);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }

        .card-hover {
          transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.4s ease;
        }
        .card-hover:hover {
          transform: translateY(-4px);
        }

        /* Stagger animations for hero elements */
        .stagger-1 { animation: fade-up 0.6s ease forwards 0.1s; opacity: 0; }
        .stagger-2 { animation: fade-up 0.6s ease forwards 0.25s; opacity: 0; }
        .stagger-3 { animation: fade-up 0.6s ease forwards 0.4s; opacity: 0; }
        .stagger-4 { animation: fade-up 0.6s ease forwards 0.55s; opacity: 0; }
        .stagger-5 { animation: fade-up 0.6s ease forwards 0.7s; opacity: 0; }
        .stagger-6 { animation: fade-up 0.6s ease forwards 0.85s; opacity: 0; }

        /* Orbit animations */
        .orbit-1 { animation: orbit 18s linear infinite; }
        .orbit-2 { animation: orbit2 24s linear infinite; }

        .noise-overlay::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
          opacity: 0.4;
          pointer-events: none;
          border-radius: inherit;
        }
      `}</style>

      <div className="min-h-screen" style={{ background: "var(--bg)" }}>
        {/* ══ NAVBAR ══ */}
        <nav
          className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "glass border-b border-white/5 shadow-lg shadow-black/20" : "bg-transparent"}`}
        >
          <div className="max-w-6xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-4 h-4 text-slate-900" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                </svg>
              </div>
              <span className="text-white font-semibold text-sm tracking-tight">RentMaster</span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-1">
              {["Features", "Dashboard", "Pricing", "Testimonials"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="text-sm text-slate-400 hover:text-white px-3.5 py-2 rounded-lg hover:bg-white/5 transition-all duration-200 font-medium"
                >
                  {item}
                </a>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-3">
              {isSignedIn ? (
                <>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-900 text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-200 shadow-lg shadow-amber-500/20 hover:shadow-amber-400/30 hover:scale-105"
                  >
                    Dashboard
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                  <UserButton />
                </>
              ) : (
                <>
                  <Link
                    href="/sign-in"
                    className="text-sm text-slate-400 hover:text-white transition-colors font-medium px-3 py-1.5"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/sign-up"
                    className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-900 text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-200 shadow-lg shadow-amber-500/20 hover:shadow-amber-400/30 hover:scale-105"
                  >
                    Get Started Free
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu btn */}
            <button
              className="md:hidden text-slate-400 hover:text-white p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

          {/* Mobile drawer */}
          {mobileMenuOpen && (
            <div className="md:hidden glass border-t border-white/5 px-5 py-4 space-y-1">
              {["Features", "Dashboard", "Pricing", "Testimonials"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-sm text-slate-300 hover:text-white py-2.5 px-3 rounded-lg hover:bg-white/5 transition-all"
                >
                  {item}
                </a>
              ))}
              <div className="pt-2 border-t border-white/5 flex flex-col gap-2">
                {isSignedIn ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="text-sm text-center bg-amber-500 text-slate-900 font-semibold py-2.5 rounded-xl"
                    >
                      Dashboard
                    </Link>
                    <div className="flex justify-center">
                      <UserButton />
                    </div>
                  </>
                ) : (
                  <>
                    <Link href="/sign-in" className="text-sm text-center text-slate-400 py-2.5">
                      Sign in
                    </Link>
                    <Link
                      href="/sign-up"
                      className="text-sm text-center bg-amber-500 text-slate-900 font-semibold py-2.5 rounded-xl"
                    >
                      Get Started Free
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </nav>

        {/* ══ HERO ══ */}
        <section
          ref={heroRef}
          className="relative min-h-screen flex flex-col items-center justify-center text-center px-5 pt-24 pb-16 overflow-hidden noise-overlay"
        >
          {/* Backgrounds */}
          <div className="absolute inset-0 hero-glow pointer-events-none" />
          <div className="absolute inset-0 grid-pattern pointer-events-none opacity-60" />

          {/* Mouse spotlight */}
          <div
            className="absolute pointer-events-none rounded-full blur-3xl opacity-10 w-96 h-96"
            style={{
              background: "radial-gradient(circle, rgba(251,191,36,0.5) 0%, transparent 70%)",
              left: mousePos.x - 192,
              top: mousePos.y - 192,
              transition: "left 0.1s ease-out, top 0.1s ease-out",
            }}
          />

          {/* Orbit decorations */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0 h-0 pointer-events-none hidden lg:block">
            <div className="orbit-1">
              <div className="w-2 h-2 rounded-full bg-amber-400/60 shadow-lg shadow-amber-400/40" />
            </div>
            <div className="orbit-2">
              <div className="w-1.5 h-1.5 rounded-full bg-violet-400/50" />
            </div>
          </div>

          {/* Trust badge */}
          <div className="stagger-1 inline-flex items-center gap-2.5 bg-slate-800/70 border border-slate-700/60 rounded-full px-4 py-2 mb-8 backdrop-blur-sm">
            <div className="flex -space-x-1.5">
              {["bg-amber-500", "bg-violet-500", "bg-emerald-500", "bg-rose-500"].map((c) => (
                <div key={c} className={`w-5 h-5 rounded-full ${c} border-2 border-slate-800`} />
              ))}
            </div>
            <span className="text-slate-300 text-xs font-mono">
              Trusted by <span className="text-amber-400 font-medium">500+</span> property managers
            </span>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          {/* Headline */}
          <h1 className="stagger-2 font-serif text-5xl md:text-7xl lg:text-[84px] text-white max-w-5xl leading-[1.04] tracking-tight mb-6">
            Manage Rentals
            <br />
            <span className="shimmer-text font-serif italic">Like a Pro</span>
          </h1>

          <p className="stagger-3 text-slate-400 text-lg md:text-xl max-w-xl leading-relaxed mb-10 font-sans">
            Track rent, electricity bills, partial payments, and receipts — all in one elegant dashboard. Built for
            landlords who mean business.
          </p>

          {/* CTAs */}
          <div className="stagger-4 flex flex-col sm:flex-row items-center gap-3 mb-12">
            <Link
              href={isSignedIn ? "/dashboard" : "/sign-up"}
              className="group flex items-center gap-2.5 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold px-7 py-3.5 rounded-2xl text-sm transition-all duration-300 shadow-xl shadow-amber-500/25 hover:shadow-amber-400/35 hover:scale-105"
            >
              {isSignedIn ? "Go to Dashboard" : "Start for Free"}
              <svg
                className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="#features"
              className="flex items-center gap-2 text-slate-300 hover:text-white text-sm font-medium px-5 py-3.5 rounded-2xl border border-slate-700/60 hover:border-slate-600 bg-slate-800/40 transition-all duration-300"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx={12} cy={12} r={10} />
                <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none" />
              </svg>
              See how it works
            </Link>
          </div>

          {/* Trust chips */}
          <div className="stagger-5 flex flex-wrap items-center justify-center gap-4 mb-16">
            {["No credit card", "Free forever tier", "Cancel anytime", "Indian Rupee native"].map((t) => (
              <span key={t} className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                <svg
                  className="w-3.5 h-3.5 text-emerald-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {t}
              </span>
            ))}
          </div>

          {/* Dashboard mockup */}
          <div className="stagger-6 w-full max-w-3xl mx-auto">
            <DashboardMockup />
          </div>
        </section>

        {/* ══ MARQUEE ══ */}
        <div className="border-y border-white/5 py-4 bg-slate-900/40 overflow-hidden">
          <Marquee
            items={[
              "Smart Billing",
              "Partial Payments",
              "Instant Receipts",
              "Tenant Portal",
              "PDF Export",
              "WhatsApp Share",
              "Meter Readings",
              "Custom Charges",
              "Payment Calendar",
              "Dashboard Analytics",
              "Clerk Auth",
              "Neon PostgreSQL",
            ]}
          />
        </div>

        {/* ══ STATS ══ */}
        <section className="py-20 px-5">
          <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            <Stat value={2500} suffix="+" label="Properties Managed" />
            <Stat value={8500} suffix="+" label="Tenants Tracked" />
            <Stat value={50000} suffix="+" label="Receipts Generated" />
            <Stat value={98} suffix="%" label="Happy Landlords" />
          </div>
        </section>

        {/* ══ FEATURES BENTO ══ */}
        <section id="features" className="py-24 px-5 md:px-8">
          <div className="max-w-6xl mx-auto">
            {/* Section label */}
            <div className="flex flex-col items-center text-center mb-16">
              <span className="text-[11px] font-mono font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-full px-3 py-1 mb-4 uppercase tracking-[0.15em]">
                All-in-One Platform
              </span>
              <h2 className="font-serif text-4xl md:text-5xl text-white leading-tight mb-4">
                Every tool you need,
                <br />
                <span className="italic text-slate-400">nothing you don't</span>
              </h2>
              <p className="text-slate-400 max-w-md text-base leading-relaxed">
                From bill generation to receipt export — RentMaster covers every step of your rental workflow.
              </p>
            </div>

            {/* Bento grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-auto">
              {/* Feature 1 — large */}
              <div className="lg:col-span-2 lg:row-span-1">
                <FeatureCard
                  icon={
                    <svg
                      className="w-5 h-5 text-amber-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  }
                  title="Smart Billing Engine"
                  description="Auto-calculate electricity from meter readings. Water, rent, custom charges, and carry-forward pending — all handled in one bill generation flow."
                  highlight="Core"
                  className="h-full"
                >
                  {/* Mini billing UI */}
                  <div className="mt-4 bg-slate-800/60 rounded-xl p-3 border border-slate-700/40">
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {[
                        ["Prev Unit", "1240"],
                        ["Curr Unit", "1420"],
                        ["Units Used", "180"],
                        ["Rate", "₹10/unit"],
                      ].map(([k, v]) => (
                        <div key={k} className="bg-slate-700/40 rounded-lg p-2">
                          <p className="text-slate-500 text-[9px] font-mono">{k}</p>
                          <p className="text-amber-400 text-sm font-mono font-medium">{v}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/20 rounded-lg p-2">
                      <span className="text-xs text-slate-300 font-mono">Electricity Bill</span>
                      <span className="text-amber-400 font-bold font-mono text-sm">₹1,800</span>
                    </div>
                  </div>
                </FeatureCard>
              </div>

              {/* Feature 2 — tall */}
              <div className="row-span-2">
                <FeatureCard
                  icon={
                    <svg
                      className="w-5 h-5 text-violet-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  }
                  title="Professional Receipts"
                  description="Generate beautiful receipts with gradient headers, amount-in-words, payment status, and a digital signature area."
                  className="h-full"
                >
                  <div className="mt-5 flex justify-center">
                    <ReceiptMockup />
                  </div>
                </FeatureCard>
              </div>

              {/* Feature 3 */}
              <FeatureCard
                icon={
                  <svg
                    className="w-5 h-5 text-emerald-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                }
                title="Partial Payments"
                description="Accept per-category partial payments. Track rent, water, electricity, and custom charges independently."
              >
                <div className="mt-4 space-y-2">
                  {[
                    ["Rent", 100, "text-emerald-400"],
                    ["Water", 75, "text-blue-400"],
                    ["Electricity", 50, "text-amber-400"],
                  ].map(([label, pct, color]) => (
                    <div key={label as string}>
                      <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
                        <span>{label as string}</span>
                        <span>{pct}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${(color as string).replace("text-", "bg-")} transition-all duration-1000`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </FeatureCard>

              {/* Feature 4 */}
              <FeatureCard
                icon={
                  <svg
                    className="w-5 h-5 text-sky-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                }
                title="Tenant Portal"
                description="Two-way verification: landlord adds tenant, tenant self-links. Both confirm. Tenants get a dedicated bills & receipts portal."
              >
                <div className="mt-4 flex gap-2">
                  {[
                    ["Landlord ✓", "bg-emerald-500/20 border-emerald-500/30 text-emerald-300"],
                    ["Tenant ✓", "bg-sky-500/20 border-sky-500/30 text-sky-300"],
                  ].map(([label, cls]) => (
                    <div
                      key={label as string}
                      className={`flex-1 text-center text-[10px] font-mono font-bold py-2 rounded-lg border ${cls}`}
                    >
                      {label as string}
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-center text-[10px] font-mono text-emerald-400 bg-emerald-500/10 rounded-lg py-2 border border-emerald-500/20">
                  🔓 Portal Active
                </div>
              </FeatureCard>

              {/* Feature 5 — full width */}
              <div className="lg:col-span-2">
                <FeatureCard
                  icon={
                    <svg
                      className="w-5 h-5 text-rose-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  }
                  title="Payment Calendar"
                  description="Visual monthly payment calendar with green/amber/red indicators. Spot overdue tenants at a glance."
                  className="h-full"
                >
                  {/* Mini calendar */}
                  <div className="mt-4 grid grid-cols-7 gap-1">
                    {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                      <div key={i} className="text-center text-[8px] font-mono text-slate-500 pb-1">
                        {d}
                      </div>
                    ))}
                    {Array.from({ length: 35 }, (_, i) => {
                      const day = i - 2;
                      const status =
                        day <= 0
                          ? "empty"
                          : day <= 5
                            ? "paid"
                            : day <= 8
                              ? "partial"
                              : day <= 12
                                ? "pending"
                                : day <= 25
                                  ? "paid"
                                  : "empty";
                      return (
                        <div
                          key={i}
                          className={`aspect-square rounded-md flex items-center justify-center text-[9px] font-mono transition-transform hover:scale-110 cursor-default ${
                            status === "empty"
                              ? "text-transparent"
                              : status === "paid"
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20"
                                : status === "partial"
                                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/20"
                                  : "bg-rose-500/20 text-rose-400 border border-rose-500/20"
                          }`}
                        >
                          {day > 0 && day <= 28 ? day : ""}
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-3 flex gap-4">
                    {[
                      ["Paid", "bg-emerald-500"],
                      ["Partial", "bg-amber-500"],
                      ["Pending", "bg-rose-500"],
                    ].map(([label, color]) => (
                      <div
                        key={label as string}
                        className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono"
                      >
                        <div className={`w-2 h-2 rounded-sm ${color as string}`} />
                        {label as string}
                      </div>
                    ))}
                  </div>
                </FeatureCard>
              </div>

              {/* Feature 6 */}
              <FeatureCard
                icon={
                  <svg
                    className="w-5 h-5 text-amber-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                    />
                  </svg>
                }
                title="Dashboard Analytics"
                description="Revenue trends, collection rates, and category breakdowns — beautifully visualized."
              >
                <div className="mt-4 flex items-end gap-1 h-14">
                  {[30, 55, 42, 70, 58, 85, 72].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-sm transition-all duration-700"
                      style={{
                        height: `${h}%`,
                        background: i === 6 ? "#fbbf24" : `hsl(${220 + i * 8}, 70%, ${35 + h * 0.2}%)`,
                        opacity: 0.7 + i * 0.04,
                      }}
                    />
                  ))}
                </div>
              </FeatureCard>
            </div>
          </div>
        </section>

        {/* ══ DASHBOARD SHOWCASE ══ */}
        <section id="dashboard" className="py-24 px-5 md:px-8 relative overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              background: "radial-gradient(ellipse 80% 50% at 50% 50%, rgba(99,102,241,0.05) 0%, transparent 70%)",
            }}
          />
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <span className="text-[11px] font-mono font-bold text-violet-400 bg-violet-400/10 border border-violet-400/20 rounded-full px-3 py-1 mb-5 inline-block uppercase tracking-[0.15em]">
                  Powerful Dashboard
                </span>
                <h2 className="font-serif text-4xl md:text-5xl text-white leading-tight mb-6">
                  Everything at
                  <br />
                  <span className="italic">Your Fingertips</span>
                </h2>
                <p className="text-slate-400 leading-relaxed mb-8">
                  A clean, intuitive dashboard built for landlords managing multiple properties. Real-time data,
                  beautiful charts, instant actions.
                </p>
                <div className="space-y-4">
                  {[
                    { icon: "📊", title: "Revenue Overview", desc: "Monthly trends with category breakdowns" },
                    { icon: "👥", title: "Tenant Management", desc: "Add, edit, link tenants with one click" },
                    { icon: "💳", title: "Payment Tracking", desc: "Per-category payment status in real time" },
                    { icon: "📄", title: "Receipt History", desc: "All receipts searchable and exportable" },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-3.5 rounded-xl hover:bg-slate-800/40 transition-colors group cursor-default"
                    >
                      <span className="text-xl mt-0.5 flex-shrink-0">{item.icon}</span>
                      <div>
                        <p className="text-white text-sm font-semibold mb-0.5 group-hover:text-amber-400 transition-colors">
                          {item.title}
                        </p>
                        <p className="text-slate-500 text-xs">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <DashboardMockup />
              </div>
            </div>
          </div>
        </section>

        {/* ══ PRICING ══ */}
        <section id="pricing" className="py-24 px-5 md:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-full px-3 py-1 mb-4 inline-block uppercase tracking-[0.15em]">
                Simple Pricing
              </span>
              <h2 className="font-serif text-4xl md:text-5xl text-white leading-tight mb-4">
                Start free,
                <span className="italic text-slate-400"> scale when ready</span>
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-5">
              <PricingCard
                plan="Starter"
                price="Free"
                period=""
                features={["Up to 3 tenants", "Bill generation", "Basic receipts", "Tenant portal", "Email support"]}
              />
              <PricingCard
                plan="Pro"
                price="₹499"
                period="/month"
                highlighted
                badge="Most Popular"
                features={[
                  "Unlimited tenants",
                  "Custom charges",
                  "PDF/PNG export",
                  "WhatsApp sharing",
                  "Payment calendar",
                  "Analytics dashboard",
                  "Priority support",
                ]}
              />
              <PricingCard
                plan="Business"
                price="₹999"
                period="/month"
                features={[
                  "Everything in Pro",
                  "Multiple properties",
                  "Team members",
                  "API access",
                  "Custom branding",
                  "Dedicated support",
                  "SLA guarantee",
                ]}
              />
            </div>
          </div>
        </section>

        {/* ══ TESTIMONIALS ══ */}
        <section id="testimonials" className="py-24 px-5 md:px-8 relative overflow-hidden">
          <div className="absolute inset-0 grid-pattern opacity-30 pointer-events-none" />
          <div className="max-w-6xl mx-auto relative">
            <div className="text-center mb-14">
              <span className="text-[11px] font-mono font-bold text-rose-400 bg-rose-400/10 border border-rose-400/20 rounded-full px-3 py-1 mb-4 inline-block uppercase tracking-[0.15em]">
                Testimonials
              </span>
              <h2 className="font-serif text-4xl md:text-5xl text-white leading-tight">
                Loved by landlords
                <br />
                <span className="italic text-slate-400">across India</span>
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-5">
              <TestimonialCard
                quote="RentMaster has completely transformed how I manage my 12 properties. The partial payment tracking and auto-generated receipts save me hours every month."
                name="Vikram Mehta"
                subtitle="Landlord · 12 properties"
                initials="VM"
                color="bg-amber-500"
                delay={0}
              />
              <TestimonialCard
                quote="The tenant portal is a game-changer. My tenants love being able to view their bills and download receipts anytime. No more WhatsApp requests for payment details!"
                name="Ananya Gupta"
                subtitle="Property Manager · Mumbai"
                initials="AG"
                color="bg-violet-500"
                delay={120}
              />
              <TestimonialCard
                quote="I was managing everything on spreadsheets. RentMaster made it effortless — billing, receipts, payment tracking. Worth every penny for the peace of mind."
                name="Rajesh Khanna"
                subtitle="Landlord · 8 properties"
                initials="RK"
                color="bg-emerald-500"
                delay={240}
              />
            </div>

            {/* Review stars */}
            <div className="mt-12 flex flex-col items-center gap-3">
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
              <p className="text-slate-400 text-sm font-mono">4.9/5 from 200+ reviews</p>
            </div>
          </div>
        </section>

        {/* ══ CTA ══ */}
        <section className="py-24 px-5 md:px-8">
          <div className="max-w-3xl mx-auto">
            <div
              className="relative rounded-3xl p-10 md:p-16 text-center overflow-hidden border border-amber-500/20 noise-overlay"
              style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #0f172a 50%, #1a0a00 100%)" }}
            >
              {/* Glow */}
              <div
                className="absolute inset-0 opacity-60 pointer-events-none"
                style={{
                  background: "radial-gradient(ellipse 70% 60% at 50% -10%, rgba(251,191,36,0.2) 0%, transparent 70%)",
                }}
              />
              <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />

              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-1.5 mb-6">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-amber-400 text-xs font-mono font-bold uppercase tracking-wider">
                    Ready to start?
                  </span>
                </div>

                <h2 className="font-serif text-4xl md:text-5xl text-white leading-tight mb-5">
                  Simplify your
                  <br />
                  <span className="shimmer-text italic font-serif">property management</span>
                </h2>
                <p className="text-slate-400 text-lg mb-10 leading-relaxed">
                  Join thousands of landlords who trust RentMaster. Start free — no credit card required.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link
                    href={isSignedIn ? "/dashboard" : "/sign-up"}
                    className="group flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold px-8 py-4 rounded-2xl text-sm transition-all duration-300 shadow-2xl shadow-amber-500/30 hover:scale-105"
                  >
                    {isSignedIn ? "Go to Dashboard" : "Get Started Free"}
                    <svg
                      className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                  {!isSignedIn && (
                    <Link
                      href="/dashboard"
                      className="text-slate-300 hover:text-white text-sm font-medium px-6 py-4 rounded-2xl border border-slate-700/60 hover:border-slate-500 transition-all bg-slate-800/40"
                    >
                      View Dashboard →
                    </Link>
                  )}
                </div>

                <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
                  {["Secure & private", "Lightning fast", "Priority support"].map((t) => (
                    <span key={t} className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                      <svg
                        className="w-3.5 h-3.5 text-emerald-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══ FOOTER ══ */}
        <footer className="border-t border-white/5 pt-16 pb-8 px-5 md:px-8 bg-slate-900/20">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-16">
              {/* Brand */}
              <div className="col-span-2">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                    <svg className="w-4 h-4 text-slate-900" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                    </svg>
                  </div>
                  <span className="text-white font-semibold">RentMaster</span>
                </div>
                <p className="text-slate-500 text-sm leading-relaxed max-w-xs mb-5">
                  The all-in-one rental property management platform for landlords and property managers.
                </p>
                <div className="flex gap-3">
                  {[
                    {
                      label: "Twitter",
                      path: "M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z",
                    },
                    {
                      label: "GitHub",
                      path: "M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22",
                    },
                    {
                      label: "LinkedIn",
                      path: "M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z M4 6a2 2 0 100-4 2 2 0 000 4z",
                    },
                  ].map((s) => (
                    <a
                      key={s.label}
                      href="#"
                      className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700/60 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-600 transition-all"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.8}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d={s.path} />
                      </svg>
                    </a>
                  ))}
                </div>
              </div>

              {/* Links */}
              {[
                { title: "Product", links: ["Features", "Pricing", "FAQ", "Changelog"] },
                { title: "Company", links: ["About", "Blog", "Careers", "Contact"] },
                { title: "Legal", links: ["Privacy", "Terms", "Security", "Cookies"] },
              ].map((col) => (
                <div key={col.title}>
                  <h4 className="text-white text-xs font-mono font-bold uppercase tracking-widest mb-4">{col.title}</h4>
                  <ul className="space-y-2.5">
                    {col.links.map((link) => (
                      <li key={link}>
                        <a href="#" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Bottom bar */}
            <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-slate-600 text-xs font-mono">© 2026 RentMaster. All rights reserved.</p>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-slate-600 text-xs font-mono">All systems operational</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
