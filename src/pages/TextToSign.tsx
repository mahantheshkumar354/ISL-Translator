import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiType,
  FiPlay,
  FiPause,
  FiRotateCcw,
  FiFastForward,
  FiFilm,
  FiLayers,
  FiRewind,
  FiAlertCircle,
  FiCheckCircle,
  FiZap,
  FiCopy,
  FiVolume2,
  FiTrash2,
  FiArrowRight,
} from "react-icons/fi";

import GlassCard from "@/components/GlassCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import { translateText, saveHistory } from "@/services/api";

type WordBreakdown = {
  word: string;
  signAvailable: boolean;
  confidence?: number;
};

type TranslationResult = {
  text: string;
  wordBreakdown: WordBreakdown[];
};

type SignItem = {
  word: string;
  videoUrl: string;
  originalIndex: number;
  isAlphabetFallback: boolean;
  letter?: string;
};

const VIDEO_BASE_URL =
  "https://isl-translator-2.onrender.com/videos";

const AVAILABLE_VIDEOS = [
  "0.mp4",
  "1.mp4",
  "2.mp4",
  "3.mp4",
  "4.mp4",
  "5.mp4",
  "6.mp4",
  "7.mp4",
  "8.mp4",
  "9.mp4",

  "A.mp4",
  "B.mp4",
  "C.mp4",
  "D.mp4",
  "E.mp4",
  "F.mp4",
  "G.mp4",
  "H.mp4",
  "I.mp4",
  "J.mp4",
  "K.mp4",
  "L.mp4",
  "M.mp4",
  "N.mp4",
  "O.mp4",
  "P.mp4",
  "Q.mp4",
  "R.mp4",
  "S.mp4",
  "T.mp4",
  "U.mp4",
  "V.mp4",
  "W.mp4",
  "X.mp4",
  "Y.mp4",
  "Z.mp4",

  "After.mp4",
  "Again.mp4",
  "Against.mp4",
  "Age.mp4",
  "All.mp4",
  "Alone.mp4",
  "Also.mp4",
  "And.mp4",
  "Ask.mp4",
  "At.mp4",
  "Be.mp4",
  "Beautiful.mp4",
  "Before.mp4",
  "Best.mp4",
  "Better.mp4",
  "Busy.mp4",
  "But.mp4",
  "Bye.mp4",
  "Can.mp4",
  "Cannot.mp4",
  "Change.mp4",
  "College.mp4",
  "Come.mp4",
  "Computer.mp4",
  "Day.mp4",
  "Distance.mp4",
  "Do Not.mp4",
  "Do.mp4",
  "Does Not.mp4",
  "Eat.mp4",
  "Engineer.mp4",
  "Fight.mp4",
  "Finish.mp4",
  "From.mp4",
  "Glitter.mp4",
  "Go.mp4",
  "God.mp4",
  "Gold.mp4",
  "Good.mp4",
  "Great.mp4",
  "Hand.mp4",
  "Hands.mp4",
  "Happy.mp4",
  "Hello.mp4",
  "Help.mp4",
  "Her.mp4",
  "Here.mp4",
  "His.mp4",
  "Home.mp4",
  "Homepage.mp4",
  "How.mp4",
  "Invent.mp4",
  "It.mp4",
  "Keep.mp4",
  "Language.mp4",
  "Laugh.mp4",
  "Learn.mp4",
  "ME.mp4",
  "More.mp4",
  "My.mp4",
  "Name.mp4",
  "Next.mp4",
  "Not.mp4",
  "Now.mp4",
  "Of.mp4",
  "On.mp4",
  "Our.mp4",
  "Out.mp4",
  "Pretty.mp4",
  "Right.mp4",
  "Sad.mp4",
  "Safe.mp4",
  "See.mp4",
  "Self.mp4",
  "Sign.mp4",
  "Sing.mp4",
  "So.mp4",
  "Sound.mp4",
  "Stay.mp4",
  "Study.mp4",
  "Talk.mp4",
  "Television.mp4",
  "Thank You.mp4",
  "Thank.mp4",
  "That.mp4",
  "They.mp4",
  "This.mp4",
  "Those.mp4",
  "Time.mp4",
  "To.mp4",
  "Type.mp4",
  "Us.mp4",
  "Walk.mp4",
  "Wash.mp4",
  "Way.mp4",
  "We.mp4",
  "Welcome.mp4",
  "What.mp4",
  "When.mp4",
  "Where.mp4",
  "Which.mp4",
  "Who.mp4",
  "Whole.mp4",
  "Whose.mp4",
  "Why.mp4",
  "Will.mp4",
  "With.mp4",
  "Without.mp4",
  "Words.mp4",
  "Work.mp4",
  "World.mp4",
  "Wrong.mp4",
  "You.mp4",
  "Your.mp4",
  "Yourself.mp4",
];

