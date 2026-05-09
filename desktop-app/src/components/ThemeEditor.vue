<template>
  <div class="theme-editor">
    <div class="theme-editor__header">
      <h3 class="text-lg font-semibold">主题设置</h3>
      <div class="theme-mode-toggle">
        <Button variant="ghost" size="sm" @click="toggleDarkMode">
          {{ isDark ? '浅色模式' : '深色模式' }}
        </Button>
      </div>
    </div>

    <div class="theme-presets">
      <h4 class="text-sm font-medium text-muted-foreground mb-3">预设主题</h4>
      <div class="theme-presets__grid">
        <div
          v-for="preset in themePresets.presets"
          :key="preset.id"
          class="theme-preset"
          :class="{ 'theme-preset--active': themePresets.currentPresetId === preset.id }"
          @click="selectPreset(preset.id)"
        >
          <div class="theme-preset__preview">
            <div
              class="theme-preset__preview-bg"
              :style="{
                background: isDark ? preset.colors.dark.background : preset.colors.light.background,
              }"
            >
              <div
                class="theme-preset__preview-primary"
                :style="{
                  background: isDark ? preset.colors.dark.primary : preset.colors.light.primary,
                }"
              ></div>
            </div>
          </div>
          <div class="theme-preset__info">
            <div class="theme-preset__name">{{ preset.name }}</div>
            <div class="theme-preset__desc">{{ preset.description }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="theme-custom">
      <h4 class="text-sm font-medium text-muted-foreground mb-3">自定义主题</h4>
      <div class="theme-custom__colors">
        <div v-for="(value, key) in customColors" :key="key" class="theme-color-picker">
          <label class="theme-color-picker__label">{{ getColorLabel(key) }}</label>
          <div class="theme-color-picker__input">
            <input
              type="color"
              :value="oklchToHex(value)"
              class="theme-color-picker__color"
              @input="updateColor(key, $event)"
            />
            <span class="theme-color-picker__value">{{ value }}</span>
          </div>
        </div>
      </div>
      <Button class="mt-4" @click="saveCustomTheme">保存自定义主题</Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Button } from '@/components/ui/button'
import { useThemePresets, type ThemeColors, type ThemePreset } from '@/composables/useThemePresets'

const themePresets = useThemePresets()

const isDark = ref(false)
const customColors = ref<ThemeColors>({
  background: '',
  foreground: '',
  card: '',
  'card-foreground': '',
  popover: '',
  'popover-foreground': '',
  primary: '',
  'primary-foreground': '',
  secondary: '',
  'secondary-foreground': '',
  muted: '',
  'muted-foreground': '',
  accent: '',
  'accent-foreground': '',
  destructive: '',
  border: '',
  input: '',
  ring: '',
  sidebar: '',
  'sidebar-foreground': '',
  'sidebar-primary': '',
  'sidebar-primary-foreground': '',
  'sidebar-accent': '',
  'sidebar-accent-foreground': '',
  'sidebar-border': '',
  'sidebar-ring': '',
})

function toggleDarkMode() {
  themePresets.toggleDarkMode()
  isDark.value = !isDark.value
}

function selectPreset(presetId: string) {
  themePresets.applyPreset(presetId)
}

function updateColor(key: keyof ThemeColors, event: Event) {
  const target = event.target as HTMLInputElement
  customColors.value[key] = hexToOklch(target.value)
}

function getColorLabel(key: string) {
  const labels: Record<string, string> = {
    background: '背景色',
    foreground: '前景色',
    primary: '主色调',
    secondary: '次色调',
    accent: '强调色',
    muted: '柔和色',
    destructive: '警告色',
    card: '卡片色',
    popover: '弹出框色',
    border: '边框色',
    input: '输入框色',
    ring: '聚焦环色',
  }
  return labels[key] || key
}

