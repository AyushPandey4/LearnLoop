'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export default function PinnedVideosWidget() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [pinnedVideos, setPinnedVideos] = useState([]);
  const [error, setError] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  
  useEffect(() => {
    // Fetch pinned videos whenever the component mounts, 
    // the user changes, or the path changes
    fetchPinnedVideos();
  }, [user, pathname]);
  
  const fetchPinnedVideos = async () => {
    try {
      setLoading(true);
      
      // Get token
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required. Please log in.');
        setLoading(false);
        return;
      }
      
      // Make API request with the token in the header
      const response = await axios.get(`${API_URL}/api/video/pinned`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setPinnedVideos(response.data.videos || []);
      setError(''); // Clear any previous errors
      
    } catch (err) {
      console.error('Error fetching pinned videos:', err);
      
      // More detailed error message based on error type
      if (err.response) {
        // Server responded with an error status code
        if (err.response.status === 401 || err.response.status === 403) {
          setError('Authentication error. Please log in again.');
          // Don't remove token here, let the AuthContext handle auth errors
        } else {
          setError(`Error loading pinned videos. Please try again later.`);
        }
      } else if (err.request) {
        // Request was made but no response received
        setError('No response from server. Please check your connection.');
      } else {
        // Something else caused the error
        setError('Failed to load pinned videos');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Format duration from ISO 8601 format
  const formatDuration = (isoDuration) => {
    if (!isoDuration) return '';
    
    // Parse ISO 8601 duration
    const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return '';
    
    const hours = parseInt(match[1] || 0);
    const minutes = parseInt(match[2] || 0);
    const seconds = parseInt(match[3] || 0);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
  };
  
  if (loading) {
    return (
      <div className="rounded-xl overflow-hidden">
        <div className="p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📌</span>
            <h3 className="text-xl font-semibold text-amber-400">
              Pinned Videos
            </h3>
          </div>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-400"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="rounded-xl overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col items-center">
            <p className="text-red-400 mb-4">{error}</p>
            <button 
              onClick={fetchPinnedVideos}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors duration-200 text-sm font-medium"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  if (pinnedVideos.length === 0) {
    return (
      <div className="rounded-xl overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">📌</span>
            <h3 className="text-xl font-semibold text-amber-400">
              Pinned Videos
            </h3>
          </div>
          <div className="text-center text-gray-400">
            <p className="mb-2">No pinned videos yet</p>
            <p className="text-sm text-gray-500">Pin important videos from your playlists for quick access</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="rounded-xl overflow-hidden">
      {/* Header */}
      <div 
        className="p-6 flex justify-between items-center cursor-pointer group transition-colors duration-200 hover:bg-gray-800/50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl group-hover:scale-110 transition-transform duration-200">📌</span>
          <h3 className="text-xl font-semibold text-amber-400">
            Pinned Videos ({pinnedVideos.length})
          </h3>
        </div>
        <button className="text-amber-400 transition-transform duration-200 hover:scale-110">
          {isExpanded ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          )}
        </button>
      </div>

      {/* Video List */}
      {isExpanded && (
        <div className="px-6 pb-6">
          <div className="space-y-4">
            {pinnedVideos.map(video => (
              <div 
                key={video.id} 
                className="flex items-center bg-amber-900/10 rounded-lg overflow-hidden transition-transform duration-200 hover:scale-[1.02] hover:shadow-lg"
              >
                <div className="w-32 h-20 relative flex-shrink-0">
                  <img 
                    src={video.thumbnail || `https://img.youtube.com/vi/${video.ytId}/mqdefault.jpg`}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  {video.duration && (
                    <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded font-medium">
                      {formatDuration(video.duration)}
                    </div>
                  )}
                  <div className="absolute top-1 right-1 bg-amber-500 text-white p-1 rounded-full shadow-md">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M4.146.146A.5.5 0 0 1 4.5 0h7a.5.5 0 0 1 .5.5c0 .68-.342 1.174-.646 1.479-.126.125-.25.224-.354.298v4.431l.078.048c.203.127.476.314.751.555C12.36 7.775 13 8.527 13 9.5a.5.5 0 0 1-.5.5h-4v4.5c0 .276-.224 1.5-.5 1.5s-.5-1.224-.5-1.5V10h-4a.5.5 0 0 1-.5-.5c0-.973.64-1.725 1.17-2.189A5.921 5.921 0 0 1 5 6.708V2.277a2.77 2.77 0 0 1-.354-.298C4.342 1.674 4 1.179 4 .5a.5.5 0 0 1 .146-.354z"/>
                    </svg>
                  </div>
                </div>

                <div className="flex-1 p-4 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="text-base font-medium text-white line-clamp-1">
                      {video.title}
                    </h4>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      video.status === 'completed' 
                        ? 'bg-green-900/30 text-green-300' 
                        : video.status === 'in-progress'
                          ? 'bg-blue-900/30 text-blue-300'
                          : video.status === 'rewatch'
                            ? 'bg-purple-900/30 text-purple-300'
                            : 'bg-gray-700 text-gray-200'
                    }`}>
                      {video.status === 'completed' ? 'Completed' : 
                       video.status === 'in-progress' ? 'In Progress' :
                       video.status === 'rewatch' ? 'Rewatch' : 'To Watch'}
                    </span>
                  </div>

                  <div className="mt-2 text-sm text-gray-400">
                    <span className="font-medium text-amber-400">{video.playlistName}</span>
                  </div>

                  <div className="mt-2 flex items-center gap-4">
                    <Link 
                      href={`/video/${video.id}`}
                      className="text-sm text-blue-400 hover:text-blue-300 transition-colors duration-200 flex items-center gap-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                      Go to Video
                    </Link>
                    <a
                      href={`https://youtube.com/watch?v=${video.ytId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-red-400 hover:text-red-300 transition-colors duration-200 flex items-center gap-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                      </svg>
                      Watch on YouTube
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 