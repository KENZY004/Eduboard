import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { FaPlus, FaSignInAlt, FaSignOutAlt, FaRocket, FaGlobe, FaClock } from 'react-icons/fa';
import { BsLightningChargeFill, BsStars } from 'react-icons/bs';
import { motion } from 'framer-motion';

const Dashboard = () => {
    const [roomId, setRoomId] = useState('');
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    const createMeeting = () => {
        const id = uuidv4();
        navigate(`/board/${id}`);
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
                        <p className="text-xs text-slate-500 font-mono">WORKSPACE: PERSONAL</p>
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
                className="grid grid-cols-1 md:grid-cols-3 grid-rows-2 gap-6 h-[600px]"
            >
                {/* Main Action: New Board (Large) */}
                <motion.div
                    whileHover={{ scale: 1.01 }}
                    className="md:col-span-2 md:row-span-2 surface-card rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden group cursor-pointer"
                    onClick={createMeeting}
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

                {/* Secondary Action: Join (Medium) */}
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


            </motion.div>
        </div>
    );
};

export default Dashboard;
