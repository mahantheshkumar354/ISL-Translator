import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import {
  FiHome,
  FiActivity,
  FiCamera,
  FiType,
  FiMic,
  FiBookOpen,
  FiClock,
  FiInfo,
  FiSettings,
  FiChevronLeft,
  FiChevronRight,
  FiX,
  FiZap,
  FiUser,
} from "react-icons/fi";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onCollapsedChange?: (collapsed: boolean) => void;
}

const navGroups = [
  {
    title: "MAIN",
    items: [
      {
        id: "home",
        label: "Home",
        path: "/home",
        icon: FiHome,
        description: "Overview",
      },
    ],
  },

  {
    title: "TRANSLATE",
    items: [
      {
        id: "sign-to-text",
        label: "Sign to Text",
        path: "/sign-to-text",
        icon: FiCamera,
        description: "Gesture recognition",
      },
      {
        id: "text-to-sign",
        label: "Text to Sign",
        path: "/text-to-sign",
        icon: FiType,
        description: "Text translation",
      },
      {
        id: "speech-to-sign",
        label: "Speech to Sign",
        path: "/speech-to-sign",
        icon: FiMic,
        description: "Voice translation",
      },
    ],
  },

  {
    title: "EXPLORE",
    items: [
      {
        id: "learning-hub",
        label: "Learning Hub",
        path: "/learning-hub",
        icon: FiBookOpen,
        description: "Learn ISL",
      },
      {
        id: "history",
        label: "History",
        path: "/history",
        icon: FiClock,
        description: "Past translations",
      },
      {
        id: "about",
        label: "About",
        path: "/about",
        icon: FiInfo,
        description: "About SignBridge",
      },
    ],
  },

  {
    title: "SYSTEM",
    items: [
      {
        id: "dashboard",
        label: "Dashboard",
        path: "/dashboard",
        icon: FiActivity,
        description: "Analytics",
      },
      {
        id: "settings",
        label: "Settings",
        path: "/settings",
        icon: FiSettings,
        description: "Preferences",
      },
    ],
  },
];

