"use client";

import { useState, useEffect } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const isDark = localStorage.getItem("theme") === "dark";
    document.documentElement.classList.toggle("dark", isDark);
    setMounted(true);
    // Sync with initial state - only set if different
    if (isDark !== dark) {
      setDark(isDark);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = () => {
    const next = !dark;
    setDark(next);
    localStorage.setItem("theme", next ? "dark" : "light");
    document.documentElement.classList.toggle("dark", next);
  };

  if (!mounted) return null;

  return (
    <button
      onClick={toggle}
      className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
      title={dark ? "Light mode" : "Dark mode"}
    >
      {dark ? "☀️" : "🌙"}
    </button>
  );
}
