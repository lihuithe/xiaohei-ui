<script setup lang="ts">
import { ref } from 'vue'
import type { PrimitiveProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import type { ButtonVariants } from '.'
import { Primitive } from 'reka-ui'
import { cn } from '@/lib/utils'
import { buttonVariants } from '.'

interface Props extends PrimitiveProps {
  variant?: ButtonVariants['variant']
  size?: ButtonVariants['size']
  class?: HTMLAttributes['class']
  ripple?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  as: 'button',
  ripple: true,
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const buttonRef = ref<HTMLElement | null>(null)
const ripples = ref<{ x: number; y: number; id: number }[]>([])

let rippleId = 0

function handleClick(e: MouseEvent) {
  emit('click', e)

  if (props.ripple && buttonRef.value) {
    const rect = buttonRef.value.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const newRipple = { x, y, id: ++rippleId }
    ripples.value.push(newRipple)

    setTimeout(() => {
      ripples.value = ripples.value.filter((r) => r.id !== newRipple.id)
    }, 600)
  }
}
</script>

<template>
  <Primitive
    ref="buttonRef"
    data-slot="button"
    :data-variant="variant"
    :data-size="size"
    :as="as"
    :as-child="asChild"
    :class="cn(buttonVariants({ variant, size }), 'relative overflow-hidden', props.class)"
    @click="handleClick"
  >
    <template v-if="ripple">
      <span
        v-for="r in ripples"
        :key="r.id"
        class="ripple-effect"
        :style="{ left: `${r.x}px`, top: `${r.y}px` }"
      />
    </template>
    <slot />
  </Primitive>
</template>

<style scoped>
.ripple-effect {
  position: absolute;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.3;
  pointer-events: none;
  transform: translate(-50%, -50%) scale(0);
  animation: ripple 0.6s ease-out forwards;
  will-change: transform, opacity;
}

@keyframes ripple {
  0% { transform: translate(-50%, -50%) scale(0); opacity: 0.3; }
  100% { transform: translate(-50%, -50%) scale(2.5); opacity: 0; }
}
</style>
