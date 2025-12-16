import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaArrowRight, FaUser, FaEnvelope, FaLock } from 'react-icons/fa';
import { BsLightningChargeFill, BsRocketTakeoff } from 'react-icons/bs';

const Signup = () => {
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/register`, formData);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
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
                        Start your <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Journey.</span>
                    </h2>
                    <p className="text-slate-400 text-lg mb-8">Join the platform redefining digital collaboration.</p>
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

                <form onSubmit={handleSubmit} className="space-y-5 max-w-sm">
                    <div className="group">
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 ml-1">Username</label>
                        <div className="relative">
                            <FaUser className="absolute top-4 left-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className="w-full input-glass pl-12 pr-4 py-3.5 rounded-xl focus:outline-none"
                                placeholder="Student Name"
                                required
                            />
                        </div>
                    </div>
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
                        Create Account <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                </form>

                <p className="mt-10 text-slate-500 text-center text-sm">
                    Already have an account?{' '}
                    <Link to="/login" className="text-white hover:text-indigo-300 transition-colors font-medium border-b border-indigo-500/30 hover:border-indigo-500">
                        Sign In
                    </Link>
                </p>
            </motion.div>

            {/* Right: Minimal Visual */}
            <div className="hidden lg:flex relative items-center justify-center overflow-hidden">
                {/* Grid Background */}
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

                {/* Subject Icons */}
                <div className="relative z-10 grid grid-cols-2 gap-6 max-w-sm">
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="backdrop-blur-xl bg-white/5 border border-white/10 p-8 rounded-2xl text-center"
                    >
                        <div className="text-5xl mb-3">📐</div>
                        <div className="text-white font-medium text-sm">Math</div>
                    </motion.div>

                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="backdrop-blur-xl bg-white/5 border border-white/10 p-8 rounded-2xl text-center"
                    >
                        <div className="text-5xl mb-3">🔬</div>
                        <div className="text-white font-medium text-sm">Science</div>
                    </motion.div>

                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="backdrop-blur-xl bg-white/5 border border-white/10 p-8 rounded-2xl text-center"
                    >
                        <div className="text-5xl mb-3">📚</div>
                        <div className="text-white font-medium text-sm">History</div>
                    </motion.div>

                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="backdrop-blur-xl bg-white/5 border border-white/10 p-8 rounded-2xl text-center"
                    >
                        <div className="text-5xl mb-3">🎨</div>
                        <div className="text-white font-medium text-sm">Art</div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
