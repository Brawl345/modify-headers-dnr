<script lang="ts">
import { fly } from 'svelte/transition';
import { ApplyOn, type FilterRule, type RuleError } from '../../types';
import { getMessage } from '../../utils';
import { options } from '../stores/options-store';
import InputError from './InputError.svelte';

export let index: number;
export let rule: FilterRule;
export let error: RuleError | undefined = undefined;

const onChangeOperation = (
  e: Event & { currentTarget: EventTarget & HTMLSelectElement },
) => {
  if (
    e.currentTarget.value ===
    chrome.declarativeNetRequest.HeaderOperation.REMOVE
  ) {
    rule.value = '';
  }
};
</script>

<tr transition:fly>

    <td class="align-middle" data-label={getMessage('optionEnabled')}>
        <div class="form-check form-switch d-flex justify-content-end">
            <input
                    bind:checked={rule.enabled}
                    class="form-check-input"
                    id={`enabled_${index}`}
                    name="enabled"
                    role="switch"
                    type="checkbox"
            />
        </div>
    </td>

    <td data-label={getMessage('optionUrlPattern')}>
        <input
                aria-describedby={`filter_${index}_feedback`}
                bind:value={rule.filter}
                class="form-control"
                class:is-invalid={error?.filter}
                id={`filter_${index}`}
                minlength="1"
                name="filter"
                type="text"
        />
        <InputError error={error?.filter} id={`filter_${index}_feedback`}/>
    </td>

    <td data-label={getMessage('optionAction')}>
        <select
                aria-describedby={`operation_${index}_feedback`}
                bind:value={rule.operation}
                class="form-select"
                class:is-invalid={error?.operation}
                id={`operation_${index}`}
                name="operation"
                on:change={onChangeOperation}
        >
            <option value={chrome.declarativeNetRequest.HeaderOperation.SET}>{getMessage('optionActionValueSet')}</option>
            <option value={chrome.declarativeNetRequest.HeaderOperation.APPEND}>{getMessage('optionActionValueAppend')}</option>
            <option value={chrome.declarativeNetRequest.HeaderOperation.REMOVE}>{getMessage('optionActionValueRemove')}</option>
        </select>
        <InputError error={error?.operation} id={`operation_${index}_feedback`}/>
    </td>

    <td data-label={getMessage('optionHeaderField')}>
        <input
                aria-describedby={`field_${index}_feedback`}
                bind:value={rule.field}
                class="form-control"
                class:is-invalid={error?.field}
                id={`field_${index}`}
                minlength="1"
                name="field"
                type="text"
        />
        <InputError error={error?.field} id={`field_${index}_feedback`}/>
    </td>

    <td data-label={getMessage('optionHeaderValue')}>
        <input
                aria-describedby={`value_${index}_feedback`}
                bind:value={rule.value}
                class="form-control"
                class:is-invalid={error?.value}
                disabled={rule.operation === chrome.declarativeNetRequest.HeaderOperation.REMOVE}
                id={`value_${index}`}
                name="value"
                type="text"
        />
        <InputError error={error?.value} id={`value_${index}_feedback`}/>
    </td>

    <td data-label={getMessage('optionPriority')}>
        <input
                aria-describedby={`priority_${index}_feedback`}
                bind:value={rule.priority}
                class="form-control"
                class:is-invalid={error?.priority}
                id={`priority_${index}`}
                min="1"
                name="priority"
                placeholder="1"
                type="number"
        />
        <InputError error={error?.priority} id={`priority_${index}_feedback`}/>
    </td>

    <td data-label={getMessage('optionApplyOn')}>
        <select
                aria-describedby={`applyOn_${index}_feedback`}
                bind:value={rule.applyOn}
                class="form-select"
                class:is-invalid={error?.applyOn}
                id={`applyOn_${index}`}
                name="applyOn"
        >
            <option value={ApplyOn.REQUEST}>{getMessage('optionApplyOnValueRequest')}</option>
            <option value={ApplyOn.RESPONSE}>{getMessage('optionApplyOnValueResponse')}</option>
        </select>
        <InputError error={error?.operation} id={`applyOn_${index}_feedback`}/>
    </td>

    <td>
        <button
                class="btn btn-xl-sm btn-outline-danger"
                on:click={() => options.removeRule(index)}
                type="button"
        >❌
        </button>
    </td>

</tr>
