import React from 'react';
import { motion } from 'framer-motion';

const StudentCharacter = ({ className = "" }) => {
    return (
        <motion.svg
            className={className}
            viewBox="0 0 400 400"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
        >
            {/* Background Circle */}
            <motion.circle
                cx="200"
                cy="200"
                r="180"
                fill="url(#studentGradient)"
                animate={{
                    scale: [1, 1.05, 1],
                }}
                transition={{
                    duration: 3.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            {/* Body */}
            <motion.path
                d="M200 280 C180 280, 170 270, 170 250 L170 180 C170 160, 180 150, 200 150 C220 150, 230 160, 230 180 L230 250 C230 270, 220 280, 200 280Z"
                fill="#22d3ee"
                animate={{
                    y: [0, -4, 0],
                }}
                transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            {/* Head */}
            <motion.circle
                cx="200"
                cy="120"
                r="40"
                fill="#fbbf24"
                animate={{
                    y: [0, -2, 0],
                }}
                transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            {/* Hair - Casual style */}
            <motion.path
                d="M160 105 Q170 75, 200 75 Q230 75, 240 105 L240 120 Q235 115, 230 115 L170 115 Q165 115, 160 120 Z"
                fill="#1e293b"
                animate={{
                    y: [0, -2, 0],
                }}
                transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            {/* Eyes - Excited */}
            <motion.g
                animate={{
                    scaleY: [1, 0.1, 1],
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatDelay: 2.5,
                }}
            >
                <circle cx="185" cy="118" r="5" fill="#1e293b" />
                <circle cx="215" cy="118" r="5" fill="#1e293b" />
                {/* Sparkle in eyes */}
                <circle cx="187" cy="116" r="2" fill="#fff" />
                <circle cx="217" cy="116" r="2" fill="#fff" />
            </motion.g>

            {/* Happy Smile */}
            <motion.path
                d="M185 132 Q200 145, 215 132"
                stroke="#1e293b"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
                animate={{
                    d: [
                        "M185 132 Q200 145, 215 132",
                        "M185 132 Q200 148, 215 132",
                        "M185 132 Q200 145, 215 132",
                    ],
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            {/* Laptop */}
            <motion.g
                animate={{
                    y: [0, -4, 0],
                }}
                transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            >
                {/* Laptop base */}
                <rect
                    x="150"
                    y="260"
                    width="100"
                    height="8"
                    rx="2"
                    fill="#475569"
                />
                {/* Laptop screen */}
                <rect
                    x="160"
                    y="200"
                    width="80"
                    height="60"
                    rx="4"
                    fill="#1e293b"
                    stroke="#6366f1"
                    strokeWidth="3"
                />
                {/* Screen content */}
                <rect x="170" y="210" width="60" height="3" rx="1" fill="#22d3ee" />
                <rect x="170" y="220" width="50" height="3" rx="1" fill="#8b5cf6" />
                <rect x="170" y="230" width="55" height="3" rx="1" fill="#22d3ee" />
                <rect x="170" y="240" width="45" height="3" rx="1" fill="#6366f1" />
            </motion.g>

            {/* Arms - Typing position */}
            <motion.path
                d="M170 180 L150 240"
                stroke="#22d3ee"
                strokeWidth="12"
                strokeLinecap="round"
                animate={{
                    d: [
                        "M170 180 L150 240",
                        "M170 180 L148 238",
                        "M170 180 L150 240",
                    ],
                }}
                transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />
            <motion.path
                d="M230 180 L250 240"
                stroke="#22d3ee"
                strokeWidth="12"
                strokeLinecap="round"
                animate={{
                    d: [
                        "M230 180 L250 240",
                        "M230 180 L252 238",
                        "M230 180 L250 240",
                    ],
                }}
                transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.3,
                }}
            />

            {/* Floating elements - Books and stars */}
            <motion.g
                animate={{
                    y: [0, -25, 0],
                    rotate: [0, 10, 0],
                    opacity: [0.4, 1, 0.4],
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            >
                <rect x="90" y="120" width="20" height="25" rx="2" fill="#8b5cf6" />
                <line x1="95" y1="127" x2="105" y2="127" stroke="#fff" strokeWidth="1" />
                <line x1="95" y1="133" x2="105" y2="133" stroke="#fff" strokeWidth="1" />
            </motion.g>

            <motion.path
                d="M310 100 L315 110 L325 112 L317 120 L319 130 L310 125 L301 130 L303 120 L295 112 L305 110 Z"
                fill="#fbbf24"
                animate={{
                    rotate: [0, 360],
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5],
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            <motion.circle
                cx="320"
                cy="200"
                r="6"
                fill="#22d3ee"
                animate={{
                    y: [0, -18, 0],
                    opacity: [0.4, 1, 0.4],
                }}
                transition={{
                    duration: 2.8,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.8,
                }}
            />

            <defs>
                <linearGradient id="studentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.2" />
                </linearGradient>
            </defs>
        </motion.svg>
    );
};

export default StudentCharacter;
