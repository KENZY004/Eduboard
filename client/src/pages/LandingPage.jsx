import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const LandingPage = () => {
    const heroRef = useRef(null);

    useEffect(() => {
        // Smooth scroll behavior for in-page scrolling
        document.documentElement.style.scrollBehavior = 'smooth';

        // Intersection Observer for scroll animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px',
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-fade-in-up');
                }
            });
        }, observerOptions);

        document.querySelectorAll('.scroll-animate').forEach((el) => {
            observer.observe(el);
        });

        return () => observer.disconnect();
    }, []);

    const features = [
        {
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            ),
            title: 'Real-time Collaboration',
            description: 'Work together seamlessly with multiple users on the same canvas in real-time.',
        },
        {
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
                </svg>
            ),
            title: 'Infinite Canvas',
            description: 'Unlimited space to brainstorm, sketch, and organize your ideas without boundaries.',
        },
        {
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
            ),
            title: 'Powerful Drawing Tools',
            description: 'Pen, shapes, text, sticky notes, and more tools for creative expression.',
        },
        {
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
            ),
            title: 'Role-Based Access',
            description: 'Secure teacher and student roles with appropriate permissions and controls.',
        },
        {
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            ),
            title: 'Lightning Fast',
            description: 'Optimized performance ensures smooth drawing and collaboration even with complex boards.',
        },
        {
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
            ),
            title: 'Fully Responsive',
            description: 'Works beautifully on desktop, tablet, and mobile devices for learning anywhere.',
        },
    ];

    const steps = [
        {
            number: '01',
            title: 'Sign Up',
            description: 'Create your free account as a teacher or student in seconds.',
            icon: (
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
            ),
        },
        {
            number: '02',
            title: 'Create or Join',
            description: 'Teachers create boards, students join with a simple room code.',
            icon: (
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ),
        },
        {
            number: '03',
            title: 'Collaborate',
            description: 'Start drawing, teaching, and learning together in real-time.',
            icon: (
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                </svg>
            ),
        },
    ];

    const useCases = [
        {
            role: 'For Teachers',
            benefits: [
                'Create interactive lessons and visual explanations',
                'Manage multiple classrooms and boards',
                'Control student permissions and access',
                'Save and reuse lesson templates',
                'Access comprehensive admin panel',
                'Monitor student activity and participation',
                'Export and share board content',
                'Organize boards by class or subject',
            ],
            gradient: 'from-indigo-600 to-purple-600',
        },
        {
            role: 'For Students',
            benefits: [
                'Join classes with simple room codes',
                'Collaborate on group projects in real-time',
                'Take visual notes and brainstorm ideas',
                'Access boards from any device',
                'View and revisit saved boards anytime',
                'Participate in interactive lessons',
                'Work with unlimited drawing tools',
                'Learn through visual collaboration',
            ],
            gradient: 'from-purple-600 to-pink-600',
        },
    ];

    const teamMembers = [
        {
            id: 1,
            name: 'Vanshika Babral',
            role: 'Developer',
            bio: 'Dedicated to building seamless user experiences and scalable architecture.',
            image: '/team/vanshika.png',
            skills: ['React', 'Node.js', 'System Design', 'WebSockets'],
            projects: ['Real-time Sync Engine', 'Whiteboard Core'],
            gradient: 'from-blue-600 to-violet-600'
        },
        {
            id: 2,
            name: 'Minha Kenzy OM',
            role: 'Full Stack Developer',
            bio: 'Passionate about creating innovative educational tools and beautiful interfaces.',
            image: '/team/kenzy.jpeg',
            skills: ['MERN Stack', 'UI/UX', 'MongoDB', 'Authentication'],
            projects: ['Admin Dashboard', 'User Management System'],
            gradient: 'from-fuchsia-600 to-pink-500'
        },
        {
            id: 3,
            name: 'Mansi Singh',
            role: 'Developer',
            bio: 'Focused on real-time collaboration technology and database optimization.',
            image: '/team/mansi.jpeg',
            skills: ['MongoDB', 'Express', 'Socket.io', 'Data Modeling'],
            projects: ['Real-time Collaboration', 'Database Architecture'],
            gradient: 'from-emerald-600 to-teal-500'
        },
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            <Navbar />

            {/* Hero Section */}
            <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
                {/* Grid Background */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f15_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

                {/* Animated Background Elements */}
                <motion.div
                    animate={{
                        x: [0, 100, 0],
                        y: [0, -100, 0],
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{
                        x: [0, -100, 0],
                        y: [0, 100, 0],
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{
                        x: [0, -50, 0],
                        y: [0, 50, 0],
                        scale: [1, 1.2, 1],
                    }}
                    transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-500/15 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{
                        x: [0, 80, 0],
                        y: [0, -80, 0],
                        scale: [1, 0.8, 1],
                    }}
                    transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-10 right-10 w-72 h-72 bg-blue-500/15 rounded-full blur-3xl"
                />

                <div className="relative max-w-7xl mx-auto px-6 lg:px-8 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-indigo-200 to-purple-200 bg-clip-text text-transparent leading-tight"
                    >
                        Collaborate. Create. Learn.
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto"
                    >
                        EduBoard is the ultimate collaborative whiteboard platform for modern education.
                        Bring your classroom to life with real-time interaction and infinite possibilities.
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <Link
                            to="/signup"
                            className="px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:from-indigo-500 hover:to-purple-500 transition-all shadow-2xl shadow-indigo-500/50 hover:shadow-indigo-500/70 hover:scale-105"
                        >
                            Get Started Free
                        </Link>
                        <Link
                            to="/features"
                            className="px-8 py-4 text-lg font-semibold text-white bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all border border-white/20"
                        >
                            Explore Features
                        </Link>
                    </motion.div>

                    {/* Floating Stats */}
                    <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.6 }}
                        >
                            <div className="text-4xl font-bold text-indigo-400">∞</div>
                            <div className="text-sm text-slate-400 mt-2">Infinite Canvas</div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.7 }}
                        >
                            <div className="text-4xl font-bold text-purple-400">⚡</div>
                            <div className="text-sm text-slate-400 mt-2">Real-time Sync</div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.8 }}
                        >
                            <div className="text-4xl font-bold text-pink-400">🎨</div>
                            <div className="text-sm text-slate-400 mt-2">Creative Tools</div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-24 px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">Powerful Features</h2>
                        <p className="text-xl text-slate-400">Everything you need for collaborative learning</p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ y: -10, scale: 1.02 }}
                                className="surface-card p-8 rounded-2xl group"
                            >
                                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                                <p className="text-slate-400">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-24 px-6 lg:px-8 bg-slate-900/50">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h2>
                        <p className="text-xl text-slate-400">Get started in three simple steps</p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-12">
                        {steps.map((step, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.15 }}
                                className="text-center"
                            >
                                <div className="relative mb-8">
                                    <div className="w-24 h-24 mx-auto bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white transform hover:scale-110 transition-transform">
                                        {step.icon}
                                    </div>
                                    <div className="absolute -top-4 -right-4 w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center">
                                        <span className="text-2xl font-bold text-indigo-300">{step.number}</span>
                                    </div>
                                </div>
                                <h3 className="text-2xl font-semibold mb-3">{step.title}</h3>
                                <p className="text-slate-400">{step.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Use Cases */}
            <section className="py-24 px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">Built for Everyone</h2>
                        <p className="text-xl text-slate-400">Tailored experiences for teachers and students</p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {useCases.map((useCase, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: index === 0 ? -20 : 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="surface-card p-10 rounded-2xl"
                            >
                                <div className={`inline-block px-6 py-2 bg-gradient-to-r ${useCase.gradient} rounded-full text-white font-semibold mb-6`}>
                                    {useCase.role}
                                </div>
                                <ul className="space-y-4">
                                    {useCase.benefits.map((benefit, i) => (
                                        <li key={i} className="flex items-start">
                                            <svg
                                                className="w-6 h-6 text-indigo-400 mr-3 flex-shrink-0 mt-0.5"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span className="text-slate-300">{benefit}</span>
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-24 px-6 lg:px-8">
                <div className="max-w-4xl mx-auto text-center scroll-animate opacity-0">
                    <div className="surface-card p-12 rounded-3xl">
                        <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Transform Your Classroom?</h2>
                        <p className="text-xl text-slate-300 mb-8">
                            Join thousands of educators and students already using EduBoard for collaborative learning.
                        </p>
                        <Link
                            to="/signup"
                            className="inline-block px-10 py-5 text-lg font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:from-indigo-500 hover:to-purple-500 transition-all shadow-2xl shadow-indigo-500/50 hover:shadow-indigo-500/70 hover:scale-105"
                        >
                            Start Free Today
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default LandingPage;
