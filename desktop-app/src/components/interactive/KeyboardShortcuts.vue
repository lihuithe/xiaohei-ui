<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

interface Shortcut {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  meta?: boolean
  action: () => void
  preventDefault?: boolean
  description?: string
}

interface KeyboardShortcutsProps {
  shortcuts: Shortcut[]
}

const props = defineProps<KeyboardShortcutsProps>()

function handleKeyDown(event: KeyboardEvent) {
  for (const shortcut of props.shortcuts) {
    const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase()
    const ctrlMatch = !!shortcut.ctrl === event.ctrlKey
    const shiftMatch = !!shortcut.shift === event.shiftKey
    const altMatch = !!shortcut.alt === event.altKey
    const metaMatch = !!shortcut.meta === event.metaKey

    if (keyMatch && ctrlMatch && shiftMatch && altMatch && metaMatch) {
      if (shortcut.preventDefault !== false) {
        event.preventDefault()
      }
      shortcut.action()
      break
    }
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
})
</script>

<template>
  <div class="keyboard-shortcuts">
    <slot></slot>
  </div>
</template>

<style scoped>
.keyboard-shortcuts {
  display: none;
}
</style>
