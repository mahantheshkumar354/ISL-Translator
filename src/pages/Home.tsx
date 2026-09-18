import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiCamera,
  FiType,
  FiMic,
  FiBookOpen,
  FiArrowRight,
  FiActivity,
  FiClock,
  FiSettings,
  FiZap,
  FiCheckCircle,
  FiChevronRight,
  FiShield,
  FiCpu,
  FiLayers,
} from "react-icons/fi";

const translationModes = [
  {
    title: "Sign to Text",
    description:
      "Use your camera to recognize Indian Sign Language gestures and convert them into text in real time.",
    action: "Start Translation",
    path: "/sign-to-text",
    icon: FiCamera,
    accent: "cyan",
    number: "01",
  },
  {
    title: "Text to Sign",
    description:
      "Enter written text and transform it into a sequence of Indian Sign Language gestures.",
    action: "Translate Text",
    path: "/text-to-sign",
    icon: FiType,
    accent: "blue",
    number: "02",
  },
  {
    title: "Speech to Sign",
    description:
      "Speak naturally and watch your speech become Indian Sign Language animations.",
    action: "Start Speaking",
    path: "/speech-to-sign",
    icon: FiMic,
    accent: "emerald",
    number: "03",
  },
  {
    title: "Learning Hub",
    description:
      "Explore ISL alphabets, numbers, greetings, family signs, emergency signs and everyday communication.",
    action: "Explore Learning",
    path: "/learning-hub",
    icon: FiBookOpen,
    accent: "violet",
    number: "04",
  },
];

