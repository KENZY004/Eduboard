import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaArrowRight, FaUser, FaEnvelope, FaLock } from 'react-icons/fa';
import { BsLightningChargeFill } from 'react-icons/bs';
import StudentCharacter from '../components/StudentCharacter';

const Signup = () => {
    const [formData, setFormData] = useState({ username: '', email: '', password: '', role: 'student' });
    const [documents, setDocuments] = useState({
        id_proof: null,
        teaching_certificate: null,
        degree: null
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        if (files && files[0]) {
            setDocuments({ ...documents, [name]: files[0] });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Step 1: Register user
            const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/register`, formData);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));

            // Step 2: If teacher, upload documents
            if (formData.role === 'teacher') {
                // Validate documents
                if (!documents.id_proof || !documents.teaching_certificate) {
                    setError('Please upload ID proof and teaching certificate');
                    setLoading(false);
                    return;
                }

                const formDataUpload = new FormData();
                formDataUpload.append('id_proof', documents.id_proof);
                formDataUpload.append('teaching_certificate', documents.teaching_certificate);
                if (documents.degree) {
                    formDataUpload.append('degree', documents.degree);
                }

                await axios.post(
                    `${import.meta.env.VITE_API_BASE_URL}/api/verification/upload-documents`,
                    formDataUpload,
                    {
                        headers: {
                            'Authorization': `Bearer ${res.data.token}`,
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                );

                // Redirect to verification pending page
                navigate('/verification-pending');
            } else {
                // Student - redirect to dashboard
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
            setLoading(false);
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
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                                <BsLightningChargeFill className="text-white text-lg sm:text-xl" />
                            </div>
                            <span className="font-bold text-xl sm:text-2xl text-white tracking-tight">EduBoard</span>
                        </div>
                        <Link to="/" className="text-sm text-slate-400 hover:text-white transition-colors">
                            ← Back to Home
                        </Link>
                    </motion.div>

                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4 tracking-tight leading-tight">
                        Start your <br className="hidden sm:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Journey.</span>
                    </h2>
                    <p className="text-slate-400 text-sm sm:text-base lg:text-lg mb-6 sm:mb-8">Join the platform redefining digital collaboration.</p>
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
                            <FaUser className="absolute top-4 left-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className="w-full input-glass pl-12 pr-4 py-3.5 rounded-xl focus:outline-none"
                                placeholder={formData.role === 'teacher' ? 'Teacher Name' : 'Student Name'}
                                required
                            />
                        </div>
                    </div>
                    <div className="group">
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 ml-1">Email Address</label>
                        <div className="relative">
                            <FaEnvelope className="absolute top-4 left-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
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
                            <FaLock className="absolute top-4 left-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
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

                    {/* Role Selection */}
                    <div className="group">
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 ml-1">I am a</label>
                        <div className="grid grid-cols-2 gap-3">
                            <label className={`relative flex items-center justify-center p-4 rounded-xl cursor-pointer transition-all ${formData.role === 'student'
                                ? 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-2 border-cyan-500'
                                : 'bg-slate-800/50 border-2 border-slate-700 hover:border-slate-600'
                                }`}>
                                <input
                                    type="radio"
                                    name="role"
                                    value="student"
                                    checked={formData.role === 'student'}
                                    onChange={handleChange}
                                    className="sr-only"
                                />
                                <div className="text-center">
                                    <div className="text-2xl mb-1">🎓</div>
                                    <div className="font-semibold text-white">Student</div>
                                </div>
                            </label>
                            <label className={`relative flex items-center justify-center p-4 rounded-xl cursor-pointer transition-all ${formData.role === 'teacher'
                                ? 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-2 border-cyan-500'
                                : 'bg-slate-800/50 border-2 border-slate-700 hover:border-slate-600'
                                }`}>
                                <input
                                    type="radio"
                                    name="role"
                                    value="teacher"
                                    checked={formData.role === 'teacher'}
                                    onChange={handleChange}
                                    className="sr-only"
                                />
                                <div className="text-center">
                                    <div className="text-2xl mb-1">👨‍🏫</div>
                                    <div className="font-semibold text-white">Teacher</div>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Document Upload for Teachers */}
                    {formData.role === 'teacher' && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-4 p-4 bg-slate-800/30 rounded-xl border border-slate-700"
                        >
                            <h3 className="text-sm font-semibold text-cyan-400 flex items-center gap-2">
                                📄 Verification Documents
                            </h3>
                            <p className="text-xs text-slate-400">Upload documents to verify your teacher status</p>

                            {/* ID Proof */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-2">
                                    ID Proof <span className="text-red-400">*</span>
                                </label>
                                <label className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-cyan-500 cursor-pointer transition-colors">
                                    <div className="text-cyan-400">📎</div>
                                    <input
                                        type="file"
                                        name="id_proof"
                                        onChange={handleFileChange}
                                        accept=".jpg,.jpeg,.png,.pdf"
                                        className="hidden"
                                    />
                                    <span className="text-sm text-slate-300 truncate">
                                        {documents.id_proof ? documents.id_proof.name : 'Choose file...'}
                                    </span>
                                </label>
                            </div>

                            {/* Teaching Certificate */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-2">
                                    Teaching Certificate <span className="text-red-400">*</span>
                                </label>
                                <label className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-cyan-500 cursor-pointer transition-colors">
                                    <div className="text-cyan-400">📎</div>
                                    <input
                                        type="file"
                                        name="teaching_certificate"
                                        onChange={handleFileChange}
                                        accept=".jpg,.jpeg,.png,.pdf"
                                        className="hidden"
                                    />
                                    <span className="text-sm text-slate-300 truncate">
                                        {documents.teaching_certificate ? documents.teaching_certificate.name : 'Choose file...'}
                                    </span>
                                </label>
                            </div>

                            {/* Degree (Optional) */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-2">
                                    Degree (Optional)
                                </label>
                                <label className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-cyan-500 cursor-pointer transition-colors">
                                    <div className="text-cyan-400">📎</div>
                                    <input
                                        type="file"
                                        name="degree"
                                        onChange={handleFileChange}
                                        accept=".jpg,.jpeg,.png,.pdf"
                                        className="hidden"
                                    />
                                    <span className="text-sm text-slate-300 truncate">
                                        {documents.degree ? documents.degree.name : 'Choose file...'}
                                    </span>
                                </label>
                            </div>
                        </motion.div>
                    )}

                    <motion.button
                        whileHover={{ scale: loading ? 1 : 1.02 }}
                        whileTap={{ scale: loading ? 1 : 0.98 }}
                        type="submit"
                        disabled={loading}
                        className={`w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 group transition-all mt-4 ${loading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Processing...
                            </>
                        ) : (
                            <>
                                {formData.role === 'teacher' ? 'Submit for Verification' : 'Create Account'}
                                <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </motion.button>
                </form>

                <p className="mt-10 text-slate-500 text-center text-sm">
                    Already have an account?{' '}
                    <Link to="/login" className="text-white hover:text-cyan-300 transition-colors font-medium border-b border-cyan-500/30 hover:border-cyan-500">
                        Sign In
                    </Link>
                </p>
            </motion.div>

            {/* Right: Animated Student Character */}
            <div className="hidden lg:flex relative items-center justify-center bg-gradient-to-br from-slate-900 to-cyan-950 overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute inset-0 opacity-30">
                    <div className="absolute top-10 right-10 w-24 h-24 bg-cyan-400 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-20 left-20 w-32 h-32 bg-blue-400 rounded-full blur-3xl"></div>
                    <div className="absolute top-1/2 right-1/3 w-20 h-20 bg-purple-400 rounded-full blur-3xl"></div>
                </div>

                <div className="relative z-10 w-full max-w-lg px-8">
                    <StudentCharacter className="w-full h-auto" />

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="mt-8 text-center"
                    >
                        <h3 className="text-2xl font-bold text-white mb-3">
                            Start Your Learning Journey! 🚀
                        </h3>
                        <p className="text-slate-300 text-lg">
                            Join thousands of students collaborating and learning together
                        </p>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
