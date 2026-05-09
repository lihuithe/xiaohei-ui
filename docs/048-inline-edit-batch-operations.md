# 内联编辑与批量操作模式（Inline Edit & Batch Operation Patterns）

## 功能背景/动机

当前脚手架的 038 号「数据展示交互模式」已经覆盖了表格行内编辑的基础交互，但缺少面向桌面应用更通用的**内联编辑模式系统**——不仅限于表格，还包括卡片内编辑、列表项内编辑、属性面板内编辑等场景。同时，批量操作（多选后统一操作）是桌面应用数据管理的核心能力（如文件管理器的多选删除、邮件客户端的批量归档），目前项目中没有任何批量操作的封装。提供一套完整的内联编辑与批量操作模式系统，能让开发者在任何数据展示场景下快速实现「直接操作」和「批量处理」能力。

## 功能描述

构建覆盖桌面应用常见内联编辑和批量操作场景的交互模式系统：

1. **通用内联编辑模式（Universal Inline Edit）**：不仅限于表格单元格，支持卡片标题、列表项文本、属性面板字段的内联编辑，支持单击/双击/点击编辑图标三种触发方式
2. **批量选择模式（Batch Selection）**：支持列表/表格/卡片的多选（Checkbox、⌘+点击多选、Shift+连续选择、全选/反选），选择时显示浮动操作工具栏
3. **浮动操作工具栏（Floating Action Toolbar）**：多选后自动出现的浮动工具栏，展示可用的批量操作（删除、移动、归档、导出等），支持操作数量提示
4. **批量操作预览与差异对比（Batch Preview & Diff）**：批量修改前展示变更预览（如「将 5 个项目的优先级改为『高』」），支持差异对比和逐项确认/排除
5. **拖拽多选与范围选择（Drag Selection & Range Select）**：支持鼠标拖拽框选多个项目（类似桌面文件管理器），支持 Shift+点击进行范围选择

## 目标用户

- 构建文件管理器、邮件客户端、任务管理、数据表格等需要批量处理数据的开发者
- 需要支持用户在任意界面元素上直接编辑的开发者
- 希望提供类操作系统文件管理器级批量操作体验的开发者

## 详细设计

### 交互流程

```
通用内联编辑：

场景A - 卡片标题编辑：
  用户鼠标悬停卡片标题 → 标题右侧出现「编辑」铅笔图标
  → 点击铅笔图标 → 标题变为输入框，原文字全选
  → 用户输入新标题 → 按 Enter → 保存 → 输入框变回文本
  → 按 Escape → 取消编辑 → 恢复原文字
  → 失去焦点 → 自动保存（可配置为保存或取消）
  → 保存时显示微小加载 Spinner → 保存失败 → 恢复输入框并显示错误

场景B - 列表项文本编辑：
  用户双击列表项名称 → 该项变为编辑模式
  → 输入框宽度自适应文本长度
  → 输入框下方显示「按 Enter 保存，按 Esc 取消」提示
  → 支持多行文本编辑（Textarea 自动增高）

场景C - 属性面板字段编辑：
  用户在属性面板看到「优先级：中」
  → 点击「中」→ 文本变为下拉选择框
  → 选择「高」→ 自动保存 → 下拉框变回文本「高」
  → 无需确认按钮，选择即生效（适合配置项修改）

触发方式配置：
  → `trigger: 'click'`：单击进入编辑（适合明确可编辑的字段）
  → `trigger: 'double-click'`：双击进入编辑（适合以防误触）
  → `trigger: 'icon'`：点击编辑图标进入编辑（最保守，明确意图）
  → `trigger: 'hover'`：悬停显示编辑区域（适合快速修改）

批量选择：

基础多选：
  列表每行左侧有 Checkbox → 勾选即选中
  → 表头 Checkbox → 点击全选当前页 → 再次点击取消全选
  → 支持「选中全部 N 项」（跨页全选）

快捷键多选：
  → ⌘+点击 → 切换单个项的选中状态（追加/移除）
  → Shift+点击 → 选中两次点击之间的所有项（连续范围选择）
  → ⌘+A → 全选当前可见项
  → Escape → 取消所有选择

拖拽框选：
  → 用户在空白处按下鼠标 → 拖拽出现半透明选择框
  → 框选覆盖的项目自动被选中
  → 支持 ⌘+框选 → 追加选择（不取消之前选中的）
  → 支持  Shift+框选 → 范围选择
  → 框选过程中实时显示已选中数量
  → 释放鼠标 → 选择框消失，选中状态保留

浮动操作工具栏：
  用户选中 3 个项目 → 底部/顶部浮出操作工具栏
  → 位置策略：
    → 固定顶部：选中后顶部出现固定操作栏
    → 浮动底部：选中后底部中心浮出操作卡片
    → 上下文浮动：跟随鼠标位置或列表边缘
  → 工具栏内容：
    → 左侧：「已选择 3 项」
    → 中间：可用操作按钮（删除、移动、归档、导出、标签）
    → 右侧：「取消选择」
  → 操作按钮根据选择内容动态可用：
    → 选中项包含不可删除项 → 「删除」按钮禁用并 Tooltip 说明原因
    → 选中项跨不同类型 → 仅展示通用操作
  → 点击操作 → 如有必要弹出批量确认（047）→ 执行操作
  → 操作完成后 → 工具栏自动消失 → 显示结果 Toast

批量操作预览：
  用户选中 5 个项目 → 点击「修改优先级」→ 选择「高」
  → 弹出预览对话框：「即将修改 5 个项目的优先级为『高』」
  → 列出受影响项目（前 3 项 + 「及另外 2 项」）
  → 每项显示当前值和新值的对比：
    → 项目 A：优先级 中 → 高
    → 项目 B：优先级 低 → 高
    → 项目 C：优先级 无 → 高
  → 支持排除某项（该项保持原值）
  → 显示「5 项中 4 项将被修改（已排除 1 项）」
  → 点击「确认修改 4 项」→ 执行批量更新
  → 显示进度 → 完成后显示「已成功修改 4 项」[查看详情]

拖拽多选与范围选择：
  卡片网格布局下：
    → 用户从空白处拖拽 → 出现选择框
    → 框选多个卡片 → 卡片高亮为选中状态
    → 支持 ⌘+拖拽 → 追加框选
    → 选中的卡片可被整体拖拽移动（与 034 拖拽联动）
  
  列表布局下：
    → Shift+点击第 2 项 → 再 Shift+点击第 8 项
    → 第 2-8 项全部选中
    → 再次 Shift+点击 → 更新范围边界
```

