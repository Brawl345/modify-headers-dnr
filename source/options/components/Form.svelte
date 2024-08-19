<script lang="ts">
import { fly } from 'svelte/transition';
import {
  MAX_NUMBER_OF_RULES,
  constructNewRules,
  getMessage,
  isBlank,
  isValidRegex,
} from '../../utils.js';
import { alert } from '../stores/alert-store';

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
      ![
        chrome.declarativeNetRequest.HeaderOperation.SET,
        chrome.declarativeNetRequest.HeaderOperation.APPEND,
        chrome.declarativeNetRequest.HeaderOperation.REMOVE,
      ].includes(rule.operation)
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

    if (Object.keys(ruleError).length !== 0) {
      ruleErrors[index] = ruleError;
    }
  });

  if (Object.keys(ruleErrors).length !== 0) {
    console.error(ruleErrors);
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
</script>

<form on:submit|preventDefault={save}>
    {#if $options.rules.length > 0}
        <table class="table" transition:fly={{ duration: 200 }}>
            <thead>
            <tr>
                <th class="col" scope="col"></th>
                <th class="col-3" scope="col">{getMessage('optionUrlPattern')}</th>
                <th class="col-1_5" scope="col">{getMessage('optionAction')}</th>
                <th class="col-2" scope="col">{getMessage('optionHeaderField')}</th>
                <th class="col-2_5" scope="col">{getMessage('optionHeaderValue')}</th>
                <th class="col-1" scope="col">{getMessage('optionPriority')}</th>
                <th class="col-1_5" scope="col">{getMessage('optionApplyOn')}</th>
                <th class="col" scope="col"></th>
            </tr>
            </thead>
            <tbody>

            {#each $options.rules as rule, index (rule)}
                <Rule {index} {rule} error={ruleErrors[index]}/>
            {/each}
            </tbody>
        </table>
    {/if}

    <div class="row">
        <div class="col text-end">
            <button
                    class="btn btn-primary btn-md-down-w-10"
                    on:click={options.addRule}
                    type="button"
            >
                {getMessage('optionAddRule')}
            </button>
        </div>
    </div>

    <hr/>

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

    <div class="row">
        <div class="col text-end">
            <button class="btn btn-success btn-md-down-w-10" type="submit">
                {getMessage('optionSave')}
            </button>
        </div>
    </div>

</form>