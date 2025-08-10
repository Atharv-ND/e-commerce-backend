// utils/redisClient.js  OR  config/redisClient.js
const { createClient } = require("redis");

// Create Redis client using Upstash URL from environment variables
const client = createClient({
  url: process.env.REDIS_URL, // e.g. "rediss://<username>:<password>@<endpoint>"
});

client.on("error", (err) => {
  console.error("❌ Redis Client Error:", err);
});

(async () => {
  try {
    await client.connect();
    console.log("✅ Connected to Upstash Redis");
  } catch (err) {
    console.error("❌ Failed to connect to Redis:", err);
  }
})();

module.exports = client;
