<template>
  <div class="feature-demo">
    <div class="demo-header">
      <h1 class="text-2xl font-bold">功能演示</h1>
      <p class="text-muted-foreground">体验 Phase 6 的新功能</p>
    </div>

    <EnhancedTabs v-model="activeTab" :tabs="tabs" @tab-close="closeTabHandler">
      <div v-if="activeTab === 'theme'" class="tab-panel">
        <ThemeEditor />
      </div>
      <div v-if="activeTab === 'files'" class="tab-panel feature-demo__panel">
        <div class="feature-demo__content">
          <h2 class="text-lg font-semibold mb-4">文件上传与管理</h2>
          <FileUploader
            accept="*"
            :max-size-mb="100"
            @file-added="onFileAdded"
            @files-changed="onFilesChanged"
          />
        </div>
      </div>
      <div v-if="activeTab === 'notifications'" class="tab-panel feature-demo__panel">
        <div class="feature-demo__content">
          <h2 class="text-lg font-semibold mb-4">通知系统</h2>
          <div class="feature-demo__notification-buttons">
            <Button @click="showNotification('success')">成功通知</Button>
            <Button @click="showNotification('info')">信息通知</Button>
            <Button @click="showNotification('warning')">警告通知</Button>
            <Button @click="showNotification('error')">错误通知</Button>
          </div>
        </div>
      </div>
      <template #actions>
        <Button variant="ghost" size="icon" @click="addNewTab">
          <PlusIcon class="w-4 h-4" />
        </Button>
      </template>
    </EnhancedTabs>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { toast } from 'vue-sonner'
import {
  Palette as PaletteIcon,
  File as FileIcon,
  Bell as BellIcon,
  Plus as PlusIcon,
} from 'lucide-vue-next'
import EnhancedTabs from '@/components/EnhancedTabs.vue'
import ThemeEditor from '@/components/ThemeEditor.vue'
import FileUploader from '@/components/FileUploader.vue'

const activeTab = ref('theme')

const tabs = ref([
  { id: 'theme', title: '主题设置', icon: PaletteIcon },
  { id: 'files', title: '文件管理', icon: FileIcon },
  { id: 'notifications', title: '通知系统', icon: BellIcon },
])

function addNewTab() {
  const id = `tab-${Date.now()}`
  tabs.value.push({
    id,
    title: `新标签页 ${tabs.value.length + 1}`,
    closable: true,
  })
  activeTab.value = id
}

function closeTabHandler(id: string) {
  const index = tabs.value.findIndex(t => t.id === id)
  if (index !== -1) {
    tabs.value.splice(index, 1)
    if (activeTab.value === id) {
      activeTab.value = tabs.value[0]?.id || ''
    }
  }
}

function onFileAdded(file: globalThis.File) {
  toast.success(`文件已添加: ${file.name}`)
}

function onFilesChanged(_files: unknown[]) {
  // 文件列表变化处理
}

function showNotification(type: string) {
  switch (type) {
    case 'success':
      toast.success('操作成功！', {
        description: '您的更改已保存。',
      })
      break
    case 'info':
      toast.info('提示信息', {
        description: '这是一条通知信息。',
      })
      break
    case 'warning':
      toast.warning('警告', {
        description: '请注意此操作可能有风险。',
      })
      break
    case 'error':
      toast.error('错误', {
        description: '操作失败，请重试。',
      })
      break
  }
}
</script>

<style scoped>
.feature-demo {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.demo-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--border);
}

.tab-panel {
  height: 100%;
}

.feature-demo__panel {
  padding: 1.5rem;
}

.feature-demo__content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.feature-demo__notification-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
</style>
