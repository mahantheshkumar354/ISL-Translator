import {
  useEffect,
  useState,
  type ElementType,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FiSettings,
  FiUser,
  FiMoon,
  FiGlobe,
  FiBell,
  FiCamera,
  FiMic,
  FiVolume2,
  FiLogOut,
  FiSave,
  FiRotateCcw,
  FiCheck,
  FiShield,
  FiSliders,
  FiMonitor,
  FiChevronRight,
  FiInfo,
  FiX,
  FiClock,
  FiMail,
  FiCalendar,
  FiActivity,
  FiEdit3,
  FiLock,
  FiArrowUpRight,
} from "react-icons/fi";
import type { AppSettings } from "@/types";

const SETTINGS_STORAGE_KEY = "signbridge-settings";

const API_BASE_URL = "http://localhost:8000/api/v1";

const DEFAULT_SETTINGS: AppSettings = {
  darkMode: true,
  language: "en",
  theme: "default",
  notifications: true,
  cameraQuality: "high",
  speechEnabled: true,
  speechRate: 1,
  speechPitch: 1,
};

type SettingsSection =
  | "general"
  | "account"
  | "appearance"
  | "translation"
  | "notifications";

interface ThemeOption {
  id: AppSettings["theme"];
  name: string;
  description: string;
  gradient: string;
  primary: string;
  soft: string;
  border: string;
  text: string;
}

interface UserProfile {
  id: number;
  full_name: string | null;
  email: string;
  is_active: boolean;
  created_at: string;
  last_login: string | null;
  last_logout: string | null;
}

const themes: ThemeOption[] = [
  {
    id: "default",
    name: "Ocean",
    description: "Cool & professional",
    gradient: "from-cyan-400 via-blue-500 to-violet-500",
    primary: "bg-cyan-400",
    soft: "bg-cyan-400/10",
    border: "border-cyan-400/30",
    text: "text-cyan-300",
  },
  {
    id: "sunset",
    name: "Sunset",
    description: "Warm & energetic",
    gradient: "from-orange-400 via-pink-500 to-purple-500",
    primary: "bg-orange-400",
    soft: "bg-orange-400/10",
    border: "border-orange-400/30",
    text: "text-orange-300",
  },
  {
    id: "forest",
    name: "Forest",
    description: "Natural & calm",
    gradient: "from-emerald-400 via-teal-500 to-cyan-500",
    primary: "bg-emerald-400",
    soft: "bg-emerald-400/10",
    border: "border-emerald-400/30",
    text: "text-emerald-300",
  },
];

const navigation: {
  id: SettingsSection;
  label: string;
  description: string;
  icon: ElementType;
}[] = [
  {
    id: "general",
    label: "General",
    description: "Basic preferences",
    icon: FiSliders,
  },
  {
    id: "account",
    label: "Account",
    description: "Profile & security",
    icon: FiUser,
  },
  {
    id: "appearance",
    label: "Appearance",
    description: "Theme & display",
    icon: FiMonitor,
  },
  {
    id: "translation",
    label: "Translation",
    description: "Camera & speech",
    icon: FiCamera,
  },
  {
    id: "notifications",
    label: "Notifications",
    description: "Alerts & updates",
    icon: FiBell,
  },
];

