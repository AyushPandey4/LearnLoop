const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/auth");
const Video = require("../models/Video");
const Playlist = require("../models/Playlist");
const User = require("../models/User");
const Badge = require("../models/Badge");
const { setCache, getCache, deleteCache } = require("../config/redisUtils");
const { generateVideoSummary } = require("../services/aiService");
const { parseTimestamps } = require("../utils/videoUtils");

// Checks if the video exists and belongs to a playlist owned by the user
const hasAccessToVideo = async (videoId, userId) => {
  try {
    const video = await Video.findById(videoId);
    if (!video) return false;

    const playlist = await Playlist.findOne({
      _id: video.playlistId,
      userId: userId,
    });

    return !!playlist;
  } catch (err) {
    return false;
  }
};

/**
 * Checks playlist completion and awards badges
 * - Verifies if all videos in a playlist are completed
 * - Updates playlist completion status
 * - Awards completion badge if not already earned
 * - Updates cache for affected resources
 */
const checkAndAwardCompletionBadge = async (playlistId, userId) => {
  try {
    const videos = await Video.find({ playlistId });

    const allCompleted = videos.every((video) => video.status === "completed");

    if (allCompleted) {
      // Mark playlist as completed
      await Playlist.findByIdAndUpdate(playlistId, { completed: true });

      const playlist = await Playlist.findById(playlistId);

      // Check for existing completion badge
      const existingBadge = await Badge.findOne({
        userId,
        title: `Completed: ${playlist.name}`,
      });

      if (!existingBadge) {
        // Create and award new completion badge
        const badge = new Badge({
          userId,
          title: `Completed: ${playlist.name}`,
          description: `Completed all videos in the "${playlist.name}" playlist`,
          iconUrl: "🏆",
          dateEarned: new Date(),
        });

        await badge.save();

        // Associate badge with user
        await User.findByIdAndUpdate(userId, {
          $push: { badges: badge._id },
        });

        // Invalidate badge cache
        await deleteCache(`badges:${userId}`);
      }

      // Invalidate related caches
      await deleteCache(`playlist:${playlistId}`);
      await deleteCache(`playlists:${userId}`);
    }
  } catch (error) {
    console.error("Error checking playlist completion:", error);
  }
};

