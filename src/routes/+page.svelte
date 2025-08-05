<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import YoutubePlayer from "youtube-player";
  import type { YouTubePlayer } from "youtube-player/dist/types";

  let player: YouTubePlayer;
  let isPlayerLoaded = $state(false);

  onMount(async () => {
  });

  onDestroy(() => {
    if (player) player.destroy();
  });

  async function turnOnTV() {
    player = YoutubePlayer("video-player", {
      playerVars: { controls: 0, loop: 1 }
    });
    player.loadVideoById("85VQEzwzAvE");
    // player.loadVideoById("MJbE3uWN9vE");
    await player.playVideo();
    console.log("video started");
    isPlayerLoaded = true;
    console.log(isPlayerLoaded);
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

  {#if !isPlayerLoaded}
    <button onclick={turnOnTV}>turn on the tv</button>
  {/if}
</main>
