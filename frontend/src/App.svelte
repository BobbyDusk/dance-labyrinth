<script lang="ts">
  import { setup as setupMusicApp } from "./musicApp";
  import { setup as setupLabyrinthApp } from "./labyrinthApp";
  import { onMount } from "svelte";
  import { setupInput } from "./input";
  import ChartEditor from "./ChartEditor.svelte";

  let musicContainer: HTMLElement | undefined = $state();
  let labyrinthContainer: HTMLElement | undefined = $state();
  let isEditorOpen = $state(false);

  onMount(() => {
    setupMusicApp(musicContainer!);
    setupLabyrinthApp(labyrinthContainer!);
    setupInput();
  });
</script>

<main class="flex h-screen justify-center items-center gap-2">
  <div class="self-start" bind:this={labyrinthContainer}></div>
  <div class="self-bottom" bind:this={musicContainer}></div>
  <button
    class="absolute top-0 right-0 m-4 bg-blue-500 text-white px-4 py-2 rounded"
    onclick={() => (isEditorOpen = !isEditorOpen)}
  >
    {isEditorOpen ? "Close Editor" : "Open Editor"}
  </button>
  {#if isEditorOpen}
    <ChartEditor />
  {/if}
</main>
