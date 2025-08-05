<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import YoutubePlayer from "youtube-player";
  import type { YouTubePlayer } from "youtube-player/dist/types";

  let player: YouTubePlayer;
  let isPlayerLoaded = $state(false);
  let isDataLoaded = $state(false);
  let videoId = "";
  let timestamp = 0;

  onMount(async () => {
    const response = await fetch("/api/data");
    const data = await response.json();
    console.log(data);
    videoId = data.videoId || "MJbE3uWN9vE";
    timestamp = +data.timestamp || 0;

    isDataLoaded = true;
  });

  onDestroy(() => {
    if (player) player.destroy();
  });

  async function turnOnTV() {
    player = YoutubePlayer("video-player", {
      playerVars: { controls: 0, loop: 1 }
    });

    player.loadVideoById(videoId);
    console.log(timestamp);
    await player.playVideo();

    let hasSeeked = false;
    player.on("stateChange", async (event) => {
      if (event.data !== 1 || hasSeeked) return;

      console.log("player is ready");
      await player.seekTo(timestamp, true);
      hasSeeked = true;
    });

    isPlayerLoaded = true;
  }
</script>

<main class="flex flex-col gap-16 justify-center items-center h-screen">
  <div class={isPlayerLoaded ? "block" : "hidden"}>
    <!-- iframe will replace this div -->
    <div
      id="video-player"
      class="border-4 border-muted rounded-2xl pointer-events-none"
    ></div>
  </div>

  {#if !isPlayerLoaded && isDataLoaded}
    <button
      onclick={turnOnTV}
      class="cursor-pointer border-2 border-fg px-6 py-4 hover:bg-fg hover:text-bg font-bold"
    >
      turn on the tv
    </button>
  {/if}
</main>
