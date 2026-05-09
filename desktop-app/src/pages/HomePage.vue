<script setup lang="ts">
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="content-welcome">
    <h1 class="text-3xl font-semibold tracking-tight">欢迎使用小黑助手</h1>
    <p class="text-muted-foreground mt-2">选择一个对话开始，或创建新的对话</p>

    <div class="mt-8 flex gap-3 flex-wrap">
      <Button>开始对话</Button>
      <Button variant="outline">新建项目</Button>
      <Button variant="secondary" @click="router.push('/components')">浏览组件</Button>
      <Button variant="secondary" @click="router.push('/demo')">功能演示</Button>
    </div>

    <div class="mt-10 grid grid-cols-2 gap-4 max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle class="text-sm">快速搜索</CardTitle>
          <CardDescription class="text-xs">使用自然语言搜索你的数据</CardDescription>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle class="text-sm">自动化工作流</CardTitle>
          <CardDescription class="text-xs">配置自动化任务提效</CardDescription>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle class="text-sm">插件市场</CardTitle>
          <CardDescription class="text-xs">发现和安装实用插件</CardDescription>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle class="text-sm">智能助手</CardTitle>
          <CardDescription class="text-xs">AI 驱动的日常助手服务</CardDescription>
        </CardHeader>
      </Card>
    </div>
  </div>
</template>
