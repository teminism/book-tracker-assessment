<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ modelValue: number, readonly?: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [number] }>()

const stars = computed(() => [1,2,3,4,5])

function set(r: number, event: Event) {
  if (props.readonly) return
  event.stopPropagation()
  emit('update:modelValue', r)
}
</script>

<template>
  <div class="stars">
    <button v-for="s in stars" :key="s" class="star" :class="{ on: s <= modelValue && modelValue > 0 }" @click="set(s, $event)" :disabled="readonly">
      ★
    </button>
  </div>
  
</template>

<style scoped>
.stars { display: inline-flex; gap: 4px; }
.star {
  padding: 0;
  margin: 0;
  background: transparent;
  border: none;
  color: #d1d5db;
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  transition: color 120ms;
}
.star.on { color: #f59e0b; }
.star:disabled { cursor: default; }
.star:not(:disabled):hover { color: #f59e0b; }
</style>


