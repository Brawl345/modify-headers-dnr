<script lang="ts">
import Modal from 'bootstrap/js/dist/modal';
import { flip } from 'svelte/animate';
import { fly } from 'svelte/transition';
import {
  MAX_NUMBER_OF_RULES,
  constructNewRules,
  getMessage,
  isBlank,
  isFirefox,
  isValidRegex,
  validResourceTypes,
} from '../../utils.js';
import { alert } from '../stores/alert-store';

import { onMount } from 'svelte';
import { ApplyOn, type RuleError } from '../../types';
import { options } from '../stores/options-store';
import Rule from './Rule.svelte';

interface RuleErrors {
  [key: number]: RuleError;
}

let ruleErrors: RuleErrors = {};

const save = async () => {
  ruleErrors = {};

  // Validate first
  $options.rules.forEach((rule, index) => {
    const ruleError: RuleError = {};

    // Filter
    if (isBlank(rule.filter)) {
      ruleError.filter = getMessage('errFilterRequired');
    }

    if (!isBlank(rule.filter)) {
      if (!isValidRegex(rule.filter)) {
        ruleError.filter = getMessage('errFilterInvalid');
      }
    }

    // Operation
    if (
      !Object.values(chrome.declarativeNetRequest.HeaderOperation).includes(
        rule.operation,
      )
    ) {
      ruleError.operation = getMessage('errOperationInvalid');
    }

    // Field
    if (isBlank(rule.field)) {
      ruleError.field = getMessage('errFieldRequired');
    }

    // Value
    if (
      rule.operation !== chrome.declarativeNetRequest.HeaderOperation.REMOVE &&
      isBlank(rule.value)
    ) {
      ruleError.value = getMessage('errValueRequired');
    }

    // Priority
    if (rule.priority < 1) {
      ruleError.priority = getMessage('errPriorityTooLow');
    }
    if (!Number.isSafeInteger(rule.priority)) {
      ruleError.priority = getMessage('errPriorityInvalid');
    }

    // Apply On
    if (![ApplyOn.REQUEST, ApplyOn.RESPONSE].includes(rule.applyOn)) {
      ruleError.applyOn = getMessage('errApplyOnInvalid');
    }

    // ResourceTypes
    if (rule.resourceTypes.length === 0) {
      ruleError.resourceTypes = getMessage('errResourceTypesRequired');
    }

    if (rule.resourceTypes.some((type) => !validResourceTypes.has(type))) {
      ruleError.resourceTypes = getMessage('errResourceTypesInvalid');
    }

    // Validation END
    if (Object.keys(ruleError).length !== 0) {
      ruleErrors[index] = ruleError;
    }
  });

  if (Object.keys(ruleErrors).length !== 0) {
    console.error(ruleErrors);

    setTimeout(() => {
      const firstErrorElement = document.querySelector('.invalid-feedback');
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }, 0);

    return;
  }

  const oldRuleIds = (await chrome.declarativeNetRequest.getDynamicRules()).map(
    (rule) => rule.id,
  );

  let newRules: chrome.declarativeNetRequest.Rule[] = [];

  if ($options.enabled) {
    newRules = constructNewRules($options.rules);

    if (newRules.length > MAX_NUMBER_OF_RULES) {
      alert.error(getMessage('errTooManyRules'));
      return;
    }
  }

  try {
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: oldRuleIds,
      addRules: newRules,
    });
    await chrome.storage.sync.set($options);

    alert.success(getMessage('successSaveOptions'));
    setTimeout(() => alert.hide(), 3000);
  } catch (e) {
    if (chrome.runtime.lastError?.message) {
      console.error(chrome.runtime.lastError?.message);
      alert.error(chrome.runtime.lastError?.message);
    } else {
      console.error(e);
      alert.error(getMessage('errorWhileSaving'));
    }
  }
};

onMount(async () => {
  for (const modalNode of document.querySelectorAll('[data-bs-toggle="modal"]'))
    new Modal(modalNode);
});
</script>

<form on:submit|preventDefault={save}>

    <div class="floating-buttons">
        <button type="button" class="btn btn-secondary btn-lg btn-md-down-circle" data-bs-toggle="modal" data-bs-target="#helpModal">
            <span class="fw-bold">?</span> <span class="d-none d-md-inline-block">&nbsp;&nbsp;{getMessage('optionHelp')}</span>
        </button>
        <button type="button" class="btn btn-primary btn-lg btn-md-down-circle" on:click={options.addRule}>
            <span class="fw-bold">+</span> <span class="d-none d-md-inline-block">&nbsp;&nbsp;{getMessage('optionAddRule')}</span>
        </button>
        <button type="submit" class="btn btn-success btn-lg btn-md-down-circle">
            💾<span class="d-none d-md-inline-block">&nbsp;&nbsp;{getMessage('optionSave')}</span>
        </button>
    </div>

    {#if $alert.variant !== null}
        <div class="row mt-3" transition:fly>
            <div class="col">
                <div
                        class={`alert alert-${$alert.variant} alert-dismissible`}
                        role="alert"
                >
                    {$alert.message}
                    <button
                            type="button"
                            class="btn-close"
                            data-bs-dismiss="alert"
                            aria-label="Close"
                            on:click={alert.hide}
                    >&nbsp;
                    </button>
                </div>
            </div>
        </div>
    {/if}

    {#each $options.rules as rule, index (rule)}
        <div animate:flip={{ duration: (d) => 30 * Math.sqrt(d) }}>
          <Rule {index} {rule} error={ruleErrors[index]}/>
        </div>
    {/each}
</form>

<div class="modal fade" id="helpModal" tabindex="-1" aria-labelledby="helpModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-fullscreen-md-down">
        <div class="modal-content">
            <div class="modal-header">
                <h1 class="modal-title fs-5" id="helpModalLabel">{getMessage('optionHelp')}</h1>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label={getMessage('optionHelpClose')}></button>
            </div>
            <div class="modal-body">
                <a class="link-secondary"
                   href="https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/declarativeNetRequest/RuleCondition#regexfilter"
                   target="_blank">
                    <h2 class="fs-3">{getMessage('optionUrlPattern')}</h2>
                </a>
                <p>{getMessage('optionUrlPatternHelp')}</p>

                <a class="link-secondary"
                   href="https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/declarativeNetRequest/ModifyHeaderInfo"
                   target="_blank">
                    <h2 class="fs-3">{getMessage('optionAction')}</h2>
                </a>
                <p>{getMessage('optionActionHelp')}</p>
                {#if !isFirefox}
                    <p>{getMessage('optionActionChromeHelp')}</p>
                {/if}

                <a class="link-secondary"
                   href="https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/declarativeNetRequest#matching_precedents"
                   target="_blank">
                    <h2 class="fs-3">{getMessage('optionPriority')}</h2>
                </a>
                <p>{getMessage('optionPriorityHelp')}</p>

                <a class="link-secondary"
                   href="https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/declarativeNetRequest/ResourceType"
                   target="_blank">
                    <h2 class="fs-3">{getMessage('optionResourceTypes')}</h2>
                </a>
                <p>{getMessage('optionResourceTypesHelp')}</p>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">{getMessage('optionHelpClose')}</button>
            </div>
        </div>
    </div>
</div>