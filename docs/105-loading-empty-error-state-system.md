# 加载/空状态/错误状态统一设计系统

## 功能背景/动机

当前脚手架在状态展示方面存在「碎片化」问题：
1. **Loading**：仅有基础的 `Skeleton.vue` 和 `LoadingSpinner.vue`，缺少带上下文说明的 Loading 状态、全屏 Loading、按钮级 Loading、数据表格 Loading 等场景化封装。
2. **Empty**：`Empty.vue` 仅提供容器样式，没有预设的图标、标题、描述、操作按钮组合，开发者每次都需要自行拼装。
3. **Error**：`ErrorBoundary.vue` 存在但缺少统一的「错误状态卡片/页面」模板，如网络错误、权限不足、数据加载失败、404 等场景的差异化展示。
4. **状态间切换缺乏动画**：从 Loading -> Empty -> Data 的状态流转通常是瞬间替换，缺乏平滑过渡。

对于脚手架模板而言，提供一套**覆盖全场景的 Loading / Empty / Error 状态设计系统**，能让下游开发者直接复制粘贴即可使用，极大提升开发效率与视觉一致性。

## 功能描述

构建一套**加载/空状态/错误状态统一设计系统**，包含：
1. **状态容器组件 `StateHandler`**：接收 `status: 'idle' | 'loading' | 'empty' | 'error'` 和对应插槽/配置，自动渲染对应状态并处理过渡动画。
2. **场景化 Loading 组件族**：
   - `FullScreenLoader`：应用初始化或全屏操作时的覆盖层 Loading。
   - `ContentLoader`：内容区域占位，支持 Skeleton 组合布局（列表、卡片、表格、图文混排）。
   - `ButtonLoader`：按钮内的加载状态，自动替换文字为 Spinner 并禁用按钮。
   - `InlineLoader`：行内小尺寸加载，适用于搜索建议、自动保存提示。
3. **场景化 Empty 组件族**：
   - `EmptyState`：通用空状态，支持自定义图标、标题、描述、操作按钮。
   - `SearchEmpty`：搜索无结果的专属空状态（带清除搜索按钮）。
   - `NoDataEmpty`：数据为空（如空表格、空列表）。
   - `NoPermissionEmpty`：权限不足空状态。
4. **场景化 Error 组件族**：
   - `ErrorState`：通用错误状态卡片。
   - `NetworkError`：网络错误，带重试按钮。
   - `NotFoundError`：已有 404 页面，但需升级为模板级组件。
   - `BoundaryError`：`ErrorBoundary` 的配套展示组件。
5. **状态流转动画**：`StateHandler` 内部使用 `AnimatedTransition`，实现 `loading -> content` 的淡出淡入、`error -> loading` 的切换动效。
6. **重试机制封装**：Error 状态内置 `onRetry` 回调，支持指数退避重试的 `useRetry` composable。

## 目标用户

- **需要快速搭建数据密集型页面的开发者**：列表页、表格页、仪表盘等。
- **希望保持全应用状态展示视觉一致性的团队**。
- **对用户体验有要求、希望状态切换有流畅动效的产品**。

## 详细设计

### 交互流程

1. 开发者使用 `StateHandler` 包裹异步数据区域：
   ```vue
   <StateHandler :status="dataStatus" @retry="fetchData">
     <template #loading>
       <ContentLoader type="list" :rows="5" />
     </template>
     <template #empty>
       <NoDataEmpty @create="handleCreate" />
     </template>
     <template #error="{ error }">
       <NetworkError :message="error.message" @retry="fetchData" />
     </template>
     <template #default>
       <DataTable :data="items" />
     </template>
   </StateHandler>
   ```
2. `dataStatus` 为 `'loading'` 时，显示 `ContentLoader`，带有 shimmer 动画。
3. 数据返回为空数组时，平滑过渡到 `NoDataEmpty`，显示预设插图和「创建第一条数据」按钮。
4. 请求报错时，过渡到 `NetworkError`，显示错误图标、简要错误信息和「重试」按钮；点击重试回到 Loading 状态。
5. 所有状态切换均伴随 200ms 的淡入淡出动画。

### 涉及的技术点

