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

    const hiddenRoutes = ['/login', '/signup', '/forgot-password', '/verify-otp', '/reset-password', '/verify-email'];
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
                    ? 'bottom-0 bg-white dark:bg-slate-950'
                    : (isScrolled
                        ? 'bg-white/85 backdrop-blur-xl border-b border-slate-200 shadow-lg overflow-hidden dark:bg-slate-950/80 dark:border-white/10'
                        : 'bg-white/70 backdrop-blur-md dark:bg-slate-950/70'
                      )
                }`}
        >
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="flex items-center justify-between h-14">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2 group">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform">
                            <svg
                                className="w-5 h-5 text-white"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" />
                            </svg>
                        </div>
                        <span className="text-xl font-bold text-slate-950 dark:text-white">EduBoard</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`text-sm font-medium transition-colors ${location.pathname === link.path
                                    ? 'text-indigo-600 dark:text-white'
                                    : 'text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white'
                                    }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    {/* Auth Buttons */}
                    <div className="hidden md:flex items-center space-x-4">
                        {token ? (
                            <>
                                <Link
                                    to="/dashboard"
                                    className="px-4 py-2 text-sm font-medium text-slate-800 hover:text-indigo-600 transition-colors dark:text-white dark:hover:text-indigo-300"
                                >
                                    Dashboard
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-950 transition-colors dark:text-slate-300 dark:hover:text-white"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="px-4 py-2 text-sm font-medium text-slate-800 hover:text-indigo-600 transition-colors dark:text-white dark:hover:text-indigo-300"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/signup"
                                    className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg shadow-indigo-500/30"
                                >
                                    Sign Up
                                </Link>
                            </>
                        )}
                        <ThemeToggle />
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden p-2 text-slate-800 hover:text-indigo-600 transition-colors dark:text-white dark:hover:text-indigo-300"
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

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden fixed inset-0 top-16 z-40 bg-white px-6 py-4 border-t border-slate-200 overflow-y-auto dark:bg-slate-950 dark:border-white/10">
                        <div className="flex flex-col space-y-4">
                            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10">
                                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Theme</span>
                                <ThemeToggle />
                            </div>
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`text-sm font-medium transition-colors ${location.pathname === link.path
                                        ? 'text-indigo-600 dark:text-white'
                                        : 'text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white'
                                        }`}
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <div className="pt-4 border-t border-slate-200 flex flex-col space-y-3 dark:border-white/10">
                                {token ? (
                                    <>
                                        <Link
                                            to="/dashboard"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600/20 rounded-lg hover:bg-indigo-600/30 transition-colors text-center"
                                        >
                                            Dashboard
                                        </Link>
                                        <button
                                            onClick={() => {
                                                handleLogout();
                                                setIsMobileMenuOpen(false);
                                            }}
                                            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-950 transition-colors text-center dark:text-slate-300 dark:hover:text-white"
                                        >
                                            Logout
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            to="/login"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="px-4 py-2 text-sm font-medium text-slate-800 hover:text-indigo-600 transition-colors text-center dark:text-white dark:hover:text-indigo-300"
                                        >
                                            Login
                                        </Link>
                                        <Link
                                            to="/signup"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg shadow-indigo-500/30 text-center"
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