const workflow = [
  {
    icon: FiCamera,
    title: "Capture",
    description: "Camera or microphone captures your communication.",
  },
  {
    icon: FiCpu,
    title: "Process",
    description: "AI processes gestures, speech and language patterns.",
  },
  {
    icon: FiLayers,
    title: "Translate",
    description: "The system converts input into the required format.",
  },
  {
    icon: FiCheckCircle,
    title: "Communicate",
    description: "Receive a clear text, speech or ISL result.",
  },
];

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      {/* =========================================================
          AMBIENT BACKGROUND
      ========================================================= */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[28rem] w-[28rem] rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="absolute right-[-10rem] top-[10%] h-[32rem] w-[32rem] rounded-full bg-blue-500/10 blur-3xl" />

        <div className="absolute bottom-[-12rem] left-[30%] h-[32rem] w-[32rem] rounded-full bg-violet-500/10 blur-3xl" />

        <div className="absolute left-1/2 top-1/2 h-[24rem] w-[24rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/[0.025] blur-3xl" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.04),transparent_40%)]" />
      </div>

      <div className="relative z-10 space-y-10">
        {/* =========================================================
            HERO
        ========================================================= */}

        <motion.section
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-7 shadow-2xl backdrop-blur-xl md:p-10 lg:p-12"
        >
          {/* Hero glow */}
          <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-32 right-1/4 h-80 w-80 rounded-full bg-violet-500/10 blur-3xl" />

          {/* Decorative grid */}
          <div className="pointer-events-none absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(255,255,255,.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.5)_1px,transparent_1px)] [background-size:40px_40px]" />

          <div className="relative grid items-center gap-10 lg:grid-cols-[1.35fr_0.65fr]">
            {/* Hero copy */}
            <div>
              {/* Status */}
              <motion.div
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3.5 py-2"
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />

                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>

                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
                  AI System Active
                </span>
              </motion.div>

              {/* Heading */}
              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-6 max-w-4xl text-4xl font-bold leading-[1.08] tracking-tight md:text-5xl lg:text-6xl"
              >
                Communication without
                <span className="block bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">
                  barriers.
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-6 max-w-2xl text-sm leading-7 text-slate-400 md:text-base"
              >
                ISL Translator is an AI-powered platform designed
                to bridge communication between Indian Sign Language,
                text and speech through intelligent real-time translation.
              </motion.p>

              {/* Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-8 flex flex-wrap gap-3"
              >
                <Link
                  to="/sign-to-text"
                  className="group relative inline-flex items-center gap-3 overflow-hidden rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 px-6 py-3.5 font-semibold text-white shadow-xl shadow-cyan-500/15 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-blue-500/25"
                >
                  <span className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">
                    <FiCamera size={16} />
                  </span>

                  <span>Start Translating</span>

                  <FiArrowRight
                    size={17}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />

                  <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                </Link>

                <Link
                  to="/learning-hub"
                  className="inline-flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-6 py-3.5 font-semibold text-slate-300 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/[0.08] hover:text-white"
                >
                  <FiBookOpen size={17} />

                  Explore Learning

                  <FiChevronRight size={16} />
                </Link>
              </motion.div>

              {/* Trust indicators */}
              <div className="mt-8 flex flex-wrap items-center gap-5 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <FiCheckCircle className="text-cyan-400" />
                  Real-time translation
                </div>

                <div className="flex items-center gap-2">
                  <FiCheckCircle className="text-cyan-400" />
                  AI powered
                </div>

                <div className="flex items-center gap-2">
                  <FiCheckCircle className="text-cyan-400" />
                  Indian Sign Language
                </div>
              </div>
            </div>

            {/* Hero visual */}
            <div className="relative hidden min-h-[330px] lg:block">
              <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-400/10 bg-cyan-400/[0.025] shadow-[0_0_100px_rgba(34,211,238,0.08)]" />

              <div className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-400/10" />

              <motion.div
                animate={{
                  rotate: 360,
                }}
                transition={{
                  duration: 25,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-cyan-400/10"
              />

              {/* Center */}
              <motion.div
                animate={{
                  y: [0, -8, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute left-1/2 top-1/2 flex h-28 w-28 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-cyan-400/15 via-blue-500/10 to-violet-500/15 shadow-2xl shadow-cyan-500/10 backdrop-blur-xl"
              >
                <div className="absolute inset-3 rounded-2xl border border-white/5" />

                <FiZap
                  size={42}
                  className="relative text-cyan-300"
                />
              </motion.div>

              {/* Floating cards */}
              <motion.div
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute left-0 top-10 rounded-2xl border border-white/10 bg-slate-900/70 p-4 shadow-2xl backdrop-blur-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10">
                    <FiCamera
                      className="text-cyan-300"
                      size={18}
                    />
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-white">
                      Sign
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Camera input
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{
                  y: [0, 10, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute right-0 top-20 rounded-2xl border border-white/10 bg-slate-900/70 p-4 shadow-2xl backdrop-blur-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-400/10">
                    <FiType
                      className="text-blue-300"
                      size={18}
                    />
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-white">
                      Text
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Translation
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{
                  y: [0, -8, 0],
                }}
                transition={{
                  duration: 3.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute bottom-8 left-10 rounded-2xl border border-white/10 bg-slate-900/70 p-4 shadow-2xl backdrop-blur-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10">
                    <FiMic
                      className="text-emerald-300"
                      size={18}
                    />
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-white">
                      Speech
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Voice input
                    </p>
                  </div>
                </div>
              </motion.div>

              <div className="absolute bottom-5 right-4 rounded-xl border border-emerald-400/15 bg-emerald-400/[0.06] px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />

                  <span className="text-[10px] font-medium text-emerald-300">
                    System Ready
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* =========================================================
            QUICK ACTIONS
        ========================================================= */}

        <section>
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
            }}
            transition={{
              duration: 0.45,
            }}
            className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end"
          >
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-400">
                Translation Suite
              </p>

              <h2 className="mt-1.5 text-2xl font-bold tracking-tight text-white">
                Choose how you want to communicate
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Select a translation mode or start learning Indian Sign Language.
              </p>
            </div>

            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 transition hover:text-cyan-300"
            >
              View activity
              <FiArrowRight size={14} />
            </Link>
          </motion.div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {translationModes.map(
              (mode, index) => {
                const Icon = mode.icon;

                return (
                  <motion.div
                    key={mode.title}
                    initial={{
                      opacity: 0,
                      y: 20,
                    }}
                    whileInView={{
                      opacity: 1,
                      y: 0,
                    }}
                    viewport={{
                      once: true,
                    }}
                    transition={{
                      delay: index * 0.08,
                      duration: 0.45,
                    }}
                  >
                    <Link
                      to={mode.path}
                      className="group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.035] p-6 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:border-white/15 hover:bg-white/[0.055]"
                    >
                      {/* Card glow */}
                      <div
                        className={`pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full blur-3xl transition-all duration-500 ${
                          mode.accent === "cyan"
                            ? "bg-cyan-400/5 group-hover:bg-cyan-400/10"
                            : mode.accent === "blue"
                            ? "bg-blue-400/5 group-hover:bg-blue-400/10"
                            : mode.accent === "emerald"
                            ? "bg-emerald-400/5 group-hover:bg-emerald-400/10"
                            : "bg-violet-400/5 group-hover:bg-violet-400/10"
                        }`}
                      />

                      <div className="relative">
                        <div className="flex items-start justify-between">
                          <div
                            className={`flex h-12 w-12 items-center justify-center rounded-xl border ${
                              mode.accent === "cyan"
                                ? "border-cyan-400/15 bg-cyan-400/10 text-cyan-300"
                                : mode.accent === "blue"
                                ? "border-blue-400/15 bg-blue-400/10 text-blue-300"
                                : mode.accent === "emerald"
                                ? "border-emerald-400/15 bg-emerald-400/10 text-emerald-300"
                                : "border-violet-400/15 bg-violet-400/10 text-violet-300"
                            }`}
                          >
                            <Icon size={21} />
                          </div>

                          <span className="text-[10px] font-semibold tracking-[0.18em] text-slate-600">
                            {mode.number}
                          </span>
                        </div>

                        <h3 className="mt-6 text-lg font-semibold text-white">
                          {mode.title}
                        </h3>

                        <p className="mt-2 min-h-[84px] text-sm leading-6 text-slate-500">
                          {mode.description}
                        </p>

                        <div
                          className={`mt-5 flex items-center gap-2 text-xs font-semibold ${
                            mode.accent === "cyan"
                              ? "text-cyan-300"
                              : mode.accent === "blue"
                              ? "text-blue-300"
                              : mode.accent === "emerald"
                              ? "text-emerald-300"
                              : "text-violet-300"
                          }`}
                        >
                          {mode.action}

                          <FiArrowRight
                            size={13}
                            className="transition-transform duration-300 group-hover:translate-x-1"
                          />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              }
            )}
          </div>
        </section>

        {/* =========================================================
            STATS
        ========================================================= */}

        <section>
          <motion.div
            initial={{
              opacity: 0,
              y: 15,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
            }}
            className="mb-6"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-400">
              Platform Overview
            </p>

            <h2 className="mt-1.5 text-2xl font-bold text-white">
              Your translation workspace
            </h2>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Stat 1 */}
            <motion.div
              whileHover={{
                y: -3,
              }}
              className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 backdrop-blur-xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10">
                  <FiCamera
                    size={18}
                    className="text-cyan-300"
                  />
                </div>

                <span className="rounded-full border border-emerald-400/10 bg-emerald-400/5 px-2 py-1 text-[9px] text-emerald-300">
                  Active
                </span>
              </div>

              <p className="mt-5 text-xs text-slate-500">
                Signs Recognized
              </p>

              <p className="mt-1 text-3xl font-bold text-white">
                1,247
              </p>

              <p className="mt-2 text-[11px] text-emerald-400">
                +12% this week
              </p>
            </motion.div>

            {/* Stat 2 */}
            <motion.div
              whileHover={{
                y: -3,
              }}
              className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 backdrop-blur-xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10">
                  <FiActivity
                    size={18}
                    className="text-emerald-300"
                  />
                </div>

                <span className="rounded-full border border-emerald-400/10 bg-emerald-400/5 px-2 py-1 text-[9px] text-emerald-300">
                  Excellent
                </span>
              </div>

              <p className="mt-5 text-xs text-slate-500">
                Accuracy Rate
              </p>

              <p className="mt-1 text-3xl font-bold text-white">
                94.2%
              </p>

              <p className="mt-2 text-[11px] text-emerald-400">
                +3.2% this week
              </p>
            </motion.div>

            {/* Stat 3 */}
            <motion.div
              whileHover={{
                y: -3,
              }}
              className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 backdrop-blur-xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-400/10">
                  <FiClock
                    size={18}
                    className="text-violet-300"
                  />
                </div>

                <span className="rounded-full border border-blue-400/10 bg-blue-400/5 px-2 py-1 text-[9px] text-blue-300">
                  Today
                </span>
              </div>

              <p className="mt-5 text-xs text-slate-500">
                Sessions Today
              </p>

              <p className="mt-1 text-3xl font-bold text-white">
                18
              </p>

              <p className="mt-2 text-[11px] text-emerald-400">
                +5 today
              </p>
            </motion.div>

            {/* Stat 4 */}
            <motion.div
              whileHover={{
                y: -3,
              }}
              className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 backdrop-blur-xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-400/10">
                  <FiSettings
                    size={18}
                    className="text-blue-300"
                  />
                </div>

                <span className="rounded-full border border-cyan-400/10 bg-cyan-400/5 px-2 py-1 text-[9px] text-cyan-300">
                  Online
                </span>
              </div>

              <p className="mt-5 text-xs text-slate-500">
                Model Version
              </p>

              <p className="mt-1 text-3xl font-bold text-white">
                v2.1.0
              </p>

              <p className="mt-2 text-[11px] text-slate-500">
                AI model active
              </p>
            </motion.div>
          </div>
        </section>

        {/* =========================================================
            HOW IT WORKS
        ========================================================= */}

        <section>
          <motion.div
            initial={{
              opacity: 0,
              y: 15,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
            }}
            className="mb-6"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-400">
              Simple Workflow
            </p>

            <h2 className="mt-1.5 text-2xl font-bold text-white">
              How ISL Translator works
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              A streamlined pipeline connects your input with an
              intelligent translation system.
            </p>
          </motion.div>

          <div className="relative grid gap-4 md:grid-cols-4">
            {workflow.map(
              (step, index) => {
                const Icon = step.icon;

                return (
                  <motion.div
                    key={step.title}
                    initial={{
                      opacity: 0,
                      y: 20,
                    }}
                    whileInView={{
                      opacity: 1,
                      y: 0,
                    }}
                    viewport={{
                      once: true,
                    }}
                    transition={{
                      delay: index * 0.08,
                    }}
                    className="relative rounded-2xl border border-white/10 bg-white/[0.025] p-5 backdrop-blur-xl"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-400/10 bg-cyan-400/5">
                        <Icon
                          size={19}
                          className="text-cyan-300"
                        />
                      </div>

                      <span className="text-[10px] font-bold text-slate-700">
                        0{index + 1}
                      </span>
                    </div>

                    <h3 className="mt-5 font-semibold text-white">
                      {step.title}
                    </h3>

                    <p className="mt-2 text-xs leading-5 text-slate-500">
                      {step.description}
                    </p>

                    {index < workflow.length - 1 && (
                      <div className="absolute -right-3 top-1/2 z-20 hidden -translate-y-1/2 md:block">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-slate-950">
                          <FiArrowRight
                            size={11}
                            className="text-slate-600"
                          />
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              }
            )}
          </div>
        </section>

        {/* =========================================================
            SECURITY / SYSTEM CARD
        ========================================================= */}

        <motion.section
          initial={{
            opacity: 0,
            y: 20,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-r from-cyan-400/[0.07] via-blue-500/[0.05] to-violet-500/[0.07] p-6 backdrop-blur-xl md:p-8"
        >
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/15 bg-cyan-400/10">
                <FiShield
                  size={21}
                  className="text-cyan-300"
                />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-semibold text-white">
                    Built for accessible communication
                  </h2>

                  <span className="rounded-full border border-emerald-400/15 bg-emerald-400/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-emerald-300">
                    Secure
                  </span>
                </div>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                  SignBridge combines computer vision, speech recognition,
                  machine learning and Indian Sign Language resources into
                  one accessible communication platform.
                </p>
              </div>
            </div>

            <Link
              to="/about"
              className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/[0.09] hover:text-white"
            >
              Learn About SignBridge

              <FiArrowRight
                size={15}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>
        </motion.section>

        {/* =========================================================
            BOTTOM CTA
        ========================================================= */}

        <motion.section
          initial={{
            opacity: 0,
            y: 20,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.035] p-7 backdrop-blur-xl md:p-10"
        >
          <div className="pointer-events-none absolute left-1/2 top-0 h-48 w-96 -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="relative flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/15 bg-cyan-400/10">
              <FiZap
                size={21}
                className="text-cyan-300"
              />
            </div>

            <h2 className="mt-5 text-2xl font-bold text-white md:text-3xl">
              Ready to communicate?
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
              Start a real-time Indian Sign Language translation
              session and experience the platform.
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                to="/sign-to-text"
                className="group inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 px-6 py-3.5 font-semibold text-white shadow-xl shadow-cyan-500/10 transition hover:-translate-y-0.5 hover:shadow-blue-500/20"
              >
                Start Now

                <FiArrowRight
                  size={17}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>

              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-6 py-3.5 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
              >
                <FiActivity size={16} />
                Open Dashboard
              </Link>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}