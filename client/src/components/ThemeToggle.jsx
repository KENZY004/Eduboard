import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { FiSun, FiMoon } from 'react-icons/fi';

const ThemeToggle = () => {
    const { theme, toggleTheme, isDark } = useTheme();

    const handleToggle = (e) => {
        e.preventDefault();
        console.log('Toggling theme from:', theme);
        toggleTheme();
    };

    return (
        <button 
            onClick={handleToggle}
            className="relative inline-flex items-center cursor-pointer group outline-none" 
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        >
            <div className="w-14 h-7 bg-slate-200 dark:bg-slate-800 rounded-full border border-slate-300 dark:border-slate-700 shadow-inner group-hover:border-slate-400 dark:group-hover:border-slate-600 transition-colors duration-200">
                <motion.div
                    className="absolute left-1 top-1 w-5 h-5 rounded-full shadow-lg flex items-center justify-center overflow-hidden"
                    animate={{
                        x: isDark ? 28 : 0,
                        backgroundColor: isDark ? '#1e293b' : '#ffffff',
                    }}
                    transition={{
                        type: 'spring',
                        stiffness: 700,
                        damping: 35,
                    }}
                >
                    <AnimatePresence mode="wait">
                        {isDark ? (
                            <motion.div
                                key="moon"
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -20, opacity: 0 }}
                                transition={{ duration: 0.15 }}
                            >
                                <FiMoon className="w-3 h-3 text-indigo-400" />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="sun"
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -20, opacity: 0 }}
                                transition={{ duration: 0.15 }}
                            >
                                <FiSun className="w-3 h-3 text-yellow-500" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </button>
    );
};

export default ThemeToggle;
