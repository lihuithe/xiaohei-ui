<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { Search, X, FileText, MessageSquare, ArrowUp, ArrowDown, CornerDownLeft } from 'lucide-vue-next'
import { useSearch, type SearchResult } from '@/composables/useSearch'

const {
  searchQuery,
  isSearching,
  searchResults,
  selectedResultIndex,
  isSearchDialogOpen,
  closeSearchDialog,
  selectNextResult,
  selectPreviousResult,
  getSelectedResult,
} = useSearch()

const inputRef = ref<HTMLInputElement | null>(null)
const resultsRef = ref<HTMLElement | null>(null)

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    selectNextResult()
    scrollToSelected()
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    selectPreviousResult()
    scrollToSelected()
  } else if (event.key === 'Enter') {
    event.preventDefault()
    const selected = getSelectedResult()
    if (selected) {
      handleResultClick(selected)
    }
  } else if (event.key === 'Escape') {
    closeSearchDialog()
  }
}

function scrollToSelected() {
  nextTick(() => {
    const container = resultsRef.value
    const selected = container?.querySelector('.search-result-item.selected') as HTMLElement
    if (selected && container) {
      const containerRect = container.getBoundingClientRect()
      const selectedRect = selected.getBoundingClientRect()
      
      if (selectedRect.top < containerRect.top || selectedRect.bottom > containerRect.bottom) {
        selected.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }
    }
  })
}

function handleResultClick(result: SearchResult) {
  console.log('Selected result:', result)
  closeSearchDialog()
}

function highlightText(text: string, ranges: Array<{ start: number; end: number }>) {
  if (ranges.length === 0) return text
  
  const parts: Array<{ text: string; highlight: boolean }> = []
  let lastIndex = 0
  
  const sortedRanges = [...ranges].sort((a, b) => a.start - b.start)
  
  for (const range of sortedRanges) {
    if (range.start > lastIndex) {
      parts.push({ text: text.substring(lastIndex, range.start), highlight: false })
    }
    parts.push({ text: text.substring(range.start, range.end), highlight: true })
    lastIndex = range.end
  }
  
  if (lastIndex < text.length) {
    parts.push({ text: text.substring(lastIndex), highlight: false })
  }
  
  return parts
}

watch(isSearchDialogOpen, (isOpen) => {
  if (isOpen) {
    nextTick(() => {
      inputRef.value?.focus()
    })
  }
})

function handleGlobalKeydown(event: KeyboardEvent) {
  if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
    event.preventDefault()
    if (isSearchDialogOpen.value) {
      closeSearchDialog()
    } else {
      isSearchDialogOpen.value = true
    }
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleGlobalKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleGlobalKeydown)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="dialog">
      <div v-if="isSearchDialogOpen" class="search-dialog-overlay" @click.self="closeSearchDialog">
        <div class="search-dialog" @keydown="handleKeydown">
          <div class="search-header">
            <Search class="search-icon" :size="20" />
            <input
              ref="inputRef"
              v-model="searchQuery"
              type="text"
              class="search-input"
              placeholder="搜索对话历史..."
              autocomplete="off"
              spellcheck="false"
            />
            <div class="search-shortcuts">
              <kbd class="kbd">⌘</kbd>
              <kbd class="kbd">K</kbd>
            </div>
            <button class="close-btn" @click="closeSearchDialog" title="关闭">
              <X :size="16" />
            </button>
          </div>

          <div v-if="searchQuery && !isSearching" class="search-results-header">
            <span class="results-count">
              {{ searchResults.length }} 个结果
            </span>
            <div class="keyboard-hints">
              <span class="hint">
                <ArrowUp :size="12" />
                <ArrowDown :size="12" />
                <span class="hint-text">导航</span>
              </span>
              <span class="hint">
                <CornerDownLeft :size="12" />
                <span class="hint-text">选择</span>
              </span>
            </div>
          </div>

          <div ref="resultsRef" class="search-results">
            <div v-if="!searchQuery" class="search-empty">
              <Search :size="48" class="empty-icon" />
              <p>输入关键词搜索对话历史</p>
              <p class="search-tip">支持按对话标题和内容搜索</p>
            </div>

            <div v-else-if="isSearching" class="search-loading">
              <div class="loading-spinner"></div>
              <span>搜索中...</span>
            </div>

            <div v-else-if="searchResults.length === 0" class="search-empty">
              <FileText :size="48" class="empty-icon" />
              <p>未找到匹配结果</p>
              <p class="search-tip">尝试其他关键词</p>
            </div>

            <div v-else class="results-list">
              <button
                v-for="(result, index) in searchResults"
                :key="`${result.conversationId}-${result.messageId || 'title'}`"
                class="search-result-item"
                :class="{ selected: index === selectedResultIndex }"
                @click="handleResultClick(result)"
                @mouseenter="selectedResultIndex = index"
              >
                <div class="result-icon">
                  <FileText v-if="result.matchType === 'title'" :size="18" />
                  <MessageSquare v-else :size="18" />
                </div>
                <div class="result-content">
                  <div class="result-title">{{ result.conversationTitle }}</div>
                  <div class="result-match">
                    <template v-if="Array.isArray(highlightText(result.matchedContent, result.highlightRanges))">
                      <template v-for="(part, i) in highlightText(result.matchedContent, result.highlightRanges)" :key="i">
                        <mark v-if="part.highlight" class="highlight">{{ part.text }}</mark>
                        <span v-else>{{ part.text }}</span>
                      </template>
                    </template>
                    <template v-else>
                      {{ result.matchedContent }}
                    </template>
                  </div>
                </div>
                <div class="result-type">
                  {{ result.matchType === 'title' ? '标题' : '内容' }}
                </div>
              </button>
            </div>
          </div>

          <div class="search-footer">
            <div class="footer-actions">
              <span class="footer-hint">
                <kbd class="kbd small">Esc</kbd>
                <span>关闭</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.search-dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 100px;
  z-index: 9999;
}

