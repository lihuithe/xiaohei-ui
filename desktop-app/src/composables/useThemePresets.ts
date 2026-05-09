import { ref } from 'vue'
import { useStorage } from '@vueuse/core'

export interface ThemeColors {
  background: string
  foreground: string
  card: string
  'card-foreground': string
  popover: string
  'popover-foreground': string
  primary: string
  'primary-foreground': string
  secondary: string
  'secondary-foreground': string
  muted: string
  'muted-foreground': string
  accent: string
  'accent-foreground': string
  destructive: string
  border: string
  input: string
  ring: string
  sidebar: string
  'sidebar-foreground': string
  'sidebar-primary': string
  'sidebar-primary-foreground': string
  'sidebar-accent': string
  'sidebar-accent-foreground': string
  'sidebar-border': string
  'sidebar-ring': string
}

export interface ThemePreset {
  id: string
  name: string
  description: string
  colors: {
    light: ThemeColors
    dark: ThemeColors
  }
}

const PRESETS: ThemePreset[] = [
  {
    id: 'default',
    name: '默认',
    description: '经典的浅色/深色主题',
    colors: {
      light: {
        background: 'oklch(1 0 0)',
        foreground: 'oklch(0.145 0 0)',
        card: 'oklch(1 0 0)',
        'card-foreground': 'oklch(0.145 0 0)',
        popover: 'oklch(1 0 0)',
        'popover-foreground': 'oklch(0.145 0 0)',
        primary: 'oklch(0.205 0 0)',
        'primary-foreground': 'oklch(0.985 0 0)',
        secondary: 'oklch(0.97 0 0)',
        'secondary-foreground': 'oklch(0.205 0 0)',
        muted: 'oklch(0.97 0 0)',
        'muted-foreground': 'oklch(0.556 0 0)',
        accent: 'oklch(0.97 0 0)',
        'accent-foreground': 'oklch(0.205 0 0)',
        destructive: 'oklch(0.577 0.245 27.325)',
        border: 'oklch(0.922 0 0)',
        input: 'oklch(0.922 0 0)',
        ring: 'oklch(0.708 0 0)',
        sidebar: 'oklch(0.985 0 0)',
        'sidebar-foreground': 'oklch(0.145 0 0)',
        'sidebar-primary': 'oklch(0.205 0 0)',
        'sidebar-primary-foreground': 'oklch(0.985 0 0)',
        'sidebar-accent': 'oklch(0.97 0 0)',
        'sidebar-accent-foreground': 'oklch(0.205 0 0)',
        'sidebar-border': 'oklch(0.922 0 0)',
        'sidebar-ring': 'oklch(0.708 0 0)',
      },
      dark: {
        background: 'oklch(0.145 0 0)',
        foreground: 'oklch(0.985 0 0)',
        card: 'oklch(0.205 0 0)',
        'card-foreground': 'oklch(0.985 0 0)',
        popover: 'oklch(0.205 0 0)',
        'popover-foreground': 'oklch(0.985 0 0)',
        primary: 'oklch(0.922 0 0)',
        'primary-foreground': 'oklch(0.205 0 0)',
        secondary: 'oklch(0.269 0 0)',
        'secondary-foreground': 'oklch(0.985 0 0)',
        muted: 'oklch(0.269 0 0)',
        'muted-foreground': 'oklch(0.708 0 0)',
        accent: 'oklch(0.269 0 0)',
        'accent-foreground': 'oklch(0.985 0 0)',
        destructive: 'oklch(0.704 0.191 22.216)',
        border: 'oklch(1 0 0 / 10%)',
        input: 'oklch(1 0 0 / 15%)',
        ring: 'oklch(0.556 0 0)',
        sidebar: 'oklch(0.205 0 0)',
        'sidebar-foreground': 'oklch(0.985 0 0)',
        'sidebar-primary': 'oklch(0.488 0.243 264.376)',
        'sidebar-primary-foreground': 'oklch(0.985 0 0)',
        'sidebar-accent': 'oklch(0.269 0 0)',
        'sidebar-accent-foreground': 'oklch(0.985 0 0)',
        'sidebar-border': 'oklch(1 0 0 / 10%)',
        'sidebar-ring': 'oklch(0.556 0 0)',
      },
    },
  },
  {
    id: 'ocean',
    name: '海洋蓝',
    description: '清新的海洋色调',
    colors: {
      light: {
        background: 'oklch(0.98 0.01 230)',
        foreground: 'oklch(0.25 0.02 240)',
        card: 'oklch(1 0 0)',
        'card-foreground': 'oklch(0.25 0.02 240)',
        popover: 'oklch(1 0 0)',
        'popover-foreground': 'oklch(0.25 0.02 240)',
        primary: 'oklch(0.6 0.15 240)',
        'primary-foreground': 'oklch(1 0 0)',
        secondary: 'oklch(0.95 0.03 220)',
        'secondary-foreground': 'oklch(0.3 0.05 230)',
        muted: 'oklch(0.95 0.02 220)',
        'muted-foreground': 'oklch(0.55 0.04 240)',
        accent: 'oklch(0.92 0.06 210)',
        'accent-foreground': 'oklch(0.25 0.02 240)',
        destructive: 'oklch(0.6 0.22 25)',
        border: 'oklch(0.88 0.03 230)',
        input: 'oklch(0.88 0.03 230)',
        ring: 'oklch(0.6 0.15 240)',
        sidebar: 'oklch(0.97 0.015 225)',
        'sidebar-foreground': 'oklch(0.25 0.02 240)',
        'sidebar-primary': 'oklch(0.6 0.15 240)',
        'sidebar-primary-foreground': 'oklch(1 0 0)',
        'sidebar-accent': 'oklch(0.92 0.06 210)',
        'sidebar-accent-foreground': 'oklch(0.25 0.02 240)',
        'sidebar-border': 'oklch(0.88 0.03 230)',
        'sidebar-ring': 'oklch(0.6 0.15 240)',
      },
      dark: {
        background: 'oklch(0.2 0.03 240)',
        foreground: 'oklch(0.95 0.012 220)',
        card: 'oklch(0.25 0.025 235)',
        'card-foreground': 'oklch(0.95 0.012 220)',
        popover: 'oklch(0.25 0.025 235)',
        'popover-foreground': 'oklch(0.95 0.012 220)',
        primary: 'oklch(0.75 0.15 220)',
        'primary-foreground': 'oklch(0.2 0.03 240)',
        secondary: 'oklch(0.32 0.04 230)',
        'secondary-foreground': 'oklch(0.95 0.012 220)',
        muted: 'oklch(0.32 0.04 230)',
        'muted-foreground': 'oklch(0.7 0.05 230)',
        accent: 'oklch(0.38 0.06 220)',
        'accent-foreground': 'oklch(0.95 0.012 220)',
        destructive: 'oklch(0.65 0.2 20)',
        border: 'oklch(0.35 0.03 235)',
        input: 'oklch(0.35 0.03 235)',
        ring: 'oklch(0.75 0.15 220)',
        sidebar: 'oklch(0.22 0.033 238)',
        'sidebar-foreground': 'oklch(0.95 0.012 220)',
        'sidebar-primary': 'oklch(0.75 0.15 220)',
        'sidebar-primary-foreground': 'oklch(0.2 0.03 240)',
        'sidebar-accent': 'oklch(0.38 0.06 220)',
        'sidebar-accent-foreground': 'oklch(0.95 0.012 220)',
        'sidebar-border': 'oklch(0.35 0.03 235)',
        'sidebar-ring': 'oklch(0.75 0.15 220)',
      },
    },
  },
  {
    id: 'sunset',
    name: '日落橙',
    description: '温暖的日落色调',
    colors: {
      light: {
        background: 'oklch(0.99 0.005 80)',
        foreground: 'oklch(0.25 0.02 50)',
        card: 'oklch(1 0 0)',
        'card-foreground': 'oklch(0.25 0.02 50)',
        popover: 'oklch(1 0 0)',
        'popover-foreground': 'oklch(0.25 0.02 50)',
        primary: 'oklch(0.65 0.2 45)',
        'primary-foreground': 'oklch(1 0 0)',
        secondary: 'oklch(0.96 0.04 70)',
        'secondary-foreground': 'oklch(0.3 0.05 45)',
        muted: 'oklch(0.96 0.03 70)',
        'muted-foreground': 'oklch(0.55 0.04 55)',
        accent: 'oklch(0.94 0.07 30)',
        'accent-foreground': 'oklch(0.25 0.02 50)',
        destructive: 'oklch(0.577 0.245 27.325)',
        border: 'oklch(0.9 0.02 60)',
        input: 'oklch(0.9 0.02 60)',
        ring: 'oklch(0.65 0.2 45)',
        sidebar: 'oklch(0.98 0.01 75)',
        'sidebar-foreground': 'oklch(0.25 0.02 50)',
        'sidebar-primary': 'oklch(0.65 0.2 45)',
        'sidebar-primary-foreground': 'oklch(1 0 0)',
        'sidebar-accent': 'oklch(0.94 0.07 30)',
        'sidebar-accent-foreground': 'oklch(0.25 0.02 50)',
        'sidebar-border': 'oklch(0.9 0.02 60)',
        'sidebar-ring': 'oklch(0.65 0.2 45)',
      },
      dark: {
        background: 'oklch(0.22 0.04 40)',
        foreground: 'oklch(0.95 0.015 60)',
        card: 'oklch(0.27 0.035 45)',
        'card-foreground': 'oklch(0.95 0.015 60)',
        popover: 'oklch(0.27 0.035 45)',
        'popover-foreground': 'oklch(0.95 0.015 60)',
        primary: 'oklch(0.78 0.18 50)',
        'primary-foreground': 'oklch(0.22 0.04 40)',
        secondary: 'oklch(0.34 0.05 40)',
        'secondary-foreground': 'oklch(0.95 0.015 60)',
        muted: 'oklch(0.34 0.05 40)',
        'muted-foreground': 'oklch(0.7 0.07 55)',
        accent: 'oklch(0.4 0.08 35)',
        'accent-foreground': 'oklch(0.95 0.015 60)',
        destructive: 'oklch(0.704 0.191 22.216)',
        border: 'oklch(0.37 0.04 42)',
        input: 'oklch(0.37 0.04 42)',
        ring: 'oklch(0.78 0.18 50)',
        sidebar: 'oklch(0.25 0.038 43)',
        'sidebar-foreground': 'oklch(0.95 0.015 60)',
        'sidebar-primary': 'oklch(0.78 0.18 50)',
        'sidebar-primary-foreground': 'oklch(0.22 0.04 40)',
        'sidebar-accent': 'oklch(0.4 0.08 35)',
        'sidebar-accent-foreground': 'oklch(0.95 0.015 60)',
        'sidebar-border': 'oklch(0.37 0.04 42)',
        'sidebar-ring': 'oklch(0.78 0.18 50)',
      },
    },
  },
]

