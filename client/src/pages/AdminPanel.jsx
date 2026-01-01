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
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 sm:p-6 md:p-8 flex flex-col max-w-7xl mx-auto">
            {/* Header */}
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 sm:mb-12 border-b border-white/5 pb-4 sm:pb-6 gap-4 sm:gap-0">
                <div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight flex items-center gap-2 sm:gap-3">
                        <BsLightningChargeFill className="text-indigo-500 text-xl sm:text-2xl" /> Admin Panel <span className="text-xs px-2 py-1 bg-indigo-500/10 text-indigo-400 rounded border border-indigo-500/20 font-mono font-normal tracking-wide">PRO</span>
                    </h1>
                    <p className="text-slate-400 font-light text-sm sm:text-base">Teacher Verification Management</p>
                </div>
                <div className="flex items-center gap-3 sm:gap-6 self-end sm:self-auto">
                    <button
                        onClick={fetchTeachers}
                        className="p-2 sm:p-3 rounded-full hover:bg-white/5 text-slate-400 hover:text-white transition-colors border border-transparent hover:border-white/10"
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
                        className="p-2 sm:p-3 rounded-full hover:bg-white/5 text-slate-400 hover:text-white transition-colors border border-transparent hover:border-white/10"
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
                    className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-2xl p-6"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-yellow-400 text-sm font-semibold mb-1">Pending Review</p>
                            <p className="text-4xl font-bold text-white">{pendingTeachers.length}</p>
                        </div>
                        <div className="w-14 h-14 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                            <FaClock className="text-yellow-400 text-2xl" />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-6"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-400 text-sm font-semibold mb-1">Total Teachers</p>
                            <p className="text-4xl font-bold text-white">{allTeachers.length}</p>
                        </div>
                        <div className="w-14 h-14 bg-green-500/20 rounded-xl flex items-center justify-center">
                            <FaUser className="text-green-400 text-2xl" />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl p-6"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-indigo-400 text-sm font-semibold mb-1">Approved</p>
                            <p className="text-4xl font-bold text-white">
                                {allTeachers.filter(t => t.verificationStatus === 'approved').length}
                            </p>
                        </div>
                        <div className="w-14 h-14 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                            <FaCheckCircle className="text-indigo-400 text-2xl" />
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-6">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab('pending')}
                    className={`px-8 py-4 rounded-2xl font-semibold transition-all text-base ${activeTab === 'pending'
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 border border-indigo-500/50'
                        : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50 border border-slate-700'
                        }`}
                >
                    <span className="flex items-center gap-2">
                        <FaClock />
                        Pending ({pendingTeachers.length})
                    </span>
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab('all')}
                    className={`px-8 py-4 rounded-2xl font-semibold transition-all text-base ${activeTab === 'all'
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 border border-indigo-500/50'
                        : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50 border border-slate-700'
                        }`}
                >
                    <span className="flex items-center gap-2">
                        <FaUser />
                        All Teachers ({allTeachers.length})
                    </span>
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab('students')}
                    className={`px-8 py-4 rounded-2xl font-semibold transition-all text-base ${activeTab === 'students'
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 border border-indigo-500/50'
                        : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50 border border-slate-700'
                        }`}
                >
                    <span className="flex items-center gap-2">
                        <FaUser />
                        Students ({allStudents.length})
                    </span>
                </motion.button>
            </div>

            {/* Pending Teachers */}
            {activeTab === 'pending' && (
                <div className="space-y-6">
                    {pendingTeachers.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-3xl p-16 text-center"
                        >
                            <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <FaCheckCircle className="text-6xl text-green-400" />
                            </div>
                            <h3 className="text-2xl font-semibold text-white mb-2">All Caught Up!</h3>
                            <p className="text-slate-400">No pending teacher verifications at the moment</p>
                        </motion.div>
                    ) : (
                        pendingTeachers.map((teacher, index) => (
                            <motion.div
                                key={teacher.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ y: -4 }}
                                className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-700 hover:border-indigo-500/50 rounded-3xl p-4 sm:p-8 shadow-2xl transition-all duration-300 group"
                            >
                                <div className="flex flex-col lg:flex-row items-start justify-between gap-4 lg:gap-6">
                                    <div className="flex-1 w-full">
                                        <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                                            <div className="relative flex-shrink-0">
                                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                                                <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                                                    <FaUser className="text-white text-lg sm:text-2xl" />
                                                </div>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h3 className="text-lg sm:text-2xl font-bold text-white mb-1 truncate">{teacher.username}</h3>
                                                <div className="flex items-center gap-2 text-slate-400">
                                                    <FaEnvelope className="text-xs sm:text-sm flex-shrink-0" />
                                                    <span className="text-xs sm:text-sm truncate">{teacher.email}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                                            <div className="flex items-center gap-3 text-slate-300 bg-slate-900/50 rounded-xl p-4">
                                                <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                                                    <FaCalendar className="text-indigo-400" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500 mb-1">Registered</p>
                                                    <p className="font-semibold">{new Date(teacher.registeredAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 text-slate-300 bg-slate-900/50 rounded-xl p-4">
                                                <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                                                    <FaFileAlt className="text-indigo-400" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500 mb-1">Documents</p>
                                                    <p className="font-semibold">{teacher.documents.length} uploaded</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Documents */}
                                        {teacher.documents.length > 0 && (
                                            <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-6 mb-6">
                                                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Uploaded Documents</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {teacher.documents.map((doc, idx) => (
                                                        <motion.a
                                                            key={idx}
                                                            href={doc.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            whileHover={{ scale: 1.02, x: 4 }}
                                                            className="flex items-center gap-3 bg-slate-900/50 hover:bg-slate-800/50 border border-slate-700 hover:border-indigo-500/50 rounded-xl p-4 transition-all group/doc"
                                                        >
                                                            <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center group-hover/doc:bg-indigo-500/30 transition-colors">
                                                                <FaFileAlt className="text-indigo-400" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="font-semibold text-white text-sm">
                                                                    {doc.type.replace('_', ' ').toUpperCase()}
                                                                </p>
                                                                <p className="text-xs text-slate-500">Click to view</p>
                                                            </div>
                                                            <div className="text-indigo-400 opacity-0 group-hover/doc:opacity-100 transition-opacity">→</div>
                                                        </motion.a>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-col gap-3 w-full lg:w-auto lg:min-w-[200px]">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleApprove(teacher.id, teacher.username)}
                                            disabled={processingId === teacher.id}
                                            className="px-4 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold rounded-2xl shadow-2xl shadow-green-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 sm:gap-3 border border-green-400/30 text-sm sm:text-base"
                                        >
                                            <FaCheckCircle className="text-lg sm:text-xl" />
                                            <span>{processingId === teacher.id ? 'Processing...' : 'Approve'}</span>
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleReject(teacher.id, teacher.username)}
                                            disabled={processingId === teacher.id}
                                            className="px-4 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold rounded-2xl shadow-2xl shadow-red-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 sm:gap-3 border border-red-400/30 text-sm sm:text-base"
                                        >
                                            <FaTimesCircle className="text-lg sm:text-xl" />
                                            <span>Reject</span>
                                        </motion.button>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            )}

            {/* All Teachers */}
            {activeTab === 'all' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700 rounded-3xl overflow-hidden shadow-2xl"
                >
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-950/50 border-b border-slate-700">
                                <tr>
                                    <th className="px-8 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Teacher</th>
                                    <th className="px-8 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Email</th>
                                    <th className="px-8 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                    <th className="px-8 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Registered</th>
                                    <th className="px-8 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Verified</th>
                                    <th className="px-8 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {allTeachers.map((teacher, index) => (
                                    <motion.tr
                                        key={teacher._id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="hover:bg-slate-800/30 transition-colors"
                                    >
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                                                    <FaUser className="text-white" />
                                                </div>
                                                <span className="text-white font-semibold">{teacher.username}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-slate-300">{teacher.email}</td>
                                        <td className="px-8 py-5">
                                            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border ${teacher.verificationStatus === 'approved'
                                                ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                                : teacher.verificationStatus === 'rejected'
                                                    ? 'bg-red-500/20 text-red-400 border-red-500/30'
                                                    : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                                                }`}>
                                                {teacher.verificationStatus === 'approved' && <FaCheckCircle />}
                                                {teacher.verificationStatus === 'rejected' && <FaTimesCircle />}
                                                {teacher.verificationStatus === 'pending' && <FaClock />}
                                                {teacher.verificationStatus.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-slate-400 font-medium">
                                            {new Date(teacher.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-8 py-5 text-slate-400 font-medium">
                                            {teacher.verificationDate
                                                ? new Date(teacher.verificationDate).toLocaleDateString()
                                                : '-'
                                            }
                                        </td>
                                        <td className="px-8 py-5">
                                            <button
                                                onClick={() => handleRemoveTeacher(teacher._id, teacher.username)}
                                                disabled={processingId === teacher._id}
                                                className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 border border-red-500/30 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-semibold"
                                                title="Remove teacher from platform"
                                            >
                                                <FaTrash className="text-xs" />
                                                Remove
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            )}

            {/* All Students */}
            {activeTab === 'students' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700 rounded-3xl overflow-hidden shadow-2xl"
                >
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-950/50 border-b border-slate-700">
                                <tr>
                                    <th className="px-8 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Student</th>
                                    <th className="px-8 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Email</th>
                                    <th className="px-8 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Registered</th>
                                    <th className="px-8 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {allStudents.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-8 py-12 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <FaUser className="text-4xl text-slate-600" />
                                                <p className="text-slate-400">No students registered yet</p>
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
                                            className="hover:bg-slate-800/30 transition-colors"
                                        >
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center">
                                                        <FaUser className="text-white" />
                                                    </div>
                                                    <span className="text-white font-semibold">{student.username}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-slate-300">{student.email}</td>
                                            <td className="px-8 py-5 text-slate-400 text-sm">
                                                {new Date(student.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-8 py-5">
                                                <button
                                                    onClick={() => handleRemoveStudent(student._id, student.username)}
                                                    disabled={processingId === student._id}
                                                    className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 border border-red-500/30 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-semibold"
                                                    title="Remove student from platform"
                                                >
                                                    <FaTrash className="text-xs" />
                                                    Remove
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
    );
};

export default AdminPanel;
