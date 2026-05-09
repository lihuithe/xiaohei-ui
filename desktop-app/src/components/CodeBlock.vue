<template>
  <div class="code-block relative group">
    <div class="flex items-center justify-between px-4 py-2 bg-muted/50 border-b text-sm">
      <span class="text-muted-foreground">{{ language }}</span>
      <button
        class="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-accent rounded"
        @click="copyCode"
      >
        <span v-if="!copied">{{ t('common.copy', '复制') }}</span>
        <span v-else class="text-green-500">{{ t('common.copied', '已复制') }}</span>
      </button>
    </div>
    <pre
      class="p-4 overflow-x-auto"
    ><code :class="`language-${language}`" v-html="highlightedCode"></code></pre>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import hljs from 'highlight.js'
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import css from 'highlight.js/lib/languages/css'
import html from 'highlight.js/lib/languages/xml'
import json from 'highlight.js/lib/languages/json'
import bash from 'highlight.js/lib/languages/bash'
import 'highlight.js/styles/github-dark.css'

hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('css', css)
hljs.registerLanguage('html', html)
hljs.registerLanguage('json', json)
hljs.registerLanguage('bash', bash)

interface Props {
  code: string
  language?: string
}

const props = withDefaults(defineProps<Props>(), {
  language: 'typescript',
})

const { t } = useI18n()
const copied = ref(false)

const highlightedCode = computed(() => {
  try {
    return hljs.highlight(props.code, { language: props.language }).value
  } catch {
    return props.code
  }
})

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(props.code)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (e) {
    console.error('Copy failed:', e)
  }
}
</script>

<style scoped>
.code-block {
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid hsl(var(--border));
}

pre {
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.5;
}

code {
  font-family:
    ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New',
    monospace;
}
</style>
