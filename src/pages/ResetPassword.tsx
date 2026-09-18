import { FormEvent, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiArrowLeft,
  FiCheckCircle,
  FiEye,
  FiEyeOff,
  FiKey,
  FiLoader,
  FiLock,
  FiShield,
} from "react-icons/fi";

const API_BASE_URL = "http://localhost:8000/api/v1";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!token) {
      setError(
        "Invalid password reset link. Please request a new reset link."
      );
      return;
    }

    if (!password || !confirmPassword) {
      setError("Please enter and confirm your new password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/auth/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            new_password: password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            "Unable to reset your password."
        );
      }

      setSuccess(
        data?.message ||
          "Password reset successfully."
      );

      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        navigate("/login");
      }, 1800);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 text-white overflow-hidden">

      {/* =========================
          BACKGROUND
          ========================= */}
      <div className="fixed inset-0 pointer-events-none">

        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[120px]" />

        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-violet-500/10 blur-[120px]" />

        <div className="absolute inset-0 opacity-[0.025] bg-[linear-gradient(rgba(255,255,255,0.5)_1px),transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.5)_1px,transparent_1px)] bg-[size:60px_60px]" />

      </div>

      <div className="relative min-h-screen flex items-center justify-center px-6 py-12">

        <motion.div
          initial={{
            opacity: 0,
            y: 25,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.6,
          }}
          className="w-full max-w-md"
        >

          {/* =========================
              LOGO
              ========================= */}
          <div className="flex justify-center mb-8">

            <Link
              to="/login"
              className="inline-flex items-center gap-3"
            >

              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center font-black tracking-tight shadow-lg shadow-cyan-500/20">
                ISL
              </div>

              <div>
                <div className="font-bold tracking-[0.18em] text-sm">
                  ISL TRANSLATOR
                </div>

                <div className="text-xs text-slate-500">
                  Indian Sign Language
                </div>
              </div>

            </Link>

          </div>

          {/* =========================
              CARD
              ========================= */}
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] backdrop-blur-2xl shadow-2xl shadow-black/20 p-7 sm:p-9">

            {/* Header */}
            <div className="text-center mb-8">

              <div className="mx-auto mb-5 w-14 h-14 rounded-2xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center">

                <FiKey className="text-cyan-300 text-2xl" />

              </div>

              <p className="text-xs uppercase tracking-[0.2em] text-cyan-300 font-semibold mb-3">
                Secure recovery
              </p>

              <h1 className="text-3xl font-bold tracking-tight">
                Reset password
              </h1>

              <p className="text-sm text-slate-400 mt-3 leading-6">
                Create a new password for your ISL Translator account.
              </p>

            </div>

            {/* =========================
                ERROR
                ========================= */}
            {error && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: -8,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className="mb-5 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300"
              >
                {error}
              </motion.div>
            )}

            {/* =========================
                SUCCESS
                ========================= */}
            {success && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: -8,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className="mb-5 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-4 text-sm text-emerald-300"
              >

                <div className="flex items-start gap-3">

                  <FiCheckCircle className="mt-0.5 flex-shrink-0" />

                  <span>{success}</span>

                </div>

                <p className="mt-2 text-xs text-emerald-400/70">
                  Redirecting you to sign in...
                </p>

              </motion.div>
            )}

            {/* =========================
                FORM
                ========================= */}
            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {/* New Password */}
              <div>

                <label
                  htmlFor="new-password"
                  className="block text-sm font-medium text-slate-300 mb-2"
                >
                  New password
                </label>

                <div className="relative">

                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />

                  <input
                    id="new-password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    autoComplete="new-password"
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    placeholder="Enter new password"
                    className="w-full rounded-xl border border-white/10 bg-black/20 pl-11 pr-12 py-3.5 text-sm text-white placeholder:text-slate-600 outline-none transition focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/10"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyan-300 transition"
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <FiEyeOff />
                    ) : (
                      <FiEye />
                    )}
                  </button>

                </div>

                <p className="mt-2 text-xs text-slate-600">
                  Minimum 6 characters
                </p>

              </div>

              {/* Confirm Password */}
              <div>

                <label
                  htmlFor="confirm-password"
                  className="block text-sm font-medium text-slate-300 mb-2"
                >
                  Confirm new password
                </label>

                <div className="relative">

                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />

                  <input
                    id="confirm-password"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(
                        event.target.value
                      )
                    }
                    placeholder="Confirm new password"
                    className="w-full rounded-xl border border-white/10 bg-black/20 pl-11 pr-12 py-3.5 text-sm text-white placeholder:text-slate-600 outline-none transition focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/10"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        !showConfirmPassword
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyan-300 transition"
                    aria-label={
                      showConfirmPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showConfirmPassword ? (
                      <FiEyeOff />
                    ) : (
                      <FiEye />
                    )}
                  </button>

                </div>

              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !!success}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 px-5 py-3.5 font-semibold text-white shadow-lg shadow-cyan-500/10 transition hover:scale-[1.01] hover:shadow-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              >

                {loading ? (
                  <>
                    <FiLoader className="animate-spin" />
                    Resetting password...
                  </>
                ) : (
                  <>
                    Reset password
                    <FiArrowLeft className="rotate-180" />
                  </>
                )}

              </button>

            </form>

            {/* Back to login */}
            <Link
              to="/login"
              className="mt-7 flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-cyan-300 transition"
            >
              <FiArrowLeft />
              Back to sign in
            </Link>

          </div>

          {/* Security note */}
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-600">
            <FiShield />
            Your account security is protected.
          </div>

        </motion.div>

      </div>

    </div>
  );
}