import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const AboutPage = () => {
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
                        About EduBoard
                    </h1>
                    <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                        Empowering educators and students with innovative collaborative tools for the modern classroom.
                    </p>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-20 px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="scroll-animate opacity-0 surface-card p-12 rounded-3xl">
                        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">Our Mission</h2>
                        <p className="text-lg text-slate-300 leading-relaxed mb-6">
                            EduBoard was created with a simple yet powerful vision: to transform the way teachers and students
                            collaborate in the digital age. We believe that learning should be interactive, engaging, and accessible
                            to everyone, regardless of their location.
                        </p>
                        <p className="text-lg text-slate-300 leading-relaxed">
                            Our platform combines the freedom of an infinite canvas with the power of real-time collaboration,
                            giving educators the tools they need to create dynamic, visual lessons and students the space to
                            express their ideas creatively.
                        </p>
                    </div>
                </div>
            </section>

            {/* Why EduBoard */}
            <section className="py-20 px-6 lg:px-8 bg-slate-900/50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16 scroll-animate opacity-0">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">Why EduBoard?</h2>
                        <p className="text-xl text-slate-400">What makes us different</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="scroll-animate opacity-0 surface-card p-8 rounded-2xl">
                            <div className="text-4xl mb-4">🎓</div>
                            <h3 className="text-2xl font-semibold mb-4">Built for Education</h3>
                            <p className="text-slate-300">
                                Unlike generic whiteboard tools, EduBoard is specifically designed for educational environments
                                with role-based access, classroom management features, and intuitive controls that both teachers
                                and students can master quickly.
                            </p>
                        </div>

                        <div className="scroll-animate opacity-0 surface-card p-8 rounded-2xl">
                            <div className="text-4xl mb-4">⚡</div>
                            <h3 className="text-2xl font-semibold mb-4">Real-time Performance</h3>
                            <p className="text-slate-300">
                                Our optimized architecture ensures smooth, lag-free collaboration even with multiple users
                                drawing simultaneously. Experience true real-time synchronization without compromises.
                            </p>
                        </div>

                        <div className="scroll-animate opacity-0 surface-card p-8 rounded-2xl">
                            <div className="text-4xl mb-4">🎨</div>
                            <h3 className="text-2xl font-semibold mb-4">Creative Freedom</h3>
                            <p className="text-slate-300">
                                An infinite canvas means you never run out of space. Whether it's a simple diagram or a
                                complex mind map, EduBoard gives you the room to think big and create without boundaries.
                            </p>
                        </div>

                        <div className="scroll-animate opacity-0 surface-card p-8 rounded-2xl">
                            <div className="text-4xl mb-4">🔒</div>
                            <h3 className="text-2xl font-semibold mb-4">Secure & Private</h3>
                            <p className="text-slate-300">
                                Your data is important to us. With secure authentication, role-based permissions, and
                                private boards, you can trust that your classroom content stays safe and accessible only
                                to authorized users.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Technology Stack */}
            <section className="py-20 px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16 scroll-animate opacity-0">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">Built with Modern Technology</h2>
                        <p className="text-xl text-slate-400">Powered by industry-leading tools and frameworks</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { name: 'React', description: 'Frontend framework', icon: '⚛️' },
                            { name: 'Node.js', description: 'Backend runtime', icon: '🟢' },
                            { name: 'MongoDB', description: 'Database', icon: '🍃' },
                            { name: 'Socket.io', description: 'Real-time engine', icon: '🔌' },
                            { name: 'Vite', description: 'Build tool', icon: '⚡' },
                            { name: 'Tailwind CSS', description: 'Styling', icon: '🎨' },
                            { name: 'Express', description: 'Web framework', icon: '🚂' },
                            { name: 'JWT', description: 'Authentication', icon: '🔐' },
                        ].map((tech, index) => (
                            <div
                                key={index}
                                className="scroll-animate opacity-0 surface-card p-6 rounded-xl text-center hover:scale-105 transition-transform"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <div className="text-4xl mb-3">{tech.icon}</div>
                                <h3 className="text-lg font-semibold mb-1">{tech.name}</h3>
                                <p className="text-sm text-slate-400">{tech.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-20 px-6 lg:px-8 bg-slate-900/50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16 scroll-animate opacity-0">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">Our Values</h2>
                        <p className="text-xl text-slate-400">What drives us every day</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="scroll-animate opacity-0 text-center">
                            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-3xl">
                                💡
                            </div>
                            <h3 className="text-2xl font-semibold mb-4">Innovation</h3>
                            <p className="text-slate-300">
                                We constantly push boundaries to create better tools for modern education.
                            </p>
                        </div>

                        <div className="scroll-animate opacity-0 text-center">
                            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center text-3xl">
                                🤝
                            </div>
                            <h3 className="text-2xl font-semibold mb-4">Collaboration</h3>
                            <p className="text-slate-300">
                                Learning is better together. We build tools that bring people closer.
                            </p>
                        </div>

                        <div className="scroll-animate opacity-0 text-center">
                            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-pink-500 to-red-600 rounded-2xl flex items-center justify-center text-3xl">
                                ♿
                            </div>
                            <h3 className="text-2xl font-semibold mb-4">Accessibility</h3>
                            <p className="text-slate-300">
                                Education should be accessible to everyone, everywhere, on any device.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-6 lg:px-8">
                <div className="max-w-4xl mx-auto text-center scroll-animate opacity-0">
                    <div className="surface-card p-12 rounded-3xl">
                        <h2 className="text-4xl md:text-5xl font-bold mb-6">Join the EduBoard Community</h2>
                        <p className="text-xl text-slate-300 mb-8">
                            Be part of the future of collaborative learning. Start creating amazing lessons today.
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
                                className="px-10 py-5 text-lg font-semibold text-white bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all border border-white/20"
                            >
                                Explore Features
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default AboutPage;
