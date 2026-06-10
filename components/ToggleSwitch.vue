<script setup lang="ts">
const model = defineModel<boolean>({ required: true });
defineProps<{ disabled?: boolean }>();
</script>

<template>
  <label class="switch" @click.stop>
    <input v-model="model" type="checkbox" :disabled="disabled" />
    <span class="track"></span>
    <span class="thumb"></span>
  </label>
</template>
