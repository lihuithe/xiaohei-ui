import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { RouteRecordRaw } from 'vue-router'

export interface BreadcrumbItem {
  path: string
  title: string
  name?: string
}

export const useRouterStore = defineStore('router', () => {
  const currentBreadcrumbs = ref<BreadcrumbItem[]>([])
  const dynamicRoutes = ref<RouteRecordRaw[]>([])
  const addedRoutes = ref<Set<string>>(new Set())

  const breadcrumbs = computed(() => currentBreadcrumbs.value)

  function setBreadcrumbs(items: BreadcrumbItem[]) {
    currentBreadcrumbs.value = items
  }

  function addBreadcrumb(item: BreadcrumbItem) {
    currentBreadcrumbs.value.push(item)
  }

  function clearBreadcrumbs() {
    currentBreadcrumbs.value = []
  }

  function addDynamicRoute(route: RouteRecordRaw) {
    if (!addedRoutes.value.has(route.path)) {
      dynamicRoutes.value.push(route)
      addedRoutes.value.add(route.path)
    }
  }

  function removeDynamicRoute(path: string) {
    dynamicRoutes.value = dynamicRoutes.value.filter((r) => r.path !== path)
    addedRoutes.value.delete(path)
  }

  function getDynamicRoutes() {
    return [...dynamicRoutes.value]
  }

  return {
    currentBreadcrumbs,
    dynamicRoutes,
    breadcrumbs,
    setBreadcrumbs,
    addBreadcrumb,
    clearBreadcrumbs,
    addDynamicRoute,
    removeDynamicRoute,
    getDynamicRoutes,
  }
})
