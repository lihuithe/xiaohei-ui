# 空状态与错误状态交互增强（Empty & Error State Interaction Enhancement）

## 功能背景/动机

当前脚手架已包含 105 号「加载/空/错误状态系统」和 `Empty.vue`、`Skeleton.vue` 等状态展示组件，但该功能主要从**视觉展示**角度覆盖了不同状态的静态模板（空状态插画、错误状态提示、加载骨架屏）。在桌面应用中，空状态和错误状态不仅是「展示信息」，更是**引导用户采取下一步行动的交互机会**——空状态应该提供创建入口、错误状态应该提供恢复路径、加载状态应该展示进度和预计时间。将状态系统从「视觉模板」提升为「交互引导模式」，能显著降低用户面对空/错状态时的迷茫感，提升界面的自解释性。

## 功能描述

在现有 105 状态系统基础上，构建面向交互引导的空状态与错误状态增强模式：

1. **引导式空状态（Guided Empty State）**：空状态不仅展示「暂无数据」，更提供上下文相关的操作建议（如「创建第一个项目」按钮、「从模板导入」选项、「查看示例数据」链接）
2. **分层错误恢复（Layered Error Recovery）**：根据错误类型和严重程度提供分层恢复策略——轻微错误自动重试、普通错误展示重试按钮、严重错误展示诊断信息和联系支持入口
3. **加载进度与预期管理（Loading Progress & Expectation）**：长时间加载时展示进度指示（百分比或步骤）、预计剩余时间、以及取消操作的入口，避免用户焦虑
4. **错误边界与降级展示（Error Boundary & Degraded Display）**：组件渲染失败时不崩溃整个页面，而是降级展示错误占位组件，支持刷新单个组件而非整页刷新
5. **状态过渡动画（State Transition Animation）**：状态切换时的平滑过渡动画（加载 → 空 → 有数据 → 错误），避免内容突然跳变造成的视觉闪烁

## 目标用户

- 需要为新用户提供清晰引导的开发者（空状态的 onboarding 价值）
- 需要优雅处理网络/数据错误的开发者
- 希望减少用户面对异常状态时的挫败感的应用设计者

## 详细设计

### 交互流程

```
引导式空状态：

场景A - 列表空状态：
  → 页面展示空状态插画 + 标题「还没有项目」
  → 描述：「创建一个新项目开始工作，或从现有模板快速开始」
  → 操作区：
    → 主操作：「创建项目」（醒目按钮）
    → 次要操作：「从模板导入」
    → 辅助链接：「查看示例」
  → 如用户是首次访问 → 额外展示「入门指南」折叠面板
  → 操作执行后 → 空状态平滑过渡到有数据状态

场景B - 搜索结果空状态：
  → 用户搜索「xyz」无结果
  → 展示：「没有找到与『xyz』相关的结果」
  → 建议：
    → 「尝试其他关键词：xxx, yyy」
    → 「清除筛选条件」（如有筛选条件时显示）
    → 「在所有项目中搜索」（如当前只在子集中搜索）
  → 提供搜索输入框的修改入口（聚焦到搜索框）

场景C - 权限空状态：
  → 用户无权访问某功能
  → 展示：「您没有权限查看此内容」
  → 操作：「申请权限」「联系管理员」「查看可访问内容」
  → 而非直接报错或空白

分层错误恢复：

级别 1 - 自动恢复：
  → 网络瞬断导致请求失败 → 系统自动重试（最多 3 次，指数退避）
  → 重试成功 → 用户无感知，数据正常加载
  → 在后台显示微小重试指示（可选，开发者可配置）

级别 2 - 用户一键恢复：
  → 请求失败（非瞬断）→ 展示错误状态
  → 标题：「加载失败」
  → 描述：「无法连接到服务器，请检查网络连接」
  → 操作：「重试」按钮 + 「检查网络设置」链接
  → 点击「重试」→ 重新加载 → 成功则平滑过渡到正常状态

级别 3 - 诊断与引导：
  → 严重错误（如服务端 500）
  → 标题：「服务暂时不可用」
  → 描述：「我们遇到了技术问题，正在努力修复」
  → 操作：「重试」「查看服务状态页」「联系支持」
  → 高级：展开「技术详情」显示错误码和请求 ID（供支持人员排查）
  → 提供「复制错误信息」按钮

级别 4 - 完全降级：
  → 核心组件渲染失败（React/Vue Error Boundary）
  → 不白屏，展示降级 UI：「此模块加载失败」
  → 操作：「重新加载模块」「刷新页面」「返回首页」
  → 其他正常模块继续可用

加载进度与预期管理：

短加载（< 300ms）：
  → 骨架屏或微小 Spinner，无需额外信息

中加载（300ms - 3s）：
  → 骨架屏 + 简短说明：「正在加载项目...」

长加载（3s - 10s）：
  → 进度条或步骤指示器
  → 「正在处理数据（2/5 步骤）」
  → 预计剩余时间：「约 30 秒"
  → 「取消」按钮（如操作可取消）

超长加载（> 10s）：
  → 详细进度 + 预计时间
  → 背景提示：「您可以稍后再来查看结果」
  → 「后台运行」选项（关闭面板，完成后通知）
  → 完成后 Toast 通知（046）

错误边界与降级：

组件级降级：
  → 某卡片组件渲染失败
  → 该卡片展示为错误占位：红色边框 + 错误图标 + 「加载失败」
  → 提供「重试」按钮仅刷新该卡片
  → 页面其他部分完全正常

页面级降级：
  → 整个页面渲染失败
  → 展示友好错误页（而非白屏）
  → 包含：错误说明、重试按钮、返回首页、联系支持
  → 支持「安全模式」：以最小功能加载页面

状态过渡动画：

加载 → 空：
  → 骨架屏淡出（200ms）→ 空状态淡入（200ms）
  → 避免骨架屏突然消失造成的闪烁

加载 → 有数据：
  → 骨架屏淡出 → 数据列表 stagger 入场（每项延迟 30ms）
  → 使用 102 号页面切换动画编排的 stagger 能力

空 → 有数据（用户创建第一条）：
  → 空状态平滑缩小淡出 → 新数据项放大淡入
  → 给予用户正向反馈

有数据 → 错误：
  → 当前内容保留（不清空）→ 顶部滑入错误提示条
  → 或内容区域覆盖半透明遮罩 + 错误信息
  → 保留用户已看到的数据，避免信息丢失感

错误 → 恢复：
  → 错误提示条收缩消失 → 数据刷新/更新
  → 如数据变化 → 使用高亮动画提示变更项
```

