<script setup lang="ts">
defineProps<{ title: string, open: boolean }>()
defineEmits<{ close: [] }>()
</script>

<template>
  <div v-if="open" class="backdrop" @click="$emit('close')">
    <div class="modal" @click.stop>
      <header>
        <h3>{{ title }}</h3>
        <button class="icon" @click="$emit('close')">✕</button>
      </header>
      <section class="content">
        <slot />
      </section>
    </div>
  </div>
</template>

<style scoped>
.backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: grid;
  place-items: center;
  z-index: 50;
}
.modal {
  width: min(640px, calc(100vw - 24px));
  background: var(--color-background);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--color-border);
}
header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
}
.content { 
  padding: 24px; 
}
.icon {
  background: transparent;
  border: none;
  font-size: 20px;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 120ms;
}
.icon:hover {
  background: var(--color-background-secondary);
  color: var(--color-text-primary);
}
</style>


