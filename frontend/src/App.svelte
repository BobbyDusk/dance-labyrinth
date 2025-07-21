<script lang="ts">
  import { onMount } from "svelte";
  import setupInput from "./Dance/inputSetup";
  import { danceManager } from "./Dance/DanceManager";
  import { danceTrack } from "./Dance/DanceTrack";
  import preloadAssets from "./assets";
  import Controls from "./Dance/Controls.svelte";
  import Button from "./Button.svelte";
  import { metronome } from "./Metronome";
  import uap from "./UAParser";

  let musicContainer: HTMLElement | undefined = $state();
  let labyrinthContainer: HTMLElement | undefined = $state();
  let isEditorOpen = $state(false);

  onMount(async () => {
    await preloadAssets();
    setupInput();
    await danceManager.setup(musicContainer!);
    musicContainer!.appendChild(danceTrack.app.canvas);
    if (uap.device.is("mobile")) {
      metronome.on("started", () => {
        isEditorOpen = false;
      })
    }
  });
</script>

<main class="h-screen flex items-center justify-center relative">
  <div
    class="w-full h-full md:w-[600px] md:h-[1000px]"
    bind:this={musicContainer}
  ></div>
  {#if isEditorOpen}
    <div class="absolute top-5 right-5 bg-white/70 rounded-xl backdrop-blur-sm shadow-lg">
      <Controls />
    </div>
  {/if}
  <Button
    class="absolute top-10 right-10"
    onclick={() => (isEditorOpen = !isEditorOpen)}
  >
    {isEditorOpen ? "Close Editor" : "Open Editor"}
  </Button>
</main>
