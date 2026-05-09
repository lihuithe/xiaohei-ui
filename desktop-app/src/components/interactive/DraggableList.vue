<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import Sortable from 'sortablejs'

interface DraggableListProps {
  items?: any[]
  itemKey?: string
  animation?: number
  handle?: string
  group?: string | object
}

const props = withDefaults(defineProps<DraggableListProps>(), {
  itemKey: 'id',
  animation: 150,
})

const emit = defineEmits<{
  (e: 'update:items', items: any[]): void
  (e: 'change', event: any): void
  (e: 'start', event: any): void
  (e: 'end', event: any): void
}>()

const listRef = ref<HTMLElement>()
let sortableInstance: Sortable | null = null

onMounted(() => {
  if (listRef.value) {
    sortableInstance = new Sortable(listRef.value, {
      animation: props.animation,
      handle: props.handle,
      group: props.group,
      onStart: (evt) => emit('start', evt),
      onEnd: (evt) => emit('end', evt),
      onChange: (evt) => emit('change', evt),
      onUpdate: (evt) => {
        if (props.items) {
          const newItems = [...props.items]
          const [movedItem] = newItems.splice(evt.oldIndex!, 1)
          newItems.splice(evt.newIndex!, 0, movedItem)
          emit('update:items', newItems)
        }
      },
    })
  }
})

onUnmounted(() => {
  sortableInstance?.destroy()
})
</script>

<template>
  <div ref="listRef" class="draggable-list">
    <slot></slot>
  </div>
</template>

<style scoped>
.draggable-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.draggable-list :deep(.sortable-ghost) {
  opacity: 0.4;
}

.draggable-list :deep(.sortable-chosen) {
  background: var(--accent);
}

.draggable-list :deep(.sortable-drag) {
  background: var(--background);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
</style>
