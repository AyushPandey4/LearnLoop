'use client';

import { useState } from 'react';
import VideoCard from './VideoCard';

export default function VideoList({ 
  videos, 
  onUpdateStatus, 
  onUpdateNote, 
  onUpdateTimeSpent, 
  onGenerateAiSummary, 
  onCopySummaryToNote,
  onStartTracking,
  onStopTracking,
  activeTrackingId,
  onTagsUpdate,
  onTogglePin
}) {
  const [expandedVideoId, setExpandedVideoId] = useState(null);

  const handleToggleExpand = (videoId) => {
    if (expandedVideoId === videoId) {
      setExpandedVideoId(null);
    } else {
      setExpandedVideoId(videoId);
    }
  };

  if (!videos || videos.length === 0) {
    return (
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-500/5 via-gray-500/5 to-gray-500/10 dark:from-gray-700/20 dark:via-gray-700/20 dark:to-gray-700/30 blur-3xl"></div>
        <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl p-12 text-center border border-gray-200/50 dark:border-gray-700/50 transform transition-all duration-300 hover:scale-[1.01] hover:shadow-xl">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-700/50 rounded-2xl flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-gray-400 dark:text-gray-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0118 18.375M20.625 4.5H3.375m17.25 0c.621 0 1.125.504 1.125 1.125M20.625 4.5h-1.5C18.504 4.5 18 5.004 18 5.625m3.75 0v1.5c0 .621-.504 1.125-1.125 1.125M3.375 4.5c-.621 0-1.125.504-1.125 1.125M3.375 4.5h1.5C5.496 4.5 6 5.004 6 5.625m-3.75 0v1.5c0 .621.504 1.125 1.125 1.125m0 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m1.5-3.75C5.496 8.25 6 7.746 6 7.125v-1.5M4.875 8.25C5.496 8.25 6 8.754 6 9.375v1.5m0-5.25v5.25m0-5.25C6 5.004 6.504 4.5 7.125 4.5h9.75c.621 0 1.125.504 1.125 1.125m1.125 2.625h1.5m-1.5 0A1.125 1.125 0 0118 7.125v-1.5m1.125 2.625c-.621 0-1.125.504-1.125 1.125v1.5m2.625-2.625c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125M18 5.625v5.25M7.125 12h9.75m-9.75 0A1.125 1.125 0 016 10.875M7.125 12C6.504 12 6 12.504 6 13.125m0-2.25C6 11.496 5.496 12 4.875 12M18 10.875c0 .621-.504 1.125-1.125 1.125M18 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m-12 5.25v-5.25m0 5.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125m-12 0v-1.5c0-.621-.504-1.125-1.125-1.125M18 18.375v-5.25m0 5.25v-1.5c0-.621.504-1.125 1.125-1.125M18 13.125v1.5c0 .621.504 1.125 1.125 1.125M18 13.125c0-.621.504-1.125 1.125-1.125M6 13.125v1.5c0 .621-.504 1.125-1.125 1.125M6 13.125C6 12.504 5.496 12 4.875 12m-1.5 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M19.125 12h1.5m0 0c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h1.5m14.25 0h1.5" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">No Videos Found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            This playlist doesn't have any videos yet.
          </p>
          <div className="h-1 w-32 mx-auto bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 dark:from-blue-900/10 dark:via-purple-900/10 dark:to-pink-900/10 blur-3xl -z-10"></div>
      
      {/* Video list with glass effect */}
      <div className="space-y-4 relative">
        {videos.map((video, index) => (
          <div 
            key={video.id}
            className="transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
            style={{
              opacity: 0,
              animation: `fadeSlideIn 0.5s ease-out ${index * 0.1}s forwards`
            }}
          >
            <VideoCard 
              video={video}
              isExpanded={expandedVideoId === video.id}
              onToggleExpand={() => handleToggleExpand(video.id)}
              onUpdateStatus={(status) => onUpdateStatus(video.id, status)}
              onUpdateNote={(note) => onUpdateNote(video.id, note)}
              onUpdateTimeSpent={(time) => onUpdateTimeSpent(video.id, time)}
              onGenerateAiSummary={() => onGenerateAiSummary(video.id)}
              onCopySummaryToNote={() => onCopySummaryToNote(video.id)}
              onStartTracking={(videoId) => onStartTracking(videoId)}
              onStopTracking={(videoId) => onStopTracking(videoId)}
              isTimeTracking={activeTrackingId === video.id}
              onTagsUpdate={(videoId, tags) => onTagsUpdate(videoId, tags)}
              onTogglePin={() => onTogglePin(video.id)}
            />
          </div>
        ))}
      </div>
      
      {/* Add keyframes for animation */}
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