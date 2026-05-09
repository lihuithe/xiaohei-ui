<script setup lang="ts">
interface Props {
  class?: string
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string
  height?: string
}

withDefaults(defineProps<Props>(), {
  class: '',
  variant: 'text',
  width: '',
  height: '',
})

const variantClasses = {
  text: 'h-4 rounded',
  circular: 'rounded-full',
  rectangular: 'rounded-md',
}
</script>

<template>
  <div
    :class="[
      'bg-muted animate-shimmer',
      variantClasses[variant],
      class,
    ]"
    :style="{
      width: width,
      height: height,
    }"
  ></div>
</template>
