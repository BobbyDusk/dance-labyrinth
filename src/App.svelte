<script lang="ts">
 import { setup } from "./app"
 import { onMount } from "svelte"

 let container: HTMLElement | undefined = $state()

  onMount(() => {
    setup(container!)
  })
</script>

<main class="flex h-screen justify-center items-center">
  <div bind:this={container}></div>
</main>
