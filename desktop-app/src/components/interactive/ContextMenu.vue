<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'

interface MenuItem {
  id: string
  label: string
  icon?: any
  disabled?: boolean
  divider?: boolean
  children?: MenuItem[]
  action?: () => void
}

interface ContextMenuProps {
  visible: boolean
  x: number
  y: number
  items: MenuItem[]
}

const props = defineProps<ContextMenuProps>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const menuRef = ref<HTMLElement>()
const adjustedX = ref(0)
const adjustedY = ref(0)

function closeMenu() {
  emit('close')
}

function handleItemClick(item: MenuItem) {
  if (item.disabled) return
  if (item.action) {
    item.action()
  }
  closeMenu()
}

function adjustPosition() {
  if (!menuRef.value) return

  let x = props.x
  let y = props.y

  const menuWidth = menuRef.value.offsetWidth
  const menuHeight = menuRef.value.offsetHeight
  const windowWidth = window.innerWidth
  const windowHeight = window.innerHeight

  if (x + menuWidth > windowWidth) {
    x = windowWidth - menuWidth - 10
  }
  if (y + menuHeight > windowHeight) {
    y = windowHeight - menuHeight - 10
  }

  adjustedX.value = x
  adjustedY.value = y
}

watch(
  () => [props.visible, props.x, props.y],
  () => {
    if (props.visible) {
      nextTick(() => adjustPosition())
    }
  }
)

onMounted(() => {
  document.addEventListener('click', closeMenu)
  document.addEventListener('contextmenu', closeMenu)
})

onUnmounted(() => {
  document.removeEventListener('click', closeMenu)
  document.removeEventListener('contextmenu', closeMenu)
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="visible"
      ref="menuRef"
      class="context-menu"
      :style="{ left: `${adjustedX}px`, top: `${adjustedY}px` }"
      @click.stop
    >
      <template v-for="item in items" :key="item.id">
        <div v-if="item.divider" class="menu-divider"></div>
        <button
          v-else
          class="menu-item"
          :class="{ disabled: item.disabled }"
          @click="handleItemClick(item)"
        >
          <component :is="item.icon" v-if="item.icon" class="menu-icon" :size="16" />
          <span class="menu-label">{{ item.label }}</span>
        </button>
      </template>
    </div>
  </Teleport>
</template>

<style scoped>
.context-menu {
  position: fixed;
  z-index: 9999;
  min-width: 200px;
  background: var(--background);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  padding: 4px;
}

.menu-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border: none;
  background: transparent;
  color: var(--foreground);
  font-size: 14px;
  text-align: left;
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: background 0.15s;
}

.menu-item:hover:not(.disabled) {
  background: var(--accent);
}

.menu-item.disabled {
  color: var(--muted-foreground);
  cursor: not-allowed;
  opacity: 0.5;
}

.menu-icon {
  color: var(--muted-foreground);
}

.menu-divider {
  height: 1px;
  background: var(--border);
  margin: 4px 0;
}
</style>
