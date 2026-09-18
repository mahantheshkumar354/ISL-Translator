import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

import {
  FiArrowLeft,
  FiBookOpen,
  FiCheck,
  FiChevronRight,
  FiClock,
  FiExternalLink,
  FiLayers,
  FiSearch,
  FiStar,
  FiTarget,
  FiTrendingUp,
  FiX,
  FiMic,
  FiCamera,
  FiType,
} from "react-icons/fi";

import {
  FaExclamationTriangle,
  FaFont,
  FaHashtag,
  FaUtensils,
  FaComments,
  FaUsers,
  FaYoutube,
} from "react-icons/fa";

import type { IconType } from "react-icons";

type Category = {
  id: string;
  name: string;
  description: string;
  image: string;
  icon: IconType;
  color: string;
  signs: string;
  tutorial?: string;
};

type Course = {
  id: string;
  title: string;
  description: string;
  playlist: string;
  duration: string;
  level: string;
  creator: string;
};

const categories: Category[] = [
  {
    id: "alphabet",
    name: "Alphabets",
    description:
      "Learn the Indian Sign Language alphabet and practice individual hand signs.",
    image: "/learning/alphabets.jpeg",
    icon: FaFont,
    color: "from-blue-500 to-cyan-500",
    signs: "A–Z",
    tutorial:
      "https://youtu.be/Vj_13bdU4dU?si=4fY1WhqwPRLn_xc1",
  },

  {
    id: "numbers",
    name: "Numbers",
    description:
      "Learn commonly used numbers and number signs in Indian Sign Language.",
    image: "/learning/Numbers.jpeg",
    icon: FaHashtag,
    color: "from-violet-500 to-purple-500",
    signs: "0–100",
    tutorial:
      "https://youtu.be/d1JrymWjl-0?si=06mug8eJZSwQsjFU",
  },

  {
    id: "emergency",
    name: "Emergency",
    description:
      "Learn important signs that can be useful during emergency situations.",
    image: "/learning/Emergency.jpeg",
    icon: FaExclamationTriangle,
    color: "from-red-500 to-orange-500",
    signs: "12+ signs",
  },

  {
    id: "family",
    name: "Family",
    description:
      "Learn signs for family members and commonly used family-related words.",
    image: "/learning/Family.jpeg",
    icon: FaUsers,
    color: "from-pink-500 to-rose-500",
    signs: "20+ signs",
    tutorial:
      "https://youtu.be/drs0_jcKr5w?si=kqcUdqVI_3Nc8HGs",
  },

  {
    id: "greetings",
    name: "Greetings",
    description:
      "Learn everyday greetings and polite expressions in Indian Sign Language.",
    image: "/learning/greetings.jpeg",
    icon: FiStar,
    color: "from-amber-500 to-yellow-500",
    signs: "15+ signs",
    tutorial:
      "https://youtu.be/U5LSlcD8xPg?si=9nUgIqDC48eLB-Qn",
  },

  {
    id: "food",
    name: "Food & Drinks",
    description:
      "Learn signs for common food items, meals and drinks.",
    image: "/learning/Food and Drinks.jpeg",
    icon: FaUtensils,
    color: "from-emerald-500 to-green-500",
    signs: "30+ signs",
    tutorial:
      "https://youtu.be/tov9L5CTVzY?si=MWW_Kh6YuQrkjuVa",
  },

  {
    id: "conversation",
    name: "Daily Conversation",
    description:
      "Practice useful signs and phrases for everyday conversations.",
    image: "/learning/Daily Conversation.jpeg",
    icon: FaComments,
    color: "from-cyan-500 to-blue-500",
    signs: "40+ signs",
    tutorial:
      "https://youtu.be/tov9L5CTVzY?si=MWW_Kh6YuQrkjuVa",
  },
];