### 涉及的技术点

- **多选状态管理**：`Set<string>` 存储选中项 ID，支持追加、移除、切换、范围选择
- **拖拽框选算法**：监听 `mousedown`/`mousemove`/`mouseup`，计算选择框与项目元素的矩形碰撞（`getBoundingClientRect` 对比）
- **内联编辑的焦点管理**：编辑模式切换时的焦点转移（进入编辑聚焦输入框，退出恢复原文本焦点），与 031 焦点管理系统联动
- **浮动工具栏定位**：根据选择区域和视口空间计算工具栏最佳位置（顶部优先，空间不足时放底部）

### 与现有架构的衔接方式

| 现有模块 | 衔接方式 |
|---------|---------|
| `src/components/ui/table/` | 表格批量选择 Checkbox 列 |
| `src/components/ui/card/` | 卡片内联编辑和框选 |
| `src/components/ui/checkbox/` | 多选 Checkbox |
| `src/components/ui/button/` | 浮动工具栏操作按钮 |
| `src/components/ui/input/`、`select/` | 内联编辑的输入组件 |
| `034-drag-interaction-patterns` | 拖拽框选和批量拖拽移动 |
| `047-confirmation-undo-patterns` | 批量操作的确认和撤销 |
| `046-toast-feedback-patterns` | 批量操作的结果反馈 |
| `038-data-display-interaction-patterns` | 表格行内编辑复用 |

### 需要新增/修改的文件

**新增文件：**
- `src/components/batch-patterns/InlineEdit.vue` — 通用内联编辑组件
- `src/components/batch-patterns/BatchSelector.vue` — 批量选择控制器组件
- `src/components/batch-patterns/FloatingActionToolbar.vue` — 浮动操作工具栏组件
- `src/components/batch-patterns/BatchPreviewDialog.vue` — 批量操作预览对话框
- `src/components/batch-patterns/DragSelectionBox.vue` — 拖拽选择框组件
- `src/composables/useInlineEdit.ts` — 内联编辑逻辑 composable
- `src/composables/useBatchSelection.ts` — 批量选择逻辑 composable
- `src/composables/useDragSelection.ts` — 拖拽框选逻辑 composable
- `src/types/batch.ts` — 内联编辑与批量操作类型定义

**修改文件：**
- `src/components/ui/table/TableRow.vue` — 支持选中状态样式
- `src/components/ui/card/Card.vue` — 支持选中状态样式和编辑模式

### 核心数据结构

