<script setup lang="ts">
import { TransitionGroup } from 'vue'

interface Props {
  tag?: string
  staggerDelay?: number
}

withDefaults(defineProps<Props>(), {
  tag: 'div',
  staggerDelay: 0.1,
})
</script>

<template>
  <TransitionGroup :tag="tag" name="stagger-fade" class="stagger-list">
    <slot />
  </TransitionGroup>
</template>

<style scoped>
.stagger-list {
  display: contents;
}

.stagger-fade-enter-active {
  transition: all 0.3s ease-out;
}

.stagger-fade-leave-active {
  transition: all 0.2s ease-out;
}

.stagger-fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.stagger-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.stagger-fade-move {
  transition: transform 0.3s ease-out;
}
</style>
