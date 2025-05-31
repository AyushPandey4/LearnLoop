'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export default function PlaylistGrid({ playlists, onDelete }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  const handleDeleteClick = (id) => {
    setDeletingId(id);
    setConfirmDelete(true);
  };

  const confirmDeletePlaylist = async () => {
    try {
      await onDelete(deletingId);
      setConfirmDelete(false);
      setDeletingId(null);
    } catch (error) {
      console.error('Error deleting playlist:', error.message);
    }
  };

  const navigateToPlaylist = (playlistId) => {
    router.push(`/playlist/${playlistId}`);
  };

  const handleCategoryClick = async (playlist) => {
    setSelectedPlaylist(playlist);
    setShowCategoryModal(true);
    await fetchCategories();
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const response = await axios.get(`${API_URL}/api/user/categories`);
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = async (category) => {
    if (!category || category === selectedPlaylist.category) {
      setShowCategoryModal(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      await axios.patch(
        `${API_URL}/api/playlist/${selectedPlaylist.id}/category`,
        { category }
      );

      // Update the playlist in the local state
      const updatedPlaylists = playlists.map(p => 
        p.id === selectedPlaylist.id ? { ...p, category } : p
      );
      // You'll need to implement a way to update the parent component's state
      // This could be through a callback prop like onPlaylistUpdate

      toast.success('Category updated successfully');
      setShowCategoryModal(false);
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Failed to update category');
    }
  };

  const handleAddNewCategory = async () => {
    if (!newCategory.trim()) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      await axios.post(
        `${API_URL}/api/user/category`,
        { category: newCategory }
      );

      await fetchCategories();
      setNewCategory('');
      toast.success('Category added successfully');
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error('Failed to add category');
    }
  };

  // Format minutes as hours and minutes
  const formatTime = (minutes) => {
    if (!minutes) return '0 min';
    
    if (minutes < 60) return `${minutes} min`;
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    return `${hours}h${mins > 0 ? ` ${mins}m` : ''}`;
  };

  // Format view count with K, M abbreviations
  const formatViewCount = (viewCount) => {
    if (!viewCount) return '0 views';
    
    if (viewCount < 1000) return `${viewCount} views`;
    if (viewCount < 1000000) return `${(viewCount / 1000).toFixed(1)}K views`;
    return `${(viewCount / 1000000).toFixed(1)}M views`;
  };

  if (playlists.length === 0) {
    return (
      <div className="text-center py-16 bg-gray-800/50 rounded-xl backdrop-blur-sm border border-gray-700/50 transition-all duration-300">
        <div className="transform hover:scale-105 transition-transform duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-20 h-20 mx-auto text-gray-500 mb-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-200 mb-3">No Playlists Found</h3>
        <p className="text-gray-400 max-w-md mx-auto mb-8">
          You haven't added any playlists yet. Click the "Add Playlist" button to get started.
        </p>
        <button 
          onClick={() => window.dispatchEvent(new CustomEvent('open-add-playlist'))}
          className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add Your First Playlist
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {playlists.map((playlist) => {
          const playlistId = playlist.id || playlist._id || `playlist-${playlist.name}-${Math.random().toString(36).substring(2, 9)}`;
          
          return (
            <div
              key={playlistId}
              className="group bg-gray-800/50 rounded-xl backdrop-blur-sm border border-gray-700/50 overflow-hidden hover:border-blue-500/50 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl"
            >
              {/* Playlist Header */}
              <div className="p-5 border-b border-gray-700/50">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-white text-lg truncate group-hover:text-blue-400 transition-colors duration-300">
                    {playlist.name}
                  </h3>
                  <button
                    onClick={() => handleCategoryClick(playlist)}
                    className="text-gray-400 hover:text-blue-400 transition-colors duration-300"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-900/50 text-blue-300 border border-blue-700/50">
                    {playlist.category || 'Uncategorized'}
                  </span>
                  <span className="text-sm text-gray-400 font-medium">
                    {playlist.totalVideos || 0} videos
                  </span>
                </div>
              </div>

              {/* Thumbnails Preview */}
              {playlist.thumbnails && playlist.thumbnails.length > 0 ? (
                <div className="relative h-48 overflow-hidden">
                  <div className="absolute inset-0 group-hover:scale-110 transition-transform duration-700">
                    <img 
                      src={playlist.thumbnails[0].thumbnail || null} 
                      alt={playlist.thumbnails[0].title}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
                    {playlist.thumbnails[0].viewCount && (
                      <div className="absolute bottom-3 right-3 bg-black/80 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                        {formatViewCount(playlist.thumbnails[0].viewCount)}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="h-48 bg-gray-700/50 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
              )}

              {/* Progress Info */}
              <div className="p-5 space-y-4">
                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-300 flex items-center gap-2">
                      {playlist.progress === 100 ? (
                        <span className="text-green-400">✓ Completed</span>
                      ) : (
                        <span className="text-blue-400">In Progress</span>
                      )}
                      <span className="text-gray-400">
                        {playlist.completedVideos || 0}/{playlist.totalVideos || 0} videos
                      </span>
                    </span>
                    <span className="text-sm font-medium text-gray-300">
                      {playlist.progress || 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        playlist.progress === 100
                          ? 'bg-gradient-to-r from-green-500 to-green-400'
                          : 'bg-gradient-to-r from-blue-600 to-blue-400'
                      }`}
                      style={{ width: `${playlist.progress || 0}%` }}
                    ></div>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col items-center p-2 rounded-lg bg-gray-700/30 hover:bg-gray-700/50 transition-colors duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm text-gray-300">{formatTime(playlist.totalTimeSpent || 0)}</span>
                  </div>
                  
                  <div className="flex flex-col items-center p-2 rounded-lg bg-gray-700/30 hover:bg-gray-700/50 transition-colors duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    <span className="text-sm text-gray-300">{playlist.notesCount || 0} notes</span>
                  </div>

                  <div className="flex flex-col items-center p-2 rounded-lg bg-gray-700/30 hover:bg-gray-700/50 transition-colors duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span className="text-sm text-gray-300">{playlist.rewatchCount || 0} rewatch</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => navigateToPlaylist(playlistId)}
                    className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Open Playlist
                  </button>
                  <button
                    onClick={() => handleDeleteClick(playlistId)}
                    className="p-2.5 bg-gray-700 hover:bg-red-600/20 text-gray-400 hover:text-red-400 rounded-lg transition-all duration-300 group/delete"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform group-hover/delete:scale-110 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Category Change Modal - Enhanced */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl shadow-2xl p-6 max-w-md w-full m-4 border border-gray-700/50">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              Change Category
            </h3>
            
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-400"></div>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Select Category
                  </label>
                  <select
                    className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    value={selectedPlaylist?.category || ''}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                  >
                    <option value="">Uncategorized</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Add New Category
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="flex-1 px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      placeholder="Enter new category"
                    />
                    <button
                      onClick={handleAddNewCategory}
                      className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      Add
                    </button>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowCategoryModal(false)}
                    className="px-6 py-2.5 text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-lg transition-all duration-300"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal - Enhanced */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl shadow-2xl p-6 max-w-md w-full m-4 border border-gray-700/50">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-600/20 text-red-400 mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              
              <h3 className="text-xl font-semibold text-white mb-3">
                Delete Playlist
              </h3>
              <p className="text-gray-400 mb-8">
                Are you sure you want to delete this playlist? This action cannot be undone and all associated data will be permanently removed.
              </p>
              
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => {
                    setConfirmDelete(false);
                    setDeletingId(null);
                  }}
                  className="px-6 py-2.5 text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-lg transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeletePlaylist}
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Playlist
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 