### 涉及的技术点

- **Vue Error Boundary**：使用 `onErrorCaptured` 捕获子组件渲染错误，展示降级 UI
- **自动重试算法**：指数退避（1s → 2s → 4s），最大重试次数限制
- **进度估算**：基于已处理数据量和速度计算 ETA（`remainingTime = (total - processed) / speed`）
- **状态机管理**：组件状态流转（idle → loading → success/empty/error → ...）

### 与现有架构的衔接方式

| 现有模块 | 衔接方式 |
|---------|---------|
| `src/components/ui/empty/` | 空状态基础组件扩展为引导式空状态 |
| `src/components/ui/skeleton/` | 加载骨架屏组件 |
| `src/components/ui/alert/` | 错误状态提示组件 |
| `src/components/ui/progress/` | 加载进度条组件 |
| `src/components/ui/button/` | 操作按钮 |
| `src/components/ErrorBoundary.vue` | 现有错误边界组件扩展 |
| `105-loading-empty-error-state-system` | 在已有视觉模板基础上增加交互引导 |
| `046-toast-feedback-patterns` | 后台完成后的 Toast 通知 |
| `044-pagination-loading-patterns` | 分页加载的错误恢复策略 |

### 需要新增/修改的文件

**新增文件：**
- `src/components/state-patterns/GuidedEmpty.vue` — 引导式空状态组件
- `src/components/state-patterns/ErrorRecovery.vue` — 分层错误恢复组件
- `src/components/state-patterns/LoadingWithExpectation.vue` — 带预期管理的加载组件
- `src/components/state-patterns/ComponentErrorFallback.vue` — 组件级错误降级组件
- `src/components/state-patterns/StateTransition.vue` — 状态过渡动画包装组件
- `src/composables/useAutoRetry.ts` — 自动重试逻辑 composable
- `src/composables/useLoadingState.ts` — 加载状态机 composable
- `src/composables/useErrorBoundary.ts` — 错误边界增强 composable
- `src/types/state-interaction.ts` — 状态交互类型定义

**修改文件：**
- `src/components/ErrorBoundary.vue` — 扩展为支持分层降级策略
- `src/components/ui/empty/Empty.vue` — 支持操作按钮和引导内容插槽

### 核心数据结构

