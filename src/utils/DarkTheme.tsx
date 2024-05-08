import React, { useEffect, useState } from "react";

const DarkTheme: React.FC = () => {
  const [theme, setTheme] = useState<string>("dark");

  const setMode = (mode: string) => {
    if (mode === "light") {
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
    }
  };

  useEffect(() => {
    const localTheme = localStorage.getItem("theme");
    const systemInitiatedDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    );
    if (localTheme) {
      setTheme(localTheme);
      setMode(localTheme);
    } else if (systemInitiatedDark.matches) {
      setTheme("dark");
      setMode("dark");
    }

    const handleThemeChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setTheme("dark");
        setMode("dark");
      } else {
        setTheme("light");
        setMode("light");
      }
    };

    systemInitiatedDark.addEventListener("change", handleThemeChange);

    return () => {
      systemInitiatedDark.removeEventListener("change", handleThemeChange);
    };
  }, []);

  const renderThemeChanger = () => {
    if (theme === "dark") {
      return (
        <svg
          className="w-6 h-6 transition-all duration-150 ease-in-out dark:flex dark:group-hover:opacity-100 dark:text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      );
    } else {
      return (
        <svg
          className="w-6 h-6 transition-all duration-150 ease-in-out flex text-mid/50 group-hover:text-dark"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      );
    }
  };

  return (
    <div className="flex ">
      <button
        className="flex items-center justify-center w-12 h-12 transition-all duration-150 ease-in rounded-sm focus:outline-none group bg-transparent outline-none"
        onClick={() => {
          const newTheme = theme === "dark" ? "light" : "dark";
          setTheme(newTheme);
          setMode(newTheme);
          localStorage.setItem("theme", newTheme);
        }}
      >
        {renderThemeChanger()}
      </button>
    </div>
  );
};

export default DarkTheme;
