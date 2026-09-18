import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiCamera,
  FiMic,
  FiTrash2,
  FiPlay,
  FiSquare,
  FiAlertCircle,
  FiCheckCircle,
  FiTarget,
  FiCopy,
  FiRotateCcw,
  FiActivity,
  FiCpu,
  FiEye,
  FiWifi,
  FiWifiOff,
  FiVolume2,
  FiClock,
  FiZap,
  FiRadio,
  FiCommand,
  FiVolumeX,
} from "react-icons/fi";

import GlassCard from "@/components/GlassCard";
import Modal from "@/components/Modal";
import { saveHistory } from "@/services/api";

/* ========================================================================= */
/* TYPES                                                                     */
/* ========================================================================= */

interface Landmark {
  x: number;
  y: number;
  z?: number;
}

interface PredictionResponse {
  prediction?: string | null;
  confidence?: number;
  hand_detected?: boolean;
  landmarks?: Landmark[];
  handedness?: string | null;
  message?: string;
}

interface AcceptedSign {
  word: string;
  confidence: number;
  timestamp: Date;
}

/* ========================================================================= */
/* CONFIGURATION                                                             */
/* ========================================================================= */

const WS_URL =
  window.location.protocol === "https:"
    ? "wss://isl-translator-docker.onrender.com/ws"
    : "ws://localhost:8000/ws";

const CONFIDENCE_THRESHOLD = 0.6;
const FRAME_INTERVAL = 180;
const JPEG_QUALITY = 0.5;

const STABLE_COUNT = 3;
const SAME_SIGN_COOLDOWN = 1200;

/* ========================================================================= */
/* MEDIAPIPE HAND CONNECTIONS                                                */
/* ========================================================================= */

const HAND_CONNECTIONS: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],

  [0, 5],
  [5, 6],
  [6, 7],
  [7, 8],

  [0, 9],
  [9, 10],
  [10, 11],
  [11, 12],

  [0, 13],
  [13, 14],
  [14, 15],
  [15, 16],

  [0, 17],
  [17, 18],
  [18, 19],
  [19, 20],

  [5, 9],
  [9, 13],
  [13, 17],
];

/* ========================================================================= */
/* HELPERS                                                                   */
/* ========================================================================= */

function normalizeConfidence(
  value: number | undefined
): number {
  if (
    typeof value !== "number" ||
    Number.isNaN(value)
  ) {
    return 0;
  }

  return value <= 1 ? value * 100 : value;
}

function speakText(text: string) {
  if (!text.trim()) {
    return;
  }

  if (!("speechSynthesis" in window)) {
    return;
  }

  window.speechSynthesis.cancel();

  const utterance =
    new SpeechSynthesisUtterance(text);

  utterance.rate = 0.95;
  utterance.pitch = 1;

  window.speechSynthesis.speak(utterance);
}

/* ========================================================================= */
/* COMPONENT                                                                 */
/* ========================================================================= */

