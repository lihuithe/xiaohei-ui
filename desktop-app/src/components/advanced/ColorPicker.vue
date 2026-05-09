<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { Palette, Check, Eye, Type, Hash } from 'lucide-vue-next'

interface ColorPickerProps {
  modelValue?: string
  showPreset?: boolean
  showCustom?: boolean
  showHistory?: boolean
}

const props = withDefaults(defineProps<ColorPickerProps>(), {
  modelValue: '#3b82f6',
  showPreset: true,
  showCustom: true,
  showHistory: true,
})

const emit = defineEmits<{
  (e: 'update:modelValue', color: string): void
}>()

const currentColor = ref(props.modelValue)
const showPicker = ref(false)
const activeTab = ref<'preset' | 'custom'>('preset')
const colorHistory = ref<string[]>([])
const hue = ref(210)
const saturation = ref(70)
const lightness = ref(50)
const alpha = ref(100)
const red = ref(59)
const green = ref(130)
const blue = ref(246)

const presetColors = [
  '#ef4444',
  '#f97316',
  '#f59e0b',
  '#eab308',
  '#84cc16',
  '#22c55e',
  '#14b8a6',
  '#06b6d4',
  '#0ea5e9',
  '#3b82f6',
  '#6366f1',
  '#8b5cf6',
  '#a855f7',
  '#d946ef',
  '#ec4899',
  '#f43f5e',
]

const presetPalettes = [
  { name: '现代', colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'] },
  { name: '自然', colors: ['#65a30d', '#84cc16', '#a3e635', '#bef264', '#d9f99d'] },
  { name: '温暖', colors: ['#f97316', '#f59e0b', '#eab308', '#ca8a04', '#a16207'] },
  { name: '深海', colors: ['#0ea5e9', '#06b6d4', '#0891b2', '#0e7490', '#155e75'] },
]

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 }
}

function rgbToHex(r: number, g: number, b: number) {
  return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')
}

function hslToRgb(h: number, s: number, l: number) {
  s /= 100
  l /= 100
  const k = (n: number) => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  return {
    r: Math.round(f(0) * 255),
    g: Math.round(f(8) * 255),
    b: Math.round(f(4) * 255),
  }
}

function rgbToHsl(r: number, g: number, b: number) {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }
    h *= 60
  }
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) }
}

function updateFromColor(color: string) {
  currentColor.value = color
  const rgb = hexToRgb(color)
  red.value = rgb.r
  green.value = rgb.g
  blue.value = rgb.b
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
  hue.value = hsl.h
  saturation.value = hsl.s
  lightness.value = hsl.l
  if (!colorHistory.value.includes(color)) {
    colorHistory.value.unshift(color)
    if (colorHistory.value.length > 12) {
      colorHistory.value.pop()
    }
  }
}

function selectColor(color: string) {
  updateFromColor(color)
  emit('update:modelValue', color)
}

watch(
  () => props.modelValue,
  (newValue) => {
    updateFromColor(newValue)
  }
)

watch([red, green, blue], () => {
  const hex = rgbToHex(red.value, green.value, blue.value)
  currentColor.value = hex
  const hsl = rgbToHsl(red.value, green.value, blue.value)
  hue.value = hsl.h
  saturation.value = hsl.s
  lightness.value = hsl.l
  emit('update:modelValue', hex)
})

watch([hue, saturation, lightness], () => {
  const rgb = hslToRgb(hue.value, saturation.value, lightness.value)
  red.value = rgb.r
  green.value = rgb.g
  blue.value = rgb.b
  const hex = rgbToHex(rgb.r, rgb.g, rgb.b)
  currentColor.value = hex
  emit('update:modelValue', hex)
})

function handleClickOutside(event: Event) {
  const target = event.target as HTMLElement
  if (!target.closest('.color-picker-wrapper')) {
    showPicker.value = false
  }
}

