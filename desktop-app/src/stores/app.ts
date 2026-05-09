import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAppStore = defineStore(
  'app',
  () => {
    const sidebarCollapsed = ref(false)
    const loading = ref(false)

    const isSidebarCollapsed = computed(() => sidebarCollapsed.value)
    const isLoading = computed(() => loading.value)

    function toggleSidebar() {
      sidebarCollapsed.value = !sidebarCollapsed.value
    }

    function setSidebarCollapsed(collapsed: boolean) {
      sidebarCollapsed.value = collapsed
    }

    function setLoading(state: boolean) {
      loading.value = state
    }

    return {
      sidebarCollapsed,
      loading,
      isSidebarCollapsed,
      isLoading,
      toggleSidebar,
      setSidebarCollapsed,
      setLoading,
    }
  },
  {
    persist: {
      key: 'app-store',
      paths: ['sidebarCollapsed'],
    },
  }
)
