'use client';

import Image from 'next/image';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

export default function LandingPage() {
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const { user, loading, login, logout } = useAuth();

    const handleGoogleLogin = useGoogleLogin({
        onSuccess: async (response) => {
            try {
                setIsLoggingIn(true);
                await login(response.access_token);
            } catch (error) {
                console.error('Login failed:', error);
                alert('Failed to sign in with Google.');
            } finally {
                setIsLoggingIn(false);
            }
        },
        onError: (error) => {
            console.error('Google Login Failed:', error);
            alert('Google login failed.');
        },
        scope: 'email profile',
    });
    

    return (
        <div className={`min-h-screen font-sans dark bg-gray-900`}>
            {/* Hero Section */}
            <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center relative z-10">
                        <h1 className="text-4xl sm:text-6xl font-bold mb-6 font-display tracking-tight">
                            <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500 dark:from-blue-400 dark:via-blue-300 dark:to-indigo-400 bg-clip-text text-transparent">
                                LearnLoop
                            </span>
                        </h1>
                        <p className="text-xl sm:text-2xl text-gray-700 dark:text-gray-300 mb-4 font-medium tracking-tight">
                            Track your learning. One playlist at a time.
                        </p>
                        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
                            LearnLoop helps you stay focused, take notes, and track your progress through YouTube playlists.
                        </p>
                        <button
                        onClick={handleGoogleLogin}
                        disabled={isLoggingIn}
                        className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-700 hover:to-indigo-600 dark:from-blue-500 dark:to-indigo-400 dark:hover:from-blue-600 dark:hover:to-indigo-500 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105 font-medium">
                          {isLoggingIn ? "Signing in..." : "Sign in with Google"}
                        </button>
                    </div>
                    {/* Background decoration */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-20 dark:opacity-20 pointer-events-none">
                        <div className="absolute inset-0 rotate-45 bg-gradient-to-r from-blue-100 via-indigo-100 to-blue-50 dark:from-blue-900 dark:via-indigo-900 dark:to-blue-800 rounded-full blur-3xl"></div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50/80 dark:bg-gray-800/50 backdrop-blur-sm relative overflow-hidden">
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            {
                                icon: "🎯",
                                title: "Set Daily Learning Goals",
                                description: "Define your learning objectives and track your daily progress"
                            },
                            {
                                icon: "📊",
                                title: "Visualize Your Progress",
                                description: "See your learning journey with beautiful progress charts"
                            },
                            {
                                icon: "📝",
                                title: "Take Notes for Each Video",
                                description: "Keep your thoughts organized with video-specific notes"
                            },
                            {
                                icon: "🏆",
                                title: "Earn Badges as You Learn",
                                description: "Get rewarded for your consistent learning efforts"
                            }
                        ].map((feature, index) => (
                            <div key={index} className="p-6 rounded-xl bg-white dark:bg-gray-800/50 backdrop-blur-sm shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700/20">
                                <div className="text-4xl mb-4 transform transition-transform duration-200 hover:scale-110">{feature.icon}</div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 font-display">{feature.title}</h3>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
                {/* Background decoration */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-100/50 to-white/50 dark:via-gray-800/30 dark:to-gray-900/50 pointer-events-none"></div>
            </section>

            {/* How It Works Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900 relative overflow-hidden">
                <div className="max-w-7xl mx-auto relative z-10">
                    <h2 className="text-3xl font-bold text-center mb-12 font-display tracking-tight">
                        <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500 dark:from-blue-400 dark:via-blue-300 dark:to-indigo-400 bg-clip-text text-transparent">
                            How It Works
                        </span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                step: "1",
                                title: "Add your YouTube Playlist",
                                description: "Connect your favorite learning playlists to get started"
                            },
                            {
                                step: "2",
                                title: "Watch & Track your progress",
                                description: "Mark videos as complete and track your learning journey"
                            },
                            {
                                step: "3",
                                title: "Take notes & earn badges",
                                description: "Document your learning and earn rewards for consistency"
                            }
                        ].map((step, index) => (
                            <div key={index} className="relative p-6 rounded-xl bg-gray-50 dark:bg-gray-800/80 backdrop-blur-sm shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700/20">
                                <div className="absolute -top-4 -left-4 w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-blue-500 dark:to-indigo-400 text-white rounded-full flex items-center justify-center font-bold shadow-lg">
                                    {step.step}
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 mt-4 font-display">{step.title}</h3>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{step.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
                {/* Background decoration */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-50/30 to-transparent dark:via-blue-900/10 pointer-events-none"></div>
            </section>

            {/* Testimonial Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 relative overflow-hidden">
                <div className="max-w-3xl mx-auto text-center relative z-10">
                    <blockquote className="text-2xl font-medium text-gray-800 dark:text-white italic font-serif">
                        "I never lose track of my learning anymore — LearnLoop made it easy!"
                    </blockquote>
                </div>
                {/* Background decoration */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-50/20 to-white/50 dark:via-blue-900/10 dark:to-gray-900/50 pointer-events-none"></div>
            </section>

            {/* Footer */}
            <footer className="py-8 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800/20 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="text-gray-500 dark:text-gray-400 mb-4 md:mb-0">
                            © {new Date().getFullYear()} LearnLoop. All rights reserved.
                        </div>
                        <div className="flex space-x-6">
                            <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">About</a>
                            <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Contact</a>
                            <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Privacy</a>
                            <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">GitHub</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}