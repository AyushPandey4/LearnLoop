const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const authenticateToken = require("../middleware/auth");
const User = require("../models/User");
const { setCache, getCache } = require("../config/redisUtils");

const JWT_SECRET = process.env.JWT_SECRET;
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post("/google", async (req, res) => {
  const { tokenId, userData } = req.body;

  try {
    let email, name, picture;

    if (userData && userData.email) {
      ({ email, name, picture } = {
        email: userData.email,
        name: userData.name,
        picture: userData.picture,
      });
    } else if (tokenId) {
      const ticket = await client.verifyIdToken({
        idToken: tokenId,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      ({ name, email, picture } = ticket.getPayload());
    } else {
      return res
        .status(400)
        .json({ msg: "No valid authentication data provided" });
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        name,
        email,
        avatar: picture,
        categories: ["Uncategorized"],
        dailyGoal: "",
      });
      await user.save();
    } else if (user.avatar !== picture) {
      // Update user's avatar if it has changed
      user.avatar = picture;
      await user.save();
    }

    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" }, async (err, token) => {
      if (err) throw err;

      const userData = {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        categories: user.categories,
        dailyGoal: user.dailyGoal,
      };

      await setCache(`user:${user.id}`, userData, 86400); // Cache for 24 hours

      res.json({
        token,
        user: userData,
      });
    });
  } catch (err) {
    console.error("Error in Google authentication:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

router.get("/user", authenticateToken, async (req, res) => {
  try {
    const cachedUser = await getCache(`user:${req.user.id}`);

    if (cachedUser) {
      return res.json(cachedUser);
    }

    const user = await User.findById(req.user.id).select("-__v");

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    await setCache(`user:${user.id}`, user.toObject(), 86400); // Cache for 24 hours

    res.json(user);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
