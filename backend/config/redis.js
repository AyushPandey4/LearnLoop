const redis = require("redis");

let redisClient;

const connectRedis = async () => {
  try {
    const redisUrl = process.env.REDIS_URL;
    const redisPassword = process.env.REDIS_PASSWORD;

    const options = {};

    options.url = redisUrl;
    options.password = redisPassword;

    // Add connection retry strategy
    options.retry_strategy = (options) => {
      if (options.error && options.error.code === "ECONNREFUSED") {
        // End reconnecting on a specific error
        console.error("Redis server refused connection");
        return new Error("The server refused the connection");
      }
      if (options.total_retry_time > 1000 * 60 * 60) {
        // End reconnecting after a specific timeout
        return new Error("Retry time exhausted");
      }
      if (options.attempt > 10) {
        // End reconnecting with built in error
        return undefined;
      }
      // Reconnect after increasing delay
      return Math.min(options.attempt * 100, 3000);
    };


    redisClient = redis.createClient(options);

   
    redisClient.on("error", (err) => {
      console.error("Redis Error:", err);
    });

    
    await redisClient.connect();
    console.log("Redis Connected");

    return redisClient;
  } catch (error) {
    console.error(`Redis Connection Error: ${error.message}`);
    return null;
  }
};

const getRedisClient = () => {
  if (!redisClient || !redisClient.isOpen) {
    return null;
  }
  return redisClient;
};

module.exports = { connectRedis, getRedisClient };
module.exports = { connectRedis, getRedisClient: () => redisClient };
