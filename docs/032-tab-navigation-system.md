# 标签页导航系统（Tab Navigation System）

## 功能背景/动机

当前脚手架已包含 shadcn-vue 的 `Tabs` 基础组件，但仅支持静态的、不可变的标签页切换。在桌面应用中，标签页是一个复杂的导航系统——开发者需要处理动态增删标签页（如浏览器/编辑器标签）、标签页拖拽排序、标签页状态持久化、嵌套标签页、标签页溢出滚动等场景。VS Code、Chrome、Figma 等桌面工具都提供了成熟的标签页交互范式，用户对这些模式有强烈的习惯预期。提供一套完整的标签页导航系统，能让开发者快速构建类似浏览器或编辑器的多文档界面（MDI）。

## 功能描述

在现有 Tabs 组件基础上，构建面向桌面应用的多文档标签页导航系统：

1. **可关闭标签页（Closable Tabs）**：每个标签页支持独立的关闭按钮，关闭时支持「未保存更改」提示
2. **动态增删标签页（Dynamic Tabs）**：支持运行时添加新标签页（如「新建文件」），标签页列表为响应式数据驱动
3. **可拖拽排序（Draggable Tabs）**：支持通过拖拽重新排列标签页顺序，拖拽时有视觉反馈（幽灵标签、占位指示器）
4. **标签页溢出处理（Tab Overflow）**：标签页过多时支持水平滚动、下拉菜单（显示未展示的标签页列表）、或自动收缩为图标
5. **标签页状态持久化（Tab Persistence）**：应用重启后恢复上次打开的标签页列表和激活状态
6. **嵌套标签页（Nested Tabs）**：支持标签页内容区内部再嵌套子标签页，样式层级分明
7. **标签页上下文菜单（Tab Context Menu）**：右键标签页展示操作菜单（关闭、关闭其他、关闭右侧、复制、重命名）

## 目标用户

- 构建多文档界面（MDI）应用的开发者（代码编辑器、文档工具、设计工具等）
- 需要在同一窗口内管理多个视图/面板状态的开发者
- 希望提供浏览器式标签页体验的应用设计者

## 详细设计

### 交互流程

```
动态增删标签页：
用户点击「+」按钮或快捷键 ⌘T → 触发 `onAddTab()`
  → 新标签页数据推入 tabs 数组 → 自动激活新标签页
  → 新标签页标题默认为「未命名-1」，支持双击标题重命名
  → 点击标签页关闭按钮（×）→ 如标签页 dirty 状态为 true
    → 弹出 ConfirmDialog：「有未保存的更改，是否保存？」
    → 用户选择「保存并关闭」/「不保存关闭」/「取消」
  → 关闭后自动激活左侧（或右侧）标签页

可拖拽排序：
用户按下标签页 → 标签页略微上浮并添加阴影（drag start）
  → 拖拽过程中 → 在标签列表的间隙显示插入指示线（drop indicator）
  → 释放鼠标 → tabs 数组按新顺序重排
  → 触发 `onReorder(newOrder)` 事件
  → 拖拽动画使用 FLIP 技术或 CSS transition 平滑过渡
  → 不支持拖拽到其他窗口（单窗口内排序）

溢出处理：
标签页数量增加 → 超出 TabsList 可视宽度
  → 方案A：TabsList 变为可水平滚动，显示左右滚动箭头
  → 方案B：超出标签自动收缩为图标模式，悬停显示完整标题 Tooltip
  → 方案C：最右侧出现「▼」下拉按钮，列出未展示的标签页
  → 支持开发者通过 `overflowStrategy` 参数选择策略

状态持久化：
应用关闭前 → 序列化当前标签页状态：
  { activeTabId: 'tab-3', tabs: [{id, title, type, dataRef, isDirty}] }
  → 存入 localStorage 或 electron-store
  → 应用重启后 → 读取状态 → 恢复标签页列表
  → 支持 `persistKey` 参数区分不同持久化实例

标签页上下文菜单：
用户右键标签页 → 展示上下文菜单：
  - 关闭
  - 关闭其他标签页
  - 关闭右侧标签页
  - 复制标签页
  - 重命名（如标签页支持）
  - 固定标签页（pin，移到最左侧且缩小显示）
  → 菜单项与 009 右键菜单模板复用实现
```

### 涉及的技术点

- **HTML5 Drag and Drop API** 或 **@vueuse/useSortable**（基于 SortableJS）实现标签页拖拽
- **响应式数据驱动**：标签页列表用 `ref<TabItem[]>` 管理，所有操作都通过修改数组实现
- **滚动检测**：监听 TabsList 的 `scrollWidth` 与 `clientWidth` 判断是否溢出
- **FLIP 动画**：拖拽释放后的位置变化使用 First-Last-Invert-Play 动画策略实现平滑过渡
- **状态持久化**：JSON 序列化标签页元数据，复杂数据通过 `dataRef` 引用存储在 Pinia store
- **嵌套样式**：子标签页使用更小的字体、不同的背景色或缩进视觉区分层级

### 与现有架构的衔接方式

