# 拖拽交互模式（Drag Interaction Patterns）

## 功能背景/动机

当前脚手架已包含 004 号「文件拖拽处理模板」（处理外部文件拖入应用）和 `Resizable` 组件（基于 reka-ui 的面板尺寸调整），但缺少面向桌面应用常见 UI 场景的**拖拽交互模式系统**——如列表项拖拽排序、面板/侧边栏拖拽调整宽度、卡片网格拖拽重新布局、对话框拖拽调整大小和位置、标签页拖拽排序（与 032 联动）等。在桌面应用中，拖拽是一种直观且高效的直接操作（Direct Manipulation）方式，用户期望通过拖拽自由组织界面元素。提供一套完整的拖拽交互模式系统，能让开发者快速构建可自定义布局的桌面应用。

## 功能描述

构建覆盖桌面应用常见拖拽场景的交互模式系统：

1. **列表拖拽排序（Sortable List）**：垂直/水平列表项支持拖拽重新排序，支持拖拽手柄（drag handle）和整项拖拽两种模式
2. **面板拖拽调整大小（Resizable Panel）**：基于现有 Resizable 组件扩展，支持更丰富的拖拽手柄样式、最小/最大尺寸约束、尺寸记忆
3. **侧边栏拖拽宽度（Resizable Sidebar）**：支持拖拽侧边栏右边缘调整宽度，支持折叠阈值（拖拽到小于某宽度自动折叠）
4. **卡片网格拖拽布局（Draggable Grid / Dashboard）**：网格化的卡片/小组件支持拖拽重新排列，支持不同尺寸的卡片占位
5. **对话框拖拽移动与调整大小（Draggable Dialog）**：支持拖拽对话框标题栏移动位置，拖拽边框调整大小（与 030 ResizableDialog 联动）
6. **拖拽占位符与视觉反馈（Drag Feedback）**：拖拽过程中的幽灵元素（ghost）、放置区域高亮、禁止放置的反馈动画

## 目标用户

- 构建可自定义布局的仪表板/看板应用的开发者
- 需要支持用户自定义侧边栏宽度和面板分割的开发者
- 构建任务管理、笔记整理等需要拖拽排序场景的应用设计者

## 详细设计

### 交互流程

```
列表拖拽排序：
用户按下列表项左侧的「⋮⋮」拖拽手柄 → 该项略微上浮并添加阴影（drag start）
  → 拖拽过程中 → 列表其他项让出空间（占位符或平滑位移）
  → 释放鼠标 → 列表项按新位置重排
  → 触发 `onReorder(newItems)` 回调
  → 如列表项代表路由/配置 → 新顺序自动持久化

面板拖拽调整大小：
两个面板左右并列 → 中间有拖拽手柄（ResizableHandle）
  → 用户鼠标悬停手柄 → 光标变为 col-resize
  → 用户拖拽 → 实时调整左右面板宽度
  → 面板内容响应式适配（如面板变窄时隐藏次要信息）
  → 释放后尺寸存入 localStorage
  → 支持双击手柄「自动均分」或「恢复默认」

侧边栏拖拽宽度：
用户鼠标悬停 Sidebar 右边缘 → 显示拖拽指示条（2px 宽，高亮）
  → 用户拖拽右边缘 → Sidebar 宽度实时变化
  → 拖拽到宽度 < 80px → 自动折叠为图标模式
  → 从图标模式拖拽展开 → 超过 100px 时自动展开为完整模式
  → 支持设置最小宽度（如 180px）和最大宽度（如 400px）

卡片网格拖拽布局：
仪表板页面有多个不同尺寸的卡片（1x1, 2x1, 1x2, 2x2）
  → 用户拖拽卡片 → 卡片变为半透明幽灵元素跟随鼠标
  → 网格背景显示可放置位置的占位框（虚线边框）
  → 拖拽到合法位置 → 占位框高亮为绿色
  → 拖拽到不合法位置（空间不足）→ 占位框变红，释放后卡片弹回原位
  → 释放后 → 卡片落入新位置 → 布局数据更新 → 触发布局持久化

对话框拖拽移动：
用户按下对话框标题栏 → 光标变为 move
  → 拖拽过程中 → 对话框跟随鼠标移动
  → 支持限制在视口内（不允许拖出屏幕）
  → 释放后 → 对话框位置可选持久化（按 dialogId）
  → 按 Escape 或关闭后重新打开 → 恢复上次位置（如启用位置记忆）

拖拽视觉反馈系统：
拖拽开始 → 源元素添加 `opacity-50` 或变为半透明副本
  → 拖拽手柄区域添加 `cursor-grabbing`
  → 可放置区域添加 `border-dashed border-primary` 高亮
  → 拖拽进入可放置区域 → 区域背景轻微变色（如 `bg-primary/5`）
  → 拖拽进入不可放置区域 → 区域背景变红（`bg-destructive/5`），光标变为 `not-allowed`
  → 拖拽释放 → 所有反馈样式清除，执行放置动画
```

