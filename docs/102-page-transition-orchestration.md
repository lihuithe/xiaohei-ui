# 路由级页面切换动画编排系统

## 功能背景/动机

当前项目已有 `AnimatedTransition.vue` 和 `animations.css`，但存在以下短板：
1. **仅支持组件级过渡**：没有与 Vue Router 深度整合的路由级页面切换动画。
2. **动画类型有限**：仅 fade / scale / slide 等基础效果，缺少「页面层叠（Stack）」「共享元素过渡（Shared Element）」「FLIP 列表重排」等现代桌面应用常见动效。
3. **缺乏编排能力**：无法根据路由层级（如「进入子页面」vs「返回上级」）选择不同的进入/退出方向，导致多层级页面切换时方向感混乱。

作为 Electron 桌面应用脚手架，提供一套**路由感知的页面切换动画编排系统**，能让基于此模板开发的应用拥有原生级导航体验。

## 功能描述

构建一套**路由级页面切换动画编排系统**，包含：
1. **路由元信息驱动动画**：在路由配置的 `meta` 中声明 `transition: 'slide-left' | 'slide-right' | 'fade' | 'zoom'` 等，自动匹配对应的过渡效果。
2. **智能方向推断**：根据路由路径深度（如 `/settings` -> `/settings/profile` 为进入，反向为返回），自动推断 slide 方向。
3. **页面堆叠（Page Stack）模式**：可选地启用「页面堆叠」布局，新页面从右侧滑入覆盖旧页面，旧页面保留在 DOM 中（类似 iOS NavigationController），返回时滑出。
4. **共享元素过渡（Shared Element Transition）辅助**：提供一个 `v-shared-element` 指令或 `SharedElement` 组件包装器，在页面切换时标记需要过渡的元素，框架自动计算 FLIP 动画。
5. **动画偏好设置**：在系统设置中提供「减少动画（Reduced Motion）」开关，自动将所有过渡降级为瞬时切换或淡入淡出。

## 目标用户

- **需要多层级页面导航的桌面应用开发者**：如设置页嵌套、文档详情页、表单向导等场景。
- **追求原生级交互体验的产品团队**。
- **需要适配无障碍（a11y）减少动画偏好的开发者**。

## 详细设计

### 交互流程

1. 开发者在路由配置中可选地添加 `meta.transition`：
   ```ts
   {
     path: '/settings/profile',
     meta: {
       transition: 'slide',  // 启用滑动，方向由系统推断
       depth: 2,             // 用于方向推断
     }
   }
   ```
2. `App.vue` 中的 `<RouterView>` 被包裹在 `<PageTransition>` 组件中：
   ```vue
   <PageTransition>
     <RouterView />
   </PageTransition>
   ```
3. `PageTransition` 组件监听 `router.beforeEach`，读取 from/to 的 meta 信息，决定使用哪种 transition name 和 direction。
4. 若用户开启了「减少动画」，所有 transition 被替换为 `fade` 或完全禁用。
5. 共享元素过渡：开发者在两个页面中的对应元素上添加 `v-shared-element="avatar"`，切换路由时框架自动计算并执行 FLIP。

### 涉及的技术点

- **Vue Router 与 `<Transition>` 结合**：使用 `<Transition>` 包裹 `<RouterView>`，并通过 `:key="$route.path"` 触发重新渲染。
- **动态 Transition Name**：利用 Vue 的 `<component :is="'Transition'">` 或绑定 `:name` 属性，根据路由变化动态调整。
- **FLIP 动画技术**：First（记录初始状态）、Last（记录结束状态）、Invert（计算差值并反向 transform）、Play（播放过渡）。
- **prefers-reduced-motion**：读取系统级 `prefers-reduced-motion` 媒体查询，并与应用内设置联动。
- **KeepAlive 与过渡的协调**：对于需要缓存的页面（如 Tab 切换），确保过渡动画与 `keepAlive` 不冲突。

### 与现有架构的衔接方式

- **新增 `src/components/PageTransition.vue`**：核心编排组件，替代 App.vue 中直接使用 RouterView 的方式。
- **新增 `src/composables/usePageTransition.ts`**：
  - 提供 `transitionName` 计算属性。
  - 提供 `isReducedMotion` 响应式状态。
  - 与 `useTheme` 并列，供全局使用。
- **新增 `src/composables/useSharedElement.ts`**：共享元素过渡的 FLIP 逻辑封装。
- **修改 `src/router/index.ts`**：
  - 扩展 `RouteMeta` 接口，增加 `transition?: string` 和 `depth?: number`。
- **修改 `src/App.vue`**：
  - 将 `<RouterView />` 替换为 `<PageTransition><RouterView /></PageTransition>`。
- **新增 `src/styles/transitions.css`**：
  - 补充 `slide-left`、`slide-right`、`zoom`、`page-stack` 等过渡所需的 CSS 类。

### 需要新增/修改的文件

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/components/PageTransition.vue` | 新增 | 路由级过渡编排根组件 |
| `src/composables/usePageTransition.ts` | 新增 | 过渡状态与逻辑封装 |
| `src/composables/useSharedElement.ts` | 新增 | 共享元素 FLIP 动画逻辑 |
| `src/directives/vSharedElement.ts` | 新增 | 共享元素指令 |
| `src/router/index.ts` | 修改 | RouteMeta 扩展 transition/depth |
| `src/App.vue` | 修改 | 接入 PageTransition |
| `src/styles/transitions.css` | 新增 | 页面级过渡动画样式 |

## 验收标准

- [ ] 路由配置 `meta.transition` 可正确驱动页面进入/退出动画。
- [ ] 未配置 transition 的路由默认使用 `fade` 过渡。
- [ ] 根据路由 `depth` 自动推断 slide 方向（进入向右滑入，返回向左滑入）。
- [ ] 「减少动画」开关开启后，所有页面切换瞬间完成或仅保留极短淡入。
- [ ] 提供至少 1 个共享元素过渡的演示示例（如头像从列表放大到详情页）。
- [ ] 与 `keepAlive` 路由兼容，缓存页面切换时动画正常。

## 优先级

P1

## 参考实现

- [Vue Router - Transitions](https://router.vuejs.org/guide/advanced/transitions.html)：基础路由过渡官方文档。
- [NativeScript Vue Transitions](https://docs.nativescript.org/guide/ui/animation)：移动端页面堆叠动效设计参考。
- [FLIP Animation Technique](https://aerotwist.com/blog/flip-your-animations/)：FLIP 动画核心原理。
- [View Transitions API (Chrome)](https://developer.chrome.com/docs/web-platform/view-transitions)：浏览器原生共享元素过渡，可作为未来渐进增强方向。
