<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import YoutubePlayer from "youtube-player";
  import type { YouTubePlayer } from "youtube-player/dist/types";

  let player: YouTubePlayer;
  let isPlayerLoaded = $state(false);
  let queue: string[] = $state([]);
  let startedAt = $state(0);
  let currentTime = $state(0);
  let videoDuration = $state(0);
  let videoInfo: any = $state(null);
  let videoIdInput = $state("");

  onMount(async () => {
    // when page loaded
    setInterval(() => {
      currentTime = (Date.now() - startedAt) / 1000;
    }, 100);
  });

  onDestroy(() => {
    if (player) player.destroy();
  });

  async function turnOnTV() {
    const response = await fetch("/api/data");
    const data = await response.json();
    console.log(data);
    queue = data.queue || ["MJbE3uWN9vE"];
    startedAt = +data.startedAt || 0;

    if (queue.length === 0) {
      console.warn("no videos in queue");
      return;
    }

    player = YoutubePlayer("video-player", {
      playerVars: {
        controls: 0,
        loop: 1
      }
    });

    player.loadVideoById(queue[0]);
    await player.playVideo();

    // wait for the player to be ready before seeking
    player.on("stateChange", async (event) => {
      if (event.data === 1 && !isPlayerLoaded) {
        console.log("player is ready");
        console.log("current time:", currentTime);
        await player.seekTo(currentTime, true);
        await updateVideoInfo();

        isPlayerLoaded = true;
      } else if (event.data === 0) {
        await nextVideo();
      }
    });
  }

  async function updateVideoInfo() {
    console.log("queue[0]:", queue[0]);
    const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${queue[0]}&format=json`);
    videoDuration = await player.getDuration();
    videoInfo = await response.json();
  }

  async function nextVideo() {
    queue.shift();
    console.log("next video started");
    startedAt = Date.now();
    isPlayerLoaded = false;

    // ping server to update queue to next video
    await fetch("/api/data/next-video", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ videoId: queue[0] })
    });

    if (queue.length > 0) {
      player.loadVideoById(queue[0]);
      await player.playVideo();
    }
  }

  function addVideoToQueue(id: string) {
    videoIdInput = "";
    queue = [...queue, id];
    fetch("/api/data/add-to-queue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ videoId: id })
    });
  }

  function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }
</script>

<main class="flex flex-col gap-16 justify-center items-center h-screen">
  {#if videoInfo}
    <h1>
      <a href="https://youtube.com/watch?v={queue[0]}"><b>{videoInfo.title}</b></a>
    </h1>
  {/if}

  <div class={isPlayerLoaded ? "block" : "hidden"}>
    <!-- iframe will replace this div -->
    <div
      id="video-player"
      class="border-4 border-fg rounded-xl pointer-events-none"
    ></div>
  </div>

  {#if videoDuration > 0}
    <div class="bg-neutral-800 rounded-full h-4 w-[32rem]">
      <div class="bg-fg rounded-full h-full" style="width: {clamp(currentTime / videoDuration * 100, 0, 100)}%"></div>
    </div>
  {/if}

  {#if !isPlayerLoaded}
    <button
      onclick={turnOnTV}
      class="cursor-pointer border-2 border-fg px-6 py-4 hover:bg-fg hover:text-bg font-bold rounded-xl"
    >
      turn on the tv
    </button>
  {:else}
    <form onsubmit={() => addVideoToQueue(videoIdInput)}>
      <input
        type="text"
        placeholder="add video to queue"
        bind:value={videoIdInput}
        class="border-2 border-fg px-4 rounded-xl h-12 text-fg"
      />
      <button
        type="submit"
        class="cursor-pointer border-2 border-fg px-6 h-12 hover:bg-fg hover:text-bg font-bold rounded-xl"
      >
        add
      </button>
    </form>
  {/if}
</main>
