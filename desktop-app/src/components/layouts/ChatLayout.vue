<script setup lang="ts">
import { ref } from 'vue'
import { Send, Plus, MessageSquare, Settings, Smile, Paperclip } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'

const conversations = ref([
  { id: 1, name: '张三', lastMessage: '好的，我知道了', time: '刚刚', unread: 2 },
  { id: 2, name: '李四', lastMessage: '项目进展如何？', time: '10分钟前', unread: 0 },
  { id: 3, name: '王五', lastMessage: '谢谢！', time: '1小时前', unread: 0 },
  { id: 4, name: '赵六', lastMessage: '明天见', time: '昨天', unread: 0 },
])

const messages = ref([
  { id: 1, sender: 'other', text: '你好！最近怎么样？', time: '10:30' },
  { id: 2, sender: 'me', text: '挺好的，你呢？', time: '10:31' },
  { id: 3, sender: 'other', text: '我也很好，最近在忙一个新项目', time: '10:32' },
  { id: 4, sender: 'me', text: '什么项目？听起来很有意思', time: '10:33' },
  { id: 5, sender: 'other', text: '一个 AI 助手项目，正在开发中', time: '10:35' },
])

const newMessage = ref('')

function sendMessage() {
  if (newMessage.value.trim()) {
    messages.value.push({
      id: messages.value.length + 1,
      sender: 'me',
      text: newMessage.value,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    })
    newMessage.value = ''
  }
}
</script>

<template>
  <div class="flex h-screen bg-background">
    <!-- Sidebar -->
    <aside class="w-72 border-r flex flex-col">
      <div class="p-4 border-b flex items-center justify-between">
        <h2 class="font-semibold">消息</h2>
        <Button variant="ghost" size="icon">
          <Plus class="h-5 w-5" />
        </Button>
      </div>
      <ScrollArea class="flex-1">
        <div class="p-2 space-y-1">
          <button
            v-for="conv in conversations"
            :key="conv.id"
            class="w-full text-left p-3 rounded-lg hover:bg-accent transition-colors"
          >
            <div class="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>{{ conv.name[0] }}</AvatarFallback>
              </Avatar>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between">
                  <span class="font-medium">{{ conv.name }}</span>
                  <span class="text-xs text-muted-foreground">{{ conv.time }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <p class="text-sm text-muted-foreground truncate">{{ conv.lastMessage }}</p>
                  <span
                    v-if="conv.unread > 0"
                    class="ml-2 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center"
                  >
                    {{ conv.unread }}
                  </span>
                </div>
              </div>
            </div>
          </button>
        </div>
      </ScrollArea>
    </aside>

    <!-- Chat area -->
    <main class="flex-1 flex flex-col">
      <!-- Chat header -->
      <header class="h-16 border-b flex items-center justify-between px-4">
        <div class="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>张</AvatarFallback>
          </Avatar>
          <div>
            <h3 class="font-medium">张三</h3>
            <p class="text-xs text-green-600">在线</p>
          </div>
        </div>
        <Button variant="ghost" size="icon">
          <Settings class="h-5 w-5" />
        </Button>
      </header>

      <!-- Messages -->
      <ScrollArea class="flex-1 p-4">
        <div class="space-y-4 max-w-3xl mx-auto">
          <div
            v-for="msg in messages"
            :key="msg.id"
            class="flex"
            :class="msg.sender === 'me' ? 'justify-end' : 'justify-start'"
          >
            <div
              class="max-w-[70%] rounded-2xl px-4 py-2"
              :class="
                msg.sender === 'me'
                  ? 'bg-primary text-primary-foreground rounded-tr-sm'
                  : 'bg-muted rounded-tl-sm'
              "
            >
              <p>{{ msg.text }}</p>
              <p class="text-xs mt-1 opacity-70">{{ msg.time }}</p>
            </div>
          </div>
        </div>
      </ScrollArea>

      <!-- Input area -->
      <footer class="p-4 border-t">
        <div class="max-w-3xl mx-auto flex items-end gap-2">
          <Button variant="ghost" size="icon">
            <Paperclip class="h-5 w-5" />
          </Button>
          <div class="flex-1 relative">
            <Input
              v-model="newMessage"
              placeholder="输入消息..."
              class="pr-10"
              @keyup.enter="sendMessage"
            />
            <Button variant="ghost" size="icon" class="absolute right-1 top-1/2 -translate-y-1/2">
              <Smile class="h-5 w-5" />
            </Button>
          </div>
          <Button size="icon" @click="sendMessage">
            <Send class="h-5 w-5" />
          </Button>
        </div>
      </footer>
    </main>
  </div>
</template>
