'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { usePlaylist } from '@/context/PlaylistContext';
import { toast } from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export default function PlaylistHeader({ playlist, onMarkAllComplete, onAddVideo }) {
  const router = useRouter();
  const { user } = useAuth();
  const { refreshPlaylists } = usePlaylist();
  const [showAddVideoModal, setShowAddVideoModal] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showDurations, setShowDurations] = useState(false);
  const [syncStatus, setSyncStatus] = useState({ loading: false, message: '', error: false, count: 0 });
  const [showSyncNotification, setShowSyncNotification] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);
  const [resetNotification, setResetNotification] = useState({ show: false, message: '' });
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState(playlist?.category || '');
  const [changingCategory, setChangingCategory] = useState(false);
  const [categories, setCategories] = useState([]);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [loadingCategories, setLoadingCategories] = useState(false);
  
  // Debug log - Remove after debugging
  // console.log('Playlist in header:', {
  //   id: playlist.id, 
  //   name: playlist.name,
  //   isCustomPlaylist: playlist.isCustomPlaylist,
  //   ytPlaylistId: playlist.ytPlaylistId
  // });
  
  // Format minutes as hours and minutes
  const formatTimeSpent = (minutes) => {
    if (!minutes) return '0 min';
    
    if (minutes < 60) return `${minutes} min`;
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    return `${hours}h${mins > 0 ? ` ${mins}m` : ''}`;
  };
  
  // Calculate total duration in minutes
  const calculateTotalDuration = () => {
    if (!playlist.videos || playlist.videos.length === 0) return 0;
    
    return playlist.videos.reduce((total, video) => {
      if (!video.duration) return total;
      
      // Parse ISO 8601 duration
      const match = video.duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
      if (!match) return total;
      
      const hours = parseInt(match[1] || 0);
      const minutes = parseInt(match[2] || 0);
      const seconds = parseInt(match[3] || 0);
      
      return total + (hours * 60) + minutes + (seconds / 60);
    }, 0);
  };
  
  // Calculate remaining duration in minutes
  const calculateRemainingDuration = () => {
    if (!playlist.videos || playlist.videos.length === 0) return 0;
    
    return playlist.videos
      .filter(video => video.status !== 'completed')
      .reduce((total, video) => {
        if (!video.duration) return total;
        
        // Parse ISO 8601 duration
        const match = video.duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
        if (!match) return total;
        
        const hours = parseInt(match[1] || 0);
        const minutes = parseInt(match[2] || 0);
        const seconds = parseInt(match[3] || 0);
        
        return total + (hours * 60) + minutes + (seconds / 60);
      }, 0);
  };
  
  // Calculate durations at different speeds
  const calculateDurations = () => {
    const totalMinutes = calculateTotalDuration();
    const remainingMinutes = calculateRemainingDuration();
    
    return {
      duration: {
        normal: formatTimeSpent(Math.ceil(totalMinutes)),
        x1_5: formatTimeSpent(Math.ceil(totalMinutes / 1.5)),
        x1_75: formatTimeSpent(Math.ceil(totalMinutes / 1.75)),
        x2: formatTimeSpent(Math.ceil(totalMinutes / 2))
      },
      estimatedTimeLeft: {
        minutes: remainingMinutes,
        formatted: formatTimeSpent(Math.ceil(remainingMinutes)),
        x1_5: formatTimeSpent(Math.ceil(remainingMinutes / 1.5)),
        x1_75: formatTimeSpent(Math.ceil(remainingMinutes / 1.75)),
        x2: formatTimeSpent(Math.ceil(remainingMinutes / 2))
      }
    };
  };
  
  const { duration, estimatedTimeLeft } = calculateDurations();
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };
  
  // Calculate total time spent on this playlist
  const getTotalTimeSpent = () => {
    if (!playlist.videos || playlist.videos.length === 0) return 0;
    return playlist.videos.reduce((total, video) => total + (video.timeSpent || 0), 0);
  };
  
  // Count total notes
  const getTotalNotes = () => {
    if (!playlist.videos) return 0;
    return playlist.videos.filter(video => video.notes && video.notes.trim()).length;
  };
  
  const totalTimeSpent = getTotalTimeSpent();
  const totalNotes = getTotalNotes();
  const ytInfo = playlist.ytInfo || {};
  
  // Fetch user's categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const token = localStorage.getItem('token');
        if (!token) return;

        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const response = await axios.get(`${API_URL}/api/user/categories`);
        setCategories(response.data || []);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setCategories([]);
        setError('Failed to load categories');
      } finally {
        setLoadingCategories(false);
      }
    };

    if (showCategoryModal) {
      fetchCategories();
    }
  }, [showCategoryModal]);
  
  const handleAddVideo = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!videoUrl.trim()) {
      setError('Video URL is required');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await onAddVideo(videoUrl);
      
      if (result.success) {
        setVideoUrl('');
        setShowAddVideoModal(false);
      } else {
        setError(result.message || 'Failed to add video');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleSyncWithYouTube = async () => {
    if (!playlist.ytPlaylistId) return;
    
    try {
      setSyncStatus({ loading: true, message: 'Syncing with YouTube...', error: false, count: 0 });
      setShowSyncNotification(true);
      
      // Get token
      const token = localStorage.getItem('token');
      if (!token) {
        setSyncStatus({
          loading: false,
          message: 'Authentication required',
          error: true,
          count: 0
        });
        return;
      }
      
      // Set auth header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Call sync API
      const response = await axios.post(`${API_URL}/api/playlist/${playlist.id}/sync`);
      
      if (response.data.newVideosCount > 0) {
        setSyncStatus({
          loading: false,
          message: `${response.data.newVideosCount} new videos added to this playlist`,
          error: false,
          count: response.data.newVideosCount
        });
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
          setShowSyncNotification(false);
        }, 10000);
        
        // Refresh the page to show the new videos
        window.location.reload();
      } else {
        setSyncStatus({
          loading: false,
          message: 'Playlist is already up to date',
          error: false,
          count: 0
        });
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
          setShowSyncNotification(false);
        }, 5000);
      }
    } catch (err) {
      console.error('Error syncing with YouTube:', err);
      setSyncStatus({
        loading: false,
        message: err.response?.data?.msg || 'Failed to sync with YouTube',
        error: true,
        count: 0
      });
    }
  };
  
  const handleResetProgress = async () => {
    setShowResetConfirmModal(false);
    setIsResetting(true);
    
    try {
      // Get token
      const token = localStorage.getItem('token');
      if (!token) {
        setResetNotification({
          show: true,
          message: 'Authentication required'
        });
        setIsResetting(false);
        return;
      }
      
      // Set auth header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Call reset API
      const response = await axios.post(`${API_URL}/api/playlist/${playlist.id}/reset`);
      
      if (response.data.success) {
        setResetNotification({
          show: true,
          message: `Progress reset successfully. All ${response.data.videosCount} videos set to "To Watch".`
        });
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
          setResetNotification({ show: false, message: '' });
        }, 5000);
        
        // Refresh the page to update UI
        window.location.reload();
      }
    } catch (err) {
      console.error('Error resetting playlist progress:', err);
      setResetNotification({
        show: true,
        message: err.response?.data?.msg || 'Failed to reset progress'
      });
      
      // Auto-dismiss after 5 seconds
      setTimeout(() => {
        setResetNotification({ show: false, message: '' });
      }, 5000);
    } finally {
      setIsResetting(false);
    }
  };

  const handleCategoryChange = async (category) => {
    if (!category || category === playlist.category) {
      setShowCategoryModal(false);
      return;
    }

    try {
      setChangingCategory(true);
      setError('');

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        return;
      }

      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Debug log to check playlist object
      console.log('Playlist object:', playlist);

      await axios.patch(`${API_URL}/api/playlist/${playlist.id}/category`, {
        category: category
      });

      toast.success('Category updated successfully');
      setShowCategoryModal(false);
      refreshPlaylists();
    } catch (err) {
      console.error('Error updating category:', err);
      setError(err.response?.data?.msg || 'Failed to update category');
    } finally {
      setChangingCategory(false);
    }
  };

  const handleAddNewCategory = async () => {
    if (!newCategoryInput.trim()) {
      setError('Category name is required');
      return;
    }

    try {
      setChangingCategory(true);
      setError('');

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        return;
      }

      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // First add the new category
      await axios.post(`${API_URL}/api/user/category`, {
        category: newCategoryInput.trim()
      });

      // Then update the playlist to use this category
      await axios.patch(`${API_URL}/api/playlist/${playlist.id}/category`, {
        category: newCategoryInput.trim()
      });

      toast.success('Category added and updated successfully');
      setShowCategoryModal(false);
      refreshPlaylists();
    } catch (err) {
      console.error('Error adding new category:', err);
      setError(err.response?.data?.msg || 'Failed to add new category');
    } finally {
      setChangingCategory(false);
      setShowNewCategoryInput(false);
      setNewCategoryInput('');
    }
  };
  
  return (
    <div className="relative overflow-hidden">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20 blur-3xl"></div>
      
      {/* Main content with glass effect */}
      <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-xl rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50">
        {/* Sync and Reset Notifications */}
        {showSyncNotification && (
          <div className={`mb-6 p-4 rounded-xl backdrop-blur-sm border transition-all duration-300 transform ${
            syncStatus.error 
              ? 'bg-red-100/90 dark:bg-red-900/30 border-red-200 dark:border-red-800/50 text-red-800 dark:text-red-300' 
              : syncStatus.count > 0
                ? 'bg-green-100/90 dark:bg-green-900/30 border-green-200 dark:border-green-800/50 text-green-800 dark:text-green-300'
                : 'bg-blue-100/90 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800/50 text-blue-800 dark:text-blue-300'
          } animate-fade-in`}>
            <div className="flex items-center">
              {syncStatus.loading ? (
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : syncStatus.error ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : syncStatus.count > 0 ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <span>{syncStatus.message}</span>
            </div>
            <button 
              onClick={() => setShowSyncNotification(false)}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        
        {/* Reset Notification */}
        {resetNotification.show && (
          <div className="mb-6 p-4 rounded-xl bg-green-100/90 dark:bg-green-900/30 border border-green-200 dark:border-green-800/50 text-green-800 dark:text-green-300 backdrop-blur-sm transition-all duration-300 transform animate-fade-in">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{resetNotification.message}</span>
            </div>
            <button 
              onClick={() => setResetNotification({ show: false, message: '' })}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        <div className="flex flex-col lg:flex-row justify-between gap-8">
          {/* Left side - Title and stats */}
          <div className="flex-grow">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3 group">
              {playlist.name}
              <div className="h-1 w-0 group-hover:w-full bg-blue-500 transition-all duration-300 rounded-full"></div>
            </h1>
            
            <div className="flex items-center flex-wrap gap-3 mb-4">
              <div className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100/80 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800/50 backdrop-blur-sm transition-all duration-200 hover:bg-blue-200/80 dark:hover:bg-blue-800/50">
                {playlist.category}
                <button
                  onClick={() => setShowCategoryModal(true)}
                  className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              </div>
              
              <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                {playlist.totalVideos} videos
              </span>
              
              {ytInfo.channelTitle && (
                <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                  {ytInfo.channelTitle}
                </span>
              )}
              
              {ytInfo.publishedAt && (
                <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Published {formatDate(ytInfo.publishedAt)}
                </span>
              )}
            </div>
            
            {ytInfo.description && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {ytInfo.description}
                </p>
              </div>
            )}

            {/* Duration info */}
            <div className="mt-6">
              <button 
                onClick={() => setShowDurations(!showDurations)} 
                className="group flex items-center gap-3 w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-200/50 dark:border-gray-700/50 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-200"
              >
                <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-800/50 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Playlist Duration</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">{duration.normal}</div>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">View all speeds</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-blue-600 dark:text-blue-400 transition-transform duration-200 ${showDurations ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
              
              {showDurations && (
                <div className="mt-3 p-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 transition-all duration-300 hover:shadow-lg">
                  {/* Duration sections side by side */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Total Duration Section */}
                    <div>
                      <h4 className="flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-white mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Total Watch Time
                      </h4>
                      <div className="grid grid-cols-1 gap-4">
                        <div className="flex flex-col p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800/50">
                          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Normal (1x)</span>
                          <span className="text-2xl font-bold text-blue-700 dark:text-blue-300 mt-1">{duration.normal}</span>
                        </div>
                        <div className="flex flex-col p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800/50">
                          <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Fast (1.5x)</span>
                          <span className="text-2xl font-bold text-indigo-700 dark:text-indigo-300 mt-1">{duration.x1_5}</span>
                        </div>
                        <div className="flex flex-col p-4 bg-violet-50 dark:bg-violet-900/20 rounded-xl border border-violet-100 dark:border-violet-800/50">
                          <span className="text-sm font-medium text-violet-600 dark:text-violet-400">Faster (1.75x)</span>
                          <span className="text-2xl font-bold text-violet-700 dark:text-violet-300 mt-1">{duration.x1_75}</span>
                        </div>
                        <div className="flex flex-col p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-100 dark:border-purple-800/50">
                          <span className="text-sm font-medium text-purple-600 dark:text-purple-400">Fastest (2x)</span>
                          <span className="text-2xl font-bold text-purple-700 dark:text-purple-300 mt-1">{duration.x2}</span>
                        </div>
                      </div>
                    </div>

                    {/* Estimated Time Left Section */}
                    {estimatedTimeLeft.minutes > 0 && (
                      <div>
                        <h4 className="flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-white mb-4">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                          Remaining Time
                        </h4>
                        <div className="grid grid-cols-1 gap-4">
                          <div className="flex flex-col p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800/50">
                            <span className="text-sm font-medium text-amber-600 dark:text-amber-400">Normal (1x)</span>
                            <span className="text-2xl font-bold text-amber-700 dark:text-amber-300 mt-1">{estimatedTimeLeft.formatted}</span>
                          </div>
                          <div className="flex flex-col p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-100 dark:border-orange-800/50">
                            <span className="text-sm font-medium text-orange-600 dark:text-orange-400">Fast (1.5x)</span>
                            <span className="text-2xl font-bold text-orange-700 dark:text-orange-300 mt-1">{estimatedTimeLeft.x1_5}</span>
                          </div>
                          <div className="flex flex-col p-4 bg-rose-50 dark:bg-rose-900/20 rounded-xl border border-rose-100 dark:border-rose-800/50">
                            <span className="text-sm font-medium text-rose-600 dark:text-rose-400">Faster (1.75x)</span>
                            <span className="text-2xl font-bold text-rose-700 dark:text-rose-300 mt-1">{estimatedTimeLeft.x1_75}</span>
                          </div>
                          <div className="flex flex-col p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-800/50">
                            <span className="text-sm font-medium text-red-600 dark:text-red-400">Fastest (2x)</span>
                            <span className="text-2xl font-bold text-red-700 dark:text-red-300 mt-1">{estimatedTimeLeft.x2}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Right side - Action buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-3">
            {playlist.isCustomPlaylist ? (
              <button
                onClick={() => setShowAddVideoModal(true)}
                className="px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2 backdrop-blur-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Video
              </button>
            ) : (
              <div className="relative group">
                <button
                  disabled
                  className="px-4 py-2.5 bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-xl text-sm font-medium cursor-not-allowed transition-all duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Video
                </button>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Videos can only be added to custom playlists
                </div>
              </div>
            )}
            
            {/* Sync button for YouTube playlists */}
            {!playlist.isCustomPlaylist && playlist.ytPlaylistId && (
              <button
                onClick={handleSyncWithYouTube}
                disabled={syncStatus.loading}
                className={`px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2 backdrop-blur-sm ${
                  syncStatus.loading ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {syncStatus.loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Syncing...</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Sync with YouTube</span>
                  </>
                )}
              </button>
            )}
            
            <button
              onClick={onMarkAllComplete}
              className="px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2 backdrop-blur-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Mark All Complete
            </button>
            
            <button
              onClick={() => setShowResetConfirmModal(true)}
              disabled={isResetting}
              className={`px-4 py-2.5 ${
                isResetting 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-amber-500 hover:bg-amber-600'
              } text-white rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2 backdrop-blur-sm`}
            >
              {isResetting ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Resetting...</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Reset Progress</span>
                </>
              )}
            </button>
          </div>
        </div>
        
        {/* Stats Row */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 dark:border-gray-600/50 transition-all duration-200 hover:transform hover:scale-105 hover:shadow-lg">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Videos Completed</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {playlist.completedVideos}/{playlist.totalVideos}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 dark:border-gray-600/50 transition-all duration-200 hover:transform hover:scale-105 hover:shadow-lg">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Time Spent</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {formatTimeSpent(totalTimeSpent)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 dark:border-gray-600/50 transition-all duration-200 hover:transform hover:scale-105 hover:shadow-lg">
            <div className="flex items-center">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Notes Created</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {totalNotes}
                </p>
              </div>
            </div>
          </div>
          
          <a
            href={playlist.ytPlaylistUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 dark:border-gray-600/50 transition-all duration-200 hover:transform hover:scale-105 hover:shadow-lg group"
          >
            <div className="flex items-center">
              <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-lg mr-4 group-hover:bg-red-200 dark:group-hover:bg-red-800/50 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-red-600 dark:text-red-400">
                  <path d="M21.593 7.203a2.506 2.506 0 00-1.762-1.766C18.265 5.007 12 5 12 5s-6.264-.007-7.831.404a2.56 2.56 0 00-1.766 1.778c-.413 1.566-.417 4.814-.417 4.814s-.004 3.264.406 4.814c.23.857.905 1.534 1.763 1.765 1.582.43 7.83.437 7.83.437s6.265.007 7.831-.403a2.515 2.515 0 001.767-1.763c.414-1.565.417-4.812.417-4.812s.02-3.265-.407-4.831zM9.996 15.005l.005-6 5.207 3.005-5.212 2.995z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">View on</p>
                <p className="text-xl font-bold text-red-600 dark:text-red-400 group-hover:text-red-700 dark:group-hover:text-red-300 transition-colors">
                  YouTube
                </p>
              </div>
            </div>
          </a>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-8">
          <div className="mb-2 flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Overall Progress</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{playlist.progress}%</span>
          </div>
          <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`absolute left-0 top-0 h-full transition-all duration-500 ease-out rounded-full ${
                playlist.progress === 100 
                  ? 'bg-gradient-to-r from-green-500 to-green-600' 
                  : 'bg-gradient-to-r from-blue-500 to-blue-600'
              }`}
              style={{ width: `${playlist.progress}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Add Video Modal */}
      {showAddVideoModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 relative overflow-hidden transform transition-all duration-300 scale-100 opacity-100">
            <button
              onClick={() => setShowAddVideoModal(false)}
              className="absolute top-4 right-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Add Video to Playlist</h2>
            
            {error && (
              <div className="mb-4 p-2 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <form onSubmit={handleAddVideo}>
              <div className="mb-4">
                <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  YouTube Video URL *
                </label>
                <input
                  type="url"
                  id="videoUrl"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full p-2 border dark:border-gray-700 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="https://www.youtube.com/watch?v=..."
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Enter a YouTube video URL (e.g., https://www.youtube.com/watch?v=VIDEO_ID or https://youtu.be/VIDEO_ID)
                </p>
              </div>
              
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddVideoModal(false)}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Adding...
                    </span>
                  ) : 'Add Video'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Reset Confirm Modal */}
      {showResetConfirmModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 relative overflow-hidden transform transition-all duration-300 scale-100 opacity-100">
            <button
              onClick={() => setShowResetConfirmModal(false)}
              className="absolute top-4 right-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Reset Playlist Progress</h2>
            
            <div className="mb-4 p-4 bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 text-amber-800 dark:text-amber-300">
              <p className="mb-2 font-medium">Are you sure you want to reset this playlist?</p>
              <p className="text-sm">This will mark all videos as "To Watch" but will preserve your notes and other data.</p>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={() => setShowResetConfirmModal(false)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetProgress}
                className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600"
              >
                Reset Progress
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Category Change Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 relative overflow-hidden transform transition-all duration-300 scale-100 opacity-100">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Change Category
            </h3>
            
            {error && (
              <div className="mb-4 p-2 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Category
              </label>
              {loadingCategories ? (
                <div className="flex justify-center items-center py-4">
                  <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              ) : (
                <>
                  <div className="mb-3">
                    <select
                      value={playlist.category}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      {categories && categories.length > 0 ? (
                        categories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))
                      ) : (
                        <option value="">No categories found</option>
                      )}
                    </select>
                  </div>

                  {!showNewCategoryInput ? (
                    <button
                      onClick={() => setShowNewCategoryInput(true)}
                      className="w-full px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-md"
                    >
                      + Add New Category
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={newCategoryInput}
                        onChange={(e) => setNewCategoryInput(e.target.value)}
                        placeholder="Enter new category name"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setShowNewCategoryInput(false);
                            setNewCategoryInput('');
                          }}
                          className="flex-1 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleAddNewCategory}
                          disabled={changingCategory || !newCategoryInput.trim()}
                          className="flex-1 px-3 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
                        >
                          {changingCategory ? 'Adding...' : 'Add Category'}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowCategoryModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 