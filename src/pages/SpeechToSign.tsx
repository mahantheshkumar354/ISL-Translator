// Replace your current SpeechToSign.tsx with the premium version.
// All speech recognition, video mapping, playback, history saving,
// and controls remain functionally unchanged.

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type SyntheticEvent,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FiMic,
  FiMicOff,
  FiRotateCcw,
  FiPlay,
  FiPause,
  FiMessageSquare,
  FiSkipBack,
  FiSkipForward,
  FiCheckCircle,
  FiAlertTriangle,
  FiRefreshCw,
  FiZap,
  FiActivity,
} from "react-icons/fi";
import { saveHistory } from "@/services/api";

/* ============================================================
   SPEECH RECOGNITION TYPES
============================================================ */

interface ISLSpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface ISLSpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  [index: number]: ISLSpeechRecognitionAlternative;
}

interface ISLSpeechRecognitionResultList {
  length: number;
  [index: number]: ISLSpeechRecognitionResult;
}

interface ISLSpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: ISLSpeechRecognitionResultList;
}

interface ISLSpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface ISLSpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: ISLSpeechRecognitionErrorEvent) => void) | null;
  onresult: ((event: ISLSpeechRecognitionEvent) => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => ISLSpeechRecognition;
    webkitSpeechRecognition?: new () => ISLSpeechRecognition;
  }
}

/* ============================================================
   VIDEO DICTIONARY
============================================================ */

const VIDEO_BASE_URL = "https://isl-translator-2.onrender.com/videos/";

const VIDEO_FILES: string[] = [
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
  "B.mp4",
  "Be.mp4",
  "Beautiful.mp4",
  "Before.mp4",
  "Best.mp4",
  "Better.mp4",
  "Busy.mp4",
  "But.mp4",
  "Bye.mp4",
  "C.mp4",
  "Can.mp4",
  "Cannot.mp4",
  "Change.mp4",
  "College.mp4",
  "Come.mp4",
  "Computer.mp4",
  "D.mp4",
  "Day.mp4",
  "Distance.mp4",
  "Do Not.mp4",
  "Do.mp4",
  "Does Not.mp4",
  "E.mp4",
  "Eat.mp4",
  "Engineer.mp4",
  "F.mp4",
  "Fight.mp4",
  "Finish.mp4",
  "From.mp4",
  "G.mp4",
  "Glitter.mp4",
  "Go.mp4",
  "God.mp4",
  "Gold.mp4",
  "Good.mp4",
  "Great.mp4",
  "H.mp4",
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
  "I.mp4",
  "Invent.mp4",
  "It.mp4",
  "J.mp4",
  "K.mp4",
  "Keep.mp4",
  "L.mp4",
  "Language.mp4",
  "Laugh.mp4",
  "Learn.mp4",
  "M.mp4",
  "ME.mp4",
  "More.mp4",
  "My.mp4",
  "N.mp4",
  "Name.mp4",
  "Next.mp4",
  "Not.mp4",
  "Now.mp4",
  "O.mp4",
  "Of.mp4",
  "On.mp4",
  "Our.mp4",
  "Out.mp4",
  "P.mp4",
  "Pretty.mp4",
  "Q.mp4",
  "R.mp4",
  "Right.mp4",
  "S.mp4",
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
  "T.mp4",
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
  "U.mp4",
  "Us.mp4",
  "V.mp4",
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
  "X.mp4",
  "Y.mp4",
  "You.mp4",
  "Your.mp4",
  "Yourself.mp4",
  "Z.mp4",
];

const VIDEO_MAP: Record<string, string> = {};

VIDEO_FILES.forEach((file) => {
  const base = file.replace(/\.mp4$/i, "");
  VIDEO_MAP[base.toLowerCase()] = file;
});

const videoUrl = (file: string) =>
  `${VIDEO_BASE_URL}${encodeURIComponent(file)}`;

interface SignClip {
  id: string;
  label: string;
  file: string;
  src: string;
  wordText: string;
}

/* ============================================================
   BUILD SIGN SEQUENCE
============================================================ */

