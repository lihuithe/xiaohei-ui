<script setup lang="ts">
import { TransitionGroup } from 'vue'

interface AnimatedListProps {
  tag?: string
  name?: string
}

withDefaults(defineProps<AnimatedListProps>(), {
  tag: 'div',
  name: 'list',
})
</script>

<template>
  <TransitionGroup tag="div" name="list" class="animated-list">
    <slot></slot>
  </TransitionGroup>
</template>

<style scoped>
.animated-list {
  display: flex;
  flex-direction: column;
}

.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}

.list-leave-active {
  position: absolute;
}
</style>
