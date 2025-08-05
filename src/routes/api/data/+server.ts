import { REDIS_URL } from "$env/static/private";
import { json } from "@sveltejs/kit";
import { createClient } from "redis";

const redis = await createClient({ url: REDIS_URL }).connect();

export const GET = async () => {
  const timestamp = await redis.get("timestamp");
  const videoId = await redis.get("video-id");

  return json({ timestamp, videoId });
}

export const POST = async ({ request }) => {
  const { timestamp } = await request.json();
  console.log("received timestamp:", timestamp);

  if (timestamp) {
    await redis.set("timestamp", timestamp);
    return json({ success: true, message: "timestamp updated successfully" });
  } else {
    return json({ success: false, message: "invalid timestamp." }, { status: 400 });
  }
}
