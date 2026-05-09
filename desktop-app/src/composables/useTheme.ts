import { ref, onMounted } from 'vue'
import { useStorage } from '@vueuse/core'

type Theme = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'app-theme'

export function useTheme() {
  const theme = useStorage<Theme>(STORAGE_KEY, 'system')
  const isTransitioning = ref(false)

  function getSystemTheme(): 'light' | 'dark' {
    if (typeof window === 'undefined') return 'light'
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  function applyTheme(newTheme: Theme, withTransition = true) {
    const root = window.document.documentElement
    const effectiveTheme = newTheme === 'system' ? getSystemTheme() : newTheme

    if (withTransition) {
      isTransitioning.value = true
      root.classList.add('theme-transitioning')
    }

    if (effectiveTheme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }

    if (withTransition) {
      setTimeout(() => {
        isTransitioning.value = false
        root.classList.remove('theme-transitioning')
      }, 300)
    }
  }

  function setTheme(newTheme: Theme) {
    if (theme.value === newTheme) return
    theme.value = newTheme
    applyTheme(newTheme)
  }

  function toggleTheme() {
    const current = theme.value
    if (current === 'light') setTheme('dark')
    else if (current === 'dark') setTheme('system')
    else setTheme('light')
  }

  function forceApplyTheme() {
    applyTheme(theme.value, false)
  }

  onMounted(() => {
    forceApplyTheme()

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const mediaQueryListener = () => {
      if (theme.value === 'system') {
        applyTheme('system')
      }
    }

    mediaQuery.addEventListener('change', mediaQueryListener)

    return () => {
      mediaQuery.removeEventListener('change', mediaQueryListener)
    }
  })

  return {
    theme,
    isTransitioning,
    setTheme,
    toggleTheme,
    forceApplyTheme,
  }
}
