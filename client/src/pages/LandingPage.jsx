import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

/* ── animation helpers ─────────────────────────────────────── */
const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 28 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-60px' },
    transition: { duration: 0.55, delay, ease: [0.25, 0.4, 0.25, 1] },
});

/* ── cycling words for hero ────────────────────────────────── */
const WORDS = ['Collaborate', 'Innovate', 'Inspire', 'Create'];

/* ═══════════════════════════════════════════════════════════ */
const LandingPage = () => {
    const heroRef           = useRef(null);
    const [wordIdx, setWordIdx] = useState(0);
    const { scrollY }       = useScroll();
    const heroY             = useTransform(scrollY, [0, 500], [0, -120]);
    const heroOpacity       = useTransform(scrollY, [0, 300], [1, 0]);

    /* cycle words */
    useEffect(() => {
        const id = setInterval(() => setWordIdx(i => (i + 1) % WORDS.length), 2400);
        return () => clearInterval(id);
    }, []);

    /* scroll observer for legacy .scroll-animate elements */
    useEffect(() => {
        const obs = new IntersectionObserver(
            entries => entries.forEach(e => {
                if (e.isIntersecting) e.target.classList.add('animate-fade-in-up');
            }),
            { threshold: 0.1, rootMargin: '0px 0px -80px 0px' }
        );
        document.querySelectorAll('.scroll-animate').forEach(el => obs.observe(el));
        return () => obs.disconnect();
    }, []);

    /* ── data ─────────────────────────────────────────────── */
    const features = [
        {
            icon: '👥',
            title: 'Real-time Collaboration',
            description: 'Draw, annotate and brainstorm with your whole class — live, zero lag.',
            color: 'from-indigo-500 to-violet-600',
            glow: 'rgba(99,102,241,0.35)',
        },
        {
            icon: '♾️',
            title: 'Infinite Canvas',
            description: 'No borders, no limits — your ideas get all the space they need.',
            color: 'from-purple-500 to-pink-600',
            glow: 'rgba(168,85,247,0.35)',
        },
        {
            icon: '🎨',
            title: 'Powerful Drawing Tools',
            description: 'Pens, shapes, sticky notes, text — everything a creator needs.',
            color: 'from-pink-500 to-rose-600',
            glow: 'rgba(236,72,153,0.35)',
        },
        {
            icon: '🔐',
            title: 'Role-Based Access',
            description: 'Teacher controls, student freedom — the right permissions for everyone.',
            color: 'from-cyan-500 to-blue-600',
            glow: 'rgba(6,182,212,0.35)',
        },
        {
            icon: '⚡',
            title: 'Lightning Fast',
            description: 'Buttery-smooth drawing and sync, even with a packed classroom.',
            color: 'from-yellow-500 to-orange-500',
            glow: 'rgba(234,179,8,0.35)',
        },
        {
            icon: '📱',
            title: 'Fully Responsive',
            description: 'Phone, tablet, laptop — EduBoard looks great everywhere.',
            color: 'from-emerald-500 to-teal-600',
            glow: 'rgba(16,185,129,0.35)',
        },
    ];

    const steps = [
        {
            number: '01',
            title: 'Sign Up',
            description: 'Create your free account as a teacher or student in seconds.',
            emoji: '✍️',
            color: 'from-indigo-500 to-violet-600',
        },
        {
            number: '02',
            title: 'Create or Join',
            description: 'Teachers spin up a board; students jump in with a room code.',
            emoji: '🚀',
            color: 'from-violet-500 to-purple-600',
        },
        {
            number: '03',
            title: 'Collaborate',
            description: 'Draw, teach and learn together — in real time, from anywhere.',
            emoji: '🎉',
            color: 'from-purple-500 to-pink-600',
        },
    ];

    const useCases = [
        {
            role: 'For Teachers',
            emoji: '🧑‍🏫',
            benefits: [
                'Create interactive lessons and visual explanations',
                'Manage multiple classrooms and boards',
                'Control student permissions and access',
                'Save and reuse lesson templates',
                'Access comprehensive admin panel',
                'Monitor student activity and participation',
                'Export and share board content',
                'Organise boards by class or subject',
            ],
            gradient: 'from-indigo-600 to-purple-600',
            border: 'rgba(99,102,241,0.3)',
        },
        {
            role: 'For Students',
            emoji: '🧑‍🎓',
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
            border: 'rgba(168,85,247,0.3)',
        },
    ];

    const teamMembers = [
        {
            name: 'Vanshika Babral',
            role: 'Developer',
            bio: 'Dedicated to building seamless user experiences and scalable architecture.',
            image: '/team/vanshika.png',
            skills: ['React', 'Node.js', 'System Design', 'WebSockets'],
            gradient: 'from-blue-600 to-violet-600',
        },
        {
            name: 'Minha Kenzy OM',
            role: 'Full Stack Developer',
            bio: 'Passionate about creating innovative educational tools and beautiful interfaces.',
            image: '/team/kenzy.jpeg',
            skills: ['MERN Stack', 'UI/UX', 'MongoDB', 'Auth'],
            gradient: 'from-fuchsia-600 to-pink-500',
        },
        {
            name: 'Mansi Singh',
            role: 'Developer',
            bio: 'Focused on real-time collaboration technology and database optimisation.',
            image: '/team/mansi.jpeg',
            skills: ['MongoDB', 'Express', 'Socket.io', 'Data Modeling'],
            gradient: 'from-emerald-600 to-teal-500',
        },
    ];

    /* ── render ───────────────────────────────────────────── */
    return (
        <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
            <Navbar />

            {/* ══════════════════════════════════════════════
                HERO
            ══════════════════════════════════════════════ */}
            <section
                ref={heroRef}
                className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16"
            >
                {/* grid */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f15_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

                {/* blobs */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[
                        { cl: 'top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20',  dx: 100, dy: -100, dur: 20 },
                        { cl: 'bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20', dx: -100, dy: 100, dur: 15 },
                        { cl: 'top-1/2 left-1/2 w-64 h-64 bg-cyan-500/15',    dx: -50,  dy: 50,  dur: 18 },
                        { cl: 'top-10 right-10 w-72 h-72 bg-blue-500/15',     dx: 80,   dy: -80, dur: 22 },
                    ].map((b, i) => (
                        <motion.div
                            key={i}
                            animate={{ x: [0, b.dx, 0], y: [0, b.dy, 0], scale: [1, 1.1, 1] }}
                            transition={{ duration: b.dur, repeat: Infinity, ease: 'linear' }}
                            className={`absolute ${b.cl} rounded-full blur-3xl`}
                        />
                    ))}
                </div>

                {/* floating emoji particles */}
                <FloatingParticles />

                <motion.div
                    style={{ y: heroY, opacity: heroOpacity }}
                    className="relative max-w-7xl mx-auto px-6 lg:px-8 text-center"
                >
                    {/* badge */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full text-xs font-semibold tracking-wider uppercase"
                        style={{
                            background: 'rgba(99,102,241,0.15)',
                            border: '1px solid rgba(99,102,241,0.35)',
                        }}
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Now live · Real-time collaboration
                    </motion.div>

                    {/* headline */}
                    <motion.h1
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.65 }}
                        className="text-6xl md:text-8xl font-black mb-6 leading-[1.02] tracking-tight"
                    >
                        {/* cycling word */}
                        <span className="block h-[1.1em] overflow-hidden">
                            <AnimatePresence mode="wait">
                                <motion.span
                                    key={wordIdx}
                                    initial={{ rotateX: -90, opacity: 0 }}
                                    animate={{ rotateX: 0, opacity: 1 }}
                                    exit={{ rotateX: 90, opacity: 0 }}
                                    transition={{ duration: 0.38, ease: 'easeInOut' }}
                                    className="block bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
                                    style={{ transformOrigin: '50% 50%', display: 'block' }}
                                >
                                    {WORDS[wordIdx]}.
                                </motion.span>
                            </AnimatePresence>
                        </span>
                        <span className="block text-white">Learn.</span>
                        <span
                            className="block bg-gradient-to-r from-white via-indigo-200 to-purple-200 bg-clip-text text-transparent"
                        >Together.</span>
                    </motion.h1>

                    {/* sub */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-xl md:text-2xl text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed"
                    >
                        EduBoard is the ultimate collaborative whiteboard for modern classrooms —
                        draw, teach and learn in real time with{' '}
                        <span className="text-indigo-400 font-semibold">infinite possibilities</span>.
                    </motion.p>

                    {/* CTAs */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
                    >
                        <motion.div
                            whileHover={{ scale: 1.06, boxShadow: '0 0 40px rgba(99,102,241,0.6)' }}
                            whileTap={{ scale: 0.96 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                        >
                            <Link
                                to="/signup"
                                className="relative inline-flex items-center gap-2 px-9 py-4 text-lg font-bold text-white rounded-2xl overflow-hidden"
                                style={{
                                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899)',
                                    backgroundSize: '200% 200%',
                                }}
                            >
                                <span>Get Started Free</span>
                                <span className="text-xl">🚀</span>
                                {/* shimmer */}
                                <motion.span
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                                    animate={{ x: ['-100%', '200%'] }}
                                    transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3 }}
                                />
                            </Link>
                        </motion.div>

                        <motion.div
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                        >
                            <Link
                                to="/features"
                                className="inline-flex items-center gap-2 px-9 py-4 text-lg font-semibold text-white rounded-2xl transition-all"
                                style={{
                                    background: 'rgba(255,255,255,0.07)',
                                    border: '1px solid rgba(255,255,255,0.15)',
                                    backdropFilter: 'blur(8px)',
                                }}
                            >
                                Explore Features →
                            </Link>
                        </motion.div>
                    </motion.div>

                    {/* stats */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                        className="grid grid-cols-3 gap-6 max-w-lg mx-auto"
                    >
                        {[
                            { value: '∞', label: 'Infinite Canvas', color: 'text-indigo-400' },
                            { value: '⚡', label: 'Real-time Sync',  color: 'text-purple-400' },
                            { value: '🎨', label: 'Creative Tools',  color: 'text-pink-400'   },
                        ].map((s, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.7 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.6 + i * 0.1 }}
                                whileHover={{ scale: 1.08 }}
                                className="rounded-2xl py-4 px-3 cursor-default"
                                style={{
                                    background: 'rgba(255,255,255,0.04)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                }}
                            >
                                <div className={`text-4xl font-black ${s.color}`}>{s.value}</div>
                                <div className="text-xs text-slate-400 mt-1.5">{s.label}</div>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>

                {/* scroll cue */}
                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 1.8 }}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 text-slate-500"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                </motion.div>
            </section>

            {/* ══════════════════════════════════════════════
                FEATURES
            ══════════════════════════════════════════════ */}
            <section className="py-28 px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <motion.div {...fadeUp()} className="text-center mb-20">
                        <span className="inline-block px-4 py-1 mb-4 rounded-full text-xs font-bold uppercase tracking-widest text-indigo-400"
                            style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)' }}>
                            Features
                        </span>
                        <h2 className="text-5xl md:text-6xl font-black mb-4">
                            <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                                Powerful Features
                            </span>
                        </h2>
                        <p className="text-xl text-slate-400 max-w-xl mx-auto">
                            Everything you need for collaborative learning, in one place.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((f, i) => (
                            <motion.div
                                key={i}
                                {...fadeUp(i * 0.07)}
                                whileHover={{ y: -8, scale: 1.02 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                                className="relative p-8 rounded-2xl group cursor-default overflow-hidden"
                                style={{
                                    background: 'rgba(15,23,42,0.6)',
                                    border: '1px solid rgba(255,255,255,0.07)',
                                    backdropFilter: 'blur(12px)',
                                }}
                            >
                                {/* hover glow */}
                                <motion.div
                                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                                    style={{ boxShadow: `inset 0 0 40px ${f.glow}` }}
                                />

                                {/* icon */}
                                <motion.div
                                    whileHover={{ rotate: [0, -10, 10, -5, 0], scale: 1.15 }}
                                    transition={{ duration: 0.5 }}
                                    className={`w-16 h-16 bg-gradient-to-br ${f.color} rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-lg`}
                                >
                                    {f.icon}
                                </motion.div>

                                <h3 className="text-xl font-bold mb-3 text-white">{f.title}</h3>
                                <p className="text-slate-400 leading-relaxed">{f.description}</p>

                                {/* corner accent */}
                                <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl ${f.color} opacity-10 rounded-bl-3xl rounded-tr-2xl`} />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════
                HOW IT WORKS
            ══════════════════════════════════════════════ */}
            <section className="py-28 px-6 lg:px-8 relative overflow-hidden">
                <div className="absolute inset-0"
                    style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(99,102,241,0.08), transparent)' }} />

                <div className="max-w-7xl mx-auto relative">
                    <motion.div {...fadeUp()} className="text-center mb-20">
                        <span className="inline-block px-4 py-1 mb-4 rounded-full text-xs font-bold uppercase tracking-widest text-purple-400"
                            style={{ background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.25)' }}>
                            How It Works
                        </span>
                        <h2 className="text-5xl md:text-6xl font-black mb-4">
                            <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                                Three Steps, Infinite Fun
                            </span>
                        </h2>
                        <p className="text-xl text-slate-400">Get started in seconds, seriously.</p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-10">
                        {steps.map((s, i) => (
                            <motion.div
                                key={i}
                                {...fadeUp(i * 0.12)}
                                className="relative text-center group"
                            >
                                {/* connector */}
                                {i < steps.length - 1 && (
                                    <div className="hidden md:block absolute top-16 left-[60%] w-[80%] h-px"
                                        style={{ background: 'linear-gradient(to right, rgba(99,102,241,0.4), transparent)' }} />
                                )}

                                {/* number bubble */}
                                <motion.div
                                    whileHover={{ scale: 1.1, rotate: -5 }}
                                    className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-black text-indigo-300 mx-auto mb-4"
                                    style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)' }}
                                >
                                    {s.number}
                                </motion.div>

                                {/* icon card */}
                                <motion.div
                                    whileHover={{ y: -6, boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                                    className={`w-28 h-28 bg-gradient-to-br ${s.color} rounded-3xl flex items-center justify-center text-5xl mx-auto mb-6 shadow-xl group-hover:scale-105 transition-transform`}
                                >
                                    {s.emoji}
                                </motion.div>

                                <h3 className="text-2xl font-bold mb-3">{s.title}</h3>
                                <p className="text-slate-400 max-w-xs mx-auto leading-relaxed">{s.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════
                LIVE BOARD PREVIEW
            ══════════════════════════════════════════════ */}
            <BoardPreview />

            {/* ══════════════════════════════════════════════
                USE CASES
            ══════════════════════════════════════════════ */}
            <section className="py-28 px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <motion.div {...fadeUp()} className="text-center mb-20">
                        <span className="inline-block px-4 py-1 mb-4 rounded-full text-xs font-bold uppercase tracking-widest text-pink-400"
                            style={{ background: 'rgba(236,72,153,0.12)', border: '1px solid rgba(236,72,153,0.25)' }}>
                            Built For Everyone
                        </span>
                        <h2 className="text-5xl md:text-6xl font-black mb-4">
                            <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                                Your Role, Your Power
                            </span>
                        </h2>
                        <p className="text-xl text-slate-400">Tailored experiences for teachers and students.</p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {useCases.map((u, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: i === 0 ? -30 : 30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.55, delay: i * 0.1 }}
                                whileHover={{ y: -4 }}
                                className="relative p-10 rounded-3xl overflow-hidden"
                                style={{
                                    background: 'rgba(15,23,42,0.7)',
                                    border: `1px solid ${u.border}`,
                                    backdropFilter: 'blur(12px)',
                                }}
                            >
                                {/* top glow */}
                                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${u.gradient} rounded-t-3xl`} />

                                <div className="flex items-center gap-3 mb-8">
                                    <span className="text-4xl">{u.emoji}</span>
                                    <span className={`px-5 py-2 bg-gradient-to-r ${u.gradient} rounded-full text-white font-bold`}>
                                        {u.role}
                                    </span>
                                </div>

                                <ul className="space-y-3.5">
                                    {u.benefits.map((b, j) => (
                                        <motion.li
                                            key={j}
                                            initial={{ opacity: 0, x: -10 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: j * 0.05 }}
                                            className="flex items-start gap-3"
                                        >
                                            <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs"
                                                style={{ background: 'rgba(99,102,241,0.2)', color: '#818cf8' }}>✓</span>
                                            <span className="text-slate-300 text-sm leading-relaxed">{b}</span>
                                        </motion.li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════
                TEAM
            ══════════════════════════════════════════════ */}
            <section className="py-28 px-6 lg:px-8 relative">
                <div className="absolute inset-0"
                    style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 100%, rgba(139,92,246,0.08), transparent)' }} />

                <div className="max-w-7xl mx-auto relative">
                    <motion.div {...fadeUp()} className="text-center mb-20">
                        <span className="inline-block px-4 py-1 mb-4 rounded-full text-xs font-bold uppercase tracking-widest text-cyan-400"
                            style={{ background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.25)' }}>
                            The Team
                        </span>
                        <h2 className="text-5xl md:text-6xl font-black mb-4">
                            <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                                Built with ❤️
                            </span>
                        </h2>
                        <p className="text-xl text-slate-400">Meet the people behind EduBoard.</p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {teamMembers.map((m, i) => (
                            <motion.div
                                key={i}
                                {...fadeUp(i * 0.1)}
                                whileHover={{ y: -8, scale: 1.02 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                                className="relative p-8 rounded-3xl text-center overflow-hidden group"
                                style={{
                                    background: 'rgba(15,23,42,0.7)',
                                    border: '1px solid rgba(255,255,255,0.07)',
                                    backdropFilter: 'blur(12px)',
                                }}
                            >
                                {/* glow top */}
                                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${m.gradient}`} />

                                {/* avatar */}
                                <motion.div
                                    whileHover={{ scale: 1.08 }}
                                    className="relative mx-auto mb-5 w-24 h-24"
                                >
                                    <div className={`absolute -inset-1 bg-gradient-to-br ${m.gradient} rounded-full opacity-60 blur-sm group-hover:opacity-90 transition-opacity`} />
                                    <img
                                        src={m.image}
                                        alt={m.name}
                                        className="relative w-24 h-24 rounded-full object-cover border-2 border-white/10"
                                        onError={e => {
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'flex';
                                        }}
                                    />
                                    <div
                                        className={`relative hidden w-24 h-24 rounded-full bg-gradient-to-br ${m.gradient} items-center justify-center text-2xl font-black text-white`}
                                    >
                                        {m.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                                    </div>
                                </motion.div>

                                <h3 className="text-xl font-bold text-white mb-1">{m.name}</h3>
                                <p className={`text-sm font-medium mb-3 bg-gradient-to-r ${m.gradient} bg-clip-text text-transparent`}>
                                    {m.role}
                                </p>
                                <p className="text-slate-400 text-sm leading-relaxed mb-5">{m.bio}</p>

                                {/* skills */}
                                <div className="flex flex-wrap gap-2 justify-center">
                                    {m.skills.map((sk, j) => (
                                        <span key={j}
                                            className="px-3 py-1 rounded-full text-xs font-medium text-slate-300"
                                            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                            {sk}
                                        </span>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════
                FINAL CTA
            ══════════════════════════════════════════════ */}
            <section className="py-28 px-6 lg:px-8">
                <motion.div
                    {...fadeUp()}
                    className="max-w-4xl mx-auto text-center relative rounded-3xl overflow-hidden p-14"
                    style={{
                        background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15), rgba(236,72,153,0.1))',
                        border: '1px solid rgba(99,102,241,0.25)',
                        backdropFilter: 'blur(20px)',
                    }}
                >
                    {/* animated border gradient */}
                    <div className="absolute inset-0 rounded-3xl pointer-events-none overflow-hidden">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                            className="absolute -inset-4 opacity-20"
                            style={{
                                background: 'conic-gradient(from 0deg, #6366f1, #8b5cf6, #ec4899, #6366f1)',
                            }}
                        />
                    </div>

                    <div className="relative">
                        <div className="text-6xl mb-6">🎓</div>
                        <h2 className="text-4xl md:text-5xl font-black mb-5">
                            Ready to Transform Your Classroom?
                        </h2>
                        <p className="text-xl text-slate-300 mb-10 max-w-xl mx-auto leading-relaxed">
                            Join thousands of educators and students already using EduBoard for collaborative learning. It's free.
                        </p>
                        <motion.div
                            whileHover={{ scale: 1.06, boxShadow: '0 0 50px rgba(99,102,241,0.6)' }}
                            whileTap={{ scale: 0.96 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                            className="inline-block"
                        >
                            <Link
                                to="/signup"
                                className="relative inline-flex items-center gap-3 px-12 py-5 text-lg font-black text-white rounded-2xl overflow-hidden"
                                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899)' }}
                            >
                                Start Free Today 🚀
                                <motion.span
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -skew-x-12"
                                    animate={{ x: ['-100%', '200%'] }}
                                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 2.5 }}
                                />
                            </Link>
                        </motion.div>
                    </div>
                </motion.div>
            </section>

            <Footer />
        </div>
    );
};

/* ── Floating emoji particles ─────────────────────────────── */
function FloatingParticles() {
    const items = ['✏️','📐','🖊️','📝','💡','🔬','📊','🎯','⭐','🌟','📚','🎨'];
    const particles = Array.from({ length: 14 }, (_, i) => ({
        id: i,
        emoji: items[i % items.length],
        x: `${5 + (i / 14) * 90}%`,
        y: `${10 + Math.sin(i * 1.3) * 40 + 20}%`,
        delay: i * 0.4,
        dur: 6 + (i % 5) * 1.5,
        size: 16 + (i % 3) * 6,
    }));

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
            {particles.map(p => (
                <motion.span
                    key={p.id}
                    style={{ position: 'absolute', left: p.x, top: p.y, fontSize: p.size, opacity: 0.18 }}
                    animate={{ y: [0, -20, 0], rotate: [0, 15, -15, 0], opacity: [0.12, 0.25, 0.12] }}
                    transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
                >
                    {p.emoji}
                </motion.span>
            ))}
        </div>
    );
}

/* ── Live Board Preview section ───────────────────────────── */
function BoardPreview() {
    const [activeCursor, setActiveCursor] = useState(0);
    const cursors = [
        { name: 'Ms. Patel',   color: '#6366f1', x: '38%', y: '42%' },
        { name: 'Jordan K.',   color: '#ec4899', x: '62%', y: '30%' },
        { name: 'Alex M.',     color: '#10b981', x: '55%', y: '65%' },
    ];

    useEffect(() => {
        const id = setInterval(() => setActiveCursor(c => (c + 1) % cursors.length), 1800);
        return () => clearInterval(id);
    }, []);

    return (
        <section className="py-20 px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                <motion.div {...fadeUp()} className="text-center mb-14">
                    <h2 className="text-4xl md:text-5xl font-black mb-4">
                        <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                            See It In Action
                        </span>
                    </h2>
                    <p className="text-xl text-slate-400">Your classroom, live on screen.</p>
                </motion.div>

                <motion.div
                    {...fadeUp(0.1)}
                    whileHover={{ scale: 1.01 }}
                    className="relative rounded-2xl overflow-hidden"
                    style={{
                        border: '1px solid rgba(99,102,241,0.2)',
                        boxShadow: '0 30px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.1)',
                    }}
                >
                    {/* toolbar */}
                    <div className="flex items-center gap-3 px-5 py-3 border-b border-white/5"
                        style={{ background: 'rgba(9,11,30,0.98)' }}>
                        <div className="flex gap-1.5">
                            {['#ef4444','#eab308','#22c55e'].map(c => (
                                <div key={c} className="w-3 h-3 rounded-full" style={{ backgroundColor: c, opacity: 0.7 }} />
                            ))}
                        </div>
                        <div className="flex-1 flex justify-center">
                            <span className="text-xs text-indigo-300 font-mono px-4 py-1 rounded-full"
                                style={{ background: 'rgba(99,102,241,0.12)' }}>
                                📋 Room: EDU-4829
                            </span>
                        </div>
                        {/* live users */}
                        <div className="flex -space-x-2">
                            {cursors.map((c, i) => (
                                <div key={i} className="w-6 h-6 rounded-full border-2 border-slate-900 flex items-center justify-center text-xs font-bold text-white"
                                    style={{ backgroundColor: c.color }}>
                                    {c.name[0]}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* canvas */}
                    <div className="relative" style={{ height: 320, background: '#f8fafc' }}>
                        <svg viewBox="0 0 800 320" className="absolute inset-0 w-full h-full">
                            {/* grid */}
                            <defs>
                                <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
                                    <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
                                </pattern>
                            </defs>
                            <rect width="800" height="320" fill="url(#grid)" />

                            {/* drawings */}
                            <motion.path
                                d="M 80 180 Q 160 100 240 150 Q 320 200 400 130 Q 480 60 550 100"
                                fill="none" stroke="#6366f1" strokeWidth="3" strokeLinecap="round"
                                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                                transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 4 }}
                            />
                            <motion.rect
                                x="580" y="80" width="140" height="90" rx="8"
                                fill="none" stroke="#8b5cf6" strokeWidth="2"
                                initial={{ scale: 0, originX: '650px', originY: '125px' }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.8, duration: 0.4 }}
                            />
                            <motion.circle
                                cx="200" cy="240" r="50"
                                fill="none" stroke="#ec4899" strokeWidth="2"
                                initial={{ scale: 0 }} animate={{ scale: 1 }}
                                transition={{ delay: 1.2, duration: 0.4 }}
                            />
                            {/* sticky note */}
                            <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}>
                                <rect x="360" y="180" width="120" height="90" rx="4" fill="#fef08a" />
                                <text x="420" y="215" textAnchor="middle" fontSize="11" fill="#713f12" fontFamily="sans-serif" fontWeight="600">Key Concept</text>
                                <text x="420" y="232" textAnchor="middle" fontSize="10" fill="#92400e" fontFamily="sans-serif">Socket.IO sync</text>
                                <text x="420" y="248" textAnchor="middle" fontSize="10" fill="#92400e" fontFamily="sans-serif">across all clients</text>
                            </motion.g>
                            <text x="580" y="150" textAnchor="middle" fontSize="12" fill="#6366f1" fontFamily="sans-serif" fontWeight="600">EduBoard</text>

                            {/* animated cursors */}
                            {cursors.map((c, i) => (
                                <motion.g
                                    key={i}
                                    animate={{
                                        x: activeCursor === i ? [0, 15, -10, 0] : 0,
                                        y: activeCursor === i ? [0, -10, 5, 0] : 0,
                                    }}
                                    transition={{ duration: 0.8, ease: 'easeInOut' }}
                                >
                                    <motion.g
                                        style={{ translateX: c.x, translateY: c.y }}
                                        animate={{ opacity: [0.7, 1, 0.7] }}
                                        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.5 }}
                                    >
                                        <polygon
                                            points="0,0 0,14 4,10 7,18 9,17 6,9 12,9"
                                            fill={c.color} stroke="white" strokeWidth="0.8"
                                            transform={`translate(${parseFloat(c.x) * 8 - 20}, ${parseFloat(c.y) * 3.2 - 10})`}
                                        />
                                        <rect
                                            x={parseFloat(c.x) * 8 - 10} y={parseFloat(c.y) * 3.2 + 10}
                                            width={c.name.length * 6.5 + 8} height="18" rx="9"
                                            fill={c.color}
                                        />
                                        <text
                                            x={parseFloat(c.x) * 8 - 6} y={parseFloat(c.y) * 3.2 + 22}
                                            fontSize="9" fill="white" fontFamily="sans-serif" fontWeight="600"
                                        >{c.name}</text>
                                    </motion.g>
                                </motion.g>
                            ))}
                        </svg>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

export default LandingPage;