function buildSignSequence(rawText: string): SignClip[] {
  const normalized = rawText
    .replace(/[.,!?;:"'()[\]{}]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalized) {
    return [];
  }

  const words = normalized.split(" ").filter(Boolean);
  const clips: SignClip[] = [];

  let i = 0;

  while (i < words.length) {
    if (i + 1 < words.length) {
      const phraseKey =
        `${words[i]} ${words[i + 1]}`.toLowerCase();

      const phraseFile = VIDEO_MAP[phraseKey];

      if (phraseFile) {
        clips.push({
          id: `clip-${i}-phrase`,
          label: `${words[i]} ${words[i + 1]}`,
          file: phraseFile,
          src: videoUrl(phraseFile),
          wordText: `${words[i]} ${words[i + 1]}`,
        });

        i += 2;
        continue;
      }
    }

    const word = words[i];
    const directFile = VIDEO_MAP[word.toLowerCase()];

    if (directFile) {
      clips.push({
        id: `clip-${i}-word`,
        label: word,
        file: directFile,
        src: videoUrl(directFile),
        wordText: word,
      });
    } else {
      const characters = word.split("");

      characters.forEach((char, charIndex) => {
        const key = char.toLowerCase();
        const charFile = VIDEO_MAP[key];

        if (
          charFile &&
          /^[a-z0-9]$/.test(key)
        ) {
          clips.push({
            id: `clip-${i}-${charIndex}`,
            label: char.toUpperCase(),
            file: charFile,
            src: videoUrl(charFile),
            wordText: word,
          });
        }
      });
    }

    i += 1;
  }

  return clips;
}

type RecognitionStatus =
  | "ready"
  | "listening"
  | "error";

export default function SpeechToSign() {
  const [isSupported, setIsSupported] =
    useState(true);

  const [isListening, setIsListening] =
    useState(false);

  const [status, setStatus] =
    useState<RecognitionStatus>("ready");

  const [text, setText] = useState("");
  const [interimText, setInterimText] =
    useState("");

  const [speechError, setSpeechError] =
    useState<string | null>(null);

  const [currentClipIndex, setCurrentClipIndex] =
    useState(0);

  const [isPlaying, setIsPlaying] =
    useState(false);

  const [isComplete, setIsComplete] =
    useState(false);

  const [playbackSpeed, setPlaybackSpeed] =
    useState(1);

  const [videoError, setVideoError] =
    useState<string | null>(null);

  const [progress, setProgress] =
    useState(0);

  const recognitionRef =
    useRef<ISLSpeechRecognition | null>(null);

  const videoRef =
    useRef<HTMLVideoElement | null>(null);

  const clips = useMemo(
    () => buildSignSequence(text),
    [text]
  );

  const currentClip =
    clips[currentClipIndex];

  const nextClip =
    clips[currentClipIndex + 1];

  const totalClips = clips.length;

  const speedOptions = [
    0.5,
    0.75,
    1,
    1.25,
    1.5,
    2,
  ];

  /* ============================================================
     Browser support
  ============================================================ */

  useEffect(() => {
    const supported =
      typeof window !== "undefined" &&
      !!(
        window.SpeechRecognition ||
        window.webkitSpeechRecognition
      );

    setIsSupported(supported);

    if (!supported) {
      setSpeechError(
        "Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge."
      );

      setStatus("error");
    }
  }, []);

  /* ============================================================
     Cleanup
  ============================================================ */

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  /* ============================================================
     Reset when text changes
  ============================================================ */

  useEffect(() => {
    setCurrentClipIndex(0);
    setIsComplete(false);
    setVideoError(null);
    setProgress(0);
    setIsPlaying(clips.length > 0);
  }, [text]);

  /* ============================================================
     Reset per clip
  ============================================================ */

  useEffect(() => {
    setVideoError(null);
    setProgress(0);
  }, [currentClipIndex]);

  /* ============================================================
     Playback speed
  ============================================================ */

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate =
        playbackSpeed;
    }
  }, [playbackSpeed]);

  /* ============================================================
     Play video
  ============================================================ */

  const attemptPlay = (
    videoEl: HTMLVideoElement
  ) => {
    videoEl.muted = true;
    videoEl.playbackRate = playbackSpeed;

    const playPromise = videoEl.play();

    if (
      playPromise &&
      typeof playPromise.catch === "function"
    ) {
      playPromise.catch(() => {
        setVideoError(
          "Playback was blocked by the browser. Press Play Sign to try again."
        );

        setIsPlaying(false);
      });
    }
  };

  /* ============================================================
     Play / pause
  ============================================================ */

  useEffect(() => {
    const videoEl = videoRef.current;

    if (!videoEl) {
      return;
    }

    if (isPlaying) {
      if (videoEl.readyState >= 2) {
        attemptPlay(videoEl);
      }
    } else {
      videoEl.pause();
    }
  }, [isPlaying]);

  /* ============================================================
     Video ready
  ============================================================ */

  const handleCanPlay = (
    event: SyntheticEvent<HTMLVideoElement>
  ) => {
    if (
      event.currentTarget !==
      videoRef.current
    ) {
      return;
    }

    const videoEl = event.currentTarget;

    videoEl.muted = true;
    videoEl.playbackRate = playbackSpeed;

    if (isPlaying) {
      attemptPlay(videoEl);
    }
  };

  /* ============================================================
     Speech recognition
  ============================================================ */

  const startListening = () => {
    const SpeechRecognitionCtor =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) {
      setIsSupported(false);

      setSpeechError(
        "Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge."
      );

      setStatus("error");
      return;
    }

    setSpeechError(null);
    setText("");
    setInterimText("");

    const recognition =
      new SpeechRecognitionCtor();

    recognition.lang = "en-IN";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setStatus("listening");
    };

    recognition.onresult = (
      event: ISLSpeechRecognitionEvent
    ) => {
      let finalChunk = "";
      let interimChunk = "";

      for (
        let i = event.resultIndex;
        i < event.results.length;
        i++
      ) {
        const result = event.results[i];

        const transcriptPiece =
          result[0]?.transcript ?? "";

        if (result.isFinal) {
          finalChunk += transcriptPiece;
        } else {
          interimChunk += transcriptPiece;
        }
      }

      if (finalChunk.trim()) {
        const spokenText =
          finalChunk.trim();

        setText((prev) =>
          prev
            ? `${prev} ${spokenText}`.trim()
            : spokenText
        );

        void saveHistory({
          type: "speech-to-sign",
          input: spokenText,
          output: spokenText,
          confidence: 1,
        }).catch((error) => {
          console.warn(
            "Could not save speech-to-sign history:",
            error
          );
        });
      }

      setInterimText(
        interimChunk.trim()
      );
    };

    recognition.onerror = (
      event: ISLSpeechRecognitionErrorEvent
    ) => {
      switch (event.error) {
        case "not-allowed":
        case "service-not-allowed":
          setSpeechError(
            "Microphone access was denied. Please allow microphone permissions and try again."
          );
          break;

        case "no-speech":
          setSpeechError(
            "No speech was detected. Please try speaking again."
          );
          break;

        case "audio-capture":
          setSpeechError(
            "No microphone was found. Please connect a microphone and try again."
          );
          break;

        case "network":
          setSpeechError(
            "A network error occurred during speech recognition. Please try again."
          );
          break;

        case "aborted":
          break;

        default:
          setSpeechError(
            "Speech recognition encountered an error. Please try again."
          );
      }

      if (event.error !== "aborted") {
        setStatus("error");
      }

      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimText("");

      setStatus((prev) =>
        prev === "error"
          ? "error"
          : "ready"
      );
    };

    recognitionRef.current =
      recognition;

    try {
      recognition.start();
    } catch {
      setSpeechError(
        "Unable to start speech recognition. Please try again."
      );

      setStatus("error");
    }
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  /* ============================================================
     Clear
  ============================================================ */

  const clearAll = () => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;

    videoRef.current?.pause();

    setIsListening(false);
    setText("");
    setInterimText("");
    setSpeechError(null);
    setStatus("ready");
    setCurrentClipIndex(0);
    setIsPlaying(false);
    setIsComplete(false);
    setVideoError(null);
    setProgress(0);
  };

  /* ============================================================
     Playback controls
  ============================================================ */

  const playSign = () => {
    if (totalClips === 0) {
      return;
    }

    if (isComplete) {
      setCurrentClipIndex(0);
      setIsComplete(false);
    }

    setIsPlaying(true);
  };

  const pauseSign = () => {
    setIsPlaying(false);
    videoRef.current?.pause();
  };

  const goToPrevious = () => {
    if (currentClipIndex === 0) {
      return;
    }

    setIsComplete(false);
    setIsPlaying(true);

    setCurrentClipIndex((idx) =>
      Math.max(0, idx - 1)
    );
  };

  const goToNext = () => {
    if (
      currentClipIndex + 1 >=
      totalClips
    ) {
      setIsPlaying(false);
      setIsComplete(true);
      return;
    }

    setIsPlaying(true);

    setCurrentClipIndex(
      (idx) => idx + 1
    );
  };

  const restartSign = () => {
    setIsComplete(false);
    setCurrentClipIndex(0);

    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }

    setIsPlaying(true);
  };

  const handleVideoEnded = (
    event: SyntheticEvent<HTMLVideoElement>
  ) => {
    if (
      event.currentTarget !==
      videoRef.current
    ) {
      return;
    }

    if (
      currentClipIndex + 1 >=
      totalClips
    ) {
      setIsPlaying(false);
      setIsComplete(true);
    } else {
      setCurrentClipIndex(
        (idx) => idx + 1
      );
    }
  };

  const handleTimeUpdate = () => {
    const videoEl = videoRef.current;

    if (
      !videoEl ||
      !videoEl.duration
    ) {
      return;
    }

    setProgress(
      (videoEl.currentTime /
        videoEl.duration) *
        100
    );
  };

  const handleVideoError = () => {
    setVideoError(
      currentClip
        ? `The sign video for "${currentClip.label}" could not be loaded.`
        : "The sign video could not be loaded."
    );

    setIsPlaying(false);
  };

  const retryVideo = () => {
    setVideoError(null);
    videoRef.current?.load();
  };

  const cycleSpeed = () => {
    const idx =
      speedOptions.indexOf(
        playbackSpeed
      );

    setPlaybackSpeed(
      speedOptions[
        (idx + 1) %
          speedOptions.length
      ]
    );
  };

  const displayText = [
    text,
    interimText,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute right-0 top-20 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.05),transparent_40%)]" />
      </div>

      <div className="relative z-10 p-4 md:p-6 lg:p-8">
        {/* ======================================================
            HEADER
        ====================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: -20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="mb-8"
        >
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl bg-cyan-400/20 blur-xl" />

                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-cyan-400/15 via-blue-500/10 to-violet-500/15">
                  <FiMic
                    size={26}
                    className="text-cyan-300"
                  />
                </div>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
                    Speech to Sign
                  </h1>

                  <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/15 bg-cyan-400/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-300">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-300" />
                    Live
                  </span>
                </div>

                <p className="mt-1.5 max-w-xl text-sm text-slate-400">
                  Speak naturally and watch your
                  words transform into Indian Sign
                  Language gestures in real time.
                </p>
              </div>
            </div>

            {/* Status card */}
            <div className="hidden items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 backdrop-blur-xl md:flex">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                  status === "listening"
                    ? "bg-red-400/10 text-red-400"
                    : status === "error"
                    ? "bg-amber-400/10 text-amber-400"
                    : "bg-emerald-400/10 text-emerald-400"
                }`}
              >
                <FiActivity size={17} />
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-500">
                  Recognition
                </p>

                <p className="text-sm font-semibold text-white">
                  {status === "listening"
                    ? "Listening"
                    : status === "error"
                    ? "Attention Required"
                    : "System Ready"}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ======================================================
            MAIN CONTENT
        ====================================================== */}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {/* ====================================================
              SPEECH INPUT
          ==================================================== */}

          <motion.div
            initial={{
              opacity: 0,
              x: -20,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.45,
            }}
            className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-xl"
          >
            {/* Card glow */}
            <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-cyan-400/5 blur-3xl transition-all duration-700 group-hover:bg-cyan-400/10" />

            <div className="relative z-10">
              {/* Card header */}
              <div className="mb-7 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-white">
                      Speech Input
                    </h2>

                    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[9px] uppercase tracking-wider text-slate-400">
                      Voice
                    </span>
                  </div>

                  <p className="mt-1.5 text-sm text-slate-500">
                    Speak clearly into your microphone
                  </p>
                </div>

                <div
                  className={`flex items-center gap-2 rounded-full border px-3 py-1.5 ${
                    status === "listening"
                      ? "border-red-400/20 bg-red-400/10 text-red-300"
                      : status === "error"
                      ? "border-amber-400/20 bg-amber-400/10 text-amber-300"
                      : "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      status === "listening"
                        ? "animate-pulse bg-red-400"
                        : status === "error"
                        ? "bg-amber-400"
                        : "bg-emerald-400"
                    }`}
                  />

                  <span className="text-[10px] font-semibold uppercase tracking-wider">
                    {status === "listening"
                      ? "Listening"
                      : status === "error"
                      ? "Error"
                      : "Ready"}
                  </span>
                </div>
              </div>

              {/* Microphone stage */}
              <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-slate-950/90 via-slate-900/80 to-blue-950/30 py-10">
                <div className="pointer-events-none absolute inset-0">
                  <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/5 blur-3xl" />
                  <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-blue-500/5 blur-3xl" />
                </div>

                <div className="relative flex flex-col items-center justify-center">
                  {/* Mic */}
                  <motion.div
                    animate={
                      isListening
                        ? {
                            scale: [
                              1,
                              1.06,
                              1,
                            ],
                          }
                        : {
                            scale: 1,
                          }
                    }
                    transition={{
                      repeat: isListening
                        ? Infinity
                        : 0,
                      duration: 1.4,
                    }}
                    className="relative"
                  >
                    {isListening && (
                      <>
                        <div className="absolute -inset-6 animate-pulse rounded-full border border-red-400/10" />
                        <div className="absolute -inset-3 animate-ping rounded-full border border-red-400/15" />
                      </>
                    )}

                    <div
                      className={`relative flex h-32 w-32 items-center justify-center rounded-full border shadow-2xl ${
                        isListening
                          ? "border-red-400/40 bg-red-400/10 shadow-red-500/10"
                          : "border-cyan-400/20 bg-gradient-to-br from-cyan-400/10 to-blue-500/10 shadow-cyan-500/10"
                      }`}
                    >
                      <div
                        className={`absolute inset-3 rounded-full border ${
                          isListening
                            ? "border-red-400/10"
                            : "border-cyan-400/10"
                        }`}
                      />

                      <FiMic
                        size={46}
                        className={
                          isListening
                            ? "text-red-400"
                            : "text-cyan-300"
                        }
                      />
                    </div>
                  </motion.div>

                  <p className="relative mt-7 text-sm font-medium text-slate-300">
                    {isListening
                      ? "Listening to your speech..."
                      : "Ready to listen"}
                  </p>

                  <p className="relative mt-1 text-xs text-slate-500">
                    {isListening
                      ? "Speak naturally"
                      : "Press the button below to begin"}
                  </p>

                  {/* Main mic button */}
                  <motion.button
                    type="button"
                    onClick={
                      isListening
                        ? stopListening
                        : startListening
                    }
                    disabled={!isSupported}
                    whileHover={
                      isSupported
                        ? {
                            scale: 1.02,
                            y: -1,
                          }
                        : undefined
                    }
                    whileTap={
                      isSupported
                        ? {
                            scale: 0.97,
                          }
                        : undefined
                    }
                    className={`group relative mt-7 flex items-center gap-3 overflow-hidden rounded-xl px-6 py-3.5 font-semibold shadow-xl transition-all duration-300 ${
                      !isSupported
                        ? "cursor-not-allowed bg-white/5 text-white/20"
                        : isListening
                        ? "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-red-500/20 hover:shadow-red-500/30"
                        : "bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 text-white shadow-cyan-500/20 hover:shadow-blue-500/30"
                    }`}
                  >
                    <span className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">
                      {isListening ? (
                        <FiMicOff size={17} />
                      ) : (
                        <FiMic size={17} />
                      )}
                    </span>

                    <span>
                      {isListening
                        ? "Stop Listening"
                        : "Start Listening"}
                    </span>

                    <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  </motion.button>
                </div>
              </div>

              {/* Error */}
              <AnimatePresence>
                {speechError && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: -8,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      y: -8,
                    }}
                    className="mt-4 flex items-start gap-3 rounded-2xl border border-amber-400/15 bg-amber-400/[0.06] px-4 py-3.5"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-400/10">
                      <FiAlertTriangle
                        size={15}
                        className="text-amber-400"
                      />
                    </div>

                    <p className="pt-1 text-xs leading-5 text-amber-200/80">
                      {speechError}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Recognized Speech */}
              <div className="mt-6">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <label className="text-sm font-semibold text-slate-200">
                      Recognized Speech
                    </label>

                    <p className="mt-0.5 text-[11px] text-slate-500">
                      Live transcription
                    </p>
                  </div>

                  {(text || interimText) && (
                    <button
                      onClick={clearAll}
                      className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-400 transition hover:bg-white/10 hover:text-white"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="relative min-h-[135px] overflow-hidden rounded-2xl border border-white/10 bg-black/20 p-5">
                  <div className="pointer-events-none absolute right-0 top-0 h-24 w-24 rounded-full bg-cyan-400/5 blur-2xl" />

                  {displayText ? (
                    <p className="relative leading-7 text-slate-200">
                      {text}

                      {interimText && (
                        <span className="text-slate-500">
                          {" "}
                          {interimText}
                        </span>
                      )}
                    </p>
                  ) : (
                    <div className="flex min-h-[95px] items-center justify-center text-center">
                      <div>
                        <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                          <FiMessageSquare
                            size={20}
                            className="text-slate-600"
                          />
                        </div>

                        <p className="text-sm text-slate-500">
                          Your speech will appear here
                        </p>

                        <p className="mt-1 text-[11px] text-slate-600">
                          Start speaking to begin transcription
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* ====================================================
              SIGN OUTPUT
          ==================================================== */}

          <motion.div
            initial={{
              opacity: 0,
              x: 20,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.45,
              delay: 0.05,
            }}
            className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-xl"
          >
            <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-violet-500/5 blur-3xl transition-all duration-700 group-hover:bg-violet-500/10" />

            <div className="relative z-10">
              {/* Header */}
              <div className="mb-7 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-white">
                      Sign Language Output
                    </h2>

                    <span className="rounded-full border border-violet-400/15 bg-violet-400/10 px-2 py-0.5 text-[9px] uppercase tracking-wider text-violet-300">
                      AI
                    </span>
                  </div>

                  <p className="mt-1.5 text-sm text-slate-500">
                    Continuous animated ISL representation
                  </p>
                </div>

                <div className="flex items-center gap-2 rounded-full border border-cyan-400/15 bg-cyan-400/10 px-3 py-1.5">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-300" />

                  <span className="text-[10px] font-semibold uppercase tracking-wider text-cyan-300">
                    ISL
                  </span>
                </div>
              </div>

              {/* Video Area */}
              <div className="relative min-h-[420px] overflow-hidden rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950/30 shadow-2xl ring-1 ring-white/5">
                {/* Ambient video glow */}
                <div className="pointer-events-none absolute inset-0">
                  <div className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/5 blur-3xl" />

                  <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-violet-500/10 blur-3xl" />

                  <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />
                </div>

                {totalClips === 0 ? (
                  <div className="relative flex min-h-[420px] flex-col items-center justify-center px-6 text-center">
                    <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-white/5 shadow-xl">
                      <FiMessageSquare
                        size={32}
                        className="text-slate-600"
                      />
                    </div>

                    <h3 className="text-lg font-semibold text-slate-300">
                      Waiting for speech
                    </h3>

                    <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                      Speak something and the corresponding
                      Indian Sign Language animation will
                      appear here.
                    </p>
                  </div>
                ) : isComplete ? (
                  <div className="relative flex min-h-[420px] flex-col items-center justify-center px-6 text-center">
                    <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-emerald-400/15 bg-emerald-400/10 shadow-xl shadow-emerald-500/10">
                      <FiCheckCircle
                        size={34}
                        className="text-emerald-400"
                      />
                    </div>

                    <h3 className="text-lg font-semibold text-white">
                      Translation Complete
                    </h3>

                    <p className="mt-2 text-sm text-slate-500">
                      Played {totalClips} of{" "}
                      {totalClips} gestures.
                    </p>

                    <button
                      onClick={restartSign}
                      className="mt-6 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
                    >
                      <FiRotateCcw size={15} />
                      Play Again
                    </button>
                  </div>
                ) : videoError ? (
                  <div className="relative flex min-h-[420px] flex-col items-center justify-center px-6 text-center">
                    <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl border border-red-400/15 bg-red-400/10">
                      <FiAlertTriangle
                        size={32}
                        className="text-red-400"
                      />
                    </div>

                    <p className="max-w-sm text-sm leading-6 text-red-300/80">
                      {videoError}
                    </p>

                    <button
                      onClick={retryVideo}
                      className="mt-5 flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm text-white transition hover:bg-white/15"
                    >
                      <FiRefreshCw size={14} />
                      Retry Video
                    </button>
                  </div>
                ) : (
                  <div className="relative flex min-h-[420px] w-full flex-col items-center justify-center px-6 py-6">
                    {/* Top indicators */}
                    <div className="absolute left-5 right-5 top-5 z-20 flex items-center justify-between">
                      <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-black/30 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-300 backdrop-blur-md">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                        Live ISL
                      </span>

                      <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-xs tabular-nums text-slate-300 backdrop-blur-md">
                        {currentClipIndex + 1} /{" "}
                        {totalClips}
                      </span>
                    </div>

                    {/* Video */}
                    <div className="relative flex w-full flex-1 items-center justify-center pt-8">
                      <AnimatePresence
                        initial={false}
                        mode="sync"
                      >
                        {currentClip && (
                          <motion.div
                            key={currentClip.id}
                            initial={{
                              opacity: 0,
                              scale: 0.985,
                            }}
                            animate={{
                              opacity: 1,
                              scale: 1,
                            }}
                            exit={{
                              opacity: 0,
                              scale: 1.01,
                            }}
                            transition={{
                              duration: 0.18,
                              ease: "easeInOut",
                            }}
                            className="absolute inset-x-0 flex flex-col items-center justify-center"
                          >
                            <video
                              ref={videoRef}
                              src={currentClip.src}
                              className="max-h-[270px] w-full rounded-2xl object-contain drop-shadow-2xl"
                              onEnded={
                                handleVideoEnded
                              }
                              onTimeUpdate={
                                handleTimeUpdate
                              }
                              onError={
                                handleVideoError
                              }
                              onCanPlay={
                                handleCanPlay
                              }
                              onLoadedData={
                                handleCanPlay
                              }
                              playsInline
                              muted
                              preload="auto"
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Cinematic overlays */}
                    <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-28 bg-gradient-to-b from-slate-950/70 to-transparent" />

                    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-36 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

                    {/* Current sign */}
                    <div className="relative z-20 mt-3 text-center">
                      <p className="text-xl font-bold tracking-wide text-white">
                        {currentClip.label}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Presenting gesture{" "}
                        {currentClipIndex + 1} of{" "}
                        {totalClips}
                      </p>
                    </div>

                    {/* Progress */}
                    <div className="relative z-20 mt-5 h-1.5 w-full max-w-sm overflow-hidden rounded-full bg-white/10">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500"
                        animate={{
                          width: `${progress}%`,
                        }}
                        transition={{
                          duration: 0.12,
                          ease: "linear",
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Preload */}
                {nextClip && (
                  <video
                    key={`preload-${nextClip.id}`}
                    src={nextClip.src}
                    preload="auto"
                    muted
                    className="absolute h-0 w-0 opacity-0"
                    aria-hidden="true"
                  />
                )}
              </div>

              {/* ==================================================
                  CONTROLS
              ================================================== */}

              <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
                <button
                  onClick={goToPrevious}
                  disabled={
                    totalClips === 0 ||
                    currentClipIndex === 0
                  }
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-400 transition hover:border-cyan-400/20 hover:bg-cyan-400/10 hover:text-cyan-300 disabled:cursor-not-allowed disabled:opacity-25"
                  title="Previous"
                >
                  <FiSkipBack size={17} />
                </button>

                <motion.button
                  whileHover={{
                    scale: 1.02,
                  }}
                  whileTap={{
                    scale: 0.97,
                  }}
                  onClick={
                    isPlaying
                      ? pauseSign
                      : playSign
                  }
                  disabled={
                    totalClips === 0
                  }
                  className={`flex items-center gap-2 rounded-xl px-6 py-3 font-semibold shadow-lg transition-all ${
                    totalClips > 0
                      ? "bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 text-white shadow-cyan-500/15 hover:shadow-blue-500/25"
                      : "cursor-not-allowed bg-white/5 text-white/20"
                  }`}
                >
                  {isPlaying ? (
                    <>
                      <FiPause size={17} />
                      Pause
                    </>
                  ) : (
                    <>
                      <FiPlay size={17} />
                      Play Sign
                    </>
                  )}
                </motion.button>

                <button
                  onClick={goToNext}
                  disabled={
                    totalClips === 0 ||
                    currentClipIndex >=
                      totalClips - 1
                  }
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-400 transition hover:border-cyan-400/20 hover:bg-cyan-400/10 hover:text-cyan-300 disabled:cursor-not-allowed disabled:opacity-25"
                  title="Next"
                >
                  <FiSkipForward size={17} />
                </button>

                <button
                  onClick={restartSign}
                  disabled={
                    totalClips === 0
                  }
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-400 transition hover:border-violet-400/20 hover:bg-violet-400/10 hover:text-violet-300 disabled:cursor-not-allowed disabled:opacity-25"
                  title="Restart"
                >
                  <FiRotateCcw size={17} />
                </button>

                <button
                  onClick={cycleSpeed}
                  disabled={
                    totalClips === 0
                  }
                  className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-3 text-sm font-medium text-slate-400 transition hover:border-blue-400/20 hover:bg-blue-400/10 hover:text-blue-300 disabled:cursor-not-allowed disabled:opacity-25"
                  title="Playback speed"
                >
                  <FiZap size={15} />
                  {playbackSpeed}x
                </button>

                <button
                  onClick={clearAll}
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-400 transition hover:border-red-400/20 hover:bg-red-400/10 hover:text-red-300"
                  title="Clear"
                >
                  <FiMicOff size={17} />
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ======================================================
            INFORMATION CARD
        ====================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.2,
            duration: 0.45,
          }}
          className="group relative mt-6 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl"
        >
          <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-cyan-400/5 blur-3xl transition-all duration-700 group-hover:bg-cyan-400/10" />

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/15 bg-cyan-400/10">
              <FiMic
                className="text-cyan-300"
                size={21}
              />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold text-white">
                  Speech to Sign Translation
                </h3>

                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[9px] uppercase tracking-wider text-slate-500">
                  How it works
                </span>
              </div>

              <p className="mt-2 max-w-4xl text-sm leading-7 text-slate-400">
                Speak naturally and your words are
                recognized live using your browser's
                speech engine, then matched against the
                ISL video library. Sign clips are preloaded
                and crossfaded to create a continuous
                presentation. Words without a direct sign
                are automatically fingerspelled letter by
                letter.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-xl border border-cyan-400/10 bg-cyan-400/5 px-3 py-2 text-xs text-cyan-300">
                  Live Speech Recognition
                </span>

                <span className="rounded-xl border border-blue-400/10 bg-blue-400/5 px-3 py-2 text-xs text-blue-300">
                  ISL Video Library
                </span>

                <span className="rounded-xl border border-violet-400/10 bg-violet-400/5 px-3 py-2 text-xs text-violet-300">
                  Fingerspelling Fallback
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}