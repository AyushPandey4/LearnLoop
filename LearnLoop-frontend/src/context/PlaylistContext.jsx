"use client";

import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

const PlaylistContext = createContext();
const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export function PlaylistProvider({ children }) {
  const { user } = useAuth();
  const [playlists, setPlaylists] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    if (user) {
      fetchPlaylists();
      fetchCategories();
    }
  }, [user]);

  const fetchPlaylists = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/playlist`);
      setPlaylists(response.data || []);
    } catch (error) {
      console.error("Error fetching playlists:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/user/categories`);
      setCategories(response.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error.message);
    }
  };

  const addPlaylist = async (playlistData) => {
    try {
      // Make sure name is provided
      if (!playlistData.name) {
        return {
          success: false,
          message: "Playlist name is required",
        };
      }

      // If not a custom playlist, validate YouTube URL
      if (!playlistData.isCustomPlaylist && !playlistData.ytPlaylistUrl) {
        return {
          success: false,
          message: "YouTube playlist URL is required",
        };
      }

      const response = await axios.post(
        `${API_URL}/api/playlist/add`,
        playlistData
      );

      // After successfully adding, refresh the playlists list
      await fetchPlaylists();

      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error adding playlist:", error);

      if (error.response && error.response.data && error.response.data.msg) {
        return {
          success: false,
          message: error.response.data.msg,
        };
      }

      return {
        success: false,
        message:
          "Failed to add playlist. Please check your input and try again.",
      };
    }
  };

  const deletePlaylist = async (playlistId) => {
    try {
      await axios.delete(`${API_URL}/api/playlist/${playlistId}`);
      setPlaylists(playlists.filter((playlist) => playlist._id !== playlistId));
      return { success: true };
    } catch (error) {
      console.error("Error deleting playlist:", error.message);
      return { success: false, message: "Failed to delete playlist" };
    }
  };

  const addCategory = async (categoryName) => {
    try {
      const response = await axios.post(`${API_URL}/api/user/category`, {
        category: categoryName,
      });
      setCategories(response.data);
      return { success: true };
    } catch (error) {
      console.error("Error adding category:", error.message);
      return { success: false, message: "Failed to add category" };
    }
  };

  const renameCategory = async (oldCategoryName, newCategoryName) => {
    try {
      const response = await axios.put(`${API_URL}/api/user/category`, {
        oldCategory: oldCategoryName,
        newCategory: newCategoryName,
      });

      setCategories(response.data);

      if (activeCategory === oldCategoryName) {
        setActiveCategory(newCategoryName);
      }

      await fetchPlaylists();

      return { success: true };
    } catch (error) {
      console.error("Error renaming category:", error.message);
      const errorMessage =
        error.response?.data?.msg || "Failed to rename category";
      return { success: false, message: errorMessage };
    }
  };

  const deleteCategory = async (
    categoryName,
    deleteAssociatedPlaylists = false
  ) => {
    try {
      const response = await axios.delete(
        `${API_URL}/api/user/category/${categoryName}?deleteAssociatedPlaylists=${deleteAssociatedPlaylists}`
      );

      setCategories(response.data.categories);

      if (response.data.deletedPlaylistsCount > 0) {
        await fetchPlaylists();
      }

      if (activeCategory === categoryName) {
        setActiveCategory("all");
      }

      return {
        success: true,
        deletedPlaylistsCount: response.data.deletedPlaylistsCount,
      };
    } catch (error) {
      console.error("Error deleting category:", error.message);

      if (error.response?.data?.hasPlaylists) {
        return {
          success: false,
          message: error.response.data.msg,
          hasPlaylists: true,
          playlistCount: error.response.data.count,
        };
      }

      const errorMessage =
        error.response?.data?.msg || "Failed to delete category";
      return { success: false, message: errorMessage };
    }
  };

  const getFilteredPlaylists = () => {
    if (activeCategory === "all") return playlists;
    return playlists.filter((playlist) => playlist.category === activeCategory);
  };

  const addVideoToPlaylist = async (playlistId, videoUrl) => {
    // console.log("PlaylistContext: Adding video to playlist", {
    //   playlistId,
    //   videoUrl,
    // });

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Authentication required");
        return { success: false, message: "Authentication required" };
      }

      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // console.log(
      //   "Calling API endpoint:",
      //   `${API_URL}/api/playlist/${playlistId}/add-video`
      // );
      const response = await axios.post(
        `${API_URL}/api/playlist/${playlistId}/add-video`,
        { videoUrl }
      );
      // console.log("API response:", response.data);

      await fetchPlaylists();

      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error adding video to playlist:", error);
      console.error("Error response:", error.response?.data);

      if (error.response && error.response.data && error.response.data.msg) {
        return {
          success: false,
          message: error.response.data.msg,
        };
      }

      return {
        success: false,
        message: "Failed to add video. Please check the URL and try again.",
      };
    }
  };

  return (
    <PlaylistContext.Provider
      value={{
        playlists,
        categories,
        loading,
        activeCategory,
        setActiveCategory,
        getFilteredPlaylists,
        addPlaylist,
        deletePlaylist,
        addCategory,
        renameCategory,
        deleteCategory,
        addVideoToPlaylist,
        refreshPlaylists: fetchPlaylists,
      }}
    >
      {children}
    </PlaylistContext.Provider>
  );
}

export function usePlaylist() {
  const context = useContext(PlaylistContext);
  if (!context) {
    throw new Error("usePlaylist must be used within a PlaylistProvider");
  }
  return context;
}
