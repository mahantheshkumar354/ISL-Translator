import { motion } from "framer-motion";
import {
  FiActivity,
  FiArrowRight,
  FiAward,
  FiBookOpen,
  FiCamera,
  FiCheckCircle,
  FiClock,
  FiCpu,
  FiDatabase,
  FiGlobe,
  FiHeart,
  FiLayers,
  FiMic,
  FiMonitor,
  FiRefreshCw,
  FiSettings,
  FiShield,
  FiTarget,
  FiTrendingUp,
  FiType,
  FiUsers,
  FiVolume2,
  FiWifi,
  FiZap,
} from "react-icons/fi";
import { Link } from "react-router-dom";

const platformFeatures = [
  {
    title: "Sign to Text",
    subtitle: "Camera-based recognition",
    description:
      "Use your camera to perform Indian Sign Language gestures. The AI analyzes hand landmarks and converts recognized signs into readable text in real time.",
    icon: FiCamera,
    route: "/sign-to-text",
    step: "01",
  },
  {
    title: "Text to Sign",
    subtitle: "Visual sign translation",
    description:
      "Enter words or sentences and view corresponding Indian Sign Language sign videos. The system creates a visual sequence for communication.",
    icon: FiType,
    route: "/text-to-sign",
    step: "02",
  },
  {
    title: "Speech to Sign",
    subtitle: "Voice-powered communication",
    description:
      "Speak naturally using your microphone. Speech recognition converts your voice into text and presents the corresponding sign representation.",
    icon: FiMic,
    route: "/speech-to-sign",
    step: "03",
  },
];

const websiteFlow = [
  {
    title: "Home",
    description:
      "Your starting point to understand SignBridge, explore the platform, and quickly access translation features.",
    icon: FiGlobe,
    route: "/",
  },
  {
    title: "Sign to Text",
    description:
      "Use the camera to recognize Indian Sign Language gestures and convert them into text.",
    icon: FiCamera,
    route: "/sign-to-text",
  },
  {
    title: "Text to Sign",
    description:
      "Enter text and view its Indian Sign Language representation through visual sign sequences.",
    icon: FiType,
    route: "/text-to-sign",
  },
  {
    title: "Speech to Sign",
    description:
      "Speak into the microphone and convert spoken communication into Indian Sign Language.",
    icon: FiMic,
    route: "/speech-to-sign",
  },
  {
    title: "Learning Hub",
    description:
      "Learn alphabets, numbers, greetings, family signs, food, emergencies, and daily conversations.",
    icon: FiBookOpen,
    route: "/learning",
  },
  {
    title: "History",
    description:
      "Review previous translations with their mode, input, output, confidence, date, and time.",
    icon: FiClock,
    route: "/history",
  },
  {
    title: "Dashboard",
    description:
      "View translation statistics, activity, confidence, recent translations, and system health.",
    icon: FiActivity,
    route: "/dashboard",
  },
  {
    title: "Settings",
    description:
      "Customize application preferences such as appearance, language, camera quality, speech, and notifications.",
    icon: FiSettings,
    route: "/settings",
  },
];

const technologies = [
  {
    name: "React + Vite",
    description: "Fast and modern frontend application",
    icon: FiLayers,
  },
  {
    name: "FastAPI",
    description: "High-performance Python backend",
    icon: FiZap,
  },
  {
    name: "TensorFlow",
    description: "Deep learning and gesture recognition",
    icon: FiCpu,
  },
  {
    name: "MediaPipe",
    description: "Real-time hand landmark detection",
    icon: FiTarget,
  },
  {
    name: "OpenCV",
    description: "Camera and image processing",
    icon: FiCamera,
  },
  {
    name: "SQLite / PostgreSQL",
    description: "Translation history and application data",
    icon: FiDatabase,
  },
];

