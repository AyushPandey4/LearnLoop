'use client';

import { useState, useEffect } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const [showProfile, setShowProfile] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { user, loading, login, logout } = useAuth();
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard');

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

    const mainElement = document.querySelector('main');
    if (mainElement) {
      if (isDashboard) {
        mainElement.style.paddingTop = '0';
      } else {
        mainElement.style.paddingTop = '4rem';
      }
    }
  }, [pathname, isDashboard]);

  const handleSignOut = () => {
    logout();
    setShowProfile(false);
  };

  const isActivePath = (path) => {
    if (path === '/badges' && pathname?.startsWith('/badges')) {
      return true;
    }
    return pathname === path;
  };

  return (
    <motion.nav
      id="navbar-container"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-lg border-b border-purple-200/50 shadow-lg z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-8">
            <h1 className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              <Link href="/">LearnLoop</Link>
            </h1>

            {/* Navigation Links - Only show when logged in */}
            {user && (
              <div className="hidden md:flex space-x-4">
                {[
                  { path: '/dashboard', label: 'Dashboard' },
                  { path: '/badges', label: 'Badges' },
                  { path: '/tags-search', label: 'Search by Tags' },
                  { path: '/notes-search', label: 'Search Notes' },
                ].map((item) => (
                  <motion.div
                    key={item.path}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      href={item.path}
                      className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 border border-purple-200/50 ${
                        isActivePath(item.path)
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                          : 'bg-white/10 text-purple-600 hover:bg-gradient-to-r hover:from-blue-500/30 hover:to-purple-500/30 hover:text-white hover:shadow-sm'
                      }`}
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Right side buttons */}
          <div className="flex items-center space-x-4">
            {loading ? (
              <div className="animate-spin h-5 w-5 text-purple-500" />
            ) : !user ? (
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(139, 92, 246, 0.5)' }}
                whileTap={{ scale: 0.95 }}
                onClick={handleGoogleLogin}
                disabled={isLoggingIn}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold text-sm shadow-lg hover:shadow-[0_0_20px_rgba(139,92,246,0.6)] transition-all duration-300 border border-purple-200/50"
              >
                {isLoggingIn ? 'Signing in...' : 'Sign in with Google'}
              </motion.button>
            ) : (
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  onClick={() => setShowProfile(!showProfile)}
                  className="flex items-center"
                >
                  <img
                    src={user.avatar}
                    alt="Profile"
                    className="w-7 h-7 rounded-full ring-1 ring-purple-200/50 hover:ring-purple-400 transition-all duration-300"
                  />
                </motion.button>

                <AnimatePresence>
                  {showProfile && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="absolute right-0 mt-3 w-64 rounded-xl bg-white/20 backdrop-blur-lg border border-purple-200/50 shadow-xl p-4"
                    >
                      <div className="flex flex-col items-center mb-3">
                        <img
                          src={user.avatar}
                          alt="Profile"
                          className="w-10 h-10 rounded-full mb-2 ring-1 ring-purple-200/50"
                        />
                        <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-600 truncate w-full text-center">{user.email}</p>
                      </div>
                      <div className="border-t border-purple-200/50 pt-2">
                        {/* Mobile nav links */}
                        <div className="md:hidden">
                          {[
                            { path: '/dashboard', label: 'Dashboard' },
                            { path: '/badges', label: 'Badges' },
                            { path: '/tags-search', label: 'Search by Tags' },
                            { path: '/notes-search', label: 'Search Notes' },
                          ].map((item) => (
                            <Link
                              key={item.path}
                              href={item.path}
                              className="block w-full text-center px-4 py-2 text-sm font-medium text-purple-600 hover:bg-white/10 hover:text-white transition-all duration-200 rounded-md"
                              onClick={() => setShowProfile(false)}
                            >
                              {item.label}
                            </Link>
                          ))}
                          <div className="border-t border-purple-200/50 my-2"></div>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.02, backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleSignOut}
                          className="block w-full text-center px-4 py-2 text-sm font-medium text-red-600 hover:text-red-500 bg-white/10 rounded-md transition-all duration-200"
                        >
                          Sign out
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
}