import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ElementType,
} from "react";
import { motion } from "framer-motion";
import {
  FiActivity,
  FiArrowRight,
  FiBarChart2,
  FiCamera,
  FiCheckCircle,
  FiClock,
  FiCpu,
  FiDatabase,
  FiMic,
  FiMessageSquare,
  FiRefreshCw,
  FiServer,
  FiShield,
  FiTrendingUp,
  FiType,
  FiZap,
} from "react-icons/fi";
import { Link } from "react-router-dom";

import {
  fetchHistory,
  getCameraStatus,
  getDashboardStats,
  getModelStatus,
} from "@/services/api";

import type { HistoryItem } from "@/types";

// ============================================================
// TYPES
// ============================================================

interface DashboardStats {
  totalSigns: number;
  accuracy: number;
  sessionsToday: number;
  avgConfidence: number;
  signToText: number;
  textToSign: number;
  speechToSign: number;
}

interface SystemStatus {
  camera: boolean;
  model: boolean;
  backend: boolean;
  history: boolean;
}

interface HourData {
  hour: number;
  label: string;
  count: number;
}

// ============================================================
// HELPERS
// ============================================================

const getConfidencePercentage = (
  confidence: number
): number => {
  if (!Number.isFinite(confidence)) {
    return 0;
  }

  const percentage =
    confidence <= 1
      ? confidence * 100
      : confidence;

  return Math.max(
    0,
    Math.min(100, percentage)
  );
};

const formatPercentage = (
  value: number
): string => {
  return `${getConfidencePercentage(
    value
  ).toFixed(1)}%`;
};

const parseTimestamp = (
  timestamp: string | Date
): Date => {
  return timestamp instanceof Date
    ? timestamp
    : new Date(timestamp);
};

const isValidDate = (
  date: Date
): boolean => {
  return !Number.isNaN(
    date.getTime()
  );
};

// ============================================================
// INDIA TIME HELPERS
// ============================================================

const getIndiaDateKey = (
  timestamp: string | Date
): string => {
  const date =
    timestamp instanceof Date
      ? timestamp
      : new Date(timestamp);

  if (!isValidDate(date)) {
    return "";
  }

  return new Intl.DateTimeFormat(
    "en-CA",
    {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }
  ).format(date);
};

const isToday = (
  date: Date
): boolean => {
  if (!isValidDate(date)) {
    return false;
  }

  return (
    getIndiaDateKey(date) ===
    getIndiaDateKey(new Date())
  );
};

const getIndiaHour = (
  timestamp: string | Date
): number => {
  const date =
    timestamp instanceof Date
      ? timestamp
      : new Date(timestamp);

  if (!isValidDate(date)) {
    return -1;
  }

  return Number(
    new Intl.DateTimeFormat(
      "en-IN",
      {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        hour12: false,
      }
    ).format(date)
  );
};

