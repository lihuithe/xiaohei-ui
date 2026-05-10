<template>
  <div class="flex flex-col items-center justify-center min-h-[400px] p-8">
    <div class="text-8xl font-bold text-muted-foreground mb-4">404</div>
    <h1 class="text-2xl font-semibold mb-2">{{ $t('common.notFound') }}</h1>
    <p class="text-muted-foreground mb-6">{{ $t('common.notFoundDescription') }}</p>
    <Button @click="goHome">
      {{ $t('common.backToHome') }}
    </Button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui'

const router = useRouter()

const goHome = () => {
  router.push('/')
}
</script>
