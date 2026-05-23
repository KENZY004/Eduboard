import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaRocket } from 'react-icons/fa';

const CreateBoardModal = ({ isOpen, onClose, onCreateBoard }) => {
    const [boardName, setBoardName] = useState('');
    const [error, setError] = useState('');

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setBoardName('');
            setError('');
        }
    }, [isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('boardName trimmed:', boardName.trim());
        console.log('Is empty?:', !boardName.trim());

        if (!boardName.trim()) {
            setError('Board name is required');
            return;
        }

        console.log('Calling onCreateBoard with:', boardName.trim());
        onCreateBoard(boardName.trim());
        setBoardName('');
        setError('');
    };

    const handleClose = () => {
        setBoardName('');
        setError('');
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4"
                    >
                        {/* Modal */}
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 max-w-md w-full relative shadow-2xl border border-slate-200 dark:border-slate-800 transition-colors duration-300"
                        >
                            {/* Close Button */}
                            <button
                                onClick={handleClose}
                                className="absolute top-8 right-8 p-3 rounded-full bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-all duration-200 group"
                            >
                                <FaTimes className="group-hover:rotate-90 transition-transform duration-300" />
                            </button>

                            {/* Header */}
                            <div className="mb-8">
                                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2.5 tracking-tight">Create New Board</h2>
                                <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">Give your whiteboard a name to save it to your workspace</p>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="space-y-3">
                                    <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.25em] ml-1">
                                        Identity
                                    </label>
                                    <input
                                        type="text"
                                        value={boardName}
                                        onChange={(e) => {
                                            setBoardName(e.target.value);
                                            setError('');
                                        }}
                                        placeholder="e.g., Geometry Fundamentals"
                                        className="w-full bg-slate-50 dark:bg-slate-950/50 border-2 border-slate-100 dark:border-slate-800 rounded-[1.25rem] px-5 py-4 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-lg shadow-inner"
                                        autoFocus
                                    />
                                    {error && (
                                        <motion.p 
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="text-red-500 font-bold text-xs mt-2 ml-2 flex items-center gap-2"
                                        >
                                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                                            {error}
                                        </motion.p>
                                    )}
                                </div>

                                {/* Buttons */}
                                <div className="flex gap-4 pt-2">
                                    <button
                                        type="button"
                                        onClick={handleClose}
                                        className="flex-1 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 font-bold py-4 rounded-2xl border border-slate-200 dark:border-white/10 transition-all active:scale-95 uppercase tracking-widest text-[10px]"
                                    >
                                        Dismiss
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-4 rounded-2xl shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-3 transition-all active:scale-95 uppercase tracking-widest text-[10px]"
                                    >
                                        Launch <FaRocket className="text-xs" />
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default CreateBoardModal;
