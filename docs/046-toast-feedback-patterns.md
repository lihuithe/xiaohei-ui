# 通知与反馈交互模式（Toast & Feedback Interaction Patterns）

## 功能背景/动机

当前脚手架已包含 002 号「应用内通知中心」（通知列表管理）和 `Sonner.vue`（基于 vue-sonner 的 Toast 通知组件），但缺少面向桌面应用反馈场景的**通知与反馈交互模式系统**。现有实现仅提供了基础的通知展示能力，而桌面应用需要更丰富的反馈模式——如带操作按钮的 Toast、进度通知（文件上传/下载进度）、持久化通知（需用户手动关闭）、通知堆叠与分组、以及不同严重级别的反馈策略。提供一套完整的通知与反馈交互模式，能确保应用在所有操作场景下都给予用户清晰、及时、可操作的反馈。

## 功能描述

在现有 Sonner/NotificationCenter 基础上，构建通知与反馈交互模式系统：

1. **Toast 变体模式（Toast Variants）**：标准通知（纯文本）、操作通知（带按钮如「撤销」「查看详情」）、加载通知（带进度条或 Spinner）、富内容通知（带图标、标题、描述、操作按钮的复合内容）
2. **通知堆叠与分组（Toast Stacking & Grouping）**：多个通知堆叠展示时的策略（最新置顶或最新置底），支持相同类型通知自动合并为分组（如「3 个文件上传完成」）
3. **进度通知模式（Progress Notification）**：长时间操作（文件上传、数据导出、批量处理）的进度反馈，支持百分比进度条、剩余时间估算、取消操作按钮
4. **持久化与历史通知（Persistent & History Notifications）**：需要用户确认或手动关闭的重要通知，以及已关闭通知的历史记录查询和重新查看
5. **反馈策略与自动消失（Feedback Strategy & Auto-dismiss）**：根据通知严重级别（info/success/warning/error）配置不同的自动消失时长、是否可手动关闭、是否震动提示（桌面端原生通知集成）

## 目标用户

- 需要为用户提供操作反馈的开发者（保存成功、删除确认、上传进度等）
- 构建需要进度反馈的长时操作界面的开发者
- 希望统一应用中所有通知/反馈交互体验的开发者

## 详细设计

### 交互流程

```
Toast 变体：

标准通知：
  用户操作后 → 屏幕右上角滑出 Toast：「设置已保存」
  → 纯文本，带关闭按钮
  → 3 秒后自动消失（带进度指示）
  → 鼠标悬停 → 暂停倒计时 → 鼠标离开 → 继续倒计时

操作通知：
  用户删除文件 → Toast 显示：「文件已删除」[撤销]
  → 「撤销」按钮在 Toast 消失前可点击
  → 点击「撤销」→ 执行恢复操作 → Toast 更新为「已恢复」
  → 支持多个操作按钮：「查看详情」「忽略」
  → 操作按钮点击后 Toast 可保持显示（更新内容）或立即消失

加载通知：
  用户导出数据 → Toast 显示：「正在导出数据...」+ 进度条
  → 进度条实时更新（0% → 45% → 100%）
  → 显示估算剩余时间：「约 30 秒剩余」
  → 提供「取消」按钮 → 点击后中断操作 → Toast 更新为「已取消」
  → 完成时 → 进度条满格 → Toast 变为「导出完成」[打开文件夹]
  → 支持不确定进度（indeterminate）：操作耗时未知时显示循环动画

富内容通知：
  系统检测到更新 → Toast 显示复合内容：
    → 图标：蓝色信息图标
    → 标题：「新版本可用」
    → 描述：「v2.1.0 包含性能改进和新功能」
    → 操作：「查看更新日志」 「稍后提醒」
  → 富内容通知面积更大（最多 4 行描述）
  → 支持头像/图片（如「张三分享了文件给你」+ 用户头像）

通知堆叠与分组：
  短时间内触发多个通知 → 堆叠策略：
    → 最新置顶：新通知出现在顶部，旧通知向下推移
    → 最新置底：新通知出现在底部（适合阅读顺序）
    → 最大堆叠数：默认 5 个，超出时最旧的自动消失或折叠
  
  分组合并：
    → 3 个文件连续上传完成 → 不显示 3 个独立 Toast
    → 合并为 1 个：「3 个文件上传完成」+ 展开查看列表
    → 分组依据：相同 type + 相同操作源（如都来自「上传任务」）
    → 分组内的通知支持展开/折叠查看详情

进度通知：
  用户上传 5 个文件 → 显示一个总进度 Toast
    → 标题：「正在上传 5 个文件」
    → 整体进度条 + 当前文件名
    → 已完成 2/5 → 3 个等待中
    → 提供「全部取消」按钮
    → 单个文件失败时 → 该文件标记为错误 → 整体继续
    → 全部完成后 → Toast 变为「5 个文件上传完成」[查看]
    → 部分失败 → 「3 个成功，2 个失败」[重试失败项]

持久化通知：
  重要系统消息 → Toast 不自动消失，需用户手动关闭
    → 显示「重要」徽章
    → 关闭按钮始终可见
    → 支持「稍后提醒（15分钟后）」
  
  历史通知：
    → 点击通知中心的「历史」标签 → 查看最近 50 条已关闭通知
    → 支持按类型过滤（只看错误/警告）
    → 支持搜索通知内容
    → 支持「清空历史」

反馈策略：
  info 级别：「新功能提示」→ 5 秒自动消失，可关闭
  success 级别：「保存成功」→ 3 秒自动消失，可关闭
  warning 级别：「磁盘空间不足」→ 8 秒自动消失，可关闭，悬停暂停
  error 级别：「保存失败」→ 不自动消失，需手动关闭
  loading 级别：「处理中...」→ 操作完成后自动替换为结果通知
  
  桌面端原生通知集成（可选）：
    → 应用不在前台时 → 触发系统原生通知（Electron Notification）
    → 点击原生通知 → 应用窗口聚焦并跳转到相关页面
```

