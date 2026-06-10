<script setup lang="ts">
import clone from '../assets/icons/clone.svg?raw';
import trash from '../assets/icons/trash.svg?raw';
import xmark from '../assets/icons/xmark.svg?raw';

const icons = { clone, trash, xmark } as const;

defineProps<{ name: keyof typeof icons }>();
</script>

<template>
  <!-- Inlined local SVG so it inherits currentColor; no webfont, no CDN. -->
  <span class="icon" aria-hidden="true" v-html="icons[name]"></span>
</template>

<style scoped>
.icon {
  display: inline-flex;
  line-height: 0;
}

.icon :deep(svg) {
  width: 1em;
  height: 1em;
  fill: currentColor;
}
</style>
