# 悬浮/弹出层模式系统（Overlay & Popover Pattern System）

## 功能背景/动机

当前脚手架已包含 shadcn-vue 的 `Popover`、`Tooltip`、`DropdownMenu`、`HoverCard`、`ContextMenu` 等弹出层组件，但这些组件作为独立 primitive 存在，缺少统一的「弹出层模式系统」设计。在桌面应用中，Tooltip/Popover/Dropdown 的触发策略、延迟行为、层级管理、边界检测、级联展开等需要一致的设计语言——否则会出现 Tooltip 和 Popover 行为不一致、多层弹出层遮挡混乱、悬停菜单容易误触关闭等问题。提供一套统一的弹出层交互模式系统，能确保应用中所有浮动元素的体验一致，同时减少开发者的决策成本。

## 功能描述

构建覆盖桌面应用常见弹出层场景的交互模式系统：

1. **Tooltip 延迟策略模式（Tooltip Delay Strategy）**：定义不同场景下的显示/隐藏延迟（即时、标准延迟、长延迟），支持鼠标快速掠过时不出 Tooltip（防干扰）
2. **级联菜单模式（Cascading Menu）**：多级 Dropdown/ContextMenu 的展开策略（悬停展开 vs 点击展开）、子菜单对齐、返回关闭路径
3. **弹出层层级与边界管理（Overlay Stack & Boundary）**：统一管理所有弹出层的 z-index、遮罩、点击外部关闭策略，智能检测视口边界并自动翻转定位
4. **悬停意图检测（Hover Intent Detection）**：对 HoverCard/Hover Menu 实现意图检测，避免鼠标快速滑过目标区域时意外触发弹出层
5. **复合弹出层模式（Compound Popover）**：支持 Popover 内嵌套复杂内容（如带搜索的列表、小型表单、颜色选择器），支持 Popover 内再触发 Tooltip/次级 Popover
6. **弹出层无障碍模式（Overlay Accessibility）**：弹出层打开时的焦点管理、Escape 关闭、屏幕阅读器播报、与 031 焦点管理系统联动

## 目标用户

- 需要统一应用中所有浮动元素交互体验的开发者
- 构建复杂下拉菜单、级联选择、工具提示密集界面的开发者
- 希望减少弹出层误触发、提升界面稳定性的应用设计者

## 详细设计

### 交互流程

```
Tooltip 延迟策略：
鼠标悬停按钮 → 系统检测悬停时长
  → 即时策略（如错误提示 Tooltip）：立即显示（delay=0）
  → 标准策略（如功能说明 Tooltip）：悬停 300ms 后显示，离开 100ms 后隐藏
  → 长延迟策略（如辅助说明 Tooltip）：悬停 800ms 后显示
  → 鼠标快速掠过（停留 < 150ms）→ 不触发显示（防干扰）
  → 显示后鼠标移入 Tooltip 内容区 → Tooltip 保持显示（可交互 Tooltip）
  → 支持「仅键盘触发」模式（鼠标悬停不显示，聚焦时显示）

级联菜单：
用户点击「文件」菜单 → DropdownMenu 展开
  → 鼠标悬停「最近打开」项 → 子菜单在右侧展开（悬停触发策略）
  → 鼠标移入子菜单 → 父菜单和子菜单同时保持展开
  → 鼠标移回父菜单其他项 → 原子菜单关闭，新子菜单展开（延迟 150ms 防止闪烁）
  → 用户点击子菜单项 → 所有级联菜单关闭 → 执行操作
  → 用户按 Escape → 从最内层开始逐层关闭
  → 支持点击展开策略（非悬停）：用户需点击「最近打开」才展开子菜单

边界检测与自动翻转：
Popover 触发元素位于窗口右下角 → 默认向下展开会超出视口
  → 系统自动检测：弹出层底部 > 视口底部
  → 自动翻转策略：改为向上展开（side 从 bottom 变为 top）
  → 水平方向同样检测：右侧超出则向左对齐
  → 如上下左右均超出 → 优先保证可见，调整 max-height 为滚动
  → 支持 `collisionPadding` 参数，设置与视口边缘的最小间距

悬停意图检测：
用户鼠标在界面中快速移动 → 经过 HoverCard 触发区域
  → 意图检测算法：记录鼠标进入时间和移动速度
  → 速度 > 阈值（如 800px/s）且停留 < 200ms → 判定为「掠过」，不触发
  → 速度 < 阈值 或 停留 > 200ms → 判定为「有意悬停」，触发 HoverCard
  → 支持自定义意图检测参数（速度阈值、停留时间阈值）

复合弹出层：
用户点击颜色选择按钮 → Popover 打开 → 内部是颜色选择面板
  → 面板内有预设色块网格 → 鼠标悬停色块 → 显示 Tooltip「#FF5733」
  → 点击「自定义颜色」→ 次级 Popover 打开（或在当前 Popover 内切换视图）
  → 次级 Popover 支持独立的关闭逻辑（点击外部仅关闭次级，保留主 Popover）
  → 用户完成选择 → 主 Popover 关闭 → 焦点回到触发按钮

弹出层层级管理：
全局 OverlayStack 维护当前所有打开的弹出层：
  → Tooltip A 打开（z-index: 100）
  → 用户点击打开 Dropdown B（z-index: 200）
  → Dropdown B 内点击打开 Popover C（z-index: 300）
  → 点击页面空白处 → 仅关闭最上层的 Popover C（如配置为逐级关闭）
  → 或全部关闭（如配置为 blanket 模式）
  → 新弹出层始终获得比之前所有层更高的 z-index
```

