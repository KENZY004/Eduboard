import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { BsLightningChargeFill } from 'react-icons/bs';
import { FaCheckCircle, FaTimesCircle, FaClock, FaUser, FaEnvelope, FaCalendar, FaFileAlt, FaSync } from 'react-icons/fa';

const AdminPanel = () => {
    const [pendingTeachers, setPendingTeachers] = useState([]);
    const [allTeachers, setAllTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('pending');
    const [processingId, setProcessingId] = useState(null);

    useEffect(() => {
        fetchTeachers();
    }, []);

    const fetchTeachers = async () => {
        setLoading(true);
        try {
            console.log('🔍 Fetching teachers from API...');
            const [pendingRes, allRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/admin/pending-teachers`),
                axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/admin/all-teachers`)
            ]);
            console.log('✅ Pending teachers response:', pendingRes.data);
            console.log('✅ All teachers response:', allRes.data);
            setPendingTeachers(pendingRes.data);
            setAllTeachers(allRes.data);
            console.log(`📊 Set ${pendingRes.data.length} pending teachers`);
            console.log(`📊 Set ${allRes.data.length} total teachers`);
        } catch (err) {
            console.error('❌ Failed to fetch teachers:', err);
            console.error('Error details:', err.response?.data || err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (userId, username) => {
        if (!confirm(`Approve ${username} as a teacher?`)) return;

        setProcessingId(userId);
        try {
            await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/api/verification/approve/${userId}`,
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
            await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/api/verification/reject/${userId}`,
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

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                            <BsLightningChargeFill className="text-white text-2xl" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
                            <p className="text-slate-400 text-sm">Teacher Verification Management</p>
                        </div>
                    </div>
                    <button
                        onClick={fetchTeachers}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                        <FaSync /> Refresh
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-6">
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === 'pending'
                            ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/25'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                    >
                        Pending ({pendingTeachers.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === 'all'
                            ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/25'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                    >
                        All Teachers ({allTeachers.length})
                    </button>
                </div>

                {/* Pending Teachers */}
                {activeTab === 'pending' && (
                    <div className="space-y-4">
                        {pendingTeachers.length === 0 ? (
                            <div className="bg-slate-800/50 rounded-2xl p-12 text-center">
                                <FaCheckCircle className="text-6xl text-green-400 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-white mb-2">All Caught Up!</h3>
                                <p className="text-slate-400">No pending teacher verifications</p>
                            </div>
                        ) : (
                            pendingTeachers.map((teacher) => (
                                <motion.div
                                    key={teacher.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                                                    <FaUser className="text-white" />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold text-white">{teacher.username}</h3>
                                                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                                                        <FaEnvelope className="text-xs" />
                                                        {teacher.email}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                <div className="flex items-center gap-2 text-slate-300">
                                                    <FaCalendar className="text-cyan-400" />
                                                    <span className="text-sm">
                                                        Registered: {new Date(teacher.registeredAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-slate-300">
                                                    <FaFileAlt className="text-cyan-400" />
                                                    <span className="text-sm">
                                                        Documents: {teacher.documents.length}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Documents */}
                                            {teacher.documents.length > 0 && (
                                                <div className="bg-slate-900/50 rounded-xl p-4 mb-4">
                                                    <h4 className="text-sm font-semibold text-slate-400 mb-3">Uploaded Documents:</h4>
                                                    <div className="space-y-2">
                                                        {teacher.documents.map((doc, idx) => (
                                                            <a
                                                                key={idx}
                                                                href={doc.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
                                                            >
                                                                <FaFileAlt />
                                                                <span className="text-sm">
                                                                    {doc.type.replace('_', ' ').toUpperCase()}
                                                                </span>
                                                                <span className="text-xs text-slate-500">→ View</span>
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-3 ml-6">
                                            <button
                                                onClick={() => handleApprove(teacher.id, teacher.username)}
                                                disabled={processingId === teacher.id}
                                                className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-semibold rounded-xl shadow-lg shadow-green-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                            >
                                                <FaCheckCircle />
                                                {processingId === teacher.id ? 'Processing...' : 'Approve'}
                                            </button>
                                            <button
                                                onClick={() => handleReject(teacher.id, teacher.username)}
                                                disabled={processingId === teacher.id}
                                                className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-semibold rounded-xl shadow-lg shadow-red-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                            >
                                                <FaTimesCircle />
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                )}

                {/* All Teachers */}
                {activeTab === 'all' && (
                    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-900/50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Registered</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Verified</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700">
                                    {allTeachers.map((teacher) => (
                                        <tr key={teacher._id} className="hover:bg-slate-700/30 transition-colors">
                                            <td className="px-6 py-4 text-white font-medium">{teacher.username}</td>
                                            <td className="px-6 py-4 text-slate-300">{teacher.email}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${teacher.verificationStatus === 'approved'
                                                    ? 'bg-green-500/20 text-green-400'
                                                    : teacher.verificationStatus === 'rejected'
                                                        ? 'bg-red-500/20 text-red-400'
                                                        : 'bg-yellow-500/20 text-yellow-400'
                                                    }`}>
                                                    {teacher.verificationStatus === 'approved' && <FaCheckCircle />}
                                                    {teacher.verificationStatus === 'rejected' && <FaTimesCircle />}
                                                    {teacher.verificationStatus === 'pending' && <FaClock />}
                                                    {teacher.verificationStatus}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-400 text-sm">
                                                {new Date(teacher.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-slate-400 text-sm">
                                                {teacher.verificationDate
                                                    ? new Date(teacher.verificationDate).toLocaleDateString()
                                                    : '-'
                                                }
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPanel;
