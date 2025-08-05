<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import YoutubePlayer from "youtube-player";
  import type { YouTubePlayer } from "youtube-player/dist/types";

  let player: YouTubePlayer;
  let isPlayerLoaded = $state(false);
  let isDataLoaded = $state(false);
  let videoId = $state("");
  let startedAt = 0;
  let currentTime = $derived((Date.now() - startedAt) / 1000);
  let videoDuration = $state(0);
  let videoInfo: any = $state(null);

  onMount(async () => {
    // when page loaded
  });

  onDestroy(() => {
    if (player) player.destroy();
  });

  async function turnOnTV() {
    const response = await fetch("/api/data");
    const data = await response.json();
    console.log(data);
    videoId = data.videoId || "MJbE3uWN9vE";
    startedAt = +data.startedAt || 0;

    isDataLoaded = true;

    player = YoutubePlayer("video-player", {
      playerVars: { controls: 0, loop: 1 }
    });

    player.loadVideoById(videoId);
    await player.playVideo();

    // wait for the player to be ready before seeking
    player.on("stateChange", async (event) => {
      if (event.data !== 1 || isPlayerLoaded) return;

      console.log("player is ready");
      console.log("current time:", currentTime);
      await player.seekTo(currentTime, true);
      videoDuration = await player.getDuration();

      const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
      videoInfo = await response.json();

      isPlayerLoaded = true;
    });
  }
</script>

<main class="flex flex-col gap-16 justify-center items-center h-screen">
  {#if videoInfo}
    <h1>
      <a href="https://youtube.com/watch?v={videoId}"><b>{videoInfo.title}</b></a>
      <!-- by
      <a href={videoInfo.author_url}><b>{videoInfo.author_name}</b></a> -->
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
      <div class="bg-fg rounded-full h-full" style="width: {currentTime / videoDuration * 100}%"></div>
    </div>
  {/if}

  {#if !isPlayerLoaded}
    <button
      onclick={turnOnTV}
      class="cursor-pointer border-2 border-fg px-6 py-4 hover:bg-fg hover:text-bg font-bold rounded-xl"
    >
      turn on the tv
    </button>
  {/if}
</main>
