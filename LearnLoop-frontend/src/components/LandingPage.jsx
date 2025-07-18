"use client";

import { useGoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { motion } from "framer-motion";

export default function LandingPage() {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { user, loading, login } = useAuth();

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        setIsLoggingIn(true);
        await login(response.access_token);
      } catch (error) {
        console.error("Login failed:", error);
        alert("Failed to sign in with Google.");
      } finally {
        setIsLoggingIn(false);
      }
    },
    onError: (error) => {
      console.error("Google Login Failed:", error);
      alert("Google login failed.");
    },
    scope: "email profile",
  });

  return (
    <div className="min-h-screen font-sans bg-gradient-to-b from-blue-100 to-purple-100 text-gray-900">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="max-w-5xl mx-auto text-center z-10"
        >
          <h1 className="text-5xl sm:text-7xl font-extrabold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight">
            Revolutionize Your Learning with LearnLoop
          </h1>
          <p className="text-xl sm:text-2xl text-gray-700 mb-6 font-medium max-w-3xl mx-auto">
            Master skills through YouTube playlists with AI-powered summaries,
            progress tracking, and rewards.
          </p>
          <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Organize your learning, take smart notes, and stay motivated with a
            platform designed for success.
          </p>
          <motion.button
            whileHover={{
              scale: 1.05,
              boxShadow: "0 0 25px rgba(139, 92, 246, 0.7)",
            }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGoogleLogin}
            disabled={isLoggingIn}
            className="px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold text-lg shadow-2xl hover:shadow-[0_0_30px_rgba(139,92,246,0.8)] transition-all duration-300 bg-blue-600/30 backdrop-blur-lg border border-purple-200/50"
          >
            {isLoggingIn ? "Signing in..." : "Start Learning Now"}
          </motion.button>
        </motion.div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-purple-100 to-transparent" />
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="py-32 px-4 sm:px-6 lg:px-8 bg-blue-100/30 relative"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10" />
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl sm:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
          >
            Everything You Need to Learn Smarter
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: "🎯",
                title: "Goal-Driven Learning",
                description:
                  "Set daily objectives and track your progress with intuitive tools.",
              },
              {
                icon: "🤖",
                title: "AI Video Summaries",
                description:
                  "Get concise, intelligent summaries to grasp key concepts quickly.",
              },
              {
                icon: "📊",
                title: "Progress Analytics",
                description:
                  "Visualize your learning journey with stunning charts.",
              },
              {
                icon: "🏆",
                title: "Achievement Badges",
                description: "Earn rewards for milestones to stay motivated.",
              },
              {
                icon: "📝",
                title: "Smart Notes",
                description:
                  "Capture insights with video-specific notes and timestamps.",
              },
              {
                icon: "📋",
                title: "Playlist Organization",
                description:
                  "Manage and categorize your YouTube playlists effortlessly.",
              },
              {
                icon: "⏱️",
                title: "Watch Time Insights",
                description:
                  "Optimize your study habits with detailed time tracking.",
              },
              {
                icon: "🔄",
                title: "Real-Time Sync",
                description:
                  "Keep your progress updated across all devices instantly.",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 0 30px rgba(139, 92, 246, 0.5)",
                }}
                className="p-8 rounded-2xl bg-white/20 backdrop-blur-lg border border-purple-200/50 shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                <div className="text-5xl mb-4 text-purple-500">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Showcase */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-purple-100 to-blue-100 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10" />
        <div className="max-w-7xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl sm:text-5xl font-bold mb-12 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
          >
            LearnLoop by the Numbers
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: "10K+", label: "Active Learners" },
              { value: "1M+", label: "Videos Tracked" },
              { value: "500K+", label: "Notes Taken" },
              { value: "50K+", label: "Badges Earned" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="p-6 rounded-2xl bg-white/20 backdrop-blur-lg border border-purple-200/50 shadow-xl"
              >
                <h3 className="text-3xl font-bold text-purple-600">
                  {stat.value}
                </h3>
                <p className="text-gray-600 mt-2">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Preview Section */}
      {/* <section className="py-24 px-4 sm:px-6 lg:px-8 bg-blue-100/30 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10" />
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl sm:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
          >
            See LearnLoop in Action
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative rounded-2xl overflow-hidden bg-white/20 backdrop-blur-lg border border-purple-200/50 shadow-2xl"
          >
            <div className="aspect-w-16 aspect-h-9">
              <div className="flex items-center justify-center bg-gray-200/50">
                <p className="text-gray-600 text-lg italic">
                  [Video Preview Placeholder: Showcase LearnLoop's dashboard,
                  playlist management, and AI summaries]
                </p>
              </div>
            </div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="absolute inset-0 bg-gradient-to-t from-purple-600/20 to-transparent pointer-events-none"
            />
          </motion.div>
        </div>
      </section> */}

      {/* How It Works Section */}
      <section
        id="how-it-works"
        className="py-32 px-4 sm:px-6 lg:px-8 bg-purple-100/30 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10" />
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl sm:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
          >
            Your Path to Mastery
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                step: "1",
                title: "Connect Your Playlists",
                description:
                  "Link your YouTube playlists and organize them by category for a seamless start.",
                icon: "📋",
              },
              {
                step: "2",
                title: "Track Your Progress",
                description:
                  "Watch videos, mark them complete, and see your learning journey unfold.",
                icon: "⏱️",
              },
              {
                step: "3",
                title: "Learn & Achieve",
                description:
                  "Take notes, use AI summaries, and earn badges for your milestones.",
                icon: "🏆",
              },
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="relative p-8 rounded-2xl bg-white/20 backdrop-blur-lg border border-purple-200/50 shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xl shadow-lg">
                  {step.step}
                </div>
                <div className="text-5xl mb-4 text-purple-500 text-center">
                  {step.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed text-center">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-100 to-purple-100 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Ready to Transform Your Learning?
          </h2>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Join thousands of learners mastering their skills with LearnLoop’s
            powerful tools.
          </p>
          <motion.button
            whileHover={{
              scale: 1.05,
              boxShadow: "0 0 25px rgba(139, 92, 246, 0.7)",
            }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGoogleLogin}
            disabled={isLoggingIn}
            className="px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold text-lg shadow-2xl hover:shadow-[0_0_30px_rgba(139,92,246,0.8)] transition-all duration-300 bg-blue-600/30 backdrop-blur-lg border border-purple-200/50"
          >
            {isLoggingIn ? "Signing in..." : "Join LearnLoop Now"}
          </motion.button>
        </motion.div>
      </section>

      {/* Testimonial Section */}
      <section
        id="testimonials"
        className="py-32 px-4 sm:px-6 lg:px-8 bg-blue-100/30 relative"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10" />
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl sm:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
          >
            Loved by Learners Worldwide
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote:
                  "LearnLoop’s AI summaries save me hours and make learning so efficient!",
                author: "Emma R., Student",
                avatar: "👩‍🎓",
              },
              {
                quote:
                  "The badge system keeps me motivated to learn every day. Amazing platform!",
                author: "Liam T., Developer",
                avatar: "👨‍💻",
              },
              {
                quote:
                  "Organizing my playlists and tracking progress has never been easier!",
                author: "Sophia L., Educator",
                avatar: "👩‍🏫",
              },
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="p-8 rounded-2xl bg-white/20 backdrop-blur-lg border border-purple-200/50 shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                <div className="text-4xl mb-4 text-purple-500 text-center">
                  {testimonial.avatar}
                </div>
                <blockquote className="text-lg text-gray-700 italic mb-4 text-center">
                  "{testimonial.quote}"
                </blockquote>
                <p className="text-gray-600 font-medium text-center">
                  - {testimonial.author}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        id="contact"
        className="py-16 px-4 sm:px-6 lg:px-8 bg-blue-600/10 backdrop-blur-lg border-t border-purple-200/50"
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              LearnLoop
            </h3>
            <p className="text-gray-600">
              Empowering you to master skills with YouTube playlists, AI tools,
              and personalized tracking.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Explore
            </h4>
            <div className="flex flex-col space-y-3">
              {["About", "Features", "Privacy Policy", "GitHub"].map((item) => (
                <a
                  key={item}
                  href="https://github.com/AyushPandey4"
                  className="text-gray-600 hover:text-purple-500 transition-colors duration-200"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Get in Touch
            </h4>
            <p className="text-gray-600">
              Questions? Contact us at{" "}
              <a
                href="mailto:ayushpandey1302@gmail.com"
                className="text-purple-500 hover:underline"
              >
                ayushpandey1302@gmail.com
              </a>
            </p>
          </div>
        </div>
        <div className="mt-12 text-center text-gray-600">
          © {new Date().getFullYear()} LearnLoop. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
