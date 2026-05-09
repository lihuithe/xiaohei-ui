import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export interface Conversation {
  id: string
  name: string
  messages: Message[]
  createdAt: number
  updatedAt: number
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
}

function generateMessageId(): string {
  return `msg_${Date.now().toString(36)}${Math.random().toString(36).substr(2, 6)}`
}

export const useConversationStore = defineStore('conversation', () => {
  const conversations = ref<Record<string, Conversation>>({})
  const activeConversationId = ref<string | null>(null)
  const isLoading = ref(false)
  const isSaving = ref(false)
  const lastSavedAt = ref<number | null>(null)

  let autoSaveTimer: ReturnType<typeof setTimeout> | null = null
  let hasUnsavedChanges = false

  const activeConversation = computed(() => {
    if (!activeConversationId.value) return null
    return conversations.value[activeConversationId.value] || null
  })

  const conversationList = computed(() => {
    return Object.values(conversations.value).sort((a, b) => b.updatedAt - a.updatedAt)
  })

  async function loadFromStore() {
    isLoading.value = true
    try {
      const stored = await window.electronAPI?.getConversations()
      if (stored) {
        conversations.value = stored
      }
      const storedActiveId = await window.electronAPI?.getActiveId()
      if (storedActiveId) {
        activeConversationId.value = storedActiveId
      }
    } catch (error) {
      console.error('Failed to load conversations:', error)
    } finally {
      isLoading.value = false
    }
  }

  async function saveConversation(conversation: Conversation) {
    isSaving.value = true
    try {
      await window.electronAPI?.saveConversation(conversation)
      lastSavedAt.value = Date.now()
      hasUnsavedChanges = false
    } catch (error) {
      console.error('Failed to save conversation:', error)
    } finally {
      isSaving.value = false
    }
  }

  function markDirty() {
    hasUnsavedChanges = true
    scheduleAutoSave()
  }

  function scheduleAutoSave() {
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer)
    }
    autoSaveTimer = setTimeout(() => {
      if (hasUnsavedChanges && activeConversation.value) {
        saveConversation(activeConversation.value)
      }
    }, 30000)
  }

  function createConversation(name?: string): Conversation {
    const now = Date.now()
    const conversation: Conversation = {
      id: generateId(),
      name:
        name ||
        `新对话 ${new Date().toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}`,
      messages: [],
      createdAt: now,
      updatedAt: now,
    }
    conversations.value[conversation.id] = conversation
    activeConversationId.value = conversation.id
    markDirty()
    return conversation
  }

  function addMessage(content: string, role: 'user' | 'assistant' = 'user'): Message | null {
    if (!activeConversationId.value) {
      createConversation()
    }

    const conversation = conversations.value[activeConversationId.value!]
    if (!conversation) return null

    const message: Message = {
      id: generateMessageId(),
      role,
      content,
      timestamp: Date.now(),
    }

    conversation.messages.push(message)
    conversation.updatedAt = Date.now()

    if (conversation.messages.length === 1) {
      conversation.name = content.slice(0, 30) + (content.length > 30 ? '...' : '')
    }

    markDirty()
    return message
  }

  function updateMessage(messageId: string, content: string) {
    const conversation = activeConversation.value
    if (!conversation) return

    const message = conversation.messages.find((m) => m.id === messageId)
    if (message) {
      message.content = content
      conversation.updatedAt = Date.now()
      markDirty()
    }
  }

  function deleteMessage(messageId: string) {
    const conversation = activeConversation.value
    if (!conversation) return

    const index = conversation.messages.findIndex((m) => m.id === messageId)
    if (index !== -1) {
      conversation.messages.splice(index, 1)
      conversation.updatedAt = Date.now()
      markDirty()
    }
  }

  function updateConversationName(id: string, name: string) {
    const conversation = conversations.value[id]
    if (conversation) {
      conversation.name = name
      conversation.updatedAt = Date.now()
      markDirty()
    }
  }

  async function deleteConversation(id: string) {
    try {
      await window.electronAPI?.deleteConversation(id)
      delete conversations.value[id]

      if (activeConversationId.value === id) {
        const keys = Object.keys(conversations.value)
        activeConversationId.value = keys.length > 0 ? keys[0] : null
        if (activeConversationId.value) {
          await window.electronAPI?.setActiveId(activeConversationId.value)
        }
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error)
    }
  }

  function setActiveConversation(id: string | null) {
    activeConversationId.value = id
    if (id) {
      window.electronAPI?.setActiveId(id)
    }
  }

  function clearCurrentConversation() {
    if (activeConversation.value) {
      activeConversation.value.messages = []
      activeConversation.value.updatedAt = Date.now()
      markDirty()
    }
  }

  watch(
    activeConversation,
    (newConv) => {
      if (hasUnsavedChanges && newConv) {
        saveConversation(newConv)
      }
    },
    { deep: true }
  )

  return {
    conversations,
    activeConversationId,
    activeConversation,
    conversationList,
    isLoading,
    isSaving,
    lastSavedAt,
    loadFromStore,
    saveConversation,
    createConversation,
    addMessage,
    updateMessage,
    deleteMessage,
    updateConversationName,
    deleteConversation,
    setActiveConversation,
    clearCurrentConversation,
    markDirty,
  }
})