const courses: Course[] = [
  {
    id: "complete-isl",
    title: "Complete ISL Learning Course",
    description:
      "Learn Indian Sign Language through a structured collection of lessons and practical demonstrations.",
    playlist:
      "https://youtube.com/playlist?list=PLxYMaKXKMMcMgg4f47WkG7AM0bb3AyjTi&si=xpMQeEtBHGAlnCBi",
    duration: "Complete Course",
    level: "Beginner",
    creator:
      "Pragya Gupta — Indian Sign Language Research and Training Centre",
  },

  {
    id: "isl-practice",
    title: "Indian Sign Language Practice",
    description:
      "Practice commonly used Indian Sign Language signs and improve your communication skills.",
    playlist:
      "https://youtube.com/playlist?list=PLFjydPMg4DapfRTBMokl09Ht-fhMOAYf6&si=uqBtyd5Cv3ITjHbA",
    duration: "Practice Course",
    level: "Beginner",
    creator:
      "Pragya Gupta — Indian Sign Language Research and Training Centre",
  },
];

const progressKey = "isl-learning-progress";

const getYouTubeVideoId = (
  url: string
): string | null => {
  try {
    const parsed = new URL(url);

    if (parsed.hostname === "youtu.be") {
      return parsed.pathname.slice(1);
    }

    if (
      parsed.hostname.includes("youtube.com") &&
      parsed.pathname === "/watch"
    ) {
      return parsed.searchParams.get("v");
    }

    if (
      parsed.hostname.includes("youtube.com") &&
      parsed.pathname.startsWith("/shorts/")
    ) {
      return parsed.pathname.split("/")[2] || null;
    }

    if (
      parsed.hostname.includes("youtube.com") &&
      parsed.pathname.startsWith("/embed/")
    ) {
      return parsed.pathname.split("/")[2] || null;
    }

    return null;
  } catch {
    return null;
  }
};

