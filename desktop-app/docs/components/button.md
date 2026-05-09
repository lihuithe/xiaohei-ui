# Button 按钮

按钮是用于触发操作的 UI 组件。

## 基本用法

```vue
<template>
  <Button>默认按钮</Button>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
</script>
```

## 变体

- default：默认按钮
- destructive：危险按钮
- outline：轮廓按钮
- secondary：次要按钮
- ghost：幽灵按钮
- link：链接按钮

## 尺寸

- default：默认尺寸
- sm：小尺寸
- lg：大尺寸
- icon：图标按钮
