import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiMenu,
  FiBell,
  FiSettings,
  FiUser,
  FiX,
  FiCheckCircle,
  FiAlertCircle,
  FiInfo,
} from "react-icons/fi";
import { Link } from "react-router-dom";

interface NavbarProps {
  onMenuClick: () => void;
}

const notifications = [
  {
    id: "1",
    message: "Model updated to v2.1.0",
    type: "success",
    time: "2 min ago",
  },
  {
    id: "2",
    message: "Camera calibration recommended",
    type: "warning",
    time: "1 hour ago",
  },
  {
    id: "3",
    message: "New signs added to Learning Hub",
    type: "info",
    time: "3 hours ago",
  },
];

export default function Navbar({ onMenuClick }: NavbarProps) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return (
          <FiCheckCircle
            className="text-emerald-400"
            size={18}
          />
        );

      case "warning":
        return (
          <FiAlertCircle
            className="text-amber-400"
            size={18}
          />
        );

      default:
        return (
          <FiInfo
            className="text-[var(--sb-primary)]"
            size={18}
          />
        );
    }
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
      }}
      className="
        fixed
        top-0
        left-0
        right-0
        z-50
        h-16
        border-b
        border-[var(--sb-border)]
        bg-[var(--sb-surface)]
        backdrop-blur-2xl
        transition-colors
        duration-500
      "
    >
      <div className="h-full px-4 sm:px-6 flex items-center justify-between">

        {/* =====================================================
            LEFT SECTION
        ====================================================== */}
        <div className="flex items-center gap-4">

          {/* Mobile Menu */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onMenuClick}
            className="
              lg:hidden
              p-2
              rounded-xl
              border
              border-[var(--sb-border)]
              bg-[var(--sb-card)]
              text-[var(--sb-text)]
              hover:bg-white/10
              transition-all
            "
            aria-label="Open menu"
          >
            <FiMenu size={20} />
          </motion.button>

          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-3"
          >
            <motion.div
              whileHover={{ scale: 1.05, rotate: 2 }}
              transition={{ duration: 0.2 }}
              className="
                w-9
                h-9
                rounded-xl
                flex
                items-center
                justify-center
                shadow-lg
              "
              style={{
                background:
                  "linear-gradient(135deg, var(--sb-primary), var(--sb-accent))",
                boxShadow:
                  "0 8px 25px color-mix(in srgb, var(--sb-primary) 20%, transparent)",
              }}
            >
              <span className="text-white font-bold text-sm">
                ISL
              </span>
            </motion.div>

            <div className="hidden sm:block">
              <h1
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
              </h1>

              <p className="text-[10px] text-[var(--sb-muted)] -mt-0.5">
                AI Gesture Recognition
              </p>
            </div>
          </Link>
        </div>

        {/* =====================================================
            RIGHT SECTION
        ====================================================== */}
        <div className="flex items-center gap-2">

          {/* =================================================
              NOTIFICATIONS
          ================================================== */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setNotifOpen(!notifOpen);
                setProfileOpen(false);
              }}
              className="
                relative
                p-2.5
                rounded-xl
                border
                border-[var(--sb-border)]
                bg-[var(--sb-card)]
                text-[var(--sb-text)]
                hover:bg-white/10
                transition-all
              "
              aria-label="Notifications"
            >
              <FiBell
                size={18}
                className="text-[var(--sb-muted)]"
              />

              {/* Notification Dot */}
              <span
                className="
                  absolute
                  top-1.5
                  right-1.5
                  w-2
                  h-2
                  rounded-full
                "
                style={{
                  backgroundColor: "var(--sb-primary)",
                  boxShadow:
                    "0 0 8px color-mix(in srgb, var(--sb-primary) 70%, transparent)",
                }}
              />
            </motion.button>

            <AnimatePresence>
              {notifOpen && (
                <>
                  {/* Overlay */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setNotifOpen(false)}
                  />

                  {/* Notification Panel */}
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: 10,
                      scale: 0.95,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                    }}
                    exit={{
                      opacity: 0,
                      y: 10,
                      scale: 0.95,
                    }}
                    transition={{ duration: 0.2 }}
                    className="
                      absolute
                      right-0
                      top-12
                      w-80
                      overflow-hidden
                      rounded-2xl
                      border
                      border-[var(--sb-border)]
                      bg-[var(--sb-bg)]
                      shadow-2xl
                      z-50
                      backdrop-blur-2xl
                    "
                  >
                    {/* Header */}
                    <div
                      className="
                        p-4
                        border-b
                        border-[var(--sb-border)]
                        flex
                        items-center
                        justify-between
                      "
                    >
                      <div>
                        <h3 className="font-semibold text-sm text-[var(--sb-text)]">
                          Notifications
                        </h3>

                        <p className="text-[11px] text-[var(--sb-muted)] mt-0.5">
                          Recent system activity
                        </p>
                      </div>

                      <button
                        onClick={() => setNotifOpen(false)}
                        className="
                          p-1.5
                          rounded-lg
                          text-[var(--sb-muted)]
                          hover:text-[var(--sb-text)]
                          hover:bg-white/10
                          transition-all
                        "
                        aria-label="Close notifications"
                      >
                        <FiX size={16} />
                      </button>
                    </div>

                    {/* Notifications */}
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.map((notif) => (
                        <motion.div
                          key={notif.id}
                          initial={{
                            opacity: 0,
                            x: -20,
                          }}
                          animate={{
                            opacity: 1,
                            x: 0,
                          }}
                          className="
                            p-3
                            flex
                            items-start
                            gap-3
                            hover:bg-white/5
                            transition-colors
                            cursor-pointer
                            border-b
                            border-[var(--sb-border)]
                            last:border-0
                          "
                        >
                          <div className="mt-0.5">
                            {getIcon(notif.type)}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-[var(--sb-text)]/80">
                              {notif.message}
                            </p>

                            <p className="text-xs text-[var(--sb-muted)] mt-0.5">
                              {notif.time}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Footer */}
                    <div
                      className="
                        p-3
                        border-t
                        border-[var(--sb-border)]
                        text-center
                      "
                    >
                      <button
                        className="
                          text-xs
                          font-medium
                          transition-colors
                        "
                        style={{
                          color: "var(--sb-primary)",
                        }}
                      >
                        View all notifications
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* =================================================
              SETTINGS QUICK LINK
          ================================================== */}
          <Link to="/settings">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="
                p-2.5
                rounded-xl
                border
                border-[var(--sb-border)]
                bg-[var(--sb-card)]
                hover:bg-white/10
                transition-all
                hidden
                sm:flex
              "
              aria-label="Settings"
            >
              <FiSettings
                size={18}
                className="text-[var(--sb-muted)]"
              />
            </motion.button>
          </Link>

          {/* =================================================
              PROFILE
          ================================================== */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setProfileOpen(!profileOpen);
                setNotifOpen(false);
              }}
              className="
                flex
                items-center
                gap-2
                p-1.5
                pl-1
                pr-3
                rounded-xl
                border
                border-[var(--sb-border)]
                bg-[var(--sb-card)]
                hover:bg-white/10
                transition-all
              "
              aria-label="Open profile menu"
            >
              <div
                className="
                  w-7
                  h-7
                  rounded-lg
                  flex
                  items-center
                  justify-center
                "
                style={{
                  background:
                    "linear-gradient(135deg, var(--sb-primary), var(--sb-accent))",
                }}
              >
                <FiUser
                  size={14}
                  className="text-white"
                />
              </div>

              <span className="text-sm font-medium hidden sm:block text-[var(--sb-text)]">
                Student
              </span>
            </motion.button>

            <AnimatePresence>
              {profileOpen && (
                <>
                  {/* Overlay */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setProfileOpen(false)}
                  />

                  {/* Profile Panel */}
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: 10,
                      scale: 0.95,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                    }}
                    exit={{
                      opacity: 0,
                      y: 10,
                      scale: 0.95,
                    }}
                    transition={{ duration: 0.2 }}
                    className="
                      absolute
                      right-0
                      top-12
                      w-56
                      overflow-hidden
                      rounded-2xl
                      border
                      border-[var(--sb-border)]
                      bg-[var(--sb-bg)]
                      shadow-2xl
                      z-50
                      backdrop-blur-2xl
                    "
                  >
                    {/* Profile Header */}
                    <div
                      className="
                        p-4
                        border-b
                        border-[var(--sb-border)]
                      "
                    >
                      <p className="font-semibold text-sm text-[var(--sb-text)]">
                        Final Year Student
                      </p>

                      <p className="text-xs text-[var(--sb-muted)] mt-0.5">
                        Computer Engineering
                      </p>
                    </div>

                    {/* Menu */}
                    <div className="p-2">
                      <Link
                        to="/settings"
                        onClick={() => setProfileOpen(false)}
                      >
                        <div
                          className="
                            flex
                            items-center
                            gap-3
                            p-2.5
                            rounded-xl
                            hover:bg-white/5
                            transition-colors
                            cursor-pointer
                          "
                        >
                          <FiSettings
                            size={16}
                            className="text-[var(--sb-muted)]"
                          />

                          <span className="text-sm text-[var(--sb-text)]">
                            Settings
                          </span>
                        </div>
                      </Link>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}