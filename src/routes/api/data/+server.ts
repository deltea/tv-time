import { KV_REST_API_TOKEN, KV_REST_API_URL } from "$env/static/private";
import { json } from "@sveltejs/kit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: KV_REST_API_URL || "",
  token: KV_REST_API_TOKEN || "",
});

export const GET = async () => {
  const startedAt = await redis.get("started-at");
  const videoId = await redis.get("video-id");

  return json({ startedAt, videoId });
}

// export const POST = async ({ request }) => {
//   const { timestamp } = await request.json();
//   console.log("received timestamp:", timestamp);

//   if (timestamp) {
//     await redis.set("timestamp", timestamp);
//     return json({ success: true, message: "timestamp updated successfully" });
//   } else {
//     return json({ success: false, message: "invalid timestamp." }, { status: 400 });
//   }
// }

