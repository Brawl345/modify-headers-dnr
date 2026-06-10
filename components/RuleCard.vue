<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { RESOURCE_TYPES } from '../lib/dnr';
import { t } from '../lib/i18n';
import { ApplyOn, type FilterRule, HeaderOperation, type RuleError } from '../lib/types';
import Icon from './Icon.vue';
import ToggleSwitch from './ToggleSwitch.vue';

const props = defineProps<{
  rule: FilterRule;
  open: boolean;
  error?: RuleError;
  index: number;
}>();

const emit = defineEmits<{
  toggle: [];
  duplicate: [];
  remove: [];
}>();

const applyOnOptions = Object.entries(ApplyOn) as [string, ApplyOn][];

const hasError = computed(
  () => !!props.error && Object.keys(props.error).length > 0,
);

const operationLabel = computed(() => {
  switch (props.rule.operation) {
    case HeaderOperation.APPEND:
      return t('optionActionValueAppend');
    case HeaderOperation.REMOVE:
      return t('optionActionValueRemove');
    default:
      return t('optionActionValueSet');
  }
});

// Clearing the value when switching to "remove" mirrors that the field is unused.
watch(
  () => props.rule.operation,
  (operation) => {
    if (operation === HeaderOperation.REMOVE) {
      props.rule.value = '';
    }
  },
);

