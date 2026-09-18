import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiArrowRight,
  FiEye,
  FiEyeOff,
  FiLock,
  FiMail,
  FiUser,
  FiUserPlus,
  FiLoader,
  FiCheckCircle,
} from "react-icons/fi";

const API_BASE_URL = "http://localhost:8000/api/v1";

export default function Register() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");

    if (
      !fullName.trim() ||
      !email.trim() ||
      !password ||
      !confirmPassword
    ) {
      setError("Please fill in all fields.");
      return;
    }

    if (fullName.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }

    if (password.length < 8) {
      setError(
        "Password must be at least 8 characters long."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            full_name: fullName.trim(),
            email: email.trim(),
            password: password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            "Unable to create your account."
        );
      }

      navigate("/login", {
        state: {
          message:
            "Account created successfully. Please sign in.",
        },
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create your account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 text-white overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-violet-500/10 blur-[120px]" />

        <div className="absolute inset-0 opacity-[0.025] bg-[linear-gradient(rgba(255,255,255,0.5)_1px),transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.5)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <div className="relative min-h-screen flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-10 items-center">

          {/* Left side */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="hidden lg:block"
          >
            <Link
              to="/"
              className="inline-flex items-center gap-3 mb-12"
            >
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center font-black tracking-tight shadow-lg shadow-cyan-500/20">
                ISL
              </div>

              <div>
                <div className="font-bold tracking-[0.2em] text-sm">
                  ISL TRANSLATOR
                </div>

                <div className="text-xs text-slate-500">
                  Indian Sign Language
                </div>
              </div>
            </Link>

            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-400/20 bg-cyan-400/5 text-cyan-300 text-xs font-medium mb-6">
                <FiUserPlus />
                Create your account
              </div>

              <h1 className="text-5xl xl:text-6xl font-black tracking-tight leading-[1.05]">
                Start your
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400">
                  journey.
                </span>
              </h1>

              <p className="mt-6 text-lg leading-8 text-slate-400 max-w-lg">
                Create your ISL Translator account and access sign
                language translation tools, saved history, learning
                resources, and personalized settings.
              </p>

              <div className="mt-10 space-y-4 max-w-md">
                <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                  <div className="w-10 h-10 rounded-xl bg-cyan-400/10 flex items-center justify-center">
                    <FiCheckCircle className="text-cyan-300" />
                  </div>

                  <div>
                    <div className="font-semibold">
                      Personal account
                    </div>

                    <div className="text-xs text-slate-500">
                      Keep your translation history private
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                  <div className="w-10 h-10 rounded-xl bg-violet-400/10 flex items-center justify-center">
                    <FiLock className="text-violet-300" />
                  </div>

                  <div>
                    <div className="font-semibold">
                      Secure authentication
                    </div>

                    <div className="text-xs text-slate-500">
                      Passwords are securely protected
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Register card */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="w-full max-w-md mx-auto lg:ml-auto"
          >
            {/* Mobile logo */}
            <div className="lg:hidden flex justify-center mb-8">
              <Link
                to="/"
                className="inline-flex items-center gap-3"
              >
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center font-black">
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

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] backdrop-blur-2xl shadow-2xl shadow-black/20 p-7 sm:p-9">

              <div className="mb-8">
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-300 font-semibold mb-3">
                  Account
                </p>

                <h2 className="text-3xl font-bold tracking-tight">
                  Create account
                </h2>

                <p className="text-sm text-slate-400 mt-2">
                  Create your account to get started.
                </p>
              </div>

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-5 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300"
                >
                  {error}
                </motion.div>
              )}

              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >

                {/* Full Name */}
                <div>
                  <label
                    htmlFor="fullName"
                    className="block text-sm font-medium text-slate-300 mb-2"
                  >
                    Full name
                  </label>

                  <div className="relative">
                    <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />

                    <input
                      id="fullName"
                      type="text"
                      autoComplete="name"
                      value={fullName}
                      onChange={(e) =>
                        setFullName(e.target.value)
                      }
                      placeholder="Punith Manathesh"
                      maxLength={150}
                      className="w-full rounded-xl border border-white/10 bg-black/20 pl-11 pr-4 py-3.5 text-sm text-white placeholder:text-slate-600 outline-none transition focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/10"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-slate-300 mb-2"
                  >
                    Email address
                  </label>

                  <div className="relative">
                    <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />

                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) =>
                        setEmail(e.target.value)
                      }
                      placeholder="you@example.com"
                      className="w-full rounded-xl border border-white/10 bg-black/20 pl-11 pr-4 py-3.5 text-sm text-white placeholder:text-slate-600 outline-none transition focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/10"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-slate-300 mb-2"
                  >
                    Password
                  </label>

                  <div className="relative">
                    <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />

                    <input
                      id="password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) =>
                        setPassword(e.target.value)
                      }
                      placeholder="Create a password"
                      className="w-full rounded-xl border border-white/10 bg-black/20 pl-11 pr-12 py-3.5 text-sm text-white placeholder:text-slate-600 outline-none transition focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/10"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (value) => !value
                        )
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-200 transition"
                    >
                      {showPassword ? (
                        <FiEyeOff />
                      ) : (
                        <FiEye />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm password */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-slate-300 mb-2"
                  >
                    Confirm password
                  </label>

                  <div className="relative">
                    <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />

                    <input
                      id="confirmPassword"
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) =>
                        setConfirmPassword(
                          e.target.value
                        )
                      }
                      placeholder="Confirm your password"
                      className="w-full rounded-xl border border-white/10 bg-black/20 pl-11 pr-12 py-3.5 text-sm text-white placeholder:text-slate-600 outline-none transition focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/10"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          (value) => !value
                        )
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-200 transition"
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
                  disabled={loading}
                  className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 px-5 py-3.5 font-semibold text-white shadow-lg shadow-cyan-500/10 transition hover:scale-[1.01] hover:shadow-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <FiLoader className="animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create account
                      <FiArrowRight />
                    </>
                  )}
                </button>
              </form>

              <div className="relative my-7">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>

                <div className="relative flex justify-center">
                  <span className="bg-[#10151d] px-3 text-xs text-slate-600">
                    OR
                  </span>
                </div>
              </div>

              <p className="text-center text-sm text-slate-400">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-cyan-300 hover:text-cyan-200 transition"
                >
                  Sign in
                </Link>
              </p>

              <Link
                to="/"
                className="block text-center text-xs text-slate-600 hover:text-slate-400 transition mt-6"
              >
                ← Back to ISL Translator
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}