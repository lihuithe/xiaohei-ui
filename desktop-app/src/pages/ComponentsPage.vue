<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useRouter } from 'vue-router'

const router = useRouter()
const checked = ref(false)
</script>

<template>
  <div class="p-6 w-full max-w-5xl mx-auto">
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight">组件库</h1>
        <p class="text-muted-foreground">shadcn-vue 组件展示</p>
      </div>
      <Button variant="outline" @click="router.push('/')">返回首页</Button>
    </div>

    <Tabs defaultValue="basic" class="w-full">
      <TabsList>
        <TabsTrigger value="basic">基础组件</TabsTrigger>
        <TabsTrigger value="form">表单组件</TabsTrigger>
        <TabsTrigger value="data">数据展示</TabsTrigger>
      </TabsList>
      
      <TabsContent value="basic" class="mt-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Button 按钮</CardTitle>
            <CardDescription>各种样式的按钮组件</CardDescription>
          </CardHeader>
          <CardContent class="flex flex-wrap gap-3">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button disabled>Disabled</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Badge 徽章</CardTitle>
            <CardDescription>状态标签展示</CardDescription>
          </CardHeader>
          <CardContent class="flex flex-wrap gap-2">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="destructive">Destructive</Badge>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="form" class="mt-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Input 输入框</CardTitle>
            <CardDescription>文本输入组件</CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <Input placeholder="请输入内容..." />
            <Input type="email" placeholder="Email" />
            <Input disabled placeholder="Disabled input" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Switch 开关</CardTitle>
            <CardDescription>切换开关组件</CardDescription>
          </CardHeader>
          <CardContent class="flex items-center space-x-3">
            <Switch id="airplane-mode" v-model="checked" />
            <label for="airplane-mode" class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              {{ checked ? '已开启' : '已关闭' }}
            </label>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="data" class="mt-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Card 卡片</CardTitle>
            <CardDescription>信息展示卡片</CardDescription>
          </CardHeader>
          <CardContent class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle class="text-base">项目卡片</CardTitle>
                <CardDescription>项目描述信息</CardDescription>
              </CardHeader>
              <CardContent class="text-sm text-muted-foreground">
                这是一个示例项目卡片，用于展示项目信息。
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle class="text-base">用户卡片</CardTitle>
                <CardDescription>用户基本信息</CardDescription>
              </CardHeader>
              <CardContent class="text-sm text-muted-foreground">
                这是一个示例用户卡片，用于展示用户信息。
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  </div>
</template>
