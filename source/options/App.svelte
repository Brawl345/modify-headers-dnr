<script lang="ts">
import { onMount } from 'svelte';
import { getMessage, isFirefox } from '../utils';
import Form from './components/Form.svelte';
import { options } from './stores/options-store';

let doneLoading = false;

onMount(async () => {
  document.title = `${getMessage('extensionName')} | ${getMessage(
    'optionsPageTitle',
  )}`;
  await options.loadFromStorage();

  console.log(
    'dynamic rules',
    await chrome.declarativeNetRequest.getDynamicRules(),
  );

  doneLoading = true;
});
</script>

<main class="container mt-3 mb-3">
    {#if doneLoading}
        <div id="extensionName" class="row align-items-center mb-3">
            <div class="col">
                <h1 class="text-center">{getMessage('extensionName')}</h1>
            </div>
        </div>

        <div class="container-fluid">
            <Form/>
        </div>
    {:else}
        <p class="h1">...</p>
    {/if}
</main>
