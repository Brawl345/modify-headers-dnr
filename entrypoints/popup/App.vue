<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { browser } from 'wxt/browser';
import ToggleSwitch from '../../components/ToggleSwitch.vue';
import { applyRules } from '../../lib/dnr';
import { t } from '../../lib/i18n';
import { getOptions, saveOptions } from '../../lib/storage';

const enabled = ref(true);
const activeCount = ref(0);
const loading = ref(true);
const busy = ref(false);

onMounted(async () => {
  const options = await getOptions();
  enabled.value = options.enabled;
  activeCount.value = options.rules.filter((rule) => rule.enabled).length;
  loading.value = false;
});

watch(enabled, async (value) => {
  if (loading.value) return;
  busy.value = true;
  try {
    const options = await getOptions();
    options.enabled = value;
    await saveOptions(options);
    await applyRules(options);
  } finally {
    busy.value = false;
  }
});

function openOptions(): void {
  browser.runtime.openOptionsPage();
  window.close();
}
</script>

<template>
  <div class="popup">
    <div class="row">
      <div class="status">
        <span class="title">{{ t('extensionName') }}</span>
        <span class="sub">
          {{ enabled ? t('popupActiveRules', String(activeCount)) : t('popupDisabled') }}
        </span>
      </div>
      <ToggleSwitch v-model="enabled" :disabled="busy" />
    </div>

    <button type="button" class="btn btn-primary full" @click="openOptions">
      {{ t('popupOpenOptions') }}
    </button>
  </div>
</template>

<style scoped>
.popup {
  width: 280px;
  padding: 14px;
}

.row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 4px 0 12px;
}

.status {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.title {
  font-weight: 700;
}

.sub {
  font-size: 12px;
  color: var(--text-muted);
}

.full {
  width: 100%;
  justify-content: center;
}
</style>
