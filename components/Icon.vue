<script setup lang="ts">
import circleQuestion from '../assets/icons/circle-question.svg?raw';
import clone from '../assets/icons/clone.svg?raw';
import ellipsisVertical from '../assets/icons/ellipsis-vertical.svg?raw';
import fileExport from '../assets/icons/file-export.svg?raw';
import fileImport from '../assets/icons/file-import.svg?raw';
import trash from '../assets/icons/trash.svg?raw';
import xmark from '../assets/icons/xmark.svg?raw';

const icons = {
  circleQuestion,
  clone,
  ellipsisVertical,
  fileExport,
  fileImport,
  trash,
  xmark,
} as const;

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
