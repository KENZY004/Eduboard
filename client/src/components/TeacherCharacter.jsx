import React from 'react';
import { motion } from 'framer-motion';

const TeacherCharacter = ({ className = "" }) => {
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
                fill="url(#teacherGradient)"
                animate={{
                    scale: [1, 1.05, 1],
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            {/* Body */}
            <motion.path
                d="M200 280 C180 280, 170 270, 170 250 L170 180 C170 160, 180 150, 200 150 C220 150, 230 160, 230 180 L230 250 C230 270, 220 280, 200 280Z"
                fill="#6366f1"
                animate={{
                    y: [0, -5, 0],
                }}
                transition={{
                    duration: 3,
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
                    y: [0, -3, 0],
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            {/* Hair */}
            <motion.path
                d="M160 110 Q160 80, 200 80 Q240 80, 240 110"
                fill="#1e293b"
                animate={{
                    y: [0, -3, 0],
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            {/* Eyes */}
            <motion.g
                animate={{
                    scaleY: [1, 0.1, 1],
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatDelay: 2,
                }}
            >
                <circle cx="185" cy="120" r="4" fill="#1e293b" />
                <circle cx="215" cy="120" r="4" fill="#1e293b" />
            </motion.g>

            {/* Smile */}
            <motion.path
                d="M185 130 Q200 140, 215 130"
                stroke="#1e293b"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
                animate={{
                    d: [
                        "M185 130 Q200 140, 215 130",
                        "M185 130 Q200 142, 215 130",
                        "M185 130 Q200 140, 215 130",
                    ],
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            {/* Tablet/Device */}
            <motion.rect
                x="230"
                y="200"
                width="60"
                height="80"
                rx="8"
                fill="#8b5cf6"
                stroke="#6366f1"
                strokeWidth="3"
                animate={{
                    rotate: [0, -5, 0],
                    y: [0, -5, 0],
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            {/* Screen lines */}
            <motion.g
                animate={{
                    y: [0, -5, 0],
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            >
                <line x1="240" y1="215" x2="280" y2="215" stroke="#fff" strokeWidth="2" />
                <line x1="240" y1="225" x2="275" y2="225" stroke="#fff" strokeWidth="2" />
                <line x1="240" y1="235" x2="270" y2="235" stroke="#fff" strokeWidth="2" />
            </motion.g>

            {/* Arms */}
            <motion.path
                d="M170 180 L140 220"
                stroke="#6366f1"
                strokeWidth="12"
                strokeLinecap="round"
                animate={{
                    d: [
                        "M170 180 L140 220",
                        "M170 180 L135 215",
                        "M170 180 L140 220",
                    ],
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />
            <motion.path
                d="M230 180 L260 220"
                stroke="#6366f1"
                strokeWidth="12"
                strokeLinecap="round"
                animate={{
                    d: [
                        "M230 180 L260 220",
                        "M230 180 L265 215",
                        "M230 180 L260 220",
                    ],
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5,
                }}
            />

            {/* Floating elements */}
            <motion.circle
                cx="100"
                cy="100"
                r="8"
                fill="#22d3ee"
                animate={{
                    y: [0, -20, 0],
                    opacity: [0.5, 1, 0.5],
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />
            <motion.circle
                cx="300"
                cy="150"
                r="6"
                fill="#a78bfa"
                animate={{
                    y: [0, -15, 0],
                    opacity: [0.5, 1, 0.5],
                }}
                transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5,
                }}
            />

            <defs>
                <linearGradient id="teacherGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.2" />
                </linearGradient>
            </defs>
        </motion.svg>
    );
};

export default TeacherCharacter;
