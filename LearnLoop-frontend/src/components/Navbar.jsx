'use client';

import { useState, useEffect } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function Navbar() {
    const [showProfile, setShowProfile] = useState(false);
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const { user, loading, login, logout } = useAuth();
    
    const pathname = usePathname();
    
    // Hide navbar on dashboard pages
    const isDashboard = pathname?.startsWith('/dashboard');
    
    // Define Google login hook at the top level, before any conditionals
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
    
    // Hide navbar by removing it from DOM 
    useEffect(() => {
        const navbarContainer = document.getElementById('navbar-container');
        if (navbarContainer) {
            if (isDashboard) {
                navbarContainer.style.display = 'none';
                document.body.classList.add('on-dashboard');
            } else {
                navbarContainer.style.display = 'block';
                document.body.classList.remove('on-dashboard');
            }
        }
        
        // Adjust main padding
        const mainElement = document.querySelector('main');
        if (mainElement) {
            if (isDashboard) {
                mainElement.style.paddingTop = '0';
            } else {
                mainElement.style.paddingTop = '4rem'; // 16 in tailwind = 4rem
            }
        }
    }, [pathname, isDashboard]);
    
    // Don't render content if on dashboard
    // if (isDashboard) return null;

    const handleSignOut = () => {
        logout();
        setShowProfile(false);
    };
    
    // Helper function to check if a path is active
    const isActivePath = (path) => {
        if (path === '/badges' && pathname?.startsWith('/badges')) {
            return true;
        }
        return pathname === path;
    };

    return (
        <nav className={`fixed top-0 left-0 right-0 bg-gray-900/95 border-gray-800/80 backdrop-blur-sm border-b shadow-sm z-50 transition-colors duration-200`}>
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center space-x-8">
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500 dark:from-blue-400 dark:via-blue-300 dark:to-indigo-400 bg-clip-text text-transparent font-display">
                            <Link href="/">LearnLoop</Link>
                        </h1>
                        
                        {/* Navigation Links - Only show when logged in */}
                        {user && (
                            <div className="hidden md:flex space-x-4">
                                <Link 
                                    href="/dashboard" 
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                                        isActivePath('/dashboard')
                                            ? 'bg-blue-50/80 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 shadow-sm'
                                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/60'
                                    }`}
                                >
                                    Dashboard
                                </Link>
                                <Link 
                                    href="/badges" 
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                                        isActivePath('/badges')
                                            ? 'bg-blue-50/80 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 shadow-sm'
                                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/60'
                                    }`}
                                >
                                    Badges
                                </Link>
                                <Link 
                                    href="/tags-search" 
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                                        isActivePath('/tags-search')
                                            ? 'bg-blue-50/80 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 shadow-sm'
                                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/60'
                                    }`}
                                >
                                    Search by Tags
                                </Link>
                                <Link 
                                    href="/notes-search" 
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                                        isActivePath('/notes-search')
                                            ? 'bg-blue-50/80 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 shadow-sm'
                                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/60'
                                    }`}
                                >
                                    Search Notes
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Right side buttons */}
                    <div className="flex items-center space-x-4">
                        {/* Authentication buttons */}
                        {loading ? (
                            <div className="animate-spin h-5 w-5 text-blue-500" />
                        ) : !user ? (
                            <button
                                onClick={handleGoogleLogin}
                                disabled={isLoggingIn}
                                className="flex items-center px-4 py-2 rounded-lg shadow-sm hover:shadow transition-all duration-200 bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-500 text-white"
                            >
                                {isLoggingIn ? "Signing in..." : "Sign in with Google"}
                            </button>
                        ) : (
                            <div className="relative">
                                <button
                                    onClick={() => setShowProfile(!showProfile)}
                                    className="flex items-center"
                                >
                                    <img
                                        src={user.avatar}
                                        alt="Profile"
                                        className="w-8 h-8 rounded-full ring-2 ring-gray-800 hover:ring-blue-400 transition-all duration-200"
                                    />
                                </button>

                                {showProfile && (
                                    <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg py-2 border backdrop-blur-sm bg-gray-800/90 border-gray-700/80">
                                        <div className="px-4 py-2">
                                            <p className="text-sm font-medium text-white">
                                                {user.name}
                                            </p>
                                            <p className="text-sm text-gray-400 truncate">
                                                {user.email}
                                            </p>
                                        </div>
                                        <div className="border-t border-gray-200 dark:border-gray-700/80">
                                            {/* Mobile nav links */}
                                            <div className="md:hidden">
                                                <Link 
                                                    href="/dashboard" 
                                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                                    onClick={() => setShowProfile(false)}
                                                >
                                                    Dashboard
                                                </Link>
                                                <Link 
                                                    href="/badges" 
                                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                                    onClick={() => setShowProfile(false)}
                                                >
                                                    Badges
                                                </Link>
                                                <Link 
                                                    href="/tags-search" 
                                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                                    onClick={() => setShowProfile(false)}
                                                >
                                                    Search by Tags
                                                </Link>
                                                <Link 
                                                    href="/notes-search" 
                                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                                    onClick={() => setShowProfile(false)}
                                                >
                                                    Search Notes
                                                </Link>
                                                <div className="border-t border-gray-200 dark:border-gray-700/80 my-1"></div>
                                            </div>
                                            <button
                                                onClick={handleSignOut}
                                                className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                            >
                                                Sign out
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
} 