```typescript
// src/types/batch.ts
export type InlineEditTrigger = 'click' | 'double-click' | 'icon' | 'hover'

export interface InlineEditOptions {
  modelValue: string
  trigger?: InlineEditTrigger
  type?: 'text' | 'textarea' | 'select' | 'number'
  options?: { label: string; value: string }[]  // select 用
  autoSave?: boolean            // 失去焦点是否自动保存
  confirmOnEnter?: boolean
  cancelOnEscape?: boolean
  loading?: boolean
  validation?: (value: string) => string | undefined
  onSave: (value: string) => void | Promise<void>
}

export interface BatchSelectionOptions {
  items: Array<{ id: string; disabled?: boolean; [key: string]: unknown }>
  selectionMode?: 'single' | 'multiple' | 'none'
  enableDragSelect?: boolean
  enableShiftSelect?: boolean
  enableCmdSelect?: boolean
  onSelectionChange?: (selectedIds: string[]) => void
}

export interface BatchAction {
  id: string
  label: string
  icon?: string
  shortcut?: string
  danger?: boolean
  available?: (selectedItems: unknown[]) => boolean  // 动态判断是否可用
  onAction: (selectedItems: unknown[]) => void | Promise<void>
}

export interface BatchPreviewItem {
  id: string
  label: string
  currentValue: string
  newValue: string
  excluded?: boolean
}
```

### 关键实现策略

1. **内联编辑的聚焦管理**：进入编辑模式时，使用 `nextTick` 确保 DOM 更新后调用 `input.focus()` 并 `select()` 全选文本。退出编辑模式时将焦点恢复给原元素（使用 `focus({ preventScroll: true })` 避免页面跳动）。与 031 的 `useFocusRestore` 联动
2. **拖拽框选的碰撞检测**：在 `mousemove` 中遍历所有可选项目，使用 `getBoundingClientRect()` 获取项目位置，与选择框矩形进行交集判断（`rect1.left < rect2.right && rect1.right > rect2.left && rect1.top < rect2.bottom && rect1.bottom > rect2.top`）。使用 `requestAnimationFrame` 节流避免频繁计算
3. **批量选择的范围算法**：Shift+点击时，找到上一次点击的锚点项和当前点击项在列表中的索引，选中两者之间的所有项（包含端点）。需要处理列表过滤/排序后的可见索引，而非原始数据索引
4. **浮动工具栏的可用性计算**：每次选择变化时，遍历 `batchActions` 数组，调用每个 action 的 `available(selectedItems)` 判断该操作是否对当前选中项可用。不可用的按钮显示为 disabled 状态，hover 时 Tooltip 说明原因
5. **批量预览的差异渲染**：BatchPreviewDialog 使用表格展示变更预览，当前值和新值相同的项自动标记为灰色（无实际变更），方便用户快速识别真正的变更项并排除无意义项

## 验收标准

- [ ] 提供 `InlineEdit` 组件，支持文本/文本域/下拉/数字类型的内联编辑
- [ ] 支持单击/双击/编辑图标/悬停四种触发方式，支持自动保存和验证
- [ ] 提供 `BatchSelector` 组件/能力，支持 Checkbox、⌘+点击、Shift+范围选择
- [ ] 支持鼠标拖拽框选多个项目（卡片网格和列表布局）
- [ ] 提供 `FloatingActionToolbar` 组件，多选后自动显示可用批量操作
- [ ] 操作按钮根据选中内容动态可用/禁用，并显示原因 Tooltip
- [ ] 提供 `BatchPreviewDialog` 组件，展示批量变更预览和差异对比
- [ ] 支持批量操作中的逐项排除和实时数量更新
- [ ] 提供 `useBatchSelection()` composable，管理选中状态、范围选择、框选
- [ ] 内联编辑支持 Enter 保存、Escape 取消、焦点自动管理
- [ ] 包含至少 5 个使用示例（卡片标题编辑、列表项编辑、批量选择、浮动工具栏、拖拽框选）

## 优先级

**P1** — 内联编辑和批量操作是桌面应用数据管理的核心能力，与现有 Table/Card/Checkbox 组件高度契合；模式系统能显著提升数据密集型应用的直接操作体验。

## 参考实现

- [Notion Inline Editing](https://www.notion.so/) — 页面标题、属性、数据库字段的内联编辑
- [macOS Finder Batch Selection](https://support.apple.com/guide/mac-help/mchlp25912/mac) — ⌘+点击、Shift+范围选择、拖拽框选
- [Gmail Batch Actions](https://mail.google.com/) — 多选邮件后的浮动操作工具栏
- [Airtable Batch Update](https://airtable.com/) — 批量修改预览和差异对比
- [Linear Multi-select](https://linear.app/) — 批量选择和浮动操作栏