// Retrieves all pinned videos across user's playlists
router.get("/pinned", authenticateToken, async (req, res) => {
  try {
    // Retrieve all playlists owned by the user
    const userPlaylists = await Playlist.find({ userId: req.user.id });
    const playlistIds = userPlaylists.map((playlist) => playlist._id);

    // Find all pinned videos in user's playlists
    const pinnedVideos = await Video.find({
      playlistId: { $in: playlistIds },
      pinned: true,
    }).select(
      "title ytId status timeSpent notes thumbnail duration viewCount publishedAt channelTitle description playlistId position"
    );

    if (pinnedVideos.length === 0) {
      return res.json({ videos: [] });
    }

    // Create lookup map for playlist metadata
    const playlistMap = {};
    userPlaylists.forEach((p) => {
      playlistMap[p._id.toString()] = {
        name: p.name,
        category: p.category,
      };
    });

    // Enrich video data with playlist context
    const videosWithPlaylistInfo = pinnedVideos.map((video) => {
      const playlistInfo = playlistMap[video.playlistId.toString()] || {};

      return {
        id: video._id,
        title: video.title,
        ytId: video.ytId,
        status: video.status,
        thumbnail: video.thumbnail,
        duration: video.duration,
        timeSpent: video.timeSpent,
        notes: video.notes,
        viewCount: video.viewCount,
        publishedAt: video.publishedAt,
        channelTitle: video.channelTitle,
        description: video.description,
        position: video.position,
        playlistId: video.playlistId,
        playlistName: playlistInfo.name || "Unknown Playlist",
        playlistCategory: playlistInfo.category || "Uncategorized",
      };
    });

    res.json({ videos: videosWithPlaylistInfo });
  } catch (err) {
    console.error("Error fetching pinned videos:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Retrieves detailed information about a specific video
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const videoId = req.params.id;

    // Check cache for video data
    const cacheKey = `video:${videoId}`;
    const cachedVideo = await getCache(cacheKey);

    if (cachedVideo) {
      return res.json(cachedVideo);
    }

    // Verify user's access to the video
    const hasAccess = await hasAccessToVideo(videoId, req.user.id);
    if (!hasAccess) {
      return res.status(403).json({ msg: "Access denied" });
    }

    // Retrieve video details
    const video = await Video.findById(videoId);

    if (!video) {
      return res.status(404).json({ msg: "Video not found" });
    }

    // Get associated playlist context
    const playlist = await Playlist.findById(video.playlistId).select(
      "name category isCustomPlaylist"
    );

    const result = {
      id: video._id,
      title: video.title,
      ytId: video.ytId,
      status: video.status,
      timeSpent: video.timeSpent,
      notes: video.notes,
      aiSummary: video.aiSummary,
      aiSummaryGenerated: video.aiSummaryGenerated,
      playlistId: video.playlistId,
      playlistName: playlist ? playlist.name : "Unknown",
      playlistCategory: playlist ? playlist.category : "Unknown",
      isCustomPlaylist: playlist ? playlist.isCustomPlaylist : false,
      createdAt: video.createdAt,
      timestamps: video.timestamps || [],
      resources: video.resources || [],
    };

    // Cache the enriched video data
    await setCache(cacheKey, result, 3600);

    res.json(result);
  } catch (err) {
    console.error("Error fetching video:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Update video status
router.patch("/:id/status", authenticateToken, async (req, res) => {
  try {
    const videoId = req.params.id;
    const { status } = req.body;

    // Validate status
    if (
      !status ||
      !["to-watch", "in-progress", "completed", "rewatch"].includes(status)
    ) {
      return res.status(400).json({ msg: "Invalid status value" });
    }

    // Verify user has access to this video
    const hasAccess = await hasAccessToVideo(videoId, req.user.id);
    if (!hasAccess) {
      return res.status(403).json({ msg: "Access denied" });
    }

    // Update video
    const video = await Video.findByIdAndUpdate(
      videoId,
      { status },
      { new: true }
    );

    if (!video) {
      return res.status(404).json({ msg: "Video not found" });
    }

    // If status is completed, check for playlist completion badge
    if (status === "completed") {
      await checkAndAwardCompletionBadge(video.playlistId, req.user.id);
    }

    // Clear cache
    await deleteCache(`video:${videoId}`);
    await deleteCache(`playlist:${video.playlistId}`);

    res.json({ id: video._id, status: video.status });
  } catch (err) {
    console.error("Error updating video status:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Add/update video notes
router.patch("/:id/note", authenticateToken, async (req, res) => {
  try {
    const videoId = req.params.id;
    const { note } = req.body;

    // Validate note
    if (note === undefined) {
      return res.status(400).json({ msg: "Note field is required" });
    }

    // Verify user has access to this video
    const hasAccess = await hasAccessToVideo(videoId, req.user.id);
    if (!hasAccess) {
      return res.status(403).json({ msg: "Access denied" });
    }

    // Update video
    const video = await Video.findByIdAndUpdate(
      videoId,
      { notes: note },
      { new: true }
    );

    if (!video) {
      return res.status(404).json({ msg: "Video not found" });
    }

    // Clear cache
    await deleteCache(`video:${videoId}`);

    res.json({ id: video._id, notes: video.notes });
  } catch (err) {
    console.error("Error updating video notes:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Store time spent on video
router.patch("/:id/time", authenticateToken, async (req, res) => {
  try {
    const videoId = req.params.id;
    const { timeSpent } = req.body;

    // Validate time
    if (
      timeSpent === undefined ||
      typeof timeSpent !== "number" ||
      timeSpent < 0
    ) {
      return res.status(400).json({ msg: "Valid timeSpent value is required" });
    }

    // Verify user has access to this video
    const hasAccess = await hasAccessToVideo(videoId, req.user.id);
    if (!hasAccess) {
      return res.status(403).json({ msg: "Access denied" });
    }

    // Update video
    const video = await Video.findByIdAndUpdate(
      videoId,
      { timeSpent },
      { new: true }
    );

    if (!video) {
      return res.status(404).json({ msg: "Video not found" });
    }

    // Clear cache
    await deleteCache(`video:${videoId}`);

    res.json({ id: video._id, timeSpent: video.timeSpent });
  } catch (err) {
    console.error("Error updating video time spent:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Save AI summary
router.patch("/:id/ai-summary", authenticateToken, async (req, res) => {
  try {
    const videoId = req.params.id;
    const { summary } = req.body;

    // Validate summary
    if (!summary) {
      return res.status(400).json({ msg: "Summary is required" });
    }

    // Verify user has access to this video
    const hasAccess = await hasAccessToVideo(videoId, req.user.id);
    if (!hasAccess) {
      return res.status(403).json({ msg: "Access denied" });
    }

    // Update video
    const video = await Video.findByIdAndUpdate(
      videoId,
      {
        aiSummary: summary,
        aiSummaryGenerated: true,
      },
      { new: true }
    );

    if (!video) {
      return res.status(404).json({ msg: "Video not found" });
    }

    // Clear cache
    await deleteCache(`video:${videoId}`);

    res.json({
      id: video._id,
      aiSummary: video.aiSummary,
      aiSummaryGenerated: video.aiSummaryGenerated,
    });
  } catch (err) {
    console.error("Error updating AI summary:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Copy AI summary to note
router.post("/:id/summary-to-note", authenticateToken, async (req, res) => {
  try {
    const videoId = req.params.id;

    // Verify user has access to this video
    const hasAccess = await hasAccessToVideo(videoId, req.user.id);
    if (!hasAccess) {
      return res.status(403).json({ msg: "Access denied" });
    }

    // Get video
    const video = await Video.findById(videoId);

    if (!video) {
      return res.status(404).json({ msg: "Video not found" });
    }

    // Check if AI summary exists
    if (!video.aiSummary) {
      return res.status(400).json({ msg: "No AI summary available to copy" });
    }

    // Copy AI summary to notes
    video.notes = video.aiSummary;
    await video.save();

    // Clear cache
    await deleteCache(`video:${videoId}`);

    res.json({
      id: video._id,
      notes: video.notes,
    });
  } catch (err) {
    console.error("Error copying AI summary to notes:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Generate AI summary from YouTube transcript
router.post("/:id/generate-summary", authenticateToken, async (req, res) => {
  try {
    const videoId = req.params.id;

    // Verify user has access to this video
    const hasAccess = await hasAccessToVideo(videoId, req.user.id);
    if (!hasAccess) {
      return res.status(403).json({ msg: "Access denied" });
    }

    // Fetch video
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ msg: "Video not found" });
    }

    // Check if a summary has already been generated
    if (video.aiSummaryGenerated && video.aiSummary) {
      return res.json({
        msg: "Summary already exists for this video",
        aiSummary: video.aiSummary,
        aiSummaryGenerated: true,
      });
    }

    // Validate YouTube video ID
    if (!video.ytId) {
      return res.status(400).json({
        msg: "Invalid YouTube video ID",
        error: "INVALID_YOUTUBE_ID",
      });
    }

    // Generate summary from transcript
    try {
      console.log("Attempting to generate summary for video:", video.ytId);
      const summary = await generateVideoSummary(video.ytId, video.title);

      if (!summary) {
        console.error("No summary content returned for video:", video.ytId);
        return res.status(500).json({
          msg: "Failed to generate summary - no content returned",
          error: "NO_SUMMARY_CONTENT",
        });
      }

      // Update video with summary
      video.aiSummary = summary;
      video.aiSummaryGenerated = true;
      await video.save();

      // Clear cache
      await deleteCache(`video:${videoId}`);

      return res.json({
        msg: "Summary generated successfully",
        aiSummary: video.aiSummary,
        aiSummaryGenerated: true,
      });
    } catch (summaryError) {
      console.error("Summary generation error:", summaryError);

      // Handle specific error types
      if (summaryError.message.includes("No transcript available")) {
        return res.status(400).json({
          msg: "No transcript available for this video",
          error: "NO_TRANSCRIPT",
        });
      }

      if (summaryError.message.includes("API key is not configured")) {
        return res.status(500).json({
          msg: "AI service configuration error",
          error: "API_KEY_MISSING",
        });
      }

      if (summaryError.message.includes("Failed to get video transcript")) {
        return res.status(400).json({
          msg: "Could not fetch video transcript",
          error: "TRANSCRIPT_FETCH_FAILED",
        });
      }

      if (summaryError.message.includes("blocked by safety settings")) {
        return res.status(400).json({
          msg: "Content was blocked by AI safety settings",
          error: "CONTENT_BLOCKED",
        });
      }

      // Generic error handling
      console.error("Unhandled error in summary generation:", summaryError);
      return res.status(500).json({
        msg: `Failed to generate summary: ${summaryError.message}`,
        error: "SUMMARY_GENERATION_FAILED",
      });
    }
  } catch (err) {
    console.error("Error in summary generation route:", err);
    res.status(500).json({
      msg: "Server error while processing summary request",
      error: "SERVER_ERROR",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

// Add tags to a video
router.post("/:id/tags", authenticateToken, async (req, res) => {
  try {
    const { tags } = req.body;

    if (!Array.isArray(tags) || tags.length === 0) {
      return res.status(400).json({ msg: "Tags array is required" });
    }

    // Format tags (remove # if present, lowercase, trim)
    const formattedTags = tags
      .map((tag) =>
        tag.startsWith("#")
          ? tag.substring(1).trim().toLowerCase()
          : tag.trim().toLowerCase()
      )
      .filter((tag) => tag.length > 0);

    // Find the video
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({ msg: "Video not found" });
    }

    // Ensure the video belongs to a playlist owned by the user
    const playlist = await Playlist.findOne({
      _id: video.playlistId,
      userId: req.user.id,
    });

    if (!playlist) {
      return res
        .status(403)
        .json({ msg: "Not authorized to update this video" });
    }

    // Add new tags (avoiding duplicates)
    const existingTags = new Set(video.tags || []);
    formattedTags.forEach((tag) => existingTags.add(tag));

    // Update video with new tags
    video.tags = Array.from(existingTags);
    await video.save();

    // Clear cache for this video's playlist
    await deleteCache(`playlist:${video.playlistId}`);

    res.json({
      success: true,
      tags: video.tags,
    });
  } catch (err) {
    console.error("Error adding tags to video:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Remove tags from a video
router.delete("/:id/tags", authenticateToken, async (req, res) => {
  try {
    const { tags } = req.body;

    if (!Array.isArray(tags) || tags.length === 0) {
      return res.status(400).json({ msg: "Tags array is required" });
    }

    // Format tags (remove # if present, lowercase, trim)
    const tagsToRemove = tags.map((tag) =>
      tag.startsWith("#")
        ? tag.substring(1).trim().toLowerCase()
        : tag.trim().toLowerCase()
    );

    // Find the video
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({ msg: "Video not found" });
    }

    // Ensure the video belongs to a playlist owned by the user
    const playlist = await Playlist.findOne({
      _id: video.playlistId,
      userId: req.user.id,
    });

    if (!playlist) {
      return res
        .status(403)
        .json({ msg: "Not authorized to update this video" });
    }

    // Remove specified tags
    video.tags = (video.tags || []).filter(
      (tag) => !tagsToRemove.includes(tag)
    );
    await video.save();

    // Clear cache for this video's playlist
    await deleteCache(`playlist:${video.playlistId}`);

    res.json({
      success: true,
      tags: video.tags,
    });
  } catch (err) {
    console.error("Error removing tags from video:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Search for videos with matching tags
router.get("/search/tags", authenticateToken, async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim() === "") {
      return res.status(400).json({ msg: "Search query is required" });
    }

    // Get all playlists for this user
    const userPlaylists = await Playlist.find({ userId: req.user.id });
    const playlistIds = userPlaylists.map((playlist) => playlist._id);

    // Find videos with tags containing the query string
    // Using case-insensitive search with regex
    const videos = await Video.find({
      playlistId: { $in: playlistIds },
      tags: { $regex: query, $options: "i" },
    })
      .select(
        "title ytId status timeSpent notes thumbnail duration viewCount tags playlistId"
      )
      .limit(100); // Limit results to prevent overwhelming response

    // Get playlist info for each video
    const playlistMap = {};
    for (const vid of videos) {
      if (!playlistMap[vid.playlistId]) {
        const pl = await Playlist.findById(vid.playlistId).select("name");
        playlistMap[vid.playlistId] = pl ? pl.name : "Unknown Playlist";
      }
    }

    // Format response
    const formattedVideos = videos.map((video) => ({
      id: video._id,
      title: video.title,
      ytId: video.ytId,
      status: video.status,
      timeSpent: video.timeSpent,
      notes: video.notes,
      thumbnail: video.thumbnail,
      duration: video.duration,
      viewCount: video.viewCount,
      tags: video.tags || [],
      playlistId: video.playlistId,
      playlistName: playlistMap[video.playlistId],
    }));

    res.json({
      count: formattedVideos.length,
      videos: formattedVideos,
    });
  } catch (err) {
    console.error("Error searching tags:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Add a resource to a video
router.post("/:id/resources", authenticateToken, async (req, res) => {
  try {
    const { title, url, type } = req.body;

    // Validate request
    if (!title || !url) {
      return res.status(400).json({ msg: "Title and URL are required" });
    }

    // Find the video
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({ msg: "Video not found" });
    }

    // Ensure the video belongs to a playlist owned by the user
    const playlist = await Playlist.findOne({
      _id: video.playlistId,
      userId: req.user.id,
    });

    if (!playlist) {
      return res
        .status(403)
        .json({ msg: "Not authorized to update this video" });
    }

    // Create new resource
    const newResource = {
      title,
      url,
      type: type || "other",
    };

    // Add resource to video
    video.resources.push(newResource);
    await video.save();

    // Clear cache
    await deleteCache(`video:${video._id}`);

    res.json({
      success: true,
      resources: video.resources,
    });
  } catch (err) {
    console.error("Error adding resource to video:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Delete a resource from a video
router.delete(
  "/:id/resources/:resourceId",
  authenticateToken,
  async (req, res) => {
    try {
      // Find the video
      const video = await Video.findById(req.params.id);

      if (!video) {
        return res.status(404).json({ msg: "Video not found" });
      }

      // Ensure the video belongs to a playlist owned by the user
      const playlist = await Playlist.findOne({
        _id: video.playlistId,
        userId: req.user.id,
      });

      if (!playlist) {
        return res
          .status(403)
          .json({ msg: "Not authorized to update this video" });
      }

      // Find the resource by its MongoDB ObjectId
      const resourceIndex = video.resources.findIndex(
        (resource) => resource._id.toString() === req.params.resourceId
      );

      if (resourceIndex === -1) {
        return res.status(404).json({ msg: "Resource not found" });
      }

      // Remove the resource
      video.resources.splice(resourceIndex, 1);
      await video.save();

      // Clear cache
      await deleteCache(`video:${video._id}`);

      res.json({
        success: true,
        resources: video.resources,
      });
    } catch (err) {
      console.error("Error deleting resource from video:", err);
      res.status(500).json({ msg: "Server error" });
    }
  }
);

// Update a resource
router.put(
  "/:id/resources/:resourceId",
  authenticateToken,
  async (req, res) => {
    try {
      const { title, url, type } = req.body;

      // Find the video
      const video = await Video.findById(req.params.id);

      if (!video) {
        return res.status(404).json({ msg: "Video not found" });
      }

      // Ensure the video belongs to a playlist owned by the user
      const playlist = await Playlist.findOne({
        _id: video.playlistId,
        userId: req.user.id,
      });

      if (!playlist) {
        return res
          .status(403)
          .json({ msg: "Not authorized to update this video" });
      }

      // Find the resource by its MongoDB ObjectId
      const resourceIndex = video.resources.findIndex(
        (resource) => resource._id.toString() === req.params.resourceId
      );

      if (resourceIndex === -1) {
        return res.status(404).json({ msg: "Resource not found" });
      }

      // Update the resource
      if (title) video.resources[resourceIndex].title = title;
      if (url) video.resources[resourceIndex].url = url;
      if (type) video.resources[resourceIndex].type = type;

      await video.save();

      // Clear cache
      await deleteCache(`video:${video._id}`);

      res.json({
        success: true,
        resources: video.resources,
      });
    } catch (err) {
      console.error("Error updating resource:", err);
      res.status(500).json({ msg: "Server error" });
    }
  }
);

// Search for videos with matching notes content
router.get("/search/notes", authenticateToken, async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim() === "") {
      return res.status(400).json({ msg: "Search query is required" });
    }

    // Get all playlists for this user
    const userPlaylists = await Playlist.find({ userId: req.user.id });
    const playlistIds = userPlaylists.map((playlist) => playlist._id);

    // Find videos with notes containing the query string
    // Using case-insensitive search with regex
    const videos = await Video.find({
      playlistId: { $in: playlistIds },
      notes: { $regex: query, $options: "i" },
    })
      .select(
        "title ytId status timeSpent notes thumbnail duration viewCount tags playlistId"
      )
      .limit(100); // Limit results to prevent overwhelming response

    // Get playlist info for each video
    const playlistMap = {};
    for (const vid of videos) {
      if (!playlistMap[vid.playlistId]) {
        const pl = await Playlist.findById(vid.playlistId).select("name");
        playlistMap[vid.playlistId] = pl ? pl.name : "Unknown Playlist";
      }
    }

    // Format response
    const formattedVideos = videos.map((video) => ({
      id: video._id,
      title: video.title,
      ytId: video.ytId,
      status: video.status,
      timeSpent: video.timeSpent,
      // Include a snippet of the matched notes with context
      notes:
        video.notes && video.notes.length > 300
          ? highlightMatchedText(video.notes, query, 300)
          : video.notes,
      thumbnail: video.thumbnail,
      duration: video.duration,
      viewCount: video.viewCount,
      tags: video.tags || [],
      playlistId: video.playlistId,
      playlistName: playlistMap[video.playlistId],
    }));

    res.json({
      count: formattedVideos.length,
      videos: formattedVideos,
    });
  } catch (err) {
    console.error("Error searching notes:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Create a snippet of text with the matched query highlighted
function highlightMatchedText(text, query, maxLength) {
  // Find the first occurrence of the query (case insensitive)
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const index = lowerText.indexOf(lowerQuery);

  if (index === -1) {
    // If not found (which shouldn't happen), return the beginning of the text
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  }

  // Calculate start and end positions for the snippet
  let start = Math.max(0, index - 100);
  let end = Math.min(text.length, index + query.length + 100);

  // Adjust if the snippet would be too long
  if (end - start > maxLength) {
    const halfLength = Math.floor(maxLength / 2);
    start = Math.max(0, index - halfLength);
    end = Math.min(text.length, index + query.length + halfLength);
  }

  // Add ellipsis if we're not at the beginning/end of the full text
  let snippet = "";
  if (start > 0) snippet += "...";
  snippet += text.substring(start, end);
  if (end < text.length) snippet += "...";

  return snippet;
}

// Add a new video
router.post("/", authenticateToken, async (req, res) => {
  try {
    const {
      playlistId,
      ytId,
      title,
      description,
      thumbnail,
      duration,
      viewCount,
      likeCount,
      publishedAt,
      channelTitle,
    } = req.body;

    // Check if playlist exists and is custom
    const playlist = await Playlist.findOne({
      _id: playlistId,
      userId: req.user.id,
    });

    if (!playlist) {
      return res.status(404).json({ msg: "Playlist not found" });
    }

    if (!playlist.isCustomPlaylist) {
      return res
        .status(403)
        .json({ msg: "Cannot add videos to non-custom playlists" });
    }

    // Parse timestamps from description
    const timestamps = parseTimestamps(description);

    const video = new Video({
      playlistId,
      ytId,
      title,
      description,
      thumbnail,
      duration,
      viewCount,
      likeCount,
      publishedAt,
      channelTitle,
      timestamps,
    });

    await video.save();

    // Add video to playlist's videos array
    playlist.videos.push(video._id);
    await playlist.save();

    res.status(201).json(video);
  } catch (err) {
    console.error("Error adding video:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Remove a video from a custom playlist
router.delete(
  "/:id/remove-from-playlist",
  authenticateToken,
  async (req, res) => {
    try {
      const videoId = req.params.id;

      // Find the video
      const video = await Video.findById(videoId);

      if (!video) {
        return res.status(404).json({ msg: "Video not found" });
      }

      // Find the playlist
      const playlist = await Playlist.findOne({
        _id: video.playlistId,
        userId: req.user.id,
      });

      if (!playlist) {
        return res.status(404).json({ msg: "Playlist not found" });
      }

      // Check if it's a custom playlist
      if (!playlist.isCustomPlaylist) {
        return res
          .status(403)
          .json({ msg: "Cannot remove videos from non-custom playlists" });
      }

      // Remove video from playlist's videos array
      playlist.videos = playlist.videos.filter(
        (vid) => vid.toString() !== videoId
      );
      await playlist.save();

      // Delete the video
      await Video.findByIdAndDelete(videoId);

      // Clear cache
      await deleteCache(`video:${videoId}`);
      await deleteCache(`playlist:${playlist._id}`);

      res.json({
        success: true,
        msg: "Video removed from playlist successfully",
      });
    } catch (err) {
      console.error("Error removing video from playlist:", err);
      res.status(500).json({ msg: "Server error" });
    }
  }
);

module.exports = router;
