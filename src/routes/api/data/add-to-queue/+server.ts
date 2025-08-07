import { KV_REST_API_TOKEN, KV_REST_API_URL } from "$env/static/private";
import type { RequestHandler } from "@sveltejs/kit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: KV_REST_API_URL || "",
  token: KV_REST_API_TOKEN || "",
});

export const POST: RequestHandler = async ({ request }) => {
  const { videoId } = await request.json();

  if (!videoId) {
    return new Response("video id is required", { status: 400 });
  }

  redis.rpush("queue", videoId);
  return new Response("video added to queue", { status: 200 });
}
