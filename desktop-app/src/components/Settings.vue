<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Settings, RefreshCw, Download, Zap } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from 'vue-sonner'

defineProps<{
  collapsed?: boolean
}>()

interface UpdateInfo {
  version?: string
  releaseDate?: string
  releaseNotes?: string
}

interface UpdateStatus {
  status: 'idle' | 'checking' | 'available' | 'not-available' | 'downloading' | 'downloaded' | 'error'
  info?: UpdateInfo
  progress?: {
    percent: number
    bytesPerSecond: number
    total: number
    transferred: number
  }
  error?: string
}

const isOpen = ref(false)
const updateStatus = ref<UpdateStatus>({ status: 'idle' })
const updateInfo = ref<UpdateInfo | null>(null)
const progress = ref(0)
const downloadSpeed = ref('')

const statusMessages: Record<string, string> = {
  checking: '正在检查更新...',
  available: '发现新版本',
  'not-available': '已是最新版本',
  downloading: '正在下载更新',
  downloaded: '更新已下载完成',
  error: '更新检查失败',
}

function formatSpeed(bytesPerSecond: number): string {
  if (bytesPerSecond > 1024 * 1024) {
    return `${(bytesPerSecond / (1024 * 1024)).toFixed(1)} MB/s`
  }
  return `${(bytesPerSecond / 1024).toFixed(1)} KB/s`
}

function handleUpdateStatus(data: UpdateStatus) {
  updateStatus.value = data

  if (data.status === 'available' && data.info) {
    updateInfo.value = data.info
    toast.info(`发现新版本 ${data.info.version}`, {
      description: data.info.releaseDate
        ? `发布于 ${new Date(data.info.releaseDate).toLocaleDateString('zh-CN')}`
        : undefined,
    })
  }

  if (data.status === 'downloading' && data.progress) {
    progress.value = Math.round(data.progress.percent)
    downloadSpeed.value = formatSpeed(data.progress.bytesPerSecond)
  }

  if (data.status === 'downloaded') {
    progress.value = 100
    toast.success('更新下载完成', {
      description: '点击"立即安装"重启应用',
    })
  }

  if (data.status === 'error') {
    toast.error('更新失败', {
      description: data.error,
    })
  }

  if (data.status === 'not-available') {
    toast.info('已是最新版本')
  }
}

async function checkForUpdate() {
  if (!window.electronAPI?.checkForUpdate) return
  updateStatus.value = { status: 'checking' }
  await window.electronAPI.checkForUpdate()
}

function downloadUpdate() {
  if (!window.electronAPI?.downloadUpdate) return
  updateStatus.value = { status: 'downloading' }
  progress.value = 0
  window.electronAPI.downloadUpdate()
}

function installUpdate() {
  if (!window.electronAPI?.installUpdate) return
  window.electronAPI.installUpdate()
}

onMounted(() => {
  window.electronAPI?.onUpdateStatus?.(handleUpdateStatus)
})
</script>

<template>
  <Dialog v-model:open="isOpen">
    <DialogTrigger as-child>
      <button class="nav-item text-xs" title="设置">
        <span class="nav-icon">
          <Settings :size="18" />
        </span>
        <span class="nav-label">设置</span>
      </button>
    </DialogTrigger>

    <DialogContent class="sm:max-w-[480px]">
      <DialogHeader>
        <DialogTitle>应用设置</DialogTitle>
        <DialogDescription> 管理应用程序的更新和偏好设置 </DialogDescription>
      </DialogHeader>

      <div class="space-y-6 py-4">
        <div class="rounded-lg border p-4">
          <div class="flex items-center justify-between">
            <div class="space-y-1">
              <h4 class="text-sm font-medium leading-none">自动更新</h4>
              <p class="text-xs text-muted-foreground">自动检查并安装应用程序更新</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              :disabled="updateStatus.status === 'checking' || updateStatus.status === 'downloading'"
              @click="checkForUpdate"
            >
              <RefreshCw
                :size="14"
                class="mr-2"
                :class="{ 'animate-spin': updateStatus.status === 'checking' }"
              />
              {{ updateStatus.status === 'checking' ? '检查中...' : '检查更新' }}
            </Button>
          </div>

          <div v-if="updateStatus.status !== 'idle' && updateStatus.status !== 'checking'" class="mt-4 space-y-3">
            <div class="flex items-center justify-between text-xs">
              <span class="text-muted-foreground">
                {{ statusMessages[updateStatus.status] || updateStatus.status }}
              </span>
              <span v-if="updateStatus.status === 'downloading'" class="text-muted-foreground">
                {{ downloadSpeed }}
              </span>
            </div>

            <Progress v-if="updateStatus.status === 'downloading'" :model-value="progress" />

            <div v-if="updateStatus.status === 'available' && updateInfo" class="rounded-md bg-muted p-3">
              <div class="flex items-center gap-2 mb-2">
                <Zap :size="14" class="text-primary" />
                <span class="text-sm font-medium">版本 {{ updateInfo.version }}</span>
              </div>
              <p v-if="updateInfo.releaseDate" class="text-xs text-muted-foreground">
                发布于 {{ new Date(updateInfo.releaseDate).toLocaleDateString('zh-CN') }}
              </p>
            </div>

            <div class="flex gap-2">
              <Button
                v-if="updateStatus.status === 'available'"
                size="sm"
                @click="downloadUpdate"
              >
                <Download :size="14" class="mr-2" />
                下载更新
              </Button>

              <Button
                v-if="updateStatus.status === 'downloaded'"
                size="sm"
                @click="installUpdate"
              >
                <Zap :size="14" class="mr-2" />
                立即安装
              </Button>
            </div>
          </div>
        </div>

        <div class="rounded-lg border p-4">
          <h4 class="text-sm font-medium leading-none mb-3">关于</h4>
          <div class="space-y-2 text-xs text-muted-foreground">
            <div class="flex justify-between">
              <span>版本</span>
              <span>1.0.0</span>
            </div>
            <div class="flex justify-between">
              <span>Electron</span>
              <span>41.5.0</span>
            </div>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button variant="secondary" @click="isOpen = false">关闭</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
