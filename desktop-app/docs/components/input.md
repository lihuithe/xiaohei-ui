# Input 输入框

输入框是用于收集用户输入的 UI 组件。

## 基本用法

```vue
<template>
  <Input placeholder="请输入内容" />
</template>

<script setup lang="ts">
import { Input } from '@/components/ui/input'
</script>
```

## 类型

- text：普通文本输入
- password：密码输入
- email：邮箱输入
- number：数字输入
