import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

const steps = [
  {
    title: "Create Contract",
    description: "Define scope, milestones, and payout rules in minutes.",
    icon: "🧾",
  },
  {
    title: "Fund Escrow",
    description: "Deposit securely; funds stay locked until milestones clear.",
    icon: "💰",
  },
  {
    title: "Release Payment",
    description:
      "Approve deliverables or trigger dispute resolution if needed.",
    icon: "✅",
  },
];

const trustPillars = [
  {
    title: "Reputation System",
    body: "Transparent trust scores that follow each participant across contracts.",
  },
  {
    title: "Admin Moderation",
    body: "Human review for escalations, fraud detection, and appeals.",
  },
  {
    title: "Dispute Handling",
    body: "Evidence-first workflows with structured timelines and outcomes.",
  },
  {
    title: "Secure Escrow",
    body: "Non-custodial flow with clear audit trails on every release.",
  },
];

const features = [
  "Direct Freelancer Invite",
  "Contract Editing Before Funding",
  "Escrow Vault Tracking",
  "Trust Score Badge",
  "Transparent Reputation Timeline",
  "Report & Governance",
];

const stats = [
  { label: "Contracts Completed", value: 120, suffix: "+", decimals: 0 },
  { label: "Payment Success", value: 98, suffix: "%", decimals: 0 },
  { label: "Avg Trust Score", value: 4.8, suffix: "", decimals: 1 },
];

const nodePositions = [
  { top: "12%", left: "18%", delay: "0s" },
  { top: "28%", left: "72%", delay: "0.6s" },
  { top: "52%", left: "10%", delay: "1.2s" },
  { top: "64%", left: "82%", delay: "0.9s" },
  { top: "78%", left: "48%", delay: "1.5s" },
];

const timeline = [
  { text: "Milestone 1 released · Admin reviewed", color: "bg-emerald-400" },
  { text: "Reputation updated · +0.2 trust", color: "bg-cyan-400" },
  { text: "Report resolved · No penalties", color: "bg-amber-300" },
];

const sections = ["explore", "how-it-works", "trust", "features", "cta"];

function useCountUp(target, duration = 1200, decimals = 0) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let raf;
    let start;

    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = target * eased;
      const formatted = decimals
        ? Number(next.toFixed(decimals))
        : Math.round(next);
      setValue(formatted);
      if (progress < 1) {
        raf = requestAnimationFrame(step);
      }
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, decimals]);

  return value;
}

function useCountdown(targetMs) {
  const [remaining, setRemaining] = useState(targetMs - Date.now());

  useEffect(() => {
    const id = setInterval(() => {
      setRemaining(targetMs - Date.now());
    }, 1000);
    return () => clearInterval(id);
  }, [targetMs]);

  const safe = Math.max(0, remaining);
  const days = Math.floor(safe / 86400000);
  const hours = Math.floor((safe % 86400000) / 3600000);
  const minutes = Math.floor((safe % 3600000) / 60000);
  return `${days}d ${hours}h ${minutes}m`;
}

