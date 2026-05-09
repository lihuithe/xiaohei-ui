import { ref, computed, watch } from 'vue'
import { Search } from 'lucide-vue-next'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: number
  updatedAt: number
}

export interface SearchResult {
  conversationId: string
  conversationTitle: string
  messageId?: string
  matchedContent: string
  matchType: 'title' | 'content'
  highlightRanges: Array<{ start: number; end: number }>
}

const conversations = ref<Conversation[]>([
  {
    id: '1',
    title: '日常工作助手',
    messages: [
      { id: 'm1', role: 'user', content: '帮我整理今天的工作计划', timestamp: Date.now() - 3600000 },
      { id: 'm2', role: 'assistant', content: '好的，我来帮你整理今天的工作计划。', timestamp: Date.now() - 3500000 },
    ],
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 3600000,
  },
  {
    id: '2',
    title: '代码生成器',
    messages: [
      { id: 'm3', role: 'user', content: '生成一个 Vue3 组件', timestamp: Date.now() - 7200000 },
      { id: 'm4', role: 'assistant', content: '我可以帮你生成 Vue3 组件。', timestamp: Date.now() - 7100000 },
    ],
    createdAt: Date.now() - 172800000,
    updatedAt: Date.now() - 7200000,
  },
  {
    id: '3',
    title: '文档整理',
    messages: [
      { id: 'm5', role: 'user', content: '整理项目文档结构', timestamp: Date.now() - 10800000 },
      { id: 'm6', role: 'assistant', content: '我来帮你整理项目文档结构。', timestamp: Date.now() - 10700000 },
    ],
    createdAt: Date.now() - 259200000,
    updatedAt: Date.now() - 10800000,
  },
])

export function useSearch() {
  const searchQuery = ref('')
  const isSearching = ref(false)
  const searchResults = ref<SearchResult[]>([])
  const selectedResultIndex = ref(0)
  const isSearchDialogOpen = ref(false)

  function escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  function findHighlightRanges(text: string, query: string): Array<{ start: number; end: number }> {
    if (!query.trim()) return []
    
    const ranges: Array<{ start: number; end: number }> = []
    const lowerText = text.toLowerCase()
    const lowerQuery = query.toLowerCase()
    const escapedQuery = escapeRegExp(lowerQuery)
    const regex = new RegExp(escapedQuery, 'gi')
    
    let match
    while ((match = regex.exec(lowerText)) !== null) {
      ranges.push({
        start: match.index,
        end: match.index + match[0].length,
      })
    }
    
    return ranges
  }

  const performSearch = computed(() => {
    return (query: string) => {
      if (!query.trim()) {
        searchResults.value = []
        selectedResultIndex.value = 0
        return
      }

      isSearching.value = true
      const lowerQuery = query.toLowerCase()
      const results: SearchResult[] = []

      conversations.value.forEach((conversation) => {
        const titleMatch = conversation.title.toLowerCase().includes(lowerQuery)
        
        if (titleMatch) {
          results.push({
            conversationId: conversation.id,
            conversationTitle: conversation.title,
            matchedContent: conversation.title,
            matchType: 'title',
            highlightRanges: findHighlightRanges(conversation.title, query),
          })
        }

        conversation.messages.forEach((message) => {
          const contentLower = message.content.toLowerCase()
          if (contentLower.includes(lowerQuery)) {
            const highlightRanges = findHighlightRanges(message.content, query)
            
            const contextStart = Math.max(0, message.content.toLowerCase().indexOf(lowerQuery) - 30)
            const contextEnd = Math.min(
              message.content.length,
              message.content.toLowerCase().indexOf(lowerQuery) + query.length + 30
            )
            let excerpt = message.content.substring(contextStart, contextEnd)
            if (contextStart > 0) excerpt = '...' + excerpt
            if (contextEnd < message.content.length) excerpt = excerpt + '...'

            results.push({
              conversationId: conversation.id,
              conversationTitle: conversation.title,
              messageId: message.id,
              matchedContent: excerpt,
              matchType: 'content',
              highlightRanges: highlightRanges,
            })
          }
        })
      })

      searchResults.value = results
      selectedResultIndex.value = 0
      isSearching.value = false
    }
  })

  watch(searchQuery, (newQuery) => {
    if (newQuery.trim()) {
      performSearch.value(newQuery)
    } else {
      searchResults.value = []
      selectedResultIndex.value = 0
    }
  })

  function openSearchDialog() {
    isSearchDialogOpen.value = true
    searchQuery.value = ''
    searchResults.value = []
    selectedResultIndex.value = 0
  }

  function closeSearchDialog() {
    isSearchDialogOpen.value = false
    searchQuery.value = ''
    searchResults.value = []
    selectedResultIndex.value = 0
  }

  function selectNextResult() {
    if (searchResults.value.length > 0) {
      selectedResultIndex.value = (selectedResultIndex.value + 1) % searchResults.value.length
    }
  }

  function selectPreviousResult() {
    if (searchResults.value.length > 0) {
      selectedResultIndex.value = 
        selectedResultIndex.value === 0 
          ? searchResults.value.length - 1 
          : selectedResultIndex.value - 1
    }
  }

  function getSelectedResult(): SearchResult | null {
    if (searchResults.value.length === 0) return null
    return searchResults.value[selectedResultIndex.value]
  }

  function addConversation(conversation: Omit<Conversation, 'id' | 'createdAt' | 'updatedAt'>) {
    const now = Date.now()
    const newConversation: Conversation = {
      ...conversation,
      id: `conv-${now}`,
      createdAt: now,
      updatedAt: now,
    }
    conversations.value.unshift(newConversation)
    return newConversation.id
  }

  function updateConversation(id: string, updates: Partial<Conversation>) {
    const index = conversations.value.findIndex(c => c.id === id)
    if (index !== -1) {
      conversations.value[index] = {
        ...conversations.value[index],
        ...updates,
        updatedAt: Date.now(),
      }
    }
  }

  function deleteConversation(id: string) {
    const index = conversations.value.findIndex(c => c.id === id)
    if (index !== -1) {
      conversations.value.splice(index, 1)
    }
  }

  function getConversationById(id: string): Conversation | undefined {
    return conversations.value.find(c => c.id === id)
  }

  return {
    searchQuery,
    isSearching,
    searchResults,
    selectedResultIndex,
    isSearchDialogOpen,
    conversations,
    performSearch,
    openSearchDialog,
    closeSearchDialog,
    selectNextResult,
    selectPreviousResult,
    getSelectedResult,
    addConversation,
    updateConversation,
    deleteConversation,
    getConversationById,
    findHighlightRanges,
  }
}

export const searchIcon = Search
