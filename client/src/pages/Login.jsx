import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaArrowRight, FaLock, FaEnvelope, FaPencilAlt, FaUsers, FaInfinity } from 'react-icons/fa';
import { BsLightningChargeFill } from 'react-icons/bs';
import { HiOutlineSparkles } from 'react-icons/hi';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/login`, formData);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 overflow-hidden relative bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#1e1b4b]">

            {/* Left: Form */}
            <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="flex flex-col justify-center px-8 lg:px-24 py-12 relative z-10"
            >
                <div>
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex items-center gap-2 mb-12"
                    >
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                            <BsLightningChargeFill className="text-white text-xl" />
                        </div>
                        <span className="font-bold text-2xl text-white tracking-tight">EduBoard</span>
                    </motion.div>

                    <h2 className="text-5xl font-bold text-white mb-4 tracking-tight leading-tight">
                        Welcome back to <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Infinity.</span>
                    </h2>
                    <p className="text-slate-400 text-lg mb-8">Login to access your high-performance workspace.</p>
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
                        Sign In <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                </form>

                <p className="mt-10 text-slate-500 text-center text-sm">
                    New to EduBoard?{' '}
                    <Link to="/signup" className="text-white hover:text-indigo-300 transition-colors font-medium border-b border-indigo-500/30 hover:border-indigo-500">
                        Create an account
                    </Link>
                </p>
            </motion.div>

            {/* Right: Education Theme */}
            <div className="hidden lg:flex relative items-center justify-center overflow-hidden">
                {/* Subtle Grid Background */}
                <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: `
                        linear-gradient(to right, rgba(99, 102, 241, 0.1) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(99, 102, 241, 0.1) 1px, transparent 1px)
                    `,
                    backgroundSize: '60px 60px'
                }}></div>

                {/* Gradient Orbs */}
                <div className="absolute top-20 right-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 left-20 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"></div>

                <div className="relative z-10 w-full max-w-lg px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                        className="space-y-6"
                    >
                        {/* Stats Row */}
                        <div className="grid grid-cols-3 gap-4 mb-8">
                            <motion.div
                                whileHover={{ y: -5 }}
                                className="backdrop-blur-xl bg-white/5 border border-white/10 p-5 rounded-2xl text-center"
                            >
                                <div className="text-3xl font-bold text-white mb-1">∞</div>
                                <div className="text-xs text-slate-400 uppercase tracking-wider">Canvas</div>
                            </motion.div>
                            <motion.div
                                whileHover={{ y: -5 }}
                                className="backdrop-blur-xl bg-white/5 border border-white/10 p-5 rounded-2xl text-center"
                            >
                                <div className="text-3xl font-bold text-indigo-400 mb-1">24/7</div>
                                <div className="text-xs text-slate-400 uppercase tracking-wider">Access</div>
                            </motion.div>
                            <motion.div
                                whileHover={{ y: -5 }}
                                className="backdrop-blur-xl bg-white/5 border border-white/10 p-5 rounded-2xl text-center"
                            >
                                <div className="text-3xl font-bold text-purple-400 mb-1">RT</div>
                                <div className="text-xs text-slate-400 uppercase tracking-wider">Sync</div>
                            </motion.div>
                        </div>

                        {/* Education-themed highlights */}
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="backdrop-blur-xl bg-white/5 border border-white/10 p-6 rounded-2xl"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-lg">
                                    📚
                                </div>
                                <h3 className="text-white font-semibold">For Learning</h3>
                            </div>
                            <p className="text-slate-400 text-sm">Visual thinking space for students and educators</p>
                        </motion.div>

                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="backdrop-blur-xl bg-white/5 border border-white/10 p-6 rounded-2xl"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-lg">
                                    ✏️
                                </div>
                                <h3 className="text-white font-semibold">Interactive Canvas</h3>
                            </div>
                            <p className="text-slate-400 text-sm">Draw, annotate, and collaborate in real-time</p>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Login;
