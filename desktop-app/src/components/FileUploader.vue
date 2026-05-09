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
  @apply space-y-4;
}

.upload-zone {
  @apply border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all hover:border-primary/50;
}

.upload-zone--dragging {
  @apply border-primary bg-primary/5;
}

.upload-zone__content {
  @apply flex flex-col items-center gap-3;
}

.upload-zone__icon {
  @apply w-12 h-12 text-muted-foreground;
}

.upload-zone__text {
  @apply space-y-1;
}

.file-list {
  @apply space-y-3;
}

.file-list__header {
  @apply flex items-center justify-between;
}

.file-list__content {
  @apply space-y-2;
}

.file-item {
  @apply flex items-center gap-3 p-3 rounded-lg border;
}

.file-item__icon {
  @apply flex-shrink-0 text-muted-foreground;
}

.file-item__info {
  @apply flex-1 min-w-0;
}

.file-item__name {
  @apply font-medium truncate;
}

.file-item__meta {
  @apply text-sm text-muted-foreground;
}

.file-item__progress {
  @apply flex-shrink-0;
}

.file-item__actions {
  @apply flex items-center gap-1 flex-shrink-0;
}
</style>