export default function Sidebar({
  isOpen,
  onClose,
  onCollapsedChange,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const [userEmail, setUserEmail] = useState("");

  /* =====================================================
     SIDEBAR COLLAPSE SYNC
  ====================================================== */

  const updateCollapsed = (value: boolean) => {
    setCollapsed(value);
    onCollapsedChange?.(value);
  };

  /* =====================================================
     RESPONSIVE BEHAVIOR
  ====================================================== */

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setCollapsed(false);
        onCollapsedChange?.(false);
      }
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [onCollapsedChange]);

  /* =====================================================
     FETCH LOGGED-IN USER
  ====================================================== */

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:8000/api/v1/auth/me",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          return;
        }

        const user = await response.json();

        setUserEmail(user.email || "");
      } catch (error) {
        console.error(
          "Failed to load account information:",
          error
        );
      }
    };

    fetchUser();
  }, []);

  /* =====================================================
     MOBILE NAVIGATION
  ====================================================== */

  const handleNavigation = () => {
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  /* =====================================================
     SIDEBAR CONTENT
  ====================================================== */

  const sidebarContent = (
    <div className="h-full flex flex-col">

      {/* =====================================================
          DESKTOP HEADER
      ====================================================== */}

      <div
        className="
          hidden
          lg:flex
          items-center
          justify-between
          px-4
          py-4
          border-b
          border-[var(--sb-border)]
        "
      >
        {!collapsed && (
          <motion.div
            initial={{
              opacity: 0,
              x: -10,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            className="flex items-center gap-3"
          >
            <motion.div
              whileHover={{
                scale: 1.05,
                rotate: 2,
              }}
              className="
                relative
                w-9
                h-9
                rounded-xl
                flex
                items-center
                justify-center
                overflow-hidden
              "
              style={{
                background:
                  "linear-gradient(135deg, var(--sb-primary), var(--sb-accent))",
                boxShadow:
                  "0 8px 25px color-mix(in srgb, var(--sb-primary) 18%, transparent)",
              }}
            >
              <div className="absolute inset-0 bg-white/10" />

              <span className="relative text-white font-bold text-xs">
                ISL
              </span>
            </motion.div>

            <div>
              <h2
                className="
                  text-sm
                  font-bold
                  bg-clip-text
                  text-transparent
                "
                style={{
                  backgroundImage:
                    "linear-gradient(90deg, var(--sb-primary), var(--sb-secondary), var(--sb-accent))",
                }}
              >
                ISL Translator
              </h2>

              <p className="text-[9px] text-[var(--sb-muted)]">
                AI Translation Platform
              </p>
            </div>
          </motion.div>
        )}

        {/* Collapse Button */}
        <motion.button
          whileHover={{
            scale: 1.08,
          }}
          whileTap={{
            scale: 0.92,
          }}
          onClick={() => updateCollapsed(!collapsed)}
          className="
            p-2
            rounded-xl
            border
            border-[var(--sb-border)]
            bg-[var(--sb-card)]
            text-[var(--sb-muted)]
            hover:text-[var(--sb-text)]
            hover:bg-white/10
            transition-all
          "
          aria-label="Toggle sidebar"
        >
          {collapsed ? (
            <FiChevronRight size={16} />
          ) : (
            <FiChevronLeft size={16} />
          )}
        </motion.button>
      </div>

      {/* =====================================================
          MOBILE HEADER
      ====================================================== */}

      <div
        className="
          lg:hidden
          flex
          items-center
          justify-between
          px-4
          py-4
          border-b
          border-[var(--sb-border)]
        "
      >
        <div className="flex items-center gap-3">

          <div
            className="
              w-9
              h-9
              rounded-xl
              flex
              items-center
              justify-center
            "
            style={{
              background:
                "linear-gradient(135deg, var(--sb-primary), var(--sb-accent))",
            }}
          >
            <span className="text-white font-bold text-xs">
              ISL
            </span>
          </div>

          <div>
            <h2
              className="
                text-sm
                font-bold
                bg-clip-text
                text-transparent
              "
              style={{
                backgroundImage:
                  "linear-gradient(90deg, var(--sb-primary), var(--sb-accent))",
              }}
            >
              ISL Translator
            </h2>

            <p className="text-[9px] text-[var(--sb-muted)]">
              AI Translation Platform
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="
            p-2
            rounded-xl
            border
            border-[var(--sb-border)]
            bg-[var(--sb-card)]
            text-[var(--sb-muted)]
            hover:text-[var(--sb-text)]
            hover:bg-white/10
            transition-all
          "
          aria-label="Close menu"
        >
          <FiX size={18} />
        </button>
      </div>

      {/* =====================================================
          NAVIGATION
      ====================================================== */}

      <nav className="flex-1 py-5 px-3 overflow-y-auto">

        {navGroups.map((group, groupIndex) => (
          <div
            key={group.title}
            className={
              groupIndex === 0
                ? ""
                : "mt-6"
            }
          >

            {/* Group title */}

            {!collapsed ? (
              <div className="px-3 mb-2 flex items-center gap-2">

                <span
                  className="
                    text-[9px]
                    font-bold
                    tracking-[0.18em]
                    text-[var(--sb-muted)]
                  "
                >
                  {group.title}
                </span>

                <div className="h-px flex-1 bg-[var(--sb-border)]" />
              </div>
            ) : (
              <div className="h-px mx-2 mb-3 bg-[var(--sb-border)]" />
            )}

            <div className="space-y-1.5">

              {group.items.map((item, index) => {
                const Icon = item.icon;

                const isActive =
                  location.pathname === item.path;

                return (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    onClick={handleNavigation}
                    className="block"
                  >
                    <motion.div
                      initial={{
                        opacity: 0,
                        x: -12,
                      }}
                      animate={{
                        opacity: 1,
                        x: 0,
                      }}
                      transition={{
                        delay:
                          groupIndex * 0.04 +
                          index * 0.025,
                      }}
                      whileHover={{
                        x: collapsed ? 0 : 3,
                      }}
                      className={`
                        relative
                        flex
                        items-center
                        gap-3
                        px-3
                        py-2.5
                        rounded-2xl
                        border
                        transition-all
                        duration-200
                        group
                        overflow-hidden

                        ${
                          isActive
                            ? `
                              border-[var(--sb-primary)]/20
                              bg-[var(--sb-primary)]/[0.09]
                              shadow-lg
                            `
                            : `
                              border-transparent
                              hover:border-[var(--sb-border)]
                              hover:bg-white/[0.035]
                            `
                        }
                      `}
                    >

                      {/* Active glow */}

                      {isActive && (
                        <motion.div
                          layoutId="sidebarActiveGlow"
                          className="
                            absolute
                            inset-0
                            pointer-events-none
                          "
                          style={{
                            background:
                              "linear-gradient(90deg, color-mix(in srgb, var(--sb-primary) 9%, transparent), transparent)",
                          }}
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 30,
                          }}
                        />
                      )}

                      {/* Active left indicator */}

                      {isActive && (
                        <motion.div
                          layoutId="activeSidebarIndicator"
                          className="
                            absolute
                            left-0
                            top-1/2
                            -translate-y-1/2
                            w-1
                            h-7
                            rounded-r-full
                          "
                          style={{
                            background:
                              "linear-gradient(to bottom, var(--sb-primary), var(--sb-accent))",
                            boxShadow:
                              "0 0 12px color-mix(in srgb, var(--sb-primary) 65%, transparent)",
                          }}
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 30,
                          }}
                        />
                      )}

                      {/* Icon container */}

                      <div
                        className={`
                          relative
                          shrink-0
                          w-9
                          h-9
                          rounded-xl
                          flex
                          items-center
                          justify-center
                          transition-all
                          duration-200

                          ${
                            isActive
                              ? "bg-[var(--sb-primary)]/15"
                              : "bg-white/[0.035] group-hover:bg-white/[0.07]"
                          }
                        `}
                      >
                        <Icon
                          size={18}
                          className={`
                            transition-all
                            duration-200

                            ${
                              isActive
                                ? "text-[var(--sb-primary)]"
                                : "text-[var(--sb-muted)] group-hover:text-[var(--sb-text)]"
                            }
                          `}
                        />

                        {isActive && (
                          <div
                            className="
                              absolute
                              inset-0
                              rounded-xl
                              opacity-30
                              blur-md
                            "
                            style={{
                              backgroundColor:
                                "var(--sb-primary)",
                            }}
                          />
                        )}
                      </div>

                      {/* Text */}

                      <AnimatePresence mode="wait">
                        {!collapsed && (
                          <motion.div
                            initial={{
                              opacity: 0,
                              width: 0,
                            }}
                            animate={{
                              opacity: 1,
                              width: "auto",
                            }}
                            exit={{
                              opacity: 0,
                              width: 0,
                            }}
                            className="
                              relative
                              min-w-0
                              flex-1
                              overflow-hidden
                            "
                          >
                            <p
                              className={`
                                text-sm
                                font-semibold
                                whitespace-nowrap
                                ${
                                  isActive
                                    ? "text-[var(--sb-text)]"
                                    : "text-[var(--sb-text)]/75"
                                }
                              `}
                            >
                              {item.label}
                            </p>

                            <p
                              className="
                                text-[9px]
                                mt-0.5
                                whitespace-nowrap
                                text-[var(--sb-muted)]
                              "
                            >
                              {item.description}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Active arrow */}

                      {!collapsed && isActive && (
                        <motion.div
                          initial={{
                            opacity: 0,
                            x: -5,
                          }}
                          animate={{
                            opacity: 1,
                            x: 0,
                          }}
                        >
                          <FiChevronRight
                            size={14}
                            style={{
                              color:
                                "var(--sb-primary)",
                            }}
                          />
                        </motion.div>
                      )}

                      {/* Collapsed tooltip */}

                      {collapsed && (
                        <div
                          className="
                            absolute
                            left-full
                            ml-3
                            px-3
                            py-2
                            rounded-xl
                            border
                            border-[var(--sb-border)]
                            bg-[var(--sb-bg)]
                            text-xs
                            font-medium
                            whitespace-nowrap
                            opacity-0
                            group-hover:opacity-100
                            transition-opacity
                            pointer-events-none
                            z-[100]
                            shadow-xl
                          "
                        >
                          <p className="text-[var(--sb-text)]">
                            {item.label}
                          </p>

                          <p className="text-[9px] text-[var(--sb-muted)] mt-0.5">
                            {item.description}
                          </p>
                        </div>
                      )}

                    </motion.div>
                  </NavLink>
                );
              })}

            </div>
          </div>
        ))}

      </nav>

      {/* =====================================================
          ACCOUNT + AI MODEL STATUS
      ====================================================== */}

      <div
        className={`
          px-3
          pb-4
          ${
            collapsed
              ? "lg:flex lg:justify-center"
              : ""
          }
        `}
      >

        {/* ACCOUNT */}

        {!collapsed && (
          <div className="mb-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">

            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan-500/10">
                <FiUser className="text-cyan-400" />
              </div>

              <div className="min-w-0">

                <p className="text-[10px] uppercase tracking-wider text-gray-500">
                  Account
                </p>

                <p
                  className="truncate text-sm font-medium text-white"
                  title={userEmail}
                >
                  {userEmail || "Loading..."}
                </p>

              </div>

            </div>

          </div>
        )}

        {/* AI MODEL STATUS */}

        <motion.div
          whileHover={{
            y: -2,
          }}
          className={`
            relative
            overflow-hidden
            rounded-2xl
            border
            border-[var(--sb-border)]
            bg-[var(--sb-card)]
            backdrop-blur-xl
            transition-all

            ${
              collapsed
                ? "w-11 h-11 flex items-center justify-center"
                : "p-3"
            }
          `}
        >

          {/* Background glow */}

          <div
            className="
              absolute
              -right-8
              -top-8
              w-20
              h-20
              rounded-full
              blur-2xl
              opacity-20
            "
            style={{
              backgroundColor:
                "var(--sb-primary)",
            }}
          />

          {!collapsed ? (
            <div className="relative">

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-3">

                  {/* AI Icon */}

                  <div
                    className="
                      w-9
                      h-9
                      rounded-xl
                      flex
                      items-center
                      justify-center
                    "
                    style={{
                      background:
                        "color-mix(in srgb, var(--sb-primary) 12%, transparent)",
                    }}
                  >
                    <FiZap
                      size={17}
                      style={{
                        color:
                          "var(--sb-primary)",
                      }}
                    />
                  </div>

                  <div>

                    <p className="text-xs font-semibold text-[var(--sb-text)]">
                      AI Model Active
                    </p>

                    <div className="flex items-center gap-1.5 mt-1">

                      <span
                        className="
                          w-1.5
                          h-1.5
                          rounded-full
                          bg-emerald-400
                        "
                      />

                      <span className="text-[9px] text-[var(--sb-muted)]">
                        Online
                      </span>

                    </div>

                  </div>

                </div>

              </div>

              {/* Model information */}

              <div
                className="
                  mt-3
                  pt-3
                  border-t
                  border-[var(--sb-border)]
                  flex
                  items-center
                  justify-between
                "
              >
                <span className="text-[9px] text-[var(--sb-muted)]">
                  ISL-Transformer
                </span>

                <span
                  className="text-[9px] font-semibold"
                  style={{
                    color:
                      "var(--sb-primary)",
                  }}
                >
                  v2.1.0
                </span>
              </div>

            </div>
          ) : (
            <div className="relative">

              <FiZap
                size={18}
                style={{
                  color:
                    "var(--sb-primary)",
                }}
              />

              <span
                className="
                  absolute
                  -top-1
                  -right-1
                  w-2
                  h-2
                  rounded-full
                  bg-emerald-400
                  border-2
                  border-[var(--sb-bg)]
                "
              />

            </div>
          )}

        </motion.div>

      </div>

    </div>
  );

  /* =====================================================
     DESKTOP SIDEBAR
  ====================================================== */

  return (
    <>
      <motion.aside
        initial={false}
        animate={{
          width: collapsed ? 82 : 270,
          x: 0,
        }}
        transition={{
          type: "spring",
          stiffness: 220,
          damping: 28,
          mass: 0.8,
        }}
        className="
          fixed
          left-0
          top-16
          bottom-0
          z-40
          hidden
          lg:block
          border-r
          border-[var(--sb-border)]
          bg-[var(--sb-bg)]
          backdrop-blur-2xl
          transition-colors
          duration-500
        "
      >
        {sidebarContent}
      </motion.aside>

      {/* =====================================================
          MOBILE SIDEBAR
      ====================================================== */}

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}

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
              onClick={onClose}
              className="
                fixed
                inset-0
                bg-black/60
                backdrop-blur-md
                z-40
                lg:hidden
              "
            />

            {/* Mobile Sidebar */}

            <motion.aside
              initial={{
                x: -300,
              }}
              animate={{
                x: 0,
              }}
              exit={{
                x: -300,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
              className="
                fixed
                left-0
                top-0
                bottom-0
                w-[285px]
                z-50
                lg:hidden
                border-r
                border-[var(--sb-border)]
                bg-[var(--sb-bg)]
                backdrop-blur-2xl
              "
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}