- **状态机设计**：`idle -> loading -> (success | empty | error)` 的有限状态机，可用 `useAsyncState`（@vueuse）或自研封装。
- **Skeleton 布局组合**：通过 `Skeleton` 组件的组合排列，预设 `list`、`card`、`table`、`profile` 等常用骨架屏布局。
- **指数退避重试**：`useRetry(fn, { maxAttempts: 3, delay: 1000, backoff: 2 })`。
- **ErrorBoundary 集成**：在 `ErrorBoundary` 捕获到错误后，渲染 `BoundaryError` 展示组件，并提供「重试渲染」和「上报错误」按钮。
- **Vue Transition + Suspense**：未来可对接 Vue 3 的 `<Suspense>`，但当前以显式状态管理为主，兼容现有代码风格。

### 与现有架构的衔接方式

- **新增 `src/components/state/` 目录**：
  - `StateHandler.vue`：状态编排容器。
  - `FullScreenLoader.vue`
  - `ContentLoader.vue`
  - `ButtonLoader.vue`（可作为 HOC 或 Slot 模式）
  - `EmptyState.vue`
  - `SearchEmpty.vue`
  - `NoDataEmpty.vue`
  - `NoPermissionEmpty.vue`
  - `ErrorState.vue`
  - `NetworkError.vue`
  - `BoundaryError.vue`
- **新增 `src/composables/useAsyncHandler.ts`**：
  - 封装 `status`、`data`、`error`、`execute`、`retry` 等响应式状态。
- **新增 `src/composables/useRetry.ts`**：
  - 重试逻辑封装。
- **修改 `src/components/ErrorBoundary.vue`**：
  - 引入 `BoundaryError.vue` 作为默认错误展示 UI。
- **修改 `src/components/ui/Skeleton.vue`**：
  - 增加 `layout` prop，支持 `list`/`card`/`table` 等预设组合。
- **新增演示页面或扩展 `ComponentPlayground.vue`**：
  - 增加「状态系统」Tab，展示 Loading / Empty / Error 各组件的交互效果。

### 需要新增/修改的文件

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/components/state/StateHandler.vue` | 新增 | 核心状态编排容器 |
| `src/components/state/FullScreenLoader.vue` | 新增 | 全屏加载 |
| `src/components/state/ContentLoader.vue` | 新增 | 内容区骨架屏 |
| `src/components/state/EmptyState.vue` | 新增 | 通用空状态 |
| `src/components/state/SearchEmpty.vue` | 新增 | 搜索无结果 |
| `src/components/state/NoDataEmpty.vue` | 新增 | 数据为空 |
| `src/components/state/NetworkError.vue` | 新增 | 网络错误 |
| `src/components/state/BoundaryError.vue` | 新增 | 错误边界展示 |
| `src/composables/useAsyncHandler.ts` | 新增 | 异步状态管理 |
| `src/composables/useRetry.ts` | 新增 | 重试逻辑 |
| `src/components/ErrorBoundary.vue` | 修改 | 接入 BoundaryError |
| `src/components/ui/Skeleton.vue` | 修改 | 支持预设布局组合 |
| `src/pages/ComponentPlayground.vue` | 修改 | 增加状态系统演示区 |

## 验收标准

- [ ] `StateHandler` 支持 `loading/empty/error/default` 四个状态插槽，切换时带淡入淡出动画。
- [ ] 提供至少 4 种 `ContentLoader` 预设布局（列表、卡片、表格、图文）。
- [ ] `EmptyState` 及衍生组件支持图标、标题、描述、操作按钮的配置化传入。
- [ ] `NetworkError` 内置重试按钮，点击后触发 `onRetry` 回调。
- [ ] `useRetry` 支持配置最大重试次数、初始延迟和退避倍数。
- [ ] `ErrorBoundary` 捕获错误后展示 `BoundaryError`，并提供「重试」和「复制错误信息」按钮。
- [ ] ComponentPlayground 中新增「状态系统」交互演示区。

## 优先级

P0

## 参考实现

- [Ant Design Empty](https://ant.design/components/empty)：空状态组件的细分场景设计。
- [Chakra UI Skeleton](https://v2.chakra-ui.com/docs/components/skeleton)：Skeleton 组合布局与动画实现。
- [React Query / TanStack Query Status](https://tanstack.com/query/latest)：异步数据状态（idle/loading/error/success）的管理范式。
- [shadcn-ui Loading Button](https://ui.shadcn.com/docs/components/button)：按钮 Loading 状态的最佳实践。
