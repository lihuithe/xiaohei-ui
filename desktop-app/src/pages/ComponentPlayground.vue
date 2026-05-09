<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

const buttonConfig = reactive({
  variant: 'default' as 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link',
  size: 'default' as 'default' | 'sm' | 'lg' | 'icon',
  disabled: false,
  text: 'Click Me',
})

const inputConfig = reactive({
  type: 'text',
  placeholder: 'Enter text...',
  value: '',
  disabled: false,
})

const badgeConfig = reactive({
  variant: 'default' as 'default' | 'secondary' | 'outline' | 'destructive',
  text: 'Badge',
})
</script>

<template>
  <div class="container mx-auto py-8 px-4">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">组件交互式演示</h1>
      <p class="text-muted-foreground">调整右侧属性，实时查看组件变化</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- 预览区 -->
      <div class="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Button 按钮</CardTitle>
            <CardDescription>实时预览按钮效果</CardDescription>
          </CardHeader>
          <CardContent class="flex flex-col gap-4 items-center justify-center py-12">
            <Button
              :variant="buttonConfig.variant"
              :size="buttonConfig.size"
              :disabled="buttonConfig.disabled"
            >
              {{ buttonConfig.text }}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Input 输入框</CardTitle>
            <CardDescription>实时预览输入框效果</CardDescription>
          </CardHeader>
          <CardContent class="flex flex-col gap-4 py-6">
            <Input
              v-model="inputConfig.value"
              :type="inputConfig.type"
              :placeholder="inputConfig.placeholder"
              :disabled="inputConfig.disabled"
            />
            <p class="text-sm text-muted-foreground">当前值: {{ inputConfig.value }}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Badge 徽章</CardTitle>
            <CardDescription>实时预览徽章效果</CardDescription>
          </CardHeader>
          <CardContent class="flex flex-col gap-4 items-center justify-center py-12">
            <Badge :variant="badgeConfig.variant">
              {{ badgeConfig.text }}
            </Badge>
          </CardContent>
        </Card>
      </div>

      <!-- 属性配置区 -->
      <div class="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Button 配置</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="space-y-2">
              <Label>Variant</Label>
              <Select v-model="buttonConfig.variant">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">default</SelectItem>
                  <SelectItem value="destructive">destructive</SelectItem>
                  <SelectItem value="outline">outline</SelectItem>
                  <SelectItem value="secondary">secondary</SelectItem>
                  <SelectItem value="ghost">ghost</SelectItem>
                  <SelectItem value="link">link</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="space-y-2">
              <Label>Size</Label>
              <Select v-model="buttonConfig.size">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">default</SelectItem>
                  <SelectItem value="sm">sm</SelectItem>
                  <SelectItem value="lg">lg</SelectItem>
                  <SelectItem value="icon">icon</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="space-y-2">
              <Label>文字内容</Label>
              <Input v-model="buttonConfig.text" />
            </div>
            <div class="flex items-center justify-between">
              <Label>Disabled</Label>
              <Switch v-model="buttonConfig.disabled" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Input 配置</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="space-y-2">
              <Label>Type</Label>
              <Select v-model="inputConfig.type">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">text</SelectItem>
                  <SelectItem value="email">email</SelectItem>
                  <SelectItem value="password">password</SelectItem>
                  <SelectItem value="number">number</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="space-y-2">
              <Label>Placeholder</Label>
              <Input v-model="inputConfig.placeholder" />
            </div>
            <div class="flex items-center justify-between">
              <Label>Disabled</Label>
              <Switch v-model="inputConfig.disabled" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Badge 配置</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="space-y-2">
              <Label>Variant</Label>
              <Select v-model="badgeConfig.variant">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">default</SelectItem>
                  <SelectItem value="secondary">secondary</SelectItem>
                  <SelectItem value="outline">outline</SelectItem>
                  <SelectItem value="destructive">destructive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="space-y-2">
              <Label>文字内容</Label>
              <Input v-model="badgeConfig.text" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>
