<script setup lang="ts">
import { ref } from 'vue'
import { User, Bell, Shield, Palette, Globe, HelpCircle, Save } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

const activeTab = ref('profile')
const notifications = ref({
  email: true,
  push: false,
  desktop: true,
})
const privacy = ref({
  profileVisible: true,
  showStatus: true,
  readReceipts: false,
})
</script>

<template>
  <div class="flex min-h-screen bg-background">
    <!-- Sidebar -->
    <aside class="w-64 border-r bg-card p-4">
      <h2 class="font-semibold text-lg mb-6">设置</h2>
      <nav class="space-y-1">
        <Button
          v-for="item in [
            { icon: User, label: '个人资料', value: 'profile' },
            { icon: Bell, label: '通知', value: 'notifications' },
            { icon: Shield, label: '隐私', value: 'privacy' },
            { icon: Palette, label: '外观', value: 'appearance' },
            { icon: Globe, label: '语言', value: 'language' },
            { icon: HelpCircle, label: '帮助', value: 'help' },
          ]"
          :key="item.value"
          variant="ghost"
          class="w-full justify-start"
          :class="activeTab === item.value ? 'bg-accent' : ''"
          @click="activeTab = item.value"
        >
          <component :is="item.icon" class="mr-2 h-4 w-4" />
          {{ item.label }}
        </Button>
      </nav>
    </aside>

    <!-- Main content -->
    <main class="flex-1 p-8">
      <Tabs :value="activeTab" class="max-w-2xl">
        <!-- Profile -->
        <TabsContent value="profile" class="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>个人资料</CardTitle>
              <CardDescription>更新您的个人信息</CardDescription>
            </CardHeader>
            <CardContent class="space-y-6">
              <div class="flex items-center gap-4">
                <Avatar class="w-20 h-20">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>AD</AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" size="sm">更换头像</Button>
                  <p class="text-xs text-muted-foreground mt-2">支持 JPG, PNG，最大 2MB</p>
                </div>
              </div>

              <div class="grid gap-4">
                <div class="grid gap-2">
                  <Label for="name">用户名</Label>
                  <Input id="name" defaultValue="张三" />
                </div>
                <div class="grid gap-2">
                  <Label for="email">邮箱</Label>
                  <Input id="email" type="email" defaultValue="zhangsan@example.com" />
                </div>
                <div class="grid gap-2">
                  <Label for="bio">简介</Label>
                  <Input id="bio" placeholder="介绍一下自己..." />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>
                <Save class="mr-2 h-4 w-4" />
                保存更改
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <!-- Notifications -->
        <TabsContent value="notifications" class="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>通知设置</CardTitle>
              <CardDescription>管理您的通知偏好</CardDescription>
            </CardHeader>
            <CardContent class="space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <p class="font-medium">邮件通知</p>
                  <p class="text-sm text-muted-foreground">接收邮件提醒</p>
                </div>
                <Switch v-model="notifications.email" />
              </div>
              <div class="flex items-center justify-between">
                <div>
                  <p class="font-medium">推送通知</p>
                  <p class="text-sm text-muted-foreground">接收推送提醒</p>
                </div>
                <Switch v-model="notifications.push" />
              </div>
              <div class="flex items-center justify-between">
                <div>
                  <p class="font-medium">桌面通知</p>
                  <p class="text-sm text-muted-foreground">显示桌面弹窗</p>
                </div>
                <Switch v-model="notifications.desktop" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <!-- Privacy -->
        <TabsContent value="privacy" class="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>隐私设置</CardTitle>
              <CardDescription>控制您的隐私和可见性</CardDescription>
            </CardHeader>
            <CardContent class="space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <p class="font-medium">公开资料</p>
                  <p class="text-sm text-muted-foreground">让其他人可以看到您的资料</p>
                </div>
                <Switch v-model="privacy.profileVisible" />
              </div>
              <div class="flex items-center justify-between">
                <div>
                  <p class="font-medium">显示在线状态</p>
                  <p class="text-sm text-muted-foreground">显示您是否在线</p>
                </div>
                <Switch v-model="privacy.showStatus" />
              </div>
              <div class="flex items-center justify-between">
                <div>
                  <p class="font-medium">已读回执</p>
                  <p class="text-sm text-muted-foreground">让别人知道您已阅读消息</p>
                </div>
                <Switch v-model="privacy.readReceipts" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <!-- Appearance -->
        <TabsContent value="appearance" class="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>外观设置</CardTitle>
              <CardDescription>自定义应用的外观</CardDescription>
            </CardHeader>
            <CardContent class="space-y-4">
              <div class="grid grid-cols-3 gap-4">
                <button class="p-4 border rounded-lg text-center hover:bg-accent transition-colors">
                  <div class="w-full h-24 bg-white border rounded mb-2" />
                  <p class="text-sm">浅色</p>
                </button>
                <button class="p-4 border rounded-lg text-center hover:bg-accent transition-colors">
                  <div class="w-full h-24 bg-gray-900 rounded mb-2" />
                  <p class="text-sm">深色</p>
                </button>
                <button class="p-4 border rounded-lg text-center hover:bg-accent transition-colors">
                  <div class="w-full h-24 bg-gradient-to-b from-white to-gray-900 rounded mb-2" />
                  <p class="text-sm">系统</p>
                </button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  </div>
</template>
