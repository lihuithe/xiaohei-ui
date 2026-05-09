# 数据展示交互模式（Data Display Interaction Patterns）

## 功能背景/动机

当前脚手架已包含 `Table`、`VirtualScroller`、`Pagination` 等数据展示组件，以及 `105-loading-empty-error-state-system` 处理状态展示。但这些组件以原子形式存在，缺少面向桌面应用数据密集型场景的**交互模式系统**——如表格行内编辑、列宽拖拽调整、列显示隐藏配置、虚拟列表的选中与滚动定位、无限滚动加载、卡片悬停操作面板等。在桌面应用中，用户期望数据展示不仅是「看」，更是「直接操作」。提供一套完整的数据展示交互模式，能让开发者快速构建类 Excel、数据库管理工具、数据看板等专业界面。

## 功能描述

在现有 Table/VirtualScroller/Pagination 基础上，构建数据展示交互模式系统：

1. **表格行内编辑模式（Inline Table Editing）**：表格单元格支持单击/双击进入编辑模式，支持输入框、下拉框、日期选择器等编辑类型，支持整行编辑和批量保存
2. **表格列自定义模式（Column Customization）**：支持拖拽调整列宽、拖拽重排列顺序、通过下拉菜单显示/隐藏列、列宽持久化
3. **虚拟列表增强模式（Virtual List Enhancement）**：在现有 VirtualScroller 基础上增加选中状态管理、滚动到指定项、动态项高度、锚定滚动（stick to bottom）
4. **无限滚动与分页混合模式（Infinite Scroll + Pagination）**：支持「滚动到底部自动加载更多」和「传统分页器」两种模式切换，支持加载状态指示和「没有更多数据」提示
5. **卡片悬停操作模式（Card Hover Actions）**：数据卡片悬停时展示操作按钮组（编辑、删除、更多），支持操作面板的延迟显示（防误触）和键盘快捷操作

## 目标用户

- 构建数据管理后台、配置表格、数据看板的开发者
- 需要处理大量数据列表（千行以上）并保持流畅交互的开发者
- 希望提供类 Excel / Notion / Airtable 数据操作体验的应用设计者

## 详细设计

### 交互流程

```
表格行内编辑：
用户双击表格单元格 → 单元格变为编辑模式
  → 文本类型：显示 Input 输入框，内容全选，可直接输入
  → 枚举类型：显示 Select 下拉框，下拉选项展开
  → 日期类型：显示 DatePicker，弹出日历面板
  → 按 Enter → 保存当前单元格 → 自动移动到右侧单元格继续编辑
  → 按 Tab → 保存并移动到右侧单元格
  → 按 Shift+Tab → 保存并移动到左侧单元格
  → 按 Escape → 取消编辑，恢复原始值
  → 按 ↓ → 保存并移动到下方单元格
  → 点击其他单元格 → 保存当前，进入新单元格编辑
  → 整行进入编辑模式：行首显示「保存」「取消」按钮，所有单元格同时可编辑
  → 批量保存：修改多行后统一点击「保存所有更改」

表格列自定义：
用户拖拽表格列头右侧边框 → 光标变为 col-resize → 实时调整列宽
  → 释放后列宽按 tableId 存入 localStorage
  → 用户拖拽列头 → 列头变为拖拽状态 → 释放后调整列顺序
  → 点击列头右侧的「⚙️」按钮 → 下拉菜单显示所有列的显示/隐藏复选框
    → 勾选/取消勾选 → 实时显示/隐藏对应列
    → 支持「恢复默认列设置」
  → 支持固定列（pinned column）：左侧固定列不参与横向滚动

虚拟列表增强：
列表有 10,000 条数据 → 使用 VirtualScroller 仅渲染可视区域
  → 用户点击某行 → 该行高亮为选中状态（支持单选/多选/全选）
  → 用户按 ⌘+F 搜索 → 匹配项自动滚动到可视区域并高亮
  → 程序触发 `scrollToItem(itemId)` → 平滑滚动到指定项并高亮
  → 聊天/日志场景：开启 `stickToBottom` → 新数据追加时自动滚动到底部
    → 用户手动向上滚动查看历史 → 自动取消 stickToBottom
    → 用户滚回底部 → 自动恢复 stickToBottom
  → 支持动态项高度：根据内容自动计算每行高度，无需固定 itemSize

无限滚动与分页：
模式A - 无限滚动：
  用户滚动列表 → 接近底部（距离底部 200px）→ 自动触发加载更多
    → 底部显示加载中 Spinner → 新数据追加到列表
    → 没有更多数据时 → 底部显示「已加载全部数据」提示
    → 加载失败时 → 底部显示「加载失败，点击重试」
  
模式B - 分页器：
  列表底部显示分页栏：「< 1 2 3 ... 10 >」
    → 支持快速跳转输入框
    → 支持每页条数选择（20/50/100）
    → 支持「跳转到首页/末页」
  
模式切换：
  用户可在设置中切换两种模式 → 切换后列表状态重置
  → 分页模式下页码变化时 URL 同步更新（`?page=2&size=50`）

卡片悬停操作：
用户鼠标悬停数据卡片 → 卡片轻微上浮（shadow 增强）
  → 延迟 200ms 后（防误触）→ 操作面板滑入显示
    → 操作按钮：编辑、删除、收藏、更多（⋮）
    → 操作面板位于卡片右上角或底部
  → 鼠标快速掠过（< 200ms）→ 不显示操作面板
  → 操作面板显示后鼠标移入面板区域 → 面板保持显示
  → 键盘导航：Tab 聚焦到卡片 → 显示操作面板 → Enter 执行主操作
  → 支持批量操作：多选卡片后，顶部显示浮动操作栏（「删除所选 3 项」）
```

