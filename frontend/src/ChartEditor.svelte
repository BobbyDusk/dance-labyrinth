<script lang="ts">
  import Loader from "./Loader.svelte";

  let selectedFileName: string | null = $state(null);
  let waveformUrl: string | null = $state(null);
  let fileInput: HTMLInputElement | null = $state(null);
  let loading = $state(false);

  waveformUrl = "http://localhost:8000/static/tmp8upq59yf.png";

  async function upload() {
    if (loading) return;
    loading = true;
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) return;
    const file = fileInput.files[0];

    const formData = new FormData();
    formData.append("file", file);

    const endpoint = import.meta.env.DEV
      ? "http://localhost/get_waveform"
      : "https://dance2move.com/get_waveform";

    const response = await fetch(endpoint, {
      method: "POST",
      body: formData,
    });
    if (!response.ok) return;
    waveformUrl = await response.text();
    console.log(waveformUrl);
    loading = false;
  }
</script>

<div class="flex flex-col gap-2">
  <div class="flex flex-row gap-2 mr-4 w-full justify-start items-center">
    <label
      for="fileInput"
      class="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer flex items-center justify-center"
    >
      Choose File
      <input
        id="fileInput"
        type="file"
        class="hidden"
        bind:value={selectedFileName}
        accept=".mp3,.wav,audio/mp3,audio/wav"
        bind:this={fileInput}
      />
    </label>
    <p class="text-gray-500">
      {selectedFileName ? selectedFileName : "No file chosen"}
    </p>
    <div class="flex-1"></div>
    <button
      class="bg-blue-500 text-white px-4 py-2 rounded justify-self-end cursor-pointer"
      onclick={upload}
    >
      {#if loading}
        <Loader size={24} />
      {:else}
        Upload
      {/if}
    </button>
  </div>
  <div class="w-[600px] h-[1000px] bg-amber-500 overflow-auto">
    {#if waveformUrl}
      <img src={waveformUrl} alt="Waveform" class="" width="600" />
    {:else}
      <p class="text-gray-500">No waveform available</p>
    {/if}
  </div>
</div>
