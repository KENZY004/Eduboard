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
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
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
                        <span className="font-bold text-3xl text-white tracking-tight">EduBoard</span>
                    </div>
                </div>

                {/* Status Card */}
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 shadow-2xl">
                    {verificationStatus?.verificationStatus === 'pending' && (
                        <>
                            <div className="text-center mb-6">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    className="inline-block mb-4"
                                >
                                    <FaClock className="text-6xl text-yellow-400" />
                                </motion.div>
                                <h1 className="text-3xl font-bold text-white mb-2">Verification Pending</h1>
                                <p className="text-slate-400">Your teacher account is under review</p>
                            </div>

                            <div className="bg-slate-900/50 rounded-xl p-6 mb-6">
                                <h2 className="text-lg font-semibold text-white mb-4">What's Next?</h2>
                                <ul className="space-y-3 text-slate-300">
                                    <li className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                                        </div>
                                        <span>Our admin team is reviewing your submitted documents</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                                        </div>
                                        <span>You'll receive an email notification once your account is approved</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                                        </div>
                                        <span>This page will automatically update when your status changes</span>
                                    </li>
                                </ul>
                            </div>

                            {verificationStatus?.documentsUploaded && (
                                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-6">
                                    <div className="flex items-center gap-2 text-green-400">
                                        <FaCheckCircle />
                                        <span className="font-semibold">Documents Uploaded Successfully</span>
                                    </div>
                                    <p className="text-sm text-green-300/70 mt-2">
                                        {verificationStatus.documents.length} document(s) submitted for review
                                    </p>
                                </div>
                            )}
                        </>
                    )}

                    {verificationStatus?.verificationStatus === 'rejected' && (
                        <>
                            <div className="text-center mb-6">
                                <FaTimesCircle className="text-6xl text-red-400 mx-auto mb-4" />
                                <h1 className="text-3xl font-bold text-white mb-2">Application Not Approved</h1>
                                <p className="text-slate-400">Your teacher verification was not approved</p>
                            </div>

                            {verificationStatus.rejectionReason && (
                                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
                                    <h3 className="font-semibold text-red-400 mb-2">Reason:</h3>
                                    <p className="text-slate-300">{verificationStatus.rejectionReason}</p>
                                </div>
                            )}

                            <p className="text-slate-400 text-center mb-6">
                                If you believe this is an error, please contact our support team.
                            </p>
                        </>
                    )}

                    {/* Logout Button */}
                    <button
                        onClick={handleLogout}
                        className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 rounded-xl transition-colors"
                    >
                        Logout
                    </button>
                </div>

                {/* Auto-refresh indicator */}
                <p className="text-center text-slate-500 text-sm mt-4">
                    <span className="inline-block w-2 h-2 bg-cyan-400 rounded-full animate-pulse mr-2"></span>
                    Auto-refreshing every 30 seconds
                </p>
            </motion.div>
        </div>
    );
};

export default VerificationPending;
