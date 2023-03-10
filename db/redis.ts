import { connect } from "https://deno.land/x/redis@v0.29.2/mod.ts";
// Create a redis connection
const redis = await connect({
  hostname: "0.0.0.0",
  port: 6379,
});

// pass redis connection into a new RedisStore. Optionally add a second string argument for a custom database prefix, default is 'session_'
export default redis;
