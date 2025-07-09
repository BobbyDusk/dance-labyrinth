<script lang="ts">
  import { onMount } from "svelte";
  import { danceManager } from "./DanceManager";
  import { danceTrack } from "./DanceTrack";
  import type { SnappingInterval } from "./DanceTrack";
  import { Metronome, metronome } from "../Metronome";
  import logger from "../Logger";
  import Button from "../Button.svelte";
  import { audioVisualizer } from "./AudioVisualizer";
  import { beatDetector } from "./BeatDetector";
  import delay from "delay";

  let paused = $state(true);
  let beat = $state(0);
  let subbeat = $state(0);
  let time = $state(0);
  let bpm = $state(120);
  let snappingInterval: SnappingInterval = $state(danceTrack.snappingInterval);

  onMount(() => {
    metronome.on("beat", updateBeat);
    metronome.on("started", () => {
      paused = false;
    });
    metronome.on("stopped", () => {
      paused = true;
    });
    metronome.on("bpmChanged", (newBpm) => {
      bpm = newBpm;
    });
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
    } else {
      danceManager.pause();
    }
  }

  function reset() {
    danceManager.reset();
  }
</script>

<div class="flex flex-col gap-4 p-4">
  <div>
    <p>offset: </p>
    <p>bpm: {bpm}</p>
    <p>
      beat: <span class="inline-block w-8 text-end">{beat}</span>
      <sup><span class="inline-block w-4 text-end">{subbeat}</span></sup
      >&frasl;<sub>{Metronome.NUM_SUBBEATS}</sub>
    </p>
    <p>time: {new Date(time).toISOString().substring(14, 23)}</p>
  </div>
  <div>
    <Button onclick={togglePlayPause}>
      {#if paused}
        Start
      {:else}
        Pause
      {/if}
    </Button>
    <Button onclick={reset}>Reset</Button>
  </div>
  <div>
    <Button
      onclick={() => {
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = ".chart";
        fileInput.onchange = (event) => {
          const target = event.target as HTMLInputElement;
          if (target.files && target.files.length > 0) {
            danceManager.loadChart(target.files[0]);
          }
        };
        fileInput.click();
      }}>Load Chart</Button
    >
    <Button
      onclick={() => {
        let file = danceManager.saveChart();
        const url = URL.createObjectURL(file);
        const a = document.createElement("a");
        a.href = url;
        a.download = "song.chart";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }}
    >
      Save Chart
    </Button>
  </div>
  <div>
    <Button>New Chart</Button>
    <Button onclick={() => {
        const input = document.createElement("input");
        input.style.display = "none";
        input.type = "file";
        input.accept = ".mp3,.wav,.ogg";
        input.onchange = async (event) => {
          const target = event.target as HTMLInputElement;
          if (target.files && target.files.length > 0) {
            danceManager.loadSong(target.files[0]);
          }
        };
        input.click();
    }}>Load Song</Button>
  </div>
  <div>
    <label for="snappingInterval" class="text-lg"> Snapping Interval: </label>
    <select
      id="snappingInterval"
      bind:value={snappingInterval}
      class="w-16"
      onchange={() => {
        danceTrack.snappingInterval = snappingInterval;
      }}
    >
      <option value={1}>1</option>
      <option value={2}>2</option>
      <option value={4}>4</option>
      <option value={8}>8</option>
      <option value={16}>16</option>
      <option value={32}>32</option>
      <option value={64}>64</option>
    </select>
  </div>
  <!--
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
  -->
</div>