const values = [
  {
    title: "Accessibility",
    description:
      "Making communication technology more accessible to people who use Indian Sign Language.",
    icon: FiHeart,
  },
  {
    title: "Innovation",
    description:
      "Combining artificial intelligence, computer vision, and modern web technologies.",
    icon: FiCpu,
  },
  {
    title: "Reliability",
    description:
      "Designed around stable predictions, confidence scores, real-time processing, and persistent history.",
    icon: FiShield,
  },
  {
    title: "Inclusion",
    description:
      "Encouraging better communication between deaf and hearing communities.",
    icon: FiUsers,
  },
];

const teamMembers = [
  {
    name: "Charan HR",
    initials: "CH",
    role: "Team Member",
  },
  {
    name: "Dhanush GG",
    initials: "DG",
    role: "Team Member",
  },
  {
    name: "Hemanth KP",
    initials: "HK",
    role: "Team Member",
  },
  {
    name: "Mahantesh CA",
    initials: "MC",
    role: "Team Member",
  },
];

function SectionTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto mb-12 max-w-3xl text-center">
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/15 bg-cyan-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
        <FiZap className="h-3.5 w-3.5" />
        {eyebrow}
      </div>

      <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
        {title}
      </h2>

      <p className="mt-4 text-sm leading-7 text-slate-400 sm:text-base">
        {description}
      </p>
    </div>
  );
}

function FeatureCard({
  item,
  index,
}: {
  item: (typeof platformFeatures)[number];
  index: number;
}) {
  const Icon = item.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
      whileHover={{ y: -6 }}
      className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-7 backdrop-blur-xl transition hover:border-cyan-400/20 hover:bg-white/[0.07]"
    >
      <div className="absolute right-5 top-5 text-5xl font-black text-white/[0.03]">
        {item.step}
      </div>

      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300 transition group-hover:bg-cyan-400/15">
        <Icon className="h-7 w-7" />
      </div>

      <p className="mt-6 text-xs font-bold uppercase tracking-widest text-cyan-400">
        {item.subtitle}
      </p>

      <h3 className="mt-2 text-2xl font-bold text-white">
        {item.title}
      </h3>

      <p className="mt-4 text-sm leading-7 text-slate-400">
        {item.description}
      </p>

      <Link
        to={item.route}
        className="group/link mt-6 inline-flex items-center gap-2 text-sm font-bold text-cyan-300"
      >
        Try this feature
        <FiArrowRight className="transition-transform group-hover/link:translate-x-1" />
      </Link>
    </motion.div>
  );
}

