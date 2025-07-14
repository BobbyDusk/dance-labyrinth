<script lang="ts">
  import { onMount } from "svelte";
  import { danceManager } from "./DanceManager";
  import { danceTrack, Orientation } from "./DanceTrack";
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
  let orientation: Orientation = $state(danceTrack.orientation);
  let linesVisible = $state(danceTrack.linesVisible);
  let waveformVisible = $state(danceTrack.waveformVisible);

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
    danceTrack.on("snappingIntervalChanged", (newInterval) => {
      snappingInterval = newInterval;
    });
    danceTrack.on("orientationChanged", (newOrientation) => {
      orientation = newOrientation;
    });
    danceTrack.on("linesVisibilityChanged", (visible) => {
      linesVisible = visible;
    });
    danceTrack.on("waveformVisibilityChanged", (visible) => {
      waveformVisible = visible;
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
    <label for="bpm">bpm: </label>
    <input
      type="number"
      id="bpm"
      bind:value={bpm}
      min="1"
      max="300"
      class="w-16"
      onchange={() => {
        metronome.bpm = bpm;
        danceManager.chart.bpm = bpm;
        danceManager.updateChart();
      }}
    />
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
    <Button
      onclick={() => {
        danceManager.createChart();
      }}>New Chart</Button
    >
    <Button
      onclick={() => {
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
      }}>Load Song</Button
    >
  </div>
  <div>
    <label for="snappingInterval" class="text-lg"> Snapping Interval: </label>
    <select
      id="snappingInterval"
      bind:value={snappingInterval}
      class="w-32"
      onchange={() => {
        danceTrack.snappingInterval = snappingInterval;
      }}
    >
      <option value={1}>1 / 64 beat</option>
      <option value={2}>1 / 32 beat</option>
      <option value={4}>1 / 16 beat</option>
      <option value={8}>1 / 8 beat</option>
      <option value={16}>1 / 4 beat</option>
      <option value={32}>1 / 2 beat</option>
      <option value={64}>1 beat</option>
    </select>
  </div>
  <div>
    <label for="orientation" class="text-lg"> Orientation: </label>
    <select
      id="orientation"
      bind:value={orientation}
      class="w-32"
      onchange={() => {
        danceTrack.orientation = orientation;
      }}
    >
      <option value={Orientation.DOWN}>Scroll Down</option>
      <option value={Orientation.UP}>Scroll Up</option>
    </select>
  </div>
  <div class="flex flex-col gap-1/2">
    <label for="linesVisible" class="text-lg">
      Show Lines:
      <input
        type="checkbox"
        id="linesVisible"
        bind:checked={linesVisible}
        onchange={() => {
          danceTrack.linesVisible = linesVisible;
        }}
      />
    </label>
    <label for="waveformVisible" class="text-lg">
      Show Waveform:
      <input
        type="checkbox"
        id="waveformVisible"
        bind:checked={waveformVisible}
        onchange={() => {
          danceTrack.waveformVisible = waveformVisible;
        }}
      />
    </label>
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
