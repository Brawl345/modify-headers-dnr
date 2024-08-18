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
        <div class="row align-items-center">
            <div class="col">
                <h1 class="text-center">{getMessage('extensionName')}</h1>
            </div>
            <!-- Global on/off switch -->
<!--            <div class="col-auto text-end">-->
<!--                <div class="form-check form-switch form-check-lg">-->
<!--                    <input id="onOffSwitch"-->
<!--                           class="form-check-input"-->
<!--                           type="checkbox"-->
<!--                           role="switch"-->
<!--                           bind:checked={$options.enabled}-->
<!--                    >-->
<!--                </div>-->
<!--            </div>-->
        </div>

        <div class="p-3 bg-light mb-5">
            <Form/>
        </div>

        <div class="row row-cols-1 row-cols-lg-3 g-3">

            <div class="col">
                <div class="card h-100">
                    <div class="card-header">
                        <a class="link-secondary"
                           href="https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/declarativeNetRequest/RuleCondition#regexfilter"
                           target="_blank">
                            {getMessage('optionUrlPattern')}
                        </a>
                    </div>
                    <div class="card-body">
                        <p class="card-text">{getMessage('optionUrlPatternDescription')}</p>
                    </div>
                </div>
            </div>

            <div class="col">
                <div class="card h-100">
                    <div class="card-header">
                        <a class="link-secondary"
                           href="https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/declarativeNetRequest/ModifyHeaderInfo"
                           target="_blank">
                            {getMessage('optionAction')}
                        </a>
                    </div>
                    <div class="card-body">
                        <p class="card-text">{getMessage('optionActionDescription')}</p>
                        {#if !isFirefox}
                            <p class="card-text">{getMessage('optionActionChromeDescription')}</p>
                        {/if}
                    </div>
                </div>
            </div>

            <div class="col">
                <div class="card h-100">
                    <div class="card-header">
                        <a class="link-secondary"
                           href="https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/declarativeNetRequest#matching_precedents"
                           target="_blank">
                            {getMessage('optionPriority')}
                        </a>
                    </div>
                    <div class="card-body">
                        <p class="card-text">{getMessage('optionPriorityDescription')}</p>
                    </div>
                </div>
            </div>

        </div>

    {:else}
        <p class="h1">...</p>
    {/if}
</main>
