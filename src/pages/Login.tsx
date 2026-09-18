import { FormEvent, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiArrowRight,
  FiEye,
  FiEyeOff,
  FiLock,
  FiMail,
  FiShield,
  FiLoader,
} from 'react-icons/fi';

const API_BASE_URL = 'http://localhost:8000/api/v1';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Message received from Register page
  const successMessage = location.state?.message || '';

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError('');

    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }

    try {
      setLoading(true);

      const formData = new URLSearchParams();

      formData.append('username', email.trim());
      formData.append('password', password);

      const response = await fetch(
        `${API_BASE_URL}/auth/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/x-www-form-urlencoded',
          },
          body: formData.toString(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            'Invalid email or password. Please try again.'
        );
      }

      if (!data.access_token) {
        throw new Error(
          'Login succeeded, but no access token was received.'
        );
      }

      // Save JWT token
      localStorage.setItem(
        'access_token',
        data.access_token
      );

      // Compatibility with existing frontend code
      localStorage.setItem(
        'token',
        data.access_token
      );

      // Go to protected Home page
      navigate('/home', {
        replace: true,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to login. Please try again.'
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

        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-10 items-center">

          {/* =========================
              LEFT SIDE
              ========================= */}
          <motion.div
            initial={{
              opacity: 0,
              x: -30,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.6,
            }}
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
                <FiShield />
                Secure authentication
              </div>

              <h1 className="text-5xl xl:text-6xl font-black tracking-tight leading-[1.05]">
                Welcome

                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400">
                  back.
                </span>
              </h1>

              <p className="mt-6 text-lg leading-8 text-slate-400 max-w-lg">
                Sign in to continue using your Indian Sign Language
                translation tools, saved history, learning resources,
                and personalized settings.
              </p>

              <div className="mt-10 grid grid-cols-2 gap-4 max-w-md">

                <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">

                  <FiLock className="text-cyan-300 mb-3 text-xl" />

                  <div className="font-semibold">
                    Secure
                  </div>

                  <div className="text-xs text-slate-500 mt-1">
                    JWT authentication
                  </div>

                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">

                  <FiShield className="text-violet-300 mb-3 text-xl" />

                  <div className="font-semibold">
                    Personal
                  </div>

                  <div className="text-xs text-slate-500 mt-1">
                    Your translation history
                  </div>

                </div>

              </div>

            </div>

          </motion.div>

          {/* =========================
              LOGIN CARD
              ========================= */}
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
              delay: 0.1,
            }}
            className="w-full max-w-md mx-auto lg:ml-auto"
          >

            {/* Mobile Logo */}
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

              {/* Header */}
              <div className="mb-8">

                <p className="text-xs uppercase tracking-[0.2em] text-cyan-300 font-semibold mb-3">
                  Account
                </p>

                <h2 className="text-3xl font-bold tracking-tight">
                  Sign in
                </h2>

                <p className="text-sm text-slate-400 mt-2">
                  Enter your credentials to access your account.
                </p>

              </div>

              {/* =========================
                  SUCCESS MESSAGE
                  ========================= */}
              {successMessage && (
                <motion.div
                  initial={{
                    opacity: 0,
                    y: -8,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  className="mb-5 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300"
                >
                  {successMessage}
                </motion.div>
              )}

              {/* =========================
                  ERROR MESSAGE
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
                  LOGIN FORM
                  ========================= */}
              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >

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
                          ? 'text'
                          : 'password'
                      }
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) =>
                        setPassword(e.target.value)
                      }
                      placeholder="Enter your password"
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
                      aria-label={
                        showPassword
                          ? 'Hide password'
                          : 'Show password'
                      }
                    >
                      {showPassword ? (
                        <FiEyeOff />
                      ) : (
                        <FiEye />
                      )}
                    </button>

                  </div>

                </div>

                {/* Forgot Password */}
                <div className="flex justify-end -mt-2">
                  <button
                    type="button"
                    onClick={() =>
                      navigate('/forgot-password')
                    }
                    className="text-sm text-cyan-300 hover:text-cyan-200 transition"
                  >
                    Forgot Password?
                  </button>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 px-5 py-3.5 font-semibold text-white shadow-lg shadow-cyan-500/10 transition hover:scale-[1.01] hover:shadow-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {loading ? (
                    <>
                      <FiLoader className="animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in
                      <FiArrowRight />
                    </>
                  )}

                </button>

              </form>

              {/* Divider */}
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

              {/* Register */}
              <p className="text-center text-sm text-slate-400">

                Don't have an account?{' '}

                <Link
                  to="/register"
                  className="font-semibold text-cyan-300 hover:text-cyan-200 transition"
                >
                  Create account
                </Link>

              </p>

              {/* Back */}
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