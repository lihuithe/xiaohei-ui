<script setup lang="ts">
import { ref, onMounted } from 'vue'

const api = window.electronAPI
const platform = api?.platform ?? 'darwin'
const isMaximized = ref(false)
const isHoveringGroup = ref(false)

onMounted(() => {
  api?.onWindowStateChanged?.((state: string) => {
    isMaximized.value = state === 'maximized'
  })
})

function handleDoubleClick() {
  api?.maximize?.()
}

function minimize() {
  api?.minimize?.()
}

function maximize() {
  api?.maximize?.()
}

function close() {
  api?.close?.()
}
</script>

<template>
  <!-- macOS Traffic Lights -->
  <div
    v-if="platform === 'darwin'"
    class="titlebar mac-titlebar"
    @dblclick="handleDoubleClick"
  >
    <div
      class="traffic-lights"
      @mouseenter="isHoveringGroup = true"
      @mouseleave="isHoveringGroup = false"
    >
      <button
        class="traffic-light traffic-light-close"
        :class="{ 'show-icon': isHoveringGroup }"
        @click="close"
      >
        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
          <path d="M1.5 1.5L6.5 6.5M6.5 1.5L1.5 6.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
        </svg>
      </button>
      <button
        class="traffic-light traffic-light-minimize"
        :class="{ 'show-icon': isHoveringGroup }"
        @click="minimize"
      >
        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
          <path d="M1.5 4H6.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
        </svg>
      </button>
      <button
        class="traffic-light traffic-light-maximize"
        :class="{ 'show-icon': isHoveringGroup }"
        @click="maximize"
      >
        <svg v-if="!isMaximized" width="8" height="8" viewBox="0 0 8 8" fill="none">
          <path d="M1 3V1H3M5 1H7V3M7 5V7H5M3 7H1V5" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <svg v-else width="8" height="8" viewBox="0 0 8 8" fill="none">
          <path d="M1 3V1H3M5 1H7V3M7 5V7H5M3 7H1V5" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
    </div>
    <span class="titlebar-title text-sm font-medium">Electron Vue3 App</span>
  </div>

  <!-- Windows Title Bar -->
  <div
    v-else
    class="titlebar win-titlebar"
    @dblclick="handleDoubleClick"
  >
    <span class="titlebar-title text-xs">Electron Vue3 App</span>
    <div class="win-controls">
      <button class="win-btn" @click="minimize" title="最小化">
        <svg width="10" height="1" viewBox="0 0 10 1">
          <rect width="10" height="1" fill="currentColor" />
        </svg>
      </button>
      <button class="win-btn" @click="maximize" :title="isMaximized ? '还原' : '最大化'">
        <svg v-if="!isMaximized" width="10" height="10" viewBox="0 0 10 10" fill="none">
          <rect x="0.5" y="0.5" width="9" height="9" stroke="currentColor" fill="none" />
        </svg>
        <svg v-else width="10" height="10" viewBox="0 0 10 10" fill="none">
          <rect x="2.5" y="0" width="7" height="7" stroke="currentColor" fill="none" />
          <rect x="0" y="2.5" width="7" height="7" stroke="currentColor" fill="#fff" />
          <rect x="0" y="2.5" width="7" height="7" stroke="currentColor" fill="none" />
        </svg>
      </button>
      <button class="win-btn win-btn-close" @click="close" title="关闭">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M0 0L10 10M10 0L0 10" stroke="currentColor" stroke-width="1" />
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
/* Common draggable titlebar */
.titlebar {
  -webkit-app-region: drag;
  user-select: none;
  flex-shrink: 0;
}

/* ========== macOS Title Bar ========== */
.mac-titlebar {
  height: 38px;
  display: flex;
  align-items: center;
  position: relative;
  background: #ececec;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.traffic-lights {
  display: flex;
  gap: 8px;
  padding-left: 13px;
  -webkit-app-region: no-drag;
  z-index: 10;
}

.traffic-light {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  outline: none;
  color: transparent;
  transition: filter 0.15s;
}

.traffic-light:active {
  filter: brightness(0.7);
}

.traffic-light-close {
  background: #ff5f57;
}
.traffic-light-minimize {
  background: #febc2e;
}
.traffic-light-maximize {
  background: #28c840;
}

.traffic-light.show-icon {
  color: rgba(0, 0, 0, 0.45);
}

.traffic-light-close.show-icon {
  background: #ff4136;
}
.traffic-light-minimize.show-icon {
  background: #f5b400;
}
.traffic-light-maximize.show-icon {
  background: #17ad31;
}

.mac-titlebar .titlebar-title {
  position: absolute;
  left: 0;
  right: 0;
  text-align: center;
  font-weight: 500;
  color: #4d4d4d;
  pointer-events: none;
}

/* ========== Windows Title Bar ========== */
.win-titlebar {
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--background, #fff);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.win-titlebar .titlebar-title {
  flex: 1;
  text-align: left;
  padding-left: 12px;
  color: var(--foreground, #333);
  pointer-events: none;
}

.win-controls {
  display: flex;
  height: 100%;
  -webkit-app-region: no-drag;
}

.win-btn {
  width: 46px;
  height: 100%;
  border: none;
  background: transparent;
  color: var(--foreground, #333);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  outline: none;
  transition: background-color 0.1s;
}

.win-btn:hover {
  background: rgba(0, 0, 0, 0.05);
}

.win-btn-close:hover {
  background: #e81123 !important;
  color: #fff !important;
}

.win-btn svg {
  display: block;
}
</style>
