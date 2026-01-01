import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import api from '../lib/api';
import { FaPlus, FaSignInAlt, FaSignOutAlt, FaRocket, FaFolder, FaClock, FaTrash, FaCopy, FaCheck } from 'react-icons/fa';
import { BsLightningChargeFill } from 'react-icons/bs';
import { motion } from 'framer-motion';
import CreateBoardModal from '../components/CreateBoardModal';

const Dashboard = () => {
    const [roomId, setRoomId] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [savedBoards, setSavedBoards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [copiedBoardId, setCopiedBoardId] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const user = JSON.parse(localStorage.getItem('user'));
    const isTeacher = user?.role === 'teacher';

    // Redirect admin to admin panel if they somehow reach this page
    useEffect(() => {
        if (user?.role === 'admin') {
            navigate('/admin', { replace: true });
        }
    }, [user, navigate]);

    // Fetch saved boards for both teachers and students
    useEffect(() => {
        if (user?.id) {
            fetchSavedBoards();
        } else {
            setLoading(false);
        }
    }, [user?.id, location.pathname]);

    const fetchSavedBoards = async () => {
        try {
            let res;
            if (isTeacher) {
                // Teachers: fetch boards they created
                res = await api.get(`/api/boards/user/${user.id}`);
            } else {
                // Students: fetch their saved boards (independent copies)
                res = await api.get(`/api/boards/saved/${user.id}`);
            }
            setSavedBoards(res.data);
        } catch (err) {
            console.error('Error fetching boards:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateBoard = async (boardName) => {
        try {
            const roomId = uuidv4();
            const payload = {
                name: boardName,
                userId: user.id,
                roomId
            };
            const response = await api.post('/api/boards/create', payload);
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

    const handleDeleteBoard = async (roomId, boardName, boardId, e) => {
        e.stopPropagation();

        if (!window.confirm(`Are you sure you want to delete "${boardName}"?`)) {
            return;
        }

        try {
            if (isTeacher) {
                // Teachers: delete the actual board
                try {
                    console.log('[DELETE] Teacher deleting board by roomId:', roomId);
                    await api.delete(`/api/boards/${roomId}`);
                } catch (err) {
                    // If delete by roomId fails, try by _id (for orphaned boards)
                    if (err.response?.status === 404) {
                        console.log('[DELETE] Teacher deleting board by _id with force:', boardId);
                        await api.delete(`/api/boards/by-id/${boardId}?force=true`);
                    } else {
                        throw err;
                    }
                }
            } else {
                // Students: delete their saved copy
                await api.delete(`/api/boards/saved/${boardId}`);
            }
            fetchSavedBoards();
        } catch (err) {
            console.error('Error deleting board:', err);
            console.error('Error response:', err.response?.data);
            alert(`Failed to delete board: ${err.response?.data?.message || err.message}`);
        }
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

    const handleCopyLink = (roomId, e) => {
        e.stopPropagation();
        const boardUrl = `${window.location.origin}/whiteboard/${roomId}`;
        navigator.clipboard.writeText(boardUrl).then(() => {
            setCopiedBoardId(roomId);
            setTimeout(() => setCopiedBoardId(null), 2000);
        }).catch(err => {
            console.error('Failed to copy:', err);
        });
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
        <div className="min-h-screen p-4 sm:p-6 md:p-8 flex flex-col max-w-7xl mx-auto">

            {/* Header */}
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 sm:mb-12 border-b border-white/5 pb-4 sm:pb-6 gap-4 sm:gap-0">
                <div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight flex items-center gap-2 sm:gap-3">
                        <BsLightningChargeFill className="text-indigo-500 text-xl sm:text-2xl" /> EduBoard <span className="text-xs px-2 py-1 bg-indigo-500/10 text-indigo-400 rounded border border-indigo-500/20 font-mono font-normal tracking-wide">PRO</span>
                    </h1>
                    <p className="text-slate-400 font-light text-sm sm:text-base">Collaborative workspace & infinite canvas</p>
                </div>
                <div className="flex items-center gap-3 sm:gap-6 self-end sm:self-auto">
                    <div className="text-right hidden sm:block">
                        <p className="text-white font-medium">{user?.username}</p>
                        <p className="text-xs text-slate-500 font-mono uppercase">{user?.role || 'Student'}</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="p-2 sm:p-3 rounded-full hover:bg-white/5 text-slate-400 hover:text-white transition-colors border border-transparent hover:border-white/10"
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
                className={`grid grid-cols-1 ${isTeacher ? 'lg:grid-cols-3 lg:grid-rows-2' : 'md:grid-cols-1'} gap-4 sm:gap-6 ${isTeacher ? 'lg:h-[600px]' : 'h-auto'}`}
            >
                {/* Main Action: New Board (Large) - Teachers Only */}
                {isTeacher && (
                    <motion.div
                        whileHover={{ scale: 1.01 }}
                        className="lg:col-span-2 lg:row-span-2 surface-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden group cursor-pointer min-h-[300px] sm:min-h-[400px]"
                        onClick={() => setIsModalOpen(true)}
                    >
                        <div className="absolute top-0 right-0 w-[300px] sm:w-[400px] h-[300px] sm:h-[400px] bg-indigo-500/20 blur-[120px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-500/30 transition-all duration-700"></div>

                        <div className="relative z-10">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/5 rounded-xl sm:rounded-2xl flex items-center justify-center border border-white/10 text-indigo-400 mb-4 sm:mb-6 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300">
                                <FaPlus className="text-xl sm:text-2xl" />
                            </div>
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4 tracking-tight">Create New <br className="hidden sm:block" /> Whiteboard</h2>
                            <p className="text-slate-400 text-sm sm:text-base lg:text-lg max-w-md font-light">
                                Start a new session on an infinite high-performance canvas. Optimized for teaching and sketching.
                            </p>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-3 text-indigo-400 font-medium mt-6 sm:mt-8 group-hover:translate-x-2 transition-transform text-sm sm:text-base">
                            Launch Editor <FaRocket />
                        </div>
                    </motion.div>
                )}

                {/* Student Message - Students Only */}
                {!isTeacher && (
                    <div className="surface-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 mb-4 sm:mb-6">
                        <div className="flex items-center gap-3 mb-3 sm:mb-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
                                <FaSignInAlt className="text-cyan-400 text-lg sm:text-xl" />
                            </div>
                            <h3 className="text-xl sm:text-2xl font-bold text-white">Student Access</h3>
                        </div>
                        <p className="text-slate-400 text-sm sm:text-base">
                            As a student, you can join whiteboards shared by your teachers using the room code below.
                        </p>
                    </div>
                )}

                {/* Join Session - Students Only */}
                {!isTeacher && (
                    <div className="surface-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 flex flex-col justify-center relative overflow-hidden">
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-500"></div>
                        <h3 className="text-lg sm:text-xl font-bold text-white mb-2 flex items-center gap-2">
                            <FaSignInAlt className="text-cyan-400" /> Join Session
                        </h3>
                        <p className="text-slate-500 text-xs sm:text-sm mb-4 sm:mb-6">Enter a room code to connect.</p>

                        <form onSubmit={joinMeeting} className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Room ID..."
                                value={roomId}
                                onChange={(e) => setRoomId(e.target.value)}
                                className="bg-black/50 border border-white/10 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-white w-full focus:outline-none focus:border-cyan-500/50 transition-colors font-mono text-xs sm:text-sm"
                            />
                            <button className="bg-white/10 hover:bg-white/20 text-white p-2.5 sm:p-3 rounded-lg border border-white/10 transition-all">
                                →
                            </button>
                        </form>
                    </div>
                )}

                {/* Saved Boards List - Both Teachers and Students */}
                <div className="lg:row-span-2 surface-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex flex-col relative overflow-hidden min-h-[300px] sm:min-h-[400px]">
                    <div className="flex justify-between items-start mb-3 sm:mb-4">
                        <div>
                            <h3 className="text-lg sm:text-xl font-bold text-white mb-1 flex items-center gap-2">
                                <FaFolder className="text-indigo-400 text-base sm:text-lg" /> Saved Boards
                            </h3>
                            <p className="text-slate-500 text-xs">
                                {isTeacher ? 'Your recent whiteboards' : 'Boards from classes you attended'}
                            </p>
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
                                <p className="text-slate-600 text-xs mt-1">
                                    {isTeacher ? 'Create your first board to get started' : 'Join a class to see boards here'}
                                </p>
                            </div>
                        ) : (
                            savedBoards.map((board) => (
                                <motion.div
                                    key={board.roomId}
                                    whileHover={{ scale: 1.02, x: 4 }}
                                    onClick={() => openBoard(board.roomId)}
                                    className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 cursor-pointer transition-all group"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-white font-medium text-sm truncate group-hover:text-indigo-400 transition-colors">
                                                {isTeacher
                                                    ? (board.name || 'Untitled Board')
                                                    : (board.boardName || 'Untitled Board')}
                                            </h4>
                                            {!isTeacher && board.teacherName && (
                                                <p className="text-slate-500 text-xs mt-1">
                                                    Teacher: {board.teacherName}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {isTeacher && (
                                                <button
                                                    onClick={(e) => handleCopyLink(board.roomId, e)}
                                                    className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-all ${copiedBoardId === board.roomId
                                                        ? 'bg-green-500/20 text-green-400'
                                                        : 'bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400'
                                                        }`}
                                                    title="Copy board link"
                                                >
                                                    {copiedBoardId === board.roomId ? (
                                                        <>
                                                            <FaCheck className="text-xs sm:text-sm" />
                                                            <span className="hidden sm:inline text-xs font-medium">Copied!</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FaCopy className="text-xs sm:text-sm" />
                                                            <span className="hidden sm:inline text-xs font-medium">Copy Link</span>
                                                        </>
                                                    )}
                                                </button>
                                            )}
                                            <button
                                                onClick={(e) => handleDeleteBoard(
                                                    board.roomId,
                                                    isTeacher ? (board.name || 'Untitled Board') : (board.boardName || 'Untitled Board'),
                                                    board._id,
                                                    e
                                                )}
                                                className="p-2 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100"
                                                title={isTeacher ? "Delete board" : "Remove from saved"}
                                            >
                                                <FaTrash className="text-xs" />
                                            </button>
                                            <div className="text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                                →
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>


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
