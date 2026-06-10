<script setup lang="ts">
import { ref, watch } from 'vue';
import { t } from '../lib/i18n';
import { ImportError, MAX_IMPORT_RULES, parseImport } from '../lib/transfer';
import type { FilterRule } from '../lib/types';
import Icon from './Icon.vue';

const props = defineProps<{ open: boolean }>();
const emit = defineEmits<{
  close: [];
  import: [payload: { rules: FilterRule[]; replaceAll: boolean }];
}>();

// Reject obviously oversized files before reading them into memory.
const MAX_FILE_BYTES = 5_000_000;

const fileInput = ref<HTMLInputElement | null>(null);
const fileName = ref('');
const replaceAll = ref(false);
const error = ref('');
const busy = ref(false);
let file: File | null = null;

watch(
  () => props.open,
  (open) => {
    if (!open) reset();
  },
);

function reset(): void {
  file = null;
  fileName.value = '';
  replaceAll.value = false;
  error.value = '';
  busy.value = false;
  if (fileInput.value) fileInput.value.value = '';
}

function onFileChange(event: Event): void {
  error.value = '';
  const target = event.target as HTMLInputElement;
  const selected = target.files?.[0] ?? null;
  file = selected;
  fileName.value = selected?.name ?? '';
}

async function doImport(): Promise<void> {
  if (!file || busy.value) return;
  error.value = '';

  if (file.size > MAX_FILE_BYTES) {
    error.value = t('importErrorTooLarge');
    return;
  }

  busy.value = true;
  try {
    const text = await file.text();
    const rules = parseImport(text);
    emit('import', { rules, replaceAll: replaceAll.value });
  } catch (err) {
    error.value =
      err instanceof ImportError
        ? t(err.message)
        : t('importErrorInvalidFile');
  } finally {
    busy.value = false;
  }
}
</script>

<template>
  <Transition name="fade">
    <div v-if="open" class="overlay" @click.self="emit('close')">
      <div class="dialog" role="dialog" aria-modal="true">
        <header class="dialog-head">
          <h2>{{ t('importDialogTitle') }}</h2>
          <button type="button" class="btn btn-icon" :aria-label="t('importCancel')" @click="emit('close')"><Icon name="xmark" /></button>
        </header>

        <div class="dialog-body">
          <p class="hint">{{ t('importHint') }}</p>

          <label class="file-row">
            <span class="btn">{{ t('importChooseFile') }}</span>
            <span class="file-name">{{ fileName || t('importNoFile') }}</span>
            <input
              ref="fileInput"
              type="file"
              accept="application/json,.json"
              class="file-input"
              @change="onFileChange"
            />
          </label>

          <label class="check-row">
            <input type="checkbox" v-model="replaceAll" />
            <span>{{ t('importReplaceAll') }}</span>
          </label>

          <p v-if="error" class="error">{{ error }}</p>
          <p class="limit">{{ t('importMaxRules', String(MAX_IMPORT_RULES)) }}</p>
        </div>

        <footer class="dialog-foot">
          <button type="button" class="btn" @click="emit('close')">
            {{ t('importCancel') }}
          </button>
          <button
            type="button"
            class="btn btn-primary"
            :disabled="!fileName || busy"
            @click="doImport"
          >
            {{ t('importConfirm') }}
          </button>
        </footer>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(0, 0, 0, 0.4);
  z-index: 100;
}

.dialog {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 480px;
  max-height: 85vh;
  background: var(--surface);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  overflow: hidden;
}

.dialog-head,
.dialog-foot {
  display: flex;
  align-items: center;
  padding: 14px 18px;
}

.dialog-head {
  justify-content: space-between;
  border-bottom: 1px solid var(--border);
}

.dialog-head h2 {
  margin: 0;
  font-size: 17px;
}

.dialog-foot {
  justify-content: flex-end;
  gap: 10px;
  border-top: 1px solid var(--border);
}

.dialog-body {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px 18px;
  overflow-y: auto;
}

.hint {
  margin: 0;
  color: var(--text-muted);
  font-size: 13px;
}

.file-row {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.file-name {
  font-size: 13px;
  color: var(--text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-input {
  display: none;
}

.check-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  cursor: pointer;
}

.error {
  margin: 0;
  color: var(--danger);
  font-size: 13px;
  font-weight: 600;
}

.limit {
  margin: 0;
  color: var(--text-muted);
  font-size: 12px;
}
</style>