const formatTime = (
  timestamp: Date
): string => {
  if (!isValidDate(timestamp)) {
    return "--:--";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(timestamp);
};

const formatDate = (
  timestamp: Date
): string => {
  if (!isValidDate(timestamp)) {
    return "--";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  ).format(timestamp);
};

// ============================================================
// MODE HELPERS
// ============================================================

const getModeLabel = (
  type: HistoryItem["type"]
): string => {
  switch (type) {
    case "sign-to-text":
      return "Sign → Text";

    case "text-to-sign":
      return "Text → Sign";

    case "speech-to-sign":
      return "Speech → Sign";

    default:
      return "Translation";
  }
};

const getModeIcon = (
  type: HistoryItem["type"]
) => {
  switch (type) {
    case "sign-to-text":
      return FiCamera;

    case "text-to-sign":
      return FiType;

    case "speech-to-sign":
      return FiMic;

    default:
      return FiActivity;
  }
};

const getModeStyle = (
  type: HistoryItem["type"]
): string => {
  switch (type) {
    case "sign-to-text":
      return "bg-cyan-400/10 text-cyan-300 border-cyan-400/20";

    case "text-to-sign":
      return "bg-violet-400/10 text-violet-300 border-violet-400/20";

    case "speech-to-sign":
      return "bg-blue-400/10 text-blue-300 border-blue-400/20";

    default:
      return "bg-white/5 text-white/70 border-white/10";
  }
};

// ============================================================
// HOURLY ACTIVITY
// ============================================================

const createHourlyData = (
  history: HistoryItem[]
): HourData[] => {
  const hours: HourData[] =
    Array.from(
      { length: 24 },
      (_, hour) => ({
        hour,

        label:
          new Intl.DateTimeFormat(
            "en-IN",
            {
              timeZone:
                "Asia/Kolkata",
              hour: "numeric",
            }
          ).format(
            new Date(
              2020,
              0,
              1,
              hour
            )
          ),

        count: 0,
      })
    );

  history.forEach((item) => {
    const timestamp =
      parseTimestamp(
        item.timestamp
      );

    if (!isValidDate(timestamp)) {
      return;
    }

    if (!isToday(timestamp)) {
      return;
    }

    const hour =
      getIndiaHour(timestamp);

    if (
      hour >= 0 &&
      hour <= 23
    ) {
      hours[hour].count += 1;
    }
  });

  return hours;
};

// ============================================================
// STAT CARD
// ============================================================

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: ElementType;
  iconClass: string;
  glowClass: string;
  delay: number;
}

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconClass,
  glowClass,
  delay,
}: StatCardProps) => {
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
        delay,
      }}
      whileHover={{
        y: -3,
      }}
      className="
        group
        relative
        overflow-hidden
        rounded-3xl
        border
        border-white/10
        bg-white/[0.035]
        p-5
        backdrop-blur-2xl
        transition-all
        duration-300
        hover:border-white/15
        hover:bg-white/[0.055]
      "
    >
      <div
        className={`
          pointer-events-none
          absolute
          -right-10
          -top-10
          h-28
          w-28
          rounded-full
          blur-3xl
          opacity-0
          transition-opacity
          duration-500
          group-hover:opacity-100
          ${glowClass}
        `}
      />

      <div
        className={`
          absolute
          left-5
          right-5
          top-0
          h-px
          bg-gradient-to-r
          from-transparent
          via-current
          to-transparent
          opacity-40
          ${iconClass}
        `}
      />

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
            {title}
          </p>

          <p className="mt-3 text-3xl font-bold tracking-tight text-white">
            {value}
          </p>

          <p className="mt-1 text-xs text-white/35">
            {subtitle}
          </p>
        </div>

        <div
          className={`
            flex
            h-11
            w-11
            shrink-0
            items-center
            justify-center
            rounded-2xl
            border
            border-white/10
            ${iconClass}
          `}
        >
          <Icon size={19} />
        </div>
      </div>
    </motion.div>
  );
};

// ============================================================
// STATUS ITEM
// ============================================================

interface StatusItemProps {
  icon: ElementType;
  label: string;
  description: string;
  online: boolean;
}

const StatusItem = ({
  icon: Icon,
  label,
  description,
  online,
}: StatusItemProps) => {
  return (
    <motion.div
      whileHover={{ x: 2 }}
      className="
        group
        flex
        items-center
        gap-3
        rounded-2xl
        border
        border-white/5
        bg-white/[0.025]
        p-3
        transition-all
        duration-300
        hover:border-white/10
        hover:bg-white/[0.045]
      "
    >
      <div
        className={`
          flex
          h-10
          w-10
          shrink-0
          items-center
          justify-center
          rounded-xl
          border
          ${
            online
              ? "border-emerald-400/10 bg-emerald-400/10 text-emerald-300"
              : "border-red-400/10 bg-red-400/10 text-red-300"
          }
        `}
      >
        <Icon size={17} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-white/85">
          {label}
        </p>

        <p className="mt-0.5 truncate text-[11px] text-white/30">
          {description}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <span
          className={`
            h-2
            w-2
            rounded-full
            ${
              online
                ? "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]"
                : "bg-red-400"
            }
          `}
        />

        <span
          className={`
            text-[10px]
            font-semibold
            ${
              online
                ? "text-emerald-400"
                : "text-red-400"
            }
          `}
        >
          {online
            ? "Online"
            : "Offline"}
        </span>
      </div>
    </motion.div>
  );
};

// ============================================================
// QUICK CARD
// ============================================================

interface QuickCardProps {
  title: string;
  description: string;
  icon: ElementType;
  path: string;
  iconClass: string;
  glowClass: string;
  delay: number;
}

const QuickCard = ({
  title,
  description,
  icon: Icon,
  path,
  iconClass,
  glowClass,
  delay,
}: QuickCardProps) => {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 15,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.45,
        delay,
      }}
    >
      <Link
        to={path}
        className="
          group
          relative
          block
          overflow-hidden
          rounded-3xl
          border
          border-white/10
          bg-white/[0.035]
          p-5
          backdrop-blur-2xl
          transition-all
          duration-300
          hover:-translate-y-1
          hover:border-white/15
          hover:bg-white/[0.06]
        "
      >
        <div
          className={`
            pointer-events-none
            absolute
            -right-8
            -top-8
            h-24
            w-24
            rounded-full
            blur-3xl
            opacity-0
            transition-opacity
            duration-500
            group-hover:opacity-100
            ${glowClass}
          `}
        />

        <div className="relative flex items-start justify-between gap-4">
          <div
            className={`
              flex
              h-12
              w-12
              shrink-0
              items-center
              justify-center
              rounded-2xl
              border
              border-white/10
              ${iconClass}
            `}
          >
            <Icon size={20} />
          </div>

          <div
            className="
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-full
              border
              border-white/10
              bg-white/5
              text-white/25
              transition-all
              duration-300
              group-hover:translate-x-1
              group-hover:border-white/20
              group-hover:text-white
            "
          >
            <FiArrowRight size={15} />
          </div>
        </div>

        <div className="relative">
          <h3 className="mt-5 text-sm font-semibold text-white">
            {title}
          </h3>

          <p className="mt-1.5 text-xs leading-5 text-white/35">
            {description}
          </p>
        </div>
      </Link>
    </motion.div>
  );
};

