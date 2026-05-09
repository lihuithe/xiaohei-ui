<template>
  <RecycleScroller
    :items="items"
    :item-size="itemSize"
    :key-field="keyField"
    v-slot="{ item }"
  >
    <slot :item="item"></slot>
  </RecycleScroller>
</template>

<script setup lang="ts">
import { RecycleScroller } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

interface Props {
  items: any[]
  itemSize?: number
  keyField?: string
}

withDefaults(defineProps<Props>(), {
  itemSize: 48,
  keyField: 'id',
})
</script>

