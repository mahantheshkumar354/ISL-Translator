import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div
      className="
        min-h-screen
        bg-[var(--sb-bg)]
        text-[var(--sb-text)]
        transition-colors
        duration-500
      "
    >
      {/* Navbar */}
      <Navbar
        onMenuClick={() => setSidebarOpen(true)}
      />

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onCollapsedChange={setSidebarCollapsed}
      />

      {/* Main Content */}
      <main
        className={`
          min-h-screen
          bg-[var(--sb-bg)]
          pt-16
          transition-[padding-left]
          duration-500
          ease-[cubic-bezier(0.22,1,0.36,1)]
          ${
            sidebarCollapsed
              ? "lg:pl-[82px]"
              : "lg:pl-[270px]"
          }
        `}
      >
        <div className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}