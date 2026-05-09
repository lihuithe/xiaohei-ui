# 组件使用指南

## 概述

本项目使用 shadcn-vue 组件库，提供了 40+ 高质量的 UI 组件。

## 组件目录

所有组件位于 `src/components/ui/` 目录下，按功能分类组织。

## 使用组件

### 导入方式

```typescript
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
```

### 基础使用

```vue
<template>
  <Button>点击我</Button>
  <Card>
    <CardHeader>
      <CardTitle>卡片标题</CardTitle>
    </CardHeader>
    <CardContent>
      卡片内容
    </CardContent>
  </Card>
</template>
```

## 常用组件

### Button 按钮

支持多种变体：

```vue
<Button variant="default">默认</Button>
<Button variant="outline">轮廓</Button>
<Button variant="secondary">次要</Button>
<Button variant="destructive">危险</Button>
<Button variant="ghost">幽灵</Button>
```

### Card 卡片

```vue
<Card>
  <CardHeader>
    <CardTitle>标题</CardTitle>
    <CardDescription>描述</CardDescription>
  </CardHeader>
  <CardContent>内容</CardContent>
  <CardFooter>底部</CardFooter>
</Card>
```
