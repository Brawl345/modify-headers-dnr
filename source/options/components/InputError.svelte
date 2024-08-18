<script lang="ts">
export let id: string;
export let error: string | undefined = undefined;
</script>

{#if !!error}
    <div id={id} class="invalid-feedback">
        {error}
    </div>
{/if}