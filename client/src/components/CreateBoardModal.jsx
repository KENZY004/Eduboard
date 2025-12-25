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
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        {/* Modal */}
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="surface-card rounded-3xl p-8 max-w-md w-full relative"
                        >
                            {/* Close Button */}
                            <button
                                onClick={handleClose}
                                className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
                            >
                                <FaTimes />
                            </button>

                            {/* Header */}
                            <div className="mb-6">
                                <h2 className="text-3xl font-bold text-white mb-2">Create New Board</h2>
                                <p className="text-slate-400">Give your whiteboard a name to save it</p>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 ml-1">
                                        Board Name
                                    </label>
                                    <input
                                        type="text"
                                        value={boardName}
                                        onChange={(e) => {
                                            setBoardName(e.target.value);
                                            setError('');
                                        }}
                                        placeholder="e.g., Physics - Chapter 5"
                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
                                        autoFocus
                                    />
                                    {error && (
                                        <p className="text-red-400 text-sm mt-2 ml-1">{error}</p>
                                    )}
                                </div>

                                {/* Buttons */}
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={handleClose}
                                        className="flex-1 bg-white/5 hover:bg-white/10 text-white font-medium py-3 rounded-xl border border-white/10 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all"
                                    >
                                        Create <FaRocket className="text-sm" />
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
