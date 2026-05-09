<template>
  <div class="search-bar relative">
    <svg
      class="search-icon absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <circle cx="11" cy="11" r="8"></circle>
      <path d="m21 21-4.3-4.3"></path>
    </svg>
    <input
      v-model="inputValue"
      :placeholder="placeholder"
      class="w-full pl-10 pr-10 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-input"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
      @keydown="handleKeydown"
    />
    <button
      v-if="inputValue"
      class="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-accent rounded-full"
      @click="clear"
    >
      <svg
        class="w-4 h-4 text-muted-foreground"
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'

interface Props {
  modelValue?: string
  placeholder?: string
  debounceMs?: number
}

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'search', value: string): void
  (e: 'focus'): void
  (e: 'blur'): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: '',
  debounceMs: 300,
})

const emit = defineEmits<Emits>()
const { t } = useI18n()
const inputValue = ref(props.modelValue)
let debounceTimer: number | null = null

const placeholder = computed(() => props.placeholder || t('common.search', '搜索...'))

watch(
  () => props.modelValue,
  (newVal) => {
    inputValue.value = newVal
  }
)

watch(inputValue, (newVal) => {
  emit('update:modelValue', newVal)
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
  debounceTimer = window.setTimeout(() => {
    emit('search', newVal)
  }, props.debounceMs)
})

const handleInput = () => {
  // Handled by watcher
}

const handleFocus = () => {
  emit('focus')
}

const handleBlur = () => {
  emit('blur')
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    clear()
  } else if (e.key === 'Enter') {
    emit('search', inputValue.value)
  }
}

const clear = () => {
  inputValue.value = ''
  emit('search', '')
}
</script>

<style scoped>
.search-bar {
  position: relative;
}
</style>