### 涉及的技术点

- **行内编辑状态管理**：每行的编辑状态用 `Map<rowId, EditState>` 管理，支持整行和单元格级两种粒度
- **列宽拖拽实现**：使用原生 `mousedown`/`mousemove` 事件，记录起始位置和列初始宽度，实时计算新宽度
- **虚拟滚动优化**：`vue-virtual-scroller` 的 `RecycleScroller` 已集成，需扩展选中状态同步和动态高度支持
- **Intersection Observer**：无限滚动的底部检测，比 scroll 事件性能更好
- **防抖加载**：无限滚动触发加载时使用 `useDebounce` 避免重复请求

### 与现有架构的衔接方式

| 现有模块 | 衔接方式 |
|---------|---------|
| `src/components/ui/table/` | 扩展 TableCell/TableHead 支持编辑模式和列宽拖拽 |
| `src/components/VirtualScroller.vue` | 扩展开支持选中、滚动定位、动态高度、锚定 |
| `src/components/ui/pagination/` | 分页器模式复用现有 Pagination 组件 |
| `src/components/ui/card/` | 卡片悬停操作模式复用 Card 组件 |
| `src/components/ui/input/`、`select/`、`calendar/` | 行内编辑的输入组件 |
| `src/composables/useLazyLoad.ts` | 无限滚动的懒加载逻辑复用 |
| `src/utils/storage.ts` | 列宽、列顺序、列显示隐藏的持久化 |

### 需要新增/修改的文件

**新增文件：**
- `src/components/data-display-patterns/InlineEditTable.vue` — 行内编辑表格封装
- `src/components/data-display-patterns/DraggableColumnHeader.vue` — 可拖拽调整列宽的表头组件
- `src/components/data-display-patterns/ColumnVisibilityMenu.vue` — 列显示/隐藏配置菜单组件
- `src/components/data-display-patterns/InfiniteScrollList.vue` — 无限滚动列表封装
- `src/components/data-display-patterns/CardWithActions.vue` — 带悬停操作的卡片组件
- `src/composables/useInlineEdit.ts` — 行内编辑逻辑 composable
- `src/composables/useColumnResize.ts` — 列宽拖拽调整 composable
- `src/composables/useInfiniteScroll.ts` — 无限滚动逻辑 composable
- `src/composables/useVirtualSelection.ts` — 虚拟列表选中状态管理 composable
- `src/types/data-display.ts` — 数据展示交互类型定义

**修改文件：**
- `src/components/ui/table/TableHead.vue` — 支持列宽拖拽手柄和列顺序拖拽
- `src/components/ui/table/TableCell.vue` — 支持行内编辑状态
- `src/components/VirtualScroller.vue` — 扩展选中、滚动定位、动态高度

### 核心数据结构

