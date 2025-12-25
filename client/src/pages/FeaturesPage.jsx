import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const FeaturesPage = () => {
    const { theme } = useTheme();
    const [stats, setStats] = useState({ users: 0, boards: 0, drawings: 0 });

    useEffect(() => {

        // Animated counter for stats
        const duration = 2000;
        const targetStats = { users: 1000, boards: 5000, drawings: 50000 };
        const startTime = Date.now();

        const animateStats = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            setStats({
                users: Math.floor(targetStats.users * progress),
                boards: Math.floor(targetStats.boards * progress),
                drawings: Math.floor(targetStats.drawings * progress),
            });

            if (progress < 1) {
                requestAnimationFrame(animateStats);
            }
        };

        const timer = setTimeout(() => animateStats(), 500);
        return () => clearTimeout(timer);
    }, []);

    const bentoFeatures = [
        {
            title: "Real-time Collaboration",
            description: "See changes instantly as multiple users draw together",
            icon: "⚡",
            size: "large",
            gradient: "from-blue-600 to-indigo-600"
        },
        {
            title: "Infinite Canvas",
            description: "Never run out of space for your ideas",
            icon: "∞",
            size: "medium",
            gradient: "from-slate-600 to-slate-700"
        },
        {
            title: "Drawing Tools",
            description: "Professional-grade pen, shapes, and more",
            icon: "✏️",
            size: "medium",
            gradient: "from-indigo-600 to-blue-700"
        },
        {
            title: "Live Cursors",
            description: "See where everyone is working in real-time",
            icon: "🎯",
            size: "small",
            gradient: "from-teal-600 to-cyan-600"
        },
        {
            title: "Sticky Notes",
            description: "Colorful notes for brainstorming",
            icon: "📌",
            size: "small",
            gradient: "from-cyan-600 to-blue-600"
        },
        {
            title: "Role-Based Access",
            description: "Teachers control, students collaborate",
            icon: "🔒",
            size: "medium",
            gradient: "from-blue-700 to-indigo-700"
        },
    ];

    const features = [
        {
            category: "Collaboration",
            items: [
                { icon: "👥", title: "Multi-user Support", desc: "Unlimited participants" },
                { icon: "🔄", title: "Real-time Sync", desc: "Instant updates" },
                { icon: "💬", title: "Live Presence", desc: "See who's online" },
            ]
        },
        {
            category: "Tools",
            items: [
                { icon: "🖊️", title: "Freehand Drawing", desc: "Smooth pen tool" },
                { icon: "⬡", title: "Shape Tools", desc: "Perfect geometry" },
                { icon: "📝", title: "Text & Annotations", desc: "Rich formatting" },
            ]
        },
        {
            category: "Management",
            items: [
                { icon: "📋", title: "Board Management", desc: "Organize classes" },
                { icon: "🔑", title: "Room Codes", desc: "Easy joining" },
                { icon: "👨‍🏫", title: "Teacher Controls", desc: "Full control" },
            ]
        },
    ];

    return (
        <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-950 text-white' : 'bg-white text-gray-900'}`}>
            <Navbar />

            {/* Hero Section with Animated Background */}
            <section className="relative pt-32 pb-20 px-6 overflow-hidden">
                {/* Animated gradient orbs */}
                <div className="absolute inset-0 overflow-hidden">
                    <motion.div
                        animate={{
                            x: [0, 100, 0],
                            y: [0, -100, 0],
                        }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl ${theme === 'dark' ? 'bg-indigo-500/20' : 'bg-indigo-300/30'
                            }`}
                    />
                    <motion.div
                        animate={{
                            x: [0, -100, 0],
                            y: [0, 100, 0],
                        }}
                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                        className={`absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl ${theme === 'dark' ? 'bg-purple-500/20' : 'bg-purple-300/30'
                            }`}
                    />
                </div>

                <div className="relative max-w-6xl mx-auto text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-6xl md:text-7xl font-extrabold mb-6"
                    >
                        <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                            Powerful Features
                        </span>
                        <br />
                        <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                            Built for Education
                        </span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className={`text-xl max-w-3xl mx-auto ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}
                    >
                        Everything you need for interactive, collaborative learning in one powerful platform
                    </motion.p>

                    {/* Animated Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="grid grid-cols-3 gap-8 max-w-3xl mx-auto mt-16"
                    >
                        {[
                            { label: "Active Users", value: stats.users.toLocaleString() + "+" },
                            { label: "Boards Created", value: stats.boards.toLocaleString() + "+" },
                            { label: "Drawings Made", value: stats.drawings.toLocaleString() + "+" },
                        ].map((stat, i) => (
                            <div key={i} className={`p-6 rounded-2xl ${theme === 'dark' ? 'bg-gray-900/50 border border-gray-800' : 'bg-gray-50 border border-gray-200'
                                }`}>
                                <div className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                                    {stat.value}
                                </div>
                                <div className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Bento Grid Feature Showcase */}
            <section className="py-24 px-6">
                <div className="max-w-7xl mx-auto">
                    <motion.h2
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-5xl font-bold text-center mb-16"
                    >
                        Everything You Need
                    </motion.h2>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {bentoFeatures.map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                whileHover={{ scale: 1.02, y: -5 }}
                                className={`
                                    relative overflow-hidden rounded-3xl p-8
                                    ${feature.size === 'large' ? 'md:col-span-2 md:row-span-2' : ''}
                                    ${feature.size === 'medium' ? 'md:col-span-2' : ''}
                                    ${theme === 'dark' ? 'bg-gray-900 border border-gray-800' : 'bg-gray-50 border border-gray-200'}
                                    cursor-pointer transition-all duration-300
                                `}
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 hover:opacity-10 transition-opacity duration-300`} />

                                <div className="relative z-10">
                                    <div className="text-5xl mb-4">{feature.icon}</div>
                                    <h3 className="text-2xl font-bold mb-2">{feature.title}</h3>
                                    <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                                        {feature.description}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Feature Categories with Icons */}
            <section className={`py-24 px-6 ${theme === 'dark' ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-12">
                        {features.map((category, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.2 }}
                            >
                                <h3 className="text-2xl font-bold mb-8 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                                    {category.category}
                                </h3>
                                <div className="space-y-6">
                                    {category.items.map((item, j) => (
                                        <motion.div
                                            key={j}
                                            whileHover={{ x: 10 }}
                                            className="flex items-start gap-4"
                                        >
                                            <div className="text-3xl flex-shrink-0">{item.icon}</div>
                                            <div>
                                                <h4 className="font-semibold mb-1">{item.title}</h4>
                                                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                                    {item.desc}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-32 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className={`p-12 rounded-3xl ${theme === 'dark' ? 'bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-gray-700' : 'bg-gradient-to-br from-white to-blue-50 border-2 border-blue-200'
                            }`}
                    >
                        <h2 className="text-4xl md:text-5xl font-bold mb-6">
                            Ready to Transform Your Classroom?
                        </h2>
                        <p className={`text-xl mb-8 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                            Join thousands of educators using EduBoard
                        </p>
                        <Link
                            to="/signup"
                            className="inline-block px-10 py-5 text-lg font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:from-indigo-500 hover:to-purple-500 transition-all shadow-2xl shadow-indigo-500/50 hover:shadow-indigo-500/70 hover:scale-105"
                        >
                            Get Started Free
                        </Link>
                    </motion.div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default FeaturesPage;
