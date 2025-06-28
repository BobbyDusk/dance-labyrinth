<script lang="ts">
  import { onMount } from "svelte";
  import setupInput from "./Dance/inputSetup";
  import ChartEditor from "./ChartEditor.svelte";
  import { DanceManager } from "./Dance/danceManager";
  import { DanceTrack } from "./Dance/danceTrack";
  import preloadAssets from "./assets";

  let musicContainer: HTMLElement | undefined = $state();
  let labyrinthContainer: HTMLElement | undefined = $state();
  let isEditorOpen = $state(false);
  let started = $state(false);
  let paused = $state(true);

  onMount(async () => {
    await preloadAssets();
    setupInput();
    await DanceManager.setup();
    musicContainer!.appendChild(DanceTrack.app.canvas);
  });

  function togglePlayPause() {
    if (DanceManager.paused) {
      DanceManager.start();
      started = true;
      paused = false;
    } else {
      DanceManager.pause();
      paused = true;
    }
  } 

  function reset() {
    DanceManager.reset();
    started = false;
    paused = true;
  }
</script>

<main class="flex h-screen justify-center items-center gap-2">
  <div class="self-start hidden" bind:this={labyrinthContainer}></div>
  <button
    class="bg-blue-500 text-white px-4 py-2 rounded w-24"
    onclick={reset}
  >
    Reset
  </button>
  <button
    class="bg-blue-500 text-white px-4 py-2 rounded w-24"
    onclick={togglePlayPause}
  >
  {#if !started}
    Start
  {:else if paused}
    Resume
  {:else}
    Pause
  {/if}
  </button>
  <label for="scale" class="text-lg"> scale: </label>
  <input
    type="range"
    id="scale"
    min="0.25"
    max="10"
    step="0.01"
    class="w-64"
  />
  <div>
    <p>time: 1:05</p>
    <p>beat: 2 <sup>3</sup>&frasl;<sub>64</sub></p>
  </div>
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
