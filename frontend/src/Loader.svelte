<script>
    let { size = 48} = $props(); // default size in px
</script>

<style>
.loader {
    border: 6px solid #f3f3f3;
    border-top: 6px solid #3498db;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: auto;
    display: block;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
</style>

<div
    class="loader"
    style="width: {size}px; height: {size}px; border-width: {Math.max(2, size/8)}px;"
></div>