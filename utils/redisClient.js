require("dotenv").config();
const fetch = require("node-fetch");

async function redisFetch(command, ...args) {
  const url = `${process.env.UPSTASH_REDIS_REST_URL}/${command}/${args.join(
    "/"
  )}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
    },
  });
  return res.json();
}

module.exports = redisFetch;
