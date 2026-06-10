<script setup lang="ts">
import {
  nextTick,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  toRaw,
  watch,
} from 'vue';
import HelpDialog from '../../components/HelpDialog.vue';
import Icon from '../../components/Icon.vue';
import RuleCard from '../../components/RuleCard.vue';
import ToggleSwitch from '../../components/ToggleSwitch.vue';
import { constructNewRules, MAX_NUMBER_OF_RULES, applyRules } from '../../lib/dnr';
import { t } from '../../lib/i18n';
import { getOptions, newRule, saveOptions } from '../../lib/storage';
import type { FilterRule, Options, RuleError } from '../../lib/types';
import { validateRules } from '../../lib/validation';

interface Entry {
  uid: number;
  rule: FilterRule;
}

let uidCounter = 0;
const nextUid = (): number => ++uidCounter;

const loading = ref(true);
const enabled = ref(true);
const format = ref(3);
const entries = ref<Entry[]>([]);
const errors = ref<Record<number, RuleError>>({});
const openUids = reactive(new Set<number>());
const helpOpen = ref(false);
const dirty = ref(false);
// Only true once the initial load has settled, so loading data in doesn't count
// as a change. The deep watcher flushes asynchronously, so a plain loading flag
// wouldn't be reliable here.
const ready = ref(false);
const message = ref<{ text: string; kind: 'success' | 'error' } | null>(null);
let messageTimer: ReturnType<typeof setTimeout> | undefined;

// Mark unsaved changes whenever a rule or the global toggle changes.
watch(
  [entries, enabled],
  () => {
    if (ready.value) dirty.value = true;
  },
  { deep: true },
);

function onBeforeUnload(event: BeforeUnloadEvent): void {
  if (!dirty.value) return;
  event.preventDefault();
  event.returnValue = '';
}

onMounted(() => window.addEventListener('beforeunload', onBeforeUnload));
onBeforeUnmount(() =>
  window.removeEventListener('beforeunload', onBeforeUnload),
);

function show(text: string, kind: 'success' | 'error'): void {
  message.value = { text, kind };
  clearTimeout(messageTimer);
  if (kind === 'success') {
    messageTimer = setTimeout(() => {
      message.value = null;
    }, 3000);
  }
}

onMounted(async () => {
  document.title = `${t('extensionName')} | ${t('optionsPageTitle')}`;
  const options = await getOptions();
  enabled.value = options.enabled;
  format.value = options.format;
  entries.value = options.rules.map((rule) => ({ uid: nextUid(), rule }));
  loading.value = false;
  // Wait for the watcher to flush the initial assignment before arming it.
  await nextTick();
  ready.value = true;
});

function toggle(uid: number): void {
  if (openUids.has(uid)) {
    openUids.delete(uid);
  } else {
    openUids.add(uid);
  }
}

