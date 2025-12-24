import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaArrowRight, FaLock, FaEnvelope } from 'react-icons/fa';
import { BsLightningChargeFill } from 'react-icons/bs';
import TeacherCharacter from '../components/TeacherCharacter';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from || '/dashboard';
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/login`, formData);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));

            // Redirect based on role
            if (res.data.user.role === 'admin') {
                navigate('/admin');
            } else {
                navigate(from);
            }
        } catch (err) {
            const errorData = err.response?.data;

            // Check if it's an unverified teacher
            if (errorData?.error === 'ACCOUNT_NOT_VERIFIED') {
                // Store token temporarily for verification page
                if (err.response?.data?.token) {
                    localStorage.setItem('token', err.response.data.token);
                }
                setError(errorData.message);
                // Redirect to verification pending page after showing error
                setTimeout(() => {
                    navigate('/verification-pending');
                }, 2000);
            } else {
                setError(errorData?.message || 'Login failed');
            }
        }
    };

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 overflow-hidden relative">

            {/* Left: Form */}
            <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="flex flex-col justify-center px-6 sm:px-8 lg:px-24 py-8 sm:py-12 relative z-10 backdrop-blur-sm bg-slate-900/90"
            >
                <div>
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex items-center justify-between mb-8 sm:mb-12"
                    >
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                                <BsLightningChargeFill className="text-white text-lg sm:text-xl" />
                            </div>
                            <span className="font-bold text-xl sm:text-2xl text-white tracking-tight">EduBoard</span>
                        </div>
                        <Link to="/" className="text-sm text-slate-400 hover:text-white transition-colors">
                            ← Back to Home
                        </Link>
                    </motion.div>

                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4 tracking-tight leading-tight">
                        Welcome back to <br className="hidden sm:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Infinity.</span>
                    </h2>
                    <p className="text-slate-400 text-sm sm:text-base lg:text-lg mb-6 sm:mb-8">Login to access your high-performance workspace.</p>
                </div>

                {error && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-2"
                    >
                        <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></div>
                        {error}
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6 max-w-sm">
                    <div className="group">
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 ml-1">Email Address</label>
                        <div className="relative">
                            <FaEnvelope className="absolute top-4 left-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full input-glass pl-12 pr-4 py-3.5 rounded-xl focus:outline-none"
                                placeholder="name@example.com"
                                required
                            />
                        </div>
                    </div>
                    <div className="group">
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 ml-1">Password</label>
                        <div className="relative">
                            <FaLock className="absolute top-4 left-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full input-glass pl-12 pr-4 py-3.5 rounded-xl focus:outline-none"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 group transition-all mt-4"
                    >
                        Sign In Details <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                </form>

                <p className="mt-10 text-slate-500 text-center text-sm">
                    New to EduBoard?{' '}
                    <Link to="/signup" className="text-white hover:text-indigo-300 transition-colors font-medium border-b border-indigo-500/30 hover:border-indigo-500">
                        Create an account
                    </Link>
                </p>
            </motion.div>

            {/* Right: Animated Teacher Character */}
            <div className="hidden lg:flex relative items-center justify-center bg-gradient-to-br from-slate-900 to-indigo-950 overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute inset-0 opacity-30">
                    <div className="absolute top-10 left-10 w-20 h-20 bg-indigo-400 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-20 right-20 w-32 h-32 bg-purple-400 rounded-full blur-3xl"></div>
                    <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-cyan-400 rounded-full blur-3xl"></div>
                </div>

                <div className="relative z-10 w-full max-w-lg px-8">
                    <TeacherCharacter className="w-full h-auto" />

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="mt-8 text-center"
                    >
                        <h3 className="text-2xl font-bold text-white mb-3">
                            Welcome Back, Educator! 👋
                        </h3>
                        <p className="text-slate-300 text-lg">
                            Continue inspiring students with interactive lessons
                        </p>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Login;