export default function SignToText() {
  /* ----------------------------------------------------------------------- */
  /* REFERENCES                                                              */
  /* ----------------------------------------------------------------------- */

  const videoRef =
    useRef<HTMLVideoElement | null>(null);

  const canvasRef =
    useRef<HTMLCanvasElement | null>(null);

  const wsRef =
    useRef<WebSocket | null>(null);

  const streamRef =
    useRef<MediaStream | null>(null);

  const animationFrameRef =
    useRef<number | null>(null);

  const lastFrameTimeRef =
    useRef(0);

  const waitingForResponseRef =
    useRef(false);

  const predictionBufferRef =
    useRef<string[]>([]);

  const lastAcceptedSignRef =
    useRef("");

  const lastAcceptedTimeRef =
    useRef(0);

  /* ----------------------------------------------------------------------- */
  /* STATE                                                                   */
  /* ----------------------------------------------------------------------- */

  const [isCameraOn, setIsCameraOn] =
    useState(false);

  const [isConnecting, setIsConnecting] =
    useState(false);

  const [isConnected, setIsConnected] =
    useState(false);

  const [currentPrediction, setCurrentPrediction] =
    useState("");

  const [confidence, setConfidence] =
    useState(0);

  const [handDetected, setHandDetected] =
    useState(false);

  const [handedness, setHandedness] =
    useState<string | null>(null);

  const [landmarks, setLandmarks] =
    useState<Landmark[]>([]);

  const [sentence, setSentence] =
    useState<string[]>([]);

  const [acceptedSigns, setAcceptedSigns] =
    useState<AcceptedSign[]>([]);

  const [stableCount, setStableCount] =
    useState(0);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const [showError, setShowError] =
    useState(false);

  /* ----------------------------------------------------------------------- */
  /* VOICE OUTPUT                                                            */
  /* ----------------------------------------------------------------------- */

  const [voiceOutputEnabled, setVoiceOutputEnabled] =
    useState(true);

  /* ========================================================================= */
  /* DERIVED DATA                                                            */
  /* ========================================================================= */

  const sentenceText =
    sentence.join(" ");

  const wordCount =
    sentence.length;

  const confidenceLabel =
    confidence > 0
      ? `${confidence.toFixed(1)}%`
      : "--";

  const recognitionState =
    !isCameraOn
      ? "Standby"
      : !isConnected
        ? "Connecting"
        : currentPrediction
          ? "Recognizing"
          : "Scanning";

  /* ========================================================================= */
  /* ERROR MODAL                                                             */
  /* ========================================================================= */

  const showErrorModal = useCallback(
    (message: string) => {
      setErrorMessage(message);
      setShowError(true);
    },
    []
  );

  /* ========================================================================= */
  /* ACCEPT STABLE SIGN                                                      */
  /* ========================================================================= */

  const acceptSign = useCallback(
    (
      sign: string,
      signConfidence: number
    ) => {
      const cleanSign =
        sign.trim();

      if (!cleanSign) {
        return;
      }

      const now =
        Date.now();

      if (
        cleanSign ===
          lastAcceptedSignRef.current &&
        now -
            lastAcceptedTimeRef.current <
          SAME_SIGN_COOLDOWN
      ) {
        return;
      }

      lastAcceptedSignRef.current =
        cleanSign;

      lastAcceptedTimeRef.current =
        now;

      const accepted: AcceptedSign = {
        word: cleanSign,
        confidence: signConfidence,
        timestamp: new Date(),
      };

      setSentence((previous) => [
        ...previous,
        cleanSign,
      ]);

      setAcceptedSigns((previous) =>
        [accepted, ...previous].slice(0, 8)
      );

      void saveHistory({
        type: "sign-to-text",
        input: "Hand sign",
        output: cleanSign,
        confidence:
          signConfidence / 100,
      }).catch((error) => {
        console.warn(
          "Could not save sign-to-text history:",
          error
        );
      });

      if (voiceOutputEnabled) {
        speakText(cleanSign);
      }
    },
    [voiceOutputEnabled]
  );

  /* ========================================================================= */
  /* HANDLE AI PREDICTION                                                    */
  /* ========================================================================= */

  const handlePrediction = useCallback(
    (data: PredictionResponse) => {
      const prediction =
        data.prediction?.trim() ?? "";

      const currentConfidence =
        normalizeConfidence(
          data.confidence
        );

      setConfidence(
        currentConfidence
      );

      setHandDetected(
        Boolean(data.hand_detected)
      );

      setHandedness(
        data.handedness ?? null
      );

      setLandmarks(
        data.landmarks ?? []
      );

      if (!prediction) {
        setCurrentPrediction("");
        setStableCount(0);

        predictionBufferRef.current =
          [];

        return;
      }

      setCurrentPrediction(
        prediction
      );

      if (
        currentConfidence <
        CONFIDENCE_THRESHOLD * 100
      ) {
        setStableCount(0);

        predictionBufferRef.current =
          [];

        return;
      }

      const buffer =
        predictionBufferRef.current;

      buffer.push(prediction);

      if (
        buffer.length >
        STABLE_COUNT
      ) {
        buffer.shift();
      }

      const isStable =
        buffer.length ===
          STABLE_COUNT &&
        buffer.every(
          (item) =>
            item === prediction
        );

      setStableCount(
        buffer.length
      );

      if (isStable) {
        acceptSign(
          prediction,
          currentConfidence
        );

        predictionBufferRef.current =
          [];

        setStableCount(0);
      }
    },
    [acceptSign]
  );

  /* ========================================================================= */
  /* SEND CAMERA FRAME                                                       */
  /* ========================================================================= */

  const sendFrame = useCallback(() => {
    const video =
      videoRef.current;

    const canvas =
      canvasRef.current;

    const ws =
      wsRef.current;

    if (
      !video ||
      !canvas ||
      !ws
    ) {
      return;
    }

    if (
      ws.readyState !==
      WebSocket.OPEN
    ) {
      return;
    }

    if (
      video.readyState < 2
    ) {
      return;
    }

    if (
      waitingForResponseRef.current
    ) {
      return;
    }

    const now =
      performance.now();

    if (
      now -
        lastFrameTimeRef.current <
      FRAME_INTERVAL
    ) {
      return;
    }

    lastFrameTimeRef.current =
      now;

    canvas.width = 480;
    canvas.height = 360;

    const context =
      canvas.getContext("2d");

    if (!context) {
      return;
    }

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    const imageData =
      canvas
        .toDataURL(
          "image/jpeg",
          JPEG_QUALITY
        )
        .split(",")[1];

    if (!imageData) {
      return;
    }

    waitingForResponseRef.current =
      true;

    try {
      ws.send(imageData);
    } catch (error) {
      console.error(
        "Could not send camera frame:",
        error
      );

      waitingForResponseRef.current =
        false;
    }
  }, []);

  /* ========================================================================= */
  /* FRAME LOOP                                                              */
  /* ========================================================================= */

  const startFrameLoop =
    useCallback(() => {
      const loop = () => {
        sendFrame();

        animationFrameRef.current =
          requestAnimationFrame(
            loop
          );
      };

      animationFrameRef.current =
        requestAnimationFrame(
          loop
        );
    }, [sendFrame]);

  const stopFrameLoop =
    useCallback(() => {
      if (
        animationFrameRef.current !==
        null
      ) {
        cancelAnimationFrame(
          animationFrameRef.current
        );

        animationFrameRef.current =
          null;
      }
    }, []);

  /* ========================================================================= */
  /* START CAMERA                                                            */
  /* ========================================================================= */

  const startCamera =
    useCallback(async () => {
      try {
        setIsConnecting(true);

        const stream =
          await navigator.mediaDevices.getUserMedia(
            {
              video: {
                width: {
                  ideal: 640,
                },
                height: {
                  ideal: 480,
                },
                facingMode:
                  "user",
              },
              audio: false,
            }
          );

        streamRef.current =
          stream;

        const video =
          videoRef.current;

        if (!video) {
          return;
        }

        video.srcObject =
          stream;

        await video.play();

        setIsCameraOn(true);

        const ws =
          new WebSocket(
            WS_URL
          );

        wsRef.current =
          ws;

        ws.onopen = () => {
          setIsConnected(
            true
          );

          setIsConnecting(
            false
          );

          startFrameLoop();
        };

        ws.onmessage = (
          event
        ) => {
          waitingForResponseRef.current =
            false;

          try {
            const data =
              JSON.parse(
                event.data
              ) as PredictionResponse;

            handlePrediction(
              data
            );
          } catch (error) {
            console.error(
              "Invalid WebSocket response:",
              error
            );
          }
        };

        ws.onerror = () => {
          waitingForResponseRef.current =
            false;

          setIsConnected(
            false
          );

          setIsConnecting(
            false
          );

          showErrorModal(
            "Unable to connect to the ISL recognition server. Make sure the FastAPI backend is running."
          );
        };

        ws.onclose = () => {
          waitingForResponseRef.current =
            false;

          setIsConnected(
            false
          );

          setIsConnecting(
            false
          );
        };
      } catch (error) {
        console.error(
          "Camera error:",
          error
        );

        setIsConnecting(
          false
        );

        showErrorModal(
          "Camera access was denied or unavailable. Please allow camera permission and try again."
        );
      }
    }, [
      handlePrediction,
      showErrorModal,
      startFrameLoop,
    ]);

  /* ========================================================================= */
  /* STOP CAMERA                                                             */
  /* ========================================================================= */

  const stopCamera =
    useCallback(() => {
      stopFrameLoop();

      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }

      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach(
            (track) =>
              track.stop()
          );

        streamRef.current =
          null;
      }

      if (videoRef.current) {
        videoRef.current.srcObject =
          null;
      }

      waitingForResponseRef.current =
        false;

      predictionBufferRef.current =
        [];

      setIsCameraOn(false);
      setIsConnected(false);
      setIsConnecting(false);
      setCurrentPrediction("");
      setConfidence(0);
      setHandDetected(false);
      setHandedness(null);
      setLandmarks([]);
      setStableCount(0);
    }, [stopFrameLoop]);

  /* ========================================================================= */
  /* CAMERA TOGGLE                                                           */
  /* ========================================================================= */

  const toggleCamera = () => {
    if (isCameraOn) {
      stopCamera();
    } else {
      void startCamera();
    }
  };

  /* ========================================================================= */
  /* VOICE TOGGLE                                                            */
  /* ========================================================================= */

  const toggleVoiceOutput = () => {
    setVoiceOutputEnabled(
      (previous) => {
        const next = !previous;

        if (!next && "speechSynthesis" in window) {
          window.speechSynthesis.cancel();
        }

        return next;
      }
    );
  };

  /* ========================================================================= */
  /* CLEAR EVERYTHING                                                        */
  /* ========================================================================= */

  const handleClear = () => {
    setSentence([]);
    setAcceptedSigns([]);
    setCurrentPrediction("");
    setConfidence(0);
    setStableCount(0);

    predictionBufferRef.current =
      [];

    lastAcceptedSignRef.current =
      "";

    lastAcceptedTimeRef.current =
      0;
  };

  /* ========================================================================= */
  /* UNDO LAST SIGN                                                          */
  /* ========================================================================= */

  const handleUndo = () => {
    if (
      sentence.length === 0
    ) {
      return;
    }

    setSentence(
      (previous) =>
        previous.slice(
          0,
          -1
        )
    );

    setAcceptedSigns(
      (previous) =>
        previous.slice(
          1
        )
    );

    predictionBufferRef.current =
      [];

    lastAcceptedSignRef.current =
      "";

    lastAcceptedTimeRef.current =
      0;
  };

  /* ========================================================================= */
  /* COPY                                                                    */
  /* ========================================================================= */

  const handleCopy = async () => {
    if (!sentenceText) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        sentenceText
      );
    } catch (error) {
      console.warn(
        "Could not copy translation:",
        error
      );
    }
  };

  /* ========================================================================= */
  /* SPEAK SENTENCE                                                          */
  /* ========================================================================= */

  const handleSpeak = () => {
    speakText(
      sentenceText
    );
  };

  /* ========================================================================= */
  /* SPEAK CURRENT SIGN                                                      */
  /* ========================================================================= */

  const handleSpeakCurrentSign =
    () => {
      if (!currentPrediction) {
        return;
      }

      speakText(
        currentPrediction
      );
    };

  /* ========================================================================= */
  /* CLEANUP                                                                 */
  /* ========================================================================= */

  useEffect(() => {
    return () => {
      stopFrameLoop();

      if (wsRef.current) {
        wsRef.current.close();
      }

      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach(
            (track) =>
              track.stop()
          );
      }

      if (
        "speechSynthesis" in
        window
      ) {
        window.speechSynthesis.cancel();
      }
    };
  }, [stopFrameLoop]);

  /* ========================================================================= */
  /* LANDMARK RENDERER                                                       */
  /* ========================================================================= */

  const renderLandmarks = () => {
    if (
      landmarks.length === 0
    ) {
      return null;
    }

    return (
      <svg
        viewBox="0 0 1 1"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 h-full w-full"
      >
        <defs>
          <filter
            id="landmarkGlow"
            x="-100%"
            y="-100%"
            width="300%"
            height="300%"
          >
            <feGaussianBlur
              stdDeviation="0.008"
              result="blur"
            />

            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {HAND_CONNECTIONS.map(
          ([start, end], index) => {
            const a =
              landmarks[start];

            const b =
              landmarks[end];

            if (!a || !b) {
              return null;
            }

            return (
              <line
                key={`connection-${index}`}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke="var(--sb-primary)"
                strokeWidth="0.006"
                strokeLinecap="round"
                opacity="0.9"
                filter="url(#landmarkGlow)"
              />
            );
          }
        )}

        {landmarks.map(
          (point, index) => (
            <g
              key={`landmark-${index}`}
            >
              <circle
                cx={point.x}
                cy={point.y}
                r="0.026"
                fill="var(--sb-primary)"
                opacity="0.12"
              />

              <circle
                cx={point.x}
                cy={point.y}
                r="0.012"
                fill="var(--sb-primary)"
                stroke="white"
                strokeWidth="0.004"
                filter="url(#landmarkGlow)"
              />
            </g>
          )
        )}
      </svg>
    );
  };

  /* ========================================================================= */
  /* UI                                                                      */
  /* ========================================================================= */

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--sb-bg)] text-[var(--sb-text)]">

      {/* =================================================================== */}
      {/* AMBIENT BACKGROUND                                                  */}
      {/* =================================================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full blur-[120px] opacity-20"
          style={{
            background:
              "var(--sb-primary)",
          }}
        />

        <div
          className="absolute -right-40 top-20 h-[480px] w-[480px] rounded-full blur-[120px] opacity-15"
          style={{
            background:
              "var(--sb-secondary)",
          }}
        />

        <div
          className="absolute bottom-0 left-1/3 h-[500px] w-[500px] rounded-full blur-[130px] opacity-10"
          style={{
            background:
              "var(--sb-accent)",
          }}
        />
      </div>

      {/* =================================================================== */}
      {/* MAIN                                                                */}
      {/* =================================================================== */}

      <div className="relative z-10 mx-auto max-w-[1550px] space-y-6">

        {/* ================================================================= */}
        {/* HERO HEADER                                                       */}
        {/* ================================================================= */}

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
            duration: 0.5,
          }}
          className="relative overflow-hidden rounded-[2rem] border border-[var(--sb-border)] bg-[var(--sb-surface)] p-6 shadow-2xl backdrop-blur-2xl sm:p-8"
          style={{
            boxShadow:
              "0 25px 80px color-mix(in srgb, var(--sb-primary) 5%, transparent)",
          }}
        >

          <div
            className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full opacity-10 blur-[90px]"
            style={{
              background:
                "var(--sb-primary)",
            }}
          />

          <div
            className="pointer-events-none absolute bottom-0 left-1/3 h-1 w-1/3 opacity-50 blur-sm"
            style={{
              background:
                "linear-gradient(90deg, transparent, var(--sb-primary), var(--sb-secondary), transparent)",
            }}
          />

          <div className="relative flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">

            <div>

              <div className="mb-4 flex flex-wrap items-center gap-2">

                <span
                  className="flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em]"
                  style={{
                    borderColor:
                      "color-mix(in srgb, var(--sb-primary) 25%, transparent)",
                    background:
                      "color-mix(in srgb, var(--sb-primary) 8%, transparent)",
                    color:
                      "var(--sb-primary)",
                  }}
                >
                  <FiRadio className="h-3 w-3" />
                  Live AI Vision
                </span>

                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--sb-muted)]">
                  Indian Sign Language
                </span>

                <span
                  className="rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-wider"
                  style={{
                    borderColor:
                      voiceOutputEnabled
                        ? "color-mix(in srgb, var(--sb-primary) 20%, transparent)"
                        : "rgba(255,255,255,0.08)",
                    background:
                      voiceOutputEnabled
                        ? "color-mix(in srgb, var(--sb-primary) 7%, transparent)"
                        : "rgba(255,255,255,0.03)",
                    color:
                      voiceOutputEnabled
                        ? "var(--sb-primary)"
                        : "var(--sb-muted)",
                  }}
                >
                  {voiceOutputEnabled
                    ? "Voice On"
                    : "Voice Off"}
                </span>

              </div>

              <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
                Sign to{" "}
                <span
                  style={{
                    background:
                      "linear-gradient(135deg, var(--sb-primary), var(--sb-secondary), var(--sb-accent))",
                    WebkitBackgroundClip:
                      "text",
                    backgroundClip:
                      "text",
                    color:
                      "transparent",
                  }}
                >
                  Text
                </span>
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--sb-muted)] sm:text-base">
                Convert Indian Sign Language gestures into
                readable text in real time using computer
                vision, hand landmarks and AI gesture
                classification.
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[var(--sb-muted)]">
                <span className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                  MediaPipe
                </span>

                <span className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                  21 Landmarks
                </span>

                <span className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                  AI Classification
                </span>

                <span className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                  Real-time
                </span>
              </div>

            </div>

            {/* SYSTEM STATUS */}

            <div className="flex flex-wrap gap-3 xl:max-w-[410px]">

              <div
                className="flex min-w-[180px] flex-1 items-center gap-3 rounded-2xl border px-4 py-3"
                style={{
                  borderColor:
                    "var(--sb-border)",
                  background:
                    "color-mix(in srgb, var(--sb-bg) 45%, transparent)",
                }}
              >
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-xl"
                  style={{
                    background:
                      "color-mix(in srgb, var(--sb-primary) 10%, transparent)",
                    color:
                      "var(--sb-primary)",
                  }}
                >
                  <FiCpu />
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[var(--sb-muted)]">
                    AI Engine
                  </p>

                  <p className="text-xs font-black">
                    ISL-Transformer
                  </p>
                </div>
              </div>

              <div
                className="flex min-w-[180px] flex-1 items-center gap-3 rounded-2xl border px-4 py-3"
                style={{
                  borderColor:
                    "var(--sb-border)",
                  background:
                    "color-mix(in srgb, var(--sb-bg) 45%, transparent)",
                }}
              >
                <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-white/5">

                  <span
                    className={`absolute h-2.5 w-2.5 rounded-full ${
                      isConnected
                        ? "animate-pulse"
                        : ""
                    }`}
                    style={{
                      background:
                        isConnected
                          ? "var(--sb-primary)"
                          : "#64748b",
                      boxShadow:
                        isConnected
                          ? "0 0 14px var(--sb-primary)"
                          : "none",
                    }}
                  />

                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[var(--sb-muted)]">
                    Connection
                  </p>

                  <p className="text-xs font-black">
                    {isConnected
                      ? "Online"
                      : isConnecting
                        ? "Connecting"
                        : "Standby"}
                  </p>
                </div>
              </div>

            </div>
          </div>
        </motion.div>

        {/* ================================================================= */}
        {/* MAIN WORKSPACE                                                    */}
        {/* ================================================================= */}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_380px]">

          {/* =============================================================== */}
          {/* CAMERA                                                          */}
          {/* =============================================================== */}

          <motion.div
            initial={{
              opacity: 0,
              scale: 0.98,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            transition={{
              duration: 0.5,
              delay: 0.05,
            }}
          >
            <GlassCard className="overflow-hidden !rounded-[2rem] !border-[var(--sb-border)] !bg-[var(--sb-surface)]">

              {/* Camera header */}

              <div className="flex items-center justify-between border-b border-[var(--sb-border)] px-5 py-4 sm:px-6">

                <div className="flex items-center gap-3">

                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-2xl"
                    style={{
                      background:
                        "linear-gradient(135deg, color-mix(in srgb, var(--sb-primary) 12%, transparent), color-mix(in srgb, var(--sb-secondary) 12%, transparent))",
                      color:
                        "var(--sb-primary)",
                    }}
                  >
                    <FiEye className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-sm font-black">
                      AI Vision Workspace
                    </p>

                    <p className="text-xs text-[var(--sb-muted)]">
                      21-point MediaPipe hand tracking
                    </p>
                  </div>

                </div>

                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">

                  <span
                    className={`h-2 w-2 rounded-full ${
                      isCameraOn
                        ? "animate-pulse"
                        : ""
                    }`}
                    style={{
                      background:
                        isCameraOn
                          ? "var(--sb-primary)"
                          : "#475569",
                    }}
                  />

                  <span className="text-[10px] font-black uppercase tracking-widest text-[var(--sb-muted)]">
                    {isCameraOn
                      ? "Live"
                      : "Offline"}
                  </span>

                </div>
              </div>

              {/* Camera area */}

              <div className="p-3 sm:p-5">

                <div className="relative aspect-video overflow-hidden rounded-[1.75rem] border border-white/10 bg-black shadow-2xl">

                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="h-full w-full object-cover"
                    style={{
                      transform:
                        "scaleX(-1)",
                    }}
                  />

                  <canvas
                    ref={canvasRef}
                    className="hidden"
                  />

                  {/* Camera off */}

                  {!isCameraOn && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-950/90 backdrop-blur-xl">

                      <div className="px-6 text-center">

                        <motion.div
                          animate={{
                            scale: [
                              1,
                              1.04,
                              1,
                            ],
                            boxShadow: [
                              "0 0 0px transparent",
                              "0 0 40px color-mix(in srgb, var(--sb-primary) 18%, transparent)",
                              "0 0 0px transparent",
                            ],
                          }}
                          transition={{
                            duration: 2.5,
                            repeat:
                              Infinity,
                          }}
                          className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-[2rem] border border-white/10"
                          style={{
                            background:
                              "linear-gradient(135deg, color-mix(in srgb, var(--sb-primary) 10%, transparent), color-mix(in srgb, var(--sb-secondary) 10%, transparent))",
                            color:
                              "var(--sb-primary)",
                          }}
                        >
                          <FiCamera className="h-9 w-9" />
                        </motion.div>

                        <h3 className="text-xl font-black">
                          Camera Ready
                        </h3>

                        <p className="mx-auto mt-2 max-w-md text-xs leading-6 text-slate-400">
                          Activate the camera to begin
                          real-time Indian Sign Language
                          recognition.
                        </p>

                      </div>
                    </div>
                  )}

                  {/* Landmarks */}

                  {isCameraOn &&
                    renderLandmarks()}

                  {/* Scanner corners */}

                  {isCameraOn && (
                    <>
                      <div
                        className="absolute left-5 top-5 h-10 w-10 border-l-2 border-t-2"
                        style={{
                          borderColor:
                            "var(--sb-primary)",
                        }}
                      />

                      <div
                        className="absolute right-5 top-5 h-10 w-10 border-r-2 border-t-2"
                        style={{
                          borderColor:
                            "var(--sb-primary)",
                        }}
                      />

                      <div
                        className="absolute bottom-5 left-5 h-10 w-10 border-b-2 border-l-2"
                        style={{
                          borderColor:
                            "var(--sb-primary)",
                        }}
                      />

                      <div
                        className="absolute bottom-5 right-5 h-10 w-10 border-b-2 border-r-2"
                        style={{
                          borderColor:
                            "var(--sb-primary)",
                        }}
                      />
                    </>
                  )}

                  {/* Scanning line */}

                  {isCameraOn &&
                    handDetected && (
                      <motion.div
                        initial={{
                          top: "12%",
                        }}
                        animate={{
                          top: [
                            "12%",
                            "88%",
                            "12%",
                          ],
                        }}
                        transition={{
                          duration: 3,
                          repeat:
                            Infinity,
                          ease:
                            "easeInOut",
                        }}
                        className="absolute left-[7%] right-[7%] h-px"
                        style={{
                          background:
                            "linear-gradient(90deg, transparent, var(--sb-primary), transparent)",
                          boxShadow:
                            "0 0 20px var(--sb-primary)",
                        }}
                      />
                    )}

                  {/* Camera information HUD */}

                  {isCameraOn && (
                    <>
                      <div className="absolute left-4 top-4 flex items-center gap-2 rounded-xl border border-white/10 bg-black/50 px-3 py-2 backdrop-blur-xl">

                        <FiRadio
                          className="h-3.5 w-3.5"
                          style={{
                            color:
                              "var(--sb-primary)",
                          }}
                        />

                        <span className="text-[10px] font-bold uppercase tracking-wider text-white">
                          AI Tracking
                        </span>

                      </div>

                      <div className="absolute right-4 top-4 rounded-xl border border-white/10 bg-black/50 px-3 py-2 backdrop-blur-xl">

                        <span className="text-[10px] font-bold text-white">
                          480 × 360
                        </span>

                      </div>

                      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3">

                        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/55 px-3 py-2 backdrop-blur-xl">

                          {handDetected ? (
                            <>
                              <FiCheckCircle
                                className="h-4 w-4"
                                style={{
                                  color:
                                    "var(--sb-primary)",
                                }}
                              />

                              <span className="text-xs font-bold text-white">
                                Hand detected
                              </span>
                            </>
                          ) : (
                            <>
                              <FiTarget className="h-4 w-4 text-slate-400" />

                              <span className="text-xs font-bold text-slate-300">
                                Searching for hand...
                              </span>
                            </>
                          )}

                        </div>

                        {handedness && (
                          <div className="rounded-xl border border-white/10 bg-black/55 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-white backdrop-blur-xl">
                            {handedness} hand
                          </div>
                        )}

                      </div>
                    </>
                  )}
                </div>

                {/* Controls */}

                <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_auto]">

                  <motion.button
                    type="button"
                    onClick={
                      toggleCamera
                    }
                    disabled={
                      isConnecting
                    }
                    whileHover={{
                      scale: 1.01,
                      y: -1,
                    }}
                    whileTap={{
                      scale: 0.98,
                    }}
                    className="flex min-h-[58px] items-center justify-center gap-3 rounded-2xl px-6 text-sm font-black text-slate-950 transition-all disabled:cursor-not-allowed disabled:opacity-60"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--sb-primary), var(--sb-secondary))",
                      boxShadow:
                        isCameraOn
                          ? "0 0 35px color-mix(in srgb, var(--sb-primary) 20%, transparent)"
                          : "none",
                    }}
                  >
                    {isCameraOn ? (
                      <>
                        <FiSquare />
                        Stop Translation
                      </>
                    ) : (
                      <>
                        <FiPlay />
                        {isConnecting
                          ? "Connecting..."
                          : "Start AI Translation"}
                      </>
                    )}
                  </motion.button>

                  {/* Voice toggle */}

                  <button
                    type="button"
                    onClick={
                      toggleVoiceOutput
                    }
                    className="flex min-h-[58px] items-center justify-center gap-2 rounded-2xl border px-5 text-xs font-black transition-all hover:bg-white/5"
                    style={{
                      borderColor:
                        voiceOutputEnabled
                          ? "color-mix(in srgb, var(--sb-primary) 25%, transparent)"
                          : "var(--sb-border)",
                      background:
                        voiceOutputEnabled
                          ? "color-mix(in srgb, var(--sb-primary) 7%, transparent)"
                          : "var(--sb-surface)",
                      color:
                        voiceOutputEnabled
                          ? "var(--sb-primary)"
                          : "var(--sb-muted)",
                    }}
                    title={
                      voiceOutputEnabled
                        ? "Turn automatic voice output off"
                        : "Turn automatic voice output on"
                    }
                  >
                    {voiceOutputEnabled ? (
                      <FiVolume2 className="h-4 w-4" />
                    ) : (
                      <FiVolumeX className="h-4 w-4" />
                    )}

                    <span className="hidden sm:inline">
                      Voice{" "}
                      {voiceOutputEnabled
                        ? "On"
                        : "Off"}
                    </span>
                  </button>

                  <div
                    className="flex min-h-[58px] items-center justify-center gap-3 rounded-2xl border px-5"
                    style={{
                      borderColor:
                        "var(--sb-border)",
                      background:
                        "var(--sb-surface)",
                    }}
                  >
                    <FiActivity
                      className="h-4 w-4"
                      style={{
                        color:
                          "var(--sb-primary)",
                      }}
                    />

                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-[var(--sb-muted)]">
                        Recognition
                      </p>

                      <p className="text-xs font-black">
                        {recognitionState}
                      </p>
                    </div>
                  </div>

                </div>

                {/* Voice information */}

                <div className="mt-3 flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">

                  <div className="flex items-center gap-2">
                    {voiceOutputEnabled ? (
                      <FiVolume2
                        className="h-3.5 w-3.5"
                        style={{
                          color:
                            "var(--sb-primary)",
                        }}
                      />
                    ) : (
                      <FiVolumeX className="h-3.5 w-3.5 text-slate-500" />
                    )}

                    <span className="text-[10px] text-[var(--sb-muted)]">
                      {voiceOutputEnabled
                        ? "Accepted signs will be spoken automatically."
                        : "Automatic voice output is disabled."}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={
                      toggleVoiceOutput
                    }
                    className="text-[10px] font-black uppercase tracking-wider transition hover:opacity-80"
                    style={{
                      color:
                        "var(--sb-primary)",
                    }}
                  >
                    Change
                  </button>

                </div>

              </div>
            </GlassCard>
          </motion.div>

          {/* =============================================================== */}
          {/* RECOGNITION SIDEBAR                                              */}
          {/* =============================================================== */}

          <div className="space-y-6">

            {/* Current recognition */}

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
                duration: 0.5,
                delay: 0.1,
              }}
            >
              <GlassCard className="!rounded-[2rem] !border-[var(--sb-border)] !bg-[var(--sb-surface)] p-6">

                <div className="mb-5 flex items-center justify-between">

                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--sb-muted)]">
                      Recognition Engine
                    </p>

                    <h2 className="mt-1 text-xl font-black">
                      Live Sign
                    </h2>
                  </div>

                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-2xl"
                    style={{
                      background:
                        "color-mix(in srgb, var(--sb-primary) 10%, transparent)",
                      color:
                        "var(--sb-primary)",
                    }}
                  >
                    <FiTarget />
                  </div>

                </div>

                {/* Prediction display */}

                <div
                  className="relative flex min-h-[220px] flex-col items-center justify-center overflow-hidden rounded-[1.75rem] border p-6"
                  style={{
                    borderColor:
                      "color-mix(in srgb, var(--sb-primary) 12%, transparent)",
                    background:
                      "radial-gradient(circle at center, color-mix(in srgb, var(--sb-primary) 7%, transparent), transparent 65%)",
                  }}
                >

                  <div
                    className="pointer-events-none absolute inset-0 opacity-20"
                    style={{
                      background:
                        "radial-gradient(circle at center, var(--sb-primary), transparent 55%)",
                      filter:
                        "blur(70px)",
                    }}
                  />

                  <AnimatePresence
                    mode="wait"
                  >
                    <motion.div
                      key={
                        currentPrediction ||
                        "waiting"
                      }
                      initial={{
                        opacity: 0,
                        scale: 0.8,
                        y: 10,
                      }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                        y: 0,
                      }}
                      exit={{
                        opacity: 0,
                        scale: 0.8,
                      }}
                      className="relative z-10 text-center"
                    >

                      <div
                        className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-[2rem] border border-white/10 text-4xl font-black shadow-2xl"
                        style={{
                          background:
                            "linear-gradient(135deg, color-mix(in srgb, var(--sb-primary) 14%, transparent), color-mix(in srgb, var(--sb-accent) 14%, transparent))",
                          color:
                            "var(--sb-primary)",
                          boxShadow:
                            currentPrediction
                              ? "0 0 45px color-mix(in srgb, var(--sb-primary) 18%, transparent)"
                              : "none",
                        }}
                      >
                        {currentPrediction
                          ? currentPrediction
                              .charAt(0)
                              .toUpperCase()
                          : "?"}
                      </div>

                      <p className="text-2xl font-black capitalize">
                        {currentPrediction ||
                          "Waiting..."}
                      </p>

                      <p className="mt-2 text-xs text-[var(--sb-muted)]">
                        {handDetected
                          ? "Gesture detected"
                          : "Place your hand inside the camera"}
                      </p>

                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Confidence */}

                <div className="mt-5">

                  <div className="mb-2 flex items-center justify-between">

                    <span className="text-xs font-bold text-[var(--sb-muted)]">
                      AI Confidence
                    </span>

                    <span
                      className="text-sm font-black"
                      style={{
                        color:
                          "var(--sb-primary)",
                      }}
                    >
                      {confidenceLabel}
                    </span>

                  </div>

                  <div className="h-2.5 overflow-hidden rounded-full bg-white/5">

                    <motion.div
                      animate={{
                        width: `${Math.min(
                          confidence,
                          100
                        )}%`,
                      }}
                      transition={{
                        duration:
                          0.35,
                      }}
                      className="h-full rounded-full"
                      style={{
                        background:
                          "linear-gradient(90deg, var(--sb-primary), var(--sb-secondary), var(--sb-accent))",
                        boxShadow:
                          "0 0 14px color-mix(in srgb, var(--sb-primary) 35%, transparent)",
                      }}
                    />

                  </div>

                  <div className="mt-2 flex justify-between text-[9px] uppercase tracking-wider text-slate-600">
                    <span>Low</span>
                    <span>Threshold 60%</span>
                    <span>High</span>
                  </div>
                </div>

                {/* Speak */}

                <button
                  type="button"
                  onClick={
                    handleSpeakCurrentSign
                  }
                  disabled={
                    !currentPrediction
                  }
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-[var(--sb-border)] px-4 py-3.5 text-xs font-black transition-all hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <FiVolume2
                    style={{
                      color:
                        "var(--sb-primary)",
                    }}
                  />
                  Speak Current Sign
                </button>

              </GlassCard>
            </motion.div>

            {/* Detection metrics */}

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
                duration: 0.5,
                delay: 0.2,
              }}
            >
              <GlassCard className="!rounded-[2rem] !border-[var(--sb-border)] !bg-[var(--sb-surface)] p-6">

                <div className="mb-5 flex items-center gap-3">

                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{
                      background:
                        "color-mix(in srgb, var(--sb-secondary) 10%, transparent)",
                      color:
                        "var(--sb-secondary)",
                    }}
                  >
                    <FiActivity />
                  </div>

                  <div>
                    <p className="text-sm font-black">
                      Detection Metrics
                    </p>

                    <p className="text-xs text-[var(--sb-muted)]">
                      Live recognition telemetry
                    </p>
                  </div>

                </div>

                <div className="grid grid-cols-2 gap-3">

                  {/* Hand */}

                  <div className="rounded-2xl border border-white/5 bg-black/10 p-4">

                    <div className="mb-3 flex items-center justify-between">

                      <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--sb-muted)]">
                        Hand
                      </span>

                      <FiTarget
                        className="h-4 w-4"
                        style={{
                          color:
                            handDetected
                              ? "var(--sb-primary)"
                              : "#64748b",
                        }}
                      />

                    </div>

                    <p className="text-sm font-black">
                      {handDetected
                        ? "Detected"
                        : "Searching"}
                    </p>

                  </div>

                  {/* Network */}

                  <div className="rounded-2xl border border-white/5 bg-black/10 p-4">

                    <div className="mb-3 flex items-center justify-between">

                      <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--sb-muted)]">
                        Network
                      </span>

                      {isConnected ? (
                        <FiWifi
                          className="h-4 w-4"
                          style={{
                            color:
                              "var(--sb-primary)",
                          }}
                        />
                      ) : (
                        <FiWifiOff className="h-4 w-4 text-slate-500" />
                      )}

                    </div>

                    <p className="text-sm font-black">
                      {isConnected
                        ? "Connected"
                        : "Offline"}
                    </p>

                  </div>

                  {/* Stability */}

                  <div className="rounded-2xl border border-white/5 bg-black/10 p-4">

                    <div className="mb-3 flex items-center justify-between">

                      <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--sb-muted)]">
                        Stability
                      </span>

                      <FiCheckCircle
                        className="h-4 w-4"
                        style={{
                          color:
                            stableCount >=
                            STABLE_COUNT
                              ? "var(--sb-primary)"
                              : "#64748b",
                        }}
                      />

                    </div>

                    <p className="text-sm font-black">
                      {stableCount}/
                      {STABLE_COUNT}
                    </p>

                  </div>

                  {/* Model */}

                  <div className="rounded-2xl border border-white/5 bg-black/10 p-4">

                    <div className="mb-3 flex items-center justify-between">

                      <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--sb-muted)]">
                        Model
                      </span>

                      <FiCpu
                        className="h-4 w-4"
                        style={{
                          color:
                            "var(--sb-accent)",
                        }}
                      />

                    </div>

                    <p className="text-sm font-black">
                      v2.1.0
                    </p>

                  </div>

                </div>
              </GlassCard>
            </motion.div>

          </div>
        </div>

        {/* ================================================================= */}
        {/* TRANSLATION OUTPUT                                                 */}
        {/* ================================================================= */}

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
            duration: 0.5,
            delay: 0.15,
          }}
        >
          <GlassCard className="relative overflow-hidden !rounded-[2rem] !border-[var(--sb-border)] !bg-[var(--sb-surface)] p-5 shadow-xl sm:p-7">

            {/* Decorative top line */}

            <div
              className="absolute left-8 right-8 top-0 h-px"
              style={{
                background:
                  "linear-gradient(90deg, transparent, var(--sb-primary), var(--sb-secondary), transparent)",
              }}
            />

            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

              <div className="flex items-center gap-3">

                <div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl"
                  style={{
                    background:
                      "linear-gradient(135deg, color-mix(in srgb, var(--sb-primary) 12%, transparent), color-mix(in srgb, var(--sb-secondary) 12%, transparent))",
                    color:
                      "var(--sb-primary)",
                  }}
                >
                  <FiCommand />
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--sb-muted)]">
                    Translation Output
                  </p>

                  <h2 className="mt-1 text-xl font-black">
                    Live Sentence
                  </h2>
                </div>

              </div>

              <div className="flex flex-wrap items-center gap-2">

                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-[var(--sb-muted)]">
                  {wordCount}{" "}
                  {wordCount === 1
                    ? "word"
                    : "words"}
                </span>

                {sentence.length >
                  0 && (
                  <span
                    className="rounded-full px-3 py-1.5 text-xs font-black"
                    style={{
                      background:
                        "color-mix(in srgb, var(--sb-primary) 10%, transparent)",
                      color:
                        "var(--sb-primary)",
                    }}
                  >
                    Translation active
                  </span>
                )}

                <span
                  className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold"
                  style={{
                    borderColor:
                      voiceOutputEnabled
                        ? "color-mix(in srgb, var(--sb-primary) 20%, transparent)"
                        : "var(--sb-border)",
                    color:
                      voiceOutputEnabled
                        ? "var(--sb-primary)"
                        : "var(--sb-muted)",
                  }}
                >
                  {voiceOutputEnabled ? (
                    <FiVolume2 />
                  ) : (
                    <FiVolumeX />
                  )}
                  Voice{" "}
                  {voiceOutputEnabled
                    ? "ON"
                    : "OFF"}
                </span>

              </div>
            </div>

            {/* Sentence */}

            <div
              className="relative mt-5 min-h-[170px] overflow-hidden rounded-[1.75rem] border p-6 sm:p-8"
              style={{
                borderColor:
                  "color-mix(in srgb, var(--sb-primary) 10%, transparent)",
                background:
                  "linear-gradient(135deg, color-mix(in srgb, var(--sb-primary) 4%, transparent), transparent 45%)",
              }}
            >

              <div
                className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full opacity-10 blur-[70px]"
                style={{
                  background:
                    "var(--sb-primary)",
                }}
              />

              {sentence.length ===
              0 ? (
                <div className="relative flex min-h-[120px] items-center justify-center text-center">

                  <div>

                    <div
                      className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl"
                      style={{
                        background:
                          "color-mix(in srgb, var(--sb-primary) 7%, transparent)",
                        color:
                          "var(--sb-primary)",
                      }}
                    >
                      <FiMic className="h-5 w-5" />
                    </div>

                    <p className="text-sm font-bold text-slate-400">
                      Your recognized sentence will appear here.
                    </p>

                    <p className="mt-2 text-xs text-slate-500">
                      Start the camera and perform an ISL gesture.
                    </p>

                  </div>

                </div>
              ) : (
                <div className="relative flex flex-wrap gap-2">

                  <AnimatePresence>
                    {sentence.map(
                      (
                        word,
                        index
                      ) => (
                        <motion.span
                          key={`${word}-${index}`}
                          initial={{
                            opacity: 0,
                            y: 10,
                            scale: 0.9,
                          }}
                          animate={{
                            opacity: 1,
                            y: 0,
                            scale: 1,
                          }}
                          exit={{
                            opacity: 0,
                            scale: 0.8,
                          }}
                          className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-lg font-black shadow-lg sm:text-xl"
                        >
                          {word}
                        </motion.span>
                      )
                    )}
                  </AnimatePresence>

                </div>
              )}

            </div>

            {/* Controls */}

            <div className="mt-5 flex flex-wrap gap-3">

              <button
                type="button"
                onClick={
                  handleUndo
                }
                disabled={
                  sentence.length ===
                  0
                }
                className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-xs font-black transition-all hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <FiRotateCcw />
                Undo
              </button>

              <button
                type="button"
                onClick={
                  handleClear
                }
                disabled={
                  sentence.length ===
                  0
                }
                className="flex items-center gap-2 rounded-xl border border-red-400/10 bg-red-400/5 px-4 py-3 text-xs font-black text-red-300 transition-all hover:border-red-400/20 hover:bg-red-400/10 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <FiTrash2 />
                Clear
              </button>

              <button
                type="button"
                onClick={
                  handleCopy
                }
                disabled={
                  sentence.length ===
                  0
                }
                className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-xs font-black transition-all hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <FiCopy />
                Copy
              </button>

              <button
                type="button"
                onClick={
                  toggleVoiceOutput
                }
                className="flex items-center gap-2 rounded-xl border px-4 py-3 text-xs font-black transition-all hover:bg-white/5"
                style={{
                  borderColor:
                    voiceOutputEnabled
                      ? "color-mix(in srgb, var(--sb-primary) 25%, transparent)"
                      : "var(--sb-border)",
                  color:
                    voiceOutputEnabled
                      ? "var(--sb-primary)"
                      : "var(--sb-muted)",
                }}
              >
                {voiceOutputEnabled ? (
                  <FiVolume2 />
                ) : (
                  <FiVolumeX />
                )}

                Voice{" "}
                {voiceOutputEnabled
                  ? "On"
                  : "Off"}
              </button>

              <motion.button
                type="button"
                onClick={
                  handleSpeak
                }
                disabled={
                  sentence.length ===
                  0
                }
                whileHover={{
                  scale: 1.02,
                }}
                whileTap={{
                  scale: 0.97,
                }}
                className="flex items-center gap-2 rounded-xl px-5 py-3 text-xs font-black text-slate-950 transition-all disabled:cursor-not-allowed disabled:opacity-30"
                style={{
                  background:
                    "linear-gradient(135deg, var(--sb-primary), var(--sb-secondary))",
                }}
              >
                <FiVolume2 />
                Speak Sentence
              </motion.button>

            </div>
          </GlassCard>
        </motion.div>

        {/* ================================================================= */}
        {/* RECENT RECOGNITIONS                                               */}
        {/* ================================================================= */}

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
            duration: 0.5,
            delay: 0.25,
          }}
        >
          <GlassCard className="!rounded-[2rem] !border-[var(--sb-border)] !bg-[var(--sb-surface)] p-5 sm:p-7">

            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-center gap-3">

                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{
                    background:
                      "color-mix(in srgb, var(--sb-accent) 10%, transparent)",
                    color:
                      "var(--sb-accent)",
                  }}
                >
                  <FiClock />
                </div>

                <div>
                  <p className="text-sm font-black">
                    Recent Recognitions
                  </p>

                  <p className="text-xs text-[var(--sb-muted)]">
                    Latest accepted gestures
                  </p>
                </div>

              </div>

              <span className="w-fit rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-[var(--sb-muted)]">
                {acceptedSigns.length}/8
              </span>

            </div>

            {acceptedSigns.length ===
            0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center">

                <FiTarget className="mx-auto mb-3 h-7 w-7 text-slate-600" />

                <p className="text-xs font-semibold text-slate-500">
                  No accepted signs yet.
                </p>

              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

                {acceptedSigns.map(
                  (
                    item,
                    index
                  ) => (
                    <motion.div
                      key={`${item.word}-${item.timestamp.getTime()}-${index}`}
                      initial={{
                        opacity: 0,
                        scale: 0.95,
                      }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                      }}
                      className="group rounded-2xl border border-white/10 bg-black/10 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--sb-primary)]/20"
                    >

                      <div className="flex items-start justify-between gap-3">

                        <div className="min-w-0">

                          <p className="truncate text-base font-black capitalize">
                            {item.word}
                          </p>

                          <p className="mt-1 text-[10px] text-[var(--sb-muted)]">
                            {item.timestamp.toLocaleTimeString(
                              [],
                              {
                                hour:
                                  "2-digit",
                                minute:
                                  "2-digit",
                                second:
                                  "2-digit",
                              }
                            )}
                          </p>

                        </div>

                        <span
                          className="shrink-0 rounded-lg px-2 py-1 text-[10px] font-black"
                          style={{
                            background:
                              "color-mix(in srgb, var(--sb-primary) 10%, transparent)",
                            color:
                              "var(--sb-primary)",
                          }}
                        >
                          {item.confidence.toFixed(
                            0
                          )}
                          %
                        </span>

                      </div>

                      <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/5">

                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.min(
                              item.confidence,
                              100
                            )}%`,
                            background:
                              "linear-gradient(90deg, var(--sb-primary), var(--sb-secondary))",
                          }}
                        />

                      </div>

                    </motion.div>
                  )
                )}

              </div>
            )}

          </GlassCard>
        </motion.div>

        {/* ================================================================= */}
        {/* AI PIPELINE                                                       */}
        {/* ================================================================= */}

        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            duration: 0.5,
            delay: 0.3,
          }}
          className="pb-4"
        >

          <div className="mb-4 flex items-center gap-3">

            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{
                background:
                  "color-mix(in srgb, var(--sb-primary) 8%, transparent)",
                color:
                  "var(--sb-primary)",
              }}
            >
              <FiZap />
            </div>

            <div>
              <p className="text-sm font-black">
                AI Recognition Pipeline
              </p>

              <p className="text-xs text-[var(--sb-muted)]">
                How your gesture becomes text
              </p>
            </div>

          </div>

          <div className="grid gap-3 sm:grid-cols-4">

            {[
              {
                icon: FiCamera,
                title: "Camera",
                text: "Capture gesture",
              },
              {
                icon: FiTarget,
                title: "Landmarks",
                text: "Track 21 points",
              },
              {
                icon: FiCpu,
                title: "AI Model",
                text: "Classify gesture",
              },
              {
                icon: FiZap,
                title: "Translation",
                text: "Generate text",
              },
            ].map(
              (
                step,
                index
              ) => {
                const Icon =
                  step.icon;

                return (
                  <motion.div
                    key={
                      step.title
                    }
                    whileHover={{
                      y: -3,
                    }}
                    className="relative flex items-center gap-3 rounded-2xl border border-[var(--sb-border)] bg-[var(--sb-surface)] p-4 backdrop-blur-xl"
                  >

                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                      style={{
                        background:
                          "color-mix(in srgb, var(--sb-primary) 8%, transparent)",
                        color:
                          "var(--sb-primary)",
                      }}
                    >
                      <Icon className="h-4 w-4" />
                    </div>

                    <div>
                      <p className="text-xs font-black">
                        {step.title}
                      </p>

                      <p className="text-[10px] text-[var(--sb-muted)]">
                        {step.text}
                      </p>
                    </div>

                    {index < 3 && (
                      <div
                        className="absolute -right-2 hidden h-px w-4 sm:block"
                        style={{
                          background:
                            "var(--sb-border)",
                        }}
                      />
                    )}

                  </motion.div>
                );
              }
            )}

          </div>
        </motion.div>

      </div>

      {/* =================================================================== */}
      {/* ERROR MODAL                                                         */}
      {/* =================================================================== */}

      <Modal
        isOpen={showError}
        onClose={() =>
          setShowError(false)
        }
        title="Translation Error"
      >

        <div className="flex items-start gap-4">

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-400/10 text-red-400">
            <FiAlertCircle className="h-6 w-6" />
          </div>

          <div>

            <p className="text-sm leading-6 text-slate-300">
              {errorMessage ||
                "Something went wrong while starting the translator."}
            </p>

            <button
              type="button"
              onClick={() =>
                setShowError(
                  false
                )
              }
              className="mt-5 rounded-xl bg-white/10 px-4 py-2 text-xs font-black text-white transition hover:bg-white/15"
            >
              Close
            </button>

          </div>
        </div>

      </Modal>
    </div>
  );
}

/* ========================================================================= */
/* SMALL PRESENTATIONAL ICON                                                */
/* ========================================================================= */

