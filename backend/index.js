const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = require("./config/db");
const { connectRedis } = require("./config/redis");

const app = express();

app.use(express.json());
app.use(
  cors({
    // origin: ['http://localhost:3000', 'http://localhost'],
    origin: "*", // Allow all origins for development
    credentials: true,
  })
);

// Simple ping-pong endpoint
app.get("/ping", (req, res) => {
  res.json({ message: "pong" });
});

connectDB();

connectRedis()
  .then((client) => {
    if (client) {
      console.log("Redis connection established successfully");
    } else {
      console.warn("Redis connection failed, continuing without caching");
    }
  })
  .catch((err) => {
    console.warn(
      "Redis connection error, continuing without caching:",
      err.message
    );
  });

app.use("/api/auth", require("./routes/auth"));
app.use("/api/user", require("./routes/user"));
app.use("/api/playlist", require("./routes/playlist"));
app.use("/api/video", require("./routes/video"));
app.use("/api/badge", require("./routes/badge"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
