# 分页器变体与加载模式（Pagination Variants & Loading Patterns）

## 功能背景/动机

当前脚手架已包含 shadcn-vue 的 `Pagination` 基础组件（`PaginationItem`、`PaginationLink`、`PaginationEllipsis` 等）和 `105-loading-empty-error-state-system`（加载/空/错误状态），但缺少面向数据列表场景的**分页器变体系统**和**加载交互模式**。桌面应用中的数据展示不仅需要「上一页/下一页」的基础分页，还需要简化分页器（仅前后按钮+页码输入）、页码跳转、每页条数选择、分页与 URL 同步、以及更丰富的加载状态反馈（骨架屏、增量加载指示、加载失败重试）。提供一套完整的分页器变体与加载模式系统，能让开发者根据数据量和场景选择最合适的分页交互。

## 功能描述

在现有 Pagination 和状态系统基础上，构建分页器变体与加载交互模式系统：

1. **分页器变体（Pagination Variants）**：标准分页（页码列表）、简化分页（仅前后+页码输入）、极简分页（仅前后按钮+当前/总页）、无限分页（滚动加载+底部分页条混合）
2. **分页与 URL 同步（Pagination URL Sync）**：分页状态同步到 URL query 参数（`?page=2&size=50`），支持浏览器前进/后退和页面刷新后保持分页位置
3. **每页条数选择（Page Size Selector）**：分页器集成每页显示条数下拉选择（20/50/100/200），切换时自动调整当前页码以保持数据位置大致不变
4. **增量加载指示模式（Incremental Loading）**：分页加载过程中展示的内容占位策略——整页骨架屏、仅新数据行 skeleton、或顶部/底部加载指示器
5. **加载失败与重试模式（Load Fail & Retry）**：分页加载失败时的错误反馈和重试交互——错误提示条、自动重试倒计时、手动重试按钮
6. **分页信息摘要（Pagination Info Summary）**：分页器旁展示数据摘要信息（「显示 41-60 条，共 156 条」），支持快速跳转输入框

## 目标用户

- 构建数据表格、列表、日志查看器等分页数据展示场景的开发者
- 需要支持用户灵活控制分页粒度（每页条数）的开发者
- 希望分页状态可分享（URL 同步）的应用设计者

## 详细设计

### 交互流程

```
分页器变体：

标准分页（数据量中等，如 100-1000 条）：
  « < 1 2 3 ... 10 > »
  → 显示首页/末页按钮、上一页/下一页、页码列表、省略号
  → 当前页码高亮
  → 点击页码 → 加载对应页数据 → 滚动到列表顶部

简化分页（空间受限，如侧边栏内）：
  < 第 2 / 10 页 >
  → 仅显示上一页/下一页按钮和页码输入框
  → 点击页码文本 → 变为输入框 → 输入页码 → Enter 跳转
  → 输入无效页码 → 输入框变红 → 失去焦点后恢复为当前页码

极简分页（移动端或紧凑布局）：
  < 2 / 10 >
  → 仅显示上一页/下一页和当前/总页数
  → 无页码输入，只能逐页切换

无限分页（混合模式）：
  → 默认使用无限滚动加载（038）
  → 滚动到底部加载新数据
  → 底部同时显示简化分页条：「已加载 60 / 156 条  [加载更多]」
  → 点击「加载更多」按钮也触发加载
  → 加载完成后按钮更新为下一批状态

分页与 URL 同步：
用户在第 3 页 → URL 自动更新为 `/items?page=3&size=50`
  → 用户复制 URL 分享 → 他人打开直接定位到第 3 页
  → 用户点击浏览器后退 → 回到第 2 页
  → 用户修改 URL 为 `?page=5` → 自动加载第 5 页
  → URL 参数与组件内部状态双向绑定
  → 支持 `syncToUrl` 参数关闭同步（如弹窗内分页不需要 URL 同步）

每页条数选择：
分页器右侧显示下拉选择：「每页 20 条 ▼」
  → 选项：10 / 20 / 50 / 100 / 200
  → 当前在第 5 页，每页 20 条（显示 81-100 条）
  → 切换到每页 50 条
    → 计算新页码：当前显示的第 81 条在新粒度下位于第 2 页（51-100）
    → 自动跳转到第 2 页，保持用户看到的数据连续性
  → 切换时显示 loading 状态 → 加载新页数据

增量加载指示：
用户点击下一页 → 展示加载策略（可配置）：
  → 策略A「整页骨架屏」：清除当前内容 → 展示 10 行 Skeleton → 加载完成替换为真实数据
  → 策略B「保留+底部加载」：保留当前内容 → 底部显示加载中 Spinner → 新数据追加
  → 策略C「行级骨架」：在当前列表下方直接追加 10 行 Skeleton → 加载完成骨架变真实数据
  → 策略D「乐观加载」：立即展示预估的骨架内容，加载完成后无缝替换

加载失败与重试：
用户点击第 5 页 → 请求超时/失败
  → 当前内容保留（不清空）
  → 分页器下方或列表顶部显示错误提示条：
    → 红色背景：「加载失败：请求超时」
    → 「重试」按钮
    → 「自动重试（3秒后）」倒计时
  → 用户点击「重试」→ 重新加载当前页
  → 倒计时结束自动重试 → 最多自动重试 3 次
  → 多次失败后 → 显示「请检查网络连接」

分页信息摘要：
分页器左侧显示：「显示 41-60 条，共 156 条」
  → 如数据总数未知 → 显示「显示 41-60 条」
  → 如没有数据 → 显示「共 0 条」
  → 快速跳转：「前往第 [___] 页 / 10」输入框
    → 输入页码 → Enter → 跳转
    → 输入 0 或超过总页数 → 自动校正为有效范围
```

