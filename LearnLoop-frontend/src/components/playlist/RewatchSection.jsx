"use client";

import { useState } from "react";
import Link from "next/link";

export default function RewatchSection({
  videos,
  onUpdateStatus,
  onTogglePin,
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  const rewatchVideos = videos.filter((video) => video.status === "rewatch");

  if (rewatchVideos.length === 0) {
    return null;
  }

  // Format duration from ISO 8601 format
  const formatDuration = (isoDuration) => {
    if (!isoDuration) return "";

    // Parse ISO 8601 duration
    const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return "";

    const hours = parseInt(match[1] || 0);
    const minutes = parseInt(match[2] || 0);
    const seconds = parseInt(match[3] || 0);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
    } else {
      return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    }
  };

  return (
    <div className="relative mb-8 overflow-hidden group">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-pink-500/5 dark:from-purple-900/20 dark:via-purple-900/10 dark:to-pink-900/10 blur-3xl"></div>

      {/* Main content with glass effect */}
      <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-lg border border-purple-200/50 dark:border-purple-700/50 overflow-hidden transition-all duration-300 hover:shadow-xl">
        {/* Header */}
        <div
          className="px-6 py-4 bg-purple-100/80 dark:bg-purple-900/40 flex justify-between items-center cursor-pointer transition-colors duration-200 hover:bg-purple-200/80 dark:hover:bg-purple-800/40"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-200 dark:bg-purple-800 rounded-lg flex items-center justify-center">
              <span
                className="text-xl transform transition-transform duration-300"
                style={{
                  transform: isExpanded ? "rotate(0deg)" : "rotate(-180deg)",
                }}
              >
                🔄
              </span>
            </div>
            <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 flex items-center">
              Videos to Rewatch
              <span className="ml-2 px-2 py-0.5 text-sm bg-purple-200 dark:bg-purple-800 text-purple-900 dark:text-purple-100 rounded-full">
                {rewatchVideos.length}
              </span>
            </h3>
          </div>
          <button
            className="text-purple-700 dark:text-purple-300 transition-transform duration-300"
            style={{
              transform: isExpanded ? "rotate(0deg)" : "rotate(-180deg)",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {/* Video List */}
        {isExpanded && (
          <div className="p-6">
            <div className="space-y-4">
              {rewatchVideos.map((video, index) => (
                <div
                  key={video.id}
                  className="relative bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-purple-100 dark:border-purple-800/50 transition-all duration-300 hover:shadow-md hover:scale-[1.01]"
                  style={{
                    opacity: 0,
                    animation: `fadeSlideIn 0.5s ease-out ${
                      index * 0.1
                    }s forwards`,
                  }}
                >
                  <div className="flex items-center p-4">
                    <div className="w-32 h-20 relative flex-shrink-0 rounded-lg overflow-hidden">
                      <img
                        src={
                          video.thumbnail ||
                          `https://img.youtube.com/vi/${video.ytId}/mqdefault.jpg`
                        }
                        alt={video.title}
                        className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-105"
                      />
                      {video.duration && (
                        <div className="absolute bottom-1 right-1 bg-black/75 text-white text-xs px-1.5 py-0.5 rounded backdrop-blur-sm">
                          {formatDuration(video.duration)}
                        </div>
                      )}
                      {video.pinned && (
                        <div className="absolute top-1 right-1 bg-amber-500/90 text-white p-1 rounded-full backdrop-blur-sm">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3"
                            fill="currentColor"
                            viewBox="0 0 16 16"
                          >
                            <path d="M4.146.146A.5.5 0 0 1 4.5 0h7a.5.5 0 0 1 .5.5c0 .68-.342 1.174-.646 1.479-.126.125-.25.224-.354.298v4.431l.078.048c.203.127.476.314.751.555C12.36 7.775 13 8.527 13 9.5a.5.5 0 0 1-.5.5h-4v4.5c0 .276-.224 1.5-.5 1.5s-.5-1.224-.5-1.5V10h-4a.5.5 0 0 1-.5-.5c0-.973.64-1.725 1.17-2.189A5.921 5.921 0 0 1 5 6.708V2.277a2.77 2.77 0 0 1-.354-.298C4.342 1.674 4 1.179 4 .5a.5.5 0 0 1 .146-.354z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 ml-4">
                      <div className="flex justify-between items-start gap-4">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                          {video.title}
                        </h4>
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          <button
                            onClick={() => onTogglePin(video.id)}
                            className={`p-1.5 rounded-full transition-colors duration-200 ${
                              video.pinned
                                ? "bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400"
                                : "text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                            }`}
                            title={video.pinned ? "Unpin video" : "Pin video"}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={1.5}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                              />
                            </svg>
                          </button>
                          <select
                            className="text-xs px-2 py-1.5 rounded-lg border border-purple-200 dark:border-purple-800 bg-white dark:bg-gray-700 text-purple-900 dark:text-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                            value={video.status}
                            onChange={(e) =>
                              onUpdateStatus(video.id, e.target.value)
                            }
                          >
                            <option value="rewatch">Need to Rewatch</option>
                            <option value="to-watch">To Watch</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                          </select>
                        </div>
                      </div>

                      <div className="mt-2 flex items-center space-x-4">
                        <a
                          href={`https://youtube.com/watch?v=${video.ytId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors duration-200"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Watch on YouTube
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
