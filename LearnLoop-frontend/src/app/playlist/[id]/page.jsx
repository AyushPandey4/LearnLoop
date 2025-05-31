'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import PlaylistHeader from '@/components/playlist/PlaylistHeader';
import VideoList from '@/components/playlist/VideoList';
import DraggableVideoList from '@/components/playlist/DraggableVideoList';
import RewatchSection from '@/components/playlist/RewatchSection';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useAuth } from '@/context/AuthContext';
import { usePlaylist } from '@/context/PlaylistContext';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export default function PlaylistPage() {
  const { id } = useParams();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const { addVideoToPlaylist } = usePlaylist();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('all');
  const hasRewatchVideos = playlist?.videos.some(video => video.status === 'rewatch') || false;
  const [activeTrackingId, setActiveTrackingId] = useState(null);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user && !loading) {
      router.push('/');
    }
  }, [user, loading, router]);

    const fetchPlaylist = async () => {
      try {
        // Make sure we have authentication token
        const token = localStorage.getItem('token');
        if (!token) {
          setError('You must be logged in to view this playlist');
          setLoading(false);
          return;
        }
        
        setLoading(true);
        // Ensure auth header is set
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const response = await axios.get(`${API_URL}/api/playlist/${id}`);
        setPlaylist(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching playlist:', err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          setError('You are not authorized to view this playlist. Please log in again.');
        } else {
          setError('Failed to load playlist data. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    if (id && user) {
      fetchPlaylist();
    }
  }, [id, user]);

  const updateVideoStatus = async (videoId, newStatus) => {
    try {
      await axios.patch(`${API_URL}/api/video/${videoId}/status`, { status: newStatus });
      
      // Update local state
      setPlaylist(prev => {
        if (!prev) return prev;
        
        return {
          ...prev,
          videos: prev.videos.map(video => 
            video.id === videoId ? { ...video, status: newStatus } : video
          )
        };
      });
    } catch (err) {
      console.error('Error updating video status:', err);
    }
  };

  const updateVideoNote = async (videoId, note) => {
    try {
      await axios.patch(`${API_URL}/api/video/${videoId}/note`, { note });
      
      // Update local state
      setPlaylist(prev => {
        if (!prev) return prev;
        
        return {
          ...prev,
          videos: prev.videos.map(video => 
            video.id === videoId ? { ...video, notes: note } : video
          )
        };
      });
    } catch (err) {
      console.error('Error updating video note:', err);
    }
  };

  const updateTimeSpent = async (videoId, timeSpent) => {
    try {
      await axios.patch(`${API_URL}/api/video/${videoId}/time`, { timeSpent });
      
      // Update local state
      setPlaylist(prev => {
        if (!prev) return prev;
        
        return {
          ...prev,
          videos: prev.videos.map(video => 
            video.id === videoId ? { ...video, timeSpent } : video
          )
        };
      });
    } catch (err) {
      console.error('Error updating time spent:', err);
    }
  };

  const generateAiSummary = async (videoId) => {
    try {
      const response = await axios.post(`${API_URL}/api/video/${videoId}/generate-summary`);
      
      // Update local state
      setPlaylist(prev => {
        if (!prev) return prev;
        
        return {
          ...prev,
          videos: prev.videos.map(video => 
            video.id === videoId ? { 
              ...video, 
              aiSummary: response.data.aiSummary,
              aiSummaryGenerated: true
            } : video
          )
        };
      });

      return { success: true, summary: response.data.aiSummary };
    } catch (err) {
      console.error('Error generating AI summary:', err);
      return { 
        success: false, 
        message: err.response?.data?.msg || 'Failed to generate summary' 
      };
    }
  };

  const copySummaryToNote = async (videoId) => {
    try {
      const response = await axios.post(`${API_URL}/api/video/${videoId}/summary-to-note`);
      
      // Update local state
      setPlaylist(prev => {
        if (!prev) return prev;
        
        return {
          ...prev,
          videos: prev.videos.map(video => 
            video.id === videoId ? { ...video, notes: response.data.notes } : video
          )
        };
      });
      
      return { success: true };
    } catch (err) {
      console.error('Error copying summary to note:', err);
      return { success: false };
    }
  };

  const markAllAsComplete = async () => {
    if (!playlist || !playlist.videos || playlist.videos.length === 0) return;
    
    // Filter only videos that are not already completed
    const videosToUpdate = playlist.videos.filter(v => v.status !== 'completed');
    
    if (videosToUpdate.length === 0) return;
    
    // Update all videos
    try {
      // Create a batch of promises to update all videos in parallel
      const updatePromises = videosToUpdate.map(video => 
        axios.patch(`${API_URL}/api/video/${video.id}/status`, { status: 'completed' })
      );
      
      await Promise.all(updatePromises);
      
      // Update local state
      setPlaylist(prev => {
        if (!prev) return prev;
        
        return {
          ...prev,
          videos: prev.videos.map(video => ({ ...video, status: 'completed' }))
        };
      });
    } catch (err) {
      console.error('Error marking all videos as complete:', err);
    }
  };

  const handleAddVideo = async (videoUrl) => {
    console.log('handleAddVideo called with:', videoUrl);
    
    try {
      console.log('Calling addVideoToPlaylist with:', id, videoUrl);
      const result = await addVideoToPlaylist(id, videoUrl);
      console.log('addVideoToPlaylist result:', result);
      
      if (result.success) {
        // Refresh playlist data
        await fetchPlaylist();
        return { success: true };
      } else {
        console.error('Error from addVideoToPlaylist:', result.message);
        return { success: false, message: result.message };
      }
    } catch (err) {
      console.error('Exception in handleAddVideo:', err);
      return { success: false, message: 'Failed to add video' };
    }
  };

  // Handle video time tracking
  const handleStartTracking = async (videoId) => {
    setActiveTrackingId(videoId);
  };

  const handleStopTracking = async (videoId) => {
    if (activeTrackingId === videoId) {
      setActiveTrackingId(null);
    }
  };

  // Update tags for a video
  const handleUpdateTags = async (videoId, newTags) => {
    try {
      // No need to make an API call here as the TagManager already updates tags via API
      // Just update the local state to keep UI in sync
      
      if (!playlist) return;
      
      // Find and update the video in our playlist data
      const updatedVideos = playlist.videos.map(video => {
        if (video.id === videoId) {
          return { ...video, tags: newTags };
        }
        return video;
      });
      
      // Update playlist state
      setPlaylist({
        ...playlist,
        videos: updatedVideos
      });
    } catch (err) {
      console.error('Error updating tags:', err);
    }
  };

  // Handle video pin toggle
  const handleTogglePin = async (videoId) => {
    try {
      // Get token
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Authentication required');
        return;
      }
      
      // Set auth header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Call API to toggle pin status
      const response = await axios.patch(`${API_URL}/api/playlist/${id}/toggle-pin-video/${videoId}`);
      
      if (response.data.success) {
        // Update local state
        setPlaylist(prev => {
          if (!prev) return prev;
          
          return {
            ...prev,
            videos: prev.videos.map(video => 
              video.id === videoId ? { ...video, pinned: response.data.pinned } : video
            )
          };
        });
      }
    } catch (err) {
      console.error('Error toggling pin status:', err);
    }
  };

  // Handle video reordering
  const handleReorderVideos = async (videoPositions) => {
    try {
      // Get token
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Authentication required');
        return;
      }
      
      // Set auth header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Call API to update positions
      await axios.patch(`${API_URL}/api/playlist/${id}/reorder`, { videoPositions });
      
      // No need to update local state as it's already updated by the DraggableVideoList component
    } catch (err) {
      console.error('Error reordering videos:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navbar />
        <div className="container mx-auto max-w-7xl px-4 py-12">
          <div className="flex flex-col items-center justify-center h-[60vh]">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-400 animate-pulse">Loading playlist...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navbar />
        <div className="container mx-auto max-w-7xl px-4 py-16">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-red-500/20 shadow-xl rounded-xl p-8 max-w-2xl mx-auto">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-red-500 mb-3">Error Loading Playlist</h2>
              <p className="text-gray-300 mb-6">{error}</p>
              <button 
                onClick={() => router.push('/dashboard')} 
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navbar />
        <div className="container mx-auto max-w-7xl px-4 py-16">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 shadow-xl rounded-xl p-8 max-w-2xl mx-auto">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-200 mb-3">Playlist Not Found</h2>
              <p className="text-gray-400 mb-6">The playlist you're looking for doesn't exist or you don't have access to it.</p>
              <button 
                onClick={() => router.push('/dashboard')} 
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Playlist Header Component */}
        <div className="mb-8">
          <PlaylistHeader 
            playlist={playlist} 
            onMarkAllComplete={markAllAsComplete} 
            onAddVideo={handleAddVideo}
          />
        </div>
        
        {/* Tab navigation for videos - Enhanced UI */}
        {hasRewatchVideos && (
          <div className="mb-8">
            <div className="flex gap-4 p-1 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 w-fit">
              <button
                onClick={() => setActiveTab('all')}
                className={`py-2.5 px-6 rounded-lg text-sm font-medium transition-all duration-300 ${
                  activeTab === 'all' 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v8a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
                  </svg>
                  All Videos
                  <span className="bg-gray-700/50 px-2 py-0.5 rounded-full text-xs">
                    {playlist.videos.length}
                  </span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('rewatch')}
                className={`py-2.5 px-6 rounded-lg text-sm font-medium transition-all duration-300 ${
                  activeTab === 'rewatch' 
                    ? 'bg-purple-600 text-white shadow-lg' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                  To Rewatch
                  <span className="bg-gray-700/50 px-2 py-0.5 rounded-full text-xs">
                    {playlist.videos.filter(v => v.status === 'rewatch').length}
                  </span>
                </div>
              </button>
            </div>
          </div>
        )}
        
        {/* Show content based on active tab */}
        <div className="space-y-8">
          {activeTab === 'rewatch' ? (
            <RewatchSection 
              videos={playlist.videos} 
              onUpdateStatus={updateVideoStatus}
              onTogglePin={handleTogglePin}
            />
          ) : (
            <>
              {/* Info Messages - Enhanced UI */}
              {playlist.ytPlaylistId && (
                <div className="bg-blue-900/20 backdrop-blur-sm border border-blue-500/20 rounded-xl p-6 transform hover:scale-[1.01] transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-blue-400 mb-2">YouTube Playlist Order</h3>
                      <p className="text-gray-300">
                        Videos are displayed in the original order set by the playlist creator. 
                        The numbers in the blue circles indicate each video's position.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {playlist.isCustomPlaylist && playlist.videos && playlist.videos.length > 0 && (
                <div className="bg-indigo-900/20 backdrop-blur-sm border border-indigo-500/20 rounded-xl p-6 transform hover:scale-[1.01] transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-indigo-400 mb-2">Custom Playlist</h3>
                      <p className="text-gray-300">
                        This is a custom playlist. You can drag and drop videos to customize their order.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Video List Component - Enhanced Container */}
              <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl overflow-hidden shadow-xl">
                {playlist.isCustomPlaylist ? (
                  <DraggableVideoList 
                    videos={playlist.videos} 
                    onUpdateStatus={updateVideoStatus}
                    onUpdateNote={updateVideoNote}
                    onUpdateTimeSpent={updateTimeSpent}
                    onGenerateAiSummary={generateAiSummary}
                    onCopySummaryToNote={copySummaryToNote}
                    onStartTracking={handleStartTracking}
                    onStopTracking={handleStopTracking}
                    activeTrackingId={activeTrackingId}
                    onTagsUpdate={handleUpdateTags}
                    onTogglePin={handleTogglePin}
                    onReorder={handleReorderVideos}
                    isCustomPlaylist={true}
                  />
                ) : (
                  <VideoList 
                    videos={playlist.videos} 
                    onUpdateStatus={updateVideoStatus}
                    onUpdateNote={updateVideoNote}
                    onUpdateTimeSpent={updateTimeSpent}
                    onGenerateAiSummary={generateAiSummary}
                    onCopySummaryToNote={copySummaryToNote}
                    onStartTracking={handleStartTracking}
                    onStopTracking={handleStopTracking}
                    activeTrackingId={activeTrackingId}
                    onTagsUpdate={handleUpdateTags}
                    onTogglePin={handleTogglePin}
                  />
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 