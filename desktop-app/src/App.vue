<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { SquarePen, PanelLeft, Maximize2, Minimize2 } from 'lucide-vue-next'
import Sidebar from '@/components/Sidebar.vue'
import { RouterView } from 'vue-router'

const api = window.electronAPI
const platform = api?.platform ?? 'darwin'
const isMaximized = ref(false)
const isHoveringGroup = ref(false)
const sidebarCollapsed = ref(false)

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
  <div class="app-layout" :style="{ '--sidebar-w': sidebarCollapsed ? '0px' : '220px' }">
    <Sidebar v-model:collapsed="sidebarCollapsed" />

    <main class="main-area">
      <div class="main-content">
        <!-- Top header bar: collapsed controls + title + window controls -->
        <div
          class="content-header"
          @dblclick="handleDoubleClick"
        >
          <div class="header-left">
            <template v-if="sidebarCollapsed">
              <!-- macOS Traffic Lights -->
              <div
                v-if="platform === 'darwin'"
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
                  <Maximize2 v-if="!isMaximized" :size="8" />
                  <Minimize2 v-else :size="8" />
                </button>
              </div>
              <!-- Action buttons -->
              <div class="collapsed-actions">
                <button class="collapsed-action-btn" @click="sidebarCollapsed = false" title="展开菜单">
                  <PanelLeft :size="14" />
                </button>
                <button class="collapsed-action-btn" title="新开会话">
                  <SquarePen :size="14" />
                </button>
              </div>
            </template>
            <span class="header-title text-sm font-medium">日常工作助手</span>
          </div>

          <!-- Windows controls -->
          <div v-if="platform === 'win32'" class="win-controls">
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

        <!-- Main content -->
        <div class="content-body">
          <RouterView />
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.app-layout {
  position: relative;
  height: 100vh;
  overflow: hidden;
  background: transparent;
}

/* Main area: transparent shell covering full viewport */
.main-area {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10;
  background: transparent;
  pointer-events: none;
}

/* Actual content: overlaps sidebar right edge by 12px, solid bg, rounded corners */
.main-content {
  margin-left: max(0px, calc(var(--sidebar-w) - 12px));
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--background);
  border-radius: 10px;
  box-shadow: 0 1px 4px hsl(0 0% 0% / 0.06), 0 0 1px hsl(0 0% 0% / 0.04);
  overflow: hidden;
  pointer-events: auto;
  transition: margin-left 0.2s ease;
}

/* Top drag strip */
.content-header {
  height: 38px;
  -webkit-app-region: drag;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 0 0 16px;
  flex-shrink: 0;
  user-select: none;
  gap: 8px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
  -webkit-app-region: no-drag;
}

.header-title {
  font-weight: 500;
  color: var(--muted-foreground);
}

/* Windows controls */
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
  color: var(--foreground);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  outline: none;
  transition: background-color 0.1s;
}

.win-btn:hover {
  background: hsl(0 0% 0% / 0.05);
}

.win-btn-close:hover {
  background: var(--destructive) !important;
  color: var(--destructive-foreground) !important;
  border-top-right-radius: 10px;
}

/* Content body */
.content-body {
  flex: 1;
  overflow-y: auto;
}

.content-welcome {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 32px;
  min-height: 100%;
}

.collapsed-actions {
  display: flex;
  align-items: center;
  gap: 2px;
  -webkit-app-region: no-drag;
}

.collapsed-action-btn {
  width: 20px;
  height: 20px;
  border: none;
  background: transparent;
  color: var(--muted-foreground);
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  outline: none;
  transition: color 0.15s, background-color 0.15s;
}

.collapsed-action-btn:hover {
  color: var(--foreground);
  background: hsl(0 0% 0% / 0.05);
}

.collapsed-action-btn:active {
  background: hsl(0 0% 0% / 0.08);
}

/* Traffic lights (for collapsed header) */
.traffic-lights {
  display: flex;
  gap: 8px;
  -webkit-app-region: no-drag;
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

.traffic-light-close { background: #ff5f57; }
.traffic-light-minimize { background: #febc2e; }
.traffic-light-maximize { background: #28c840; }

.traffic-light.show-icon { color: hsl(0 0% 0% / 0.45); }
.traffic-light-close.show-icon { background: #ff4136; }
.traffic-light-minimize.show-icon { background: #f5b400; }
.traffic-light-maximize.show-icon { background: #17ad31; }
</style>
