<script setup lang="ts">
import { ref } from 'vue'
import { Clock, CheckCircle2, Circle } from 'lucide-vue-next'

interface TimelineItem {
  id: string | number
  title: string
  description?: string
  date?: string
  status?: 'pending' | 'in-progress' | 'completed'
  icon?: any
}

interface TimelineProps {
  items: TimelineItem[]
  reverse?: boolean
}

const props = withDefaults(defineProps<TimelineProps>(), {
  reverse: false,
})

const emit = defineEmits<{
  (e: 'item-click', item: TimelineItem): void
}>()

function getStatusIcon(status: string | undefined) {
  switch (status) {
    case 'completed':
      return CheckCircle2
    case 'in-progress':
      return Clock
    default:
      return Circle
  }
}
</script>

<template>
  <div class="timeline" :class="{ 'timeline-reverse': reverse }">
    <div
      v-for="(item, index) in items"
      :key="item.id"
      class="timeline-item"
      @click="emit('item-click', item)"
    >
      <div class="timeline-line"></div>
      <div class="timeline-dot" :class="`status-${item.status || 'pending'}`">
        <component :is="item.icon || getStatusIcon(item.status)" :size="16" />
      </div>
      <div class="timeline-content">
        <div v-if="item.date" class="timeline-date">{{ item.date }}</div>
        <div class="timeline-title">{{ item.title }}</div>
        <div v-if="item.description" class="timeline-description">{{ item.description }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.timeline {
  position: relative;
  padding-left: 28px;
}

.timeline-reverse {
  display: flex;
  flex-direction: column-reverse;
}

.timeline-item {
  position: relative;
  padding-bottom: 24px;
  cursor: pointer;
}

.timeline-item:last-child {
  padding-bottom: 0;
}

.timeline-line {
  position: absolute;
  left: 8px;
  top: 24px;
  bottom: 0;
  width: 2px;
  background: var(--border);
}

.timeline-item:last-child .timeline-line {
  display: none;
}

.timeline-dot {
  position: absolute;
  left: 0;
  top: 2px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--background);
  border: 2px solid var(--border);
  color: var(--muted-foreground);
  transition: all 0.2s;
}

.timeline-dot.status-completed {
  border-color: #22c55e;
  color: #22c55e;
  background: #dcfce7;
}

.timeline-dot.status-in-progress {
  border-color: #3b82f6;
  color: #3b82f6;
  background: #dbeafe;
}

.timeline-dot.status-pending {
  border-color: var(--border);
  color: var(--muted-foreground);
  background: var(--background);
}

.timeline-content {
  padding-left: 16px;
}

.timeline-date {
  font-size: 12px;
  color: var(--muted-foreground);
  margin-bottom: 4px;
}

.timeline-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--foreground);
  margin-bottom: 4px;
}

.timeline-description {
  font-size: 13px;
  color: var(--muted-foreground);
  line-height: 1.5;
}

.timeline-item:hover .timeline-title {
  color: var(--primary);
}
</style>