### 涉及的技术点

- **URL query 解析与同步**：`URLSearchParams` 解析当前 query，Vue Router `push`/`replace` 更新 URL
- **页码计算**：总页数 = `Math.ceil(total / pageSize)`，切换 pageSize 时新页码 = `Math.floor((currentPage - 1) * oldSize / newSize) + 1`
- **防抖输入**：页码输入框使用防抖避免快速输入时频繁跳转
- **加载状态机**：分页加载有 4 种状态——idle、loading、success、error，每种状态对应不同的 UI 展示
- **自动重试**：使用 `setInterval` 实现倒计时，配合重试次数计数器

### 与现有架构的衔接方式

| 现有模块 | 衔接方式 |
|---------|---------|
| `src/components/ui/pagination/` | 基础分页组件扩展为变体系统 |
| `src/components/ui/skeleton/` | 加载中的骨架屏占位 |
| `src/components/ui/select/` | 每页条数选择的下拉框 |
| `src/components/ui/input/` | 页码跳转输入框 |
| `src/components/ui/alert/` | 加载失败的错误提示 |
| `src/components/ui/button/` | 重试按钮 |
| `src/router/index.ts` | URL query 同步 |
| `src/composables/useDebounce.ts` | 页码输入防抖 |

### 需要新增/修改的文件

**新增文件：**
- `src/components/pagination-patterns/PaginationStandard.vue` — 标准分页封装
- `src/components/pagination-patterns/PaginationSimple.vue` — 简化分页封装
- `src/components/pagination-patterns/PaginationMinimal.vue` — 极简分页封装
- `src/components/pagination-patterns/PaginationWithSize.vue` — 集成每页条数选择的分页
- `src/components/pagination-patterns/PaginationInfo.vue` — 分页信息摘要组件
- `src/components/pagination-patterns/LoadFailRetry.vue` — 加载失败重试组件
- `src/composables/usePagination.ts` — 分页逻辑核心 composable
- `src/composables/usePaginationUrl.ts` — 分页 URL 同步 composable
- `src/types/pagination.ts` — 分页模式类型定义

**修改文件：**
- `src/components/ui/pagination/Pagination.vue` — 支持变体切换和扩展插槽
- `src/components/ui/pagination/PaginationItem.vue` — 支持激活状态和禁用状态增强

### 核心数据结构

