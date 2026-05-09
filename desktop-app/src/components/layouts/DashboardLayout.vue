<script setup lang="ts">
import { LayoutDashboard, Users, Settings, BarChart3, Bell, Search, Menu } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

const stats = [
  { title: '总用户', value: '12,345', change: '+12%', positive: true },
  { title: '活跃用户', value: '8,901', change: '+5%', positive: true },
  { title: '收入', value: '¥45,678', change: '-2%', positive: false },
  { title: '订单数', value: '3,210', change: '+18%', positive: true },
]

const recentActivities = [
  { user: '张三', action: '创建了新项目', time: '2分钟前' },
  { user: '李四', action: '完成了任务', time: '15分钟前' },
  { user: '王五', action: '更新了文档', time: '1小时前' },
  { user: '赵六', action: '添加了评论', time: '2小时前' },
]
</script>

<template>
  <div class="flex min-h-screen bg-background">
    <!-- Sidebar -->
    <aside class="w-64 border-r bg-card p-4">
      <div class="flex items-center gap-2 mb-8">
        <div
          class="w-8 h-8 rounded bg-primary flex items-center justify-center text-primary-foreground"
        >
          <LayoutDashboard size="16" />
        </div>
        <span class="font-semibold text-lg">Dashboard</span>
      </div>

      <nav class="space-y-2">
        <Button variant="ghost" class="w-full justify-start">
          <LayoutDashboard class="mr-2 h-4 w-4" />
          概览
        </Button>
        <Button variant="ghost" class="w-full justify-start">
          <Users class="mr-2 h-4 w-4" />
          用户
        </Button>
        <Button variant="ghost" class="w-full justify-start">
          <BarChart3 class="mr-2 h-4 w-4" />
          数据
        </Button>
        <Button variant="ghost" class="w-full justify-start">
          <Settings class="mr-2 h-4 w-4" />
          设置
        </Button>
      </nav>
    </aside>

    <!-- Main content -->
    <main class="flex-1 flex flex-col">
      <!-- Header -->
      <header class="h-16 border-b flex items-center justify-between px-6">
        <div class="flex items-center gap-4">
          <Button variant="ghost" size="icon" class="md:hidden">
            <Menu class="h-5 w-5" />
          </Button>
          <div class="relative w-64">
            <Search
              class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
            />
            <Input placeholder="搜索..." class="pl-9" />
          </div>
        </div>
        <div class="flex items-center gap-4">
          <Button variant="ghost" size="icon">
            <Bell class="h-5 w-5" />
          </Button>
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>AD</AvatarFallback>
          </Avatar>
        </div>
      </header>

      <!-- Content -->
      <div class="flex-1 p-6 space-y-6">
        <div>
          <h1 class="text-2xl font-bold">欢迎回来！</h1>
          <p class="text-muted-foreground">这是今天的概览</p>
        </div>

        <!-- Stats grid -->
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card v-for="stat in stats" :key="stat.title">
            <CardHeader class="pb-2">
              <CardTitle class="text-sm font-medium text-muted-foreground">{{
                stat.title
              }}</CardTitle>
            </CardHeader>
            <CardContent>
              <div class="text-2xl font-bold">{{ stat.value }}</div>
              <p class="text-xs" :class="stat.positive ? 'text-green-600' : 'text-red-600'">
                {{ stat.change }}
              </p>
            </CardContent>
          </Card>
        </div>

        <!-- Recent activities -->
        <Card>
          <CardHeader>
            <CardTitle>最近活动</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <div
                v-for="activity in recentActivities"
                :key="activity.time"
                class="flex items-center justify-between"
              >
                <div class="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{{ activity.user[0] }}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p class="font-medium">{{ activity.user }}</p>
                    <p class="text-sm text-muted-foreground">{{ activity.action }}</p>
                  </div>
                </div>
                <p class="text-sm text-muted-foreground">{{ activity.time }}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  </div>
</template>
