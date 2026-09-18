import { motion } from "framer-motion";
import { FiHeart, FiGithub, FiLinkedin, FiArrowUpRight } from "react-icons/fi";

export default function Footer() {
  return (
    <footer
      className="
        lg:pl-[270px]
        px-4
        sm:px-6
        lg:px-8
        py-8
        border-t
        border-[var(--sb-border)]
        bg-[var(--sb-bg)]
        transition-colors
        duration-500
      "
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="
            relative
            overflow-hidden
            rounded-3xl
            border
            border-[var(--sb-border)]
            bg-[var(--sb-card)]
            backdrop-blur-xl
            px-5
            py-5
            sm:px-6
          "
        >
          {/* Ambient glow */}
          <div
            className="
              absolute
              -top-20
              -right-20
              w-40
              h-40
              rounded-full
              blur-3xl
              opacity-10
              pointer-events-none
            "
            style={{
              backgroundColor: "var(--sb-primary)",
            }}
          />

          <div
            className="
              relative
              flex
              flex-col
              md:flex-row
              items-center
              justify-between
              gap-5
            "
          >
            {/* Left */}
            <div className="flex items-center gap-3">
              <div
                className="
                  w-9
                  h-9
                  rounded-xl
                  flex
                  items-center
                  justify-center
                  shrink-0
                "
                style={{
                  background:
                    "color-mix(in srgb, var(--sb-primary) 12%, transparent)",
                  border:
                    "1px solid color-mix(in srgb, var(--sb-primary) 18%, transparent)",
                }}
              >
                <FiHeart
                  size={16}
                  style={{
                    color: "var(--sb-primary)",
                  }}
                />
              </div>

              <div>
                <p className="text-xs font-semibold text-[var(--sb-text)]">
                  Built with passion for ISL accessibility
                </p>

                <p className="text-[10px] mt-1 text-[var(--sb-muted)]">
                  Indian Sign Language Translation Platform
                </p>
              </div>
            </div>

            {/* Center / Version */}
            <div
              className="
                flex
                items-center
                gap-2
                px-3
                py-2
                rounded-xl
                border
                border-[var(--sb-border)]
                bg-white/[0.025]
              "
            >
              <span
                className="
                  w-1.5
                  h-1.5
                  rounded-full
                  bg-emerald-400
                  shadow-[0_0_10px_rgba(52,211,153,0.6)]
                "
              />

              <span className="text-[10px] font-medium text-[var(--sb-muted)]">
                ISL Translator
              </span>

              <span
                className="text-[10px] font-bold"
                style={{
                  color: "var(--sb-primary)",
                }}
              >
                v1.0
              </span>
            </div>

            {/* Right */}
            <div className="flex items-center gap-3">
              <span className="hidden sm:block text-[10px] text-[var(--sb-muted)]">
                Connect with us
              </span>

              {/* GitHub */}
              <motion.a
                whileHover={{
                  scale: 1.08,
                  y: -2,
                }}
                whileTap={{
                  scale: 0.94,
                }}
                href="#"
                aria-label="GitHub"
                className="
                  group
                  relative
                  w-9
                  h-9
                  rounded-xl
                  flex
                  items-center
                  justify-center
                  border
                  border-[var(--sb-border)]
                  bg-white/[0.025]
                  transition-all
                  duration-200
                  hover:bg-white/[0.07]
                "
              >
                <FiGithub
                  size={16}
                  className="
                    text-[var(--sb-muted)]
                    group-hover:text-[var(--sb-text)]
                    transition-colors
                  "
                />

                <FiArrowUpRight
                  size={9}
                  className="
                    absolute
                    top-1.5
                    right-1.5
                    opacity-0
                    group-hover:opacity-100
                    transition-opacity
                  "
                  style={{
                    color: "var(--sb-primary)",
                  }}
                />
              </motion.a>

              {/* LinkedIn */}
              <motion.a
                whileHover={{
                  scale: 1.08,
                  y: -2,
                }}
                whileTap={{
                  scale: 0.94,
                }}
                href="#"
                aria-label="LinkedIn"
                className="
                  group
                  relative
                  w-9
                  h-9
                  rounded-xl
                  flex
                  items-center
                  justify-center
                  border
                  border-[var(--sb-border)]
                  bg-white/[0.025]
                  transition-all
                  duration-200
                  hover:bg-white/[0.07]
                "
              >
                <FiLinkedin
                  size={16}
                  className="
                    text-[var(--sb-muted)]
                    group-hover:text-[var(--sb-text)]
                    transition-colors
                  "
                />

                <FiArrowUpRight
                  size={9}
                  className="
                    absolute
                    top-1.5
                    right-1.5
                    opacity-0
                    group-hover:opacity-100
                    transition-opacity
                  "
                  style={{
                    color: "var(--sb-primary)",
                  }}
                />
              </motion.a>
            </div>
          </div>
        </motion.div>

        {/* Copyright */}
        <div className="mt-4 text-center">
          <p className="text-[9px] text-[var(--sb-muted)] opacity-60">
            © {new Date().getFullYear()} ISL Translator · Bidirectional
            Indian Sign Language Translation
          </p>
        </div>
      </div>
    </footer>
  );
}