### 涉及的技术点

- **vue-sonner 扩展**：在 Sonner 基础上封装变体 API，支持自定义内容模板
- **通知队列管理**：使用队列控制通知的显示顺序、堆叠、分组和自动消失
- **进度更新机制**：通过 ref/reactive 实时更新进度通知的进度值
- **倒计时与悬停暂停**：`setInterval` 管理倒计时，鼠标悬停时 `clearInterval`，离开时恢复
- **分组哈希**：根据通知的 `group` 字段和 `type` 计算哈希，相同哈希的通知自动合并

### 与现有架构的衔接方式

| 现有模块 | 衔接方式 |
|---------|---------|
| `src/components/ui/sonner/` | 基础 Toast 通知组件，扩展变体和自定义内容 |
| `src/components/ui/alert/` | 富内容通知的内容样式参考 |
| `src/components/ui/progress/` | 进度通知的进度条组件 |
| `src/components/ui/button/` | 操作通知的按钮组件 |
| `src/components/ui/badge/` | 通知徽章和计数 |
| `002-notification-center` | 通知列表和历史记录管理 |
| `src/stores/app.ts` | 全局通知状态管理 |

### 需要新增/修改的文件

**新增文件：**
- `src/components/toast-patterns/ActionToast.vue` — 带操作按钮的 Toast 封装
- `src/components/toast-patterns/ProgressToast.vue` — 进度通知 Toast 封装
- `src/components/toast-patterns/RichToast.vue` — 富内容 Toast 封装
- `src/components/toast-patterns/ToastGroup.vue` — 分组通知展开组件
- `src/composables/useToastActions.ts` — 操作通知逻辑 composable
- `src/composables/useProgressToast.ts` — 进度通知逻辑 composable
- `src/composables/useToastQueue.ts` — 通知队列管理 composable
- `src/types/toast-patterns.ts` — 通知反馈模式类型定义

**修改文件：**
- `src/components/ui/sonner/Sonner.vue` — 支持更多插槽和变体样式

### 核心数据结构

