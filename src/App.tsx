import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";

// Public pages
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";

// Protected pages
import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
import SignToText from "@/pages/SignToText";
import TextToSign from "@/pages/TextToSign";
import SpeechToSign from "@/pages/SpeechToSign";
import LearningHub from "@/pages/LearningHub";
import History from "@/pages/History";
import About from "@/pages/About";
import Settings from "@/pages/Settings";

// Route protection
import ProtectedRoute from "@/components/ProtectedRoute";

function App() {
  return (
    <Routes>
      {/* =========================
          LOGIN / REGISTER / PASSWORD RECOVERY
          ========================= */}

      <Route path="/login" element={<Login />} />

      <Route path="/register" element={<Register />} />

      <Route
        path="/forgot-password"
        element={<ForgotPassword />}
      />

      <Route
        path="/reset-password"
        element={<ResetPassword />}
      />

      {/* =========================
          PROTECTED APPLICATION
          ========================= */}

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />

          <Route path="/home" element={<Home />} />

          <Route
            path="/sign-to-text"
            element={<SignToText />}
          />

          <Route
            path="/text-to-sign"
            element={<TextToSign />}
          />

          <Route
            path="/speech-to-sign"
            element={<SpeechToSign />}
          />

          <Route
            path="/learning-hub"
            element={<LearningHub />}
          />

          <Route path="/history" element={<History />} />

          <Route path="/about" element={<About />} />

          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>

      {/* Unknown URLs */}
      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  );
}

export default App;