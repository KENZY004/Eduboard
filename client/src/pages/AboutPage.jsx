import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import Footer from '../components/Footer';

const AboutPage = () => {
    const { theme } = useTheme();
    const [activeTimeline, setActiveTimeline] = useState(0);
    const [selectedMember, setSelectedMember] = useState(null);

    useEffect(() => {
    }, []);

    // Lock scroll when modal is open
    useEffect(() => {
        if (selectedMember) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [selectedMember]);

    const timeline = [
        { year: "2025", title: "Project Launch", desc: "EduBoard goes live" },
        { year: "Q1", title: "1K Users", desc: "Reached first milestone" },
        { year: "Q2", title: "Feature Expansion", desc: "Added advanced tools" },
        { year: "Future", title: "Global Scale", desc: "Expanding worldwide" },
    ];

    const team = [
        {
            id: 1,
            name: 'Vanshika Babral',
            role: 'Full Stack Developer',
            bio: 'Building seamless user experiences with modern web technologies.',
            image: '/team/vanshika.png',
            skills: ['React', 'Node.js', 'UI Design', 'MongoDB'],
            projects: ['Whiteboard Interface', 'Real-time Features'],
            gradient: 'from-blue-600 to-violet-600'
        },
        {
            id: 2,
            name: 'Minha Kenzy OM',
            role: 'Full Stack Developer',
            bio: 'Focused on backend systems, authentication, and email services.',
            image: '/team/kenzy.jpeg',
            skills: ['Node.js', 'MongoDB', 'Authentication', 'React'],
            projects: ['Auth System', 'Email Service', 'Admin Panel', 'Database'],
            gradient: 'from-fuchsia-600 to-pink-500'
        },

    ];

    const values = [
        {
            icon: "💡",
            title: "Innovation",
            desc: "Pushing boundaries in educational technology",
            gradient: "from-blue-600 to-indigo-600"
        },
        {
            icon: "🤝",
            title: "Collaboration",
            desc: "Learning is better together",
            gradient: "from-indigo-600 to-blue-600"
        },
        {
            icon: "🎯",
            title: "Excellence",
            desc: "Committed to quality and performance",
            gradient: "from-slate-600 to-slate-700"
        },
        {
            icon: "🌍",
            title: "Accessibility",
            desc: "Education for everyone, everywhere",
            gradient: "from-teal-600 to-cyan-600"
        },
    ];

    const techStack = [
        { name: "React", icon: "⚛️", color: "from-blue-600 to-cyan-600" },
        { name: "Node.js", icon: "🟢", color: "from-teal-700 to-teal-600" },
        { name: "MongoDB", icon: "🍃", color: "from-emerald-700 to-teal-700" },
        { name: "Socket.io", icon: "🔌", color: "from-indigo-600 to-blue-600" },
        { name: "Vite", icon: "⚡", color: "from-slate-600 to-slate-700" },
        { name: "Tailwind", icon: "🎨", color: "from-cyan-600 to-blue-600" },
    ];

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300">

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-6 overflow-hidden">
                <div className="absolute inset-0">
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            rotate: [0, 90, 0],
                        }}
                        transition={{ duration: 20, repeat: Infinity }}
                        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl bg-indigo-300/30 dark:bg-indigo-500/20"
                    />
                    <motion.div
                        animate={{
                            scale: [1, 1.3, 1],
                            rotate: [0, -90, 0],
                        }}
                        transition={{ duration: 25, repeat: Infinity }}
                        className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl bg-purple-300/30 dark:bg-purple-500/20"
                    />
                </div>

                <div className="relative max-w-6xl mx-auto text-center mt-10">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-6xl md:text-7xl font-extrabold mb-6"
                    >
                        <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-white dark:via-indigo-200 dark:to-purple-200 bg-clip-text text-transparent">
                            About EduBoard
                        </span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-2xl max-w-3xl mx-auto text-slate-600 dark:text-slate-400"
                    >
                        Empowering educators with innovative tools for collaborative learning
                    </motion.p>
                </div>
            </section>

            {/* Mission with Visual */}
            <section className="py-24 px-6 transition-colors">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-4xl font-bold mb-6 text-slate-900 dark:text-white">Our Mission</h2>
                            <p className="text-lg mb-4 text-slate-600 dark:text-slate-300 leading-relaxed">
                                Transform the way teachers and students collaborate in the digital age. We believe learning should be interactive, engaging, and accessible to everyone.
                            </p>
                            <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                                Our platform combines the freedom of an infinite canvas with real-time collaboration, giving educators the tools to create dynamic visual lessons.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="relative"
                        >
                            <div className="aspect-square rounded-3xl overflow-hidden bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 transition-all shadow-lg flex items-center justify-center text-8xl">
                                🎓
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Timeline */}
            <section className="py-24 px-6 bg-slate-50/50 dark:bg-slate-900/50 transition-colors">
                <div className="max-w-6xl mx-auto">
                    <motion.h2
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-4xl font-bold text-center mb-16 text-slate-900 dark:text-white"
                    >
                        Our Journey
                    </motion.h2>

                    <div className="relative">
                        {/* Timeline line */}
                        <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-slate-200 dark:bg-slate-800 hidden sm:block" />

                        <div className="space-y-12">
                            {timeline.map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.2 }}
                                    className={`flex items-center flex-col sm:flex-row ${i % 2 === 0 ? 'sm:flex-row' : 'sm:flex-row-reverse'}`}
                                >
                                    <div className="flex-1 hidden sm:block" />
                                    <div className="relative z-10 my-4 sm:my-0">
                                        <div className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-white bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20">
                                            {i + 1}
                                        </div>
                                    </div>
                                    <div className="flex-1 w-full sm:px-8">
                                        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
                                            <div className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mb-2 uppercase tracking-wider">{item.year}</div>
                                            <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">{item.title}</h3>
                                            <p className="text-slate-600 dark:text-slate-400">
                                                {item.desc}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="py-24 px-6">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-white">Meet the Team</h2>
                        <p className="text-xl text-slate-600 dark:text-slate-400">The creators behind EduBoard</p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
                        {team.map((member, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ y: -10, scale: 1.02 }}
                                onClick={() => setSelectedMember(member)}
                                className="p-8 rounded-2xl text-center group cursor-pointer bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 shadow-sm hover:shadow-xl transition-all"
                            >
                                {/* Team member photo */}
                                {member.image ? (
                                    <img
                                        src={member.image}
                                        alt={member.name}
                                        className="w-32 h-32 mx-auto mb-6 rounded-full object-cover border-4 border-indigo-500/30 group-hover:scale-110 group-hover:border-indigo-500/50 transition-all duration-300 shadow-lg"
                                    />
                                ) : (
                                    <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-4xl font-bold text-white group-hover:scale-110 transition-transform shadow-lg">
                                        {member.name.charAt(0)}
                                    </div>
                                )}
                                <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">{member.name}</h3>
                                <p className="font-medium mb-3 text-indigo-600 dark:text-indigo-400 uppercase tracking-wide text-sm">{member.role}</p>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{member.bio}</p>
                                <p className="text-xs font-semibold text-indigo-500 dark:text-indigo-400 group-hover:underline transition-all">Click to learn more</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team Member Modal */}
            {selectedMember && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm transition-all animate-fade-in" onClick={() => setSelectedMember(null)}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="relative w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header with gradient */}
                        <div className={`relative h-48 bg-gradient-to-br ${selectedMember.gradient} flex items-center justify-center`}>
                            <button
                                onClick={() => setSelectedMember(null)}
                                className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors border border-white/20"
                            >
                                <FontAwesomeIcon icon={faTimes} className="text-white" />
                            </button>
                            <img
                                src={selectedMember.image}
                                alt={selectedMember.name}
                                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-2xl"
                            />
                        </div>

                        {/* Content */}
                        <div className="p-8">
                            <h2 className="text-3xl font-bold text-center mb-2 text-slate-900 dark:text-white">{selectedMember.name}</h2>
                            <p className="text-center font-semibold mb-6 uppercase tracking-widest text-indigo-600 dark:text-indigo-400 text-sm">{selectedMember.role}</p>

                            <p className="text-center mb-8 leading-relaxed text-slate-600 dark:text-slate-300">{selectedMember.bio}</p>

                            {/* Skills */}
                            <div className="mb-8">
                                <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-white flex items-center gap-2">
                                    <div className="w-2 h-8 bg-indigo-500 rounded-full"></div>
                                    Skills
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {selectedMember.skills.map((skill, i) => (
                                        <span key={i} className="px-4 py-2 rounded-lg text-sm font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Projects */}
                            <div>
                                <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-white flex items-center gap-2">
                                    <div className="w-2 h-8 bg-purple-500 rounded-full"></div>
                                    Key Projects
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {selectedMember.projects.map((project, i) => (
                                        <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 transition-colors">
                                            <FontAwesomeIcon icon={faCheckCircle} className="text-green-500" />
                                            <span className="text-slate-600 dark:text-slate-300 text-sm">{project}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Values Grid */}
            <section className="py-24 px-6 bg-slate-50/50 dark:bg-slate-900/50 transition-colors">
                <div className="max-w-7xl mx-auto">
                    <motion.h2
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-4xl font-bold text-center mb-16 text-slate-900 dark:text-white"
                    >
                        Our Values
                    </motion.h2>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {values.map((value, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                whileHover={{ scale: 1.05 }}
                                className="p-8 rounded-2xl text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all"
                            >
                                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${value.gradient} flex items-center justify-center text-3xl shadow-lg shadow-indigo-500/20`}>
                                    {value.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">{value.title}</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    {value.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Tech Stack */}
            <section className="py-24 px-6">
                <div className="max-w-6xl mx-auto">
                    <motion.h2
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-4xl font-bold text-center mb-16 text-slate-900 dark:text-white"
                    >
                        Built With Modern Tech
                    </motion.h2>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                        {techStack.map((tech, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                whileHover={{ y: -10, rotate: 5 }}
                                className={`aspect-square rounded-2xl bg-gradient-to-br ${tech.color} p-0.5 shadow-lg group`}
                            >
                                <div className="w-full h-full rounded-[14px] flex flex-col items-center justify-center bg-white dark:bg-slate-900 transition-colors">
                                    <div className="text-4xl mb-2 transform group-hover:scale-125 transition-transform">{tech.icon}</div>
                                    <div className="text-sm font-bold text-slate-700 dark:text-slate-300">{tech.name}</div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-32 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="p-12 rounded-3xl bg-gradient-to-br from-indigo-50 to-white dark:from-slate-900 dark:to-slate-800 border-2 border-indigo-100 dark:border-slate-800 shadow-xl transition-all"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900 dark:text-white">
                            Join Our Community
                        </h2>
                        <p className="text-xl mb-8 text-slate-600 dark:text-slate-400">
                            Be part of the future of collaborative learning
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                to="/signup"
                                className="px-10 py-5 text-lg font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:from-indigo-500 hover:to-purple-500 transition-all shadow-2xl shadow-indigo-500/50 hover:shadow-indigo-500/70 hover:scale-105"
                            >
                                Get Started Free
                            </Link>
                            <Link
                                to="/features"
                                className="px-10 py-5 text-lg font-semibold text-slate-700 dark:text-white bg-slate-100 dark:bg-white/10 backdrop-blur-sm rounded-xl hover:bg-slate-200 dark:hover:bg-white/20 transition-all border border-slate-200 dark:border-white/20"
                            >
                                Explore Features
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default AboutPage;
