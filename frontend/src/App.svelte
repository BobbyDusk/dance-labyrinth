<script lang="ts">
  import { onMount } from "svelte";
  import setupInput from "./Dance/inputSetup";
  import ChartEditor from "./ChartEditor.svelte";
  import { danceManager } from "./Dance/DanceManager";
  import { danceTrack } from "./Dance/DanceTrack";
  import preloadAssets from "./assets";
  import Controls from "./Dance/Controls.svelte";


  import { invoke } from "@tauri-apps/api/core";

  let musicContainer: HTMLElement | undefined = $state();
  let labyrinthContainer: HTMLElement | undefined = $state();
  let isEditorOpen = $state(false);

  onMount(async () => {
    await preloadAssets();
    setupInput();
    await danceManager.setup();
    musicContainer!.appendChild(danceTrack.app.canvas);

    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    let startedMessage = await invoke("started", { name });
  });
</script>

<main class="flex h-screen justify-center items-center gap-2">
  <div class="self-start hidden" bind:this={labyrinthContainer}></div>
  <div class="self-bottom" bind:this={musicContainer}></div>
  <Controls />
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