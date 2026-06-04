import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import Footer from '../components/Footer';

const ContactPage = () => {
    const { theme } = useTheme();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState({ success: null, message: '' });

    // FIX 1: formData ki jagah e.target kar diya
    const handleChange = (e) => {
        const { name, value } = e.target; 
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus({ success: null, message: '' });

        try {
            // Backend endpoint par data bhej rahe hain (Vite proxy config ke mutabik url handle ho jayega)
            const response = await axios.post('/api/contact', {
                name: formData.name,
                email: formData.email,
                message: formData.message
            });

            if (response.status === 200 || response.status === 201) {
                setSubmitStatus({
                    success: true,
                    message: 'Thank you! Your message has been sent successfully.'
                });
                setFormData({ name: '', email: '', message: '' });
            }
        } catch (error) {
            console.error('Error sending message:', error);
            setSubmitStatus({
                success: false,
                message: error.response?.data?.message || 'Something went wrong. Please try again later.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-950 text-white' : 'bg-white text-gray-900'}`}>
            
            {/* Hero Heading Section - Exactly Matched with About Page Layout */}
            <section className="relative pt-32 pb-12 px-6 overflow-hidden text-center">
                <div className="relative max-w-6xl mx-auto">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-6xl md:text-7xl font-extrabold mb-6"
                    >
                        <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                            Contact Our Team
                        </span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className={`text-2xl max-w-3xl mx-auto ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}
                    >
                        Have questions or feedback? Drop us a message below.
                    </motion.p>
                </div>
            </section>

            {/* Contact Form Section */}
            <section className="pb-24 px-6 relative z-10">
                {/* FIX 2: max-w-2xl ko badal kar max-w-lg kar diya */}
                <div className="max-w-lg mx-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`p-8 md:p-10 rounded-3xl shadow-xl ${
                            theme === 'dark' ? 'bg-gray-900 border border-gray-800' : 'bg-gray-50 border border-gray-200'
                        }`}
                    >
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold mb-2">Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Your Name"
                                    className={`w-full px-4 py-3 rounded-xl outline-none border transition-all ${
                                        theme === 'dark' 
                                            ? 'bg-slate-950 border-slate-800 text-white focus:border-purple-500' 
                                            : 'bg-white border-gray-300 text-gray-900 focus:border-indigo-600'
                                    }`}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2">Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="you@example.com"
                                    className={`w-full px-4 py-3 rounded-xl outline-none border transition-all ${
                                        theme === 'dark' 
                                            ? 'bg-slate-950 border-slate-800 text-white focus:border-purple-500' 
                                            : 'bg-white border-gray-300 text-gray-900 focus:border-indigo-600'
                                    }`}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2">Message</label>
                                <textarea
                                    name="message"
                                    required
                                    rows="5"
                                    value={formData.message}
                                    onChange={handleChange}
                                    placeholder="Type your feedback, question, or message details here..."
                                    className={`w-full px-4 py-3 rounded-xl outline-none border transition-all resize-none ${
                                        theme === 'dark' 
                                            ? 'bg-slate-950 border-slate-800 text-white focus:border-purple-500' 
                                            : 'bg-white border-gray-300 text-gray-900 focus:border-indigo-600'
                                    }`}
                                />
                            </div>

                            {/* Submit Button with matching color palette */}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-4 rounded-xl text-lg font-semibold text-white bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 hover:opacity-95 transition-all shadow-lg active:scale-[0.99] disabled:opacity-50"
                            >
                                {isSubmitting ? 'Sending Message...' : 'Send Message'}
                            </button>

                            {/* Status Notifications */}
                            {submitStatus.message && (
                                <div className={`p-4 rounded-xl text-center font-medium text-sm border ${
                                    submitStatus.success 
                                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                                        : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                                }`}>
                                    {submitStatus.message}
                                </div>
                            )}
                        </form>
                    </motion.div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default ContactPage;