import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaDownload, FaMarkdown } from 'react-icons/fa';

const SideNotes = ({ isOpen, onClose, darkMode }) => {
    const [notes, setNotes] = useState('');

    // BLOB API Logic for Downloading Markdown File
    const handleDownload = () => {
        if (!notes.trim()) {
            alert("Your notes are empty! Write something before exporting.");
            return;
        }
        
        // Blob API object creation
        const blob = new Blob([notes], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        // Dynamically naming the file with today's date
        link.download = `Eduboard-Notes-${new Date().toISOString().slice(0, 10)}.md`;
        
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    // Slide-over animation config
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className={`fixed top-0 right-0 h-full w-80 sm:w-96 shadow-2xl z-50 flex flex-col border-l ${
                        darkMode ? 'bg-[#0f172a] border-slate-700' : 'bg-gray-50 border-gray-300'
                    }`}
                >
                    {/* Drawer Header */}
                    <div className={`p-4 flex items-center justify-between border-b ${
                        darkMode ? 'border-slate-700 bg-slate-900' : 'border-gray-200 bg-white'
                    }`}>
                        <div className="flex items-center gap-2">
                            <FaMarkdown className={`text-xl ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                            <h2 className={`font-semibold tracking-wide ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                                Markdown Notes
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className={`p-2 rounded-full transition-colors ${
                                darkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-800 hover:bg-gray-200'
                            }`}
                            title="Close panel"
                        >
                            <FaTimes />
                        </button>
                    </div>

                    {/* Markdown Text Area */}
                    <div className="flex-1 p-4 overflow-hidden flex flex-col">
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="# Meeting Summary&#10;&#10;* Point 1&#10;* Point 2&#10;&#10;> Important note here..."
                            className={`flex-1 w-full p-4 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm leading-relaxed shadow-inner transition-colors ${
                                darkMode 
                                    ? 'bg-slate-800/50 text-slate-200 placeholder-slate-500 border border-slate-700' 
                                    : 'bg-white text-slate-800 placeholder-slate-400 border border-gray-300'
                            }`}
                        />
                    </div>

                    {/* Footer / Export Button */}
                    <div className={`p-4 border-t ${
                        darkMode ? 'border-slate-700 bg-slate-900' : 'border-gray-200 bg-white'
                    }`}>
                        <button
                            onClick={handleDownload}
                            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-500/25 active:scale-[0.98]"
                        >
                            <FaDownload />
                            Export as .md
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SideNotes;