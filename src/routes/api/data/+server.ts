import { KV_REST_API_TOKEN, KV_REST_API_URL } from "$env/static/private";
import { json, type RequestHandler } from "@sveltejs/kit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: KV_REST_API_URL || "",
  token: KV_REST_API_TOKEN || "",
});

export const GET: RequestHandler = async () => {
  const startedAt = await redis.get("started-at");
  const queue = await redis.lrange("queue", 0, -1);

  return json({ startedAt, queue });
}
