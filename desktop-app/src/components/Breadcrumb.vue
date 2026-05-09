<template>
  <nav v-if="breadcrumbs.length > 0" class="flex items-center space-x-2 text-sm">
    <template v-for="(item, index) in breadcrumbs" :key="item.path">
      <router-link
        :to="item.path"
        :class="[
          'transition-colors hover:text-foreground',
          index === breadcrumbs.length - 1
            ? 'text-foreground font-medium'
            : 'text-muted-foreground',
        ]"
      >
        {{ item.title }}
      </router-link>
      <span v-if="index < breadcrumbs.length - 1" class="text-muted-foreground"> / </span>
    </template>
  </nav>
</template>

<script setup lang="ts">
import { useRouterStore } from '@/stores'
import { computed } from 'vue'

const routerStore = useRouterStore()
const breadcrumbs = computed(() => routerStore.breadcrumbs)
</script>