const STORAGE_KEY = 'theme-preset'
const CUSTOM_THEME_KEY = 'custom-theme'

export function useThemePresets() {
  const currentPresetId = useStorage<string>(STORAGE_KEY, 'default')
  const customTheme = useStorage<ThemePreset | null>(CUSTOM_THEME_KEY, null)
  const isTransitioning = ref(false)

  const presets = ref<ThemePreset[]>([...PRESETS])

  function getSystemTheme(): 'light' | 'dark' {
    if (typeof window === 'undefined') return 'light'
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  function getCurrentPreset(): ThemePreset {
    if (currentPresetId.value === 'custom' && customTheme.value) {
      return customTheme.value
    }
    return presets.value.find((p) => p.id === currentPresetId.value) || PRESETS[0]
  }

  function applyColors(colors: ThemeColors, withTransition = true) {
    const root = window.document.documentElement

    if (withTransition) {
      isTransitioning.value = true
      root.classList.add('theme-transitioning')
    }

    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value)
    })

    if (withTransition) {
      setTimeout(() => {
        isTransitioning.value = false
        root.classList.remove('theme-transitioning')
      }, 300)
    }
  }

  function applyPreset(presetId: string, withTransition = true) {
    currentPresetId.value = presetId
    const preset = getCurrentPreset()
    const mode = getSystemTheme()
    applyColors(preset.colors[mode], withTransition)
  }

  function setDarkMode(isDark: boolean, withTransition = true) {
    const root = window.document.documentElement
    const preset = getCurrentPreset()

    if (withTransition) {
      isTransitioning.value = true
      root.classList.add('theme-transitioning')
    }

    if (isDark) {
      root.classList.add('dark')
      applyColors(preset.colors.dark, false)
    } else {
      root.classList.remove('dark')
      applyColors(preset.colors.light, false)
    }

    if (withTransition) {
      setTimeout(() => {
        isTransitioning.value = false
        root.classList.remove('theme-transitioning')
      }, 300)
    }
  }

  function saveCustomTheme(theme: ThemePreset) {
    customTheme.value = theme
    if (!presets.value.find((p) => p.id === 'custom')) {
      presets.value.push(theme)
    } else {
      const index = presets.value.findIndex((p) => p.id === 'custom')
      presets.value[index] = theme
    }
    applyPreset('custom')
  }

  function toggleDarkMode() {
    const root = window.document.documentElement
    const isDark = root.classList.contains('dark')
    setDarkMode(!isDark)
  }

  return {
    presets,
    currentPresetId,
    customTheme,
    isTransitioning,
    getCurrentPreset,
    applyPreset,
    setDarkMode,
    toggleDarkMode,
    saveCustomTheme,
    getSystemTheme,
  }
}