.search-dialog {
  width: 100%;
  max-width: 640px;
  background: var(--background);
  border-radius: 12px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
}

.search-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-bottom: 1px solid var(--border);
}

.search-icon {
  color: var(--muted-foreground);
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 16px;
  outline: none;
  color: var(--foreground);
}

.search-input::placeholder {
  color: var(--muted-foreground);
}

.search-shortcuts {
  display: flex;
  gap: 4px;
}

.kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px 6px;
  font-size: 12px;
  font-family: inherit;
  font-weight: 500;
  background: var(--accent);
  color: var(--muted-foreground);
  border-radius: 4px;
  border: 1px solid var(--border);
}

.kbd.small {
  padding: 1px 4px;
  font-size: 10px;
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  color: var(--muted-foreground);
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.15s, color 0.15s;
}

.close-btn:hover {
  background: var(--accent);
  color: var(--foreground);
}

.search-results-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  border-bottom: 1px solid var(--border);
  font-size: 12px;
  color: var(--muted-foreground);
}

.results-count {
  font-weight: 500;
}

.keyboard-hints {
  display: flex;
  gap: 12px;
}

.hint {
  display: flex;
  align-items: center;
  gap: 4px;
}

.hint-text {
  margin-left: 4px;
}

.search-results {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.search-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 16px;
  color: var(--muted-foreground);
  text-align: center;
}

.empty-icon {
  opacity: 0.3;
  margin-bottom: 16px;
}

.search-tip {
  font-size: 13px;
  margin-top: 4px;
  opacity: 0.7;
}

.search-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 48px 16px;
  color: var(--muted-foreground);
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--border);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.search-result-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  width: 100%;
  text-align: left;
  transition: background-color 0.1s;
}

.search-result-item:hover,
.search-result-item.selected {
  background: var(--accent);
}

.result-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: var(--background);
  border-radius: 8px;
  color: var(--muted-foreground);
  flex-shrink: 0;
}

.search-result-item.selected .result-icon {
  background: var(--primary);
  color: var(--primary-foreground);
}

.result-content {
  flex: 1;
  min-width: 0;
}

.result-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--foreground);
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.result-match {
  font-size: 13px;
  color: var(--muted-foreground);
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.highlight {
  background: var(--yellow-200, #fef08a);
  color: var(--foreground);
  padding: 0 2px;
  border-radius: 2px;
}

.result-type {
  font-size: 11px;
  color: var(--muted-foreground);
  padding: 2px 8px;
  background: var(--accent);
  border-radius: 4px;
  flex-shrink: 0;
}

.search-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 8px 16px;
  border-top: 1px solid var(--border);
  font-size: 12px;
  color: var(--muted-foreground);
}

.footer-actions {
  display: flex;
  gap: 16px;
}

.footer-hint {
  display: flex;
  align-items: center;
  gap: 6px;
}

.dialog-enter-active,
.dialog-leave-active {
  transition: opacity 0.2s ease;
}

.dialog-enter-active .search-dialog,
.dialog-leave-active .search-dialog {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
}

.dialog-enter-from .search-dialog,
.dialog-leave-to .search-dialog {
  transform: scale(0.95) translateY(-20px);
  opacity: 0;
}
</style>
