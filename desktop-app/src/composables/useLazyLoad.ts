import { ref, onUnmounted } from 'vue'

export function useLazyLoad() {
  const observer = ref<IntersectionObserver | null>(null)
  const isLoaded = ref(false)

  const loadImage = (el: HTMLImageElement, src: string) => {
    el.src = src
    el.addEventListener('load', () => {
      isLoaded.value = true
    })
  }

  const observe = (el: HTMLImageElement, src: string) => {
    if (!('IntersectionObserver' in window)) {
      loadImage(el, src)
      return
    }

    observer.value = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loadImage(el, src)
            observer.value?.unobserve(el)
          }
        })
      },
      {
        rootMargin: '50px',
        threshold: 0.01,
      }
    )

    observer.value.observe(el)
  }

  onUnmounted(() => {
    observer.value?.disconnect()
  })

  return {
    isLoaded,
    observe,
  }
}
