import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaArrowRight, FaKey } from 'react-icons/fa';
import { BsLightningChargeFill } from 'react-icons/bs';
import StudentCharacter from '../components/StudentCharacter';

const VerifyRegistrationOTP = () => {
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [resendTimer, setResendTimer] = useState(60);
    const hasAutoSent = useRef(false);

    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;

    useEffect(() => {
        if (!email) {
            navigate('/signup');
            return;
        }

        if (location.state?.autoSend && !hasAutoSent.current) {
            hasAutoSent.current = true;
            const triggerAutoSend = async () => {
                setError('');
                setSuccessMessage('');
                setIsResending(true);
                try {
                    await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/resend-registration-otp`, { email });
                    setSuccessMessage('A fresh verification code has been sent to your email.');
                    setResendTimer(60);
                } catch (err) {
                    setError(err.response?.data?.message || 'Failed to send verification code. Please try resending manually.');
                } finally {
                    setIsResending(false);
                }
            };
            triggerAutoSend();
        }
    }, [email, navigate, location.state]);

    useEffect(() => {
        let interval;
        if (resendTimer > 0) {
            interval = setInterval(() => {
                setResendTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [resendTimer]);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(''), 5000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => setSuccessMessage(''), 5000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/verify-registration-otp`, { email, otp });
            
            // Save token and user info
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));

            // Redirect based on role
            if (res.data.user.role === 'teacher') {
                navigate('/verification-pending');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid or expired verification code');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        if (resendTimer > 0 || isResending) return;

        setError('');
        setSuccessMessage('');
        setIsResending(true);
        try {
            await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/resend-registration-otp`, { email });
            setSuccessMessage('Verification code resent successfully!');
            setResendTimer(60);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to resend verification code. Please try again.');
        } finally {
            setIsResending(false);
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
                        <Link to="/signup" className="text-sm text-slate-400 hover:text-white transition-colors">
                            ← Back to Signup
                        </Link>
                    </motion.div>

                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3 sm:mb-4 tracking-tight leading-tight">
                        Verify Email
                    </h2>
                    <p className="text-slate-400 text-sm sm:text-base mb-6 sm:mb-8">
                        Enter the 6-digit code sent to <span className="font-medium text-white">{email}</span>
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

                {successMessage && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm flex items-center gap-2"
                    >
                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                        {successMessage}
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6 max-w-sm">
                    <div className="group">
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 ml-1">Verification Code</label>
                        <div className="relative">
                            <FaKey className="absolute top-4 left-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                            <input
                                type="text"
                                maxLength="6"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                                className="w-full input-glass pl-12 pr-4 py-3.5 rounded-xl focus:outline-none tracking-[0.5em] font-mono text-lg"
                                placeholder="••••••"
                                required
                            />
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={isLoading || otp.length < 6}
                        className={`w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 group transition-all mt-4 ${(isLoading || otp.length < 6) ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {isLoading ? 'Verifying...' : 'Verify & Activate'}
                        {!isLoading && <FaArrowRight className="group-hover:translate-x-1 transition-transform" />}
                    </motion.button>
                </form>

                <div className="mt-8 flex items-center justify-center space-x-2 text-sm max-w-sm">
                    <span className="text-slate-400">Didn't receive code?</span>
                    <button 
                        onClick={handleResend}
                        disabled={resendTimer > 0 || isResending}
                        className={`font-medium ${(resendTimer > 0 || isResending) ? 'text-slate-500 cursor-not-allowed' : 'text-indigo-400 hover:text-indigo-300 cursor-pointer'}`}
                    >
                        {isResending ? 'Sending...' : resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
                    </button>
                </div>
            </motion.div>

            {/* Right: Animated Student Character */}
            <div className="hidden lg:flex relative items-center justify-center bg-gradient-to-br from-slate-900 to-indigo-950 overflow-hidden">
                <div className="absolute inset-0 opacity-30">
                    <div className="absolute top-10 left-10 w-20 h-20 bg-indigo-400 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-20 right-20 w-32 h-32 bg-purple-400 rounded-full blur-3xl"></div>
                    <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-cyan-400 rounded-full blur-3xl"></div>
                </div>

                <div className="relative z-10 w-full max-w-lg px-8 text-center">
                    <StudentCharacter className="w-full h-auto" />
                    
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="mt-8 text-center"
                    >
                        <h3 className="text-2xl font-bold text-white mb-3">
                            Confirm Your Identity 🔒
                        </h3>
                        <p className="text-slate-300 text-lg">
                            We've sent a 6-digit confirmation code to check that you own this email address.
                        </p>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default VerifyRegistrationOTP;