```typescript
// src/types/toast-patterns.ts
import type { ToastT } from 'vue-sonner'

export type ToastVariant = 'default' | 'success' | 'info' | 'warning' | 'error' | 'loading'

export interface ToastAction {
  label: string
  variant?: 'default' | 'destructive' | 'outline' | 'ghost'
  onClick: () => void | Promise<void>
  dismissAfterClick?: boolean   // 点击后是否关闭 Toast
}

export interface ProgressToastOptions {
  id?: string
  title: string
  description?: string
  progress: number | Ref<number>  // 0-100
  indeterminate?: boolean
  cancelable?: boolean
  onCancel?: () => void
  estimateMs?: number           // 预估总耗时
}

export interface RichToastOptions {
  id?: string
  variant: ToastVariant
  title: string
  description?: string
  icon?: string                 // lucide icon name
  image?: string                // 头像/图片 URL
  actions?: ToastAction[]
  duration?: number             // 自动消失毫秒，0 = 不自动消失
  group?: string                // 分组标识
  persistent?: boolean          // 是否持久显示
}

export interface ToastQueueItem extends RichToastOptions {
  queuedAt: number
  sequence: number
}

export interface ToastGroupState {
  groupId: string
  count: number
  items: ToastQueueItem[]
  expanded: boolean
}
```

### 关键实现策略

1. **统一 Toast API**：提供 `toast.rich(options)`、`toast.progress(options)`、`toast.action(message, actions)` 等便捷方法，底层统一调用 vue-sonner 的 `toast()` 但封装为模板组件。开发者无需手动组装 HTML，通过配置对象即可创建复杂通知
2. **进度通知的响应式绑定**：`useProgressToast()` 接收一个 `Ref<number>` 作为进度源，内部使用 `watch` 监听变化并实时更新 Toast 内容。取消操作通过 `AbortController` 信号传递，进度 Toast 的取消按钮触发 `abort()`
3. **分组合并算法**：通知入队时检查队列中是否有相同 `group` 且显示中的 Toast，如有则更新该 Toast 的计数而非新建。分组 Toast 的展开状态独立管理，点击展开后显示该组内所有通知的缩略列表
4. **倒计时悬停暂停**：每个 Toast 维护自己的 `setInterval` 倒计时器。vue-sonner 的 `onMouseEnter`/`onMouseLeave` 事件触发暂停/恢复。暂停时保存剩余时间，恢复时从剩余时间继续倒计时
5. **与通知中心联动**：Toast 显示的同时将通知记录推入 002 的 NotificationCenter Store。Toast 关闭后记录仍保留在历史中。操作通知的按钮点击状态（如「已撤销」）也同步到通知中心

## 验收标准

- [ ] 提供 `toast.rich()` API，支持标题、描述、图标、图片、多操作按钮的富内容通知
- [ ] 提供 `toast.progress()` API，支持实时进度更新、剩余时间估算、取消操作
- [ ] 提供 `toast.action()` API，支持带「撤销」等操作按钮的通知
- [ ] 支持通知堆叠策略（最新置顶/置底）和最大堆叠数限制
- [ ] 支持相同类型通知自动分组合并，支持展开查看分组详情
- [ ] 支持鼠标悬停暂停倒计时，离开后恢复
- [ ] 支持不同级别通知的差异化自动消失策略（error 不自动消失）
- [ ] 进度通知支持不确定进度模式和完成后的状态转换
- [ ] 支持持久化通知（需手动关闭）和通知历史记录查看
- [ ] 提供 `useProgressToast()` composable，支持响应式进度绑定和取消信号
- [ ] 包含至少 5 个使用示例（标准通知、操作通知、进度通知、富内容通知、分组通知）

## 优先级

**P1** — 通知反馈是用户操作闭环的核心环节，与现有 Sonner/NotificationCenter 高度契合；丰富的 Toast 变体能显著提升操作反馈的清晰度和可操作性。

## 参考实现

- [vue-sonner](https://github.com/xiaoluoboding/vue-sonner) — 底层 Toast 组件
- [Sonner Rich Toast](https://sonner.emilkowal.ski/) — 富内容通知设计参考
- [VS Code Notifications](https://code.visualstudio.com/docs/getstarted/userinterface) — 进度通知和操作按钮
- [macOS Notification Center](https://support.apple.com/guide/mac-help/mchl2fb1258f/mac) — 通知堆叠和分组
- [Ant Design Message/Notification](https://ant.design/components/message) — 反馈级别和自动消失策略