| 现有模块 | 衔接方式 |
|---------|---------|
| `src/components/ui/tabs/` | 扩展 Tabs/TabsList/TabsTrigger，增加 closable、draggable、overflow 能力 |
| `src/components/ui/tooltip/` | 收缩为图标模式的标签页悬停展示标题 |
| `src/components/ui/scroll-area/` | TabsList 溢出时的平滑滚动替代原生滚动条 |
| `src/composables/useContextMenu.ts`（009）| 标签页右键菜单复用右键菜单模板 |
| `src/composables/useConfirm.ts`（030）| 关闭 dirty 标签页时调用确认对话框 |
| `src/utils/storage.ts` | 标签页状态的 localStorage 持久化 |

### 需要新增/修改的文件

**新增文件：**
- `src/components/ui/tabs/ClosableTabs.vue` — 可关闭标签页封装组件
- `src/components/ui/tabs/DraggableTabs.vue` — 可拖拽排序标签页封装组件
- `src/components/ui/tabs/TabAddButton.vue` — 新增标签页按钮组件
- `src/components/ui/tabs/TabOverflowMenu.vue` — 溢出标签下拉菜单组件
- `src/composables/useTabState.ts` — 标签页状态管理 composable（增删改查、持久化）
- `src/composables/useTabDrag.ts` — 标签页拖拽逻辑 composable
- `src/types/tabs.ts` — 标签页导航系统类型定义

**修改文件：**
- `src/components/ui/tabs/TabsList.vue` — 支持溢出滚动和拖拽容器角色
- `src/components/ui/tabs/TabsTrigger.vue` — 支持关闭按钮、右键菜单、拖拽手柄
- `src/components/ui/tabs/index.ts` — 导出新增组件

### 核心数据结构

```typescript
// src/types/tabs.ts
export interface TabItem {
  id: string
  title: string
  icon?: string              // lucide icon name
  content?: Component
  isClosable?: boolean
  isDirty?: boolean          // 未保存更改标记
  isPinned?: boolean         // 固定标签（不可关闭，显示在最左侧）
  isLoading?: boolean        // 内容加载中
  metadata?: Record<string, unknown>
}

export interface TabNavOptions {
  tabs: TabItem[]
  activeTabId?: string
  allowAdd?: boolean
  allowClose?: boolean
  allowDrag?: boolean
  allowPin?: boolean
  overflowStrategy?: 'scroll' | 'shrink' | 'dropdown'
  persistKey?: string        // 持久化存储 key
  onAdd?: () => TabItem | Promise<TabItem>
  onClose?: (tab: TabItem) => boolean | Promise<boolean> // 返回 false 阻止关闭
  onReorder?: (tabs: TabItem[]) => void
  onTabChange?: (tabId: string) => void
}

export interface TabState {
  tabs: TabItem[]
  activeTabId: string | null
  history: string[]          // 最近访问的标签页历史，用于关闭后激活策略
}
```

### 关键实现策略

1. **拖拽实现选择**：使用 `@vueuse/integrations/useSortable`（基于 SortableJS）而非 HTML5 DnD，因为 SortableJS 提供了更好的动画支持和跨浏览器兼容性，且与 Vue 的响应式数组天然契合
2. **关闭激活策略**：关闭当前激活标签页时，优先激活左侧标签页；如关闭的是最左侧，则激活新的最左侧（原第二个）。通过 `history` 数组记录访问顺序，支持「回到上次访问」策略
3. **持久化安全**：只持久化标签页的元数据（id、title、icon、isPinned），不持久化 `content` 组件引用。应用重启后根据 `metadata` 重新创建内容组件
4. **Pin 标签页逻辑**：pinned 标签始终位于列表最左侧，不参与拖拽排序（或仅在 pinned 区域内部排序），关闭按钮隐藏，显示为紧凑模式
5. **dirty 状态拦截**：标签页 `isDirty = true` 时，关闭按钮显示未保存指示器（圆点或颜色变化），点击关闭触发确认流程

## 验收标准

- [ ] 提供 `ClosableTabs` 组件，每个标签支持独立关闭，关闭前支持拦截确认
- [ ] 提供 `DraggableTabs` 组件，支持拖拽排序，有视觉反馈和动画过渡
- [ ] 支持动态添加标签页（`+` 按钮或 API 调用），新标签自动激活
- [ ] 标签页溢出时支持水平滚动、收缩为图标、或下拉菜单三种策略
- [ ] 支持标签页状态持久化，应用重启后恢复标签列表和激活状态
- [ ] 支持标签页右键菜单（关闭、关闭其他、关闭右侧、复制、重命名、固定）
- [ ] 支持固定标签页（pin），固定标签位于最左侧且不参与常规关闭
- [ ] 支持未保存更改标记（dirty state）和关闭确认
- [ ] 支持嵌套标签页，子标签页视觉层级分明
- [ ] 提供 `useTabState()` composable，支持响应式标签管理和持久化
- [ ] 包含至少 4 个使用示例（可关闭、可拖拽、动态增删、状态持久化）

## 优先级

**P1** — 标签页导航是多文档桌面应用的核心模式，与现有 Tabs 组件高度契合；实现成本中等，但能显著扩展模板对复杂应用场景的支持。

## 参考实现

- [VS Code Tabs](https://code.visualstudio.com/docs/getstarted/userinterface) — 编辑器标签页的行业标杆
- [Chrome Browser Tabs](https://www.google.com/chrome/) — 拖拽排序、关闭策略、固定标签
- [Ant Design Tabs](https://ant.design/components/tabs) — 动态增删、可关闭、可拖拽（pro 组件）
- [SortableJS Vue](https://sortablejs.github.io/vue.draggable.next/) — Vue3 拖拽排序实现