### 涉及的技术点

- **Reka UI 浮层原语**：底层基于 Radix 的 Popper/Portal/FocusScope，提供定位、层级、焦点管理
- **防抖/延迟策略**：`useDebounce` 和自定义延迟计时器管理 Tooltip 显示/隐藏
- **碰撞检测算法**：基于 `@floating-ui/dom` 或 Reka UI 内置的边界检测（`collisionBoundary`、`collisionPadding`）
- **鼠标速度计算**：监听 `mousemove`，计算两点间距离和时间差得出速度
- **全局层级管理**：全局 WeakMap 或 ref 追踪当前打开的弹出层队列

### 与现有架构的衔接方式

| 现有模块 | 衔接方式 |
|---------|---------|
| `src/components/ui/popover/` | 扩展 Popover 支持复合内容和次级弹出层 |
| `src/components/ui/tooltip/` | 扩展 Tooltip 支持延迟策略和意图检测 |
| `src/components/ui/dropdown-menu/` | 级联菜单的主菜单和子菜单展开策略 |
| `src/components/ui/context-menu/` | 与 DropdownMenu 共享级联展开逻辑 |
| `src/components/ui/hover-card/` | 集成悬停意图检测 |
| `src/composables/useFocusTrap.ts`（031）| 弹出层的焦点管理和 Escape 关闭 |
| `src/composables/useDialogStack.ts`（030）| 弹出层与对话框共享层级管理策略 |

### 需要新增/修改的文件

**新增文件：**
- `src/composables/useTooltipDelay.ts` — Tooltip 延迟策略 composable
- `src/composables/useHoverIntent.ts` — 悬停意图检测 composable
- `src/composables/useOverlayStack.ts` — 全局弹出层层级管理 composable
- `src/composables/useCascadingMenu.ts` — 级联菜单逻辑 composable
- `src/components/overlay-patterns/SmartTooltip.vue` — 智能 Tooltip 封装（集成延迟策略）
- `src/components/overlay-patterns/CascadingDropdown.vue` — 级联下拉菜单封装
- `src/components/overlay-patterns/BoundaryPopover.vue` — 带边界检测的 Popover 封装
- `src/types/overlay.ts` — 弹出层模式类型定义

**修改文件：**
- `src/components/ui/tooltip/Tooltip.vue` — 可选集成延迟策略和意图检测
- `src/components/ui/popover/PopoverContent.vue` — 增强边界检测和碰撞处理配置
- `src/components/ui/dropdown-menu/DropdownMenuSub.vue` — 级联展开的悬停/点击策略

### 核心数据结构

