<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="content-welcome flex flex-col items-center justify-center">
    <h1 class="text-8xl font-bold text-muted-foreground">404</h1>
    <h2 class="text-2xl font-semibold mt-4">页面未找到</h2>
    <p class="text-muted-foreground mt-2 mb-8">抱歉，您访问的页面不存在</p>
    <Button @click="router.push('/')">返回首页</Button>
  </div>
</template>