function oklchToHex(oklch: string): string {
  if (!oklch) return '#000000'
  const match = oklch.match(/oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\)/)
  if (!match) return '#000000'

  const l = parseFloat(match[1])
  const c = parseFloat(match[2])
  const h = parseFloat(match[3])

  const a = c * Math.cos((h * Math.PI) / 180)
  const b = c * Math.sin((h * Math.PI) / 180)

  const xyzL = l + 0.3963377774 * a + 0.2158037573 * b
  const xyzz = l - 0.1055613458 * a - 0.0638541728 * b
  const xyzY = l - 0.0894841771 * a - 1.291485548 * b

  const r = +3.2404542 * xyzL - 1.5371385 * xyzz - 0.4985314 * xyzY
  const g = -0.969266 * xyzL + 1.8760108 * xyzz + 0.041556 * xyzY
  const b2 = +0.0556434 * xyzL - 0.2040259 * xyzz + 1.0572252 * xyzY

  const toLinear = (v: number) => (v > 0.0031308 ? 1.055 * Math.pow(v, 1 / 2.4) - 0.055 : 12.92 * v)

  const rLinear = toLinear(r)
  const gLinear = toLinear(g)
  const bLinear = toLinear(b2)

  const clamp = (v: number) => Math.max(0, Math.min(1, v))
  const toHex = (v: number) =>
    Math.round(clamp(v) * 255)
      .toString(16)
      .padStart(2, '0')

  return `#${toHex(rLinear)}${toHex(gLinear)}${toHex(bLinear)}`
}

function hexToOklch(hex: string): string {
  hex = hex.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16) / 255
  const g = parseInt(hex.substring(2, 4), 16) / 255
  const b = parseInt(hex.substring(4, 6), 16) / 255

  const toLinear = (v: number) => (v > 0.04045 ? Math.pow((v + 0.055) / 1.055, 2.4) : v / 12.92)

  const rLinear = toLinear(r)
  const gLinear = toLinear(g)
  const bLinear = toLinear(b)

  const x = 0.4124564 * rLinear + 0.3575761 * gLinear + 0.1804375 * bLinear
  const y = 0.2126729 * rLinear + 0.7151522 * gLinear + 0.072175 * bLinear
  const z = 0.0193339 * rLinear + 0.119192 * gLinear + 0.9503041 * bLinear

  const l = 0.81893301 * x + 0.36186674 * y - 0.12885971 * z
  const m = 0.03298454 * x + 0.92931187 * y + 0.03614564 * z
  const s = 0.0482 * x + 0.26436626 * y + 0.63385649 * z

  const l2 = Math.cbrt(l)
  const m2 = Math.cbrt(m)
  const s2 = Math.cbrt(s)

  const L = 0.2104542553 * l2 + 0.793617785 * m2 - 0.0040720468 * s2
  const a = 1.9779984951 * l2 - 2.428592205 * m2 + 0.4505937099 * s2
  const b2 = 0.0259040371 * l2 + 0.7827717662 * m2 - 0.808675766 * s2

  const C = Math.sqrt(a * a + b2 * b2)
  const H = Math.atan2(b2, a) * (180 / Math.PI)
  const H2 = H < 0 ? H + 360 : H

  return `oklch(${L.toFixed(3)} ${C.toFixed(3)} ${H2.toFixed(1)})`
}

function saveCustomTheme() {
  const currentPreset = themePresets.getCurrentPreset()
  const customTheme: ThemePreset = {
    id: 'custom',
    name: '自定义主题',
    description: '您的自定义主题',
    colors: {
      light: { ...customColors.value },
      dark: { ...currentPreset.colors.dark },
    },
  }
  themePresets.saveCustomTheme(customTheme)
}

onMounted(() => {
  const root = window.document.documentElement
  isDark.value = root.classList.contains('dark')
  const preset = themePresets.getCurrentPreset()
  customColors.value = { ...preset.colors[isDark.value ? 'dark' : 'light'] }
})
</script>

<style scoped>
.theme-editor {
  @apply p-6 space-y-6;
}

.theme-editor__header {
  @apply flex items-center justify-between;
}

.theme-presets__grid {
  @apply grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3;
}

.theme-preset {
  @apply p-3 rounded-lg border cursor-pointer transition-all hover:border-primary/50;
}

.theme-preset--active {
  @apply border-primary bg-primary/5;
}

.theme-preset__preview {
  @apply mb-2;
}

.theme-preset__preview-bg {
  @apply h-16 rounded-md flex items-center justify-center;
}

.theme-preset__preview-primary {
  @apply w-8 h-8 rounded-full;
}

.theme-preset__info {
  @apply text-sm;
}

.theme-preset__name {
  @apply font-medium;
}

.theme-preset__desc {
  @apply text-xs text-muted-foreground;
}

.theme-custom__colors {
  @apply grid grid-cols-1 sm:grid-cols-2 gap-3;
}

.theme-color-picker {
  @apply space-y-1;
}

.theme-color-picker__label {
  @apply text-sm font-medium;
}

.theme-color-picker__input {
  @apply flex items-center gap-2;
}

.theme-color-picker__color {
  @apply w-10 h-10 rounded cursor-pointer border-0 p-0;
}

.theme-color-picker__value {
  @apply text-xs text-muted-foreground font-mono;
}
</style>
