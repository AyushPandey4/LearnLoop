const { getRedisClient } = require("./redis");

const setCache = async (key, value, expireSeconds = null) => {
  try {
    const client = getRedisClient();

    if (!client) {
      return;
    }

    const valueToStore =
      typeof value === "object" ? JSON.stringify(value) : value;

    await client.set(key, valueToStore);

    if (expireSeconds) {
      await client.expire(key, expireSeconds);
    }
  } catch (error) {
    console.error(`Redis setCache error: ${error.message}`);
  }
};

const getCache = async (key, parseJSON = true) => {
  try {
    const client = getRedisClient();

    if (!client) {
      return null;
    }

    const value = await client.get(key);

    if (!value) return null;

    if (parseJSON) {
      try {
        return JSON.parse(value);
      } catch (e) {
        return value;
      }
    }

    return value;
  } catch (error) {
    console.error(`Redis getCache error: ${error.message}`);
    return null;
  }
};

const deleteCache = async (key) => {
  try {
    const client = getRedisClient();

    if (!client) {
      return;
    }

    await client.del(key);
  } catch (error) {
    console.error(`Redis deleteCache error: ${error.message}`);
  }
};

module.exports = {
  setCache,
  getCache,
  deleteCache,
};
