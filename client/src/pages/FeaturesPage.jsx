import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const FeaturesPage = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
        document.documentElement.style.scrollBehavior = 'smooth';

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

    const featureCategories = [
        {
            title: 'Collaboration Tools',
            description: 'Work together seamlessly with powerful real-time features',
            features: [
                {
                    name: 'Real-time Synchronization',
                    description: 'See changes instantly as multiple users draw, write, and create together. No lag, no delays.',
                    icon: '⚡',
                },
                {
                    name: 'Multi-user Support',
                    description: 'Unlimited participants can join the same board and collaborate simultaneously.',
                    icon: '👥',
                },
                {
                    name: 'Live Cursors',
                    description: 'See where other users are working with live cursor tracking and user presence indicators.',
                    icon: '🎯',
                },
            ],
        },
        {
            title: 'Drawing & Design',
            description: 'Professional-grade tools for creative expression',
            features: [
                {
                    name: 'Freehand Drawing',
                    description: 'Smooth, responsive pen tool with pressure sensitivity and multiple brush sizes.',
                    icon: '✏️',
                },
                {
                    name: 'Shape Tools',
                    description: 'Create perfect circles, rectangles, triangles, pentagons, and more geometric shapes.',
                    icon: '⬡',
                },
                {
                    name: 'Text & Annotations',
                    description: 'Add text boxes with custom fonts, sizes, and colors. Perfect for labels and notes.',
                    icon: '📝',
                },
                {
                    name: 'Sticky Notes',
                    description: 'Colorful sticky notes for brainstorming, organizing ideas, and quick annotations.',
                    icon: '📌',
                },
            ],
        },
        {
            title: 'Organization',
            description: 'Keep your work organized and accessible',
            features: [
                {
                    name: 'Infinite Canvas',
                    description: 'Never run out of space. Pan and zoom across an unlimited workspace.',
                    icon: '∞',
                },
                {
                    name: 'Board Management',
                    description: 'Create, organize, and manage multiple boards for different classes or projects.',
                    icon: '📋',
                },
                {
                    name: 'Room Codes',
                    description: 'Simple room codes make it easy for students to join the right board instantly.',
                    icon: '🔑',
                },
            ],
        },
        {
            title: 'Access Control',
            description: 'Secure and flexible permission management',
            features: [
                {
                    name: 'Role-Based Permissions',
                    description: 'Teachers have full control while students can be given appropriate access levels.',
                    icon: '🔒',
                },
                {
                    name: 'Teacher Controls',
                    description: 'Create boards, manage participants, and control what students can do.',
                    icon: '👨‍🏫',
                },
                {
                    name: 'Student Access',
                    description: 'Students can join boards, collaborate, and contribute within defined boundaries.',
                    icon: '👨‍🎓',
                },
            ],
        },
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            <Navbar />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-6 lg:px-8 overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
                </div>

                <div className="relative max-w-4xl mx-auto text-center">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-indigo-200 to-purple-200 bg-clip-text text-transparent">
                        Features That Empower
                    </h1>
                    <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                        Discover all the powerful tools and capabilities that make EduBoard the perfect platform for collaborative learning.
                    </p>
                </div>
            </section>

            {/* Feature Categories */}
            <section className="py-12 px-6 lg:px-8">
                <div className="max-w-7xl mx-auto space-y-24">
                    {featureCategories.map((category, categoryIndex) => (
                        <div key={categoryIndex} className="scroll-animate opacity-0">
                            <div className="text-center mb-12">
                                <h2 className="text-3xl md:text-4xl font-bold mb-4">{category.title}</h2>
                                <p className="text-lg text-slate-400">{category.description}</p>
                            </div>

                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {category.features.map((feature, featureIndex) => (
                                    <div
                                        key={featureIndex}
                                        className="surface-card p-8 rounded-2xl hover:scale-105 transition-all duration-300"
                                    >
                                        <div className="text-5xl mb-4">{feature.icon}</div>
                                        <h3 className="text-xl font-semibold mb-3">{feature.name}</h3>
                                        <p className="text-slate-400">{feature.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Technology Stack */}
            <section className="py-24 px-6 lg:px-8 bg-slate-900/50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16 scroll-animate opacity-0">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">Built with Modern Technology</h2>
                        <p className="text-xl text-slate-400">Powered by cutting-edge tools and frameworks</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="scroll-animate opacity-0 surface-card p-8 rounded-2xl text-center">
                            <div className="text-5xl mb-4">⚛️</div>
                            <h3 className="text-xl font-semibold mb-3">React</h3>
                            <p className="text-slate-400">Modern, component-based UI framework for smooth interactions</p>
                        </div>
                        <div className="scroll-animate opacity-0 surface-card p-8 rounded-2xl text-center">
                            <div className="text-5xl mb-4">🟢</div>
                            <h3 className="text-xl font-semibold mb-3">Node.js</h3>
                            <p className="text-slate-400">Fast, scalable backend for real-time communication</p>
                        </div>
                        <div className="scroll-animate opacity-0 surface-card p-8 rounded-2xl text-center">
                            <div className="text-5xl mb-4">🍃</div>
                            <h3 className="text-xl font-semibold mb-3">MongoDB</h3>
                            <p className="text-slate-400">Flexible database for storing boards and user data</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-6 lg:px-8">
                <div className="max-w-4xl mx-auto text-center scroll-animate opacity-0">
                    <div className="surface-card p-12 rounded-3xl">
                        <h2 className="text-4xl md:text-5xl font-bold mb-6">Experience All Features Today</h2>
                        <p className="text-xl text-slate-300 mb-8">
                            Start using EduBoard for free and unlock the full potential of collaborative learning.
                        </p>
                        <Link
                            to="/signup"
                            className="inline-block px-10 py-5 text-lg font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:from-indigo-500 hover:to-purple-500 transition-all shadow-2xl shadow-indigo-500/50 hover:shadow-indigo-500/70 hover:scale-105"
                        >
                            Get Started Free
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default FeaturesPage;
