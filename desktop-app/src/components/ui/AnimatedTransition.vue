<script setup lang="ts">
import { Transition } from 'vue'

interface Props {
  name?:
    | 'fade'
    | 'fade-up'
    | 'fade-down'
    | 'fade-left'
    | 'fade-right'
    | 'scale'
    | 'slide-left'
    | 'slide-right'
  mode?: 'in-out' | 'out-in' | 'default'
  duration?: number
}

withDefaults(defineProps<Props>(), {
  name: 'fade',
  mode: 'out-in',
  duration: 300,
})
</script>

<template>
  <Transition :name="name" :mode="mode === 'default' ? undefined : mode" :css="true">
    <slot />
  </Transition>
</template>

<style scoped>
/* Fade */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Fade Up */
.fade-up-enter-active,
.fade-up-leave-active {
  transition: all 0.3s ease-out;
}

.fade-up-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.fade-up-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Fade Down */
.fade-down-enter-active,
.fade-down-leave-active {
  transition: all 0.3s ease-out;
}

.fade-down-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.fade-down-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* Fade Left */
.fade-left-enter-active,
.fade-left-leave-active {
  transition: all 0.3s ease-out;
}

.fade-left-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.fade-left-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}

/* Fade Right */
.fade-right-enter-active,
.fade-right-leave-active {
  transition: all 0.3s ease-out;
}

.fade-right-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.fade-right-leave-to {
  opacity: 0;
  transform: translateX(10px);
}

/* Scale */
.scale-enter-active,
.scale-leave-active {
  transition: all 0.2s ease-out;
}

.scale-enter-from {
  opacity: 0;
  transform: scale(0.95);
}

.scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/* Slide Left */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.3s ease-out;
}

.slide-left-enter-from {
  transform: translateX(100%);
}

.slide-left-leave-to {
  transform: translateX(-100%);
}

/* Slide Right */
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s ease-out;
}

.slide-right-enter-from {
  transform: translateX(-100%);
}

.slide-right-leave-to {
  transform: translateX(100%);
}
</style>
