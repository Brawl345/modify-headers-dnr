<script setup lang="ts">
import { t } from '../lib/i18n';
import Icon from './Icon.vue';

defineProps<{ open: boolean }>();
const emit = defineEmits<{ close: [] }>();

const isFirefox = import.meta.env.FIREFOX;

const sections = [
  {
    title: 'optionUrlPattern',
    body: ['optionUrlPatternHelp'],
    href: 'https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/declarativeNetRequest/RuleCondition#regexfilter',
  },
  {
    title: 'optionAction',
    body: isFirefox
      ? ['optionActionHelp']
      : ['optionActionHelp', 'optionActionChromeHelp'],
    href: 'https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/declarativeNetRequest/ModifyHeaderInfo',
  },
  {
    title: 'optionPriority',
    body: ['optionPriorityHelp'],
    href: 'https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/declarativeNetRequest#matching_precedence',
  },
  {
    title: 'optionApplyOn',
    body: ['optionApplyOnHelp'],
  },
  {
    title: 'optionResourceTypes',
    body: ['optionResourceTypesHelp'],
    href: 'https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/declarativeNetRequest/ResourceType',
  },
];
</script>

<template>
  <Transition name="fade">
    <div v-if="open" class="overlay" @click.self="emit('close')">
      <div class="dialog" role="dialog" aria-modal="true">
        <header class="dialog-head">
          <h2>{{ t('optionHelp') }}</h2>
          <button type="button" class="btn btn-icon" :aria-label="t('optionHelpClose')" @click="emit('close')"><Icon name="xmark" /></button>
        </header>
        <div class="dialog-body">
          <section v-for="section in sections" :key="section.title">
            <a v-if="section.href" :href="section.href" target="_blank" rel="noopener" class="section-title">
              {{ t(section.title) }}
            </a>
            <h3 v-else class="section-title plain">{{ t(section.title) }}</h3>
            <p v-for="key in section.body" :key="key">{{ t(key) }}</p>
          </section>
        </div>
        <footer class="dialog-foot">
          <button type="button" class="btn btn-primary" @click="emit('close')">
            {{ t('optionHelpClose') }}
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
  max-width: 640px;
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
  border-top: 1px solid var(--border);
}

.dialog-body {
  padding: 6px 18px 18px;
  overflow-y: auto;
}

.section-title {
  display: inline-block;
  margin: 18px 0 4px;
  font-size: 15px;
  font-weight: 700;
}

.section-title.plain {
  color: var(--text);
}

.dialog-body p {
  margin: 0 0 8px;
  color: var(--text-muted);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
