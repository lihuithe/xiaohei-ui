<template>
  <div class="enhanced-tabs">
    <div class="tabs-header">
      <div ref="tabsListRef" class="tabs-list">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="tab-item"
          :class="{
            'tab-item--active': activeTabId === tab.id,
            'tab-item--closable': tab.closable,
          }"
          @click="selectTab(tab.id)"
        >
          <component :is="tab.icon" v-if="tab.icon" class="w-4 h-4" />
          <span class="tab-item__title">{{ tab.title }}</span>
          <Button
            v-if="tab.closable !== false"
            variant="ghost"
            size="icon"
            class="tab-item__close"
            @click.stop="closeTab(tab.id)"
          >
            <XIcon class="w-4 h-4" />
          </Button>
        </button>
      </div>
      <div class="tabs-actions">
        <Button
          v-if="scrollable"
          variant="ghost"
          size="icon"
          :disabled="!canScrollLeft"
          @click="scrollLeft"
        >
          <ChevronLeftIcon class="w-4 h-4" />
        </Button>
        <Button
          v-if="scrollable"
          variant="ghost"
          size="icon"
          :disabled="!canScrollRight"
          @click="scrollRight"
        >
          <ChevronRightIcon class="w-4 h-4" />
        </Button>
        <slot name="actions" />
      </div>
    </div>
    <div class="tabs-content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Button } from '@/components/ui/button'
import {
  X as XIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from 'lucide-vue-next'

interface Tab {
  id: string
  title: string
  icon?: any
  closable?: boolean
}

interface Props {
  modelValue: string
  tabs: Tab[]
  scrollable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  scrollable: true,
})

const emit = defineEmits<{
  'update:modelValue': [id: string]
  'tab-close': [id: string]
  'tab-select': [id: string]
}>()

const tabsListRef = ref<HTMLDivElement | null>(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(false)

const activeTabId = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

function selectTab(id: string) {
  activeTabId.value = id
  emit('tab-select', id)
}

function closeTab(id: string) {
  emit('tab-close', id)
}

function scrollLeft() {
  if (tabsListRef.value) {
    tabsListRef.value.scrollBy({ left: -200, behavior: 'smooth' })
  }
}

function scrollRight() {
  if (tabsListRef.value) {
    tabsListRef.value.scrollBy({ left: 200, behavior: 'smooth' })
  }
}

function checkScroll() {
  if (tabsListRef.value) {
    const el = tabsListRef.value
    canScrollLeft.value = el.scrollLeft > 10
    canScrollRight.value = el.scrollLeft < el.scrollWidth - el.clientWidth - 10
  }
}

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  if (tabsListRef.value && window.ResizeObserver) {
    resizeObserver = new ResizeObserver(checkScroll)
    resizeObserver.observe(tabsListRef.value)
  }
  checkScroll()
  tabsListRef.value?.addEventListener('scroll', checkScroll)
})

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
  tabsListRef.value?.removeEventListener('scroll', checkScroll)
})
</script>

<style scoped>
.enhanced-tabs {
  @apply flex flex-col h-full;
}

.tabs-header {
  @apply flex items-center gap-2 border-b px-2;
}

.tabs-list {
  @apply flex-1 flex items-center gap-1 overflow-x-auto scrollbar-hide;
}

.tabs-list::-webkit-scrollbar {
  display: none;
}

.tab-item {
  @apply flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted whitespace-nowrap transition-all border-2 border-transparent;
}

.tab-item--active {
  @apply bg-background text-foreground border-primary/20;
}

.tab-item__title {
  @apply truncate;
}

.tab-item__close {
  @apply opacity-0 group-hover:opacity-100 hover:bg-muted;
}

.tab-item:hover .tab-item__close {
  @apply opacity-100;
}

.tabs-actions {
  @apply flex items-center gap-1;
}

.tabs-content {
  @apply flex-1 overflow-auto;
}
</style>
