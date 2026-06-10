<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { t } from '../lib/i18n';
import Icon from './Icon.vue';

const emit = defineEmits<{
  export: [];
  import: [];
  help: [];
}>();

const open = ref(false);
const root = ref<HTMLElement | null>(null);

function toggle(): void {
  open.value = !open.value;
}

function choose(action: 'export' | 'import' | 'help'): void {
  open.value = false;
  if (action === 'export') emit('export');
  else if (action === 'import') emit('import');
  else emit('help');
}

function onPointerDown(event: PointerEvent): void {
  if (open.value && root.value && !root.value.contains(event.target as Node)) {
    open.value = false;
  }
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') open.value = false;
}

onMounted(() => {
  document.addEventListener('pointerdown', onPointerDown);
  document.addEventListener('keydown', onKeydown);
});
onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onPointerDown);
  document.removeEventListener('keydown', onKeydown);
});
</script>

<template>
  <div ref="root" class="menu">
    <button
      type="button"
      class="btn btn-icon"
      :aria-label="t('optionMore')"
      :aria-expanded="open"
      aria-haspopup="menu"
      @click="toggle"
    >
      <Icon name="ellipsisVertical" />
    </button>

    <Transition name="menu-pop">
      <ul v-if="open" class="dropdown" role="menu">
        <li role="none">
          <button type="button" role="menuitem" @click="choose('export')">
            <Icon name="fileExport" />
            <span>{{ t('optionExport') }}</span>
          </button>
        </li>
        <li role="none">
          <button type="button" role="menuitem" @click="choose('import')">
            <Icon name="fileImport" />
            <span>{{ t('optionImport') }}</span>
          </button>
        </li>
        <li role="none">
          <button type="button" role="menuitem" @click="choose('help')">
            <Icon name="circleQuestion" />
            <span>{{ t('optionHelp') }}</span>
          </button>
        </li>
      </ul>
    </Transition>
  </div>
</template>

<style scoped>
.menu {
  position: relative;
  display: inline-flex;
}

.dropdown {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  z-index: 20;
  min-width: 180px;
  margin: 0;
  padding: 6px;
  list-style: none;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow);
}

.dropdown button {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 8px 10px;
  border: none;
  border-radius: var(--radius-sm);
  background: none;
  color: var(--text);
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.dropdown button:hover {
  background: var(--surface-hover);
}

.dropdown :deep(.icon) {
  color: var(--text-muted);
  width: 16px;
  justify-content: center;
}

.menu-pop-enter-active,
.menu-pop-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
  transform-origin: top right;
}

.menu-pop-enter-from,
.menu-pop-leave-to {
  opacity: 0;
  transform: scale(0.96) translateY(-4px);
}
</style>
