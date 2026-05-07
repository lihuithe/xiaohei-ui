<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Settings, PanelLeft, Maximize2, Minimize2, MessageSquare, Search, Puzzle, Zap, Plus } from 'lucide-vue-next'

const props = defineProps<{
  collapsed: boolean
}>()

const emit = defineEmits<{
  (e: 'update:collapsed', value: boolean): void
}>()

const api = window.electronAPI
const platform = api?.platform ?? 'darwin'
const isMaximized = ref(false)
const isHoveringGroup = ref(false)
const activeNav = ref('chat')

onMounted(() => {
  api?.onWindowStateChanged?.((state: string) => {
    isMaximized.value = state === 'maximized'
  })
})

const navItems = [
  { id: 'chat', label: '对话', icon: MessageSquare },
  { id: 'search', label: '搜索', icon: Search },
  { id: 'plugins', label: '插件', icon: Puzzle },
  { id: 'automation', label: '自动化', icon: Zap },
]

const conversations = [
  { id: 1, name: '日常工作助手', active: true },
  { id: 2, name: '代码生成器', active: false },
  { id: 3, name: '文档整理', active: false },
]

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

function toggleCollapse() {
  emit('update:collapsed', !props.collapsed)
}
</script>

<template>
  <aside class="sidebar" :class="{ 'sidebar-collapsed': collapsed }">
    <!-- Drag region + macOS traffic lights -->
    <div
      class="sidebar-drag-area"
      @dblclick="handleDoubleClick"
    >
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

      <!-- Collapse toggle (panel icon) -->
      <div class="sidebar-titlebar-actions" @dblclick.stop>
        <button class="titlebar-action-btn" @click="toggleCollapse" title="收起菜单">
          <PanelLeft :size="14" />
        </button>
      </div>

      <!-- Spacer for Windows -->
      <div v-if="platform !== 'darwin'" class="drag-spacer" />
    </div>

    <!-- Navigation — hidden when collapsed -->
    <nav class="sidebar-nav">
      <button
        v-for="item in navItems"
        :key="item.id"
        class="nav-item text-sm"
        :class="{ 'nav-item-active': activeNav === item.id }"
        :title="collapsed ? item.label : ''"
        @click="activeNav = item.id"
      >
        <span class="nav-icon">
          <component :is="item.icon" :size="16" />
        </span>
        <span v-if="!collapsed" class="nav-label">{{ item.label }}</span>
      </button>
    </nav>

    <!-- Conversation list -->
    <div class="sidebar-section">
      <div class="section-header">
        <span class="section-title text-sm">对话</span>
        <button class="section-action" title="新建对话">
          <Plus :size="14" />
        </button>
      </div>
      <div class="project-list">
        <button
          v-for="conv in conversations"
          :key="conv.id"
          class="project-item text-sm"
          :class="{ 'project-item-active': conv.active }"
        >
          <span class="project-name">{{ conv.name }}</span>
        </button>
      </div>
    </div>

    <!-- Bottom: Settings -->
    <div class="sidebar-bottom">
      <button class="nav-item text-sm" title="设置">
        <span class="nav-icon">
          <Settings :size="18" />
        </span>
        <span v-if="!collapsed" class="nav-label">设置</span>
      </button>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 220px;
  z-index: 1;
  display: flex;
  flex-direction: column;
  padding: 0 10px 0 10px;
  padding-right: 20px;
  background: oklch(0.95 0.005 260 / 0.99);
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  user-select: none;
  overflow: visible;
  border-radius: 10px 0 0 10px;
}

.sidebar-collapsed {
  pointer-events: none;
}

/* Extend background 12px to the right for content area overlap */
.sidebar::after {
  content: '';
  position: absolute;
  top: 0;
  right: -12px;
  bottom: 0;
  width: 12px;
  background: oklch(0.95 0.005 260 / 0.99);
  pointer-events: none;
}

/* Drag area at top of sidebar */
.sidebar-drag-area {
  -webkit-app-region: drag;
  display: flex;
  align-items: center;
  padding: 10px 5px;
  flex-shrink: 0;
  gap: 8px;
  padding-bottom: 11px;
}

/* Titlebar action buttons */
.sidebar-titlebar-actions {
  display: flex;
  align-items: center;
  gap: 2px;
  -webkit-app-region: no-drag;
}

.titlebar-action-btn {
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

.titlebar-action-btn:hover {
  color: var(--foreground);
  background: hsl(0 0% 0% / 0.05);
}

.titlebar-action-btn:active {
  background: hsl(0 0% 0% / 0.08);
}

.drag-spacer {
  flex: 1;
}

/* Traffic lights */
.traffic-lights {
  display: flex;
  gap: 8px;
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

.traffic-light-close { background: #ff5f57; }
.traffic-light-minimize { background: #febc2e; }
.traffic-light-maximize { background: #28c840; }

.traffic-light.show-icon { color: hsl(0 0% 0% / 0.45); }
.traffic-light-close.show-icon { background: #ff4136; }
.traffic-light-minimize.show-icon { background: #f5b400; }
.traffic-light-maximize.show-icon { background: #17ad31; }

/* Navigation */
.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 10px;
  border-radius: var(--radius-md);
  border: none;
  background: transparent;
  color: var(--sidebar-foreground);
  cursor: pointer;
  width: 100%;
  text-align: left;
  transition: background-color 0.1s, color 0.1s;
  white-space: nowrap;
}

.nav-item:hover {
  background: hsl(0 0% 0% / 0.05);
}

.nav-item-active {
  background: hsl(0 0% 0% / 0.07);
  color: var(--foreground);
}

.nav-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  opacity: 0.6;
}

.nav-item-active .nav-icon {
  opacity: 0.9;
}

.nav-label {
  line-height: 1;
}

/* Section */
.sidebar-section {
  flex: 1;
  overflow-y: auto;
  padding-top: 12px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 10px;
}

.section-title {
  color: var(--muted-foreground);
  padding-left: 10px;
}

.section-action {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border: none;
  background: transparent;
  color: var(--muted-foreground);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background-color 0.1s;
}

.section-action:hover {
  background: var(--sidebar-accent);
  color: var(--sidebar-foreground);
}

/* Project list */
.project-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.project-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: var(--radius-md);
  border: none;
  background: transparent;
  color: var(--sidebar-foreground);
  cursor: pointer;
  width: 100%;
  text-align: left;
  transition: background-color 0.1s;
}

.project-item:hover {
  background: var(--sidebar-accent);
}

.project-item-active {
  background: hsl(0 0% 0% / 0.07);
}

.project-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--sidebar-primary);
  flex-shrink: 0;
}

.project-item:not(.project-item-active) .project-dot {
  background: var(--muted-foreground);
  opacity: 0.4;
}

.project-name {
  line-height: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Bottom */
.sidebar-bottom {
  padding-top: 4px;
  padding-bottom: 10px;
  margin-top: auto;
}
</style>
