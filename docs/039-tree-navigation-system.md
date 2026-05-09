# 树形导航与多级菜单系统（Tree Navigation & Multi-level Menu System）

## 功能背景/动机

当前脚手架已包含 `Sidebar`、`NavigationMenu`、`Menubar` 等导航组件，以及 032 的标签页导航和 037 的面包屑导航，但缺少**树形导航（Tree View）**这一桌面应用极为常见的导航组件。文件资源管理器、项目结构浏览、组织架构图、分类目录管理等场景都依赖树形控件。目前项目中没有 Tree 相关组件，这是一个明显的空白。树形导航不仅需要展示层级结构，更需要支持展开/折叠、选中、多选、拖拽排序、懒加载、搜索过滤、键盘导航等复杂交互。提供一套完整的树形导航系统，能填补模板在层级数据展示方面的空白。

## 功能描述

构建一套面向桌面应用的树形导航与多级菜单系统：

1. **基础树形组件（Tree View）**：支持无限层级嵌套，节点可展开/折叠，支持节点图标、徽标、禁用状态
2. **树节点选择模式（Tree Selection）**：支持单选、多选（Checkbox）、级联选择（父节点选中自动选中所有子节点）
3. **可拖拽排序的树（Draggable Tree）**：支持拖拽节点重新排序、移动到不同父节点下，支持拖拽时的视觉反馈（占位线、禁止放置提示）
4. **懒加载与虚拟化树（Lazy & Virtual Tree）**：支持异步加载子节点（点击展开时加载），支持大量节点时的虚拟滚动渲染
5. **树形搜索与过滤（Tree Search & Filter）**：支持对树节点进行关键词搜索，匹配节点自动展开并高亮，支持仅显示匹配路径（过滤模式）
6. **树与多级菜单联动（Tree-to-Menu Bridge）**：树形数据可同步渲染为 DropdownMenu/Menubar 的级联菜单结构，数据源共享

## 目标用户

- 构建文件资源管理器、项目浏览器、分类管理器的开发者
- 需要展示组织架构、目录结构、层级配置的应用设计者
- 希望树形导航与现有菜单系统共享数据源的开发者

## 详细设计

### 交互流程

```
基础树形展示：
侧边栏或主内容区展示树形结构：
  → 根节点「工作区」
    → 子节点「项目 A」（可展开）
      → 子节点「src」（可展开）
        → 叶节点「main.ts」（不可展开）
      → 子节点「docs」
    → 子节点「项目 B」
  → 节点左侧有展开/折叠箭头（▶ / ▼）
  → 节点有图标（文件夹/文件图标）
  → 叶节点无展开箭头
  → 点击节点名称 → 选中该节点（高亮）→ 触发 onSelect
  → 点击展开箭头 → 展开/折叠子节点 → 不触发选中

树节点选择：
单选模式：
  → 点击「项目 A」→ 「项目 A」高亮 → 其他节点取消高亮
  → 支持 `v-model:selectedKey`

多选模式（Checkbox）：
  → 每个节点前有 Checkbox
  → 勾选「src」文件夹 → 自动勾选其下所有子节点（main.ts、utils.ts）
  → 子节点部分勾选（如只选了 main.ts）→ 父节点 Checkbox 显示 indeterminate 状态
  → 支持 `v-model:selectedKeys`（Set<string>）
  → 支持「仅选择叶节点」模式（选中父节点时只记录叶节点 key）

可拖拽排序：
用户按下「docs」节点 → 节点变为半透明拖拽状态
  → 拖拽到「项目 A」和「项目 B」之间 → 显示水平插入线
  → 拖拽到「项目 B」上方停留 → 「项目 B」高亮为可放入状态
  → 释放 → 「docs」变为「项目 B」的同级前一项
  → 拖拽到「src」文件夹上方 → 「src」自动展开（延迟 800ms）→ 显示为可放入子级
  → 支持禁止拖拽的节点（isDraggable=false）和禁止放入的区域（isDroppable=false）
  → 与 034 的 `useSortable` 共享拖拽实现，配置 `nested: true`

懒加载：
用户点击「远程目录」节点的展开箭头 → 节点右侧显示微小 Spinner
  → 触发 `onLoadChildren(node)` → 异步获取子节点数据
  → 加载成功 → 子节点追加到树中 → 节点展开
  → 加载失败 → 显示错误图标 → 点击重试
  → 已加载过的节点再次折叠/展开不再重复加载（缓存策略）
  → 支持「预加载」：鼠标悬停可展开节点 500ms 后自动预加载子节点

搜索过滤：
用户在树上方搜索框输入「main」
  → 遍历所有节点标题匹配「main」
  → 匹配节点「main.ts」自动展开其所有父级路径（工作区 > 项目 A > src）
  → 匹配文本高亮显示（如 "<mark>main</mark>.ts"）
  → 过滤模式：仅展示匹配节点及其父级路径，隐藏不相关分支
  → 清除搜索 → 恢复原始展开/折叠状态
  → 支持模糊匹配和拼音匹配（可选）

键盘导航：
用户聚焦树组件 → 第一个可见节点获得焦点
  → ↓ → 移动到下一个可见节点
  → ↑ → 移动到上一个可见节点
  → → → 展开当前节点（如已展开则移动到第一个子节点）
  → ← → 折叠当前节点（如已折叠则移动到父节点）
  → Enter → 选中当前节点并触发 onSelect
  → Space → 切换展开/折叠（或切换 Checkbox 勾选）
  → 输入字母 → 快速定位到以该字母开头的下一个节点

树与菜单联动：
树形数据源：[{ label, children, action }]
  → 同时渲染为 Sidebar 中的 TreeView
  → 同时渲染为 Menubar 中的级联菜单（Menu > Submenu > Item）
  → 数据源共享，操作回调共享
  → 在 TreeView 中点击和在 Menu 中点击执行相同的 action
```