export default function About() {
  return (
    <div className="min-h-screen overflow-hidden bg-slate-950 text-white">
      {/* =====================================================
          BACKGROUND
         ===================================================== */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[30rem] w-[30rem] rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute right-[-12rem] top-[20%] h-[35rem] w-[35rem] rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute bottom-[-15rem] left-[30%] h-[35rem] w-[35rem] rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      {/* =====================================================
          HERO
         ===================================================== */}

      <section className="relative px-4 pb-24 pt-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-8 shadow-2xl backdrop-blur-xl sm:p-12 lg:p-16"
          >
            {/* Decorative rings */}

            <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full border border-cyan-400/10" />

            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full border border-cyan-400/10" />

            <div className="absolute bottom-[-7rem] left-[-7rem] h-56 w-56 rounded-full bg-cyan-400/5 blur-3xl" />

            <div className="relative grid gap-12 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
              <div>
                <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-300">
                  <FiAward className="h-4 w-4" />
                  Bidirectional Indian Sign Language Translator
                </div>

                <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
                  Connecting people through
                  <span className="block bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">
                    language & technology.
                  </span>
                </h1>

                <p className="mt-6 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
                  SignBridge is an AI-powered Indian Sign Language translation
                  platform designed to bridge communication between sign
                  language, text, and speech through real-time technology.
                </p>

                <div className="mt-8 flex flex-wrap gap-4">
                  <Link
                    to="/sign-to-text"
                    className="group inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-300"
                  >
                    Start Translating
                    <FiArrowRight className="transition-transform group-hover:translate-x-1" />
                  </Link>

                  <Link
                    to="/learning"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold transition hover:bg-white/10"
                  >
                    <FiBookOpen />
                    Learn ISL
                  </Link>
                </div>
              </div>

              {/* Hero stats */}

              <div className="grid grid-cols-2 gap-4">
                <HeroStat
                  icon={<FiRefreshCw />}
                  value="3"
                  label="Translation Modes"
                />

                <HeroStat
                  icon={<FiCamera />}
                  value="AI"
                  label="Gesture Recognition"
                />

                <HeroStat
                  icon={<FiClock />}
                  value="24/7"
                  label="Translation History"
                />

                <HeroStat
                  icon={<FiWifi />}
                  value="Live"
                  label="Real-Time Processing"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* =====================================================
          WHAT IS SIGNBRIDGE
         ===================================================== */}

      <section className="relative px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionTitle
            eyebrow="About SignBridge"
            title="A complete communication platform"
            description="SignBridge is more than a translator. It combines translation, learning, history, analytics, and personalization into one platform."
          />

          <div className="grid gap-6 lg:grid-cols-3">
            <InfoCard
              icon={<FiTarget />}
              title="The Problem"
              description="Communication can become difficult when people using Indian Sign Language and people unfamiliar with ISL do not share a common communication method."
            />

            <InfoCard
              icon={<FiCpu />}
              title="Our Approach"
              description="We combine computer vision, hand landmark detection, deep learning, speech recognition, and modern web technologies to create a practical translation experience."
            />

            <InfoCard
              icon={<FiHeart />}
              title="The Goal"
              description="Our goal is to reduce communication barriers and provide an accessible digital environment for learning and using Indian Sign Language."
            />
          </div>
        </div>
      </section>

      {/* =====================================================
          TRANSLATION MODES
         ===================================================== */}

      <section className="relative px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionTitle
            eyebrow="Core Features"
            title="Three ways to communicate"
            description="SignBridge provides multiple translation directions so users can choose the communication method that works best for them."
          />

          <div className="grid gap-6 lg:grid-cols-3">
            {platformFeatures.map((item, index) => (
              <FeatureCard
                key={item.title}
                item={item}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          SIGN TO TEXT DETAIL
         ===================================================== */}

      <section className="relative px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl sm:p-10"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
                <FiCamera className="h-7 w-7" />
              </div>

              <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
                Translation Mode 01
              </p>

              <h2 className="mt-2 text-3xl font-black">
                Sign to Text
              </h2>

              <p className="mt-5 leading-8 text-slate-400">
                The Sign to Text module uses your camera to capture hand
                gestures. MediaPipe detects hand landmarks and the trained
                machine learning model processes those features to recognize
                the sign.
              </p>

              <div className="mt-7 space-y-3">
                <Step text="Enable your camera" />
                <Step text="Show an Indian Sign Language gesture" />
                <Step text="AI detects hand landmarks" />
                <Step text="Model predicts the sign" />
                <Step text="Recognized text is displayed" />
                <Step text="Stable translations are added to History" />
              </div>

              <Link
                to="/sign-to-text"
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-bold text-slate-950"
              >
                Open Sign to Text
                <FiArrowRight />
              </Link>
            </motion.div>

            <FlowVisual
              title="Camera → AI → Text"
              items={[
                {
                  icon: <FiCamera />,
                  title: "Camera",
                  text: "Capture gesture",
                },
                {
                  icon: <FiTarget />,
                  title: "MediaPipe",
                  text: "Detect landmarks",
                },
                {
                  icon: <FiCpu />,
                  title: "AI Model",
                  text: "Recognize sign",
                },
                {
                  icon: <FiType />,
                  title: "Text",
                  text: "Display result",
                },
              ]}
            />
          </div>
        </div>
      </section>

      {/* =====================================================
          TEXT TO SIGN DETAIL
         ===================================================== */}

      <section className="relative px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <FlowVisual
              title="Text → Sign Videos"
              items={[
                {
                  icon: <FiType />,
                  title: "Input",
                  text: "Enter text",
                },
                {
                  icon: <FiLayers />,
                  title: "Processing",
                  text: "Split into signs",
                },
                {
                  icon: <FiBookOpen />,
                  title: "Videos",
                  text: "Find sign media",
                },
                {
                  icon: <FiMonitor />,
                  title: "Output",
                  text: "Play sequence",
                },
              ]}
            />

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl sm:p-10"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-400/10 text-blue-300">
                <FiType className="h-7 w-7" />
              </div>

              <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-blue-400">
                Translation Mode 02
              </p>

              <h2 className="mt-2 text-3xl font-black">
                Text to Sign
              </h2>

              <p className="mt-5 leading-8 text-slate-400">
                Type a word, sentence, or phrase and SignBridge converts it
                into a visual Indian Sign Language sequence using available
                sign videos.
              </p>

              <div className="mt-7 space-y-3">
                <Step text="Enter your text" />
                <Step text="Submit the translation" />
                <Step text="Words are analyzed" />
                <Step text="Available sign videos are selected" />
                <Step text="Signs are arranged into a sequence" />
                <Step text="Translation is saved to History" />
              </div>

              <Link
                to="/text-to-sign"
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-blue-400 px-5 py-3 text-sm font-bold text-slate-950"
              >
                Open Text to Sign
                <FiArrowRight />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* =====================================================
          SPEECH TO SIGN DETAIL
         ===================================================== */}

      <section className="relative px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl sm:p-10"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-400/10 text-violet-300">
                <FiMic className="h-7 w-7" />
              </div>

              <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-violet-400">
                Translation Mode 03
              </p>

              <h2 className="mt-2 text-3xl font-black">
                Speech to Sign
              </h2>

              <p className="mt-5 leading-8 text-slate-400">
                Speech to Sign allows users to communicate naturally through
                their voice. Speech recognition converts spoken words into
                text and the system presents the corresponding sign output.
              </p>

              <div className="mt-7 space-y-3">
                <Step text="Enable microphone access" />
                <Step text="Speak naturally" />
                <Step text="Speech recognition captures your words" />
                <Step text="Recognized speech becomes text" />
                <Step text="Text is converted into sign output" />
                <Step text="Final speech translation is saved to History" />
              </div>

              <Link
                to="/speech-to-sign"
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-violet-400 px-5 py-3 text-sm font-bold text-slate-950"
              >
                Open Speech to Sign
                <FiArrowRight />
              </Link>
            </motion.div>

            <FlowVisual
              title="Voice → Text → Sign"
              items={[
                {
                  icon: <FiMic />,
                  title: "Microphone",
                  text: "Capture speech",
                },
                {
                  icon: <FiVolume2 />,
                  title: "Speech",
                  text: "Recognize words",
                },
                {
                  icon: <FiType />,
                  title: "Text",
                  text: "Process sentence",
                },
                {
                  icon: <FiBookOpen />,
                  title: "Sign",
                  text: "Show visual output",
                },
              ]}
            />
          </div>
        </div>
      </section>

      {/* =====================================================
          WEBSITE WALKTHROUGH
         ===================================================== */}

      <section className="relative px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionTitle
            eyebrow="Explore the Platform"
            title="Everything available from Home to Settings"
            description="SignBridge is organized into dedicated sections so users can translate, learn, review their activity, and customize their experience."
          />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {websiteFlow.map((item, index) => {
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -4 }}
                >
                  <Link
                    to={item.route}
                    className="group block h-full rounded-2xl border border-white/10 bg-white/[0.035] p-5 backdrop-blur-xl transition hover:border-cyan-400/20 hover:bg-white/[0.06]"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 text-cyan-300">
                        <Icon />
                      </div>

                      <span className="text-xs font-black text-slate-700">
                        {(index + 1).toString().padStart(2, "0")}
                      </span>
                    </div>

                    <h3 className="mt-5 font-bold text-white">
                      {item.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {item.description}
                    </p>

                    <div className="mt-4 flex items-center gap-2 text-xs font-bold text-cyan-400">
                      Explore
                      <FiArrowRight className="transition-transform group-hover:translate-x-1" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================
          LEARNING HUB
         ===================================================== */}

      <section className="relative px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-blue-500/10 via-white/[0.03] to-violet-500/10 p-8 backdrop-blur-xl sm:p-12">
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
              <div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-400/10 text-blue-300">
                  <FiBookOpen className="h-7 w-7" />
                </div>

                <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-blue-400">
                  Learning Hub
                </p>

                <h2 className="mt-2 text-3xl font-black sm:text-4xl">
                  Learn ISL while using the platform
                </h2>

                <p className="mt-5 leading-8 text-slate-400">
                  The Learning Hub provides dedicated categories for
                  beginners and regular practice. Each category can open its
                  complete sign reference sheet, with tutorials available
                  where provided.
                </p>

                <Link
                  to="/learning"
                  className="mt-7 inline-flex items-center gap-2 rounded-xl bg-blue-400 px-5 py-3 text-sm font-bold text-slate-950"
                >
                  Explore Learning Hub
                  <FiArrowRight />
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  "Alphabet",
                  "Numbers",
                  "Emergency",
                  "Family",
                  "Greetings",
                  "Food & Drinks",
                  "Daily Conversation",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/10 p-4"
                  >
                    <FiCheckCircle className="shrink-0 text-cyan-400" />
                    <span className="text-sm font-medium text-slate-300">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          HISTORY
         ===================================================== */}

      <section className="relative px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionTitle
            eyebrow="Translation History"
            title="Your translations stay organized"
            description="Review what you translated and understand how your translation activity changes over time."
          />

          <div className="grid gap-6 lg:grid-cols-2">
            <InfoCard
              icon={<FiClock />}
              title="Recent Translations"
              description="View recent Sign to Text, Text to Sign, and Speech to Sign translation events in one place."
            />

            <InfoCard
              icon={<FiTrendingUp />}
              title="Confidence & Activity"
              description="Review confidence information and translation activity to understand how the system is performing."
            />

            <InfoCard
              icon={<FiDatabase />}
              title="Persistent Storage"
              description="Translation records can be stored through the application's history system instead of disappearing after leaving a page."
            />

            <InfoCard
              icon={<FiShield />}
              title="Simple Access"
              description="The application can maintain local history for users without login while authenticated users can use backend history storage."
            />
          </div>

          <div className="mt-8 text-center">
            <Link
              to="/history"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold transition hover:bg-white/10"
            >
              View Translation History
              <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================
          DASHBOARD
         ===================================================== */}

      <section className="relative px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
                Dashboard
              </p>

              <h2 className="mt-3 text-3xl font-black sm:text-4xl">
                Your translation control center
              </h2>

              <p className="mt-5 leading-8 text-slate-400">
                The Dashboard brings your activity and system information
                together. It provides a quick overview without needing to
                inspect every translation individually.
              </p>

              <Link
                to="/dashboard"
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white/10 px-5 py-3 text-sm font-semibold transition hover:bg-white/15"
              >
                Open Dashboard
                <FiArrowRight />
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <DashboardCard
                icon={<FiActivity />}
                title="Translation Activity"
                text="See how many translations are being made throughout the day."
              />

              <DashboardCard
                icon={<FiTrendingUp />}
                title="Accuracy"
                text="View confidence and average recognition performance."
              />

              <DashboardCard
                icon={<FiClock />}
                title="Recent Activity"
                text="Quickly access your latest translation records."
              />

              <DashboardCard
                icon={<FiShield />}
                title="System Health"
                text="Monitor camera, model, API, and history status."
              />
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          SETTINGS
         ===================================================== */}

      <section className="relative px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl sm:p-12">
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
              <div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800 text-slate-300">
                  <FiSettings className="h-7 w-7" />
                </div>

                <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                  Personalization
                </p>

                <h2 className="mt-2 text-3xl font-black">
                  Configure your experience
                </h2>

                <p className="mt-5 leading-8 text-slate-400">
                  Settings gives users control over application preferences
                  and communication options so the translator can be
                  adjusted to their needs.
                </p>

                <Link
                  to="/settings"
                  className="mt-7 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold transition hover:bg-white/10"
                >
                  Open Settings
                  <FiSettings />
                </Link>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <SettingFeature
                  icon={<FiMonitor />}
                  text="Appearance & Theme"
                />

                <SettingFeature
                  icon={<FiGlobe />}
                  text="Language Preferences"
                />

                <SettingFeature
                  icon={<FiCamera />}
                  text="Camera Quality"
                />

                <SettingFeature
                  icon={<FiVolume2 />}
                  text="Speech Settings"
                />

                <SettingFeature
                  icon={<FiWifi />}
                  text="Notifications"
                />

                <SettingFeature
                  icon={<FiShield />}
                  text="Application Preferences"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          TECHNOLOGY
         ===================================================== */}

      <section className="relative px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionTitle
            eyebrow="Technology Stack"
            title="Built with modern technologies"
            description="SignBridge combines frontend development, backend APIs, computer vision, artificial intelligence, and database technologies."
          />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {technologies.map((technology, index) => {
              const Icon = technology.icon;

              return (
                <motion.div
                  key={technology.name}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.06 }}
                  className="flex items-center gap-5 rounded-2xl border border-white/10 bg-white/[0.035] p-5 backdrop-blur-xl"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
                    <Icon className="h-6 w-6" />
                  </div>

                  <div className="min-w-0">
                    <h3 className="font-bold text-white">
                      {technology.name}
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      {technology.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================
          VALUES
         ===================================================== */}

      <section className="relative px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionTitle
            eyebrow="Our Principles"
            title="Technology designed around people"
            description="The project is guided by accessibility, innovation, reliability, and inclusion."
          />

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value, index) => {
              const Icon = value.icon;

              return (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.07 }}
                  className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-center backdrop-blur-xl"
                >
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-cyan-400/10 text-cyan-300">
                    <Icon className="h-6 w-6" />
                  </div>

                  <h3 className="mt-5 font-bold text-white">
                    {value.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-slate-400">
                    {value.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================
          TEAM
         ===================================================== */}

      <section className="relative px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionTitle
            eyebrow="Our Team"
            title="Built as a collaborative engineering project"
            description="SignBridge is developed as a team project focused on applying AI and modern web technologies to a real communication challenge."
          />

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                whileHover={{ y: -5 }}
                className="rounded-3xl border border-white/10 bg-white/[0.04] p-7 text-center backdrop-blur-xl"
              >
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-cyan-400/20 bg-gradient-to-br from-cyan-400/20 to-blue-500/10 text-xl font-black text-cyan-300">
                  {member.initials}
                </div>

                <h3 className="mt-5 font-bold text-white">
                  {member.name}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  {member.role}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          MISSION / VISION
         ===================================================== */}

      <section className="relative px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 lg:grid-cols-2">
            <motion.div
              whileHover={{ y: -4 }}
              className="rounded-[2rem] border border-cyan-400/10 bg-gradient-to-br from-cyan-400/10 to-blue-500/5 p-8 backdrop-blur-xl sm:p-10"
            >
              <FiTarget className="h-8 w-8 text-cyan-300" />

              <h2 className="mt-6 text-3xl font-black">
                Our Mission
              </h2>

              <p className="mt-5 leading-8 text-slate-400">
                To develop an accessible and practical technology platform
                that helps bridge communication gaps involving Indian Sign
                Language through real-time translation, visual learning, and
                intelligent assistance.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -4 }}
              className="rounded-[2rem] border border-violet-400/10 bg-gradient-to-br from-violet-400/10 to-blue-500/5 p-8 backdrop-blur-xl sm:p-10"
            >
              <FiHeart className="h-8 w-8 text-violet-300" />

              <h2 className="mt-6 text-3xl font-black">
                Our Vision
              </h2>

              <p className="mt-5 leading-8 text-slate-400">
                A future where technology helps people communicate more
                naturally across language differences and where Indian Sign
                Language can be learned and used through accessible digital
                tools.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* =====================================================
          FINAL CTA
         ===================================================== */}

      <section className="relative px-4 pb-24 pt-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-[2.5rem] border border-cyan-400/10 bg-gradient-to-r from-cyan-400/10 via-blue-500/10 to-violet-500/10 p-8 text-center backdrop-blur-xl sm:p-12"
          >
            <div className="absolute -left-20 -top-20 h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl" />

            <div className="relative">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
                <FiZap className="h-8 w-8" />
              </div>

              <h2 className="mt-6 text-3xl font-black sm:text-4xl">
                Experience SignBridge
              </h2>

              <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
                Explore the translator, learn Indian Sign Language, review
                your translation activity, and discover how AI can support
                more inclusive communication.
              </p>

              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Link
                  to="/sign-to-text"
                  className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300"
                >
                  Start Translating
                  <FiArrowRight />
                </Link>

                <Link
                  to="/learning"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold transition hover:bg-white/10"
                >
                  Explore Learning Hub
                  <FiBookOpen />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* =====================================================
          FOOTER
         ===================================================== */}

      <footer className="relative border-t border-white/10 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
          <div>
            <p className="font-bold text-white">SignBridge</p>
            <p className="mt-1 text-xs text-slate-500">
              Bidirectional Indian Sign Language Translator
            </p>
          </div>

          <p className="text-xs text-slate-600">
            AI • Accessibility • Innovation
          </p>
        </div>
      </footer>
    </div>
  );
}