/* --------------------------------------------------
   VIDEO LOOKUP
-------------------------------------------------- */

const VIDEO_LOOKUP = new Map<string, string>(
  AVAILABLE_VIDEOS.map((filename) => [
    filename.replace(/\.mp4$/i, "").trim().toLowerCase(),
    filename,
  ])
);

function cleanWord(word: string) {
  return word
    .trim()
    .replace(/[.,!?;:"'()[\]{}]/g, "")
    .trim();
}

function getVideoUrl(filename: string) {
  return `${VIDEO_BASE_URL}/${encodeURIComponent(filename)}`;
}

/* --------------------------------------------------
   CREATE SIGN PLAYBACK SEQUENCE
-------------------------------------------------- */

function createSignSequence(
  wordBreakdown: WordBreakdown[]
): SignItem[] {
  const sequence: SignItem[] = [];

  wordBreakdown.forEach((item, originalIndex) => {
    const word = cleanWord(item.word);

    if (!word) {
      return;
    }

    const normalized = word.toLowerCase();

    /*
     * First try complete word video.
     */
    const directVideo = VIDEO_LOOKUP.get(normalized);

    if (directVideo) {
      sequence.push({
        word,
        videoUrl: getVideoUrl(directVideo),
        originalIndex,
        isAlphabetFallback: false,
      });

      return;
    }

    /*
     * Alphabet fallback.
     *
     * Example:
     * FINE -> F -> I -> N -> E
     */
    const letters = word
      .toUpperCase()
      .split("")
      .filter((letter) => /^[A-Z]$/.test(letter));

    letters.forEach((letter) => {
      const letterVideo = VIDEO_LOOKUP.get(
        letter.toLowerCase()
      );

      if (letterVideo) {
        sequence.push({
          word,
          letter,
          videoUrl: getVideoUrl(letterVideo),
          originalIndex,
          isAlphabetFallback: true,
        });
      }
    });
  });

  return sequence;
}

export default function TextToSign() {
  const [text, setText] = useState("");

  const [isTranslating, setIsTranslating] =
    useState(false);

  const [result, setResult] =
    useState<TranslationResult | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);

  const [playbackSpeed, setPlaybackSpeed] =
    useState(1);

  const [currentSignIndex, setCurrentSignIndex] =
    useState(0);

  const [videoLoading, setVideoLoading] =
    useState(false);

  const [videoError, setVideoError] =
    useState(false);

  const [transitioning, setTransitioning] =
    useState(false);

  const [copied, setCopied] = useState(false);

  const videoRef =
    useRef<HTMLVideoElement | null>(null);

  const autoPlayRef = useRef(false);

  /*
   * Create playback sequence.
   */
  const signSequence = useMemo(() => {
    if (!result) {
      return [];
    }

    return createSignSequence(
      result.wordBreakdown
    );
  }, [result]);

  const currentSign =
    signSequence[currentSignIndex];

  const nextSign =
    signSequence[currentSignIndex + 1];

  const currentOriginalIndex =
    currentSign?.originalIndex ?? -1;

  const progress =
    signSequence.length > 0
      ? ((currentSignIndex + 1) /
          signSequence.length) *
        100
      : 0;

  /*
   * Translate text.
   */
  const handleTranslate = async () => {
    const inputText = text.trim();

    if (!inputText) {
      return;
    }

    setIsTranslating(true);
    setIsPlaying(false);
    autoPlayRef.current = false;
    setVideoError(false);
    setCurrentSignIndex(0);

    try {
      const data =
        await translateText(inputText);

      setResult(data);

      /*
       * Save one History record.
       */
      const confidenceValues =
        data.wordBreakdown
          .map(
            (word) => word.confidence
          )
          .filter(
            (
              confidence
            ): confidence is number =>
              typeof confidence ===
              "number"
          );

      const averageConfidence =
        confidenceValues.length > 0
          ? confidenceValues.reduce(
              (sum, confidence) =>
                sum + confidence,
              0
            ) /
            confidenceValues.length
          : 1;

      void saveHistory({
        type: "text-to-sign",
        input: inputText,
        output:
          data.text || inputText,
        confidence:
          averageConfidence,
      }).catch((error) => {
        console.warn(
          "Could not save text-to-sign history:",
          error
        );
      });

      /*
       * Automatically start playback.
       */
      autoPlayRef.current = true;
      setIsPlaying(true);
    } catch (error) {
      console.error(
        "Translation error:",
        error
      );

      setResult(null);
      setIsPlaying(false);
    } finally {
      setIsTranslating(false);
    }
  };

  /*
   * Clear everything.
   */
  const handleClear = () => {
    setText("");
    setResult(null);
    setCurrentSignIndex(0);
    setIsPlaying(false);
    setVideoError(false);
    autoPlayRef.current = false;
  };

  /*
   * Copy result.
   */
  const handleCopy = async () => {
    const value =
      result?.text || text.trim();

    if (!value) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        value
      );

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch (error) {
      console.warn(
        "Could not copy text:",
        error
      );
    }
  };

  /*
   * Speak result.
   */
  const handleSpeak = () => {
    const value =
      result?.text || text.trim();

    if (
      !value ||
      !("speechSynthesis" in window)
    ) {
      return;
    }

    window.speechSynthesis.cancel();

    const utterance =
      new SpeechSynthesisUtterance(value);

    utterance.rate = 0.95;
    utterance.pitch = 1;

    window.speechSynthesis.speak(
      utterance
    );
  };

  /*
   * Play current video.
   */
  const attemptPlay = async (
    video: HTMLVideoElement
  ) => {
    try {
      video.muted = true;
      video.playbackRate =
        playbackSpeed;

      await video.play();

      setIsPlaying(true);
      setVideoError(false);
    } catch (error) {
      console.error(
        "Playback error:",
        error
      );

      if (!autoPlayRef.current) {
        setIsPlaying(false);
      }
    }
  };

  const playCurrentVideo =
    async () => {
      const video =
        videoRef.current;

      if (
        !video ||
        !currentSign
      ) {
        return;
      }

      await attemptPlay(video);
    };

  /*
   * Play / Pause.
   */
  const handlePlayPause =
    async () => {
      const video =
        videoRef.current;

      if (!video) {
        return;
      }

      if (isPlaying) {
        autoPlayRef.current =
          false;

        video.pause();

        setIsPlaying(false);
      } else {
        autoPlayRef.current =
          true;

        await playCurrentVideo();
      }
    };

  /*
   * Repeat.
   */
  const handleRepeat =
    async () => {
      const video =
        videoRef.current;

      if (!video) {
        return;
      }

      try {
        autoPlayRef.current =
          true;

        video.currentTime = 0;
        video.playbackRate =
          playbackSpeed;
        video.muted = true;

        await video.play();

        setIsPlaying(true);
      } catch (error) {
        console.error(
          "Repeat error:",
          error
        );
      }
    };

  /*
   * Next.
   */
  const handleNext = () => {
    if (
      currentSignIndex >=
      signSequence.length - 1
    ) {
      return;
    }

    setTransitioning(true);

    autoPlayRef.current = true;

    setCurrentSignIndex(
      (previous) =>
        previous + 1
    );

    setVideoError(false);
    setIsPlaying(true);

    window.setTimeout(() => {
      setTransitioning(false);
    }, 250);
  };

  /*
   * Previous.
   */
  const handlePrevious = () => {
    if (
      currentSignIndex <= 0
    ) {
      return;
    }

    setTransitioning(true);

    autoPlayRef.current = true;

    setCurrentSignIndex(
      (previous) =>
        previous - 1
    );

    setVideoError(false);
    setIsPlaying(true);

    window.setTimeout(() => {
      setTransitioning(false);
    }, 250);
  };

  /*
   * Speed.
   */
  const handleSpeedChange = (
    speed: number
  ) => {
    setPlaybackSpeed(speed);

    if (videoRef.current) {
      videoRef.current.playbackRate =
        speed;
    }
  };

  /*
   * Video finished.
   */
  const handleVideoEnded = () => {
    if (
      currentSignIndex <
      signSequence.length - 1
    ) {
      setTransitioning(true);

      autoPlayRef.current = true;

      setCurrentSignIndex(
        (previous) =>
          previous + 1
      );

      setIsPlaying(true);

      window.setTimeout(() => {
        setTransitioning(false);
      }, 250);
    } else {
      autoPlayRef.current =
        false;

      setIsPlaying(false);
    }
  };

  /*
   * Reset loading state when
   * changing videos.
   */
  useEffect(() => {
    setVideoLoading(true);
    setVideoError(false);
  }, [currentSign?.videoUrl]);

  /*
   * Keep playback speed synced.
   */
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate =
        playbackSpeed;
    }
  }, [playbackSpeed]);

  /*
   * Preload next video.
   */
  useEffect(() => {
    if (!nextSign?.videoUrl) {
      return;
    }

    const preloadVideo =
      document.createElement(
        "video"
      );

    preloadVideo.preload = "auto";
    preloadVideo.src =
      nextSign.videoUrl;

    return () => {
      preloadVideo.src = "";
    };
  }, [nextSign?.videoUrl]);

  /*
   * Cleanup.
   */
  useEffect(() => {
    return () => {
      autoPlayRef.current =
        false;

      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.removeAttribute(
          "src"
        );
        videoRef.current.load();
      }
    };
  }, []);

  const speedOptions = [
    0.5,
    0.75,
    1,
    1.25,
    1.5,
  ];

  /*
   * Check direct video.
   */
  const hasDirectVideo = (
    word: string
  ) => {
    return VIDEO_LOOKUP.has(
      cleanWord(word).toLowerCase()
    );
  };

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 12,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.45,
      }}
      className="max-w-[1500px] mx-auto space-y-6"
    >
      {/* =========================================
          HEADER
      ========================================== */}

      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.035] backdrop-blur-xl p-6 sm:p-8">
        <div className="absolute -top-24 -right-20 w-72 h-72 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-28 left-1/3 w-72 h-72 rounded-full bg-violet-500/10 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-400/15 bg-cyan-400/10 text-cyan-300 text-[11px] font-semibold tracking-[0.18em] uppercase">
              <FiZap size={13} />
              SignBridge AI Studio
            </div>

            <h1 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Text to{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, var(--sb-primary), var(--sb-secondary), var(--sb-accent))",
                }}
              >
                Sign
              </span>
            </h1>

            <p className="mt-2 max-w-2xl text-sm sm:text-base text-slate-400">
              Convert written text into
              Indian Sign Language
              animations using your
              available sign video library.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 bg-white/[0.04]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
              <span className="text-xs text-slate-300">
                Translator Ready
              </span>
            </div>

            <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 bg-white/[0.04]">
              <FiFilm
                size={14}
                className="text-cyan-300"
              />
              <span className="text-xs text-slate-300">
                ISL Video Engine
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================
          MAIN GRID
      ========================================== */}

      <div className="grid grid-cols-1 xl:grid-cols-[0.9fr_1.1fr] gap-6">
        {/* =====================================
            LEFT — INPUT
        ====================================== */}

        <div className="space-y-6">
          <GlassCard
            hover={false}
            className="relative overflow-hidden"
          >
            <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

            <div className="relative">
              <div className="flex items-start justify-between gap-4 mb-5">
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(34,211,238,.18), rgba(59,130,246,.18))",
                      border:
                        "1px solid rgba(34,211,238,.2)",
                    }}
                  >
                    <FiType
                      size={20}
                      className="text-cyan-300"
                    />
                  </div>

                  <div>
                    <h2 className="font-semibold text-white">
                      Text Composer
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Enter your sentence
                      below
                    </p>
                  </div>
                </div>

                <span className="text-xs text-slate-500">
                  {text.length}/1000
                </span>
              </div>

              <textarea
                value={text}
                onChange={(event) => {
                  if (
                    event.target.value
                      .length <= 1000
                  ) {
                    setText(
                      event.target.value
                    );
                  }
                }}
                placeholder="Type or paste text here to translate into ISL..."
                className="
                  w-full
                  min-h-[210px]
                  p-5
                  rounded-2xl
                  border
                  border-white/10
                  bg-black/20
                  text-white
                  placeholder:text-slate-600
                  resize-none
                  outline-none
                  transition-all
                  duration-300
                  focus:border-cyan-400/30
                  focus:ring-2
                  focus:ring-cyan-400/10
                "
              />

              {/* Quick examples */}
              <div className="mt-4">
                <p className="text-[11px] uppercase tracking-wider text-slate-500 mb-2">
                  Quick examples
                </p>

                <div className="flex flex-wrap gap-2">
                  {[
                    "Hello",
                    "Thank You",
                    "Good morning",
                    "Help",
                  ].map((example) => (
                    <button
                      key={example}
                      type="button"
                      onClick={() =>
                        setText(example)
                      }
                      className="
                        px-3 py-1.5
                        rounded-lg
                        border border-white/10
                        bg-white/[0.035]
                        text-xs text-slate-400
                        hover:text-cyan-300
                        hover:border-cyan-400/20
                        hover:bg-cyan-400/5
                        transition-all
                      "
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-5">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleClear}
                    disabled={!text && !result}
                    className="
                      inline-flex
                      items-center
                      gap-2
                      px-3.5
                      py-2.5
                      rounded-xl
                      border border-white/10
                      bg-white/[0.03]
                      text-xs
                      text-slate-400
                      hover:text-white
                      hover:bg-white/[0.06]
                      disabled:opacity-30
                      disabled:cursor-not-allowed
                      transition-all
                    "
                  >
                    <FiTrash2 size={14} />
                    Clear
                  </button>

                  <button
                    type="button"
                    onClick={handleCopy}
                    disabled={
                      !result?.text &&
                      !text.trim()
                    }
                    className="
                      inline-flex
                      items-center
                      gap-2
                      px-3.5
                      py-2.5
                      rounded-xl
                      border border-white/10
                      bg-white/[0.03]
                      text-xs
                      text-slate-400
                      hover:text-white
                      hover:bg-white/[0.06]
                      disabled:opacity-30
                      transition-all
                    "
                  >
                    <FiCopy size={14} />
                    {copied
                      ? "Copied"
                      : "Copy"}
                  </button>

                  <button
                    type="button"
                    onClick={handleSpeak}
                    disabled={
                      !result?.text &&
                      !text.trim()
                    }
                    className="
                      inline-flex
                      items-center
                      gap-2
                      px-3.5
                      py-2.5
                      rounded-xl
                      border border-white/10
                      bg-white/[0.03]
                      text-xs
                      text-slate-400
                      hover:text-white
                      hover:bg-white/[0.06]
                      disabled:opacity-30
                      transition-all
                    "
                  >
                    <FiVolume2 size={14} />
                    Speak
                  </button>
                </div>

                {/* HIGHLIGHTED TRANSLATE BUTTON */}
                {/* HIGHLIGHTED TRANSLATE BUTTON */}
<motion.button
  type="button"
  onClick={handleTranslate}
  disabled={!text.trim() || isTranslating}
  whileHover={{ scale: 1.02, y: -1 }}
  whileTap={{ scale: 0.97 }}
  className="
    group relative flex items-center gap-3
    overflow-hidden
    rounded-xl
    border border-cyan-400/30
    bg-gradient-to-r
    from-cyan-400
    via-blue-500
    to-violet-500
    px-5 py-2.5
    font-semibold
    text-white
    shadow-lg shadow-cyan-500/20
    transition-all duration-300
    hover:shadow-xl
    hover:shadow-blue-500/30
    disabled:cursor-not-allowed
    disabled:opacity-50
  "
>
  {/* Highlighted blue/cyan icon */}
  <span
    className="
      relative flex h-8 w-8
      items-center justify-center
      rounded-lg
      border border-white/20
      bg-white/20
      shadow-inner
      backdrop-blur-sm
      transition-transform duration-300
      group-hover:scale-110
    "
  >
    {isTranslating ? (
      <LoadingSpinner />
    ) : (
      <FiZap
        size={17}
        className="relative text-white"
      />
    )}
  </span>

  {/* Button text */}
  <span className="relative">
    {isTranslating
      ? "Translating..."
      : "Translate to ISL"}
  </span>

  {/* Shine animation */}
  <span
    className="
      pointer-events-none
      absolute inset-0
      -translate-x-full
      bg-gradient-to-r
      from-transparent
      via-white/20
      to-transparent
      transition-transform
      duration-700
      group-hover:translate-x-full
    "
  />
</motion.button>
              </div>
            </div>
          </GlassCard>

          {/* WORD BREAKDOWN */}

          <AnimatePresence>
            {result && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: 18,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: -10,
                }}
              >
                <GlassCard
                  hover={false}
                  className="overflow-hidden"
                >
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-400/15 flex items-center justify-center">
                        <FiLayers
                          size={18}
                          className="text-violet-300"
                        />
                      </div>

                      <div>
                        <h3 className="font-semibold text-white">
                          Word Breakdown
                        </h3>
                        <p className="text-xs text-slate-500">
                          Sign mapping for
                          your sentence
                        </p>
                      </div>
                    </div>

                    <span className="text-xs text-slate-500">
                      {
                        result
                          .wordBreakdown
                          .length
                      }{" "}
                      words
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {result.wordBreakdown.map(
                      (
                        word,
                        index
                      ) => {
                        const isCurrent =
                          currentOriginalIndex ===
                          index;

                        const directVideo =
                          hasDirectVideo(
                            word.word
                          );

                        return (
                          <motion.button
                            key={`${word.word}-${index}`}
                            type="button"
                            whileHover={{
                              y: -2,
                            }}
                            whileTap={{
                              scale: 0.96,
                            }}
                            onClick={() => {
                              const sequenceIndex =
                                signSequence.findIndex(
                                  (
                                    sign
                                  ) =>
                                    sign.originalIndex ===
                                    index
                                );

                              if (
                                sequenceIndex !==
                                -1
                              ) {
                                autoPlayRef.current =
                                  true;

                                setCurrentSignIndex(
                                  sequenceIndex
                                );

                                setIsPlaying(
                                  true
                                );
                              }
                            }}
                            className={`
                              relative
                              px-3
                              py-2.5
                              rounded-xl
                              text-sm
                              font-medium
                              border
                              transition-all

                              ${
                                directVideo
                                  ? "bg-emerald-500/10 border-emerald-400/20 text-emerald-300 hover:bg-emerald-500/15"
                                  : "bg-cyan-400/10 border-cyan-400/20 text-cyan-300 hover:bg-cyan-400/15"
                              }

                              ${
                                isCurrent
                                  ? "ring-2 ring-cyan-400/40 shadow-lg shadow-cyan-400/10"
                                  : ""
                              }
                            `}
                          >
                            {word.word}

                            {word.confidence !==
                              undefined && (
                              <span className="ml-1.5 text-[10px] opacity-60">
                                {(
                                  word.confidence *
                                  100
                                ).toFixed(
                                  0
                                )}
                                %
                              </span>
                            )}

                            {!directVideo && (
                              <span className="ml-1.5 text-[9px] uppercase tracking-wider opacity-50">
                                ABC
                              </span>
                            )}
                          </motion.button>
                        );
                      }
                    )}
                  </div>

                  {result.wordBreakdown.some(
                    (word) =>
                      !hasDirectVideo(
                        word.word
                      )
                  ) && (
                    <div className="mt-5 flex items-start gap-3 rounded-xl border border-cyan-400/10 bg-cyan-400/[0.035] p-3.5">
                      <FiAlertCircle
                        size={16}
                        className="mt-0.5 shrink-0 text-cyan-300"
                      />

                      <p className="text-xs leading-5 text-slate-400">
                        Words without a
                        dedicated sign
                        video are
                        automatically
                        spelled using
                        ISL alphabet
                        signs.
                      </p>
                    </div>
                  )}
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* =====================================
            RIGHT — SIGN PLAYER
        ====================================== */}

        <div>
          <GlassCard
            hover={false}
            className="h-full overflow-hidden"
          >
            {/* Player header */}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(34,211,238,.15), rgba(139,92,246,.15))",
                    border:
                      "1px solid rgba(34,211,238,.15)",
                  }}
                >
                  <FiFilm
                    size={20}
                    className="text-cyan-300"
                  />
                </div>

                <div>
                  <h2 className="font-semibold text-white">
                    Sign Animation
                  </h2>

                  <p className="text-xs text-slate-500">
                    ISL visual playback
                  </p>
                </div>
              </div>

              {currentSign && (
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />

                  <span className="text-xs text-slate-400">
                    {currentSignIndex +
                      1}{" "}
                    /{" "}
                    {
                      signSequence.length
                    }
                  </span>
                </div>
              )}
            </div>

            {/* VIDEO */}

            <div className="relative aspect-video rounded-3xl overflow-hidden border border-white/10 bg-black shadow-2xl ring-1 ring-white/5">
              {currentSign ? (
                <AnimatePresence
                  initial={false}
                  mode="sync"
                >
                  <motion.div
                    key={
                      currentSign.videoUrl
                    }
                    initial={{
                      opacity: 0,
                      scale: 0.985,
                    }}
                    animate={{
                      opacity:
                        transitioning
                          ? 0.35
                          : 1,
                      scale: 1,
                    }}
                    exit={{
                      opacity: 0,
                      scale: 1.015,
                    }}
                    transition={{
                      duration: 0.25,
                      ease: "easeInOut",
                    }}
                    className="absolute inset-0"
                  >
                    <video
                      ref={videoRef}
                      src={
                        currentSign.videoUrl
                      }
                      className="w-full h-full object-contain bg-gradient-to-br from-slate-950 via-slate-900 to-black"
                      playsInline
                      muted
                      preload="auto"
                      onLoadedData={() => {
                        setVideoLoading(
                          false
                        );

                        const video =
                          videoRef.current;

                        if (video) {
                          video.playbackRate =
                            playbackSpeed;

                          if (
                            autoPlayRef.current &&
                            video.paused
                          ) {
                            void attemptPlay(
                              video
                            );
                          }
                        }
                      }}
                      onCanPlay={() => {
                        setVideoLoading(
                          false
                        );

                        const video =
                          videoRef.current;

                        if (
                          video &&
                          autoPlayRef.current &&
                          video.paused
                        ) {
                          void attemptPlay(
                            video
                          );
                        }
                      }}
                      onWaiting={() =>
                        setVideoLoading(
                          true
                        )
                      }
                      onPlaying={() => {
                        setVideoLoading(
                          false
                        );

                        setIsPlaying(
                          true
                        );
                      }}
                      onEnded={
                        handleVideoEnded
                      }
                      onError={() => {
                        setVideoLoading(
                          false
                        );

                        setVideoError(
                          true
                        );

                        autoPlayRef.current =
                          false;

                        setIsPlaying(
                          false
                        );
                      }}
                    />
                  </motion.div>
                </AnimatePresence>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center px-6">
                    <motion.div
                      animate={{
                        scale: [
                          1,
                          1.05,
                          1,
                        ],
                      }}
                      transition={{
                        duration: 2.5,
                        repeat:
                          Infinity,
                      }}
                      className="w-20 h-20 rounded-3xl bg-cyan-400/5 border border-cyan-400/10 flex items-center justify-center mx-auto mb-5"
                    >
                      <FiFilm
                        size={32}
                        className="text-cyan-300/30"
                      />
                    </motion.div>

                    <p className="text-sm text-slate-500">
                      Enter text and
                      translate to
                      start the ISL
                      animation
                    </p>
                  </div>
                </div>
              )}

              {/* TOP OVERLAY */}

              {currentSign && (
                <div className="absolute top-4 left-4 right-4 flex items-start justify-between pointer-events-none">
                  <div className="px-3 py-2 rounded-xl bg-black/40 border border-white/10 backdrop-blur-xl">
                    <p className="text-[9px] uppercase tracking-[0.16em] text-slate-500">
                      Current Sign
                    </p>

                    <p className="text-sm font-semibold text-white mt-0.5">
                      {currentSign.isAlphabetFallback
                        ? currentSign.letter
                        : currentSign.word}
                    </p>
                  </div>

                  <div className="px-3 py-2 rounded-xl bg-black/40 border border-white/10 backdrop-blur-xl">
                    <span className="text-xs text-cyan-300">
                      {currentSignIndex +
                        1}
                      /
                      {
                        signSequence.length
                      }
                    </span>
                  </div>
                </div>
              )}

              {/* LOADING */}

              {videoLoading &&
                !videoError &&
                currentSign && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm pointer-events-none">
                    <div className="text-center">
                      <LoadingSpinner />

                      <p className="text-xs text-slate-500 mt-3">
                        Loading sign...
                      </p>
                    </div>
                  </div>
                )}

              {/* ERROR */}

              {videoError && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-950/90 backdrop-blur-md">
                  <div className="text-center px-6">
                    <div className="w-14 h-14 rounded-2xl bg-red-400/10 border border-red-400/15 flex items-center justify-center mx-auto mb-4">
                      <FiAlertCircle
                        size={25}
                        className="text-red-400"
                      />
                    </div>

                    <p className="text-sm text-slate-300">
                      Unable to load this
                      sign
                    </p>

                    <button
                      type="button"
                      onClick={() => {
                        setVideoError(
                          false
                        );

                        autoPlayRef.current =
                          true;

                        if (
                          videoRef.current
                        ) {
                          videoRef.current.load();

                          void playCurrentVideo();
                        }
                      }}
                      className="mt-4 px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs text-slate-300 transition-all"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* CURRENT SIGN */}

            {currentSign && (
              <motion.div
                key={`${currentSign.word}-${currentSignIndex}`}
                initial={{
                  opacity: 0,
                  y: 8,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className="mt-5 rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.035] p-5"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                      Now Showing
                    </p>

                    <p className="text-3xl font-bold text-cyan-300 mt-1">
                      {currentSign.isAlphabetFallback
                        ? currentSign.letter
                        : currentSign.word}
                    </p>

                    {currentSign.isAlphabetFallback && (
                      <p className="text-xs text-slate-500 mt-1">
                        Alphabet fallback
                        · spelling "
                        {
                          currentSign.word
                        }
                        "
                      </p>
                    )}
                  </div>

                  <div className="w-11 h-11 rounded-xl bg-emerald-400/10 border border-emerald-400/15 flex items-center justify-center">
                    <FiCheckCircle
                      size={20}
                      className="text-emerald-400"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* CONTROLS */}

            {signSequence.length >
              0 && (
              <motion.div
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                className="mt-5 space-y-5"
              >
                {/* Progress */}

                <div>
                  <div className="flex justify-between text-[11px] text-slate-500 mb-2">
                    <span>
                      Translation
                      Progress
                    </span>

                    <span>
                      {Math.round(
                        progress
                      )}
                      %
                    </span>
                  </div>

                  <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        background:
                          "linear-gradient(90deg, var(--sb-primary), var(--sb-secondary), var(--sb-accent))",
                      }}
                      animate={{
                        width: `${progress}%`,
                      }}
                      transition={{
                        duration: 0.3,
                      }}
                    />
                  </div>
                </div>

                {/* Buttons */}

                <div className="flex items-center justify-center gap-2">
                  <motion.button
                    whileHover={{
                      scale: 1.08,
                    }}
                    whileTap={{
                      scale: 0.92,
                    }}
                    onClick={
                      handlePrevious
                    }
                    disabled={
                      currentSignIndex ===
                      0
                    }
                    className="w-11 h-11 rounded-xl border border-white/10 bg-white/[0.035] hover:bg-white/[0.07] disabled:opacity-25 disabled:cursor-not-allowed flex items-center justify-center transition-all"
                    title="Previous sign"
                  >
                    <FiRewind
                      size={17}
                    />
                  </motion.button>

                  <motion.button
                    whileHover={{
                      scale: 1.08,
                    }}
                    whileTap={{
                      scale: 0.92,
                    }}
                    onClick={
                      handleRepeat
                    }
                    className="w-11 h-11 rounded-xl border border-white/10 bg-white/[0.035] hover:bg-white/[0.07] flex items-center justify-center transition-all"
                    title="Repeat"
                  >
                    <FiRotateCcw
                      size={17}
                    />
                  </motion.button>

                  {/* MAIN PLAY BUTTON */}

                  <motion.button
                    whileHover={{
                      scale: 1.07,
                    }}
                    whileTap={{
                      scale: 0.94,
                    }}
                    onClick={
                      handlePlayPause
                    }
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-slate-950 shadow-xl shadow-cyan-500/15"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--sb-primary), var(--sb-secondary), var(--sb-accent))",
                    }}
                  >
                    {isPlaying ? (
                      <FiPause
                        size={22}
                      />
                    ) : (
                      <FiPlay
                        size={22}
                      />
                    )}
                  </motion.button>

                  <motion.button
                    whileHover={{
                      scale: 1.08,
                    }}
                    whileTap={{
                      scale: 0.92,
                    }}
                    onClick={
                      handleNext
                    }
                    disabled={
                      currentSignIndex >=
                      signSequence.length -
                        1
                    }
                    className="w-11 h-11 rounded-xl border border-white/10 bg-white/[0.035] hover:bg-white/[0.07] disabled:opacity-25 disabled:cursor-not-allowed flex items-center justify-center transition-all"
                    title="Next sign"
                  >
                    <FiFastForward
                      size={17}
                    />
                  </motion.button>
                </div>

                {/* Speed */}

                <div className="flex items-center justify-center gap-2">
                  <span className="text-[11px] text-slate-500 mr-1">
                    Speed
                  </span>

                  {speedOptions.map(
                    (speed) => (
                      <button
                        key={speed}
                        type="button"
                        onClick={() =>
                          handleSpeedChange(
                            speed
                          )
                        }
                        className={`
                          px-3 py-1.5
                          rounded-lg
                          text-[11px]
                          font-medium
                          border
                          transition-all

                          ${
                            playbackSpeed ===
                            speed
                              ? "border-cyan-400/25 bg-cyan-400/10 text-cyan-300"
                              : "border-transparent bg-white/[0.03] text-slate-500 hover:text-slate-300 hover:bg-white/[0.06]"
                          }
                        `}
                      >
                        {speed}x
                      </button>
                    )
                  )}
                </div>

                {/* Completion */}

                {!isPlaying &&
                  currentSignIndex ===
                    signSequence.length -
                      1 && (
                    <motion.div
                      initial={{
                        opacity: 0,
                        y: 5,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      className="flex items-center justify-center gap-2 text-xs text-emerald-400"
                    >
                      <FiCheckCircle />

                      <span>
                        Translation
                        playback
                        complete
                      </span>
                    </motion.div>
                  )}
              </motion.div>
            )}
          </GlassCard>
        </div>
      </div>

      {/* =========================================
          TRANSLATION PIPELINE
      ========================================== */}

      <GlassCard
        hover={false}
        className="overflow-hidden"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-cyan-300">
              AI Translation Pipeline
            </p>

            <h2 className="text-xl font-semibold text-white mt-1">
              From text to visual
              language
            </h2>
          </div>

          <div className="px-3 py-2 rounded-xl border border-white/10 bg-white/[0.03] text-xs text-slate-400">
            Real-time playback
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {[
            {
              title: "Text Input",
              description:
                "Your written sentence",
              icon: FiType,
            },
            {
              title: "Translation",
              description:
                "Language processing",
              icon: FiZap,
            },
            {
              title: "Sign Sequence",
              description:
                "Word and alphabet mapping",
              icon: FiLayers,
            },
            {
              title: "ISL Animation",
              description:
                "Video playback",
              icon: FiFilm,
            },
          ].map(
            (
              item,
              index
            ) => {
              const Icon =
                item.icon;

              return (
                <motion.div
                  key={item.title}
                  initial={{
                    opacity: 0,
                    y: 10,
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  viewport={{
                    once: true,
                  }}
                  transition={{
                    delay:
                      index * 0.07,
                  }}
                  className="relative"
                >
                  <div className="h-full rounded-2xl border border-white/10 bg-white/[0.025] p-4">
                    <div className="w-10 h-10 rounded-xl bg-cyan-400/10 border border-cyan-400/10 flex items-center justify-center mb-3">
                      <Icon
                        size={17}
                        className="text-cyan-300"
                      />
                    </div>

                    <p className="text-sm font-semibold text-white">
                      {item.title}
                    </p>

                    <p className="text-xs text-slate-500 mt-1 leading-5">
                      {
                        item.description
                      }
                    </p>
                  </div>

                  {index <
                    3 && (
                    <div className="hidden md:flex absolute top-1/2 -right-3 z-10 w-6 h-6 -translate-y-1/2 rounded-full border border-white/10 bg-slate-950 items-center justify-center">
                      <FiArrowRight
                        size={11}
                        className="text-slate-500"
                      />
                    </div>
                  )}
                </motion.div>
              );
            }
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}