```typescript
// src/types/overlay.ts
export type TooltipDelayStrategy = 'immediate' | 'standard' | 'long' | 'custom'

export interface TooltipDelayConfig {
  strategy: TooltipDelayStrategy
  showDelay?: number          // 默认：immediate=0, standard=300, long=800
  hideDelay?: number          // 默认 100
  interactive?: boolean       // Tooltip 内容是否可交互
  keyboardOnly?: boolean      // 仅键盘聚焦时显示
}

export interface HoverIntentOptions {
  sensitivity?: number        // 速度阈值（px/s），默认 800
  interval?: number           // 停留时间阈值（ms），默认 200
  timeout?: number            // 触发后保持时间（ms），默认 0
}

export interface OverlayStackItem {
  id: string
  type: 'tooltip' | 'popover' | 'dropdown' | 'modal' | 'contextmenu'
  element: HTMLElement
  zIndex: number
  closeOnOutsideClick?: boolean
  closeOnEsc?: boolean
  parentId?: string           // 级联关系中的父级
}

export interface CascadingMenuOptions {
  trigger: 'hover' | 'click'  // 子菜单展开触发方式
  hoverDelay?: number         // 悬停触发的延迟（防闪烁）
  closeDelay?: number         // 鼠标离开后的关闭延迟
  alignOffset?: number        // 子菜单对齐偏移
}
```

### 关键实现策略

1. **Tooltip 延迟统一配置**：提供全局 `TooltipProvider` 组件，通过 `provide` 注入默认延迟策略，单个 Tooltip 可通过 props 覆盖。默认策略为 `standard`（show 300ms / hide 100ms），错误提示类可覆盖为 `immediate`
2. **悬停意图检测算法**：使用 `mousemove` 事件追踪鼠标轨迹，计算进入目标区域后的平均速度。速度 = 移动距离(px) / 时间(ms) × 1000。超过 `sensitivity` 阈值判定为快速掠过，不触发弹出层
3. **级联菜单防闪烁**：悬停触发模式下，子菜单的打开和关闭都添加 100-150ms 延迟。鼠标从父菜单项快速移动到子菜单时，通过延迟确保子菜单保持打开；鼠标快速掠过时，延迟阻止菜单展开
4. **边界检测自动翻转**：复用 Reka UI / Floating UI 的 `flip` 和 `shift` middleware，配置 `collisionPadding={8}` 确保弹出层与视口边缘保持 8px 间距。对极端情况（触发元素靠近屏幕中心四边均不足）启用 `fit` 模式，限制弹出层尺寸并添加内部滚动
5. **层级统一管理**：全局 `useOverlayStack` 维护当前所有打开的浮动层。新层 `z-index = baseZIndex + stack.length × 10`。点击外部关闭时，根据策略选择「仅关闭最上层」或「关闭所有非 tooltip 层」（tooltip 通常视为非模态，不影响其他层）

## 验收标准

- [ ] 提供 `SmartTooltip` 组件/封装，支持即时/标准/长延迟三种策略和防掠过检测
- [ ] 提供全局 Tooltip 默认策略配置（`TooltipProvider`），支持单个实例覆盖
- [ ] 级联菜单支持悬停展开和点击展开两种策略，支持子菜单对齐和防闪烁延迟
- [ ] 弹出层支持智能边界检测，超出视口时自动翻转定位方向
- [ ] 提供 `useHoverIntent()` composable，支持速度/停留时间阈值配置
- [ ] 提供 `useOverlayStack()` 管理全局弹出层层级，支持 z-index 自动分配
- [ ] 复合弹出层（Popover 内嵌套 Tooltip/次级 Popover）层级正确，关闭逻辑独立
- [ ] 按 Escape 优先关闭最上层弹出层（tooltip → popover → dropdown → modal）
- [ ] 支持弹出层打开时的焦点自动落入和关闭时的焦点恢复（与 031 联动）
- [ ] 包含至少 5 个使用示例（延迟 Tooltip、级联菜单、边界翻转、悬停意图、复合弹出层）

## 优先级

**P1** — 弹出层是桌面应用最高频的交互元素之一，与现有 Popover/Tooltip/DropdownMenu 组件深度契合；统一的延迟和层级管理能显著提升应用的专业感和稳定性。

## 参考实现

- [Reka UI Tooltip](https://reka-ui.com/docs/components/tooltip) — 底层实现和延迟配置
- [Floating UI](https://floating-ui.com/) — 边界检测和自动定位
- [Atlassian Hover Intent](https://atlassian.design/components/tooltip/) — 悬停意图检测设计
- [Ant Design Dropdown](https://ant.design/components/dropdown) — 级联菜单展开策略
- [Radix Hover Card](https://www.radix-ui.com/primitives/docs/components/hover-card) — 悬停卡片交互