function getStoredSettings(): AppSettings {
  try {
    const stored = localStorage.getItem(
      SETTINGS_STORAGE_KEY
    );

    if (!stored) {
      return DEFAULT_SETTINGS;
    }

    const parsed =
      JSON.parse(stored) as Partial<AppSettings>;

    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/* =========================================================
   GLOBAL THEME
   ========================================================= */

function applyTheme(
  theme: AppSettings["theme"],
  darkMode: boolean
) {
  const root = document.documentElement;

  root.classList.remove(
    "theme-ocean",
    "theme-sunset",
    "theme-forest",
    "light-mode"
  );

  if (theme === "sunset") {
    root.classList.add("theme-sunset");
  } else if (theme === "forest") {
    root.classList.add("theme-forest");
  } else {
    root.classList.add("theme-ocean");
  }

  if (!darkMode) {
    root.classList.add("light-mode");
  }
}

/* =========================================================
   TOGGLE
   ========================================================= */

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      aria-label={
        checked
          ? "Disable setting"
          : "Enable setting"
      }
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 shrink-0 rounded-full border transition-all duration-300 ${
        checked
          ? "border-[var(--sb-primary)]/30 bg-[var(--sb-primary)]/25"
          : "border-black/10 bg-black/[0.06] dark:border-white/10 dark:bg-white/[0.06]"
      }`}
    >
      <motion.span
        animate={{
          x: checked ? 22 : 3,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30,
        }}
        className={`absolute top-[3px] h-5 w-5 rounded-full ${
          checked
            ? "bg-[var(--sb-primary)] shadow-lg"
            : "bg-slate-400"
        }`}
      />
    </button>
  );
}

/* =========================================================
   SETTING ITEM
   ========================================================= */

function SettingItem({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: ElementType;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="group flex items-center justify-between gap-6 border-b border-[var(--sb-border)] py-5 last:border-0">
      <div className="flex min-w-0 items-center gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--sb-border)] bg-[var(--sb-surface)] transition group-hover:border-[var(--sb-primary)]/20 group-hover:bg-[var(--sb-primary)]/5">
          <Icon
            size={17}
            className="text-[var(--sb-muted)] transition group-hover:text-[var(--sb-primary)]"
          />
        </div>

        <div className="min-w-0">
          <p className="text-sm font-medium text-[var(--sb-text)]">
            {title}
          </p>

          <p className="mt-1 text-xs leading-5 text-[var(--sb-muted)]">
            {description}
          </p>
        </div>
      </div>

      <div className="shrink-0">
        {children}
      </div>
    </div>
  );
}

/* =========================================================
   SECTION TITLE
   ========================================================= */

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
    <div className="mb-7">
      <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--sb-primary)]">
        {eyebrow}
      </p>

      <h2 className="text-2xl font-semibold tracking-tight text-[var(--sb-text)] sm:text-3xl">
        {title}
      </h2>

      <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--sb-muted)]">
        {description}
      </p>
    </div>
  );
}

/* =========================================================
   ACCOUNT DETAIL CARD
   ========================================================= */

function AccountDetail({
  icon: Icon,
  label,
  value,
  accent = "primary",
}: {
  icon: ElementType;
  label: string;
  value: string;
  accent?: "primary" | "green" | "red";
}) {
  const iconClass =
    accent === "green"
      ? "bg-emerald-400/10 text-emerald-400"
      : accent === "red"
      ? "bg-red-400/10 text-red-400"
      : "bg-[var(--sb-primary)]/10 text-[var(--sb-primary)]";

  return (
    <div className="group rounded-2xl border border-[var(--sb-border)] bg-[var(--sb-bg)]/40 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--sb-primary)]/20 hover:bg-[var(--sb-primary)]/[0.03]">
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon size={16} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--sb-muted)]">
            {label}
          </p>

          <p className="mt-2 truncate text-sm font-semibold text-[var(--sb-text)]">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   SETTINGS PAGE
   ========================================================= */

export default function Settings() {
  const [settings, setSettings] =
    useState<AppSettings>(getStoredSettings);

  const [activeSection, setActiveSection] =
    useState<SettingsSection>("general");

  const [saved, setSaved] =
    useState(false);

  /* =========================================================
     USER PROFILE
  ========================================================= */

  const [user, setUser] =
    useState<UserProfile | null>(null);

  const [loadingUser, setLoadingUser] =
    useState(true);

  /* =========================================================
     EDIT PROFILE
  ========================================================= */

  const [
    isEditProfileOpen,
    setIsEditProfileOpen,
  ] = useState(false);

  const [editFullName, setEditFullName] =
    useState("");

  const [profileSaving, setProfileSaving] =
    useState(false);

  const [profileMessage, setProfileMessage] =
    useState("");

  /* =========================================================
     LOGOUT
  ========================================================= */

  const [loggingOut, setLoggingOut] =
    useState(false);

  /* =========================================================
     DATE FORMAT
  ========================================================= */

  const formatDateTime = (
    value: string | null | undefined
  ) => {
    if (!value) {
      return "";
    }

    let normalizedValue =
      value.trim();

    /*
     * SQLite can return:
     *
     * 2026-09-14T08:56:00
     *
     * without timezone information.
     *
     * Backend stores UTC, so append Z.
     */

    if (
      !normalizedValue.endsWith("Z") &&
      !/[+-]\d{2}:\d{2}$/.test(
        normalizedValue
      )
    ) {
      normalizedValue += "Z";
    }

    const date =
      new Date(normalizedValue);

    if (
      Number.isNaN(date.getTime())
    ) {
      return "";
    }

    return date.toLocaleString(
      "en-IN",
      {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }
    );
  };

  const formatDate = (
    value: string | null | undefined
  ) => {
    if (!value) {
      return "";
    }

    let normalizedValue =
      value.trim();

    if (
      !normalizedValue.endsWith("Z") &&
      !/[+-]\d{2}:\d{2}$/.test(
        normalizedValue
      )
    ) {
      normalizedValue += "Z";
    }

    const date =
      new Date(normalizedValue);

    if (
      Number.isNaN(date.getTime())
    ) {
      return "";
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  /* =========================================================
     LOAD CURRENT USER
  ========================================================= */

  const loadUser = async () => {
    const token =
      localStorage.getItem(
        "access_token"
      ) ||
      localStorage.getItem(
        "token"
      );

    if (!token) {
      setLoadingUser(false);
      return;
    }

    try {
      setLoadingUser(true);

      const response =
        await fetch(
          `${API_BASE_URL}/auth/me`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type":
                "application/json",
            },
          }
        );

      if (!response.ok) {
        throw new Error(
          "Unable to load account information."
        );
      }

      const data =
        (await response.json()) as UserProfile;

      setUser(data);

      setEditFullName(
        data.full_name || ""
      );
    } catch (error) {
      console.error(
        "Failed to load user:",
        error
      );
    } finally {
      setLoadingUser(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  /* =========================================================
     APPLY THEME + STORE SETTINGS
  ========================================================= */

  useEffect(() => {
    applyTheme(
      settings.theme,
      settings.darkMode
    );

    try {
      localStorage.setItem(
        SETTINGS_STORAGE_KEY,
        JSON.stringify(settings)
      );
    } catch {
      // Ignore localStorage errors.
    }
  }, [settings]);

  /* =========================================================
     UPDATE SETTINGS
  ========================================================= */

  const updateSetting = <
    K extends keyof AppSettings
  >(
    key: K,
    value: AppSettings[K]
  ) => {
    setSettings((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const handleThemeChange = (
    theme: AppSettings["theme"]
  ) => {
    updateSetting(
      "theme",
      theme
    );

    applyTheme(
      theme,
      settings.darkMode
    );
  };

  const handleDarkModeChange = (
    darkMode: boolean
  ) => {
    updateSetting(
      "darkMode",
      darkMode
    );

    applyTheme(
      settings.theme,
      darkMode
    );
  };

  /* =========================================================
     SAVE SETTINGS
  ========================================================= */

  const handleSave = () => {
    try {
      localStorage.setItem(
        SETTINGS_STORAGE_KEY,
        JSON.stringify(settings)
      );
    } catch {
      // Ignore localStorage errors.
    }

    applyTheme(
      settings.theme,
      settings.darkMode
    );

    setSaved(true);

    window.setTimeout(() => {
      setSaved(false);
    }, 2200);
  };

  /* =========================================================
     RESET SETTINGS
  ========================================================= */

  const handleReset = () => {
    setSettings(
      DEFAULT_SETTINGS
    );

    applyTheme(
      DEFAULT_SETTINGS.theme,
      DEFAULT_SETTINGS.darkMode
    );

    try {
      localStorage.setItem(
        SETTINGS_STORAGE_KEY,
        JSON.stringify(
          DEFAULT_SETTINGS
        )
      );
    } catch {
      // Ignore localStorage errors.
    }
  };

  /* =========================================================
     OPEN EDIT PROFILE
  ========================================================= */

  const openEditProfile = () => {
    setEditFullName(
      user?.full_name || ""
    );

    setProfileMessage("");

    setIsEditProfileOpen(
      true
    );
  };

  /* =========================================================
     UPDATE PROFILE
  ========================================================= */

  const handleUpdateProfile =
    async () => {
      const token =
        localStorage.getItem(
          "access_token"
        ) ||
        localStorage.getItem(
          "token"
        );

      if (!token) {
        setProfileMessage(
          "You are not logged in."
        );
        return;
      }

      const name =
        editFullName.trim();

      if (!name) {
        setProfileMessage(
          "Full name is required."
        );
        return;
      }

      try {
        setProfileSaving(true);
        setProfileMessage("");

        const response =
          await fetch(
            `${API_BASE_URL}/auth/me`,
            {
              method: "PUT",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify({
                full_name: name,
              }),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data?.detail ||
              "Unable to update profile."
          );
        }

        /*
         * Replace the complete user
         * object returned by backend.
         *
         * This keeps name, email,
         * ID, dates and status synced.
         */

        setUser(data);

        setEditFullName(
          data.full_name || name
        );

        setIsEditProfileOpen(
          false
        );

        setSaved(true);

        window.setTimeout(() => {
          setSaved(false);
        }, 2200);
      } catch (error) {
        console.error(
          "Profile update failed:",
          error
        );

        setProfileMessage(
          error instanceof Error
            ? error.message
            : "Unable to update profile."
        );
      } finally {
        setProfileSaving(false);
      }
    };

  /* =========================================================
     LOGOUT
  ========================================================= */

  const handleLogout = async () => {
    const token =
      localStorage.getItem(
        "access_token"
      ) ||
      localStorage.getItem(
        "token"
      );

    try {
      setLoggingOut(true);

      if (token) {
        try {
          const response =
            await fetch(
              `${API_BASE_URL}/auth/logout`,
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type":
                    "application/json",
                },
              }
            );

          if (!response.ok) {
            console.warn(
              "Logout API returned:",
              response.status
            );
          }
        } catch (error) {
          console.warn(
            "Logout request failed:",
            error
          );
        }
      }
    } finally {
      localStorage.removeItem(
        "access_token"
      );

      localStorage.removeItem(
        "token"
      );

      window.location.href = "/";
    }
  };

  /* =========================================================
     ACCOUNT DISPLAY VALUES
  ========================================================= */

  const userName =
    user?.full_name ||
    "User";

  const userEmail =
    user?.email ||
    "";

  const userId =
    user?.id ?? null;

  const memberSince =
    user?.created_at
      ? formatDate(
          user.created_at
        )
      : "";

  const lastLogin =
    user?.last_login
      ? formatDateTime(
          user.last_login
        )
      : "";

  const lastLogout =
    user?.last_logout
      ? formatDateTime(
          user.last_logout
        )
      : "";

  const accountActive =
    user?.is_active ?? true;

  const profileInitial =
    userName
      .trim()
      .charAt(0)
      .toUpperCase() || "U";

  const selectedTheme =
    themes.find(
      (theme) =>
        theme.id ===
        settings.theme
    ) ?? themes[0];

  const activeNavigation =
    navigation.find(
      (item) =>
        item.id ===
        activeSection
    );

  return (
    <motion.main
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      transition={{
        duration: 0.45,
      }}
      className="relative min-h-screen overflow-hidden px-4 py-6 text-[var(--sb-text)] transition-colors duration-500 sm:px-6 lg:px-8"
      style={{
        backgroundColor:
          "var(--sb-bg)",
      }}
    >

      {/* =====================================================
          PREMIUM AMBIENT BACKGROUND
      ===================================================== */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">

        <div
          className="absolute -left-40 -top-40 h-[28rem] w-[28rem] rounded-full blur-3xl"
          style={{
            background:
              "color-mix(in srgb, var(--sb-primary) 9%, transparent)",
          }}
        />

        <div
          className="absolute -right-40 top-20 h-[32rem] w-[32rem] rounded-full blur-3xl"
          style={{
            background:
              "color-mix(in srgb, var(--sb-accent) 7%, transparent)",
          }}
        />

        <div
          className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full blur-3xl"
          style={{
            background:
              "color-mix(in srgb, var(--sb-secondary) 6%, transparent)",
          }}
        />

      </div>

      <div className="relative mx-auto max-w-7xl">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">

          <div>

            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--sb-border)] bg-[var(--sb-surface)] px-3 py-1.5 shadow-sm backdrop-blur-xl">

              <FiSettings
                size={13}
                className="text-[var(--sb-primary)]"
              />

              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--sb-muted)]">
                Workspace Settings
              </span>

            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Settings
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--sb-muted)]">
              Control how ISL Translator looks,
              sounds and works for you.
            </p>

          </div>

          <AnimatePresence mode="wait">

            {saved ? (
              <motion.div
                key="saved"
                initial={{
                  opacity: 0,
                  y: 8,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: -8,
                }}
                className="inline-flex w-fit items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-2.5 text-xs font-medium text-emerald-400 shadow-lg"
              >
                <FiCheck size={15} />
                All changes saved
              </motion.div>
            ) : (
              <motion.div
                key="normal"
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                className="inline-flex w-fit items-center gap-2 rounded-xl border border-[var(--sb-border)] bg-[var(--sb-surface)] px-4 py-2.5 text-xs text-[var(--sb-muted)] shadow-sm backdrop-blur-xl"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/30" />

                Preferences stored locally
              </motion.div>
            )}

          </AnimatePresence>

        </div>

        {/* =====================================================
            MAIN SETTINGS SHELL
        ===================================================== */}

        <div className="grid gap-5 lg:grid-cols-[250px_minmax(0,1fr)]">

          {/* ===================================================
              SETTINGS NAVIGATION
          =================================================== */}

          <aside className="h-fit rounded-3xl border border-[var(--sb-border)] bg-[var(--sb-surface)] p-3 shadow-xl shadow-black/5 backdrop-blur-xl lg:sticky lg:top-6">

            <div className="mb-3 px-3 py-3">

              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--sb-muted)]">
                Settings
              </p>

              <p className="mt-1 text-xs text-[var(--sb-muted)]">
                Manage your workspace
              </p>

            </div>

            <nav className="space-y-1">

              {navigation.map(
                (item) => {
                  const Icon =
                    item.icon;

                  const active =
                    activeSection ===
                    item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() =>
                        setActiveSection(
                          item.id
                        )
                      }
                      className={`group flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-all duration-200 ${
                        active
                          ? "bg-[var(--sb-primary)]/10 text-[var(--sb-text)] shadow-sm"
                          : "text-[var(--sb-muted)] hover:bg-black/[0.04] dark:hover:bg-white/[0.04]"
                      }`}
                    >

                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition ${
                          active
                            ? "border-[var(--sb-primary)]/30 bg-[var(--sb-primary)]/10 text-[var(--sb-primary)]"
                            : "border-[var(--sb-border)] bg-[var(--sb-surface)] text-[var(--sb-muted)]"
                        }`}
                      >
                        <Icon size={16} />
                      </span>

                      <span className="min-w-0 flex-1">

                        <span className="block text-sm font-medium">
                          {item.label}
                        </span>

                        <span className="mt-0.5 block text-[10px] text-[var(--sb-muted)]">
                          {item.description}
                        </span>

                      </span>

                      <FiChevronRight
                        size={14}
                        className={`transition-transform ${
                          active
                            ? "translate-x-0 text-[var(--sb-primary)]"
                            : "-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                        }`}
                      />

                    </button>
                  );
                }
              )}

            </nav>

            <div className="mt-4 border-t border-[var(--sb-border)] pt-4">

              <div className="rounded-2xl border border-emerald-400/10 bg-emerald-400/[0.03] p-3.5">

                <div className="mb-2 flex items-center gap-2">

                  <FiShield
                    size={14}
                    className="text-emerald-400"
                  />

                  <span className="text-xs font-medium text-[var(--sb-text)]">
                    Privacy protected
                  </span>

                </div>

                <p className="text-[10px] leading-4 text-[var(--sb-muted)]">
                  Your preferences stay on
                  this device.
                </p>

              </div>

            </div>

          </aside>

          {/* ===================================================
              CONTENT
          =================================================== */}

          <section className="min-w-0 overflow-hidden rounded-3xl border border-[var(--sb-border)] bg-[var(--sb-surface)] shadow-xl shadow-black/5 backdrop-blur-xl">

            <div className="border-b border-[var(--sb-border)] px-5 py-5 sm:px-7 lg:px-8">

              <div className="flex items-center justify-between gap-4">

                <div className="flex items-center gap-3">

                  {activeNavigation && (
                    <>
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--sb-primary)]/10 text-[var(--sb-primary)]">
                        {(() => {
                          const Icon =
                            activeNavigation.icon;

                          return (
                            <Icon
                              size={18}
                            />
                          );
                        })()}
                      </div>

                      <div>

                        <p className="text-sm font-semibold text-[var(--sb-text)]">
                          {
                            activeNavigation.label
                          }
                        </p>

                        <p className="text-xs text-[var(--sb-muted)]">
                          {
                            activeNavigation.description
                          }
                        </p>

                      </div>
                    </>
                  )}

                </div>

                <span className="hidden items-center gap-2 rounded-lg border border-[var(--sb-border)] bg-[var(--sb-bg)] px-2.5 py-1.5 text-[10px] text-[var(--sb-muted)] sm:flex">

                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                  Local settings

                </span>

              </div>

            </div>

            <div className="p-5 sm:p-7 lg:p-8">

              <AnimatePresence mode="wait">

                {/* =================================================
                    GENERAL
                ================================================= */}

                {activeSection ===
                  "general" && (
                  <motion.div
                    key="general"
                    initial={{
                      opacity: 0,
                      x: 12,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    exit={{
                      opacity: 0,
                      x: -12,
                    }}
                    transition={{
                      duration: 0.2,
                    }}
                  >

                    <SectionTitle
                      eyebrow="General"
                      title="Basic preferences"
                      description="Configure the language and general behavior of your ISL Translator workspace."
                    />

                    <SettingItem
                      icon={FiGlobe}
                      title="Interface language"
                      description="Language used across the application"
                    >
                      <select
                        value={
                          settings.language
                        }
                        onChange={(
                          event
                        ) =>
                          updateSetting(
                            "language",
                            event.target
                              .value
                          )
                        }
                        className="min-w-[145px] rounded-xl border border-[var(--sb-border)] bg-[var(--sb-bg)] px-3 py-2.5 text-xs text-[var(--sb-text)] outline-none transition focus:border-[var(--sb-primary)]"
                      >
                        <option value="en">
                          English
                        </option>

                        <option value="hi">
                          Hindi
                        </option>
                      </select>
                    </SettingItem>

                    <SettingItem
                      icon={FiMoon}
                      title="Dark mode"
                      description="Use the dark interface for a comfortable experience"
                    >
                      <Toggle
                        checked={
                          settings.darkMode
                        }
                        onChange={
                          handleDarkModeChange
                        }
                      />
                    </SettingItem>

                    <SettingItem
                      icon={FiInfo}
                      title="Application version"
                      description="Current ISL Translator application build"
                    >
                      <span className="rounded-lg border border-[var(--sb-border)] bg-[var(--sb-bg)] px-3 py-2 text-[11px] font-medium text-[var(--sb-muted)]">
                        v2.1.0
                      </span>
                    </SettingItem>

                    <div className="mt-8 grid gap-3 sm:grid-cols-2">

                      <div className="rounded-2xl border border-[var(--sb-border)] bg-[var(--sb-bg)]/40 p-4">

                        <p className="text-xs font-medium text-[var(--sb-text)]">
                          Current theme
                        </p>

                        <div className="mt-3 flex items-center gap-3">

                          <div
                            className={`h-8 w-8 rounded-lg bg-gradient-to-br ${selectedTheme.gradient}`}
                          />

                          <div>

                            <p className="text-sm text-[var(--sb-text)]">
                              {
                                selectedTheme.name
                              }
                            </p>

                            <p className="text-[10px] text-[var(--sb-muted)]">
                              {
                                selectedTheme.description
                              }
                            </p>

                          </div>

                        </div>

                      </div>

                      <div className="rounded-2xl border border-emerald-400/10 bg-emerald-400/[0.03] p-4">

                        <p className="text-xs font-medium text-[var(--sb-text)]">
                          Translation status
                        </p>

                        <div className="mt-3 flex items-center gap-2">

                          <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/30" />

                          <span className="text-sm text-[var(--sb-text)]">
                            Ready to translate
                          </span>

                        </div>

                      </div>

                    </div>

                  </motion.div>
                )}

                {/* =================================================
                    ACCOUNT
                ================================================= */}

                {activeSection ===
                  "account" && (
                  <motion.div
                    key="account"
                    initial={{
                      opacity: 0,
                      x: 12,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    exit={{
                      opacity: 0,
                      x: -12,
                    }}
                    transition={{
                      duration: 0.2,
                    }}
                  >

                    <SectionTitle
                      eyebrow="Account"
                      title="Your account"
                      description="Manage your profile, account information and recent session activity."
                    />

                    {/* =================================================
                        PROFILE HERO
                    ================================================= */}

                    <div className="relative mb-6 overflow-hidden rounded-3xl border border-[var(--sb-border)] bg-[var(--sb-bg)] shadow-lg">

                      <div
                        className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full blur-3xl"
                        style={{
                          background:
                            "color-mix(in srgb, var(--sb-primary) 12%, transparent)",
                        }}
                      />

                      <div className="relative p-5 sm:p-7">

                        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">

                          {/* Avatar */}

                          <div className="relative">

                            <div className="flex h-20 w-20 items-center justify-center rounded-[1.5rem] bg-gradient-to-br from-[var(--sb-primary)] via-[var(--sb-secondary)] to-[var(--sb-accent)] text-2xl font-bold text-slate-950 shadow-xl shadow-black/10">

                              {loadingUser ? (
                                <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-950/30 border-t-slate-950" />
                              ) : (
                                profileInitial
                              )}

                            </div>

                            <span className="absolute -bottom-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full border-4 border-[var(--sb-bg)] bg-emerald-400">

                              <FiCheck
                                size={11}
                                className="text-slate-950"
                              />

                            </span>

                          </div>

                          {/* User information */}

                          <div className="min-w-0 flex-1">

                            <div className="flex flex-wrap items-center gap-2">

                              <h3 className="text-xl font-bold tracking-tight text-[var(--sb-text)]">
                                {loadingUser
                                  ? "Loading..."
                                  : userName}
                              </h3>

                              <span
                                className={`rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider ${
                                  accountActive
                                    ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-400"
                                    : "border-red-400/20 bg-red-400/10 text-red-400"
                                }`}
                              >
                                {accountActive
                                  ? "Active"
                                  : "Inactive"}
                              </span>

                            </div>

                            <div className="mt-2 flex items-center gap-2 text-sm text-[var(--sb-muted)]">

                              <FiMail
                                size={14}
                              />

                              <span className="truncate">
                                {userEmail ||
                                  "Loading email..."}
                              </span>

                            </div>

                            <div className="mt-3 flex flex-wrap items-center gap-3">

                              <span className="inline-flex items-center gap-1.5 text-[10px] text-[var(--sb-muted)]">

                                <FiShield
                                  size={12}
                                  className="text-emerald-400"
                                />

                                Secure account

                              </span>

                              <span className="h-1 w-1 rounded-full bg-[var(--sb-muted)]/40" />

                              <span className="inline-flex items-center gap-1.5 text-[10px] text-[var(--sb-muted)]">

                                <FiCalendar
                                  size={12}
                                />

                                Joined{" "}
                                {memberSince ||
                                  "recently"}

                              </span>

                            </div>

                          </div>

                          {/* Edit */}

                          <button
                            type="button"
                            disabled={
                              loadingUser
                            }
                            onClick={
                              openEditProfile
                            }
                            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-[var(--sb-border)] bg-[var(--sb-surface)] px-4 py-2.5 text-xs font-semibold text-[var(--sb-text)] shadow-sm transition hover:border-[var(--sb-primary)]/30 hover:bg-[var(--sb-primary)]/5 hover:text-[var(--sb-primary)] disabled:cursor-not-allowed disabled:opacity-50"
                          >

                            <FiEdit3
                              size={14}
                            />

                            Edit Profile

                          </button>

                        </div>

                      </div>

                    </div>

                    {/* =================================================
                        ACCOUNT OVERVIEW
                    ================================================= */}

                    <div className="mb-8">

                      <div className="mb-4 flex items-center justify-between">

                        <div>

                          <p className="text-xs font-semibold text-[var(--sb-text)]">
                            Account overview
                          </p>

                          <p className="mt-1 text-[10px] text-[var(--sb-muted)]">
                            Your registered account information
                          </p>

                        </div>

                        <FiArrowUpRight
                          size={15}
                          className="text-[var(--sb-muted)]"
                        />

                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">

                        <AccountDetail
                          icon={FiUser}
                          label="User ID"
                          value={
                            userId !== null
                              ? `#${userId}`
                              : "—"
                          }
                        />

                        <AccountDetail
                          icon={FiCalendar}
                          label="Member since"
                          value={
                            memberSince ||
                            "—"
                          }
                        />

                        <AccountDetail
                          icon={FiMail}
                          label="Email address"
                          value={
                            userEmail ||
                            "—"
                          }
                        />

                        <AccountDetail
                          icon={FiActivity}
                          label="Account status"
                          value={
                            accountActive
                              ? "Active"
                              : "Inactive"
                          }
                          accent={
                            accountActive
                              ? "green"
                              : "red"
                          }
                        />

                      </div>

                    </div>

                    {/* =================================================
                        SESSION ACTIVITY
                    ================================================= */}

                    <div className="mb-8">

                      <div className="mb-4">

                        <p className="text-xs font-semibold text-[var(--sb-text)]">
                          Session activity
                        </p>

                        <p className="mt-1 text-[10px] text-[var(--sb-muted)]">
                          Recent authentication activity for this account
                        </p>

                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">

                        {/* LAST LOGIN */}

                        <div className="group relative overflow-hidden rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.035] p-5 transition hover:border-emerald-400/25">

                          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-emerald-400/5 blur-2xl" />

                          <div className="relative flex items-start gap-4">

                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-400">

                              <FiClock
                                size={18}
                              />

                            </div>

                            <div className="min-w-0">

                              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--sb-muted)]">
                                Last login
                              </p>

                              <p className="mt-2 text-sm font-semibold text-[var(--sb-text)]">
                                {lastLogin ||
                                  "No login recorded"}
                              </p>

                              <p className="mt-1 text-[10px] text-emerald-400">
                                Latest successful session
                              </p>

                            </div>

                          </div>

                        </div>

                        {/* LAST LOGOUT */}

                        <div className="group relative overflow-hidden rounded-2xl border border-red-400/15 bg-red-400/[0.035] p-5 transition hover:border-red-400/25">

                          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-red-400/5 blur-2xl" />

                          <div className="relative flex items-start gap-4">

                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-400/10 text-red-400">

                              <FiLogOut
                                size={18}
                              />

                            </div>

                            <div className="min-w-0">

                              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--sb-muted)]">
                                Last logout
                              </p>

                              <p className="mt-2 text-sm font-semibold text-[var(--sb-text)]">
                                {lastLogout ||
                                  "No logout recorded"}
                              </p>

                              <p className="mt-1 text-[10px] text-red-400">
                                Previous session ended
                              </p>

                            </div>

                          </div>

                        </div>

                      </div>

                    </div>

                    {/* =================================================
                        SECURITY
                    ================================================= */}

                    <div className="mb-6 overflow-hidden rounded-2xl border border-[var(--sb-border)] bg-[var(--sb-bg)]/40">

                      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">

                        <div className="flex items-center gap-4">

                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-400">

                            <FiLock
                              size={17}
                            />

                          </div>

                          <div>

                            <p className="text-sm font-semibold text-[var(--sb-text)]">
                              Account security
                            </p>

                            <p className="mt-1 text-xs text-[var(--sb-muted)]">
                              Authentication is protected with secure tokens.
                            </p>

                          </div>

                        </div>

                        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-[10px] font-semibold text-emerald-400">

                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                          Protected

                        </span>

                      </div>

                    </div>

                    {/* =================================================
                        LOGOUT
                    ================================================= */}

                    <div className="relative overflow-hidden rounded-2xl border border-red-400/15 bg-red-400/[0.035] p-5">

                      <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-red-400/5 blur-3xl" />

                      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                        <div className="flex items-center gap-4">

                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-400/10 text-red-400">

                            <FiLogOut
                              size={17}
                            />

                          </div>

                          <div>

                            <p className="text-sm font-semibold text-[var(--sb-text)]">
                              Sign out
                            </p>

                            <p className="mt-1 text-xs text-[var(--sb-muted)]">
                              End your current ISL Translator session.
                            </p>

                          </div>

                        </div>

                        <button
                          type="button"
                          disabled={
                            loggingOut
                          }
                          onClick={
                            handleLogout
                          }
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-2.5 text-xs font-semibold text-red-400 transition hover:bg-red-400/20 disabled:cursor-not-allowed disabled:opacity-60"
                        >

                          {loggingOut ? (
                            <>
                              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-red-400/30 border-t-red-400" />
                              Logging out...
                            </>
                          ) : (
                            <>
                              <FiLogOut
                                size={14}
                              />
                              Logout
                            </>
                          )}

                        </button>

                      </div>

                    </div>

                  </motion.div>
                )}

                {/* =================================================
                    APPEARANCE
                ================================================= */}

                {activeSection ===
                  "appearance" && (
                  <motion.div
                    key="appearance"
                    initial={{
                      opacity: 0,
                      x: 12,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    exit={{
                      opacity: 0,
                      x: -12,
                    }}
                    transition={{
                      duration: 0.2,
                    }}
                  >

                    <SectionTitle
                      eyebrow="Appearance"
                      title="Make it yours"
                      description="Choose the visual style that feels right for your ISL Translator experience."
                    />

                    <SettingItem
                      icon={FiMoon}
                      title="Dark mode"
                      description="Turn off dark mode to use the light interface"
                    >
                      <Toggle
                        checked={
                          settings.darkMode
                        }
                        onChange={
                          handleDarkModeChange
                        }
                      />
                    </SettingItem>

                    <div className="mt-7">

                      <div className="mb-4">

                        <p className="text-sm font-medium text-[var(--sb-text)]">
                          Color theme
                        </p>

                        <p className="mt-1 text-xs text-[var(--sb-muted)]">
                          Select an accent palette for the entire application.
                        </p>

                      </div>

                      <div className="grid gap-4 md:grid-cols-3">

                        {themes.map(
                          (theme) => {
                            const selected =
                              settings.theme ===
                              theme.id;

                            return (
                              <motion.button
                                key={
                                  theme.id
                                }
                                type="button"
                                whileHover={{
                                  y: -4,
                                }}
                                whileTap={{
                                  scale: 0.98,
                                }}
                                onClick={() =>
                                  handleThemeChange(
                                    theme.id
                                  )
                                }
                                className={`relative overflow-hidden rounded-2xl border p-3 text-left transition-all duration-300 ${
                                  selected
                                    ? `${theme.border} bg-black/[0.06] dark:bg-white/[0.07]`
                                    : "border-[var(--sb-border)] bg-[var(--sb-surface)] hover:bg-black/[0.04] dark:hover:bg-white/[0.05]"
                                }`}
                              >

                                <div
                                  className={`relative h-24 overflow-hidden rounded-xl bg-gradient-to-br ${theme.gradient}`}
                                >

                                  <div className="absolute inset-0 bg-black/10" />

                                  <div className="absolute left-3 right-3 top-3 rounded-lg border border-white/20 bg-white/10 p-2 backdrop-blur-md">

                                    <div className="flex gap-1.5">

                                      <span className="h-1.5 w-1.5 rounded-full bg-white/80" />

                                      <span className="h-1.5 w-1.5 rounded-full bg-white/50" />

                                      <span className="h-1.5 w-1.5 rounded-full bg-white/30" />

                                    </div>

                                    <div className="mt-4 h-1.5 w-2/3 rounded-full bg-white/40" />

                                    <div className="mt-2 h-1.5 w-1/2 rounded-full bg-white/20" />

                                  </div>

                                </div>

                                <div className="mt-4 flex items-center justify-between">

                                  <div>

                                    <p className="text-sm font-semibold text-[var(--sb-text)]">
                                      {
                                        theme.name
                                      }
                                    </p>

                                    <p className="mt-1 text-[10px] text-[var(--sb-muted)]">
                                      {
                                        theme.description
                                      }
                                    </p>

                                  </div>

                                  {selected && (
                                    <span
                                      className={`flex h-7 w-7 items-center justify-center rounded-full ${theme.primary} text-slate-950`}
                                    >
                                      <FiCheck
                                        size={
                                          14
                                        }
                                      />
                                    </span>
                                  )}

                                </div>

                              </motion.button>
                            );
                          }
                        )}

                      </div>

                    </div>

                    <div className="mt-8 rounded-2xl border border-[var(--sb-border)] bg-[var(--sb-bg)]/40 p-5">

                      <div className="mb-4 flex items-center justify-between">

                        <div>

                          <p className="text-sm font-medium text-[var(--sb-text)]">
                            Live preview
                          </p>

                          <p className="mt-1 text-[10px] text-[var(--sb-muted)]">
                            Preview of your selected palette
                          </p>

                        </div>

                        <span
                          className={`rounded-lg px-2.5 py-1 text-[10px] font-medium ${selectedTheme.soft} ${selectedTheme.text}`}
                        >
                          {
                            selectedTheme.name
                          }
                        </span>

                      </div>

                      <div className="rounded-xl border border-[var(--sb-border)] bg-[var(--sb-bg)] p-4">

                        <div className="flex items-center gap-3">

                          <div
                            className={`h-10 w-10 rounded-xl bg-gradient-to-br ${selectedTheme.gradient}`}
                          />

                          <div className="flex-1">

                            <div className="h-2 w-32 rounded-full bg-black/10 dark:bg-white/10" />

                            <div className="mt-2 h-1.5 w-20 rounded-full bg-black/5 dark:bg-white/5" />

                          </div>

                          <div
                            className={`rounded-lg px-3 py-2 text-[10px] font-semibold ${selectedTheme.primary} text-slate-950`}
                          >
                            Active
                          </div>

                        </div>

                      </div>

                    </div>

                  </motion.div>
                )}

                {/* =================================================
                    TRANSLATION
                ================================================= */}

                {activeSection ===
                  "translation" && (
                  <motion.div
                    key="translation"
                    initial={{
                      opacity: 0,
                      x: 12,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    exit={{
                      opacity: 0,
                      x: -12,
                    }}
                    transition={{
                      duration: 0.2,
                    }}
                  >

                    <SectionTitle
                      eyebrow="Translation"
                      title="Translation controls"
                      description="Configure the camera and speech behavior used by the translator."
                    />

                    <SettingItem
                      icon={FiCamera}
                      title="Camera quality"
                      description="Video quality used during sign recognition"
                    >
                      <select
                        value={
                          settings.cameraQuality
                        }
                        onChange={(
                          event
                        ) =>
                          updateSetting(
                            "cameraQuality",
                            event.target
                              .value as AppSettings["cameraQuality"]
                          )
                        }
                        className="min-w-[150px] rounded-xl border border-[var(--sb-border)] bg-[var(--sb-bg)] px-3 py-2.5 text-xs text-[var(--sb-text)] outline-none focus:border-[var(--sb-primary)]"
                      >
                        <option value="low">
                          Low — 480p
                        </option>

                        <option value="medium">
                          Medium — 720p
                        </option>

                        <option value="high">
                          High — 1080p
                        </option>
                      </select>
                    </SettingItem>

                    <SettingItem
                      icon={FiMic}
                      title="Speech output"
                      description="Automatically speak recognized signs"
                    >
                      <Toggle
                        checked={
                          settings.speechEnabled
                        }
                        onChange={(
                          value
                        ) =>
                          updateSetting(
                            "speechEnabled",
                            value
                          )
                        }
                      />
                    </SettingItem>

                    <div className="border-b border-[var(--sb-border)] py-6">

                      <div className="mb-4 flex items-center justify-between gap-4">

                        <div className="flex items-center gap-4">

                          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--sb-border)] bg-[var(--sb-surface)]">

                            <FiVolume2
                              size={17}
                              className="text-[var(--sb-muted)]"
                            />

                          </div>

                          <div>

                            <p className="text-sm font-medium text-[var(--sb-text)]">
                              Speech rate
                            </p>

                            <p className="mt-1 text-xs text-[var(--sb-muted)]">
                              Adjust how quickly speech is played
                            </p>

                          </div>

                        </div>

                        <span className="rounded-lg border border-[var(--sb-primary)]/20 bg-[var(--sb-primary)]/10 px-3 py-1.5 text-[11px] font-semibold text-[var(--sb-primary)]">
                          {settings.speechRate.toFixed(
                            1
                          )}
                          x
                        </span>

                      </div>

                      <input
                        type="range"
                        min="0.5"
                        max="2"
                        step="0.1"
                        value={
                          settings.speechRate
                        }
                        onChange={(
                          event
                        ) =>
                          updateSetting(
                            "speechRate",
                            Number(
                              event.target
                                .value
                            )
                          )
                        }
                        className="w-full"
                        style={{
                          accentColor:
                            "var(--sb-primary)",
                        }}
                      />

                      <div className="mt-2 flex justify-between text-[10px] text-[var(--sb-muted)]">
                        <span>
                          Slow
                        </span>
                        <span>
                          Normal
                        </span>
                        <span>
                          Fast
                        </span>
                      </div>

                    </div>

                    <div className="py-6">

                      <div className="mb-4 flex items-center justify-between gap-4">

                        <div className="flex items-center gap-4">

                          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--sb-border)] bg-[var(--sb-surface)]">

                            <FiMonitor
                              size={17}
                              className="text-[var(--sb-muted)]"
                            />

                          </div>

                          <div>

                            <p className="text-sm font-medium text-[var(--sb-text)]">
                              Speech pitch
                            </p>

                            <p className="mt-1 text-xs text-[var(--sb-muted)]">
                              Adjust the voice pitch
                            </p>

                          </div>

                        </div>

                        <span className="rounded-lg border border-[var(--sb-accent)]/20 bg-[var(--sb-accent)]/10 px-3 py-1.5 text-[11px] font-semibold text-[var(--sb-accent)]">
                          {settings.speechPitch.toFixed(
                            1
                          )}
                          x
                        </span>

                      </div>

                      <input
                        type="range"
                        min="0.5"
                        max="2"
                        step="0.1"
                        value={
                          settings.speechPitch
                        }
                        onChange={(
                          event
                        ) =>
                          updateSetting(
                            "speechPitch",
                            Number(
                              event.target
                                .value
                            )
                          )
                        }
                        className="w-full"
                        style={{
                          accentColor:
                            "var(--sb-accent)",
                        }}
                      />

                      <div className="mt-2 flex justify-between text-[10px] text-[var(--sb-muted)]">
                        <span>
                          Low
                        </span>
                        <span>
                          Normal
                        </span>
                        <span>
                          High
                        </span>
                      </div>

                    </div>

                  </motion.div>
                )}

                {/* =================================================
                    NOTIFICATIONS
                ================================================= */}

                {activeSection ===
                  "notifications" && (
                  <motion.div
                    key="notifications"
                    initial={{
                      opacity: 0,
                      x: 12,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    exit={{
                      opacity: 0,
                      x: -12,
                    }}
                    transition={{
                      duration: 0.2,
                    }}
                  >

                    <SectionTitle
                      eyebrow="Notifications"
                      title="Stay informed"
                      description="Choose when ISL Translator should notify you about activity and results."
                    />

                    <SettingItem
                      icon={FiBell}
                      title="Notifications"
                      description="Receive application notifications and updates"
                    >
                      <Toggle
                        checked={
                          settings.notifications
                        }
                        onChange={(
                          value
                        ) =>
                          updateSetting(
                            "notifications",
                            value
                          )
                        }
                      />
                    </SettingItem>

                    <div className="mt-7 grid gap-3 sm:grid-cols-2">

                      <div
                        className={`rounded-2xl border p-5 transition ${
                          settings.notifications
                            ? "border-emerald-400/20 bg-emerald-400/5"
                            : "border-[var(--sb-border)] bg-[var(--sb-surface)]"
                        }`}
                      >

                        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--sb-surface)]">

                          <FiBell
                            size={17}
                            className={
                              settings.notifications
                                ? "text-emerald-400"
                                : "text-[var(--sb-muted)]"
                            }
                          />

                        </div>

                        <p className="text-sm font-medium text-[var(--sb-text)]">
                          Translation updates
                        </p>

                        <p className="mt-1 text-xs leading-5 text-[var(--sb-muted)]">
                          Get notified when a translation is completed.
                        </p>

                      </div>

                      <div
                        className={`rounded-2xl border p-5 transition ${
                          settings.notifications
                            ? "border-[var(--sb-secondary)]/20 bg-[var(--sb-secondary)]/5"
                            : "border-[var(--sb-border)] bg-[var(--sb-surface)]"
                        }`}
                      >

                        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--sb-surface)]">

                          <FiSettings
                            size={17}
                            className={
                              settings.notifications
                                ? "text-[var(--sb-secondary)]"
                                : "text-[var(--sb-muted)]"
                            }
                          />

                        </div>

                        <p className="text-sm font-medium text-[var(--sb-text)]">
                          System updates
                        </p>

                        <p className="mt-1 text-xs leading-5 text-[var(--sb-muted)]">
                          Receive important application information.
                        </p>

                      </div>

                    </div>

                  </motion.div>
                )}

              </AnimatePresence>

              {/* ===================================================
                  BOTTOM ACTIONS
              =================================================== */}

              <div className="mt-10 flex flex-col gap-3 border-t border-[var(--sb-border)] pt-6 sm:flex-row sm:items-center sm:justify-between">

                <button
                  type="button"
                  onClick={
                    handleReset
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--sb-border)] bg-[var(--sb-surface)] px-4 py-2.5 text-xs font-medium text-[var(--sb-muted)] transition hover:border-[var(--sb-primary)]/20 hover:text-[var(--sb-text)]"
                >
                  <FiRotateCcw
                    size={14}
                  />

                  Reset defaults
                </button>

                <motion.button
                  type="button"
                  whileHover={{
                    scale: 1.015,
                  }}
                  whileTap={{
                    scale: 0.98,
                  }}
                  onClick={
                    handleSave
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold text-slate-950 shadow-lg transition"
                  style={{
                    backgroundColor:
                      saved
                        ? "#34d399"
                        : "var(--sb-primary)",
                    boxShadow:
                      saved
                        ? "0 10px 30px rgba(52,211,179,.15)"
                        : "0 10px 30px color-mix(in srgb, var(--sb-primary) 15%, transparent)",
                  }}
                >

                  {saved ? (
                    <>
                      <FiCheck
                        size={15}
                      />
                      Saved
                    </>
                  ) : (
                    <>
                      <FiSave
                        size={15}
                      />
                      Save changes
                    </>
                  )}

                </motion.button>

              </div>

            </div>

          </section>

        </div>

      </div>

      {/* =======================================================
          EDIT PROFILE MODAL
      ======================================================= */}

      <AnimatePresence>

        {isEditProfileOpen && (
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md"
            onClick={() => {
              if (!profileSaving) {
                setIsEditProfileOpen(
                  false
                );
              }
            }}
          >

            <motion.div
              initial={{
                opacity: 0,
                scale: 0.94,
                y: 20,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.94,
                y: 20,
              }}
              transition={{
                duration: 0.2,
              }}
              onClick={(event) =>
                event.stopPropagation()
              }
              className="w-full max-w-md overflow-hidden rounded-3xl border border-[var(--sb-border)] bg-[var(--sb-bg)] shadow-2xl"
            >

              {/* Modal header */}

              <div className="relative overflow-hidden border-b border-[var(--sb-border)] px-6 py-5">

                <div
                  className="absolute -right-10 -top-10 h-28 w-28 rounded-full blur-3xl"
                  style={{
                    background:
                      "color-mix(in srgb, var(--sb-primary) 12%, transparent)",
                  }}
                />

                <div className="relative flex items-center justify-between">

                  <div>

                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--sb-primary)]">
                      Account
                    </p>

                    <h3 className="mt-1 text-xl font-semibold text-[var(--sb-text)]">
                      Edit Profile
                    </h3>

                    <p className="mt-1 text-xs text-[var(--sb-muted)]">
                      Update your display name
                    </p>

                  </div>

                  <button
                    type="button"
                    disabled={
                      profileSaving
                    }
                    onClick={() =>
                      setIsEditProfileOpen(
                        false
                      )
                    }
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--sb-border)] bg-[var(--sb-surface)] text-[var(--sb-muted)] transition hover:border-[var(--sb-primary)]/20 hover:text-[var(--sb-text)] disabled:opacity-50"
                  >
                    <FiX
                      size={16}
                    />
                  </button>

                </div>

              </div>

              {/* Modal body */}

              <div className="space-y-5 p-6">

                {/* Avatar */}

                <div className="flex items-center gap-4 rounded-2xl border border-[var(--sb-border)] bg-[var(--sb-surface)] p-4">

                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--sb-primary)] to-[var(--sb-secondary)] text-lg font-bold text-slate-950">

                    {editFullName
                      .charAt(0)
                      .toUpperCase() ||
                      "U"}

                  </div>

                  <div>

                    <p className="text-sm font-semibold text-[var(--sb-text)]">
                      Profile name
                    </p>

                    <p className="mt-1 text-[10px] text-[var(--sb-muted)]">
                      This name appears across your account.
                    </p>

                  </div>

                </div>

                {/* Full name */}

                <div>

                  <label className="mb-2 block text-xs font-medium text-[var(--sb-text)]">
                    Full Name
                  </label>

                  <div className="relative">

                    <FiUser
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--sb-muted)]"
                    />

                    <input
                      type="text"
                      value={
                        editFullName
                      }
                      onChange={(
                        event
                      ) =>
                        setEditFullName(
                          event.target
                            .value
                        )
                      }
                      placeholder="Enter your full name"
                      disabled={
                        profileSaving
                      }
                      className="w-full rounded-xl border border-[var(--sb-border)] bg-[var(--sb-surface)] py-3 pl-10 pr-3 text-sm text-[var(--sb-text)] outline-none transition placeholder:text-[var(--sb-muted)] focus:border-[var(--sb-primary)] disabled:opacity-60"
                    />

                  </div>

                </div>

                {/* Email */}

                <div>

                  <label className="mb-2 block text-xs font-medium text-[var(--sb-text)]">
                    Email
                  </label>

                  <div className="relative">

                    <FiMail
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--sb-muted)]"
                    />

                    <input
                      type="email"
                      value={
                        userEmail
                      }
                      readOnly
                      className="w-full cursor-not-allowed rounded-xl border border-[var(--sb-border)] bg-black/[0.03] py-3 pl-10 pr-3 text-sm text-[var(--sb-muted)] outline-none dark:bg-white/[0.03]"
                    />

                  </div>

                  <p className="mt-2 text-[10px] text-[var(--sb-muted)]">
                    Email cannot be changed from Settings.
                  </p>

                </div>

                {/* Error */}

                {profileMessage && (
                  <div className="rounded-xl border border-red-400/20 bg-red-400/5 px-3 py-2.5 text-xs text-red-400">
                    {profileMessage}
                  </div>
                )}

              </div>

              {/* Modal footer */}

              <div className="flex items-center justify-end gap-3 border-t border-[var(--sb-border)] px-6 py-5">

                <button
                  type="button"
                  disabled={
                    profileSaving
                  }
                  onClick={() =>
                    setIsEditProfileOpen(
                      false
                    )
                  }
                  className="rounded-xl border border-[var(--sb-border)] bg-[var(--sb-surface)] px-4 py-2.5 text-xs font-medium text-[var(--sb-muted)] transition hover:text-[var(--sb-text)] disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={
                    profileSaving
                  }
                  onClick={
                    handleUpdateProfile
                  }
                  className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold text-slate-950 shadow-lg transition disabled:cursor-not-allowed disabled:opacity-60"
                  style={{
                    backgroundColor:
                      "var(--sb-primary)",
                  }}
                >

                  {profileSaving ? (
                    <>
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-950/30 border-t-slate-950" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FiCheck
                        size={14}
                      />
                      Save Changes
                    </>
                  )}

                </button>

              </div>

            </motion.div>

          </motion.div>
        )}

      </AnimatePresence>

    </motion.main>
  );
}