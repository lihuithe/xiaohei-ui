<template>
  <div class="file-uploader">
    <div
      class="upload-zone"
      :class="{ 'upload-zone--dragging': isDragging }"
      @dragover.prevent="handleDragOver"
      @dragleave.prevent="handleDragLeave"
      @drop.prevent="handleDrop"
      @click="triggerFileInput"
    >
      <input
        ref="fileInputRef"
        type="file"
        multiple
        :accept="accept"
        class="hidden"
        @change="handleFileSelect"
      />
      <div class="upload-zone__content">
        <UploadIcon class="upload-zone__icon" />
        <div class="upload-zone__text">
          <p class="font-medium">点击或拖拽文件到此处上传</p>
          <p class="text-sm text-muted-foreground">
            支持 {{ acceptText }} 格式，最大 {{ maxSizeMB }}MB
          </p>
        </div>
      </div>
    </div>

    <div v-if="files.length > 0" class="file-list">
      <div class="file-list__header">
        <h4 class="text-sm font-medium">已上传文件 ({{ files.length }})</h4>
        <Button variant="ghost" size="sm" @click="clearFiles">清空</Button>
      </div>
      <div class="file-list__content">
        <div v-for="file in files" :key="file.id" class="file-item">
          <div class="file-item__icon">
            <component :is="getFileIcon(file.type)" class="w-5 h-5" />
          </div>
          <div class="file-item__info">
            <div class="file-item__name">{{ file.name }}</div>
            <div class="file-item__meta">
              {{ formatFileSize(file.size) }} · {{ file.uploadedAt }}
            </div>
          </div>
          <div
            v-if="file.progress !== undefined && file.progress < 100"
            class="file-item__progress"
          >
            <Progress :value="file.progress" class="w-24" />
          </div>
          <div class="file-item__actions">
            <Button
              variant="ghost"
              size="icon"
              :disabled="file.status === 'uploading'"
              @click="downloadFile(file)"
            >
              <DownloadIcon class="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" @click="removeFile(file.id)">
              <TrashIcon class="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Upload as UploadIcon,
  File as FileIcon,
  FileText as FileTextIcon,
  Image as ImageIcon,
  Video as VideoIcon,
  Download as DownloadIcon,
  Trash2 as TrashIcon,
} from 'lucide-vue-next'

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  status: 'uploading' | 'success' | 'error'
  progress?: number
  uploadedAt: string
}

interface Props {
  accept?: string
  maxSizeMB?: number
  multiple?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  accept: '*',
  maxSizeMB: 100,
  multiple: true,
})

const emit = defineEmits<{
  'file-added': [file: globalThis.File]
  'file-removed': [id: string]
  'files-changed': [files: UploadedFile[]]
}>()

const fileInputRef = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const files = ref<UploadedFile[]>([])

const acceptText = computed(() => {
  if (props.accept === '*') return '所有'
  return props.accept
})

function triggerFileInput() {
  fileInputRef.value?.click()
}

function handleDragOver() {
  isDragging.value = true
}

function handleDragLeave() {
  isDragging.value = false
}

function handleDrop(event: DragEvent) {
  isDragging.value = false
  const droppedFiles = event.dataTransfer?.files
  if (droppedFiles) {
    processFiles(Array.from(droppedFiles))
  }
}

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files) {
    processFiles(Array.from(target.files))
  }
  target.value = ''
}

function processFiles(selectedFiles: globalThis.File[]) {
  const validFiles = selectedFiles.filter((file) => {
    const isValidSize = file.size <= props.maxSizeMB * 1024 * 1024
    if (!isValidSize) {
      // 文件超过大小限制
    }
    return isValidSize
  })

  validFiles.forEach((file) => {
    emit('file-added', file)
    uploadFile(file)
  })
}

function uploadFile(file: globalThis.File) {
  const id = generateId()
  const now = new Date()
  const uploadedFile: UploadedFile = {
    id,
    name: file.name,
    size: file.size,
    type: file.type,
    status: 'uploading',
    progress: 0,
    uploadedAt: formatDate(now),
  }

  files.value.push(uploadedFile)
  emit('files-changed', [...files.value])

  let progress = 0
  const interval = setInterval(() => {
    progress += Math.random() * 30
    if (progress >= 100) {
      progress = 100
      clearInterval(interval)
      uploadedFile.status = 'success'
      uploadedFile.progress = undefined
    } else {
      uploadedFile.progress = progress
    }
    emit('files-changed', [...files.value])
  }, 300)
}

function removeFile(id: string) {
  const index = files.value.findIndex((f) => f.id === id)
  if (index !== -1) {
    files.value.splice(index, 1)
    emit('file-removed', id)
    emit('files-changed', [...files.value])
  }
}

function clearFiles() {
  files.value = []
  emit('files-changed', [])
}

function downloadFile(_file: UploadedFile) {
  // 文件下载处理
}

function getFileIcon(type: string) {
  if (type.startsWith('image/')) return ImageIcon
  if (type.startsWith('video/')) return VideoIcon
  if (type.includes('pdf') || type.includes('text')) return FileTextIcon
  return FileIcon
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function formatDate(date: Date): string {
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}
</script>

<style scoped>
.file-uploader {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.upload-zone {
  border: 2px dashed var(--border);
  border-radius: 0.5rem;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.upload-zone:hover {
  border-color: color-mix(in oklch, var(--primary) 50%, transparent);
}

.upload-zone--dragging {
  border-color: var(--primary);
  background: color-mix(in oklch, var(--primary) 5%, transparent);
}

.upload-zone__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.upload-zone__icon {
  width: 3rem;
  height: 3rem;
  color: var(--muted-foreground);
}

.upload-zone__text {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.file-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.file-list__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.file-list__content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid var(--border);
}

.file-item__icon {
  flex-shrink: 0;
  color: var(--muted-foreground);
}

.file-item__info {
  flex: 1;
  min-width: 0;
}

.file-item__name {
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-item__meta {
  font-size: 0.875rem;
  color: var(--muted-foreground);
}

.file-item__progress {
  flex-shrink: 0;
}

.file-item__actions {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex-shrink: 0;
}
</style>
