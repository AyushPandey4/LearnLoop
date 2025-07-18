"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { usePlaylist } from "../../context/PlaylistContext";
import Sidebar from "../../components/dashboard/Sidebar";
import DailyGoal from "../../components/dashboard/DailyGoal";
import RewatchWidget from "../../components/dashboard/RewatchWidget";
import PinnedVideosWidget from "../../components/dashboard/PinnedVideosWidget";
import PlaylistGrid from "../../components/dashboard/PlaylistGrid";
import AddPlaylistModal from "../../components/dashboard/AddPlaylistModal";
import Navbar from "../../components/Navbar";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function Dashboard() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  const {
    playlists,
    categories,
    loading: playlistLoading,
    activeCategory,
    setActiveCategory,
    getFilteredPlaylists,
    addPlaylist,
    deletePlaylist,
    addCategory,
    renameCategory,
    deleteCategory,
  } = usePlaylist();

  const [dailyGoal, setDailyGoal] = useState("");
  const [badges, setBadges] = useState([]);
  const [isAddPlaylistModalOpen, setIsAddPlaylistModalOpen] = useState(false);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  // Load dashboard data
  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setDashboardLoading(true);

      // Fetch daily goal
      const dailyGoalResponse = await axios.get(
        `${API_URL}/api/user/daily-goal`
      );
      setDailyGoal(dailyGoalResponse.data.dailyGoal || "");

      // Fetch badges summary
      const badgesResponse = await axios.get(`${API_URL}/api/badge/my-badges`);
      setBadges(badgesResponse.data || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error.message);
    } finally {
      setDashboardLoading(false);
    }
  };

  const handleDailyGoalUpdate = async (newGoal) => {
    try {
      await axios.post(`${API_URL}/api/user/daily-goal`, {
        dailyGoal: newGoal,
      });
      setDailyGoal(newGoal);
    } catch (error) {
      console.error("Error updating daily goal:", error.message);
    }
  };

  const handleAddPlaylist = async (playlistData) => {
    const result = await addPlaylist(playlistData);
    if (result.success) {
      setIsAddPlaylistModalOpen(false);
    }
    return result;
  };

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  // If not authenticated and not loading, redirect to home page
  if (!user) {
    return null; // Return null while redirect happens
  }

  const filteredPlaylists = getFilteredPlaylists();

  const processedPlaylists = filteredPlaylists.map((playlist) => {
    if (playlist.rewatchCount === undefined && playlist.videos) {
      playlist.rewatchCount = playlist.videos.filter(
        (v) => v.status === "rewatch"
      ).length;
    } else if (playlist.rewatchCount === undefined) {
      playlist.rewatchCount = 0;
    }

    return playlist;
  });

  return (
    <>
      <Navbar />
      <div className="mt-16 min-h-screen bg-gray-900 text-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Compact Welcome Header */}
          <div className="flex items-center justify-between mb-6 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 p-4 rounded-xl shadow-lg">
            <div>
              <h2 className="text-2xl font-semibold flex items-center gap-2">
                Welcome back, <span className="text-blue-400">{user.name}</span>
                <span className="animate-wave">👋</span>
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                Track your learning progress and manage your content
              </p>
            </div>
            <button
              onClick={() => setIsAddPlaylistModalOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              New Playlist
            </button>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Column - Sidebar */}
            <aside className="w-full lg:w-80 lg:sticky lg:top-24 lg:h-[calc(100vh-6rem)]">
              <div className="bg-gray-800/50 rounded-xl shadow-lg backdrop-blur-sm border border-gray-700/50 p-4">
                <Sidebar
                  categories={categories}
                  activeCategory={activeCategory}
                  setActiveCategory={setActiveCategory}
                  onAddPlaylistClick={() => setIsAddPlaylistModalOpen(true)}
                  onAddCategory={addCategory}
                  onRenameCategory={renameCategory}
                  onDeleteCategory={deleteCategory}
                  badgeCount={badges.length}
                />
              </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 space-y-6">
              {/* Top Row - Stats Widgets */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 auto-rows-auto">
                <div className="h-fit bg-gray-800/50 rounded-xl shadow-lg backdrop-blur-sm border border-gray-700/50 p-6 hover:border-blue-500/50 transition-colors duration-300">
                  <DailyGoal
                    dailyGoal={dailyGoal}
                    onUpdate={handleDailyGoalUpdate}
                  />
                </div>

                <div className="h-fit bg-gray-800/50 rounded-xl shadow-lg backdrop-blur-sm border border-gray-700/50 p-6 hover:border-purple-500/50 transition-colors duration-300">
                  <RewatchWidget />
                </div>
              </div>

              {/* Pinned Videos Section */}
              <section className="h-fit bg-gray-800/50 rounded-xl shadow-lg backdrop-blur-sm border border-gray-700/50 hover:border-amber-500/50 transition-colors duration-300">
                <PinnedVideosWidget />
              </section>

              {/* Playlists Grid Section */}
              <section className="h-fit bg-gray-800/50 rounded-xl shadow-lg backdrop-blur-sm border border-gray-700/50 p-6 hover:border-green-500/50 transition-colors duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-100">
                    Your Playlists
                  </h3>
                  <span className="text-sm text-gray-400">
                    {processedPlaylists.length} playlists
                  </span>
                </div>
                <PlaylistGrid
                  playlists={processedPlaylists}
                  onDelete={deletePlaylist}
                />
              </section>
            </main>
          </div>
        </div>

        {/* Add Playlist Modal */}
        {isAddPlaylistModalOpen && (
          <AddPlaylistModal
            onClose={() => setIsAddPlaylistModalOpen(false)}
            onAdd={handleAddPlaylist}
            categories={categories}
            onAddCategory={addCategory}
          />
        )}
      </div>

      {/* Add some CSS animations */}
      <style jsx global>{`
        @keyframes wave {
          0% {
            transform: rotate(0deg);
          }
          20% {
            transform: rotate(14deg);
          }
          40% {
            transform: rotate(-8deg);
          }
          60% {
            transform: rotate(14deg);
          }
          80% {
            transform: rotate(-4deg);
          }
          100% {
            transform: rotate(10deg);
          }
        }
        .animate-wave {
          animation: wave 2.5s infinite;
          transform-origin: 70% 70%;
          display: inline-block;
        }
      `}</style>
    </>
  );
}
