"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import LoadingSpinner from "@/components/common/LoadingSpinner";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function BadgesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [badges, setBadges] = useState([]);
  const [allPossibleBadges, setAllPossibleBadges] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [checkingBadges, setCheckingBadges] = useState(false);
  const [cleaningDuplicates, setCleaningDuplicates] = useState(false);
  const [syncingBadges, setSyncingBadges] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
  });
  const [badgeCategories, setBadgeCategories] = useState({
    playlists: [],
    milestones: [],
  });

  useEffect(() => {
    if (!user) {
      router.push("/");
    }
  }, [user, router]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        setLoading(true);

        const badgesResponse = await axios.get(
          `${API_URL}/api/badge/my-badges`
        );
        setBadges(badgesResponse.data || []);

        const allBadgesResponse = await axios.get(`${API_URL}/api/badge/all`);
        setAllPossibleBadges(allBadgesResponse.data || []);

        categorizeUserBadges(badgesResponse.data || []);
      } catch (error) {
        console.error("Error fetching badges:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const categorizeUserBadges = (badges) => {
    const playlistBadges = [];
    const milestoneBadges = [];

    badges.forEach((badge) => {
      if (badge.title.startsWith("Completed: ")) {
        playlistBadges.push(badge);
      } else {
        milestoneBadges.push(badge);
      }
    });

    setBadgeCategories({
      playlists: playlistBadges,
      milestones: milestoneBadges,
    });
  };

  const checkForNewBadges = async () => {
    try {
      setCheckingBadges(true);

      const response = await axios.post(`${API_URL}/api/badge/check-badges`);

      if (response.data.newBadges && response.data.newBadges.length > 0) {
        setBadges(response.data.newBadges);

        categorizeUserBadges(response.data.newBadges);

        setNotification({
          show: true,
          message: response.data.message || "New badges earned!",
        });

        setTimeout(() => {
          setNotification({ show: false, message: "" });
        }, 5000);
      } else {
        setNotification({
          show: true,
          message: "No new badges earned at this time",
        });

        setTimeout(() => {
          setNotification({ show: false, message: "" });
        }, 5000);
      }
    } catch (error) {
      console.error("Error checking for new badges:", error);
    } finally {
      setCheckingBadges(false);
    }
  };

  const syncBadges = async () => {
    try {
      setSyncingBadges(true);

      const response = await axios.post(`${API_URL}/api/badge/sync`);

      if (response.data.success) {
        setBadges(response.data.badges || []);

        categorizeUserBadges(response.data.badges || []);

        const stats = response.data.stats;
        let message = "Badges synchronized successfully. ";

        if (stats.orphanedBadgesRemoved > 0) {
          message += `Removed ${stats.orphanedBadgesRemoved} orphaned badge(s). `;
        }

        if (stats.duplicateBadgesRemoved > 0) {
          message += `Removed ${stats.duplicateBadgesRemoved} duplicate badge(s). `;
        }

        if (stats.newBadgesAdded > 0) {
          message += `Added ${stats.newBadgesAdded} new badge(s). `;
        }

        setNotification({
          show: true,
          message: message.trim(),
        });
      } else {
        setNotification({
          show: true,
          message: "Synced badges but no changes were made.",
        });
      }

      setTimeout(() => {
        setNotification({ show: false, message: "" });
      }, 5000);
    } catch (error) {
      console.error("Error syncing badges:", error);
      setNotification({
        show: true,
        message: "Error syncing badges. Please try again.",
      });

      setTimeout(() => {
        setNotification({ show: false, message: "" });
      }, 5000);
    } finally {
      setSyncingBadges(false);
    }
  };

  const getFilteredBadges = () => {
    if (!badges.length || !allPossibleBadges.length) return [];

    const earnedBadgeMap = badges.reduce((map, badge) => {
      map[badge.title] = badge;
      return map;
    }, {});

    const allBadges = allPossibleBadges.map((badge) => {
      const earnedBadge = earnedBadgeMap[badge.title];

      return {
        ...badge,
        earned: !!earnedBadge,
        dateEarned: earnedBadge?.dateEarned,
        id:
          earnedBadge?.id ||
          `possible-${badge.title.replace(/\s+/g, "-").toLowerCase()}`,
      };
    });

    const playlistCompletionBadges = badges.filter(
      (badge) =>
        badge.title.startsWith("Completed: ") &&
        !allBadges.some((b) => b.title === badge.title)
    );

    const combinedBadges = [
      ...allBadges,
      ...playlistCompletionBadges.map((badge) => ({
        ...badge,
        earned: true,
        isPlaylistBadge: true,
      })),
    ];

    switch (activeFilter) {
      case "earned":
        return combinedBadges.filter((badge) => badge.earned);
      case "locked":
        return combinedBadges.filter((badge) => !badge.earned);
      case "playlists":
        return combinedBadges.filter(
          (badge) =>
            badge.earned &&
            (badge.isPlaylistBadge || badge.title === "Playlist Master")
        );
      case "all":
      default:
        return combinedBadges;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getPlaylistName = (title) => {
    if (title.startsWith("Completed: ")) {
      return title.replace("Completed: ", "");
    }
    return title;
  };

  const filteredBadges = getFilteredBadges();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Navbar />
        <div className="container mx-auto max-w-7xl px-4 py-12">
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      <div className="container mx-auto max-w-7xl px-4 py-12">
        {/* Header with animated gradient */}
        <div className="relative mb-12 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-green-500/10 to-teal-500/10 dark:from-emerald-900/20 dark:via-green-900/20 dark:to-teal-900/20 blur-3xl"></div>
          <div className="relative">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 group">
              Your Achievements
              <div className="h-1 w-0 group-hover:w-full bg-emerald-500 transition-all duration-300 rounded-full"></div>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Track your progress and unlock badges as you complete playlists
              and videos
            </p>
          </div>
        </div>

        {/* Filters and Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div
            className="inline-flex rounded-xl shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-1"
            role="group"
          >
            <button
              type="button"
              onClick={() => setActiveFilter("all")}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                activeFilter === "all"
                  ? "bg-emerald-500 text-white shadow-md"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50"
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("earned")}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                activeFilter === "earned"
                  ? "bg-emerald-500 text-white shadow-md"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50"
              }`}
            >
              Earned
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("playlists")}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                activeFilter === "playlists"
                  ? "bg-emerald-500 text-white shadow-md"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50"
              }`}
            >
              Playlists
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("locked")}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                activeFilter === "locked"
                  ? "bg-emerald-500 text-white shadow-md"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50"
              }`}
            >
              Locked
            </button>
          </div>
          <div className="flex gap-3">
            <button
              onClick={syncBadges}
              disabled={syncingBadges}
              className="px-6 py-2.5 text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-xl flex items-center gap-2"
            >
              {syncingBadges ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Syncing...</span>
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  <span>Sync Badges</span>
                </>
              )}
            </button>
            <button
              onClick={checkForNewBadges}
              disabled={checkingBadges}
              className="px-6 py-2.5 text-white bg-emerald-500 rounded-xl hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-xl flex items-center gap-2"
            >
              {checkingBadges ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Checking...</span>
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>Check New Badges</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Notification */}
        {notification.show && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-200 shadow-lg animate-fade-in backdrop-blur-sm">
            <p className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z"
                  clipRule="evenodd"
                />
              </svg>
              {notification.message}
            </p>
          </div>
        )}

        {/* Badges Grid */}
        {filteredBadges.length === 0 ? (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-xl p-8 text-center border border-gray-200/50 dark:border-gray-700/50">
            <div className="mb-4 text-7xl animate-bounce">🏆</div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
              No Badges Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              {activeFilter === "earned"
                ? "You haven't earned any badges yet. Keep learning and completing playlists!"
                : activeFilter === "playlists"
                ? "You haven't completed any playlists yet."
                : "No badges match the selected filter."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBadges.map((badge) => {
              const isPlaylistBadge =
                badge.title.startsWith("Completed: ") || badge.isPlaylistBadge;
              const playlistName = isPlaylistBadge
                ? getPlaylistName(badge.title)
                : "";

              return (
                <div
                  key={badge.id}
                  className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-xl overflow-hidden border transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-1 ${
                    isPlaylistBadge
                      ? "border-purple-200/50 dark:border-purple-800/50"
                      : badge.earned
                      ? "border-emerald-200/50 dark:border-emerald-800/50"
                      : "border-gray-200/50 dark:border-gray-700/50 opacity-75"
                  }`}
                >
                  <div
                    className={`p-6 flex flex-col items-center text-center ${
                      isPlaylistBadge
                        ? "bg-gradient-to-br from-purple-50/50 to-indigo-50/50 dark:from-purple-900/20 dark:to-indigo-900/20"
                        : badge.earned
                        ? "bg-gradient-to-br from-emerald-50/50 to-green-50/50 dark:from-emerald-900/20 dark:to-green-900/20"
                        : ""
                    }`}
                  >
                    <div
                      className={`text-6xl mb-5 transform transition-all duration-300 ${
                        badge.earned
                          ? "hover:scale-110"
                          : "grayscale hover:grayscale-0"
                      }`}
                    >
                      {badge.iconUrl}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {isPlaylistBadge ? "Playlist Completed" : badge.title}
                    </h3>
                    {isPlaylistBadge && (
                      <span className="mt-1 px-3 py-1 bg-purple-100/80 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 text-sm rounded-full font-medium">
                        {playlistName}
                      </span>
                    )}
                    <p className="text-gray-600 dark:text-gray-400 mt-3 text-sm">
                      {badge.description}
                    </p>
                    <div className="mt-5 flex items-center">
                      {badge.earned ? (
                        <>
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${
                              isPlaylistBadge
                                ? "bg-purple-100/80 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200"
                                : "bg-emerald-100/80 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200"
                            }`}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 mr-1.5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Earned
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400 ml-3">
                            {formatDate(badge.dateEarned)}
                          </span>
                        </>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100/80 text-gray-800 dark:bg-gray-700/50 dark:text-gray-200">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1.5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Locked
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