### 涉及的技术点

- **递归组件渲染**：TreeNode 组件递归调用自身渲染子节点，通过 `level` prop 控制缩进
- **扁平化遍历**：为支持键盘导航和虚拟滚动，将嵌套树结构扁平化为可见节点数组
- **Checkbox 级联状态计算**：使用递归算法计算父节点的 checked/indeterminate 状态
- **SortableJS 嵌套拖拽**：配置 `nested: true` 和 `onMove` 回调限制拖拽行为
- **虚拟滚动**：对扁平化后的可见节点数组使用 `RecycleScroller`，仅渲染可视区域

### 与现有架构的衔接方式

| 现有模块 | 衔接方式 |
|---------|---------|
| `src/components/ui/collapsible/` | 树节点的展开/折叠使用 Collapsible 组件 |
| `src/components/ui/checkbox/` | 多选树的 Checkbox 组件 |
| `src/components/ui/sidebar/` | 树形导航可嵌入 Sidebar 作为目录/文件浏览器 |
| `src/components/ui/dropdown-menu/` | 树与菜单联动时渲染为级联菜单 |
| `src/composables/useSortable.ts`（034）| 树节点拖拽排序复用 SortableJS 封装 |
| `src/components/VirtualScroller.vue` | 大数据量树的虚拟滚动渲染 |
| `src/utils/storage.ts` | 树的展开状态持久化 |

### 需要新增/修改的文件

**新增文件：**
- `src/components/ui/tree/Tree.vue` — 树形组件根容器
- `src/components/ui/tree/TreeItem.vue` — 树节点项组件（递归渲染）
- `src/components/ui/tree/TreeCheckbox.vue` — 树节点 Checkbox（级联状态）
- `src/components/ui/tree/index.ts` — 树组件导出
- `src/components/tree-patterns/DraggableTree.vue` — 可拖拽排序树封装
- `src/components/tree-patterns/SearchableTree.vue` — 可搜索过滤树封装
- `src/components/tree-patterns/LazyTree.vue` — 懒加载树封装
- `src/composables/useTreeState.ts` — 树状态管理 composable（展开/选中/过滤）
- `src/composables/useTreeSelection.ts` — 树选择逻辑 composable（单选/多选/级联）
- `src/composables/useTreeDrag.ts` — 树拖拽排序 composable
- `src/utils/tree.ts` — 树形数据工具函数（扁平化、查找、过滤、遍历）
- `src/types/tree.ts` — 树形导航系统类型定义

**修改文件：**
- `src/components/ui/index.ts` — 导出新增的树组件
- `src/components/Sidebar.vue` — 可选接入树形导航作为文件/目录浏览器

### 核心数据结构

