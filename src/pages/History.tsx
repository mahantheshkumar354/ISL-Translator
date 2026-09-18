import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiSearch,
  FiDownload,
  FiTrash2,
  FiClock,
  FiCamera,
  FiType,
  FiMic,
  FiActivity,
  FiLayers,
  FiArrowRight,
  FiX,
  FiRefreshCw,
  FiTrendingUp,
  FiDatabase,
  FiCheckCircle,
  FiZap,
} from "react-icons/fi";

import GlassCard from "@/components/GlassCard";
import AnimatedButton from "@/components/AnimatedButton";
import Modal from "@/components/Modal";

import {
  fetchHistory,
  deleteHistoryItem,
  exportHistory,
} from "@/services/api";

import type { HistoryItem } from "@/types";

type HistoryFilter =
  | "all"
  | "sign-to-text"
  | "text-to-sign"
  | "speech-to-sign";

const REALTIME_POLL_MS = 5000;
const NEW_ITEM_HIGHLIGHT_MS = 4000;

export default function History() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] =
    useState<HistoryFilter>("all");
  const [deleteId, setDeleteId] =
    useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] =
    useState(false);

  const [isLive, setIsLive] = useState(true);
  const [lastUpdated, setLastUpdated] =
    useState<Date | null>(null);
  const [recentlyAddedIds, setRecentlyAddedIds] =
    useState<Set<string>>(new Set());

  const previousIdsRef =
    useRef<Set<string>>(new Set());
  const pollIntervalRef =
    useRef<number | null>(null);
  const highlightTimeoutRef =
    useRef<number | null>(null);

  // =========================================================
  // LOAD HISTORY
  // =========================================================

  const loadHistory = async (
    options?: { silent?: boolean }
  ) => {
    const silent = options?.silent ?? false;

    try {
      if (!silent) {
        setIsLoading(true);
      }

      const data = await fetchHistory();
      const list = data || [];

      const nextIds = new Set(
        list.map((item) => item.id)
      );

      if (previousIdsRef.current.size > 0) {
        const addedIds: string[] = [];

        nextIds.forEach((id) => {
          if (!previousIdsRef.current.has(id)) {
            addedIds.push(id);
          }
        });

        if (addedIds.length > 0) {
          setRecentlyAddedIds(
            new Set(addedIds)
          );

          if (
            highlightTimeoutRef.current !== null
          ) {
            window.clearTimeout(
              highlightTimeoutRef.current
            );
          }

          highlightTimeoutRef.current =
            window.setTimeout(() => {
              setRecentlyAddedIds(new Set());
              highlightTimeoutRef.current =
                null;
            }, NEW_ITEM_HIGHLIGHT_MS);
        }
      }

      previousIdsRef.current = nextIds;

      setHistory(list);
      setLastUpdated(new Date());
    } catch (error) {
      console.error(
        "Failed to load history:",
        error
      );

      if (!silent) {
        setHistory([]);
      }
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  // =========================================================
  // REAL-TIME POLLING
  // =========================================================

  useEffect(() => {
    const startPolling = () => {
      if (pollIntervalRef.current !== null) {
        return;
      }

      pollIntervalRef.current =
        window.setInterval(() => {
          loadHistory({ silent: true });
        }, REALTIME_POLL_MS);

      setIsLive(true);
    };

    const stopPolling = () => {
      if (pollIntervalRef.current !== null) {
        window.clearInterval(
          pollIntervalRef.current
        );
        pollIntervalRef.current = null;
      }

      setIsLive(false);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopPolling();
      } else {
        loadHistory({ silent: true });
        startPolling();
      }
    };

    startPolling();

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    return () => {
      stopPolling();

      if (
        highlightTimeoutRef.current !== null
      ) {
        window.clearTimeout(
          highlightTimeoutRef.current
        );
      }

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, []);

  // =========================================================
  // FILTERED HISTORY
  // =========================================================

  const filteredHistory = useMemo(() => {
    const query =
      searchQuery.trim().toLowerCase();

    return history.filter((item) => {
      const input = String(
        item.input ?? ""
      ).toLowerCase();

      const output = String(
        item.output ?? ""
      ).toLowerCase();

      const matchesSearch =
        !query ||
        input.includes(query) ||
        output.includes(query);

      const matchesFilter =
        filter === "all" ||
        item.type === filter;

      return (
        matchesSearch && matchesFilter
      );
    });
  }, [history, searchQuery, filter]);

  // =========================================================
  // STATISTICS
  // =========================================================

  const totalTranslations =
    history.length;

  const signToTextCount =
    history.filter(
      (item) =>
        item.type === "sign-to-text"
    ).length;

  const textToSignCount =
    history.filter(
      (item) =>
        item.type === "text-to-sign"
    ).length;

  const speechToSignCount =
    history.filter(
      (item) =>
        item.type === "speech-to-sign"
    ).length;

  const averageConfidence =
    history.length > 0
      ? history.reduce(
          (sum, item) =>
            sum +
            Number(item.confidence || 0),
          0
        ) / history.length
      : 0;

  // =========================================================
  // DELETE
  // =========================================================

  const handleDelete = async (
    id: string
  ) => {
    try {
      await deleteHistoryItem(id);

      setHistory((prev) =>
        prev.filter(
          (item) => item.id !== id
        )
      );

      previousIdsRef.current.delete(id);
      setDeleteId(null);
    } catch (error) {
      console.error(
        "Failed to delete history item:",
        error
      );
    }
  };

  // =========================================================
  // EXPORT
  // =========================================================

  const handleExport = async () => {
    try {
      setIsExporting(true);

      const blob =
        await exportHistory("csv");

      const url =
        window.URL.createObjectURL(blob);

      const a =
        document.createElement("a");

      a.href = url;
      a.download = "isl-history.csv";

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(
        "Failed to export history:",
        error
      );
    } finally {
      setIsExporting(false);
    }
  };

  // =========================================================
  // DATE / TIME - INDIA STANDARD TIME
  // =========================================================

  const formatDate = (
    timestamp: unknown
  ) => {
    const date = new Date(
      timestamp as string | number | Date
    );

    if (Number.isNaN(date.getTime())) {
      return {
        date: "Unknown date",
        time: "--:--",
      };
    }

    return {
      date: new Intl.DateTimeFormat(
        "en-IN",
        {
          timeZone: "Asia/Kolkata",
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      ).format(date),

      time: new Intl.DateTimeFormat(
        "en-IN",
        {
          timeZone: "Asia/Kolkata",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }
      ).format(date),
    };
  };

  const formatRelativeTime = (
    date: Date | null
  ) => {
    if (!date) return "";

    const seconds = Math.max(
      0,
      Math.round(
        (Date.now() - date.getTime()) /
          1000
      )
    );

    if (seconds < 5) return "just now";
    if (seconds < 60)
      return `${seconds}s ago`;

    const minutes = Math.round(
      seconds / 60
    );

    return `${minutes}m ago`;
  };

  // =========================================================
  // CONFIDENCE
  // =========================================================

  const getConfidence = (
    confidence: unknown
  ) => {
    const value = Number(
      confidence || 0
    );

    const percentage =
      value <= 1
        ? value * 100
        : value;

    return Math.max(
      0,
      Math.min(100, percentage)
    );
  };

  const getConfidenceLabel = (
    percentage: number
  ) => {
    if (percentage >= 90)
      return "Excellent";

    if (percentage >= 75)
      return "Good";

    if (percentage >= 50)
      return "Fair";

    return "Low";
  };

  // =========================================================
  // TYPE INFORMATION
  // =========================================================

  const getTypeInfo = (
    type: string
  ) => {
    if (type === "sign-to-text") {
      return {
        label: "Sign to Text",
        shortLabel: "SIGN → TEXT",
        icon: FiCamera,
        iconClass: "text-cyan-300",
        bgClass:
          "bg-cyan-400/10",
        borderClass:
          "border-cyan-400/20",
        glowClass:
          "bg-cyan-400/10",
      };
    }

    if (type === "speech-to-sign") {
      return {
        label: "Speech to Sign",
        shortLabel: "SPEECH → SIGN",
        icon: FiMic,
        iconClass:
          "text-violet-300",
        bgClass:
          "bg-violet-400/10",
        borderClass:
          "border-violet-400/20",
        glowClass:
          "bg-violet-400/10",
      };
    }

    return {
      label: "Text to Sign",
      shortLabel: "TEXT → SIGN",
      icon: FiType,
      iconClass:
        "text-blue-300",
      bgClass:
        "bg-blue-400/10",
      borderClass:
        "border-blue-400/20",
      glowClass:
        "bg-blue-400/10",
    };
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 18,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.5,
      }}
      className="relative min-h-screen overflow-hidden pb-10 text-white"
    >
      {/* =====================================================
          AMBIENT BACKGROUND
      ====================================================== */}

      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-slate-950">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px]" />

        <div className="absolute right-[-120px] top-1/4 h-[420px] w-[420px] rounded-full bg-blue-500/10 blur-[130px]" />

        <div className="absolute bottom-[-150px] left-1/3 h-[420px] w-[420px] rounded-full bg-violet-500/10 blur-[130px]" />
      </div>

      {/* =====================================================
          HERO HEADER
      ====================================================== */}

      <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.035] p-6 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-cyan-400/10 blur-[90px]" />

        <div className="pointer-events-none absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-violet-500/10 blur-[90px]" />

        <div className="relative flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10">
                <FiClock
                  size={18}
                  className="text-cyan-300"
                />
              </div>

              <span className="rounded-full border border-cyan-400/15 bg-cyan-400/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-300">
                Translation Center
              </span>

              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    isLive
                      ? "animate-pulse bg-emerald-400"
                      : "bg-white/20"
                  }`}
                />

                <span
                  className={`text-[10px] font-semibold ${
                    isLive
                      ? "text-emerald-300"
                      : "text-white/35"
                  }`}
                >
                  {isLive
                    ? "LIVE SYNC"
                    : "PAUSED"}
                </span>
              </div>
            </div>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">
                Translation History
              </span>
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
              View, search and manage your
              previous Indian Sign Language
              translations from one centralized
              workspace.
            </p>

            {lastUpdated && (
              <div className="mt-4 flex items-center gap-2 text-[11px] text-slate-500">
                <FiRefreshCw size={11} />
                Last synchronized{" "}
                {formatRelativeTime(
                  lastUpdated
                )}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <motion.button
              whileHover={{
                scale: 1.04,
                y: -1,
              }}
              whileTap={{
                scale: 0.96,
              }}
              onClick={() =>
                loadHistory()
              }
              className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 shadow-lg backdrop-blur-xl transition-all hover:border-cyan-400/20 hover:bg-cyan-400/10 hover:text-cyan-300"
              title="Refresh history"
            >
              <FiRefreshCw
                size={17}
                className={
                  isLoading
                    ? "animate-spin"
                    : ""
                }
              />
            </motion.button>

            <AnimatedButton
              variant="secondary"
              onClick={handleExport}
              icon={
                isExporting ? (
                  <FiRefreshCw
                    size={16}
                    className="animate-spin"
                  />
                ) : (
                  <FiDownload size={16} />
                )
              }
            >
              {isExporting
                ? "Exporting..."
                : "Export CSV"}
            </AnimatedButton>
          </div>
        </div>
      </section>

      {/* =====================================================
          STATISTICS
      ====================================================== */}

      <section className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
        {[
          {
            label: "Total",
            value: totalTranslations,
            description:
              "translations",
            icon: FiLayers,
            accent: "cyan",
          },
          {
            label: "Sign to Text",
            value: signToTextCount,
            description:
              "recognitions",
            icon: FiCamera,
            accent: "blue",
          },
          {
            label: "Text to Sign",
            value: textToSignCount,
            description:
              "translations",
            icon: FiType,
            accent: "violet",
          },
          {
            label: "Speech to Sign",
            value: speechToSignCount,
            description:
              "translations",
            icon: FiMic,
            accent: "purple",
          },
          {
            label: "Avg. Confidence",
            value: `${(
              averageConfidence * 100
            ).toFixed(0)}%`,
            description:
              "recognition confidence",
            icon: FiActivity,
            accent: "emerald",
          },
        ].map((stat, index) => {
          const StatIcon = stat.icon;

          const accentStyles: Record<
            string,
            string
          > = {
            cyan:
              "bg-cyan-400/10 text-cyan-300 border-cyan-400/15",
            blue:
              "bg-blue-400/10 text-blue-300 border-blue-400/15",
            violet:
              "bg-violet-400/10 text-violet-300 border-violet-400/15",
            purple:
              "bg-purple-400/10 text-purple-300 border-purple-400/15",
            emerald:
              "bg-emerald-400/10 text-emerald-300 border-emerald-400/15",
          };

          return (
            <motion.div
              key={stat.label}
              initial={{
                opacity: 0,
                y: 12,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: index * 0.06,
              }}
              whileHover={{
                y: -4,
              }}
            >
              <GlassCard
                hover={false}
                className="relative h-full overflow-hidden p-5"
              >
                <div className="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-cyan-400/5 blur-3xl" />

                <div className="relative flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                      {stat.label}
                    </p>

                    <p
                      className={`mt-3 text-2xl font-bold ${
                        stat.accent ===
                        "emerald"
                          ? "text-emerald-300"
                          : "text-white"
                      }`}
                    >
                      {stat.value}
                    </p>

                    <p className="mt-1 text-[11px] text-slate-500">
                      {stat.description}
                    </p>
                  </div>

                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${
                      accentStyles[
                        stat.accent
                      ]
                    }`}
                  >
                    <StatIcon size={18} />
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </section>

      {/* =====================================================
          SEARCH + FILTER
      ====================================================== */}

      <section className="mt-6">
        <GlassCard
          hover={false}
          className="relative overflow-hidden p-4 sm:p-5"
        >
          <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-full bg-blue-500/5 blur-3xl" />

          <div className="relative flex flex-col gap-4 xl:flex-row xl:items-center">
            <div className="relative flex-1">
              <FiSearch
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                type="text"
                value={searchQuery}
                onChange={(e) =>
                  setSearchQuery(
                    e.target.value
                  )
                }
                placeholder="Search input or output..."
                className="
                  w-full rounded-2xl
                  border border-white/10
                  bg-slate-950/40
                  py-3.5 pl-11 pr-11
                  text-sm text-white
                  placeholder:text-slate-600
                  outline-none
                  transition-all
                  focus:border-cyan-400/30
                  focus:bg-cyan-400/[0.03]
                  focus:ring-2
                  focus:ring-cyan-400/10
                "
              />

              {searchQuery && (
                <button
                  onClick={() =>
                    setSearchQuery("")
                  }
                  className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <FiX size={15} />
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                {
                  value: "all" as const,
                  label: "All",
                },
                {
                  value:
                    "sign-to-text" as const,
                  label: "Sign → Text",
                },
                {
                  value:
                    "text-to-sign" as const,
                  label: "Text → Sign",
                },
                {
                  value:
                    "speech-to-sign" as const,
                  label: "Speech → Sign",
                },
              ].map((option) => {
                const active =
                  filter ===
                  option.value;

                return (
                  <motion.button
                    key={
                      option.value
                    }
                    whileTap={{
                      scale: 0.96,
                    }}
                    onClick={() =>
                      setFilter(
                        option.value
                      )
                    }
                    className={`
                      rounded-xl border px-4 py-2.5
                      text-xs font-semibold
                      transition-all duration-300
                      ${
                        active
                          ? "border-cyan-400/25 bg-cyan-400/10 text-cyan-300 shadow-lg shadow-cyan-500/10"
                          : "border-white/10 bg-white/[0.025] text-slate-500 hover:border-white/15 hover:bg-white/[0.05] hover:text-slate-200"
                      }
                    `}
                  >
                    {option.label}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </GlassCard>
      </section>

      {/* =====================================================
          RECORD HEADER
      ====================================================== */}

      <div className="mt-7 flex flex-col gap-3 px-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <FiDatabase
              size={15}
              className="text-cyan-300"
            />

            <h2 className="text-sm font-semibold text-white/90">
              Translation Records
            </h2>
          </div>

          <p className="mt-1.5 text-xs text-slate-500">
            Showing{" "}
            <span className="text-slate-300">
              {
                filteredHistory.length
              }
            </span>{" "}
            of{" "}
            <span className="text-slate-300">
              {history.length}
            </span>{" "}
            records
          </p>
        </div>

        {(searchQuery ||
          filter !== "all") && (
          <button
            onClick={() => {
              setSearchQuery("");
              setFilter("all");
            }}
            className="text-xs font-medium text-cyan-400 transition-colors hover:text-cyan-300"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* =====================================================
          HISTORY TABLE
      ====================================================== */}

      <section className="mt-3">
        <GlassCard
          hover={false}
          className="overflow-hidden p-0"
        >
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.025] text-left">
                  <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Translation
                  </th>

                  <th className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Input
                  </th>

                  <th className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Output
                  </th>

                  <th className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Confidence
                  </th>

                  <th className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Timestamp
                  </th>

                  <th className="px-6 py-4 text-right text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                <AnimatePresence initial={false}>
                  {filteredHistory.map(
                    (item, index) => {
                      const typeInfo =
                        getTypeInfo(
                          item.type
                        );

                      const TypeIcon =
                        typeInfo.icon;

                      const confidence =
                        getConfidence(
                          item.confidence
                        );

                      const time =
                        formatDate(
                          item.timestamp
                        );

                      const isNew =
                        recentlyAddedIds.has(
                          item.id
                        );

                      return (
                        <motion.tr
                          key={item.id}
                          layout
                          initial={{
                            opacity: 0,
                            y: 12,
                          }}
                          animate={{
                            opacity: 1,
                            y: 0,
                          }}
                          exit={{
                            opacity: 0,
                            x: -25,
                          }}
                          transition={{
                            delay:
                              index *
                              0.025,
                            duration: 0.3,
                          }}
                          className={`
                            group border-b border-white/[0.045]
                            transition-all duration-300
                            last:border-0
                            hover:bg-white/[0.025]
                            ${
                              isNew
                                ? "bg-emerald-400/[0.035] shadow-[inset_3px_0_0_rgba(52,211,153,0.7)]"
                                : ""
                            }
                          `}
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div
                                className={`
                                  relative flex h-10 w-10
                                  shrink-0 items-center
                                  justify-center rounded-xl
                                  border
                                  ${typeInfo.bgClass}
                                  ${typeInfo.borderClass}
                                `}
                              >
                                <div
                                  className={`absolute inset-0 rounded-xl ${typeInfo.glowClass} blur-md opacity-60`}
                                />

                                <TypeIcon
                                  size={17}
                                  className={`relative ${typeInfo.iconClass}`}
                                />
                              </div>

                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="text-xs font-semibold text-slate-200">
                                    {
                                      typeInfo.label
                                    }
                                  </p>

                                  {isNew && (
                                    <span className="rounded-full border border-emerald-400/15 bg-emerald-400/10 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-emerald-300">
                                      New
                                    </span>
                                  )}
                                </div>

                                <p className="mt-1 text-[9px] font-medium tracking-[0.15em] text-slate-600">
                                  {
                                    typeInfo.shortLabel
                                  }
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="max-w-[240px] px-5 py-5">
                            <p
                              title={String(
                                item.input ??
                                  ""
                              )}
                              className="truncate text-sm text-slate-400"
                            >
                              {item.input ||
                                "—"}
                            </p>
                          </td>

                          <td className="max-w-[240px] px-5 py-5">
                            <div className="flex items-center gap-2">
                              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white/[0.035]">
                                <FiArrowRight
                                  size={12}
                                  className="text-cyan-400/60"
                                />
                              </div>

                              <p
                                title={String(
                                  item.output ??
                                    ""
                                )}
                                className="truncate text-sm font-medium text-slate-200"
                              >
                                {item.output ||
                                  "—"}
                              </p>
                            </div>
                          </td>

                          <td className="px-5 py-5">
                            <div className="w-[125px]">
                              <div className="mb-2 flex items-center justify-between">
                                <span className="text-[9px] font-medium uppercase tracking-wider text-slate-600">
                                  {getConfidenceLabel(
                                    confidence
                                  )}
                                </span>

                                <span className="text-xs font-bold text-emerald-300">
                                  {confidence.toFixed(
                                    0
                                  )}
                                  %
                                </span>
                              </div>

                              <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
                                <motion.div
                                  initial={{
                                    width: 0,
                                  }}
                                  animate={{
                                    width: `${confidence}%`,
                                  }}
                                  transition={{
                                    duration:
                                      0.7,
                                    delay:
                                      index *
                                      0.025,
                                  }}
                                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400"
                                />
                              </div>
                            </div>
                          </td>

                          {/* TIME */}

                          <td className="whitespace-nowrap px-5 py-5">
                            <div className="flex items-center gap-2.5">
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.025]">
                                <FiClock
                                  size={12}
                                  className="text-slate-500"
                                />
                              </div>

                              <div>
                                <p className="text-xs font-medium text-slate-300">
                                  {
                                    time.time
                                  }
                                </p>

                                <p className="mt-0.5 text-[10px] text-slate-600">
                                  {
                                    time.date
                                  }
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-5 text-right">
                            <motion.button
                              whileHover={{
                                scale: 1.08,
                              }}
                              whileTap={{
                                scale: 0.92,
                              }}
                              onClick={() =>
                                setDeleteId(
                                  item.id
                                )
                              }
                              className="
                                rounded-xl
                                border border-red-400/10
                                bg-red-400/5
                                p-2.5
                                text-red-300/60
                                transition-all
                                hover:border-red-400/20
                                hover:bg-red-400/10
                                hover:text-red-300
                              "
                              title="Delete translation"
                            >
                              <FiTrash2
                                size={14}
                              />
                            </motion.button>
                          </td>
                        </motion.tr>
                      );
                    }
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* MOBILE */}

          <div className="divide-y divide-white/[0.05] md:hidden">
            <AnimatePresence initial={false}>
              {filteredHistory.map(
                (item, index) => {
                  const typeInfo =
                    getTypeInfo(
                      item.type
                    );

                  const TypeIcon =
                    typeInfo.icon;

                  const confidence =
                    getConfidence(
                      item.confidence
                    );

                  const time =
                    formatDate(
                      item.timestamp
                    );

                  const isNew =
                    recentlyAddedIds.has(
                      item.id
                    );

                  return (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{
                        opacity: 0,
                        y: 12,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      exit={{
                        opacity: 0,
                        x: -20,
                      }}
                      transition={{
                        delay:
                          index * 0.03,
                      }}
                      className={`
                        p-4
                        ${
                          isNew
                            ? "bg-emerald-400/[0.035] shadow-[inset_3px_0_0_rgba(52,211,153,0.7)]"
                            : ""
                        }
                      `}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`
                              relative flex h-11 w-11
                              shrink-0 items-center
                              justify-center rounded-xl
                              border
                              ${typeInfo.bgClass}
                              ${typeInfo.borderClass}
                            `}
                          >
                            <TypeIcon
                              size={17}
                              className={
                                typeInfo.iconClass
                              }
                            />
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-semibold text-slate-200">
                                {
                                  typeInfo.label
                                }
                              </p>

                              {isNew && (
                                <span className="rounded-full bg-emerald-400/10 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-emerald-300">
                                  New
                                </span>
                              )}
                            </div>

                            <div className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-600">
                              <FiClock size={10} />
                              {
                                time.date
                              }{" "}
                              ·{" "}
                              {
                                time.time
                              }
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() =>
                            setDeleteId(
                              item.id
                            )
                          }
                          className="rounded-xl border border-red-400/10 bg-red-400/5 p-2 text-red-300/60 transition-colors hover:bg-red-400/10 hover:text-red-300"
                        >
                          <FiTrash2
                            size={14}
                          />
                        </button>
                      </div>

                      <div className="mt-4 overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.025]">
                        <div className="p-3.5">
                          <p className="mb-1 text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-600">
                            Input
                          </p>

                          <p className="break-words text-sm text-slate-400">
                            {item.input ||
                              "—"}
                          </p>
                        </div>

                        <div className="mx-3.5 h-px bg-white/[0.05]" />

                        <div className="p-3.5">
                          <div className="mb-1 flex items-center gap-1.5">
                            <FiArrowRight
                              size={10}
                              className="text-cyan-400/60"
                            />

                            <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-600">
                              Output
                            </p>
                          </div>

                          <p className="break-words text-sm font-medium text-slate-200">
                            {item.output ||
                              "—"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="mb-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FiActivity
                              size={12}
                              className="text-emerald-400/70"
                            />

                            <span className="text-[10px] font-medium uppercase tracking-wider text-slate-600">
                              Confidence
                            </span>
                          </div>

                          <span className="text-xs font-bold text-emerald-300">
                            {confidence.toFixed(
                              0
                            )}
                            %
                          </span>
                        </div>

                        <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
                          <motion.div
                            initial={{
                              width: 0,
                            }}
                            animate={{
                              width: `${confidence}%`,
                            }}
                            transition={{
                              duration: 0.6,
                            }}
                            className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400"
                          />
                        </div>
                      </div>
                    </motion.div>
                  );
                }
              )}
            </AnimatePresence>
          </div>

          {/* LOADING */}

          {isLoading && (
            <div className="flex min-h-[280px] flex-col items-center justify-center">
              <div className="relative">
                <div className="h-12 w-12 animate-spin rounded-full border-2 border-white/10 border-t-cyan-400" />

                <div className="absolute inset-0 flex items-center justify-center">
                  <FiActivity
                    size={14}
                    className="text-cyan-300"
                  />
                </div>
              </div>

              <p className="mt-5 text-xs text-slate-500">
                Synchronizing translation
                history...
              </p>
            </div>
          )}

          {/* EMPTY */}

          {!isLoading &&
            filteredHistory.length ===
              0 && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: 10,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className="flex min-h-[340px] flex-col items-center justify-center px-6 text-center"
              >
                <div className="relative mb-6">
                  <div className="absolute inset-0 rounded-3xl bg-cyan-400/10 blur-2xl" />

                  <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.04]">
                    {searchQuery ||
                    filter !==
                      "all" ? (
                      <FiSearch
                        size={27}
                        className="text-slate-500"
                      />
                    ) : (
                      <FiClock
                        size={27}
                        className="text-slate-500"
                      />
                    )}
                  </div>
                </div>

                <h3 className="text-base font-semibold text-slate-200">
                  {searchQuery ||
                  filter !== "all"
                    ? "No matching translations"
                    : "No translation history yet"}
                </h3>

                <p className="mt-2 max-w-md text-xs leading-6 text-slate-500">
                  {searchQuery ||
                  filter !== "all"
                    ? "Try changing your search or filter to find another translation."
                    : "Your completed Sign to Text, Text to Sign and Speech to Sign translations will appear here automatically."}
                </p>

                {searchQuery ||
                filter !== "all" ? (
                  <button
                    onClick={() => {
                      setSearchQuery(
                        ""
                      );
                      setFilter("all");
                    }}
                    className="mt-5 rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-5 py-2.5 text-xs font-semibold text-cyan-300 transition-all hover:bg-cyan-400/15"
                  >
                    Clear filters
                  </button>
                ) : (
                  <div className="mt-5 flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.025] px-4 py-2 text-[10px] text-slate-600">
                    <FiZap
                      size={11}
                      className="text-cyan-400"
                    />
                    Start translating
                    to create history
                  </div>
                )}
              </motion.div>
            )}
        </GlassCard>
      </section>

      {/* =====================================================
          BOTTOM STATUS
      ====================================================== */}

      <motion.div
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        transition={{
          delay: 0.5,
        }}
        className="mt-5 grid gap-3 sm:grid-cols-3"
      >
        {[
          {
            icon: FiActivity,
            title: "Real-time Sync",
            text: "History updates automatically",
          },
          {
            icon: FiCheckCircle,
            title: "Secure Records",
            text: "Translations stored safely",
          },
          {
            icon: FiTrendingUp,
            title: "Confidence Tracking",
            text: "Monitor recognition quality",
          },
        ].map((item) => {
          const ItemIcon =
            item.icon;

          return (
            <div
              key={item.title}
              className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-3"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
                <ItemIcon size={15} />
              </div>

              <div>
                <p className="text-[11px] font-semibold text-slate-300">
                  {item.title}
                </p>

                <p className="mt-0.5 text-[10px] text-slate-600">
                  {item.text}
                </p>
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* =====================================================
          DELETE MODAL
      ====================================================== */}

      <Modal
        isOpen={!!deleteId}
        onClose={() =>
          setDeleteId(null)
        }
        title="Delete Translation"
        size="sm"
      >
        <div className="space-y-5">
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-red-400/15 bg-red-400/10 text-red-300">
            <div className="absolute inset-0 rounded-2xl bg-red-400/10 blur-xl" />

            <FiTrash2
              size={21}
              className="relative"
            />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">
              Remove this history
              item?
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              This translation will be
              permanently removed from
              your history. This action
              cannot be undone.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <AnimatedButton
              variant="secondary"
              size="sm"
              onClick={() =>
                setDeleteId(null)
              }
            >
              Cancel
            </AnimatedButton>

            <AnimatedButton
              variant="danger"
              size="sm"
              onClick={() =>
                deleteId &&
                handleDelete(deleteId)
              }
            >
              <span className="flex items-center gap-2">
                <FiTrash2 size={14} />
                Delete
              </span>
            </AnimatedButton>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}