import React from "react";
import { useTheme } from "../context/ThemeContext";

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="
            w-12
            h-12
            rounded-full
            flex
            items-center
            justify-center
            bg-[var(--bg-secondary)]
            border
            border-[var(--border-subtle)]
            text-[var(--text-primary)]
            hover:scale-105
            transition-all
            duration-300
        "
        >
            {theme === "dark" ? "☀️" : "🌙"}
        </button>
    );
};

export default ThemeToggle;