```typescript
// src/types/pagination.ts
export type PaginationVariant = 'standard' | 'simple' | 'minimal' | 'infinite'

export interface PaginationOptions {
  currentPage: number
  pageSize: number
  total: number
  variant?: PaginationVariant
  pageSizeOptions?: number[]      // 默认 [10, 20, 50, 100]
  showSizeChanger?: boolean
  showQuickJumper?: boolean
  showTotal?: boolean
  syncToUrl?: boolean
  urlParamNames?: { page?: string; size?: string }
  maxVisiblePages?: number        // 标准分页最多显示几个页码，默认 7
  loadingStrategy?: 'skeleton-page' | 'skeleton-append' | 'spinner' | 'optimistic'
  autoRetry?: boolean
  autoRetryCount?: number         // 默认 3
  autoRetryDelay?: number         // 默认 3000ms
}

export interface PaginationState {
  currentPage: number
  pageSize: number
  total: number
  totalPages: number
  startItem: number
  endItem: number
  isLoading: boolean
  isError: boolean
  errorMessage?: string
  retryCount: number
}

export interface PaginationUrlState {
  page: number
  size: number
}
```

### 关键实现策略

1. **分页变体统一接口**：所有分页变体共享相同的 `usePagination` 核心逻辑（页码计算、边界检查、跳转），仅渲染层不同。开发者通过 `variant` prop 切换，无需修改数据逻辑
2. **URL 同步的 replace 策略**：分页状态变化时使用 `router.replace`（而非 `push`）更新 URL，避免浏览器历史记录被分页操作塞满。仅当用户手动输入 URL 或点击浏览器前进/后退时才使用历史导航
3. **切换 pageSize 的连续性保持**：计算切换后的新页码时，以「当前显示的第一条数据」为锚点，确保用户切换粒度后仍能看到之前浏览位置附近的数据。公式：`newPage = Math.floor((oldPage - 1) * oldSize / newSize) + 1`
4. **加载策略选择**：
   - `skeleton-page`：适合整页数据展示（如搜索结果页），用户期望看到明确的加载反馈
   - `skeleton-append`：适合列表追加（如无限滚动），保持已有内容可见
   - `spinner`：适合轻量场景，仅显示旋转图标
   - `optimistic`：适合本地数据或缓存优先策略，先展示预估骨架再无缝替换
5. **自动重试的指数退避**：自动重试时延迟时间递增（3s → 6s → 12s），避免服务器过载。重试期间显示倒计时动画，用户可随时点击「重试」立即触发或「取消」停止自动重试

## 验收标准

- [ ] 提供 `PaginationStandard`、`PaginationSimple`、`PaginationMinimal` 三种分页变体组件
- [ ] 支持分页状态与 URL query 双向同步（`?page=&size=`）
- [ ] 支持每页条数选择，切换时自动计算新页码保持数据连续性
- [ ] 支持快速页码跳转输入框，输入无效页码自动校正
- [ ] 提供分页信息摘要（显示 X-Y 条，共 Z 条）
- [ ] 支持 4 种加载策略（整页骨架屏、追加骨架、Spinner、乐观加载）
- [ ] 加载失败时显示错误提示条，支持手动重试和自动重试（含倒计时）
- [ ] 自动重试支持指数退避和最大重试次数限制
- [ ] 提供 `usePagination()` composable，统一管理分页状态、页码计算、URL 同步
- [ ] 支持无限分页混合模式（滚动加载 + 底部分页条）
- [ ] 包含至少 4 个使用示例（标准分页、简化分页、URL 同步、加载失败重试）

## 优先级

**P1** — 分页是数据展示的基础交互，与现有 Pagination 组件和 038 数据展示交互模式高度契合；变体系统能覆盖从紧凑侧边栏到全页数据表格的多种分页场景。

## 参考实现

- [Ant Design Pagination](https://ant.design/components/pagination) — 分页变体和每页条数选择的行业标杆
- [shadcn-vue Pagination](https://www.shadcn-vue.com/docs/components/pagination.html) — 基础分页组件
- [GitHub Issues Pagination](https://github.com/issues) — 简化分页和 URL 同步
- [VueUse useOffsetPagination](https://vueuse.org/core/useOffsetPagination/) — 分页逻辑封装参考
- [TanStack Query Retry](https://tanstack.com/query/latest/docs/framework/react/guides/query-retries) — 加载失败重试策略