/* =========================================================
   SMALL COMPONENTS
   ========================================================= */

function HeroStat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/10 p-5 backdrop-blur-xl">
      <div className="text-cyan-300">{icon}</div>

      <p className="mt-3 text-2xl font-black text-white">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {label}
      </p>
    </div>
  );
}

function InfoCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="rounded-3xl border border-white/10 bg-white/[0.04] p-7 backdrop-blur-xl"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
        {icon}
      </div>

      <h3 className="mt-5 text-xl font-bold text-white">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-7 text-slate-400">
        {description}
      </p>
    </motion.div>
  );
}

function Step({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.025] px-4 py-3">
      <FiCheckCircle className="shrink-0 text-cyan-400" />

      <span className="text-sm text-slate-300">
        {text}
      </span>
    </div>
  );
}

function FlowVisual({
  title,
  items,
}: {
  title: string;
  items: {
    icon: React.ReactNode;
    title: string;
    text: string;
  }[];
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-7 backdrop-blur-xl sm:p-9"
    >
      <div className="mb-7 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
            System Flow
          </p>

          <h3 className="mt-2 text-xl font-bold">
            {title}
          </h3>
        </div>

        <FiActivity className="text-xl text-cyan-400" />
      </div>

      <div className="space-y-4">
        {items.map((item, index) => (
          <div
            key={item.title}
            className="relative flex items-center gap-4"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-cyan-300">
              {item.icon}
            </div>

            <div className="min-w-0 flex-1">
              <p className="font-bold text-white">
                {item.title}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {item.text}
              </p>
            </div>

            {index < items.length - 1 && (
              <div className="absolute left-6 top-12 h-4 w-px bg-white/10" />
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function DashboardCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 backdrop-blur-xl">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
        {icon}
      </div>

      <h3 className="mt-4 font-bold text-white">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {text}
      </p>
    </div>
  );
}

function SettingFeature({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/10 p-4">
      <div className="text-slate-400">
        {icon}
      </div>

      <span className="text-sm text-slate-300">
        {text}
      </span>
    </div>
  );
}