```typescript
// src/types/tree.ts
export interface TreeNode {
  id: string
  label: string
  icon?: string
  children?: TreeNode[]
  disabled?: boolean
  draggable?: boolean
  droppable?: boolean
  checked?: boolean             // 多选模式用
  indeterminate?: boolean       // 多选模式用
  isLeaf?: boolean              // 是否为叶节点（影响展开箭头显示）
  badge?: string | number       // 右侧徽标
  metadata?: Record<string, unknown>
}

export type TreeSelectionMode = 'single' | 'multiple' | 'none'

export interface TreeOptions {
  nodes: TreeNode[]
  selectionMode?: TreeSelectionMode
  defaultExpandedKeys?: string[]
  defaultSelectedKeys?: string[]
  checkStrictly?: boolean       // true = 不级联，false = 级联选择
  draggable?: boolean
  lazy?: boolean
  virtual?: boolean             // 是否启用虚拟滚动
  itemHeight?: number           // 虚拟滚动的固定行高
  searchDebounce?: number       // 搜索防抖（ms）
  persistKey?: string           // 展开状态持久化 key
}

export interface TreeDragInfo {
  draggedNode: TreeNode
  sourceParent: TreeNode | null
  sourceIndex: number
  targetParent: TreeNode | null
  targetIndex: number
  position: 'before' | 'after' | 'inside'  // 放置位置
}

export interface TreeSearchResult {
  node: TreeNode
  matches: { start: number; end: number }[]
  path: TreeNode[]             // 从根到该节点的路径
}
```

### 关键实现策略

1. **扁平化与虚拟滚动**：将嵌套的 `TreeNode[]` 实时扁平化为 `VisibleNode[]`（只包含展开路径上的节点），传入 `RecycleScroller`。节点展开/折叠时重新计算扁平数组，虚拟滚动自动适应
2. **级联选择算法**：多选模式下，子节点变化时向上递归更新父节点状态：所有子节点 checked → 父节点 checked；部分子节点 checked → 父节点 indeterminate；无子节点 checked → 父节点 unchecked。使用后序遍历实现
3. **拖拽放置检测**：SortableJS 配置 `onMove` 回调，根据拖拽目标位置判断放置关系：
   - 放在节点上方 → `position: 'before'`（成为同级前一项）
   - 放在节点下方 → `position: 'after'`（成为同级后一项）
   - 放在节点内部（停留 800ms 自动展开后）→ `position: 'inside'`（成为子节点最后一项）
4. **懒加载缓存**：使用 `Map<nodeId, boolean>` 记录已加载的节点，避免重复加载。支持 `refreshNode(nodeId)` API 强制刷新某节点的子节点
5. **键盘导航的可见节点遍历**：维护一个 `visibleNodes` 计算属性（扁平化+过滤后的可见节点数组），键盘 ↑↓ 在这个数组的索引间移动，而不是递归遍历树结构，确保性能稳定

## 验收标准

- [ ] 提供 `Tree`/`TreeItem` 组件，支持无限层级嵌套，节点可展开/折叠
- [ ] 支持单选、多选（Checkbox）、级联选择三种选择模式
- [ ] 提供 `DraggableTree` 组件，支持拖拽排序和跨父节点移动
- [ ] 提供 `LazyTree` 组件，支持异步加载子节点和加载状态指示
- [ ] 提供 `SearchableTree` 组件，支持关键词搜索、自动展开匹配路径、高亮匹配文本
- [ ] 大数据量（>1000 节点）时支持虚拟滚动，保持流畅
- [ ] 支持完整的键盘导航（方向键、Enter、Space、字母快速定位）
- [ ] 支持展开状态持久化到 localStorage
- [ ] 支持树形数据同步渲染为 DropdownMenu/Menubar 的级联菜单
- [ ] 提供树形数据工具函数（扁平化、查找、过滤、遍历、路径计算）
- [ ] 包含至少 5 个使用示例（基础树、多选、拖拽、懒加载、搜索过滤）

## 优先级

**P0** — 树形导航是桌面应用（尤其是文件管理、项目浏览类应用）的核心缺失组件，目前项目中完全没有 Tree 相关实现；填补这一空白能显著扩展模板对专业工具类应用的支持。

## 参考实现

- [Radix Tree](https://www.radix-ui.com/primitives/docs/components/tree) — 树形组件无障碍实现
- [VS Code Explorer Tree](https://code.visualstudio.com/docs/getstarted/userinterface) — 文件资源管理器树（拖拽、懒加载、搜索的行业标杆）
- [Ant Design Tree](https://ant.design/components/tree) — 多选、拖拽、搜索过滤的完整实现
- [React Arborist](https://github.com/brimdata/react-arborist) — 可拖拽排序的树形组件
- [El-Tree (Element Plus)](https://element-plus.org/en-US/component/tree.html) — Vue 生态成熟树组件参考