function Landing() {
  const { user, loading } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("explore");
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [mobileOpen, setMobileOpen] = useState(false);

  const dueAt = useMemo(
    () => Date.now() + (2 * 24 + 5) * 3600000 + 12 * 60000,
    [],
  );
  const countdown = useCountdown(dueAt);
  const countContracts = useCountUp(120, 1400, 0);
  const countPayment = useCountUp(98, 1400, 0);
  const countTrust = useCountUp(4.8, 1400, 1);
  const counters = [countContracts, countPayment, countTrust];

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 20);

      let current = sections[0];
      sections.forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        const top = el.getBoundingClientRect().top;
        if (top <= 120) {
          current = id;
        }
      });
      setActiveSection(current);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [mobileOpen]);

  if (loading) return null;

  if (user) {
    const dashboardPath = `/${user.role.toLowerCase()}/dashboard`;
    return <Navigate to={dashboardPath} replace />;
  }

  const navLinkBase =
    "relative px-2 py-1 text-sm transition-colors hover:text-cyan-100";

  return (
    <div
      className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100 blockchain-hero"
      onMouseMove={(e) => {
        const { clientX, clientY } = e;
        const x = (clientX / window.innerWidth) * 100;
        const y = (clientY / window.innerHeight) * 100;
        setMousePos({ x, y });
      }}
    >
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(34,211,238,0.08),transparent_35%),radial-gradient(circle_at_85%_30%,rgba(59,130,246,0.08),transparent_30%),radial-gradient(circle_at_30%_80%,rgba(16,185,129,0.08),transparent_28%)]"
        aria-hidden
      />
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ duration: 1.2 }}
        style={{
          background:
            "radial-gradient(circle at 20% 30%, rgba(56,189,248,0.12), transparent 45%), radial-gradient(circle at 80% 70%, rgba(59,130,246,0.12), transparent 50%)",
        }}
      />
      <div className="mouse-glow">
        <div
          style={{
            position: "absolute",
            top: `${mousePos.y}%`,
            left: `${mousePos.x}%`,
            transform: "translate(-50%, -50%)",
            width: 260,
            height: 260,
            borderRadius: "9999px",
            background:
              "radial-gradient(circle, rgba(59,130,246,0.18), transparent 60%)",
            filter: "blur(26px)",
            transition: "top 0.2s ease, left 0.2s ease",
          }}
          aria-hidden
        />
      </div>
      <motion.div
        className="absolute left-10 top-24 h-40 w-40 rounded-full bg-cyan-500/20 blur-3xl"
        animate={{ y: [0, -20, 0], opacity: [0.6, 0.9, 0.6] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      />
      <motion.div
        className="absolute right-16 bottom-24 h-48 w-48 rounded-full bg-blue-600/20 blur-3xl"
        animate={{ y: [0, 24, 0], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      />
      {nodePositions.map((pos, idx) => (
        <span
          key={idx}
          className="node-dot"
          style={{ top: pos.top, left: pos.left, animationDelay: pos.delay }}
          aria-hidden
        />
      ))}

      <div className="relative z-10">
        <header
          className={`sticky top-0 z-40 border-b transition-all duration-300 ${
            scrolled
              ? "border-slate-800/80 bg-slate-950/80 backdrop-blur-xl shadow-lg shadow-black/30"
              : "border-transparent bg-transparent"
          }`}
        >
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-base font-bold shadow-lg shadow-cyan-500/40">
                CT
              </div>
              <div className="leading-tight">
                <p className="text-sm font-semibold text-slate-100">
                  ChainTrust
                </p>
                <p className="text-xs text-slate-400">Escrow for Freelancing</p>
              </div>
            </div>
            <nav className="hidden items-center gap-6 text-sm text-slate-200 md:flex">
              {sections.slice(0, 4).map((id) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className={`${navLinkBase} ${
                    activeSection === id ? "text-cyan-100" : "text-slate-200"
                  }`}
                >
                  <span className="capitalize">{id.replace(/-/g, " ")}</span>
                  <AnimatePresence>
                    {activeSection === id && (
                      <motion.span
                        layoutId="nav-underline"
                        className="absolute left-0 right-0 -bottom-1 h-0.5 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
                        initial={{ opacity: 0, scaleX: 0 }}
                        animate={{ opacity: 1, scaleX: 1 }}
                        exit={{ opacity: 0, scaleX: 0 }}
                        transition={{ duration: 0.2 }}
                      />
                    )}
                  </AnimatePresence>
                </a>
              ))}
            </nav>
            <div className="flex items-center gap-2">
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Link
                  to="/login"
                  className="hidden rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm text-slate-200 transition-colors hover:border-cyan-400/80 hover:text-cyan-100 sm:inline-flex"
                >
                  Login
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
              >
                <Link
                  to="/register"
                  className="inline-flex items-center rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-lg shadow-cyan-500/30 transition hover:shadow-cyan-500/60"
                >
                  Register
                </Link>
              </motion.div>
              <button
                type="button"
                className="md:hidden rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-100"
                onClick={() => setMobileOpen(true)}
                aria-label="Open navigation"
              >
                Menu
              </button>
            </div>
          </div>
        </header>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            >
              <motion.div
                className="absolute right-0 top-0 h-full w-72 max-w-full bg-slate-950 border-l border-slate-800 px-5 py-6 shadow-2xl shadow-black/40"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", stiffness: 260, damping: 28 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-sm font-bold text-white">
                      CT
                    </div>
                    <span className="text-sm font-semibold text-slate-100">
                      ChainTrust
                    </span>
                  </div>
                  <button
                    type="button"
                    className="rounded-lg border border-slate-800 px-3 py-1 text-sm text-slate-200"
                    onClick={() => setMobileOpen(false)}
                  >
                    Close
                  </button>
                </div>
                <div className="mt-6 space-y-3">
                  {sections.map((id) => (
                    <a
                      key={id}
                      href={`#${id}`}
                      className="block rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm font-semibold capitalize text-slate-100 hover:border-cyan-400/60 hover:text-cyan-100"
                      onClick={() => setMobileOpen(false)}
                    >
                      {id.replace(/-/g, " ")}
                    </a>
                  ))}
                </div>
                <div className="mt-6 flex gap-3">
                  <Link
                    to="/login"
                    className="flex-1 rounded-lg border border-slate-800 bg-slate-900/70 px-4 py-2 text-center text-sm font-semibold text-slate-100 hover:border-cyan-400/70 hover:text-cyan-100"
                    onClick={() => setMobileOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="flex-1 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-center text-sm font-semibold text-white shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/60"
                    onClick={() => setMobileOpen(false)}
                  >
                    Register
                  </Link>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.section
            id="explore"
            className="relative flex flex-col gap-12 pb-16 pt-16 lg:flex-row lg:items-center lg:pt-20"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div className="flex-1 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-200">
                Secure escrow, reputation-first
              </div>
              <div className="space-y-4">
                <motion.h1
                  className="text-3xl font-bold leading-tight text-slate-50 sm:text-4xl lg:text-5xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.6 }}
                >
                  Secure Freelancing with Built-in Escrow & Trust
                </motion.h1>
                <motion.p
                  className="max-w-2xl text-base text-slate-300 sm:text-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                >
                  Invite freelancers, fund securely, and release payments with
                  confidence. Transparent reputation, dispute workflows, and an
                  escrow vault you can actually see.
                </motion.p>
              </div>
              <motion.div
                className="flex flex-wrap items-center gap-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/30 transition hover:shadow-cyan-500/60"
                  >
                    Get Started
                    <span aria-hidden>→</span>
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <a
                    href="#how-it-works"
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/60 px-4 py-2.5 text-sm font-semibold text-slate-100 transition hover:border-cyan-400/70 hover:text-cyan-100"
                  >
                    Explore Flow
                  </a>
                </motion.div>
              </motion.div>
              <motion.div
                className="grid max-w-xl grid-cols-3 gap-3 sm:gap-4"
                initial="hidden"
                animate="visible"
                variants={{
                  visible: {
                    transition: { staggerChildren: 0.12 },
                  },
                }}
              >
                {stats.map((item, idx) => (
                  <motion.div
                    key={item.label}
                    className="rounded-xl border border-slate-800 bg-slate-900/50 p-3 text-center shadow-lg shadow-black/20"
                    variants={{
                      hidden: { opacity: 0, y: 16 },
                      visible: { opacity: 1, y: 0 },
                    }}
                  >
                    <div className="text-lg font-semibold text-cyan-200 sm:text-xl">
                      {counters[idx]}
                      {item.suffix}
                    </div>
                    <div className="text-xs text-slate-400 sm:text-sm">
                      {item.label}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
              <motion.div
                className="flex items-center gap-2 text-sm text-cyan-100"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.5 }}
              >
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span>Created → Funded → Submitted → Paid</span>
              </motion.div>
            </div>

            <div className="flex-1">
              <motion.div
                className="relative"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                <div
                  className="absolute -inset-6 -z-10 rounded-3xl bg-gradient-to-br from-cyan-500/20 via-blue-600/10 to-emerald-500/10 blur-3xl"
                  aria-hidden
                />
                <div className="rounded-3xl border border-slate-800/80 bg-slate-900/80 p-5 shadow-2xl shadow-black/50 backdrop-blur">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-400">
                        Escrow Vault
                      </p>
                      <p className="text-lg font-semibold text-slate-50">
                        Project Alpha
                      </p>
                    </div>
                    <span className="shimmer rounded-full border border-emerald-400/30 bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-200 animate-pulse">
                      Funded
                    </span>
                  </div>
                  <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                    <div className="mb-3 flex items-center justify-between text-sm">
                      <span className="text-slate-300">Vault Balance</span>
                      <span className="font-semibold text-cyan-200">
                        12.5 ETH
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-600"
                        initial={{ width: 0 }}
                        animate={{ width: "80%" }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                      />
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-slate-300">
                      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
                        <p className="text-slate-400">Next Release</p>
                        <p className="text-sm font-semibold text-slate-50">
                          Milestone 2
                        </p>
                        <p className="text-emerald-300">Due in {countdown}</p>
                      </div>
                      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 shimmer">
                        <p className="text-slate-400">Trust Score</p>
                        <p className="text-sm font-semibold text-slate-50">
                          4.8 / 5
                        </p>
                        <p className="text-cyan-300">Verified reputation</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                    <div className="flex items-center justify-between text-sm text-slate-300">
                      <span>Governance Timeline</span>
                      <span className="text-cyan-200">3 updates</span>
                    </div>
                    <div className="mt-3 space-y-2 text-xs text-slate-300">
                      {timeline.map((item, idx) => (
                        <motion.div
                          key={item.text}
                          className="flex items-center gap-2"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            delay: 0.2 + idx * 0.15,
                            duration: 0.35,
                          }}
                        >
                          <span
                            className={`h-2 w-2 rounded-full ${item.color}`}
                          />
                          <span>{item.text}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.section>

          <motion.section
            id="how-it-works"
            className="py-16"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-8 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-cyan-200">
                  Platform Flow
                </p>
                <h2 className="text-2xl font-bold text-slate-50 sm:text-3xl">
                  How It Works
                </h2>
              </div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  to="/register"
                  className="hidden items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm font-semibold text-slate-100 transition hover:border-cyan-400/70 hover:text-cyan-100 sm:inline-flex"
                >
                  Start a Contract
                </Link>
              </motion.div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {steps.map((step, idx) => (
                <motion.div
                  key={step.title}
                  className="group rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg shadow-black/30 transition hover:-translate-y-1 hover:border-cyan-400/50 hover:shadow-cyan-500/20"
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ delay: idx * 0.08, duration: 0.45 }}
                >
                  <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/15 text-lg">
                    {step.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-slate-50">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-300">
                    {step.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          <motion.section
            id="trust"
            className="grid gap-10 py-16 lg:grid-cols-2 lg:items-start"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5 }}
          >
            <div className="space-y-4">
              <p className="text-sm font-semibold text-cyan-200">
                Trust & Governance
              </p>
              <h2 className="text-2xl font-bold text-slate-50 sm:text-3xl">
                Reputation, moderation, and transparent dispute handling.
              </h2>
              <p className="text-base text-slate-300">
                Every contract runs with guardrails: verified reputation, admin
                oversight when needed, and auditable escrow releases. Signals
                stay visible so good actors keep winning work.
              </p>
              <div className="flex flex-wrap gap-3">
                <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                  Verified Identity Optional
                </span>
                <span className="rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-100">
                  Dispute SLAs
                </span>
                <span className="rounded-full border border-cyan-400/40 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-100">
                  Public Reputation Trail
                </span>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {trustPillars.map((item, idx) => (
                <motion.div
                  key={item.title}
                  className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg shadow-black/25 transition hover:-translate-y-1 hover:border-cyan-400/50"
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ delay: idx * 0.05, duration: 0.4 }}
                >
                  <h3 className="text-lg font-semibold text-slate-50">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-300">{item.body}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          <motion.section
            id="features"
            className="py-16"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-8 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-cyan-200">
                  Product Highlights
                </p>
                <h2 className="text-2xl font-bold text-slate-50 sm:text-3xl">
                  Designed for confident delivery
                </h2>
              </div>
              <motion.a
                href="#cta"
                className="hidden rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm font-semibold text-slate-100 transition hover:border-cyan-400/70 hover:text-cyan-100 sm:inline-flex"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                View Pricing
              </motion.a>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, idx) => (
                <motion.div
                  key={feature}
                  className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-lg shadow-black/25 transition hover:-translate-y-1 hover:border-cyan-400/50 hover:shadow-cyan-500/15"
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ delay: idx * 0.05, duration: 0.4 }}
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500/15 text-sm text-cyan-200">
                      ●
                    </span>
                    <p className="text-base font-semibold text-slate-50">
                      {feature}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          <motion.section
            id="cta"
            className="pb-20"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 p-8 shadow-2xl shadow-black/40">
              <div
                className="absolute inset-0 bg-gradient-to-r from-cyan-500/15 via-blue-600/10 to-emerald-500/10"
                aria-hidden
              />
              <div className="relative flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-slate-50 sm:text-3xl">
                    Build with Trust. Get Paid Securely.
                  </h3>
                  <p className="text-base text-slate-200">
                    Launch your next contract with escrow, reputation, and
                    governance baked in.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <motion.div
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Link
                      to="/register"
                      className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/30 transition hover:shadow-cyan-500/60"
                    >
                      Create Account
                    </Link>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      to="/login"
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/60 px-5 py-2.5 text-sm font-semibold text-slate-100 transition hover:border-cyan-400/70 hover:text-cyan-100"
                    >
                      Login
                    </Link>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.section>
        </main>

        <footer className="border-t border-slate-800/70 bg-slate-950/90 py-6">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 text-sm text-slate-400 sm:flex-row">
            <div className="flex items-center gap-4">
              <a
                href="#explore"
                className="transition-colors hover:text-cyan-200"
              >
                Terms
              </a>
              <a
                href="#explore"
                className="transition-colors hover:text-cyan-200"
              >
                Privacy
              </a>
              <a href="#cta" className="transition-colors hover:text-cyan-200">
                Contact
              </a>
            </div>
            <p className="text-slate-500">
              © 2026 ChainTrust. Built for secure work.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default Landing;