onMounted(() => {
  updateFromColor(props.modelValue)
  document.addEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="color-picker-wrapper" role="combobox" aria-haspopup="dialog">
    <button class="color-picker-trigger" aria-label="选择颜色" @click="showPicker = !showPicker">
      <div class="color-preview" :style="{ backgroundColor: currentColor }"></div>
      <Palette :size="16" />
    </button>

    <div v-if="showPicker" class="color-picker-popover" role="dialog" aria-label="颜色选择器">
      <div class="picker-header">
        <div class="current-color-preview" :style="{ backgroundColor: currentColor }"></div>
        <input
          v-model="currentColor"
          class="color-input"
          maxlength="7"
          @input="selectColor(currentColor)"
        />
      </div>

      <div class="picker-tabs">
        <button
          v-if="showPreset"
          class="tab-button"
          :class="{ active: activeTab === 'preset' }"
          @click="activeTab = 'preset'"
        >
          <Palette :size="14" />
          <span>预设</span>
        </button>
        <button
          v-if="showCustom"
          class="tab-button"
          :class="{ active: activeTab === 'custom' }"
          @click="activeTab = 'custom'"
        >
          <Eye :size="14" />
          <span>自定义</span>
        </button>
      </div>

      <div v-if="activeTab === 'preset'" class="preset-colors">
        <div class="color-grid">
          <button
            v-for="color in presetColors"
            :key="color"
            class="color-swatch"
            :class="{ active: currentColor === color }"
            :style="{ backgroundColor: color }"
            :aria-label="`颜色 ${color}`"
            @click="selectColor(color)"
          >
            <Check v-if="currentColor === color" :size="12" class="check-icon" />
          </button>
        </div>
        <div class="palettes">
          <div v-for="palette in presetPalettes" :key="palette.name" class="palette">
            <span class="palette-name">{{ palette.name }}</span>
            <div class="palette-colors">
              <button
                v-for="color in palette.colors"
                :key="color"
                class="palette-color"
                :style="{ backgroundColor: color }"
                @click="selectColor(color)"
              ></button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'custom'" class="custom-colors">
        <div class="hue-slider-container">
          <div class="hue-slider-track"></div>
          <input v-model="hue" type="range" min="0" max="360" class="hue-slider" />
        </div>
        <div class="color-sliders">
          <div class="slider-row">
            <span class="slider-label">
              <Type :size="14" />
              红
            </span>
            <input v-model="red" type="range" min="0" max="255" class="color-slider" />
            <span class="slider-value">{{ red }}</span>
          </div>
          <div class="slider-row">
            <span class="slider-label">
              <Type :size="14" />
              绿
            </span>
            <input v-model="green" type="range" min="0" max="255" class="color-slider" />
            <span class="slider-value">{{ green }}</span>
          </div>
          <div class="slider-row">
            <span class="slider-label">
              <Type :size="14" />
              蓝
            </span>
            <input v-model="blue" type="range" min="0" max="255" class="color-slider" />
            <span class="slider-value">{{ blue }}</span>
          </div>
        </div>
      </div>

      <div v-if="showHistory && colorHistory.length > 0" class="history-colors">
        <div class="history-title">最近使用</div>
        <div class="color-grid">
          <button
            v-for="color in colorHistory"
            :key="color"
            class="color-swatch"
            :class="{ active: currentColor === color }"
            :style="{ backgroundColor: color }"
            @click="selectColor(color)"
          >
            <Check v-if="currentColor === color" :size="12" class="check-icon" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.color-picker-wrapper {
  position: relative;
  display: inline-block;
}

.color-picker-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--background);
  color: var(--foreground);
  cursor: pointer;
  transition: all 0.15s;
}

.color-picker-trigger:hover {
  border-color: var(--primary);
}

.color-preview {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: 1px solid var(--border);
}

.color-picker-popover {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  z-index: 50;
  width: 280px;
  background: var(--background);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  padding: 16px;
}

.picker-header {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.current-color-preview {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
}

.color-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--background);
  color: var(--foreground);
  font-family: monospace;
}

.picker-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--border);
}

.tab-button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px 12px;
  border: none;
  background: transparent;
  color: var(--muted-foreground);
  cursor: pointer;
  font-size: 13px;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  transition: all 0.15s;
}

.tab-button:hover {
  color: var(--foreground);
}

.tab-button.active {
  color: var(--primary);
  border-bottom-color: var(--primary);
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 8px;
}

.color-swatch {
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    transform 0.15s,
    box-shadow 0.15s;
}

.color-swatch:hover {
  transform: scale(1.1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.color-swatch.active {
  box-shadow: 0 0 0 2px var(--primary);
}

.check-icon {
  color: white;
  filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.3));
}

.palettes {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.palette {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.palette-name {
  font-size: 12px;
  color: var(--muted-foreground);
}

.palette-colors {
  display: flex;
  gap: 4px;
}

.palette-color {
  flex: 1;
  height: 28px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.15s;
}

.palette-color:hover {
  transform: scale(1.05);
}

.custom-colors {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.hue-slider-container {
  position: relative;
  height: 20px;
}

.hue-slider-track {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 10px;
  background: linear-gradient(
    to right,
    #ff0000,
    #ffff00,
    #00ff00,
    #00ffff,
    #0000ff,
    #ff00ff,
    #ff0000
  );
}

.hue-slider {
  position: relative;
  width: 100%;
  height: 20px;
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
  cursor: pointer;
  z-index: 1;
}

.hue-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 24px;
  background: white;
  border: 2px solid #666;
  border-radius: 4px;
  cursor: pointer;
  margin-top: -2px;
}

.color-sliders {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.slider-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.slider-label {
  width: 32px;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--muted-foreground);
}

.color-slider {
  flex: 1;
  height: 4px;
  -webkit-appearance: none;
  appearance: none;
  background: var(--border);
  border-radius: 2px;
  cursor: pointer;
}

.color-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 14px;
  height: 14px;
  background: var(--primary);
  border: none;
  border-radius: 50%;
  cursor: pointer;
}

.slider-value {
  width: 32px;
  text-align: right;
  font-size: 12px;
  color: var(--muted-foreground);
  font-family: monospace;
}

.history-colors {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--border);
}

.history-title {
  font-size: 12px;
  color: var(--muted-foreground);
  margin-bottom: 8px;
}

@media (max-width: 640px) {
  .color-picker-popover {
    width: 260px;
  }
  .color-grid {
    grid-template-columns: repeat(6, 1fr);
  }
}
</style>
