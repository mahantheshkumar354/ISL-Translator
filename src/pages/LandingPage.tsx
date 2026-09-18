import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiArrowUpRight,
  FiArrowRight,
  FiCamera,
  FiType,
  FiMic,
  FiPlay,
} from "react-icons/fi";

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#080a0d] text-white">

      {/* =========================================================
          BACKGROUND
      ========================================================= */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">

        <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-cyan-500/[0.07] blur-[140px]" />

        <div className="absolute top-[30%] -right-40 h-[600px] w-[600px] rounded-full bg-blue-500/[0.06] blur-[150px]" />

        <div className="absolute bottom-[-250px] left-[25%] h-[600px] w-[600px] rounded-full bg-violet-500/[0.05] blur-[150px]" />

        <div
          className="absolute inset-0 opacity-[0.018]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />
      </div>

      {/* =========================================================
          NAVBAR
      ========================================================= */}
      <nav className="fixed left-0 right-0 top-0 z-50">

        <div className="mx-auto max-w-[1500px] px-5 pt-5 lg:px-8">

          <div className="flex items-center justify-between">

            {/* BRAND */}
            <Link
              to="/"
              className="group flex items-center gap-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] transition duration-300 group-hover:border-cyan-400/40">
                <span className="text-[10px] font-bold tracking-wider">
                  ISL
                </span>
              </div>

              <div>
                <p className="text-sm font-semibold tracking-[0.16em]">
                  ISL TRANSLATOR
                </p>

                <p className="mt-0.5 text-[9px] uppercase tracking-[0.2em] text-white/35">
                  Indian Sign Language
                </p>
              </div>
            </Link>

            {/* NAVIGATION */}
            <div className="hidden items-center gap-8 md:flex">

              <a
                href="#features"
                className="text-xs uppercase tracking-[0.15em] text-white/45 transition hover:text-white"
              >
                Features
              </a>

              <a
                href="#how"
                className="text-xs uppercase tracking-[0.15em] text-white/45 transition hover:text-white"
              >
                Process
              </a>

              <a
                href="#about"
                className="text-xs uppercase tracking-[0.15em] text-white/45 transition hover:text-white"
              >
                About
              </a>

              {/* LOGIN */}
              <Link
                to="/login"
                className="rounded-full border border-white/10 px-5 py-2.5 text-xs font-medium uppercase tracking-[0.12em] text-white/65 transition duration-300 hover:border-white/25 hover:bg-white/[0.06] hover:text-white"
              >
                Login
              </Link>

              {/* GET STARTED */}
              <Link
                to="/home"
                className="group flex items-center gap-3 rounded-full border border-white/10 bg-white px-5 py-2.5 text-xs font-semibold text-slate-950 transition duration-300 hover:bg-cyan-300"
              >
                GET STARTED

                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-950 text-white transition group-hover:translate-x-0.5">
                  <FiArrowUpRight size={13} />
                </span>
              </Link>

            </div>

            {/* MOBILE CTA */}
            <div className="flex items-center gap-2 md:hidden">

              <Link
                to="/login"
                className="rounded-full border border-white/10 px-4 py-2.5 text-[10px] font-medium uppercase tracking-[0.1em] text-white/70 transition hover:bg-white/[0.06] hover:text-white"
              >
                Login
              </Link>

              <Link
                to="/home"
                className="group flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-[10px] font-semibold text-slate-950 transition hover:bg-cyan-300"
              >
                START

                <FiArrowUpRight
                  size={13}
                  className="transition group-hover:translate-x-0.5"
                />
              </Link>

            </div>

          </div>
        </div>
      </nav>

      {/* =========================================================
          HERO
      ========================================================= */}
      <section className="relative min-h-screen px-5 pb-20 pt-32 lg:px-8">

        <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-[1500px] items-center">

          <div className="grid w-full items-center gap-16 lg:grid-cols-[0.95fr_1.05fr]">

            {/* LEFT CONTENT */}
            <motion.div
              initial={{ opacity: 0, y: 35 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="relative z-10"
            >

              <div className="mb-8 flex items-center gap-4">

                <span className="h-px w-10 bg-cyan-400" />

                <span className="text-[10px] uppercase tracking-[0.3em] text-white/45">
                  Communication reimagined
                </span>

              </div>

              <h1 className="max-w-[800px] text-[4rem] font-medium leading-[0.9] tracking-[-0.055em] sm:text-[5rem] md:text-[6.5rem] lg:text-[7.5rem]">

                A language

                <span className="block text-white/35">
                  beyond
                </span>

                <span className="block">
                  words.
                </span>

              </h1>

              <p className="mt-9 max-w-lg text-sm leading-7 text-white/45 md:text-base">
                ISL Translator creates a bridge between Indian Sign
                Language, text and speech — making everyday communication
                more accessible, natural and connected.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-4">

                <Link
                  to="/home"
                  className="group flex items-center gap-4 rounded-full bg-cyan-400 px-6 py-3.5 text-sm font-semibold text-slate-950 transition duration-300 hover:bg-cyan-300"
                >
                  Explore ISL Translator

                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-950 text-white transition group-hover:translate-x-1">
                    <FiArrowRight size={14} />
                  </span>
                </Link>

                <a
                  href="#how"
                  className="group flex items-center gap-3 rounded-full border border-white/10 px-5 py-3.5 text-sm text-white/55 transition hover:border-white/20 hover:text-white"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10">
                    <FiPlay size={11} />
                  </span>

                  See how it works
                </a>

              </div>

              <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3">

                <div className="flex items-center gap-2 text-[11px] text-white/35">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                  Real-time translation
                </div>

                <div className="flex items-center gap-2 text-[11px] text-white/35">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                  Three translation modes
                </div>

                <div className="flex items-center gap-2 text-[11px] text-white/35">
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                  Built for accessibility
                </div>

              </div>

            </motion.div>

            {/* RIGHT VISUAL */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 1,
                delay: 0.15,
              }}
              className="relative"
            >

              <div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/[0.08] blur-[120px]" />

              <div className="relative aspect-[1/0.92] overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#101419]">

                <div className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between border-b border-white/[0.08] px-6 py-4">

                  <div className="flex items-center gap-3">

                    <span className="h-2 w-2 rounded-full bg-cyan-400" />

                    <span className="text-[9px] uppercase tracking-[0.25em] text-white/40">
                      Translation space
                    </span>

                  </div>

                  <span className="text-[9px] uppercase tracking-[0.2em] text-white/20">
                    01 — 03
                  </span>

                </div>

                <div className="absolute inset-0">

                  <div className="absolute bottom-0 left-[8%] top-[18%] w-[18%] border-x border-white/[0.05] bg-white/[0.018]" />

                  <div className="absolute bottom-0 left-[28%] top-[18%] w-[22%] border-x border-white/[0.05] bg-cyan-400/[0.025]" />

                  <div className="absolute bottom-0 right-[10%] top-[18%] w-[25%] border-x border-white/[0.05] bg-white/[0.015]" />

                  <motion.div
                    animate={{
                      rotate: [0, 3, 0, -3, 0],
                      scale: [1, 1.015, 1, 0.985, 1],
                    }}
                    transition={{
                      duration: 12,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="absolute left-[9%] top-[23%] h-[62%] w-[55%] rounded-[48%_52%_44%_56%/42%_45%_55%_58%] border border-cyan-300/20 bg-gradient-to-br from-cyan-400/[0.14] via-blue-500/[0.06] to-transparent"
                  />

                  <motion.div
                    animate={{
                      x: [0, 15, 0, -10, 0],
                      y: [0, -8, 0, 10, 0],
                    }}
                    transition={{
                      duration: 10,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="absolute right-[5%] top-[32%] h-[35%] w-[35%] rounded-[42%_58%_55%_45%] border border-violet-300/15 bg-violet-400/[0.04]"
                  />

                  <svg
                    className="absolute inset-0 h-full w-full opacity-40"
                    viewBox="0 0 800 700"
                    fill="none"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M20 510 C180 370 220 650 390 450 C530 280 590 450 780 230"
                      stroke="rgba(103,232,249,0.45)"
                      strokeWidth="1"
                    />

                    <path
                      d="M20 555 C170 410 250 680 420 475 C555 315 650 475 800 285"
                      stroke="rgba(255,255,255,0.12)"
                      strokeWidth="1"
                    />

                    <path
                      d="M70 180 C220 310 260 120 420 255 C570 385 650 170 770 330"
                      stroke="rgba(139,92,246,0.25)"
                      strokeWidth="1"
                    />
                  </svg>

                  <div className="absolute left-[12%] top-[27%]">

                    <p className="text-[9px] uppercase tracking-[0.35em] text-cyan-300/60">
                      Indian
                    </p>

                    <p className="mt-1 text-4xl font-medium tracking-[-0.05em] text-white/90 md:text-5xl">
                      Sign
                    </p>

                    <p className="text-4xl font-medium tracking-[-0.05em] text-white/25 md:text-5xl">
                      Language
                    </p>

                  </div>

                  <motion.div
                    animate={{
                      y: [0, -8, 0],
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="absolute bottom-[12%] right-[8%] w-[190px] rounded-2xl border border-white/10 bg-[#151a20]/90 p-4 shadow-2xl backdrop-blur-xl"
                  >

                    <div className="mb-4 flex items-center justify-between">

                      <span className="text-[9px] uppercase tracking-[0.2em] text-white/30">
                        Direction
                      </span>

                      <FiArrowUpRight
                        size={14}
                        className="text-cyan-300"
                      />

                    </div>

                    <div className="flex items-end gap-2">

                      <span className="text-2xl font-medium">
                        03
                      </span>

                      <span className="mb-1 text-[9px] text-white/30">
                        translation paths
                      </span>

                    </div>

                    <div className="mt-4 h-px bg-white/[0.08]" />

                    <div className="mt-3 flex justify-between text-[8px] uppercase tracking-wider text-white/30">
                      <span>Sign</span>
                      <span>Text</span>
                      <span>Speech</span>
                    </div>

                  </motion.div>

                  <div className="absolute right-[18%] top-[21%] h-3 w-3 rounded-full border border-cyan-300/50" />

                  <div className="absolute bottom-[22%] left-[18%] h-2 w-2 rounded-full bg-violet-300/50" />

                </div>

                <div className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-between border-t border-white/[0.08] bg-black/20 px-6 py-4 backdrop-blur-md">

                  <span className="text-[9px] uppercase tracking-[0.25em] text-white/30">
                    Communication without barriers
                  </span>

                  <span className="text-[9px] text-white/20">
                    ISL / 2026
                  </span>

                </div>

              </div>

            </motion.div>

          </div>
        </div>
      </section>

      {/* =========================================================
          TRANSLATION MODES
      ========================================================= */}
      <section
        id="features"
        className="border-t border-white/[0.06] py-24 md:py-32"
      >

        <div className="mx-auto max-w-[1500px] px-5 lg:px-8">

          <div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr]">

            <div>

              <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400">
                The platform
              </p>

              <h2 className="mt-5 max-w-md text-4xl font-medium leading-[1] tracking-[-0.04em] md:text-6xl">
                Three ways
                <span className="block text-white/35">
                  to communicate.
                </span>
              </h2>

            </div>

            <div className="grid gap-px overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.08] md:grid-cols-3">

              <Link
                to="/sign-to-text"
                className="group relative bg-[#0d1115] p-7 transition duration-500 hover:bg-[#121920]"
              >

                <div className="flex items-start justify-between">

                  <span className="flex h-11 w-11 items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-400/[0.06]">
                    <FiCamera size={18} className="text-cyan-300" />
                  </span>

                  <FiArrowUpRight
                    size={18}
                    className="text-white/20 transition group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-cyan-300"
                  />

                </div>

                <p className="mt-14 text-[9px] uppercase tracking-[0.25em] text-white/25">
                  01
                </p>

                <h3 className="mt-3 text-xl font-medium">
                  Sign to Text
                </h3>

                <p className="mt-3 text-sm leading-6 text-white/35">
                  Use your camera to recognize Indian Sign Language
                  gestures and translate them into text.
                </p>

              </Link>

              <Link
                to="/text-to-sign"
                className="group relative bg-[#0d1115] p-7 transition duration-500 hover:bg-[#121920]"
              >

                <div className="flex items-start justify-between">

                  <span className="flex h-11 w-11 items-center justify-center rounded-full border border-violet-400/20 bg-violet-400/[0.06]">
                    <FiType size={18} className="text-violet-300" />
                  </span>

                  <FiArrowUpRight
                    size={18}
                    className="text-white/20 transition group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-violet-300"
                  />

                </div>

                <p className="mt-14 text-[9px] uppercase tracking-[0.25em] text-white/25">
                  02
                </p>

                <h3 className="mt-3 text-xl font-medium">
                  Text to Sign
                </h3>

                <p className="mt-3 text-sm leading-6 text-white/35">
                  Enter text and translate it into a sequence of
                  Indian Sign Language animations.
                </p>

              </Link>

              <Link
                to="/speech-to-sign"
                className="group relative bg-[#0d1115] p-7 transition duration-500 hover:bg-[#121920]"
              >

                <div className="flex items-start justify-between">

                  <span className="flex h-11 w-11 items-center justify-center rounded-full border border-blue-400/20 bg-blue-400/[0.06]">
                    <FiMic size={18} className="text-blue-300" />
                  </span>

                  <FiArrowUpRight
                    size={18}
                    className="text-white/20 transition group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-blue-300"
                  />

                </div>

                <p className="mt-14 text-[9px] uppercase tracking-[0.25em] text-white/25">
                  03
                </p>

                <h3 className="mt-3 text-xl font-medium">
                  Speech to Sign
                </h3>

                <p className="mt-3 text-sm leading-6 text-white/35">
                  Speak naturally and convert spoken language into
                  visual ISL sign sequences.
                </p>

              </Link>

            </div>

          </div>

        </div>
      </section>

      {/* =========================================================
          HOW IT WORKS
      ========================================================= */}
      <section
        id="how"
        className="border-t border-white/[0.06] py-24 md:py-32"
      >

        <div className="mx-auto max-w-[1200px] px-5 lg:px-8">

          <div className="text-center">

            <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400">
              How it works
            </p>

            <h2 className="mx-auto mt-5 max-w-3xl text-4xl font-medium leading-[1] tracking-[-0.04em] md:text-6xl">
              From input to
              <span className="text-white/35">
                {" "}understanding.
              </span>
            </h2>

          </div>

          <div className="mt-20">

            <div className="grid gap-px overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.08] md:grid-cols-3">

              <div className="bg-[#0d1115] p-8 md:p-10">

                <span className="text-5xl font-light tracking-[-0.05em] text-white/[0.12]">
                  01
                </span>

                <div className="mt-16">

                  <h3 className="text-xl font-medium">
                    Choose
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-white/35">
                    Select the translation experience that
                    matches how you want to communicate.
                  </p>

                </div>

              </div>

              <div className="bg-[#0d1115] p-8 md:p-10">

                <span className="text-5xl font-light tracking-[-0.05em] text-white/[0.12]">
                  02
                </span>

                <div className="mt-16">

                  <h3 className="text-xl font-medium">
                    Express
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-white/35">
                    Use your camera, voice or keyboard to provide
                    your message.
                  </p>

                </div>

              </div>

              <div className="bg-[#0d1115] p-8 md:p-10">

                <span className="text-5xl font-light tracking-[-0.05em] text-white/[0.12]">
                  03
                </span>

                <div className="mt-16">

                  <h3 className="text-xl font-medium">
                    Connect
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-white/35">
                    Receive the translated result and continue
                    the conversation naturally.
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>
      </section>

      {/* =========================================================
          LEARNING / ABOUT
      ========================================================= */}
      <section
        id="about"
        className="border-t border-white/[0.06] py-24 md:py-32"
      >

        <div className="mx-auto max-w-[1500px] px-5 lg:px-8">

          <div className="grid items-center gap-16 lg:grid-cols-2">

            <div className="relative aspect-square overflow-hidden rounded-[2rem] border border-white/10 bg-[#101419]">

              <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/[0.08] via-transparent to-violet-400/[0.08]" />

              <div className="absolute left-[12%] top-[12%] text-[10px] uppercase tracking-[0.3em] text-white/25">
                ISL TRANSLATOR
              </div>

              <div className="absolute left-[12%] top-[27%]">

                <p className="text-6xl font-medium tracking-[-0.06em] text-white md:text-8xl">
                  Learn.
                </p>

                <p className="text-6xl font-medium tracking-[-0.06em] text-white/20 md:text-8xl">
                  Translate.
                </p>

                <p className="text-6xl font-medium tracking-[-0.06em] text-cyan-300/70 md:text-8xl">
                  Connect.
                </p>

              </div>

              <div className="absolute bottom-[14%] left-[12%] right-[12%] h-px bg-white/10" />

              <div className="absolute bottom-[9%] left-[12%] flex items-center gap-5">

                <span className="h-2 w-2 rounded-full bg-cyan-400" />

                <span className="text-[9px] uppercase tracking-[0.25em] text-white/25">
                  Accessible communication
                </span>

              </div>

            </div>

            <div>

              <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400">
                More than translation
              </p>

              <h2 className="mt-5 text-4xl font-medium leading-[1] tracking-[-0.04em] md:text-6xl">
                Technology should
                <span className="block text-white/35">
                  bring people closer.
                </span>
              </h2>

              <p className="mt-7 max-w-xl text-sm leading-7 text-white/40 md:text-base">
                ISL Translator combines computer vision, machine
                learning, speech recognition and sign-language
                resources into one platform designed around
                communication.
              </p>

              <div className="mt-10 space-y-5">

                <div className="flex gap-5 border-t border-white/[0.08] pt-5">

                  <span className="text-xs text-cyan-300">
                    01
                  </span>

                  <div>
                    <p className="font-medium">
                      Learn Indian Sign Language
                    </p>

                    <p className="mt-1 text-sm text-white/30">
                      Explore alphabets, numbers, phrases and
                      everyday communication.
                    </p>
                  </div>

                </div>

                <div className="flex gap-5 border-t border-white/[0.08] pt-5">

                  <span className="text-xs text-cyan-300">
                    02
                  </span>

                  <div>
                    <p className="font-medium">
                      Translate in real time
                    </p>

                    <p className="mt-1 text-sm text-white/30">
                      Move between sign, text and speech through
                      one connected experience.
                    </p>
                  </div>

                </div>

                <div className="flex gap-5 border-t border-white/[0.08] pt-5">

                  <span className="text-xs text-cyan-300">
                    03
                  </span>

                  <div>
                    <p className="font-medium">
                      Keep your conversations connected
                    </p>

                    <p className="mt-1 text-sm text-white/30">
                      Translation history keeps your previous
                      interactions available.
                    </p>
                  </div>

                </div>

              </div>

              <Link
                to="/learning-hub"
                className="group mt-10 inline-flex items-center gap-3 text-sm text-white/60 transition hover:text-cyan-300"
              >
                Explore Learning Hub

                <FiArrowRight
                  size={15}
                  className="transition group-hover:translate-x-1"
                />
              </Link>

            </div>

          </div>

        </div>
      </section>

      {/* =========================================================
          FINAL CTA
      ========================================================= */}
      <section className="px-5 py-24 md:py-32 lg:px-8">

        <div className="mx-auto max-w-[1300px]">

          <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#101419] px-7 py-20 text-center md:px-16">

            <div className="absolute left-1/2 top-1/2 h-[350px] w-[350px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/[0.07] blur-[100px]" />

            <div className="relative">

              <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400">
                Start your experience
              </p>

              <h2 className="mx-auto mt-6 max-w-4xl text-4xl font-medium leading-[0.95] tracking-[-0.05em] md:text-7xl">
                Communication has
                <span className="text-white/30">
                  {" "}no single language.
                </span>
              </h2>

              <p className="mx-auto mt-7 max-w-xl text-sm leading-7 text-white/35">
                Explore ISL Translator and discover a more accessible
                way to communicate.
              </p>

              <Link
                to="/home"
                className="group mt-9 inline-flex items-center gap-4 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
              >
                Enter ISL Translator

                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-950 text-white transition group-hover:translate-x-1">
                  <FiArrowUpRight size={13} />
                </span>
              </Link>

            </div>

          </div>

        </div>
      </section>

      {/* =========================================================
          FOOTER
      ========================================================= */}
      <footer className="border-t border-white/[0.06]">

        <div className="mx-auto flex max-w-[1500px] flex-col gap-7 px-5 py-10 md:flex-row md:items-center md:justify-between lg:px-8">

          <div>

            <p className="text-sm font-semibold tracking-[0.16em]">
              ISL TRANSLATOR
            </p>

            <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-white/25">
              Indian Sign Language Translation Platform
            </p>

          </div>

          <div className="flex flex-wrap items-center gap-7">

            <Link
              to="/about"
              className="text-xs text-white/30 transition hover:text-white"
            >
              About
            </Link>

            <Link
              to="/learning-hub"
              className="text-xs text-white/30 transition hover:text-white"
            >
              Learning Hub
            </Link>

            <Link
              to="/home"
              className="text-xs text-white/30 transition hover:text-white"
            >
              Platform
            </Link>

            {/* FOOTER LOGIN */}
            <Link
              to="/login"
              className="text-xs text-white/30 transition hover:text-white"
            >
              Login
            </Link>

          </div>

          <p className="text-[10px] text-white/20">
            © 2026 ISL TRANSLATOR
          </p>

        </div>

      </footer>

    </div>
  );
}