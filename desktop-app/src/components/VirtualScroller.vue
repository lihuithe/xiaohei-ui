<template>
  <RecycleScroller v-slot="{ item }" :items="items" :item-size="itemSize" :key-field="keyField">
    <slot :item="item"></slot>
  </RecycleScroller>
</template>

<script setup lang="ts">
import { RecycleScroller } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

interface Props {
  items: unknown[]
  itemSize?: number
  keyField?: string
}

withDefaults(defineProps<Props>(), {
  itemSize: 48,
  keyField: 'id',
})
</script>
