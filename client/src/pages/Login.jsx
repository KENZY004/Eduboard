import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaArrowRight, FaLock, FaEnvelope, FaEye, FaEyeSlash } from 'react-icons/fa';
import { BsLightningChargeFill } from 'react-icons/bs';
import TeacherCharacter from '../components/TeacherCharacter';
import StudentCharacter from '../components/StudentCharacter';
import { AnimatePresence } from 'framer-motion';

const GoogleIcon = () => (
    <svg className="w-5 h-5 flex-shrink-0 mr-2" viewBox="0 0 24 24" fill="none">
        <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        />
        <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        />
    </svg>
);

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from || '/dashboard';
    const [successMessage, setSuccessMessage] = useState(location.state?.message || '');
    const [detectedRole, setDetectedRole] = useState(null);
    const [loading, setLoading] = useState(false);
    const [tokenClient, setTokenClient] = useState(null);

    const handleGoogleLogin = async (accessToken) => {
        setError('');
        setLoading(true);
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/google-login`, {
                token: accessToken
            });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            
            if (res.data.user.role === 'admin') {
                navigate('/admin');
            } else {
                navigate(from);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Google login failed');
            setLoading(false);
        }
    };

    useEffect(() => {
        let timer;
        const initializeGoogleClient = () => {
            if (window.google) {
                try {
                    const client = window.google.accounts.oauth2.initTokenClient({
                        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
                        scope: 'openid email profile',
                        callback: async (tokenResponse) => {
                            if (tokenResponse && tokenResponse.access_token) {
                                await handleGoogleLogin(tokenResponse.access_token);
                            }
                        },
                    });
                    setTokenClient(client);
                    if (timer) clearInterval(timer);
                } catch (err) {
                    console.error("Error initializing Google OAuth client:", err);
                }
            }
        };

        initializeGoogleClient();
        timer = setInterval(initializeGoogleClient, 200);

        return () => {
            if (timer) clearInterval(timer);
        };
    }, []);

    const handleGoogleClick = () => {
        if (tokenClient) {
            tokenClient.requestAccessToken();
        } else {
            setError("Google sign-in is not ready yet. Please try again.");
        }
    };

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

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (e.target.name === 'email' && !e.target.value.trim()) {
            setDetectedRole(null);
        }
    };

    const handleEmailBlur = async () => {
        const trimmedEmail = formData.email.trim();
        if (!trimmedEmail) {
            setDetectedRole(null);
            return;
        }

        try {
            const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/check-role`, {
                email: trimmedEmail
            });
            // Prevent race conditions where email has changed while request was in flight
            if (formData.email.trim() === trimmedEmail) {
                if (res.data && res.data.role) {
                    setDetectedRole(res.data.role);
                } else {
                    setDetectedRole(null);
                }
            }
        } catch (err) {
            if (formData.email.trim() === trimmedEmail) {
                setDetectedRole(null);
            }
        }
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

            if (errorData?.error === 'EMAIL_NOT_VERIFIED') {
                setError(
                    <span>
                        {errorData.message}{' '}
                        <button
                            type="button"
                            onClick={() => navigate('/verify-email', { state: { email: errorData.email, autoSend: true } })}
                            className="underline cursor-pointer text-indigo-400 hover:text-indigo-300 font-semibold bg-transparent border-none p-0 inline"
                        >
                            Verify Now.
                        </button>
                    </span>
                );
            } else if (errorData?.error === 'ACCOUNT_NOT_VERIFIED') {
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

                {successMessage && !error && (
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
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 ml-1">Email Address</label>
                        <div className="relative">
                            <FaEnvelope className="absolute top-4 left-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                onBlur={handleEmailBlur}
                                className="w-full input-glass pl-12 pr-4 py-3.5 rounded-xl focus:outline-none"
                                placeholder="name@example.com"
                                required
                            />
                        </div>
                    </div>
                    <div className="group">
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Password</label>
                            <Link to="/forgot-password" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                                Forgot Password?
                            </Link>
                        </div>
                        <div className="relative">
                            <FaLock className="absolute top-4 left-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full input-glass pl-12 pr-12 py-3.5 rounded-xl focus:outline-none"
                                placeholder="••••••••"
                                required
                            />
                            {showPassword ? (
                                <FaEyeSlash className="absolute top-4 right-4 text-slate-500 cursor-pointer" onClick={() => setShowPassword(false)} />
                            ) : (
                                <FaEye className="absolute top-4 right-4 text-slate-500 cursor-pointer" onClick={() => setShowPassword(true)} />
                            )}
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: loading ? 1 : 1.02 }}
                        whileTap={{ scale: loading ? 1 : 0.98 }}
                        type="submit"
                        disabled={loading}
                        className={`w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 group transition-all mt-4 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Processing...
                            </>
                        ) : (
                            <>
                                Sign In Details <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </motion.button>
                </form>

                <div className="mt-4 max-w-sm">
                    <div className="flex items-center my-4">
                        <div className="flex-grow border-t border-slate-800/60"></div>
                        <span className="px-3 text-slate-500 text-xs uppercase tracking-wider">or</span>
                        <div className="flex-grow border-t border-slate-800/60"></div>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.02, boxShadow: '0 0 15px rgba(99, 102, 241, 0.15)' }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={handleGoogleClick}
                        disabled={loading}
                        className={`w-full bg-slate-800/40 hover:bg-slate-800/60 text-white font-semibold py-4 rounded-xl border border-slate-700/80 hover:border-slate-600 flex items-center justify-center gap-2 transition-all ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <GoogleIcon />
                        Continue with Google
                    </motion.button>
                </div>

                <p className="mt-8 text-slate-500 text-center text-sm">
                    New to EduBoard?{' '}
                    <Link to="/signup" className="text-white hover:text-indigo-300 transition-colors font-medium border-b border-indigo-500/30 hover:border-indigo-500">
                        Create an account
                    </Link>
                </p>
            </motion.div>

            {/* Right: Dynamic Character and Theme */}
            <div className="hidden lg:flex relative items-center justify-center overflow-hidden">
                {/* Background transitions */}
                {/* Default Gradient */}
                <div 
                    className={`absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-950 transition-opacity duration-700 ease-in-out ${
                        detectedRole === null ? 'opacity-100' : 'opacity-0'
                    }`}
                />
                {/* Student Gradient */}
                <div 
                    className={`absolute inset-0 bg-gradient-to-br from-slate-900 to-cyan-950 transition-opacity duration-700 ease-in-out ${
                        detectedRole === 'student' ? 'opacity-100' : 'opacity-0'
                    }`}
                />
                {/* Teacher Gradient */}
                <div 
                    className={`absolute inset-0 bg-gradient-to-br from-slate-900 to-indigo-950 transition-opacity duration-700 ease-in-out ${
                        detectedRole === 'teacher' || detectedRole === 'admin' ? 'opacity-100' : 'opacity-0'
                    }`}
                />

                {/* Decorative background elements - Default Theme */}
                <div 
                    className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                        detectedRole === null ? 'opacity-30' : 'opacity-0 pointer-events-none'
                    }`}
                >
                    <div className="absolute top-10 left-10 w-20 h-20 bg-slate-700 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-20 right-20 w-32 h-32 bg-slate-800 rounded-full blur-3xl"></div>
                    <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-indigo-950 rounded-full blur-3xl"></div>
                </div>

                {/* Decorative background elements - Student Theme */}
                <div 
                    className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                        detectedRole === 'student' ? 'opacity-30' : 'opacity-0 pointer-events-none'
                    }`}
                >
                    <div className="absolute top-10 right-10 w-24 h-24 bg-cyan-400 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-20 left-20 w-32 h-32 bg-blue-400 rounded-full blur-3xl"></div>
                    <div className="absolute top-1/2 right-1/3 w-20 h-20 bg-purple-400 rounded-full blur-3xl"></div>
                </div>

                {/* Decorative background elements - Teacher Theme */}
                <div 
                    className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                        detectedRole === 'teacher' || detectedRole === 'admin' ? 'opacity-30' : 'opacity-0 pointer-events-none'
                    }`}
                >
                    <div className="absolute top-10 left-10 w-20 h-20 bg-indigo-400 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-20 right-20 w-32 h-32 bg-purple-400 rounded-full blur-3xl"></div>
                    <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-cyan-400 rounded-full blur-3xl"></div>
                </div>

                <div className="relative z-10 w-full max-w-lg px-8">
                    <AnimatePresence mode="wait">
                        {detectedRole === 'student' ? (
                            <motion.div
                                key="student-login-panel"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.4 }}
                                className="flex flex-col items-center"
                            >
                                <StudentCharacter className="w-full h-auto" />
                                <div className="mt-8 text-center">
                                    <h3 className="text-2xl font-bold text-white mb-3">
                                        Welcome Back, Scholar! 🚀
                                    </h3>
                                    <p className="text-slate-300 text-lg">
                                        Jump back into your boards and collaborate with teachers and peers.
                                    </p>
                                </div>
                            </motion.div>
                        ) : detectedRole === 'teacher' || detectedRole === 'admin' ? (
                            <motion.div
                                key="teacher-login-panel"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.4 }}
                                className="flex flex-col items-center"
                            >
                                <TeacherCharacter className="w-full h-auto" />
                                <div className="mt-8 text-center">
                                    <h3 className="text-2xl font-bold text-white mb-3">
                                        Welcome Back, Educator! 🎓
                                    </h3>
                                    <p className="text-slate-300 text-lg">
                                        Continue inspiring students with interactive lessons
                                    </p>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="default-login-panel"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.4 }}
                                className="flex flex-col items-center"
                            >
                                <TeacherCharacter className="w-full h-auto" />
                                <div className="mt-8 text-center">
                                    <h3 className="text-2xl font-bold text-white mb-3">
                                        Welcome to EduBoard! 👋
                                    </h3>
                                    <p className="text-slate-300 text-lg">
                                        Access your high-performance collaborative digital workspace.
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default Login;
