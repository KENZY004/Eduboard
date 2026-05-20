import {
    createContext,
    useState,
    useEffect,
    useMemo,
} from "react";

export const ThemeContext =
    createContext(null);

const THEME_KEY = "app-theme";

const THEMES = {
    LIGHT: "light",
    DARK: "dark",
};

// Get system theme
const getSystemTheme = () => {
    return window.matchMedia(
        "(prefers-color-scheme: dark)"
    ).matches
        ? THEMES.DARK
        : THEMES.LIGHT;
};

// Get initial theme
const getInitialTheme = () => {
    if (typeof window === "undefined") {
        return THEMES.LIGHT;
    }

    const savedTheme =
        localStorage.getItem(THEME_KEY);

    if (savedTheme) {
        return savedTheme;
    }

    return getSystemTheme();
};

export const ThemeProvider = ({
    children,
}) => {
    const [theme, setTheme] =
        useState(getInitialTheme);

    // Apply theme globally
    useEffect(() => {
        const root =
            document.documentElement;

        root.classList.remove(
            THEMES.LIGHT,
            THEMES.DARK
        );

        root.classList.add(theme);

        root.setAttribute(
            "data-theme",
            theme
        );

        localStorage.setItem(
            THEME_KEY,
            theme
        );
    }, [theme]);

    // Sync theme between tabs
    useEffect(() => {
        const handleStorageChange = (
            e
        ) => {
            if (
                e.key === THEME_KEY &&
                e.newValue
            ) {
                setTheme(e.newValue);
            }
        };

        window.addEventListener(
            "storage",
            handleStorageChange
        );

        return () => {
            window.removeEventListener(
                "storage",
                handleStorageChange
            );
        };
    }, []);

    // Detect system theme changes
    useEffect(() => {
        const mediaQuery =
            window.matchMedia(
                "(prefers-color-scheme: dark)"
            );

        const handleSystemThemeChange =
            (e) => {
                const savedTheme =
                    localStorage.getItem(
                        THEME_KEY
                    );

                if (!savedTheme) {
                    setTheme(
                        e.matches
                            ? THEMES.DARK
                            : THEMES.LIGHT
                    );
                }
            };

        mediaQuery.addEventListener(
            "change",
            handleSystemThemeChange
        );

        return () => {
            mediaQuery.removeEventListener(
                "change",
                handleSystemThemeChange
            );
        };
    }, []);

    // Toggle theme
    const toggleTheme = () => {
        setTheme((prevTheme) =>
            prevTheme === THEMES.LIGHT
                ? THEMES.DARK
                : THEMES.LIGHT
        );
    };

    const value = useMemo(
        () => ({
            theme,
            setTheme,
            toggleTheme,
            isDark:
                theme === THEMES.DARK,
            isLight:
                theme === THEMES.LIGHT,
            themes: THEMES,
        }),
        [theme]
    );

    return (
        <ThemeContext.Provider
            value={value}
        >
            {children}
        </ThemeContext.Provider>
    );
};