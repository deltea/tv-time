<script lang="ts">
  import { onMount } from "svelte";
  import YoutubePlayer from "youtube-player";

  let player;

  onMount(async () => {
    player = YoutubePlayer("video-player", {
      playerVars: { controls: 0 }
    });
    player.loadVideoById("85VQEzwzAvE");
    await player.playVideo();
    console.log("video started");
  })
</script>

<main class="flex justify-center items-center h-screen">
  <!-- iframe will replace this div -->
  <div
    id="video-player"
    class="border-4 border-muted rounded-2xl"
  ></div>
</main>