export default function LearningHub() {
  const [search, setSearch] = useState("");

  const [selectedCategory, setSelectedCategory] =
    useState<Category | null>(null);

  const [tutorialCategory, setTutorialCategory] =
    useState<Category | null>(null);

  const [previewImage, setPreviewImage] =
    useState<Category | null>(null);

  const [completed, setCompleted] =
    useState<string[]>(() => {
      try {
        const saved =
          localStorage.getItem(progressKey);

        if (!saved) {
          return [];
        }

        const parsed: unknown =
          JSON.parse(saved);

        if (Array.isArray(parsed)) {
          return parsed.filter(
            (item): item is string =>
              typeof item === "string"
          );
        }

        return [];
      } catch {
        return [];
      }
    });

  const filteredCategories = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    if (!query) {
      return categories;
    }

    return categories.filter(
      (category) =>
        [
          category.name,
          category.description,
          category.signs,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query)
    );
  }, [search]);

  const markComplete = (
    categoryId: string
  ) => {
    setCompleted((previous) => {
      if (
        previous.includes(categoryId)
      ) {
        return previous;
      }

      const next = [
        ...previous,
        categoryId,
      ];

      localStorage.setItem(
        progressKey,
        JSON.stringify(next)
      );

      return next;
    });
  };

  const progress =
    categories.length > 0
      ? Math.round(
          (completed.length /
            categories.length) *
            100
        )
      : 0;

  const tutorialVideoId =
    tutorialCategory?.tutorial
      ? getYouTubeVideoId(
          tutorialCategory.tutorial
        )
      : null;

  return (
    <div className="min-h-screen text-white">

      {/* =========================================================
          HEADER
         ========================================================= */}

      <div className="mb-8">
        <Link
          to="/home"
          className="mb-5 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
        >
          <FiArrowLeft />
          Back to Home
        </Link>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">

          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-300">
              <FiBookOpen />
              LEARNING HUB
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Learn Indian Sign Language
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
              Build your ISL vocabulary step by step with
              interactive categories, tutorials and practical
              learning resources.
            </p>
          </div>

          {/* Progress */}

          <div className="w-full rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:w-72">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-xs text-slate-400">
                  Your Progress
                </p>

                <p className="mt-1 text-2xl font-bold">
                  {progress}%
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                <FiTrendingUp />
              </div>

            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
                initial={{
                  width: 0,
                }}
                animate={{
                  width: `${progress}%`,
                }}
                transition={{
                  duration: 0.8,
                  ease: "easeOut",
                }}
              />
            </div>

            <p className="mt-2 text-xs text-slate-500">
              {completed.length} of{" "}
              {categories.length} categories completed
            </p>

          </div>

        </div>
      </div>


      {/* =========================================================
          HOW TO USE
         ========================================================= */}

      <section className="mb-10">

        <div className="mb-5">

          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
            Getting Started
          </p>

          <h2 className="mt-1 text-2xl font-bold">
            How to use the translator
          </h2>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
            Your ISL Translator supports three translation
            modes. Choose the mode that matches the way you
            want to communicate.
          </p>

        </div>


        <div className="grid gap-5 lg:grid-cols-3">

          {/* =====================================================
              SIGN TO TEXT
             ===================================================== */}

          <motion.div
            whileHover={{
              y: -3,
            }}
            className="rounded-3xl border border-blue-400/10 bg-white/[0.03] p-6"
          >

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-xl text-blue-400">
              <FiCamera />
            </div>

            <h3 className="mt-5 text-xl font-bold">
              Sign-to-Text
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Convert Indian Sign Language gestures captured
              through your camera into text.
            </p>

            <div className="mt-5 space-y-3">

              {[
                "Open Sign-to-Text from the sidebar.",
                "Allow the website to access your camera.",
                "Position your hand clearly inside the camera area.",
                "Make an ISL sign and hold it steadily.",
                "The AI model detects your hand landmarks and predicts the sign.",
                "The recognized sign appears as text.",
                "Use the voice option to hear the recognized result.",
              ].map(
                (step, index) => (
                  <div
                    key={step}
                    className="flex gap-3"
                  >

                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-xs font-bold text-blue-300">
                      {index + 1}
                    </div>

                    <p className="text-xs leading-5 text-slate-400">
                      {step}
                    </p>

                  </div>
                )
              )}

            </div>

            <Link
              to="/sign-to-text"
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-500/10 px-4 py-3 text-sm font-semibold text-blue-300 transition hover:bg-blue-500/20"
            >
              Try Sign-to-Text
              <FiChevronRight />
            </Link>

          </motion.div>


          {/* =====================================================
              TEXT TO SIGN
             ===================================================== */}

          <motion.div
            whileHover={{
              y: -3,
            }}
            className="rounded-3xl border border-violet-400/10 bg-white/[0.03] p-6"
          >

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10 text-xl text-violet-400">
              <FiType />
            </div>

            <h3 className="mt-5 text-xl font-bold">
              Text-to-Sign
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Enter text and learn how the corresponding
              Indian Sign Language signs are performed.
            </p>

            <div className="mt-5 space-y-3">

              {[
                "Open Text-to-Sign from the sidebar.",
                "Type a word, phrase or sentence into the input box.",
                "Start the translation.",
                "The system separates the input into individual words.",
                "Available ISL sign animations are displayed in sequence.",
                "Watch each sign carefully and practice along with the animation.",
                "Use the controls to pause, replay or continue practicing.",
              ].map(
                (step, index) => (
                  <div
                    key={step}
                    className="flex gap-3"
                  >

                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-500/10 text-xs font-bold text-violet-300">
                      {index + 1}
                    </div>

                    <p className="text-xs leading-5 text-slate-400">
                      {step}
                    </p>

                  </div>
                )
              )}

            </div>

            <Link
              to="/text-to-sign"
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-500/10 px-4 py-3 text-sm font-semibold text-violet-300 transition hover:bg-violet-500/20"
            >
              Try Text-to-Sign
              <FiChevronRight />
            </Link>

          </motion.div>


          {/* =====================================================
              SPEECH TO SIGN
             ===================================================== */}

          <motion.div
            whileHover={{
              y: -3,
            }}
            className="rounded-3xl border border-cyan-400/10 bg-white/[0.03] p-6"
          >

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-xl text-cyan-400">
              <FiMic />
            </div>

            <h3 className="mt-5 text-xl font-bold">
              Speech-to-Sign
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Speak naturally and convert your spoken words
              into Indian Sign Language animations.
            </p>

            <div className="mt-5 space-y-3">

              {[
                "Open Speech-to-Sign from the sidebar.",
                "Allow microphone access when your browser asks.",
                "Press the microphone or start button.",
                "Speak clearly at a comfortable pace.",
                "The speech recognition system converts your voice into text.",
                "The recognized text is converted into available ISL signs.",
                "Watch the sign animations and practice the displayed signs.",
              ].map(
                (step, index) => (
                  <div
                    key={step}
                    className="flex gap-3"
                  >

                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-500/10 text-xs font-bold text-cyan-300">
                      {index + 1}
                    </div>

                    <p className="text-xs leading-5 text-slate-400">
                      {step}
                    </p>

                  </div>
                )
              )}

            </div>

            <Link
              to="/speech-to-sign"
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500/10 px-4 py-3 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-500/20"
            >
              Try Speech-to-Sign
              <FiChevronRight />
            </Link>

          </motion.div>

        </div>


        {/* Quick flow */}

        <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.025] p-5">

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

            <div>

              <h3 className="font-semibold">
                Which mode should I use?
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Choose based on what you want to translate.
              </p>

            </div>

            <div className="flex flex-wrap gap-2">

              <span className="rounded-full bg-blue-500/10 px-3 py-1.5 text-xs text-blue-300">
                Gesture → Text
              </span>

              <span className="rounded-full bg-violet-500/10 px-3 py-1.5 text-xs text-violet-300">
                Text → Sign
              </span>

              <span className="rounded-full bg-cyan-500/10 px-3 py-1.5 text-xs text-cyan-300">
                Speech → Sign
              </span>

            </div>

          </div>

        </div>

      </section>


      {/* =========================================================
          SEARCH
         ========================================================= */}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>

          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
            Explore
          </p>

          <h2 className="mt-1 text-2xl font-bold">
            Learning Categories
          </h2>

        </div>

        <div className="relative w-full sm:max-w-xs">

          <FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search signs..."
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-400/40 focus:bg-white/[0.06]"
          />

        </div>

      </div>


      {/* =========================================================
          CATEGORY GRID
         ========================================================= */}

      <section className="mb-12">

        {filteredCategories.length === 0 ? (

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center">

            <FiSearch className="mx-auto text-3xl text-slate-500" />

            <h3 className="mt-4 text-lg font-semibold">
              No categories found
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Try searching for another sign category.
            </p>

          </div>

        ) : (

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">

            {filteredCategories.map(
              (category, index) => {

                const Icon = category.icon;

                const isCompleted =
                  completed.includes(
                    category.id
                  );

                return (

                  <motion.div
                    key={category.id}
                    initial={{
                      opacity: 0,
                      y: 20,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      delay: index * 0.05,
                    }}
                    className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] transition duration-300 hover:-translate-y-1 hover:border-blue-400/20 hover:bg-white/[0.045]"
                  >

                    {/* IMAGE */}

                    <button
                      type="button"
                      onClick={() =>
                        setPreviewImage(
                          category
                        )
                      }
                      className="relative block h-52 w-full cursor-zoom-in overflow-hidden text-left"
                      title={`Open ${category.name} image`}
                    >

                      <img
                        src={category.image}
                        alt={category.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        onError={(event) => {
                          event.currentTarget.style.opacity =
                            "0.35";
                        }}
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                      <div className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950/70 text-white backdrop-blur-md">
                        <Icon />
                      </div>

                      {isCompleted && (
                        <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-emerald-500/90 px-3 py-1.5 text-xs font-semibold text-white shadow-lg">

                          <FiCheck />
                          Complete

                        </div>
                      )}

                      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">

                        <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-slate-200 backdrop-blur-md">
                          {category.signs}
                        </span>

                        <span className="rounded-full border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-slate-200 backdrop-blur-md">
                          Click to view
                        </span>

                      </div>

                    </button>


                    {/* Content */}

                    <div className="p-5">

                      <h3 className="text-xl font-bold">
                        {category.name}
                      </h3>

                      <p className="mt-2 min-h-[48px] text-sm leading-6 text-slate-400">
                        {category.description}
                      </p>

                      <div className="mt-5 flex items-center gap-2">

                        <button
                          type="button"
                          onClick={() =>
                            setSelectedCategory(
                              category
                            )
                          }
                          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold transition hover:bg-white/[0.08]"
                        >
                          Open Sheet
                          <FiChevronRight />
                        </button>

                        {category.tutorial && (

                          <button
                            type="button"
                            onClick={() =>
                              setTutorialCategory(
                                category
                              )
                            }
                            title="Watch tutorial"
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-red-400/20 bg-red-500/10 text-red-400 transition hover:bg-red-500/20"
                          >
                            <FaYoutube />
                          </button>

                        )}

                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          markComplete(
                            category.id
                          )
                        }
                        disabled={isCompleted}
                        className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                          isCompleted
                            ? "cursor-default bg-emerald-500/10 text-emerald-400"
                            : "bg-blue-500/10 text-blue-300 hover:bg-blue-500/20"
                        }`}
                      >

                        <FiCheck />

                        {isCompleted
                          ? "Completed"
                          : "Mark as Complete"}

                      </button>

                    </div>

                  </motion.div>

                );
              }
            )}

          </div>

        )}

      </section>


      {/* =========================================================
          COURSES
         ========================================================= */}

      <section className="mb-12">

        <div className="mb-5">

          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
            Structured Learning
          </p>

          <h2 className="mt-1 text-2xl font-bold">
            Featured Courses
          </h2>

          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            Follow complete learning playlists to improve
            your Indian Sign Language skills step by step.
          </p>

        </div>

        <div className="grid gap-5 lg:grid-cols-2">

          {courses.map(
            (course, index) => (

              <motion.div
                key={course.id}
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: index * 0.08,
                }}
                className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-blue-400/20 hover:bg-white/[0.045]"
              >

                <div className="flex items-start justify-between gap-4">

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10 text-xl text-blue-400">
                    <FiLayers />
                  </div>

                  <div className="flex flex-wrap justify-end gap-2">

                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-slate-400">
                      {course.level}
                    </span>

                    <span className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-slate-400">
                      <FiClock />
                      {course.duration}
                    </span>

                  </div>

                </div>

                <h3 className="mt-5 text-xl font-bold">
                  {course.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {course.description}
                </p>

                {/* Creator */}

                <div className="mt-4 rounded-xl border border-blue-400/10 bg-blue-500/[0.04] px-4 py-3">

                  <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-400">
                    Course Creator
                  </p>

                  <p className="mt-1 text-sm font-medium leading-5 text-slate-300">
                    {course.creator}
                  </p>

                </div>

                <a
                  href={course.playlist}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-red-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-400"
                >
                  <FaYoutube />
                  Open Playlist
                  <FiExternalLink />
                </a>

              </motion.div>

            )
          )}

        </div>

      </section>


      {/* =========================================================
          TIPS
         ========================================================= */}

      <section className="rounded-3xl border border-blue-400/10 bg-gradient-to-br from-blue-500/[0.08] to-cyan-500/[0.03] p-6 sm:p-8">

        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
            <FiTarget />
          </div>

          <div>

            <h2 className="text-xl font-bold">
              Tips for learning ISL
            </h2>

            <div className="mt-4 grid gap-3 text-sm leading-6 text-slate-400 sm:grid-cols-2">

              <p>
                • Practice signs regularly instead of
                trying to learn everything at once.
              </p>

              <p>
                • Pay attention to hand position,
                movement and facial expressions.
              </p>

              <p>
                • Repeat signs while watching the
                demonstrations.
              </p>

              <p>
                • Use the Sign-to-Text translator to
                practice your recognition skills.
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* =========================================================
          IMAGE PREVIEW MODAL
         ========================================================= */}

      <AnimatePresence>

        {previewImage && (

          <motion.div
            className="fixed inset-0 z-[120] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            onClick={() =>
              setPreviewImage(null)
            }
          >

            <motion.div
              initial={{
                opacity: 0,
                scale: 0.9,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                scale: 0.9,
              }}
              onClick={(event) =>
                event.stopPropagation()
              }
              className="relative max-h-[92vh] w-full max-w-5xl"
            >

              <button
                type="button"
                onClick={() =>
                  setPreviewImage(null)
                }
                className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-xl bg-black/60 text-white backdrop-blur-md transition hover:bg-black/80"
              >
                <FiX />
              </button>

              <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950 shadow-2xl">

                <div className="max-h-[80vh] overflow-auto bg-black">

                  <img
                    src={previewImage.image}
                    alt={previewImage.name}
                    className="mx-auto max-h-[80vh] w-auto max-w-full object-contain"
                  />

                </div>

                <div className="border-t border-white/10 p-5">

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                    <div>

                      <p className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                        Learning Reference
                      </p>

                      <h2 className="mt-1 text-xl font-bold">
                        {previewImage.name}
                      </h2>

                    </div>

                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-slate-400">
                      {previewImage.signs}
                    </span>

                  </div>

                </div>

              </div>

            </motion.div>

          </motion.div>

        )}

      </AnimatePresence>


      {/* =========================================================
          CATEGORY SHEET MODAL
         ========================================================= */}

      <AnimatePresence>

        {selectedCategory && (

          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            onClick={() =>
              setSelectedCategory(null)
            }
          >

            <motion.div
              initial={{
                opacity: 0,
                scale: 0.94,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                scale: 0.94,
              }}
              onClick={(event) =>
                event.stopPropagation()
              }
              className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/10 bg-slate-950 shadow-2xl"
            >

              <div className="relative h-64 overflow-hidden">

                <img
                  src={selectedCategory.image}
                  alt={selectedCategory.name}
                  className="h-full w-full object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

                <button
                  type="button"
                  onClick={() =>
                    setSelectedCategory(null)
                  }
                  className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-xl bg-black/40 text-white backdrop-blur-md transition hover:bg-black/60"
                >
                  <FiX />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPreviewImage(
                      selectedCategory
                    );

                    setSelectedCategory(
                      null
                    );
                  }}
                  className="absolute bottom-5 right-5 rounded-xl bg-black/50 px-4 py-2 text-xs font-semibold text-white backdrop-blur-md transition hover:bg-black/70"
                >
                  View Image
                </button>

                <div className="absolute bottom-5 left-6">

                  <p className="text-sm text-blue-300">
                    Learning Category
                  </p>

                  <h2 className="mt-1 text-3xl font-bold">
                    {selectedCategory.name}
                  </h2>

                </div>

              </div>


              <div className="p-6">

                <p className="leading-7 text-slate-400">
                  {selectedCategory.description}
                </p>

                <div className="mt-5 flex flex-wrap gap-2">

                  <span className="rounded-full bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-300">
                    {selectedCategory.signs}
                  </span>

                  {completed.includes(
                    selectedCategory.id
                  ) && (

                    <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400">
                      <FiCheck />
                      Completed
                    </span>

                  )}

                </div>


                <div className="mt-6 flex flex-col gap-3 sm:flex-row">

                  {selectedCategory.tutorial && (

                    <button
                      type="button"
                      onClick={() => {
                        setTutorialCategory(
                          selectedCategory
                        );

                        setSelectedCategory(
                          null
                        );
                      }}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500 px-5 py-3 text-sm font-semibold transition hover:bg-red-400"
                    >
                      <FaYoutube />
                      Watch Tutorial
                    </button>

                  )}

                  <button
                    type="button"
                    onClick={() =>
                      markComplete(
                        selectedCategory.id
                      )
                    }
                    disabled={completed.includes(
                      selectedCategory.id
                    )}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-500/10 px-5 py-3 text-sm font-semibold text-blue-300 transition hover:bg-blue-500/20 disabled:cursor-default disabled:text-emerald-400"
                  >

                    <FiCheck />

                    {completed.includes(
                      selectedCategory.id
                    )
                      ? "Completed"
                      : "Mark as Complete"}

                  </button>

                </div>

              </div>

            </motion.div>

          </motion.div>

        )}

      </AnimatePresence>


      {/* =========================================================
          YOUTUBE VIDEO MODAL
         ========================================================= */}

      <AnimatePresence>

        {tutorialCategory && (

          <motion.div
            className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            onClick={() =>
              setTutorialCategory(null)
            }
          >

            <motion.div
              initial={{
                opacity: 0,
                scale: 0.94,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                scale: 0.94,
              }}
              onClick={(event) =>
                event.stopPropagation()
              }
              className="max-h-[94vh] w-full max-w-5xl overflow-y-auto rounded-3xl border border-white/10 bg-slate-950 p-4 shadow-2xl sm:p-6"
            >

              {/* Header */}

              <div className="flex items-start justify-between gap-4">

                <div>

                  <p className="text-sm font-medium text-red-400">
                    Video Tutorial
                  </p>

                  <h2 className="mt-1 text-2xl font-bold sm:text-3xl">
                    Learn {tutorialCategory.name}
                  </h2>

                  <p className="mt-2 text-sm text-slate-400">
                    Watch and practice the Indian Sign
                    Language signs directly on this website.
                  </p>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    setTutorialCategory(null)
                  }
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-slate-300 transition hover:bg-white/15 hover:text-white"
                >
                  <FiX />
                </button>

              </div>


              {/* Video */}

              <div className="mt-6">

                {tutorialVideoId ? (

                  <div className="overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl">

                    <div className="aspect-video w-full">

                      <iframe
                        className="h-full w-full"
                        src={`https://www.youtube.com/embed/${tutorialVideoId}?autoplay=1&rel=0`}
                        title={`${tutorialCategory.name} ISL tutorial`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />

                    </div>

                  </div>

                ) : (

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">

                    <FaYoutube className="mx-auto text-4xl text-red-400" />

                    <h3 className="mt-4 text-lg font-bold">
                      Tutorial unavailable
                    </h3>

                    <p className="mt-2 text-sm text-slate-400">
                      This tutorial could not be embedded.
                      You can still open it directly on
                      YouTube.
                    </p>

                  </div>

                )}

              </div>


              {/* Continue Watching */}

              <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center">

                <p className="text-sm text-slate-400">
                  Enjoying the lesson?
                </p>

                <h3 className="mt-1 text-base font-semibold text-white">
                  Continue watching on YouTube
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Open the original video if you want to
                  continue watching directly on YouTube.
                </p>

                <a
                  href={
                    tutorialCategory.tutorial
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-400"
                >
                  <FaYoutube />
                  Continue watching on YouTube
                  <FiExternalLink />
                </a>

              </div>


              {/* Close */}

              <div className="mt-4 flex justify-center">

                <button
                  type="button"
                  onClick={() =>
                    setTutorialCategory(null)
                  }
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
                >
                  <FiX />
                  Close Tutorial
                </button>

              </div>

            </motion.div>

          </motion.div>

        )}

      </AnimatePresence>

    </div>
  );
}