### 涉及的技术点

- **SortableJS**：列表排序和网格拖拽的核心库，通过 `@vueuse/integrations/useSortable` 与 Vue3 集成
- **HTML5 Drag and Drop API**：文件拖入（已存在 004）和自定义拖拽的底层 API
- **Pointer Events**：统一处理鼠标和触摸的拖拽事件（`pointerdown`/`pointermove`/`pointerup`）
- **CSS Grid / Flexbox**：卡片网格和面板分割的布局基础
- **RAF 动画**：拖拽过程中的平滑跟随使用 `requestAnimationFrame` 优化性能
- **碰撞检测**：卡片网格拖拽时的位置可用性检测（矩形碰撞+空间占用检查）

### 与现有架构的衔接方式

| 现有模块 | 衔接方式 |
|---------|---------|
| `src/components/ui/resizable/` | 扩展 ResizableHandle 样式和交互，增加双击重置、约束提示 |
| `src/components/ui/sidebar/` | Sidebar 组件集成拖拽宽度调整能力 |
| `src/components/ui/tabs/` | 与 032 可拖拽标签页共享拖拽排序实现 |
| `src/components/ui/card/` | 卡片组件添加拖拽手柄和拖拽状态样式 |
| `src/composables/useSortable.ts` | 基于 `@vueuse/integrations/useSortable` 封装的拖拽排序 composable |
| `src/utils/storage.ts` | 拖拽调整后的尺寸/位置/顺序的持久化存储 |
| `004-file-drag-drop` | 外部文件拖拽与本系统内部拖拽的区分和兼容 |

### 需要新增/修改的文件

**新增文件：**
- `src/components/drag-patterns/SortableList.vue` — 可拖拽排序列表组件
- `src/components/drag-patterns/SortableGrid.vue` — 可拖拽排序网格组件
- `src/components/drag-patterns/ResizableSidebar.vue` — 可拖拽调整宽度的侧边栏封装
- `src/components/drag-patterns/DraggableCard.vue` — 可拖拽卡片包装组件
- `src/components/drag-patterns/DragHandle.vue` — 拖拽手柄视觉组件（⋮⋮ 图标）
- `src/components/drag-patterns/DropZone.vue` — 放置区域高亮反馈组件
- `src/composables/useSortable.ts` — 基于 SortableJS 的拖拽排序封装
- `src/composables/useResizableSidebar.ts` — 侧边栏拖拽宽度逻辑 composable
- `src/composables/useDraggablePosition.ts` — 元素拖拽移动位置 composable
- `src/types/drag.ts` — 拖拽交互类型定义

**修改文件：**
- `src/components/ui/resizable/ResizableHandle.vue` — 增加悬停高亮、双击重置、拖拽提示
- `src/components/ui/sidebar/Sidebar.vue` — 可选集成拖拽宽度调整
- `src/components/ui/card/Card.vue` — 添加拖拽状态 CSS class 支持

### 核心数据结构

