import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        // Get theme from localStorage
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) return savedTheme;

        // Or detect system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        
        // Default to dark (matching current project aesthetic)
        return 'dark';
    });

    useEffect(() => {
        // Save theme to localStorage whenever it changes
        localStorage.setItem('theme', theme);

        // Apply theme class and transition utility
        const root = document.documentElement;
        root.classList.add('theme-transition');
        
        if (theme === 'dark') {
            root.classList.add('dark');
            root.classList.remove('light');
        } else {
            root.classList.add('light');
            root.classList.remove('dark');
        }

        // Optional: Remove transition class after animation to prevent performance issues on heavy pages
        const timeout = setTimeout(() => {
            // root.classList.remove('theme-transition'); 
            // Turning it off might cause issues if other things change, so we keep it for now but keep duration short.
        }, 300);

        return () => clearTimeout(timeout);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    const value = useMemo(() => ({
        theme,
        setTheme,
        toggleTheme,
        isDark: theme === 'dark',
    }), [theme]);

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};
