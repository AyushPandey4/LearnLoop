const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/auth");
const User = require("../models/User");
const Playlist = require("../models/Playlist");
const Video = require("../models/Video");
const { setCache, getCache, deleteCache } = require("../config/redisUtils");

router.post("/category", authenticateToken, async (req, res) => {
  try {
    const { category } = req.body;

    if (!category) {
      return res.status(400).json({ msg: "Category name is required" });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Prevent duplicate categories
    if (user.categories.includes(category)) {
      return res.status(400).json({ msg: "Category already exists" });
    }

    user.categories.push(category);
    await user.save();

    // Invalidate and update relevant caches
    await deleteCache(`user:${user.id}`);
    await deleteCache(`categories:${user.id}`);
    await setCache(`categories:${user.id}`, user.categories, 86400);

    res.json(user.categories);
  } catch (err) {
    console.error("Error creating category:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

router.get("/categories", authenticateToken, async (req, res) => {
  try {
    const cachedCategories = await getCache(`categories:${req.user.id}`);

    if (cachedCategories) {
      return res.json(cachedCategories);
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    await setCache(`categories:${user.id}`, user.categories, 86400);

    res.json(user.categories);
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// rename category
router.put("/category", authenticateToken, async (req, res) => {
  try {
    const { oldCategory, newCategory } = req.body;

    if (!oldCategory || !newCategory) {
      return res
        .status(400)
        .json({ msg: "Both old and new category names are required" });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (!user.categories.includes(oldCategory)) {
      return res.status(400).json({ msg: "Category does not exist" });
    }

    if (user.categories.includes(newCategory)) {
      return res.status(400).json({ msg: "New category name already exists" });
    }

    // Update category name in user's categories
    const categoryIndex = user.categories.indexOf(oldCategory);
    user.categories[categoryIndex] = newCategory;
    await user.save();

    // Update category name in all associated playlists
    await Playlist.updateMany(
      { userId: req.user.id, category: oldCategory },
      { category: newCategory }
    );

    // Invalidate and update relevant caches
    await deleteCache(`user:${user.id}`);
    await deleteCache(`categories:${user.id}`);
    await deleteCache(`playlists:${user.id}`);
    await setCache(`categories:${user.id}`, user.categories, 86400);

    res.json(user.categories);
  } catch (err) {
    console.error("Error renaming category:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

router.delete(
  "/category/:categoryName",
  authenticateToken,
  async (req, res) => {
    try {
      const categoryName = req.params.categoryName;
      const deleteAssociatedPlaylists =
        req.query.deleteAssociatedPlaylists === "true";

      if (!categoryName) {
        return res.status(400).json({ msg: "Category name is required" });
      }

      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(404).json({ msg: "User not found" });
      }

      if (!user.categories.includes(categoryName)) {
        return res.status(400).json({ msg: "Category does not exist" });
      }

      // Check for playlists in this category
      const playlistsWithCategory = await Playlist.find({
        userId: req.user.id,
        category: categoryName,
      });

      const playlistCount = playlistsWithCategory.length;

      if (playlistCount > 0 && !deleteAssociatedPlaylists) {
        return res.status(400).json({
          msg: "This category has associated playlists. Set deleteAssociatedPlaylists=true to delete them along with the category.",
          hasPlaylists: true,
          count: playlistCount,
        });
      }

      // Handle associated playlist deletion if requested
      if (deleteAssociatedPlaylists && playlistCount > 0) {
        const playlistIds = playlistsWithCategory.map(
          (playlist) => playlist._id
        );

        // Remove playlist references from user
        user.playlists = user.playlists.filter(
          (id) => !playlistIds.some((playlistId) => playlistId.equals(id))
        );

        // Cascade delete associated videos
        for (const playlist of playlistsWithCategory) {
          await Video.deleteMany({ playlistId: playlist._id });
        }

        // Delete the playlists
        await Playlist.deleteMany({
          userId: req.user.id,
          category: categoryName,
        });
      }

      // Remove the category
      user.categories = user.categories.filter((cat) => cat !== categoryName);
      await user.save();

      // Invalidate and update relevant caches
      await deleteCache(`user:${user.id}`);
      await deleteCache(`categories:${user.id}`);
      await deleteCache(`playlists:${user.id}`);
      await setCache(`categories:${user.id}`, user.categories, 86400);

      res.json({
        categories: user.categories,
        deletedPlaylistsCount: deleteAssociatedPlaylists ? playlistCount : 0,
      });
    } catch (err) {
      console.error("Error deleting category:", err);
      res.status(500).json({ msg: "Server error" });
    }
  }
);

router.post("/daily-goal", authenticateToken, async (req, res) => {
  try {
    const { dailyGoal } = req.body;

    if (dailyGoal === undefined) {
      return res.status(400).json({ msg: "Daily goal is required" });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { dailyGoal },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Update cache
    await deleteCache(`user:${user.id}`);
    await setCache(`daily-goal:${user.id}`, user.dailyGoal, 86400);

    res.json({ dailyGoal: user.dailyGoal });
  } catch (err) {
    console.error("Error updating daily goal:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

router.get("/daily-goal", authenticateToken, async (req, res) => {
  try {
    const cachedDailyGoal = await getCache(`daily-goal:${req.user.id}`);

    if (cachedDailyGoal !== null) {
      return res.json({ dailyGoal: cachedDailyGoal });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    await setCache(`daily-goal:${user.id}`, user.dailyGoal, 86400);

    res.json({ dailyGoal: user.dailyGoal });
  } catch (err) {
    console.error("Error fetching daily goal:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
