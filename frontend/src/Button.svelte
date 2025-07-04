<script>
    const props = $props();
    let children = props.children;
    delete props.children;
</script>

<button class="bg-blue-500 text-white px-4 py-2 rounded w-36 cursor-pointer" {...props}>
    {@render children?.()}
</button>
