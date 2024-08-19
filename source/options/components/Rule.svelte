<script lang="ts">
import { fly } from 'svelte/transition';
import { ApplyOn, type FilterRule, type RuleError } from '../../types';
import { getMessage, resourceTypes } from '../../utils';
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

const selectAllResourceTypes = () => {
  rule.resourceTypes = Object.values(chrome.declarativeNetRequest.ResourceType);
};

const selectNoResourceTypes = () => {
  rule.resourceTypes = [];
};
</script>

<div class="card mb-3" transition:fly={{ duration: 200 }}>
    <div class="card-body">
        <div class="row g-3">

            <div class="col-12">
                <div class="form-check form-switch">
                    <input
                        bind:checked={rule.enabled}
                        class="form-check-input"
                        id={`enabled_${index}`}
                        name="enabled"
                        role="switch"
                        type="checkbox"
                    />
                    <label class="form-check-label" for={`enabled_${index}`}>{getMessage('optionEnabled')}</label>
                </div>
            </div>

            <div class="col-md-6">
                <label for={`filter_${index}`} class="form-label fw-light">{getMessage('optionUrlPattern')}</label>
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
            </div>

            <div class="col-md-3">
                <label for={`operation_${index}`} class="form-label fw-light">{getMessage('optionAction')}</label>
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
            </div>

            <div class="col-md-3">
                <label for={`priority_${index}`} class="form-label fw-light">{getMessage('optionPriority')}</label>
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
            </div>

            <div class="col-md-6">
                <label for={`field_${index}`} class="form-label fw-light">{getMessage('optionHeaderField')}</label>
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
            </div>

            <div class="col-md-6">
                <label for={`value_${index}`} class="form-label fw-light">{getMessage('optionHeaderValue')}</label>
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
            </div>

            <div class="col-md-3">
                <label for={`applyOn_${index}`} class="form-label fw-light">{getMessage('optionApplyOn')}</label>
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
            </div>

            <div class="col-md-9">
                <span class="d-block form-label fw-light normal-cursor">{getMessage('optionResourceTypes')}</span>

                <div class="d-flex flex-wrap">
                    {#each resourceTypes as [key, value]}
                        <div class="form-check me-3 mb-2">
                            <input
                                id={`resourceTypes_${index}_${key}`}
                                class="form-check-input"
                                class:is-invalid={error?.resourceTypes}
                                type="checkbox"
                                bind:group={rule.resourceTypes}
                                value={value}
                                checked={rule.resourceTypes.includes(value)}
                                aria-describedby={`resourceTypes_${index}_feedback`}
                            >
                            <label class="form-check-label" for={`resourceTypes_${index}_${key}`}>
                                {getMessage(`optionResourceTypesValue_${key}`)}
                            </label>
                        </div>
                    {/each}
                </div>

                <div class="d-flex gap-2 mt-2">
                    <button type="button" class="btn btn-sm btn-outline-secondary" on:click={selectAllResourceTypes}>
                        {getMessage('optionResourceTypesSelectAll')}
                    </button>
                    <button type="button" class="btn btn-sm btn-outline-secondary" on:click={selectNoResourceTypes}>
                        {getMessage('optionResourceTypesSelectNone')}
                    </button>
                </div>

                {#if !!error?.resourceTypes}
                    <span id={`resourceTypes_${index}_feedback`} class="invalid-feedback d-block">{error?.resourceTypes}</span>
                {/if}
            </div>

        </div>

        <div class="mt-3">
            <div class="text-end">
                <button type="button" on:click={() => options.duplicateRule(index)} class="btn btn-outline-secondary me-2">
                    📄 {getMessage('optionDuplicate')}
                </button>
                <button type="button" on:click={() => options.removeRule(index)} class="btn btn-outline-danger">
                    ❌ {getMessage('optionRemove')}
                </button>
            </div>
        </div>
    </div>
</div>

