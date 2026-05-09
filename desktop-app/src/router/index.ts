import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import { useAppStore, useRouterStore, type BreadcrumbItem } from '@/stores'

export interface RouteMeta {
  title: string
  requiresAuth?: boolean
  keepAlive?: boolean
  breadcrumb?: BreadcrumbItem[]
}

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    requiresAuth?: boolean
    keepAlive?: boolean
    breadcrumb?: BreadcrumbItem[]
  }
}

const baseRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/pages/HomePage.vue'),
    meta: {
      title: '首页',
      breadcrumb: [{ path: '/', title: '首页' }],
    },
  },
  {
    path: '/components',
    name: 'Components',
    component: () => import('@/pages/ComponentsPage.vue'),
    meta: {
      title: '组件',
      breadcrumb: [
        { path: '/', title: '首页' },
        { path: '/components', title: '组件' },
      ],
    },
  },
  {
    path: '/playground',
    name: 'Playground',
    component: () => import('@/pages/ComponentPlayground.vue'),
    meta: {
      title: '组件演示',
      breadcrumb: [
        { path: '/', title: '首页' },
        { path: '/playground', title: '组件演示' },
      ],
    },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/pages/NotFoundPage.vue'),
    meta: {
      title: '404',
    },
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes: baseRoutes,
})

router.beforeEach((to, from, next) => {
  const appStore = useAppStore()
  const routerStore = useRouterStore()

  appStore.setLoading(true)

  if (to.meta.title) {
    document.title = `${to.meta.title} - 小黑助手`
  }

  if (to.meta.breadcrumb) {
    routerStore.setBreadcrumbs(to.meta.breadcrumb)
  } else {
    routerStore.clearBreadcrumbs()
  }

  if (to.meta.requiresAuth) {
    next('/')
  } else {
    next()
  }
})

router.afterEach(() => {
  const appStore = useAppStore()
  appStore.setLoading(false)
})

export function addDynamicRoute(route: RouteRecordRaw) {
  const routerStore = useRouterStore()
  if (!router.hasRoute(route.name as string)) {
    router.addRoute(route)
    routerStore.addDynamicRoute(route)
  }
}

export function removeDynamicRoute(name: string) {
  const routerStore = useRouterStore()
  if (router.hasRoute(name)) {
    router.removeRoute(name)
    routerStore.removeDynamicRoute(name)
  }
}

export default router
