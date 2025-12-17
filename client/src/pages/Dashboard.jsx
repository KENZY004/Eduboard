import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { FaPlus, FaSignInAlt, FaSignOutAlt, FaRocket, FaFolder, FaClock } from 'react-icons/fa';
import { BsLightningChargeFill } from 'react-icons/bs';
import { motion } from 'framer-motion';
import CreateBoardModal from '../components/CreateBoardModal';

const Dashboard = () => {
    const [roomId, setRoomId] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [savedBoards, setSavedBoards] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();
    const user = JSON.parse(localStorage.getItem('user'));
    const isTeacher = user?.role === 'teacher';

    // Fetch saved boards for teachers - refetch when location changes
    useEffect(() => {
        if (isTeacher && user?.id) {
            fetchSavedBoards();
        } else {
            setLoading(false);
        }
    }, [isTeacher, user?.id, location.pathname]); // Added location.pathname

    const fetchSavedBoards = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/boards/user/${user.id}`);
            setSavedBoards(res.data);
        } catch (err) {
            console.error('Error fetching boards:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateBoard = async (boardName) => {
        try {
            console.log('User object:', user);
            console.log('User ID:', user.id);

            const roomId = uuidv4();
            const payload = {
                name: boardName,
                userId: user.id,
                roomId
            };
            console.log('Creating board with payload:', payload);

            const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/boards/create`, payload);
            console.log('Board created successfully:', response.data);

            setIsModalOpen(false);
            navigate(`/board/${roomId}`);
        } catch (err) {
            console.error('Error creating board:', err);
            console.error('Error response:', err.response?.data);
            alert('Failed to create board. Please try again.');
        }
    };

    const openBoard = (roomId) => {
        navigate(`/board/${roomId}`);
    };

    const joinMeeting = (e) => {
        e.preventDefault();
        if (roomId.trim()) {
            navigate(`/board/${roomId}`);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="min-h-screen p-8 flex flex-col max-w-7xl mx-auto">

            {/* Header */}
            <header className="flex justify-between items-end mb-12 border-b border-white/5 pb-6">
                <div>
                    <h1 className="text-4xl font-bold text-white mb-2 tracking-tight flex items-center gap-3">
                        <BsLightningChargeFill className="text-indigo-500" /> EduBoard <span className="text-xs px-2 py-1 bg-indigo-500/10 text-indigo-400 rounded border border-indigo-500/20 font-mono font-normal tracking-wide">PRO</span>
                    </h1>
                    <p className="text-slate-400 font-light">Collaborative workspace & infinite canvas</p>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                        <p className="text-white font-medium">{user?.username}</p>
                        <p className="text-xs text-slate-500 font-mono uppercase">{user?.role || 'Student'}</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="p-3 rounded-full hover:bg-white/5 text-slate-400 hover:text-white transition-colors border border-transparent hover:border-white/10"
                    >
                        <FaSignOutAlt />
                    </button>
                </div>
            </header>

            {/* Bento Grid */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className={`grid grid-cols-1 ${isTeacher ? 'md:grid-cols-3 grid-rows-2' : 'md:grid-cols-1'} gap-6 ${isTeacher ? 'h-[600px]' : 'h-auto'}`}
            >
                {/* Main Action: New Board (Large) - Teachers Only */}
                {isTeacher && (
                    <motion.div
                        whileHover={{ scale: 1.01 }}
                        className="md:col-span-2 md:row-span-2 surface-card rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden group cursor-pointer"
                        onClick={() => setIsModalOpen(true)}
                    >
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/20 blur-[120px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-500/30 transition-all duration-700"></div>

                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 text-indigo-400 mb-6 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300">
                                <FaPlus className="text-2xl" />
                            </div>
                            <h2 className="text-5xl font-bold text-white mb-4 tracking-tight">Create New <br /> Whiteboard</h2>
                            <p className="text-slate-400 text-lg max-w-md font-light">
                                Start a new session on an infinite high-performance canvas. Optimized for teaching and sketching.
                            </p>
                        </div>

                        <div className="flex items-center gap-3 text-indigo-400 font-medium mt-8 group-hover:translate-x-2 transition-transform">
                            Launch Editor <FaRocket />
                        </div>
                    </motion.div>
                )}

                {/* Student Message - Students Only */}
                {!isTeacher && (
                    <div className="surface-card rounded-3xl p-8 mb-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
                                <FaSignInAlt className="text-cyan-400 text-xl" />
                            </div>
                            <h3 className="text-2xl font-bold text-white">Student Access</h3>
                        </div>
                        <p className="text-slate-400">
                            As a student, you can join whiteboards shared by your teachers using the room code below.
                        </p>
                    </div>
                )}

                {/* Join Session - Students Only */}
                {!isTeacher && (
                    <div className="surface-card rounded-3xl p-8 flex flex-col justify-center relative overflow-hidden">
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-500"></div>
                        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                            <FaSignInAlt className="text-cyan-400" /> Join Session
                        </h3>
                        <p className="text-slate-500 text-sm mb-6">Enter a room code to connect.</p>

                        <form onSubmit={joinMeeting} className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Room ID..."
                                value={roomId}
                                onChange={(e) => setRoomId(e.target.value)}
                                className="bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white w-full focus:outline-none focus:border-cyan-500/50 transition-colors font-mono text-sm"
                            />
                            <button className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-lg border border-white/10 transition-all">
                                →
                            </button>
                        </form>
                    </div>
                )}

                {/* Saved Boards List - Teachers Only */}
                {isTeacher && (
                    <div className="md:row-span-2 surface-card rounded-3xl p-6 flex flex-col relative overflow-hidden">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                                    <FaFolder className="text-indigo-400" /> Saved Boards
                                </h3>
                                <p className="text-slate-500 text-xs">Your recent whiteboards</p>
                            </div>
                        </div>

                        {/* Boards List */}
                        <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                            {loading ? (
                                <div className="flex items-center justify-center h-32">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                                </div>
                            ) : savedBoards.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-32 text-center">
                                    <FaFolder className="text-slate-600 text-3xl mb-2" />
                                    <p className="text-slate-500 text-sm">No saved boards yet</p>
                                    <p className="text-slate-600 text-xs mt-1">Create your first board to get started</p>
                                </div>
                            ) : (
                                savedBoards.map((board) => (
                                    <motion.div
                                        key={board.roomId}
                                        whileHover={{ scale: 1.02, x: 4 }}
                                        onClick={() => openBoard(board.roomId)}
                                        className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 cursor-pointer transition-all group"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-white font-medium text-sm truncate group-hover:text-indigo-400 transition-colors">
                                                    {board.name}
                                                </h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <FaClock className="text-slate-500 text-xs" />
                                                    <p className="text-slate-500 text-xs">{formatDate(board.updatedAt)}</p>
                                                </div>
                                            </div>
                                            <div className="text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                                →
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </div>
                )}

            </motion.div>

            {/* Create Board Modal */}
            <CreateBoardModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onCreateBoard={handleCreateBoard}
            />
        </div>
    );
};

export default Dashboard;
