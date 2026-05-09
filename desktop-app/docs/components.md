# 组件文档 / Component Documentation

## 目录 / Table of Contents

- [概述 / Overview](#概述--overview)
- [常用组件 / Common Components](#常用组件--common-components)
- [布局组件 / Layout Components](#布局组件--layout-components)
- [表单组件 / Form Components](#表单组件--form-components)
- [导航组件 / Navigation Components](#导航组件--navigation-components)

## 概述 / Overview

本项目使用 shadcn-vue 作为 UI 组件库，配合 Tailwind CSS 提供美观、一致的用户界面。

所有 UI 组件位于 `src/components/ui/` 目录下。

## 常用组件 / Common Components

### Button / 按钮

```vue
<script setup lang="ts">
import { Button } from '@/components/ui/button'
</script>

<template>
  <Button variant="default" size="default">
    Click me
  </Button>
</template>
```

### Card / 卡片

```vue
<script setup lang="ts">
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>Card Title</CardTitle>
      <CardDescription>Card Description</CardDescription>
    </CardHeader>
    <CardContent>
      Card content goes here.
    </CardContent>
    <CardFooter>
      Card footer
    </CardFooter>
  </Card>
</template>
```

### Dialog / 对话框

```vue
<script setup lang="ts">
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
</script>

<template>
  <Dialog>
    <DialogTrigger as-child>
      <Button>Open Dialog</Button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Dialog Title</DialogTitle>
        <DialogDescription>Dialog Description</DialogDescription>
      </DialogHeader>
      <div>Dialog content</div>
      <DialogFooter>
        <Button>Confirm</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
```

## 布局组件 / Layout Components

### Sidebar / 侧边栏

```vue
<script setup lang="ts">
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
} from '@/components/ui/sidebar'
</script>

<template>
  <SidebarProvider>
    <Sidebar>
      <SidebarHeader />
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              Menu Item
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
    <SidebarInset>
      <main>Main content</main>
    </SidebarInset>
  </SidebarProvider>
</template>
```

### TitleBar / 标题栏

```vue
<script setup lang="ts">
import { TitleBar } from '@/components/TitleBar'
</script>

<template>
  <TitleBar />
</template>
```

## 表单组件 / Form Components

### Input / 输入框

```vue
<script setup lang="ts">
import { Input } from '@/components/ui/input'
import { ref } from 'vue'

const value = ref('')
</script>

<template>
  <Input v-model="value" placeholder="Enter text..." />
</template>
```

### Checkbox / 复选框

```vue
<script setup lang="ts">
import { Checkbox } from '@/components/ui/checkbox'
import { ref } from 'vue'

const checked = ref(false)
</script>

<template>
  <Checkbox v-model="checked" />
</template>
```

### Select / 选择器

```vue
<script setup lang="ts">
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ref } from 'vue'

const value = ref('')
</script>

<template>
  <Select v-model="value">
    <SelectTrigger>
      <SelectValue placeholder="Select an option" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="option1">Option 1</SelectItem>
      <SelectItem value="option2">Option 2</SelectItem>
    </SelectContent>
  </Select>
</template>
```

## 导航组件 / Navigation Components

### Tabs / 标签页

```vue
<script setup lang="ts">
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
</script>

<template>
  <Tabs default-value="tab1">
    <TabsList>
      <TabsTrigger value="tab1">Tab 1</TabsTrigger>
      <TabsTrigger value="tab2">Tab 2</TabsTrigger>
    </TabsList>
    <TabsContent value="tab1">
      Content for Tab 1
    </TabsContent>
    <TabsContent value="tab2">
      Content for Tab 2
    </TabsContent>
  </Tabs>
</template>
```

---

# Component Documentation

## Table of Contents

- [Overview](#overview)
- [Common Components](#common-components)
- [Layout Components](#layout-components)
- [Form Components](#form-components)
- [Navigation Components](#navigation-components)

## Overview

This project uses shadcn-vue as UI component library, paired with Tailwind CSS for beautiful and consistent user interface.

All UI components are located in `src/components/ui/`.

## Common Components

### Button

```vue
<script setup lang="ts">
import { Button } from '@/components/ui/button'
</script>

<template>
  <Button variant="default" size="default">
    Click me
  </Button>
</template>
```

### Card

```vue
<script setup lang="ts">
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>Card Title</CardTitle>
      <CardDescription>Card Description</CardDescription>
    </CardHeader>
    <CardContent>
      Card content goes here.
    </CardContent>
    <CardFooter>
      Card footer
    </CardFooter>
  </Card>
</template>
```

### Dialog

```vue
<script setup lang="ts">
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
</script>

<template>
  <Dialog>
    <DialogTrigger as-child>
      <Button>Open Dialog</Button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Dialog Title</DialogTitle>
        <DialogDescription>Dialog Description</DialogDescription>
      </DialogHeader>
      <div>Dialog content</div>
      <DialogFooter>
        <Button>Confirm</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
```

## Layout Components

### Sidebar

```vue
<script setup lang="ts">
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
} from '@/components/ui/sidebar'
</script>

<template>
  <SidebarProvider>
    <Sidebar>
      <SidebarHeader />
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              Menu Item
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
    <SidebarInset>
      <main>Main content</main>
    </SidebarInset>
  </SidebarProvider>
</template>
```

### TitleBar

```vue
<script setup lang="ts">
import { TitleBar } from '@/components/TitleBar'
</script>

<template>
  <TitleBar />
</template>
```

## Form Components

### Input

```vue
<script setup lang="ts">
import { Input } from '@/components/ui/input'
import { ref } from 'vue'

const value = ref('')
</script>

<template>
  <Input v-model="value" placeholder="Enter text..." />
</template>
```

### Checkbox

```vue
<script setup lang="ts">
import { Checkbox } from '@/components/ui/checkbox'
import { ref } from 'vue'

const checked = ref(false)
</script>

<template>
  <Checkbox v-model="checked" />
</template>
```

### Select

```vue
<script setup lang="ts">
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ref } from 'vue'

const value = ref('')
</script>

<template>
  <Select v-model="value">
    <SelectTrigger>
      <SelectValue placeholder="Select an option" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="option1">Option 1</SelectItem>
      <SelectItem value="option2">Option 2</SelectItem>
    </SelectContent>
  </Select>
</template>
```

## Navigation Components

### Tabs

```vue
<script setup lang="ts">
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
</script>

<template>
  <Tabs default-value="tab1">
    <TabsList>
      <TabsTrigger value="tab1">Tab 1</TabsTrigger>
      <TabsTrigger value="tab2">Tab 2</TabsTrigger>
    </TabsList>
    <TabsContent value="tab1">
      Content for Tab 1
    </TabsContent>
    <TabsContent value="tab2">
      Content for Tab 2
    </TabsContent>
  </Tabs>
</template>
```