```typescript
// src/types/data-display.ts
export type EditCellType = 'text' | 'number' | 'select' | 'date' | 'checkbox'

export interface EditColumnDef {
  key: string
  title: string
  type: EditCellType
  editable?: boolean
  options?: { label: string; value: unknown }[]  // select 类型用
  validation?: (value: unknown) => string | undefined
  width?: number
  minWidth?: number
  maxWidth?: number
  visible?: boolean
  pinned?: 'left' | 'right' | false
}

export interface InlineEditState {
  rowId: string
  cellKey?: string              // null 表示整行编辑
  originalValue: unknown
  draftValue: unknown
  isDirty: boolean
  error?: string
}

export interface InfiniteScrollOptions {
  threshold?: number            // 触发加载的距离阈值（px），默认 200
  pageSize?: number             // 每页条数，默认 20
  initialPage?: number
  hasMore: boolean | Ref<boolean>
  onLoadMore: (page: number) => Promise<unknown[]>
  errorRetry?: boolean          // 加载失败是否显示重试
}

export interface VirtualListOptions {
  items: unknown[]
  itemSize?: number             // 固定高度模式
  itemSizeGetter?: (item: unknown, index: number) => number  // 动态高度
  selectedKeys?: Set<string>
  selectionMode?: 'none' | 'single' | 'multiple'
  stickToBottom?: boolean
  onSelectionChange?: (keys: Set<string>) => void
}

export interface CardAction {
  label: string
  icon?: string
  shortcut?: string
  danger?: boolean
  action: (card: unknown) => void
}
```

### 关键实现策略

1. **行内编辑的键盘导航**：编辑模式下监听 `keydown`，Enter/Tab 保存并移动，Escape 取消，方向键在单元格间导航。使用 `event.stopPropagation()` 防止表格级快捷键冲突
2. **列宽拖拽的原生实现**：不使用第三方库，直接在 TableHead 上绑定 `mousedown`，在 `document` 上监听 `mousemove` 和 `mouseup`，实现更轻量且与表格结构紧耦合的拖拽。列宽变化时同步更新 `<col>` 元素的 `width` 样式
3. **虚拟列表的动态高度**：对 `vue-virtual-scroller` 的 `RecycleScroller` 传入 `item-size` 函数替代固定数值，组件挂载后测量实际 DOM 高度并缓存。适用于行高不固定的场景（如多行文本、可变内容）
4. **无限滚动的加载锁**：使用 `isLoading` 状态锁防止重复触发加载，只有上一次加载完成后才允许再次触发。加载失败时展示错误占位块，点击后重试
5. **卡片批量操作**：多选模式下，选中项超过 1 个时顶部显示浮动操作栏（`position: fixed`），与 034 的拖拽模式联动支持「多选后拖拽到目标区域执行批量操作」

## 验收标准

- [ ] 提供 `InlineEditTable` 组件，支持单击/双击进入单元格编辑，支持多种编辑类型
- [ ] 行内编辑支持键盘导航（Enter/Tab/Escape/方向键）和整行批量编辑
- [ ] 支持拖拽调整列宽，列宽按 tableId 持久化到 localStorage
- [ ] 支持拖拽重排列顺序和通过菜单显示/隐藏列
- [ ] 支持固定列（pinned），固定列不参与横向滚动
- [ ] 提供 `InfiniteScrollList` 组件，支持滚动到底部自动加载和「没有更多」提示
- [ ] 提供分页器模式，支持页码跳转、每页条数选择和 URL 同步
- [ ] 虚拟列表支持选中状态管理、滚动到指定项、动态项高度、锚定底部
- [ ] 提供 `CardWithActions` 组件，支持悬停延迟显示操作面板和批量操作
- [ ] 包含至少 5 个使用示例（行内编辑、列自定义、虚拟列表、无限滚动、卡片悬停）

## 优先级

**P1** — 数据展示是桌面应用最核心的功能场景之一，与现有 Table/VirtualScroller/Pagination 高度契合；行内编辑和列自定义是专业数据工具的标配模式。

## 参考实现

- [AG Grid](https://www.ag-grid.com/) — 企业级表格（行内编辑、列调整、固定列的行业标杆）
- [Notion Database](https://www.notion.so/) — 行内编辑和悬停操作的交互参考
- [Airtable](https://airtable.com/) — 类 Excel 的数据表格体验
- [React Virtualized](https://github.com/bvaughn/react-virtualized) — 虚拟列表实现参考
- [Ant Design Table](https://ant.design/components/table) — 列自定义和分页模式
