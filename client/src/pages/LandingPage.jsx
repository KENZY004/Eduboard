import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const LandingPage = () => {
    const heroRef = useRef(null);

    useEffect(() => {
        // Smooth scroll behavior
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
            ],
            gradient: 'from-indigo-600 to-purple-600',
        },
        {
            role: 'For Students',
            benefits: [
                'Join classes with simple room codes',
                'Collaborate on group projects',
                'Take visual notes and brainstorm ideas',
                'Access boards from any device',
            ],
            gradient: 'from-purple-600 to-pink-600',
        },
    ];

    const teamMembers = [
        {

            name: 'Vanshika Babral',
            role: 'Developer',
            bio: 'Dedicated to building seamless user experiences.',
            image: '/team/vanshika.png',
        },
        {
            name: 'Minha Kenzy OM',
            role: 'Full Stack Developer',
            bio: 'Passionate about creating innovative educational tools.',
            image: '/team/kenzy.jpeg',
        },
        {
            name: 'Mansi Singh',
            role: 'Developer',
            bio: 'Focused on real-time collaboration technology.',
            image: '/team/mansi.jpeg',
        },
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            <Navbar />

            {/* Hero Section */}
            <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-6 lg:px-8 text-center">
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-indigo-200 to-purple-200 bg-clip-text text-transparent leading-tight">
                        Collaborate. Create. Learn.
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto">
                        EduBoard is the ultimate collaborative whiteboard platform for modern education.
                        Bring your classroom to life with real-time interaction and infinite possibilities.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
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
                    </div>

                    {/* Floating Stats */}
                    <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
                        <div className="scroll-animate opacity-0">
                            <div className="text-4xl font-bold text-indigo-400">∞</div>
                            <div className="text-sm text-slate-400 mt-2">Infinite Canvas</div>
                        </div>
                        <div className="scroll-animate opacity-0">
                            <div className="text-4xl font-bold text-purple-400">⚡</div>
                            <div className="text-sm text-slate-400 mt-2">Real-time Sync</div>
                        </div>
                        <div className="scroll-animate opacity-0">
                            <div className="text-4xl font-bold text-pink-400">🎨</div>
                            <div className="text-sm text-slate-400 mt-2">Creative Tools</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-24 px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16 scroll-animate opacity-0">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">Powerful Features</h2>
                        <p className="text-xl text-slate-400">Everything you need for collaborative learning</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="scroll-animate opacity-0 surface-card p-8 rounded-2xl group hover:scale-105 transition-all duration-300"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                                <p className="text-slate-400">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-24 px-6 lg:px-8 bg-slate-900/50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16 scroll-animate opacity-0">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h2>
                        <p className="text-xl text-slate-400">Get started in three simple steps</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-12">
                        {steps.map((step, index) => (
                            <div key={index} className="scroll-animate opacity-0 text-center" style={{ animationDelay: `${index * 150}ms` }}>
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
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Use Cases */}
            <section className="py-24 px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16 scroll-animate opacity-0">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">Built for Everyone</h2>
                        <p className="text-xl text-slate-400">Tailored experiences for teachers and students</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {useCases.map((useCase, index) => (
                            <div
                                key={index}
                                className="scroll-animate opacity-0 surface-card p-10 rounded-2xl"
                                style={{ animationDelay: `${index * 100}ms` }}
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
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Meet the Team */}
            <section className="py-24 px-6 lg:px-8 bg-slate-900/50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16 scroll-animate opacity-0">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">Meet the Team</h2>
                        <p className="text-xl text-slate-400">The creators behind EduBoard</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {teamMembers.map((member, index) => (
                            <div
                                key={index}
                                className="scroll-animate opacity-0 surface-card p-8 rounded-2xl text-center group hover:scale-105 transition-all duration-300"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                {/* Team member photo */}
                                {member.image ? (
                                    <img
                                        src={member.image}
                                        alt={member.name}
                                        className="w-32 h-32 mx-auto mb-6 rounded-full object-cover border-4 border-indigo-500/30 group-hover:scale-110 group-hover:border-indigo-500/50 transition-all duration-300"
                                    />
                                ) : (
                                    <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-4xl font-bold text-white group-hover:scale-110 transition-transform">
                                        {member.name.charAt(0)}
                                    </div>
                                )}
                                <h3 className="text-xl font-semibold mb-2">{member.name}</h3>
                                <p className="text-indigo-400 font-medium mb-3">{member.role}</p>
                                <p className="text-slate-400 text-sm">{member.bio}</p>
                            </div>
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
