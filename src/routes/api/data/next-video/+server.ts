import { KV_REST_API_TOKEN, KV_REST_API_URL } from "$env/static/private";
import type { RequestHandler } from "@sveltejs/kit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: KV_REST_API_URL || "",
  token: KV_REST_API_TOKEN || "",
});

export const POST: RequestHandler = async ({ request }) => {
  const { videoId } = await request.json();

  const key = `next-video:${videoId}:done`;
  console.log("key: " + key);
  const dedup = await redis.setnx(key, "true");
  if (dedup) {
    await redis.expire(key, 5);
  } else {
    return new Response("already done", { status: 400 });
  }

  // ping server to play next video
  const response = await fetch("http://localhost:8000/", {
    method: "POST"
  });

  if (!response.ok) {
    console.error("failed to ping server for next video");
    return new Response("failed to ping server", { status: 500 });
  }

  console.log("next video started", videoId);
  return new Response("next video started", { status: 200 });
}