async function addRule(): Promise<void> {
  const uid = nextUid();
  entries.value.push({ uid, rule: newRule() });
  openUids.add(uid);
  await nextTick();
  document
    .querySelector(`[data-uid="${uid}"]`)
    ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function duplicate(index: number): void {
  const source = entries.value[index];
  if (!source) return;
  entries.value.splice(index + 1, 0, {
    uid: nextUid(),
    rule: structuredClone(toRaw(source.rule)),
  });
}

function remove(index: number): void {
  const [removed] = entries.value.splice(index, 1);
  if (removed) openUids.delete(removed.uid);
}

async function save(): Promise<void> {
  // Detach the reactive proxies into plain data before persisting/applying;
  // proxies cannot be structured-cloned by the storage and DNR APIs.
  const rules: FilterRule[] = structuredClone(
    toRaw(entries.value).map((entry) => toRaw(entry.rule)),
  );
  const validation = validateRules(rules);

  const errorIndexes = Object.keys(validation).map(Number);
  const byUid: Record<number, RuleError> = {};
  for (const index of errorIndexes) {
    const entry = entries.value[index];
    const error = validation[index];
    if (entry && error) byUid[entry.uid] = error;
  }
  errors.value = byUid;

  if (errorIndexes.length > 0) {
    const firstIndex = errorIndexes[0] ?? 0;
    const firstEntry = entries.value[firstIndex];
    if (firstEntry) openUids.add(firstEntry.uid);
    await nextTick();
    document
      .querySelector(`[data-uid="${firstEntry?.uid}"]`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  if (enabled.value && constructNewRules(rules).length > MAX_NUMBER_OF_RULES) {
    show(t('errTooManyRules'), 'error');
    return;
  }

  const options: Options = {
    format: format.value,
    enabled: enabled.value,
    rules,
  };

  try {
    await applyRules(options);
    await saveOptions(options);
    dirty.value = false;
    show(t('successSaveOptions'), 'success');
  } catch (error) {
    const msg = (error as Error)?.message;
    console.error(error);
    show(msg || t('errorWhileSaving'), 'error');
  }
}
</script>

<template>
  <div class="page">
    <header class="toolbar">
      <h1 class="brand">{{ t('extensionName') }}</h1>
      <label class="global-toggle">
        <ToggleSwitch v-model="enabled" />
        <span>{{ t('optionGloballyEnabled') }}</span>
      </label>
      <div class="spacer"></div>
      <button type="button" class="btn" @click="helpOpen = true">
        {{ t('optionHelp') }}
      </button>
      <button type="button" class="btn btn-primary" @click="addRule">
        {{ t('optionAddRule') }}
      </button>
      <button
        type="button"
        class="btn btn-success save-btn"
        :class="{ dirty }"
        :title="dirty ? t('optionUnsavedChanges') : undefined"
        @click="save"
      >
        {{ t('optionSave') }}
        <span v-if="dirty" class="change-dot" aria-hidden="true"></span>
      </button>
    </header>

    <main class="content">
      <p v-if="loading" class="placeholder">…</p>

      <p v-else-if="entries.length === 0" class="placeholder">
        {{ t('optionNoRules') }}
      </p>

      <TransitionGroup v-else name="list" tag="div" class="rule-list">
        <RuleCard
          v-for="(entry, index) in entries"
          :key="entry.uid"
          :data-uid="entry.uid"
          :rule="entry.rule"
          :index="index"
          :open="openUids.has(entry.uid)"
          :error="errors[entry.uid]"
          @toggle="toggle(entry.uid)"
          @duplicate="duplicate(index)"
          @remove="remove(index)"
        />
      </TransitionGroup>
    </main>

    <HelpDialog :open="helpOpen" @close="helpOpen = false" />

    <Transition name="toast">
      <div v-if="message" class="toast" :class="message.kind">
        {{ message.text }}
        <button type="button" class="toast-close" @click="message = null"><Icon name="xmark" /></button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.page {
  max-width: 880px;
  margin: 0 auto;
  padding-bottom: 48px;
}

.toolbar {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 20px;
  background: color-mix(in srgb, var(--bg) 85%, transparent);
  backdrop-filter: saturate(180%) blur(12px);
  border-bottom: 1px solid var(--border);
}

.brand {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
}

.global-toggle {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-muted);
  cursor: pointer;
}

.spacer {
  flex: 1;
}

.save-btn {
  position: relative;
}

.save-btn.dirty {
  box-shadow: 0 0 0 3px var(--warning-soft);
}

.change-dot {
  position: absolute;
  top: -5px;
  right: -5px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--warning);
  border: 2px solid var(--bg);
  animation: pulse 1.8s ease-out infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 159, 10, 0.5);
  }
  70% {
    box-shadow: 0 0 0 7px rgba(255, 159, 10, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 159, 10, 0);
  }
}

.content {
  padding: 20px;
}

.rule-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.placeholder {
  text-align: center;
  color: var(--text-muted);
  padding: 48px 0;
}

.toast {
  position: fixed;
  left: 50%;
  bottom: 20px;
  transform: translateX(-50%);
  z-index: 50;
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: min(360px, calc(100vw - 40px));
  padding: 12px 16px;
  border-radius: var(--radius-sm);
  font-weight: 600;
  color: #fff;
  box-shadow: var(--shadow);
}

.toast.success {
  background: var(--success);
}

.toast.error {
  background: var(--danger);
}

.toast-close {
  margin-left: auto;
  display: inline-flex;
  background: none;
  border: none;
  color: inherit;
  opacity: 0.85;
  font-size: 13px;
}

.toast-close:hover {
  opacity: 1;
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(12px);
}

.list-enter-active,
.list-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.list-leave-active {
  position: absolute;
  width: 100%;
}

@media (max-width: 560px) {
  .brand {
    display: none;
  }
}
</style>