```typescript
// src/types/state-interaction.ts
export type LoadState = 'idle' | 'loading' | 'success' | 'empty' | 'error'

export interface GuidedEmptyOptions {
  title: string
  description?: string
  icon?: string                 // lucide icon name 或插画
  primaryAction?: {
    label: string
    icon?: string
    onClick: () => void
  }
  secondaryActions?: Array<{
    label: string
    onClick: () => void
  }>
  suggestions?: string[]        // 如搜索建议
}

export interface ErrorRecoveryLevel {
  level: 1 | 2 | 3 | 4
  title: string
  description: string
  autoRetry?: boolean
  retryCount?: number
  actions: Array<{
    label: string
    variant?: 'default' | 'outline' | 'ghost'
    onClick: () => void
  }>
  technicalDetails?: {
    errorCode?: string
    requestId?: string
    stack?: string
  }
}

export interface LoadingExpectationOptions {
  title: string
  description?: string
  progress?: number             // 0-100
  steps?: { current: number; total: number; label: string }
  estimateMs?: number
  cancellable?: boolean
  onCancel?: () => void
  backgroundable?: boolean      // 支持后台运行
}

export interface StateTransitionOptions {
  state: LoadState
  enterAnimation?: string
  leaveAnimation?: string
  duration?: number
}
```

### 关键实现策略

1. **空状态的上下文感知**：GuidedEmpty 组件通过 `context` prop 接收当前页面上下文（如 `page: 'project-list', hasFilters: true, isFirstVisit: false`），根据上下文自动选择最合适的空状态模板。开发者也可以完全自定义覆盖
2. **分层错误恢复的自动判定**：`useAutoRetry()` 根据错误类型自动选择恢复策略。网络错误（`navigator.onLine === false`）→ 级别 2；HTTP 5xx → 级别 3；组件渲染错误 → 级别 4。重试成功后自动升级到正常状态
3. **加载进度的时间估算**：使用移动平均算法估算剩余时间。记录每次进度更新的时间戳和处理量，计算平均处理速度，预测完成时间。避免进度回退（如 `Math.max(currentProgress, newProgress)`）
4. **组件级错误边界**：使用 Vue 的 `onErrorCaptured` 在组件树中捕获错误。ErrorBoundary 组件包裹可能出错的子树，捕获错误后展示 `ComponentErrorFallback` 而非让错误向上传播。支持 `fallback` prop 自定义降级 UI
5. **状态过渡的平滑衔接**：使用 Vue `<Transition>` 和 `<TransitionGroup>` 包装状态组件，为每种状态切换定义 enter/leave 动画。关键是确保旧状态完全淡出后新状态再淡入，避免重叠造成的视觉混乱。使用 `mode="out-in"`

## 验收标准

- [ ] 提供 `GuidedEmpty` 组件，支持主操作按钮、次要操作、搜索建议等引导内容
- [ ] 空状态支持上下文感知（列表空/搜索无结果/权限不足展示不同内容）
- [ ] 提供 `ErrorRecovery` 组件，支持 4 级分层恢复策略（自动重试/一键恢复/诊断引导/完全降级）
- [ ] 错误状态支持技术详情展开和错误信息复制
- [ ] 提供 `LoadingWithExpectation` 组件，支持进度条/步骤指示、预计时间、取消/后台运行
- [ ] 提供 `ComponentErrorFallback` 组件，支持组件级错误降级和单独刷新
- [ ] 提供 `StateTransition` 包装组件，支持状态切换的平滑过渡动画
- [ ] 自动重试支持指数退避和最大重试次数限制
- [ ] 长时间加载支持「后台运行」选项和完成后 Toast 通知
- [ ] 提供 `useLoadingState()` composable，管理 idle/loading/success/empty/error 状态机
- [ ] 包含至少 5 个使用示例（引导空状态、搜索无结果、分层错误、组件降级、状态过渡）

## 优先级

**P1** — 空状态与错误状态的交互引导是提升应用自解释性和用户安全感的关键，与现有 Empty/Skeleton/Alert/ErrorBoundary 组件高度契合；增强模式能将「被动展示」转化为「主动引导」。

## 参考实现

- [Ant Design Empty](https://ant.design/components/empty) — 空状态的引导式设计
- [GitHub Error Pages](https://github.com/404) — 分层错误恢复和诊断信息
- [Vercel Loading UI](https://vercel.com/) — 加载进度和预期管理
- [React Error Boundary](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary) — 错误边界模式
- [Material Design Empty States](https://m3.material.io/components/empty-states/overview) — 空状态 Material 设计规范
