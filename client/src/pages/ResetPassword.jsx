import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaArrowRight, FaLock } from 'react-icons/fa';
import { BsLightningChargeFill } from 'react-icons/bs';
import TeacherCharacter from '../components/TeacherCharacter';

const ResetPassword = () => {
    const [formData, setFormData] = useState({ newPassword: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const resetToken = location.state?.resetToken;

    useEffect(() => {
        if (!resetToken) {
            navigate('/login');
        }
    }, [resetToken, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.newPassword !== formData.confirmPassword) {
            return setError('Passwords do not match');
        }

        if (formData.newPassword.length < 6) {
            return setError('Password must be at least 6 characters');
        }

        setIsLoading(true);

        try {
            await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/auth/reset-password`, {
                resetToken,
                newPassword: formData.newPassword
            });
            // Password reset successful, navigate to login
            navigate('/login', { state: { message: 'Password reset successfully. Please log in with your new password.' } });
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally {
            setIsLoading(false);
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
                    </motion.div>

                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3 sm:mb-4 tracking-tight leading-tight">
                        Set New Password
                    </h2>
                    <p className="text-slate-400 text-sm sm:text-base mb-6 sm:mb-8">
                        Enter your new password below to regain access to your account.
                    </p>
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
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 ml-1">New Password</label>
                        <div className="relative">
                            <FaLock className="absolute top-4 left-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                            <input
                                type="password"
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                className="w-full input-glass pl-12 pr-4 py-3.5 rounded-xl focus:outline-none"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>
                    <div className="group">
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 ml-1">Confirm Password</label>
                        <div className="relative">
                            <FaLock className="absolute top-4 left-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
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
                        disabled={isLoading}
                        className={`w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 group transition-all mt-4 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {isLoading ? 'Resetting...' : 'Reset Password'}
                        {!isLoading && <FaArrowRight className="group-hover:translate-x-1 transition-transform" />}
                    </motion.button>
                </form>
            </motion.div>

            {/* Right: Animated Teacher Character */}
            <div className="hidden lg:flex relative items-center justify-center bg-gradient-to-br from-slate-900 to-indigo-950 overflow-hidden">
                <div className="absolute inset-0 opacity-30">
                    <div className="absolute top-10 left-10 w-20 h-20 bg-indigo-400 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-20 right-20 w-32 h-32 bg-purple-400 rounded-full blur-3xl"></div>
                    <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-cyan-400 rounded-full blur-3xl"></div>
                </div>

                <div className="relative z-10 w-full max-w-lg px-8">
                    <TeacherCharacter className="w-full h-auto" />
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
