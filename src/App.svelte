<script lang="ts">
  import { setup as setupMusicApp } from "./musicApp";
  import { setup as setupLabyrinthApp } from "./labyrinthApp";
  import { onMount } from "svelte";
  import { setupInput } from "./input";

  let musicContainer: HTMLElement | undefined = $state();
  let labyrinthContainer: HTMLElement | undefined = $state();

  onMount(() => {
    setupMusicApp(musicContainer!)
    setupLabyrinthApp(labyrinthContainer!);
    setupInput();
  });
</script>

<main class="flex h-screen justify-center items-center gap-2">
  <div class="self-start" bind:this={labyrinthContainer}></div>
  <div class="self-bottom" bind:this={musicContainer}></div>
</main>
