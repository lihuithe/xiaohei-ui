import { ref, computed, onMounted, onUnmounted } from 'vue'

export function useResponsive() {
  const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1200)
  const windowHeight = ref(typeof window !== 'undefined' ? window.innerHeight : 800)

  const isMobile = computed(() => windowWidth.value < 640)
  const isTablet = computed(() => windowWidth.value >= 640 && windowWidth.value < 1024)
  const isDesktop = computed(() => windowWidth.value >= 1024)
  const isTouch = computed(() => typeof window !== 'undefined' && 'ontouchstart' in window)

  const handleResize = () => {
    windowWidth.value = window.innerWidth
    windowHeight.value = window.innerHeight
  }

  onMounted(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize)
    }
  })

  onUnmounted(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', handleResize)
    }
  })

  return {
    windowWidth,
    windowHeight,
    isMobile,
    isTablet,
    isDesktop,
    isTouch,
  }
}

export function useKeyboardNavigation(elements: HTMLElement[], onEnter?: (_index: number) => void) {
  const currentIndex = ref(-1)

  const handleKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault()
        currentIndex.value = (currentIndex.value + 1) % elements.length
        elements[currentIndex.value]?.focus()
        break
      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault()
        currentIndex.value = currentIndex.value <= 0 ? elements.length - 1 : currentIndex.value - 1
        elements[currentIndex.value]?.focus()
        break
      case 'Enter':
        if (currentIndex.value >= 0 && onEnter) {
          onEnter(currentIndex.value)
        }
        break
      case 'Escape':
        currentIndex.value = -1
        break
    }
  }

  return {
    currentIndex,
    handleKeyDown,
  }
}

export function useA11yAnnouncer() {
  let announcer: HTMLElement | null = null

  const initAnnouncer = () => {
    if (typeof document === 'undefined') return

    announcer = document.createElement('div')
    announcer.setAttribute('role', 'status')
    announcer.setAttribute('aria-live', 'polite')
    announcer.setAttribute('aria-atomic', 'true')
    announcer.style.position = 'absolute'
    announcer.style.width = '1px'
    announcer.style.height = '1px'
    announcer.style.padding = '0'
    announcer.style.margin = '-1px'
    announcer.style.overflow = 'hidden'
    announcer.style.clip = 'rect(0, 0, 0, 0)'
    announcer.style.whiteSpace = 'nowrap'
    announcer.style.border = '0'
    document.body.appendChild(announcer)
  }

  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!announcer) initAnnouncer()
    if (announcer) {
      announcer.setAttribute('aria-live', priority)
      announcer.textContent = ''
      setTimeout(() => {
        if (announcer) announcer.textContent = message
      }, 10)
    }
  }

  onMounted(() => initAnnouncer())

  onUnmounted(() => {
    if (announcer && document.body.contains(announcer)) {
      document.body.removeChild(announcer)
    }
  })

  return {
    announce,
  }
}
