import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();

    const token = localStorage.getItem('token');

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0);
        };

        window.addEventListener('scroll', handleScroll);

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMobileMenuOpen]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    const hiddenRoutes = [
        '/login',
        '/signup',
        '/forgot-password',
        '/verify-otp',
        '/reset-password',
        '/verify-email',
    ];

    if (hiddenRoutes.includes(location.pathname)) {
        return null;
    }

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Features', path: '/features' },
        { name: 'About', path: '/about' },
    ];

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                isMobileMenuOpen
                    ? 'bottom-0 bg-white dark:bg-[var(--bg-primary)]'
                    : isScrolled
                    ? 'bg-white/80 dark:bg-[var(--bg-primary)]/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/10 shadow-lg overflow-hidden'
                    : 'bg-white/70 dark:bg-[var(--bg-primary)]/70 backdrop-blur-md'
            }`}
        >
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="flex items-center justify-between h-14">

                    {/* Logo */}
                    <Link
                        to="/"
                        className="flex items-center space-x-2 group"
                    >
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform">
                            <svg
                                className="w-5 h-5 text-[var(--text-primary)]"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" />
                            </svg>
                        </div>

                        <span className="text-xl font-bold text-slate-900 dark:text-[var(--text-primary)]">
                            EduBoard
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`text-sm font-medium transition-colors ${
                                    location.pathname === link.path
                                        ? 'text-indigo-600 dark:text-indigo-400'
                                        : 'text-slate-700 dark:text-[var(--text-secondary)] hover:text-indigo-500 dark:hover:text-[var(--text-primary)]'
                                }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    {/* Desktop Right Section */}
                    <div className="hidden md:flex items-center space-x-4">

                        {/* Theme Toggle */}
                        <ThemeToggle />

                        {token ? (
                            <>
                                <Link
                                    to="/dashboard"
                                    className="px-4 py-2 text-sm font-medium text-slate-900 dark:text-[var(--text-primary)] hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors"
                                >
                                    Dashboard
                                </Link>

                                <button
                                    onClick={handleLogout}
                                    className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-[var(--text-secondary)] hover:text-indigo-500 dark:hover:text-[var(--text-primary)] transition-colors"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="px-4 py-2 text-sm font-medium text-slate-900 dark:text-[var(--text-primary)] hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors"
                                >
                                    Login
                                </Link>

                                <Link
                                    to="/signup"
                                    className="px-6 py-2 text-sm font-medium text-[var(--text-primary)] bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg shadow-indigo-500/30"
                                >
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Right */}
                    <div className="flex md:hidden items-center space-x-2">

                        {/* Mobile Theme Toggle */}
                        <ThemeToggle />

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() =>
                                setIsMobileMenuOpen(!isMobileMenuOpen)
                            }
                            className="p-2 text-slate-900 dark:text-[var(--text-primary)] hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors"
                        >
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                {isMobileMenuOpen ? (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                ) : (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden fixed inset-0 top-16 z-40 bg-white dark:bg-[var(--bg-primary)] px-6 py-4 border-t border-slate-200 dark:border-white/10 overflow-y-auto">

                        <div className="flex flex-col space-y-4">

                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={() =>
                                        setIsMobileMenuOpen(false)
                                    }
                                    className={`text-sm font-medium transition-colors ${
                                        location.pathname === link.path
                                            ? 'text-indigo-600 dark:text-indigo-400'
                                            : 'text-slate-700 dark:text-[var(--text-secondary)] hover:text-indigo-500 dark:hover:text-[var(--text-primary)]'
                                    }`}
                                >
                                    {link.name}
                                </Link>
                            ))}

                            <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex flex-col space-y-3">

                                {token ? (
                                    <>
                                        <Link
                                            to="/dashboard"
                                            onClick={() =>
                                                setIsMobileMenuOpen(false)
                                            }
                                            className="px-4 py-2 text-sm font-medium text-[var(--text-primary)] bg-indigo-600/90 rounded-lg hover:bg-indigo-600 transition-colors text-center"
                                        >
                                            Dashboard
                                        </Link>

                                        <button
                                            onClick={() => {
                                                handleLogout();
                                                setIsMobileMenuOpen(false);
                                            }}
                                            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-[var(--text-secondary)] hover:text-indigo-500 dark:hover:text-[var(--text-primary)] transition-colors text-center"
                                        >
                                            Logout
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            to="/login"
                                            onClick={() =>
                                                setIsMobileMenuOpen(false)
                                            }
                                            className="px-4 py-2 text-sm font-medium text-slate-900 dark:text-[var(--text-primary)] hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors text-center"
                                        >
                                            Login
                                        </Link>

                                        <Link
                                            to="/signup"
                                            onClick={() =>
                                                setIsMobileMenuOpen(false)
                                            }
                                            className="px-6 py-2 text-sm font-medium text-[var(--text-primary)] bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg shadow-indigo-500/30 text-center"
                                        >
                                            Sign Up
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;