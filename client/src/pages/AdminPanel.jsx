import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { motion } from 'framer-motion';
import { BsLightningChargeFill } from 'react-icons/bs';
import { FaCheckCircle, FaTimesCircle, FaClock, FaUser, FaEnvelope, FaCalendar, FaFileAlt, FaSync, FaSignOutAlt, FaTrash } from 'react-icons/fa';

const AdminPanel = () => {
    const [pendingTeachers, setPendingTeachers] = useState([]);
    const [allTeachers, setAllTeachers] = useState([]);
    const [allStudents, setAllStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('pending');
    const [processingId, setProcessingId] = useState(null);

    useEffect(() => {
        fetchTeachers();
    }, []);

    const fetchTeachers = async () => {
        setLoading(true);
        try {
            const [pendingRes, allRes, studentsRes] = await Promise.all([
                api.get('/api/admin/pending-teachers'),
                api.get('/api/admin/all-teachers'),
                api.get('/api/admin/all-students')
            ]);
            setPendingTeachers(pendingRes.data);
            setAllTeachers(allRes.data);
            setAllStudents(studentsRes.data);
        } catch (err) {
            console.error('❌ Failed to fetch data:', err);
            console.error('Error details:', err.response?.data || err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (userId, username) => {
        if (!confirm(`Approve ${username} as a teacher?`)) return;

        setProcessingId(userId);
        try {
            await api.post(
                `/api/verification/approve/${userId}`,
                { adminNotes: 'Approved via admin panel' }
            );
            alert(`${username} has been approved! They will receive an email notification.`);
            fetchTeachers();
        } catch (err) {
            alert('Failed to approve teacher: ' + (err.response?.data?.message || err.message));
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (userId, username) => {
        const reason = prompt(`Reject ${username}?\n\nEnter rejection reason:`);
        if (!reason) return;

        setProcessingId(userId);
        try {
            await api.post(
                `/api/verification/reject/${userId}`,
                { reason, adminNotes: 'Rejected via admin panel' }
            );
            alert(`${username} has been rejected. They will receive an email notification.`);
            fetchTeachers();
        } catch (err) {
            alert('Failed to reject teacher: ' + (err.response?.data?.message || err.message));
        } finally {
            setProcessingId(null);
        }
    };

    const handleRemoveTeacher = async (userId, username) => {
        if (!confirm(`Are you sure you want to permanently remove ${username} from the platform? This action cannot be undone.`)) {
            return;
        }

        setProcessingId(userId);
        try {
            await api.delete(`/api/admin/teacher/${userId}`);
            alert(`${username} has been removed from the platform.`);
            fetchTeachers();
        } catch (err) {
            alert('Failed to remove teacher: ' + (err.response?.data?.message || err.message));
        } finally {
            setProcessingId(null);
        }
    };

    const handleRemoveStudent = async (userId, username) => {
        if (!confirm(`Are you sure you want to permanently remove ${username} from the platform? This action cannot be undone.`)) {
            return;
        }

        setProcessingId(userId);
        try {
            await api.delete(`/api/admin/user/${userId}`);
            alert(`${username} has been removed from the platform.`);
            fetchTeachers(); // Refresh all data
        } catch (err) {
            alert('Failed to remove student: ' + (err.response?.data?.message || err.message));
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center transition-colors duration-300">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 p-4 sm:p-6 md:p-8 flex flex-col max-w-7xl mx-auto transition-colors duration-300">
            {/* Header */}
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 sm:mb-12 border-b border-slate-200 dark:border-white/5 pb-4 sm:pb-6 gap-4 sm:gap-0">
                <div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight flex items-center gap-2 sm:gap-3">
                        <BsLightningChargeFill className="text-indigo-600 dark:text-indigo-500 text-xl sm:text-2xl" /> Admin Panel <span className="text-xs px-2 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded border border-indigo-500/20 font-mono font-normal tracking-wide">PRO</span>
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 font-light text-sm sm:text-base">Teacher Verification Management</p>
                </div>
                <div className="flex items-center gap-3 sm:gap-6 self-end sm:self-auto">
                    <button
                        onClick={fetchTeachers}
                        className="p-2 sm:p-3 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white transition-colors border border-transparent hover:border-slate-200 dark:hover:border-white/10"
                        title="Refresh"
                    >
                        <FaSync />
                    </button>
                    <button
                        onClick={() => {
                            localStorage.removeItem('token');
                            localStorage.removeItem('user');
                            window.location.href = '/login';
                        }}
                        className="p-2 sm:p-3 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-white transition-colors border border-transparent hover:border-slate-200 dark:hover:border-white/10"
                    >
                        <FaSignOutAlt />
                    </button>
                </div>
            </header>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-br from-yellow-500/5 to-orange-500/5 dark:from-yellow-500/10 dark:to-orange-500/10 border border-yellow-200 dark:border-yellow-500/20 rounded-2xl p-6 shadow-sm"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-yellow-700 dark:text-yellow-400 text-sm font-semibold mb-1">Pending Review</p>
                            <p className="text-4xl font-bold text-slate-900 dark:text-white">{pendingTeachers.length}</p>
                        </div>
                        <div className="w-14 h-14 bg-yellow-100 dark:bg-yellow-500/20 rounded-xl flex items-center justify-center">
                            <FaClock className="text-yellow-600 dark:text-yellow-400 text-2xl" />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-br from-green-500/5 to-emerald-500/5 dark:from-green-500/10 dark:to-emerald-500/10 border border-green-200 dark:border-green-500/20 rounded-2xl p-6 shadow-sm"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-700 dark:text-green-400 text-sm font-semibold mb-1">Total Teachers</p>
                            <p className="text-4xl font-bold text-slate-900 dark:text-white">{allTeachers.length}</p>
                        </div>
                        <div className="w-14 h-14 bg-green-100 dark:bg-green-500/20 rounded-xl flex items-center justify-center">
                            <FaUser className="text-green-600 dark:text-green-400 text-2xl" />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-br from-indigo-500/5 to-purple-500/5 dark:from-indigo-500/10 dark:to-purple-500/10 border border-indigo-200 dark:border-indigo-500/20 rounded-2xl p-6 shadow-sm"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-indigo-700 dark:text-indigo-400 text-sm font-semibold mb-1">Approved</p>
                            <p className="text-4xl font-bold text-slate-900 dark:text-white">
                                {allTeachers.filter(t => t.verificationStatus === 'approved').length}
                            </p>
                        </div>
                        <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-500/20 rounded-xl flex items-center justify-center">
                            <FaCheckCircle className="text-indigo-600 dark:text-indigo-400 text-2xl" />
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-3 sm:gap-4 mb-8">
                {[
                    { id: 'pending', icon: FaClock, label: 'Pending', count: pendingTeachers.length },
                    { id: 'all', icon: FaUser, label: 'All Teachers', count: allTeachers.length },
                    { id: 'students', icon: FaUser, label: 'Students', count: allStudents.length }
                ].map((tab) => (
                    <motion.button
                        key={tab.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 sm:px-8 py-3 sm:py-4 rounded-2xl font-semibold transition-all text-sm sm:text-base flex items-center gap-2 border ${activeTab === tab.id
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 border-indigo-500'
                            : 'bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700/50 border-slate-200 dark:border-slate-700'
                            }`}
                    >
                        <tab.icon className="text-sm" />
                        {tab.label} ({tab.count})
                    </motion.button>
                ))}
            </div>

            {/* Content Area */}
            <div className="flex-1">
                {/* Pending Teachers */}
                {activeTab === 'pending' && (
                    <div className="space-y-6">
                        {pendingTeachers.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-slate-50 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-3xl p-12 sm:p-20 text-center shadow-inner"
                            >
                                <div className="w-24 h-24 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                                    <FaCheckCircle className="text-6xl text-green-600 dark:text-green-400" />
                                </div>
                                <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-2">All Caught Up!</h3>
                                <p className="text-slate-600 dark:text-slate-400">No pending teacher verifications at the moment</p>
                            </motion.div>
                        ) : (
                            pendingTeachers.map((teacher, index) => (
                                <motion.div
                                    key={teacher.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    whileHover={{ y: -4 }}
                                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-xl transition-all duration-300 group"
                                >
                                    <div className="flex flex-col lg:flex-row items-start justify-between gap-6 lg:gap-8">
                                        <div className="flex-1 w-full">
                                            <div className="flex items-center gap-4 mb-6">
                                                <div className="relative flex-shrink-0">
                                                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity"></div>
                                                    <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                                                        <FaUser className="text-white text-2xl" />
                                                    </div>
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-1 truncate">{teacher.username}</h3>
                                                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                                        <FaEnvelope className="text-sm flex-shrink-0" />
                                                        <span className="text-sm truncate font-medium">{teacher.email}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                                <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 transition-colors">
                                                    <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-500/20 rounded-xl flex items-center justify-center">
                                                        <FaCalendar className="text-indigo-600 dark:text-indigo-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 font-bold uppercase tracking-wider">Registered</p>
                                                        <p className="font-semibold">{new Date(teacher.registeredAt).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 transition-colors">
                                                    <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-500/20 rounded-xl flex items-center justify-center">
                                                        <FaFileAlt className="text-indigo-600 dark:text-indigo-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 font-bold uppercase tracking-wider">Documents</p>
                                                        <p className="font-semibold">{teacher.documents.length} uploaded</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Documents */}
                                            {teacher.documents.length > 0 && (
                                                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                                                    <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">Verification Artifacts</h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {teacher.documents.map((doc, idx) => (
                                                            <motion.a
                                                                key={idx}
                                                                href={doc.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                whileHover={{ scale: 1.02, x: 4 }}
                                                                className="flex items-center gap-4 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-500/50 rounded-xl p-4 transition-all group/doc shadow-sm"
                                                            >
                                                                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-500/20 rounded-lg flex items-center justify-center group-hover/doc:bg-indigo-500/30 transition-colors">
                                                                    <FaFileAlt className="text-indigo-600 dark:text-indigo-400" />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <p className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-tight">
                                                                        {doc.type.replace('_', ' ')}
                                                                    </p>
                                                                    <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-500">OPEN DOCUMENT</p>
                                                                </div>
                                                                <div className="text-indigo-500 opacity-0 group-hover/doc:opacity-100 transition-opacity">→</div>
                                                            </motion.a>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex flex-col gap-3 w-full lg:w-auto lg:min-w-[220px]">
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => handleApprove(teacher.id, teacher.username)}
                                                disabled={processingId === teacher.id}
                                                className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold rounded-2xl shadow-lg shadow-green-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 border-b-4 border-green-800 active:border-b-0 uppercase tracking-widest text-xs"
                                            >
                                                <FaCheckCircle className="text-lg" />
                                                <span>{processingId === teacher.id ? 'Processing...' : 'Approve Teacher'}</span>
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => handleReject(teacher.id, teacher.username)}
                                                disabled={processingId === teacher.id}
                                                className="px-8 py-4 bg-white dark:bg-transparent hover:bg-slate-50 dark:hover:bg-red-500/10 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 font-bold rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 border border-slate-200 dark:border-slate-700 hover:border-red-500/50 uppercase tracking-widest text-xs"
                                            >
                                                <FaTimesCircle className="text-lg" />
                                                <span>Reject Application</span>
                                            </motion.button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                )}

                {/* All Teachers Table View */}
                {activeTab === 'all' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xl"
                    >
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800">
                                    <tr>
                                        <th className="px-8 py-6 text-left text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Principal Investigator</th>
                                        <th className="px-8 py-6 text-left text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Contact Node</th>
                                        <th className="px-8 py-6 text-left text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Clearance Status</th>
                                        <th className="px-8 py-6 text-left text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Deployment</th>
                                        <th className="px-8 py-6 text-left text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Operations</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {allTeachers.map((teacher, index) => (
                                        <motion.tr
                                            key={teacher._id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                                        >
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-500/20 rounded-xl flex items-center justify-center shadow-sm">
                                                        <FaUser className="text-indigo-600 dark:text-indigo-400" />
                                                    </div>
                                                    <span className="text-slate-900 dark:text-white font-bold text-base">{teacher.username}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-slate-600 dark:text-slate-400 font-medium text-sm">{teacher.email}</td>
                                            <td className="px-8 py-6">
                                                <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest border transition-all ${teacher.verificationStatus === 'approved'
                                                    ? 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/20'
                                                    : teacher.verificationStatus === 'rejected'
                                                        ? 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/20'
                                                        : 'bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/20'
                                                    }`}>
                                                    {teacher.verificationStatus === 'approved' && <FaCheckCircle className="text-xs" />}
                                                    {teacher.verificationStatus === 'rejected' && <FaTimesCircle className="text-xs" />}
                                                    {teacher.verificationStatus === 'pending' && <FaClock className="text-xs" />}
                                                    {teacher.verificationStatus.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="text-slate-400 dark:text-slate-500 text-xs font-bold">{new Date(teacher.createdAt).toLocaleDateString()}</p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <button
                                                    onClick={() => handleRemoveTeacher(teacher._id, teacher.username)}
                                                    disabled={processingId === teacher._id}
                                                    className="p-2 sm:px-4 sm:py-2 bg-slate-100 dark:bg-red-600/10 hover:bg-red-100 dark:hover:bg-red-600/20 text-slate-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 border border-slate-200 dark:border-red-500/20 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-xs font-black uppercase tracking-tighter"
                                                    title="Decommission Teacher"
                                                >
                                                    <FaTrash className="text-[10px]" />
                                                    <span className="hidden sm:inline">Decommission</span>
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}

                {/* Students Table View */}
                {activeTab === 'students' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xl"
                    >
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800">
                                    <tr>
                                        <th className="px-8 py-6 text-left text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Student Node</th>
                                        <th className="px-8 py-6 text-left text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Uplink Email</th>
                                        <th className="px-8 py-6 text-left text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Initialization</th>
                                        <th className="px-8 py-6 text-left text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Operations</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {allStudents.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="px-8 py-20 text-center">
                                                <div className="flex flex-col items-center gap-4">
                                                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-600 shadow-inner">
                                                        <FaUser className="text-2xl" />
                                                    </div>
                                                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No students detected in sector</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        allStudents.map((student, index) => (
                                            <motion.tr
                                                key={student._id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                                            >
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 bg-cyan-100 dark:bg-cyan-500/20 rounded-xl flex items-center justify-center shadow-sm">
                                                            <FaUser className="text-cyan-600 dark:text-cyan-400" />
                                                        </div>
                                                        <span className="text-slate-900 dark:text-white font-bold text-base">{student.username}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-slate-600 dark:text-slate-400 font-medium text-sm">{student.email}</td>
                                                <td className="px-8 py-6">
                                                    <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase">{new Date(student.createdAt).toLocaleDateString()}</p>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <button
                                                        onClick={() => handleRemoveStudent(student._id, student.username)}
                                                        disabled={processingId === student._id}
                                                        className="p-2 sm:px-4 sm:py-2 bg-slate-100 dark:bg-red-600/10 hover:bg-red-100 dark:hover:bg-red-600/20 text-slate-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 border border-slate-200 dark:border-red-500/20 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-xs font-black uppercase tracking-tighter"
                                                        title="Terminate Access"
                                                    >
                                                        <FaTrash className="text-[10px]" />
                                                        <span className="hidden sm:inline">Terminate</span>
                                                    </button>
                                                </td>
                                            </motion.tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default AdminPanel;