// ============================================================
// DASHBOARD
// ============================================================

const Dashboard = () => {
  const [stats, setStats] =
    useState<DashboardStats>({
      totalSigns: 0,
      accuracy: 0,
      sessionsToday: 0,
      avgConfidence: 0,
      signToText: 0,
      textToSign: 0,
      speechToSign: 0,
    });

  const [recentHistory, setRecentHistory] =
    useState<HistoryItem[]>([]);

  const [systemStatus, setSystemStatus] =
    useState<SystemStatus>({
      camera: false,
      model: false,
      backend: true,
      history: false,
    });

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [lastUpdated, setLastUpdated] =
    useState<Date>(new Date());

  // ==========================================================
  // LOAD DASHBOARD
  // ==========================================================

  const loadDashboard = useCallback(
    async (
      showLoading = false
    ) => {
      if (showLoading) {
        setRefreshing(true);
      }

      try {
        const [
          dashboardResult,
          historyResult,
          cameraResult,
          modelResult,
        ] =
          await Promise.allSettled([
            getDashboardStats(),
            fetchHistory(200, 0),
            getCameraStatus(),
            getModelStatus(),
          ]);

        // ======================================================
        // DASHBOARD STATS
        // ======================================================

        if (
          dashboardResult.status ===
          "fulfilled"
        ) {
          setStats(
            dashboardResult.value
          );
        } else {
          console.error(
            "Dashboard stats failed:",
            dashboardResult.reason
          );
        }

        // ======================================================
        // HISTORY
        // ======================================================

        if (
          historyResult.status ===
          "fulfilled"
        ) {
          const history =
            historyResult.value;

          const sortedHistory =
            [...history]
              .filter((item) =>
                isValidDate(
                  parseTimestamp(
                    item.timestamp
                  )
                )
              )
              .sort(
                (a, b) =>
                  parseTimestamp(
                    b.timestamp
                  ).getTime() -
                  parseTimestamp(
                    a.timestamp
                  ).getTime()
              );

          setRecentHistory(
            sortedHistory
          );

          setSystemStatus(
            (previous) => ({
              ...previous,
              history: true,
            })
          );
        } else {
          console.error(
            "History loading failed:",
            historyResult.reason
          );

          setSystemStatus(
            (previous) => ({
              ...previous,
              history: false,
            })
          );
        }

        // ======================================================
        // CAMERA
        // ======================================================

        if (
          cameraResult.status ===
          "fulfilled"
        ) {
          setSystemStatus(
            (previous) => ({
              ...previous,
              camera:
                cameraResult.value
                  .connected === true,
            })
          );
        } else {
          setSystemStatus(
            (previous) => ({
              ...previous,
              camera: false,
            })
          );
        }

        // ======================================================
        // MODEL
        // ======================================================

        if (
          modelResult.status ===
          "fulfilled"
        ) {
          setSystemStatus(
            (previous) => ({
              ...previous,
              model:
                modelResult.value
                  .loaded === true,
            })
          );
        } else {
          setSystemStatus(
            (previous) => ({
              ...previous,
              model: false,
            })
          );
        }

        // ======================================================
        // BACKEND
        // ======================================================

        const backendWorking =
          dashboardResult.status ===
            "fulfilled" ||
          historyResult.status ===
            "fulfilled" ||
          cameraResult.status ===
            "fulfilled" ||
          modelResult.status ===
            "fulfilled";

        setSystemStatus(
          (previous) => ({
            ...previous,
            backend:
              backendWorking,
          })
        );

        setLastUpdated(
          new Date()
        );
      } catch (error) {
        console.error(
          "Dashboard loading error:",
          error
        );

        setSystemStatus(
          (previous) => ({
            ...previous,
            backend: false,
          })
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  // ==========================================================
  // AUTO REFRESH
  // ==========================================================

  useEffect(() => {
    void loadDashboard();

    const interval =
      window.setInterval(() => {
        void loadDashboard();
      }, 5000);

    return () => {
      window.clearInterval(
        interval
      );
    };
  }, [loadDashboard]);

  // ==========================================================
  // TODAY HISTORY
  // ==========================================================

  const todayHistory = useMemo(() => {
    return recentHistory.filter(
      (item) =>
        isToday(
          parseTimestamp(
            item.timestamp
          )
        )
    );
  }, [recentHistory]);

  // ==========================================================
  // HOURLY ACTIVITY
  // ==========================================================

  const hourlyData = useMemo(() => {
    return createHourlyData(
      recentHistory
    );
  }, [recentHistory]);

  const maxHourlyCount = useMemo(() => {
    const maximum = Math.max(
      ...hourlyData.map(
        (item) => item.count
      ),
      0
    );

    return Math.max(
      maximum,
      1
    );
  }, [hourlyData]);

  // ==========================================================
  // CURRENT HOUR - IST
  // ==========================================================

  const currentHour =
    getIndiaHour(new Date());

  // ==========================================================
  // ACTIVITY BREAKDOWN
  // ==========================================================

  const activityStats = useMemo(() => {
    const signToText =
      todayHistory.filter(
        (item) =>
          item.type ===
          "sign-to-text"
      ).length;

    const textToSign =
      todayHistory.filter(
        (item) =>
          item.type ===
          "text-to-sign"
      ).length;

    const speechToSign =
      todayHistory.filter(
        (item) =>
          item.type ===
          "speech-to-sign"
      ).length;

    const total =
      signToText +
      textToSign +
      speechToSign;

    return {
      signToText,
      textToSign,
      speechToSign,
      total,
    };
  }, [todayHistory]);

  // ==========================================================
  // TODAY AVERAGE CONFIDENCE
  // ==========================================================

  const todayAverageConfidence =
    useMemo(() => {
      const values =
        todayHistory
          .map((item) =>
            getConfidencePercentage(
              item.confidence
            )
          )
          .filter((value) =>
            Number.isFinite(value)
          );

      if (
        values.length === 0
      ) {
        return 0;
      }

      return (
        values.reduce(
          (sum, value) =>
            sum + value,
          0
        ) / values.length
      );
    }, [todayHistory]);

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="relative flex min-h-[75vh] items-center justify-center overflow-hidden">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/10 blur-3xl" />

        <motion.div
          initial={{
            opacity: 0,
            scale: 0.95,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          className="relative flex flex-col items-center"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/5">
            <FiRefreshCw
              size={24}
              className="animate-spin text-cyan-300"
            />
          </div>

          <p className="mt-5 text-sm font-medium text-white/60">
            Loading control center
          </p>

          <p className="mt-1 text-xs text-white/25">
            Syncing translation data...
          </p>
        </motion.div>
      </div>
    );
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="relative min-h-full overflow-hidden pb-12 text-white">
      {/* AMBIENT BACKGROUND */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-cyan-500/[0.07] blur-3xl" />

        <div className="absolute right-0 top-20 h-80 w-80 rounded-full bg-blue-500/[0.06] blur-3xl" />

        <div className="absolute bottom-20 left-1/3 h-80 w-80 rounded-full bg-violet-500/[0.05] blur-3xl" />
      </div>

      <div className="relative space-y-6">
        {/* HEADER */}

        <motion.section
          initial={{
            opacity: 0,
            y: 15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="
            relative
            overflow-hidden
            rounded-[2rem]
            border
            border-white/10
            bg-white/[0.035]
            p-6
            backdrop-blur-2xl
            sm:p-7
          "
        >
          <div className="pointer-events-none absolute -right-20 -top-28 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />

                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                </span>

                <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-400">
                  Control Center • Live
                </span>
              </div>

              <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                Translation Dashboard
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/40">
                Monitor translation activity,
                recognition performance and
                the health of your ISL
                translation system.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="hidden rounded-2xl border border-white/10 bg-black/10 px-4 py-2.5 sm:block">
                <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/25">
                  Last synchronized
                </p>

                <p className="mt-1 text-xs font-medium text-white/65">
                  {formatTime(
                    lastUpdated
                  )}
                  {" "}
                  {new Intl.DateTimeFormat(
                    "en-IN",
                    {
                      timeZone:
                        "Asia/Kolkata",
                      second: "2-digit",
                    }
                  ).format(
                    lastUpdated
                  )}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  void loadDashboard(
                    true
                  )
                }
                disabled={refreshing}
                className="
                  flex
                  items-center
                  gap-2
                  rounded-2xl
                  border
                  border-white/10
                  bg-white/5
                  px-4
                  py-2.5
                  text-xs
                  font-semibold
                  text-white/65
                  transition-all
                  duration-300
                  hover:border-white/20
                  hover:bg-white/10
                  hover:text-white
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                <FiRefreshCw
                  size={14}
                  className={
                    refreshing
                      ? "animate-spin"
                      : ""
                  }
                />

                Refresh
              </button>

              <Link
                to="/sign-to-text"
                className="
                  group
                  flex
                  items-center
                  gap-2
                  rounded-2xl
                  bg-gradient-to-r
                  from-cyan-400
                  to-blue-500
                  px-4
                  py-2.5
                  text-xs
                  font-bold
                  text-slate-950
                  shadow-lg
                  shadow-cyan-500/10
                  transition-all
                  duration-300
                  hover:-translate-y-0.5
                  hover:shadow-cyan-500/20
                "
              >
                <FiZap
                  size={14}
                  className="transition-transform group-hover:rotate-12"
                />

                Start Translation
              </Link>
            </div>
          </div>
        </motion.section>

        {/* STATS */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Translations"
            value={stats.totalSigns.toLocaleString()}
            subtitle="All saved translations"
            icon={FiActivity}
            iconClass="text-cyan-300"
            glowClass="bg-cyan-400/20"
            delay={0.05}
          />

          <StatCard
            title="Accuracy Rate"
            value={formatPercentage(
              stats.accuracy
            )}
            subtitle="Average recognition accuracy"
            icon={FiTrendingUp}
            iconClass="text-emerald-300"
            glowClass="bg-emerald-400/20"
            delay={0.1}
          />

          <StatCard
            title="Today's Translations"
            value={stats.sessionsToday.toLocaleString()}
            subtitle="Translations recorded today"
            icon={FiClock}
            iconClass="text-violet-300"
            glowClass="bg-violet-400/20"
            delay={0.15}
          />

          <StatCard
            title="Avg Confidence"
            value={formatPercentage(
              stats.avgConfidence
            )}
            subtitle="Overall recognition confidence"
            icon={FiShield}
            iconClass="text-blue-300"
            glowClass="bg-blue-400/20"
            delay={0.2}
          />
        </div>

        {/* TODAY'S ACTIVITY GRAPH */}

        <motion.section
          initial={{
            opacity: 0,
            y: 15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.45,
            delay: 0.25,
          }}
          className="
            overflow-hidden
            rounded-[2rem]
            border
            border-white/10
            bg-white/[0.035]
            backdrop-blur-2xl
          "
        >
          <div className="flex flex-col gap-5 border-b border-white/10 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-400/10 bg-cyan-400/10 text-cyan-300">
                  <FiBarChart2 size={17} />
                </div>

                <div>
                  <h2 className="text-base font-semibold text-white">
                    Today's Translation Activity
                  </h2>

                  <p className="mt-0.5 text-[11px] text-white/30">
                    Number of translations completed during each hour
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-2.5">
                <p className="text-[9px] uppercase tracking-[0.15em] text-white/25">
                  Translations
                </p>

                <p className="mt-1 text-lg font-bold text-white">
                  {todayHistory.length}
                </p>
              </div>

              <div className="rounded-2xl border border-cyan-400/10 bg-cyan-400/5 px-4 py-2.5">
                <p className="text-[9px] uppercase tracking-[0.15em] text-cyan-300/50">
                  Avg. confidence
                </p>

                <p className="mt-1 text-lg font-bold text-cyan-300">
                  {todayAverageConfidence.toFixed(
                    1
                  )}
                  %
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            {todayHistory.length ===
            0 ? (
              <div className="flex h-64 flex-col items-center justify-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/20">
                  <FiBarChart2 size={22} />
                </div>

                <p className="mt-4 text-sm font-semibold text-white/50">
                  No translation activity today
                </p>

                <p className="mt-1 text-xs text-white/25">
                  Start a translation and
                  hourly activity will appear
                  here.
                </p>
              </div>
            ) : (
              <>
                <div className="relative h-72 w-full">
                  {/* Y-axis */}

                  <div className="pointer-events-none absolute bottom-8 left-0 top-0 flex w-8 flex-col justify-between text-[9px] text-white/20">
                    <span>
                      {maxHourlyCount}
                    </span>

                    <span>
                      {Math.round(
                        maxHourlyCount *
                          0.75
                      )}
                    </span>

                    <span>
                      {Math.round(
                        maxHourlyCount *
                          0.5
                      )}
                    </span>

                    <span>
                      {Math.round(
                        maxHourlyCount *
                          0.25
                      )}
                    </span>

                    <span>0</span>
                  </div>

                  {/* GRAPH */}

                  <div className="absolute bottom-8 left-10 right-0 top-0">
                    {/* GRID */}

                    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
                      {[
                        0,
                        1,
                        2,
                        3,
                        4,
                      ].map(
                        (line) => (
                          <div
                            key={line}
                            className="h-px w-full bg-white/[0.045]"
                          />
                        )
                      )}
                    </div>

                    {/* BARS */}

                    <div className="absolute inset-0 flex items-end gap-1 sm:gap-2">
                      {hourlyData.map(
                        (item) => {
                          const height =
                            item.count >
                            0
                              ? Math.max(
                                  (item.count /
                                    maxHourlyCount) *
                                    100,
                                  6
                                )
                              : 1.5;

                          const isCurrent =
                            item.hour ===
                            currentHour;

                          return (
                            <div
                              key={
                                item.hour
                              }
                              className="group relative flex h-full min-w-0 flex-1 flex-col justify-end"
                            >
                              {/* TOOLTIP */}

                              <div
                                className="
                                  pointer-events-none
                                  absolute
                                  bottom-[calc(100%-10px)]
                                  left-1/2
                                  z-30
                                  -translate-x-1/2
                                  whitespace-nowrap
                                  rounded-xl
                                  border
                                  border-white/10
                                  bg-slate-950/95
                                  px-3
                                  py-2
                                  text-[10px]
                                  text-white/70
                                  opacity-0
                                  shadow-2xl
                                  backdrop-blur-xl
                                  transition-opacity
                                  duration-200
                                  group-hover:opacity-100
                                "
                              >
                                <span>
                                  {item.label}
                                </span>

                                <span className="ml-2 font-bold text-white">
                                  {item.count}{" "}
                                  {item.count ===
                                  1
                                    ? "translation"
                                    : "translations"}
                                </span>
                              </div>

                              {/* BAR */}

                              <div className="relative flex h-full items-end justify-center">
                                <motion.div
                                  initial={{
                                    height: 0,
                                  }}
                                  animate={{
                                    height: `${height}%`,
                                  }}
                                  transition={{
                                    duration:
                                      0.6,
                                    delay:
                                      0.15 +
                                      item.hour *
                                        0.01,
                                  }}
                                  className={`
                                    relative
                                    w-full
                                    max-w-[34px]
                                    rounded-t-lg
                                    transition-all
                                    duration-300
                                    ${
                                      item.count >
                                      0
                                        ? isCurrent
                                          ? "bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.35)]"
                                          : "bg-gradient-to-t from-blue-600/70 to-cyan-400/90 group-hover:from-blue-500 group-hover:to-cyan-300"
                                        : "bg-white/[0.035]"
                                    }
                                  `}
                                >
                                  {item.count >
                                    0 && (
                                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-bold text-white/60">
                                      {
                                        item.count
                                      }
                                    </span>
                                  )}
                                </motion.div>
                              </div>

                              {/* TIME LABEL */}

                              <div className="absolute -bottom-7 left-0 right-0 text-center">
                                <span
                                  className={`
                                    text-[9px]
                                    sm:text-[10px]
                                    ${
                                      isCurrent
                                        ? "font-bold text-emerald-400"
                                        : "text-white/25"
                                    }
                                  `}
                                >
                                  {item.hour %
                                    2 ===
                                  0
                                    ? item.label
                                    : ""}
                                </span>
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-10 flex items-center justify-between border-t border-white/5 pt-4">
                  <div className="flex items-center gap-2 text-[10px] text-white/30">
                    <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]" />

                    Translation count per hour
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-white/25">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />

                    Current hour
                  </div>
                </div>
              </>
            )}
          </div>
        </motion.section>

        {/* BREAKDOWN + SYSTEM */}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {/* BREAKDOWN */}

          <motion.section
            initial={{
              opacity: 0,
              y: 15,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.45,
              delay: 0.3,
            }}
            className="
              rounded-[2rem]
              border
              border-white/10
              bg-white/[0.035]
              p-5
              backdrop-blur-2xl
              sm:p-6
            "
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-white">
                  Translation Breakdown
                </h2>

                <p className="mt-1 text-[11px] text-white/30">
                  Today's activity by translation mode
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/45">
                <FiActivity size={17} />
              </div>
            </div>

            <div className="mt-7 space-y-6">
              {/* SIGN TO TEXT */}

              <div>
                <div className="mb-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
                      <FiCamera size={14} />
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-white/75">
                        Sign → Text
                      </p>

                      <p className="text-[9px] text-white/25">
                        Gesture recognition
                      </p>
                    </div>
                  </div>

                  <span className="text-sm font-bold text-white">
                    {
                      activityStats.signToText
                    }
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-white/5">
                  <motion.div
                    initial={{
                      width: 0,
                    }}
                    animate={{
                      width:
                        activityStats.total >
                        0
                          ? `${
                              (activityStats.signToText /
                                activityStats.total) *
                              100
                            }%`
                          : "0%",
                    }}
                    transition={{
                      duration: 0.7,
                    }}
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-400"
                  />
                </div>
              </div>

              {/* TEXT TO SIGN */}

              <div>
                <div className="mb-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-400/10 text-violet-300">
                      <FiType size={14} />
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-white/75">
                        Text → Sign
                      </p>

                      <p className="text-[9px] text-white/25">
                        Text translation
                      </p>
                    </div>
                  </div>

                  <span className="text-sm font-bold text-white">
                    {
                      activityStats.textToSign
                    }
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-white/5">
                  <motion.div
                    initial={{
                      width: 0,
                    }}
                    animate={{
                      width:
                        activityStats.total >
                        0
                          ? `${
                              (activityStats.textToSign /
                                activityStats.total) *
                              100
                            }%`
                          : "0%",
                    }}
                    transition={{
                      duration: 0.7,
                    }}
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-400"
                  />
                </div>
              </div>

              {/* SPEECH TO SIGN */}

              <div>
                <div className="mb-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-400/10 text-blue-300">
                      <FiMic size={14} />
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-white/75">
                        Speech → Sign
                      </p>

                      <p className="text-[9px] text-white/25">
                        Voice translation
                      </p>
                    </div>
                  </div>

                  <span className="text-sm font-bold text-white">
                    {
                      activityStats.speechToSign
                    }
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-white/5">
                  <motion.div
                    initial={{
                      width: 0,
                    }}
                    animate={{
                      width:
                        activityStats.total >
                        0
                          ? `${
                              (activityStats.speechToSign /
                                activityStats.total) *
                              100
                            }%`
                          : "0%",
                    }}
                    transition={{
                      duration: 0.7,
                    }}
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
                  />
                </div>
              </div>
            </div>

            <div className="mt-7 flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.025] px-4 py-4">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-white/25">
                  Total today
                </p>

                <p className="mt-1 text-2xl font-bold text-white">
                  {activityStats.total}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/5 text-cyan-300/40">
                <FiBarChart2 size={21} />
              </div>
            </div>
          </motion.section>

          {/* SYSTEM HEALTH */}

          <motion.section
            initial={{
              opacity: 0,
              y: 15,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.45,
              delay: 0.35,
            }}
            className="
              rounded-[2rem]
              border
              border-white/10
              bg-white/[0.035]
              p-5
              backdrop-blur-2xl
              sm:p-6
            "
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-white">
                  System Health
                </h2>

                <p className="mt-1 text-[11px] text-white/30">
                  Current translator services
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-full border border-emerald-400/10 bg-emerald-400/5 px-3 py-1.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />

                  <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </span>

                <span className="text-[10px] font-semibold text-emerald-400">
                  LIVE
                </span>
              </div>
            </div>

            <div className="mt-5 space-y-2.5">
              <StatusItem
                icon={FiCamera}
                label="Camera"
                description="Webcam connection"
                online={
                  systemStatus.camera
                }
              />

              <StatusItem
                icon={FiCpu}
                label="AI Model"
                description="ISL recognition model"
                online={
                  systemStatus.model
                }
              />

              <StatusItem
                icon={FiServer}
                label="FastAPI"
                description="Backend API service"
                online={
                  systemStatus.backend
                }
              />

              <StatusItem
                icon={FiDatabase}
                label="History Database"
                description="Translation history"
                online={
                  systemStatus.history
                }
              />
            </div>

            <div className="mt-4 flex items-center justify-between rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.035] px-4 py-3.5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-400/10 text-cyan-300">
                  <FiCheckCircle size={14} />
                </div>

                <div>
                  <p className="text-[9px] uppercase tracking-wider text-white/25">
                    Active model
                  </p>

                  <p className="mt-0.5 text-xs font-semibold text-white/75">
                    ISL-Transformer-v2
                  </p>
                </div>
              </div>

              <span className="rounded-full border border-emerald-400/10 bg-emerald-400/5 px-2.5 py-1 text-[9px] font-semibold text-emerald-400">
                READY
              </span>
            </div>
          </motion.section>
        </div>

        {/* RECENT TRANSLATIONS */}

        <motion.section
          initial={{
            opacity: 0,
            y: 15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.45,
            delay: 0.4,
          }}
          className="
            overflow-hidden
            rounded-[2rem]
            border
            border-white/10
            bg-white/[0.035]
            backdrop-blur-2xl
          "
        >
          <div className="flex items-center justify-between border-b border-white/10 p-5 sm:p-6">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-white/40">
                  <FiMessageSquare size={16} />
                </div>

                <div>
                  <h2 className="text-base font-semibold text-white">
                    Recent Translations
                  </h2>

                  <p className="mt-0.5 text-[11px] text-white/30">
                    Latest activity from your translation history
                  </p>
                </div>
              </div>
            </div>

            <Link
              to="/history"
              className="
                group
                flex
                items-center
                gap-1.5
                rounded-xl
                border
                border-white/5
                bg-white/[0.025]
                px-3
                py-2
                text-[10px]
                font-semibold
                text-white/40
                transition-all
                hover:border-white/10
                hover:bg-white/5
                hover:text-white
              "
            >
              View all

              <FiArrowRight
                size={13}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          </div>

          {recentHistory.length ===
          0 ? (
            <div className="flex min-h-[190px] flex-col items-center justify-center p-8 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/20">
                <FiMessageSquare size={21} />
              </div>

              <p className="mt-4 text-sm font-semibold text-white/55">
                No translations yet
              </p>

              <p className="mt-1 max-w-sm text-xs text-white/25">
                Start a translation and
                your recent activity will
                appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {recentHistory
                .slice(0, 6)
                .map((item) => {
                  const Icon =
                    getModeIcon(
                      item.type
                    );

                  const timestamp =
                    parseTimestamp(
                      item.timestamp
                    );

                  const displayText =
                    item.output?.trim() ||
                    item.input?.trim() ||
                    "Translation";

                  return (
                    <motion.div
                      key={item.id}
                      whileHover={{
                        x: 2,
                      }}
                      className="
                        flex
                        flex-col
                        gap-3
                        p-4
                        transition-colors
                        hover:bg-white/[0.025]
                        sm:flex-row
                        sm:items-center
                        sm:justify-between
                        sm:px-6
                      "
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div
                          className={`
                            flex
                            h-10
                            w-10
                            shrink-0
                            items-center
                            justify-center
                            rounded-xl
                            border
                            ${getModeStyle(
                              item.type
                            )}
                          `}
                        >
                          <Icon size={15} />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-white/80">
                            {
                              displayText
                            }
                          </p>

                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            <span className="text-[9px] font-medium text-white/30">
                              {getModeLabel(
                                item.type
                              )}
                            </span>

                            <span className="text-white/10">
                              •
                            </span>

                            <span className="text-[9px] text-white/25">
                              {formatDate(
                                timestamp
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-5 pl-[52px] sm:pl-0">
                        <div className="min-w-[100px]">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] text-white/25">
                              Confidence
                            </span>

                            <span className="text-[10px] font-bold text-cyan-300">
                              {formatPercentage(
                                item.confidence
                              )}
                            </span>
                          </div>

                          <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/5">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
                              style={{
                                width: `${getConfidencePercentage(
                                  item.confidence
                                )}%`,
                              }}
                            />
                          </div>
                        </div>

                        <div className="flex min-w-[65px] items-center justify-end gap-1.5 text-[9px] text-white/25">
                          <FiClock
                            size={10}
                          />

                          {formatTime(
                            timestamp
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
            </div>
          )}
        </motion.section>

        {/* QUICK ACCESS */}

        <section>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">
                Quick Access
              </h2>

              <p className="mt-1 text-[11px] text-white/30">
                Jump directly into your
                translation tools.
              </p>
            </div>

            <FiZap
              size={17}
              className="text-cyan-300/30"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <QuickCard
              title="Sign to Text"
              description="Use your camera to recognize Indian Sign Language."
              icon={FiCamera}
              path="/sign-to-text"
              iconClass="bg-cyan-400/10 text-cyan-300"
              glowClass="bg-cyan-400/15"
              delay={0.45}
            />

            <QuickCard
              title="Text to Sign"
              description="Convert written text into ISL sign animations."
              icon={FiType}
              path="/text-to-sign"
              iconClass="bg-violet-400/10 text-violet-300"
              glowClass="bg-violet-400/15"
              delay={0.5}
            />

            <QuickCard
              title="Speech to Sign"
              description="Convert spoken language into sign animations."
              icon={FiMic}
              path="/speech-to-sign"
              iconClass="bg-blue-400/10 text-blue-300"
              glowClass="bg-blue-400/15"
              delay={0.55}
            />

            <QuickCard
              title="Learning Hub"
              description="Learn signs, categories and everyday expressions."
              icon={FiMessageSquare}
              path="/learning-hub"
              iconClass="bg-amber-400/10 text-amber-300"
              glowClass="bg-amber-400/15"
              delay={0.6}
            />
          </div>
        </section>

        {/* FOOTER STATUS */}

        <div className="flex flex-col items-center justify-between gap-3 border-t border-white/5 pt-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />

              <span className="relative h-2 w-2 rounded-full bg-emerald-400" />
            </span>

            <span className="text-[10px] text-white/25">
              ISL Translator services are running
            </span>
          </div>

          <div className="flex items-center gap-3 text-[9px] text-white/15">
            <span>React + Vite</span>
            <span>•</span>
            <span>FastAPI</span>
            <span>•</span>
            <span>TensorFlow</span>
            <span>•</span>
            <span>MediaPipe</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;