import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaArrowRight, FaLock, FaEnvelope } from 'react-icons/fa';
import { BsLightningChargeFill, BsStars } from 'react-icons/bs';

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
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 overflow-hidden relative">

            {/* Left: Form */}
            <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="flex flex-col justify-center px-8 lg:px-24 py-12 relative z-10 backdrop-blur-sm bg-[#020617]/80"
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

            {/* Right: Abstract Composition */}
            <div className="hidden lg:flex relative items-center justify-center bg-[#020617] overflow-hidden">
                {/* Expanding Rings */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-[800px] h-[800px] border border-white/5 rounded-full absolute animate-[spin_60s_linear_infinite]"></div>
                    <div className="w-[600px] h-[600px] border border-white/5 rounded-full absolute animate-[spin_40s_linear_infinite_reverse]"></div>
                    <div className="w-[400px] h-[400px] border border-white/5 rounded-full absolute animate-[spin_20s_linear_infinite]"></div>
                </div>

                <div className="relative z-10 w-full max-w-md">
                    <motion.div
                        animate={{ y: [0, -20, 0] }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        className="relative"
                    >
                        {/* Glass Card */}
                        <div className="backdrop-blur-xl bg-white/5 border border-white/10 p-8 rounded-3xl shadow-2xl relative z-20">
                            <div className="bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl h-48 w-full mb-6 flex items-center justify-center relative overflow-hidden">
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                                <BsStars className="text-6xl text-white animate-pulse" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Unleash Creativity</h3>
                            <p className="text-slate-400">
                                Join thousands of educators and students transforming the way they learn with our infinite canvas.
                            </p>
                        </div>

                        {/* Floating Badge */}
                        <motion.div
                            animate={{ y: [0, 15, 0], x: [0, 10, 0] }}
                            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                            className="absolute -top-10 -right-10 bg-[#0f172a] p-4 rounded-2xl border border-white/10 shadow-xl z-30"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
                                <span className="text-white font-mono text-sm">System Online</span>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Login;