// Newer browser resource types may lack a translation; humanize their value.
const resourceTypeLabel = (key: string, value: string): string => {
  const label = t(`optionResourceTypesValue_${key}`);
  if (!label.startsWith('??')) return label;
  return value
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const selectAllResourceTypes = (): void => {
  props.rule.resourceTypes = RESOURCE_TYPES.map(([, value]) => value);
};

const selectNoResourceTypes = (): void => {
  props.rule.resourceTypes = [];
};

const uid = (suffix: string): string => `rule-${props.index}-${suffix}`;

// Two-tap delete confirmation: the first click arms it, a second within the
// window confirms; it disarms itself after a few seconds.
const confirmingRemove = ref(false);
let removeTimer: ReturnType<typeof setTimeout> | undefined;

const onRemoveClick = (): void => {
  if (confirmingRemove.value) {
    clearTimeout(removeTimer);
    confirmingRemove.value = false;
    emit('remove');
    return;
  }
  confirmingRemove.value = true;
  removeTimer = setTimeout(() => {
    confirmingRemove.value = false;
  }, 3000);
};

onBeforeUnmount(() => clearTimeout(removeTimer));
</script>

<template>
  <div class="card" :class="{ open, invalid: hasError }">
    <!-- Compact summary row -->
    <div class="summary" @click="emit('toggle')">
      <ToggleSwitch v-model="rule.enabled" />

      <span class="op-badge" :class="rule.operation">{{ operationLabel }}</span>

      <div class="summary-main">
        <div class="header-line">
          <span class="field">{{ rule.field || t('summaryNoField') }}</span>
          <span
            v-if="rule.operation !== HeaderOperation.REMOVE && rule.value"
            class="value"
          >: {{ rule.value }}</span>
        </div>
        <span class="filter">{{ rule.filter || t('summaryNoFilter') }}</span>
      </div>

      <div class="apply-badges">
        <span v-for="[key, value] in applyOnOptions" :key="key">
          <span v-if="rule.applyOn.includes(value)" class="apply-badge">
            {{ t(`optionApplyOnValue_${key}`) }}
          </span>
        </span>
      </div>

      <span v-if="hasError" class="error-dot" :title="t('summaryHasErrors')">!</span>

      <div class="summary-actions" @click.stop>
        <button
          type="button"
          class="btn btn-sm"
          :aria-expanded="open"
          @click="emit('toggle')"
        >
          {{ open ? t('optionDone') : t('optionEdit') }}
        </button>
        <button
          type="button"
          class="btn btn-sm btn-icon"
          :title="t('optionDuplicate')"
          @click="emit('duplicate')"
        ><Icon name="clone" /></button>
        <button
          type="button"
          class="btn btn-sm"
          :class="confirmingRemove ? 'btn-danger' : 'btn-icon'"
          :title="t('optionRemove')"
          @click="onRemoveClick"
        >
          <template v-if="confirmingRemove">{{ t('optionConfirmRemove') }}</template>
          <Icon v-else name="trash" />
        </button>
      </div>
    </div>

    <!-- Expandable edit form -->
    <div class="expandable" :class="{ open }">
      <div class="expandable-inner">
        <div class="form-grid">
          <div class="col-full">
            <label class="field-label" :for="uid('filter')">{{ t('optionUrlPattern') }}</label>
            <input
              :id="uid('filter')"
              v-model="rule.filter"
              type="text"
              class="input mono"
              :class="{ invalid: error?.filter }"
            />
            <span v-if="error?.filter" class="error-text">{{ error.filter }}</span>
          </div>

          <div class="col-half">
            <label class="field-label" :for="uid('operation')">{{ t('optionAction') }}</label>
            <select
              :id="uid('operation')"
              v-model="rule.operation"
              class="select"
              :class="{ invalid: error?.operation }"
            >
              <option :value="HeaderOperation.SET">{{ t('optionActionValueSet') }}</option>
              <option :value="HeaderOperation.APPEND">{{ t('optionActionValueAppend') }}</option>
              <option :value="HeaderOperation.REMOVE">{{ t('optionActionValueRemove') }}</option>
            </select>
            <span v-if="error?.operation" class="error-text">{{ error.operation }}</span>
          </div>

          <div class="col-half">
            <label class="field-label" :for="uid('priority')">{{ t('optionPriority') }}</label>
            <input
              :id="uid('priority')"
              v-model.number="rule.priority"
              type="number"
              min="1"
              placeholder="1"
              class="input"
              :class="{ invalid: error?.priority }"
            />
            <span v-if="error?.priority" class="error-text">{{ error.priority }}</span>
          </div>

          <div class="col-half">
            <label class="field-label" :for="uid('field')">{{ t('optionHeaderField') }}</label>
            <input
              :id="uid('field')"
              v-model="rule.field"
              type="text"
              class="input mono"
              :class="{ invalid: error?.field }"
            />
            <span v-if="error?.field" class="error-text">{{ error.field }}</span>
          </div>

          <div class="col-half">
            <label class="field-label" :for="uid('value')">{{ t('optionHeaderValue') }}</label>
            <input
              :id="uid('value')"
              v-model="rule.value"
              type="text"
              class="input mono"
              :class="{ invalid: error?.value }"
              :disabled="rule.operation === HeaderOperation.REMOVE"
            />
            <span v-if="error?.value" class="error-text">{{ error.value }}</span>
          </div>

          <div class="col-full">
            <span class="field-label">{{ t('optionApplyOn') }}</span>
            <div class="checks">
              <label v-for="[key, value] in applyOnOptions" :key="key" class="check">
                <input v-model="rule.applyOn" type="checkbox" :value="value" />
                <span>{{ t(`optionApplyOnValue_${key}`) }}</span>
              </label>
            </div>
            <span v-if="error?.applyOn" class="error-text">{{ error.applyOn }}</span>
          </div>

          <div class="col-full">
            <span class="field-label">{{ t('optionResourceTypes') }}</span>
            <div class="checks">
              <label v-for="[key, value] in RESOURCE_TYPES" :key="key" class="check">
                <input v-model="rule.resourceTypes" type="checkbox" :value="value" />
                <span>{{ resourceTypeLabel(key, value) }}</span>
              </label>
            </div>
            <div class="resource-actions">
              <button type="button" class="btn btn-sm" @click="selectAllResourceTypes">
                {{ t('optionResourceTypesSelectAll') }}
              </button>
              <button type="button" class="btn btn-sm" @click="selectNoResourceTypes">
                {{ t('optionResourceTypesSelectNone') }}
              </button>
            </div>
            <span v-if="error?.resourceTypes" class="error-text">{{ error.resourceTypes }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  overflow: hidden;
  transition: border-color 0.15s ease;
}

.card.open {
  border-color: var(--accent);
}

.card.invalid:not(.open) {
  border-color: var(--danger);
}

.summary {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  min-height: 56px;
  cursor: pointer;
}

.summary:hover {
  background: var(--surface-hover);
}

.op-badge {
  flex-shrink: 0;
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  border-radius: 999px;
  color: var(--accent);
  background: var(--accent-soft);
}

.op-badge.append {
  color: var(--warning);
  background: var(--warning-soft);
}

.op-badge.remove {
  color: var(--danger);
  background: var(--danger-soft);
}

.summary-main {
  flex: 1;
  min-width: 0;
}

.header-line {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.field {
  font-weight: 600;
}

.value {
  color: var(--text-muted);
}

.filter {
  display: block;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12px;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.apply-badges {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.apply-badge {
  padding: 1px 6px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  border-radius: 4px;
  color: var(--text-muted);
  background: var(--surface-2);
}

.error-dot {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  background: var(--danger);
  border-radius: 50%;
}

.summary-actions {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

/* grid-template-rows animates between 0fr and 1fr without a hardcoded height */
.expandable {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.25s ease;
}

.expandable.open {
  grid-template-rows: 1fr;
}

.expandable-inner {
  overflow: hidden;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
  padding: 4px 16px 18px;
  border-top: 1px solid var(--border);
}

.col-full {
  grid-column: 1 / -1;
}

.col-half {
  grid-column: span 1;
}

.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
}

.checks {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
}

.check {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.check input {
  accent-color: var(--accent);
}

.resource-actions {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.error-text {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: var(--danger);
}

@media (max-width: 560px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  /* Keep the URL pattern visible on narrow screens; drop the less essential
     apply-on badges to free up horizontal space. */
  .apply-badges {
    display: none;
  }
}
</style>
