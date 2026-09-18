import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiArrowLeft,
  FiArrowRight,
  FiCheckCircle,
  FiKey,
  FiLoader,
  FiMail,
  FiShield,
} from 'react-icons/fi';

const API_BASE_URL = 'http://localhost:8000/api/v1';

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [resetToken, setResetToken] = useState('');

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError('');
    setSuccess('');
    setResetToken('');

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/auth/forgot-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            'Unable to create password reset request.'
        );
      }

      setSuccess(
        data?.message ||
          'Password reset request created successfully.'
      );

      // Demo reset token.
      // In a production application this should be
      // delivered through email instead.
      if (data?.reset_token) {
        setResetToken(data.reset_token);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong. Please try again.'
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
                Account recovery
              </p>

              <h1 className="text-3xl font-bold tracking-tight">
                Forgot password?
              </h1>

              <p className="text-sm text-slate-400 mt-3 leading-6">
                Enter your registered email address and we'll
                create a password reset request.
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
              </motion.div>
            )}

            {/* =========================
                FORM
                ========================= */}
            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {/* Email */}
              <div>

                <label
                  htmlFor="forgot-email"
                  className="block text-sm font-medium text-slate-300 mb-2"
                >
                  Email address
                </label>

                <div className="relative">

                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />

                  <input
                    id="forgot-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-white/10 bg-black/20 pl-11 pr-4 py-3.5 text-sm text-white placeholder:text-slate-600 outline-none transition focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/10"
                  />

                </div>

              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 px-5 py-3.5 font-semibold text-white shadow-lg shadow-cyan-500/10 transition hover:scale-[1.01] hover:shadow-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              >

                {loading ? (
                  <>
                    <FiLoader className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Send reset request
                    <FiArrowRight />
                  </>
                )}

              </button>

            </form>

            {/* =========================
                DEMO RESET TOKEN
                ========================= */}
            {resetToken && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: 10,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className="mt-6 rounded-2xl border border-amber-400/20 bg-amber-400/5 p-4"
              >

                <div className="flex items-center gap-2 text-amber-300 text-sm font-semibold mb-2">
                  <FiShield />
                  Demo reset token
                </div>

                <p className="text-xs text-slate-400 mb-3">
                  For this college-project demo, the reset token
                  is shown here instead of being emailed.
                </p>

                <div className="break-all rounded-xl bg-black/30 border border-white/10 p-3 text-xs text-slate-300 font-mono">
                  {resetToken}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/reset-password?token=${encodeURIComponent(
                        resetToken
                      )}`
                    )
                  }
                  className="w-full mt-4 flex items-center justify-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/5 px-4 py-3 text-sm font-semibold text-cyan-300 hover:bg-cyan-400/10 transition"
                >
                  Continue to reset password
                  <FiArrowRight />
                </button>

              </motion.div>
            )}

            {/* =========================
                BACK TO LOGIN
                ========================= */}
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