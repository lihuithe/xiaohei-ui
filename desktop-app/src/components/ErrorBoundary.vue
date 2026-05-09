<template>
  <div
    v-if="hasError"
    class="error-boundary p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg"
  >
    <h2 class="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">发生错误</h2>
    <p class="text-red-600 dark:text-red-300 mb-2">{{ error?.message || '未知错误' }}</p>
    <details class="mt-4">
      <summary class="text-sm text-red-700 dark:text-red-400 cursor-pointer">查看详情</summary>
      <pre class="mt-2 p-2 bg-red-100 dark:bg-red-900 rounded text-xs overflow-x-auto">{{
        error?.stack || error
      }}</pre>
    </details>
    <button
      class="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm transition-colors"
      @click="reset"
    >
      重试
    </button>
  </div>
  <slot v-else></slot>
</template>

<script setup lang="ts">
import { ref, provide, onErrorCaptured } from 'vue'

const error = ref<Error | null>(null)
const hasError = ref(false)

const reset = () => {
  error.value = null
  hasError.value = false
}

onErrorCaptured((err) => {
  error.value = err
  hasError.value = true
  return false
})

provide('error-boundary', { reset })
</script>
