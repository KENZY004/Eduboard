import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { motion } from 'framer-motion';
import { BsLightningChargeFill } from 'react-icons/bs';
import { FaCheckCircle, FaClock, FaTimesCircle } from 'react-icons/fa';

const VerificationPending = () => {
    const [verificationStatus, setVerificationStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        checkVerificationStatus();
        // Poll every 30 seconds
        const interval = setInterval(checkVerificationStatus, 30000);
        return () => clearInterval(interval);
    }, []);

    const checkVerificationStatus = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const res = await api.get('/api/verification/status');

            setVerificationStatus(res.data);
            setLoading(false);

            // If approved, redirect to dashboard
            if (res.data.isVerified && res.data.verificationStatus === 'approved') {
                navigate('/dashboard');
            }
        } catch (err) {
            console.error('Failed to check verification status:', err);
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center transition-colors duration-300">
                <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 transition-colors duration-300">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl w-full"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                            <BsLightningChargeFill className="text-white text-2xl" />
                        </div>
                        <span className="font-bold text-3xl text-slate-900 dark:text-white tracking-tight">EduBoard</span>
                    </div>
                </div>

                {/* Status Card */}
                <div className="bg-white dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl dark:shadow-indigo-500/5 transition-all duration-300">
                    {verificationStatus?.verificationStatus === 'pending' && (
                        <>
                            <div className="text-center mb-6">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                    className="inline-block mb-4"
                                >
                                    <FaClock className="text-6xl text-yellow-500" />
                                </motion.div>
                                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Verification Pending</h1>
                                <p className="text-slate-600 dark:text-slate-400 font-medium">Your teacher account is under active review</p>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 mb-6">
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">What's Next?</h2>
                                <ul className="space-y-4">
                                    <li className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-full bg-cyan-100 dark:bg-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <div className="w-2 h-2 rounded-full bg-cyan-600 dark:bg-cyan-400"></div>
                                        </div>
                                        <span className="text-slate-700 dark:text-slate-300 font-medium">Our admin team is reviewing your submitted documents</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <div className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400"></div>
                                        </div>
                                        <span className="text-slate-700 dark:text-slate-300 font-medium">You'll receive an email notification once your account is approved</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <div className="w-2 h-2 rounded-full bg-purple-600 dark:bg-purple-400"></div>
                                        </div>
                                        <span className="text-slate-700 dark:text-slate-300 font-medium">This page will automatically update when your status changes</span>
                                    </li>
                                </ul>
                            </div>

                            {verificationStatus?.documentsUploaded && (
                                <div className="bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-2xl p-4 mb-6">
                                    <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                                        <FaCheckCircle className="text-xl" />
                                        <span className="font-bold">Documents Received</span>
                                    </div>
                                    <p className="text-sm text-green-600 dark:text-green-300/70 mt-1.5 font-medium">
                                        {verificationStatus.documents.length} document(s) are currently in the queue for verification
                                    </p>
                                </div>
                            )}
                        </>
                    )}

                    {verificationStatus?.verificationStatus === 'rejected' && (
                        <>
                            <div className="text-center mb-6">
                                <FaTimesCircle className="text-6xl text-red-500 mx-auto mb-4" />
                                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Application Denied</h1>
                                <p className="text-slate-600 dark:text-slate-400 font-medium">Your teacher verification was not approved</p>
                            </div>

                            {verificationStatus.rejectionReason && (
                                <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl p-6 mb-6 shadow-sm">
                                    <h3 className="font-bold text-red-700 dark:text-red-400 mb-2 uppercase tracking-widest text-[10px]">Reason for Rejection</h3>
                                    <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">{verificationStatus.rejectionReason}</p>
                                </div>
                            )}

                            <p className="text-slate-500 dark:text-slate-400 text-center mb-8 font-medium">
                                If you believe this is an error, please reach out to our help center.
                            </p>
                        </>
                    )}

                    {/* Logout Button */}
                    <button
                        onClick={handleLogout}
                        className="w-full bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white font-bold py-4 rounded-2xl transition-all shadow-lg active:scale-[0.98] tracking-widest uppercase text-xs"
                    >
                        Sign Out
                    </button>
                </div>

                {/* Auto-refresh indicator */}
                <div className="flex items-center justify-center gap-3 mt-6">
                    <div className="relative">
                        <div className="w-2.5 h-2.5 bg-cyan-500 rounded-full"></div>
                        <div className="absolute inset-0 w-2.5 h-2.5 bg-cyan-500 rounded-full animate-ping opacity-75"></div>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                        Syncing in real-time • Updates every 30s
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default VerificationPending;
