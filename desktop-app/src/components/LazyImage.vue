<template>
  <div class="lazy-image-container" :style="{ width, height }">
    <img
      ref="imgRef"
      class="lazy-image"
      :class="{ loaded: isLoaded }"
      :alt="alt"
      :style="{ objectFit, objectPosition }"
    />
    <div v-if="!isLoaded" class="lazy-image-placeholder">
      <slot name="placeholder"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useLazyLoad } from '@/composables/useLazyLoad'

interface Props {
  src: string
  alt?: string
  width?: string
  height?: string
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
  objectPosition?: string
}

const props = withDefaults(defineProps<Props>(), {
  alt: '',
  width: '100%',
  height: 'auto',
  objectFit: 'cover',
  objectPosition: 'center',
})

const imgRef = ref<HTMLImageElement | null>(null)
const { isLoaded, observe } = useLazyLoad()

onMounted(() => {
  if (imgRef.value) {
    observe(imgRef.value, props.src)
  }
})
</script>

<style scoped>
.lazy-image-container {
  position: relative;
  overflow: hidden;
}

.lazy-image {
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.lazy-image.loaded {
  opacity: 1;
}

.lazy-image-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: hsl(var(--muted));
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