```typescript
// src/types/drag.ts
export interface SortableListOptions {
  items: unknown[]
  direction?: 'vertical' | 'horizontal'
  handle?: string              // CSS 选择器，如 '.drag-handle'，null 表示整项拖拽
  group?: string               // 跨列表拖拽的分组名
  animation?: number           // 排序动画毫秒，默认 150
  ghostClass?: string          // 拖拽中元素的 class
  chosenClass?: string         // 被选中的元素 class
  dragClass?: string           // 拖拽跟随元素的 class
  disabled?: boolean
  onReorder?: (items: unknown[]) => void
  onAdd?: (item: unknown, fromIndex: number, toIndex: number) => void
  onRemove?: (item: unknown, index: number) => void
}

export interface ResizableSidebarOptions {
  minWidth?: number            // 默认 180
  maxWidth?: number            // 默认 400
  collapsedWidth?: number      // 默认 60（图标模式宽度）
  collapseThreshold?: number   // 自动折叠阈值，默认 100
  defaultWidth?: number
  persistKey?: string
}

export interface GridLayoutItem {
  id: string
  x: number
  y: number
  w: number                    // 占用列数
  h: number                    // 占用行数
  component: Component
  isLocked?: boolean           // 禁止拖拽
}

export interface DraggablePositionOptions {
  initialX?: number
  initialY?: number
  boundary?: 'viewport' | 'parent' | { left: number; top: number; right: number; bottom: number }
  persistKey?: string
}
```

### 关键实现策略

1. **SortableJS 统一封装**：所有列表/网格/标签页的拖拽排序都基于 `@vueuse/integrations/useSortable` 封装，统一配置项和事件回调，避免多处重复引入 SortableJS
2. **拖拽与点击区分**：对于「整项拖拽」模式，需要区分用户的「点击」和「短距离拖拽」意图。策略：拖拽距离 < 5px 且时间 < 200ms 视为点击，不触发排序；超过阈值才激活拖拽
3. **侧边栏折叠智能阈值**：拖拽宽度进入「模糊地带」（如 80px-120px）时，释放后根据速度方向自动吸附到折叠或展开状态（类似 iOS 分屏的吸附效果）
4. **网格碰撞检测**：使用简单的矩形占用矩阵检测网格位置可用性。每个格子维护一个二维布尔矩阵，拖拽时实时计算目标位置是否与已有卡片重叠
5. **性能优化**：拖拽过程中的位置更新使用 `transform: translate3d` 而非 `top/left`，触发 GPU 加速。大量列表项（>100）时考虑虚拟滚动 + 拖拽的兼容性

## 验收标准

- [ ] 提供 `SortableList` 组件，支持垂直/水平拖拽排序，支持拖拽手柄和整项拖拽模式
- [ ] 提供 `SortableGrid` 组件，支持卡片网格拖拽重新布局，支持不同尺寸卡片
- [ ] 提供 `ResizableSidebar` 组件/能力，支持拖拽调整宽度，支持智能折叠阈值和吸附
- [ ] 提供 `useDraggablePosition()` composable，支持对话框/面板的拖拽移动和位置记忆
- [ ] ResizableHandle 支持悬停高亮、双击重置、拖拽提示
- [ ] 拖拽过程中有清晰的视觉反馈（幽灵元素、占位符、放置区域高亮）
- [ ] 支持拖拽调整后的尺寸/位置/顺序持久化到 localStorage
- [ ] 支持跨列表拖拽（如从「待办」列表拖到「已完成」列表）
- [ ] 支持禁用特定项的拖拽（`isLocked`）和禁用整个列表的拖拽
- [ ] 拖拽排序与 Vue 的响应式系统兼容，排序后数据自动同步
- [ ] 包含至少 5 个使用示例（列表排序、网格布局、侧边栏调整、面板分割、对话框移动）

## 优先级

**P1** — 拖拽交互是桌面应用区别于 Web 应用的重要特征，与现有 Resizable/Sidebar/Card 组件高度契合；SortableJS 生态成熟，实现成本可控，能显著提升模板的可定制性体验。

## 参考实现

- [SortableJS](https://sortablejs.github.io/Sortable/) — 拖拽排序核心库
- [VueUse useSortable](https://vueuse.org/integrations/useSortable/) — Vue3 集成封装
- [React Grid Layout](https://github.com/react-grid-layout/react-grid-layout) — 卡片网格拖拽布局
- [VS Code Panel Resizing](https://code.visualstudio.com/docs/getstarted/userinterface) — 面板分割和侧边栏调整
- [Figma Canvas Dragging](https://help.figma.com/hc/en-us/articles/360039957894) — 画布元素拖拽和碰撞检测
