<script lang="ts">
  import { onMount } from "svelte";
  import { DanceManager } from "./danceManager";
  import { Beat } from "../beat";
  import { on } from "svelte/events";

  let started = $state(false);
  let paused = $state(true);
  let beat = $state(0);
  let subbeat = $state(0);
  let time = $state(0);
  let bpm = $state(0);

  onMount(() => {
    Beat.subscribe(updateBeat);
    DanceManager.signature.subscribe((signature) => {
      bpm = signature.bpm;
    });
  });

  function updateBeat() {
    beat = Beat.beat;
    subbeat = Beat.subbeat;
    time = Beat.time;
  }

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
    beat = 0;
    subbeat = 0;
    time = 0;
  }
</script>

<div>
  <div>
    <p>bpm: {bpm}</p>
    <p>
      beat: <span class="inline-block w-8 text-end">{beat}</span> <sup><span class="inline-block w-4 text-end">{subbeat}</span></sup>&frasl;<sub>{Beat.NUM_SUBBEATS}</sub>
    </p>
    <p>time: {new Date(time).toISOString().substring(14, 23)}</p>
  </div>
  <div>
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
    <button
      class="bg-blue-500 text-white px-4 py-2 rounded w-24"
      onclick={reset}
    >
      Reset
    </button>
  </div>
  <div>
    <label for="scale" class="text-lg"> scale: </label>
    <input
      type="range"
      id="scale"
      min="0.25"
      max="10"
      step="0.01"
      class="w-64"
    />
  </div>
</div>
