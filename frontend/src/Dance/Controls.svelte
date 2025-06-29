<script lang="ts">
  import { onMount } from "svelte";
  import { danceManager } from "./DanceManager";
  import { Metronome, metronome } from "../Metronome";

  let started = $state(false);
  let paused = $state(true);
  let beat = $state(0);
  let subbeat = $state(0);
  let time = $state(0);
  let bpm = $state(0);

  onMount(() => {
    metronome.on("beat", updateBeat);
    danceManager.chart.on("loaded", (chart) => {
      bpm = chart.bpm;
    });
  });

  function updateBeat() {
    beat = metronome.beat;
    subbeat = metronome.subbeat;
    time = metronome.time;
  }

  function togglePlayPause() {
    if (danceManager.paused) {
      danceManager.start();
      started = true;
      paused = false;
    } else {
      danceManager.pause();
      paused = true;
    }
  }

  function reset() {
    danceManager.reset();
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
      beat: <span class="inline-block w-8 text-end">{beat}</span> <sup><span class="inline-block w-4 text-end">{subbeat}</span></sup>&frasl;<sub>{Metronome.NUM_SUBBEATS}</sub>
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
