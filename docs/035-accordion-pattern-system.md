# 折叠面板/手风琴模式系统（Accordion Pattern System）

## 功能背景/动机

当前脚手架已包含 shadcn-vue 的 `Accordion` 基础组件，提供单个/多个面板的展开/折叠能力。但在桌面应用中，手风琴是一个需要更多交互模式的组件系统——开发者需要处理嵌套折叠（面板内再套面板）、批量展开/折叠操作、可拖拽排序的折叠项、分组级状态指示、以及与其他表单组件的联动（如折叠面板内的表单验证状态反馈）。目前仅提供基础 primitive，缺少面向复杂场景的交互模式封装，导致开发者每次都需要自行组装这些能力。

## 功能描述

在现有 Accordion 组件基础上，构建面向桌面应用的折叠面板交互模式系统：

1. **嵌套折叠模式（Nested Accordion）**：支持手风琴项内部再嵌套子手风琴，视觉层级分明（缩进、字体大小、边框区分），键盘导航独立
2. **批量展开/折叠（Bulk Expand/Collapse）**：提供「展开全部」「折叠全部」快捷操作，支持按条件批量控制（如仅展开有错误的分组）
3. **可拖拽排序的折叠项（Draggable Accordion）**：支持拖拽重新排列折叠项顺序，与 034 拖拽交互模式共享 SortableJS 封装
4. **分组级状态指示（Section Status Indicator）**：每个折叠项标题右侧显示该分组内的状态摘要（如表单验证通过数/错误数、加载状态、未读标记）
5. **受控与自动展开策略（Auto-expand Strategy）**：表单提交出错时自动展开包含错误字段的分组；搜索匹配时自动展开包含匹配结果的分组
6. **持久化折叠状态（Persisted State）**：用户的折叠/展开偏好按面板 ID 持久化到 localStorage，刷新后恢复

## 目标用户

- 需要构建复杂设置页、配置向导、长表单分组折叠的开发者
- 需要可拖拽重新组织内容区块的开发者
- 希望折叠面板与表单验证状态联动的应用设计者

## 详细设计

### 交互流程

```
嵌套折叠：
用户看到一级折叠面板「外观设置」「通知设置」「高级选项」
  → 展开「高级选项」→ 内部出现二级折叠面板「性能」「实验性功能」「开发者工具」
  → 二级面板有独立的展开/折叠状态，不影响一级面板
  → 键盘导航时：在一级面板按 Tab → 进入二级面板的触发器 → 再按 Tab → 进入二级面板内容
  → 视觉区分：二级面板缩进 16px，字体小一号，边框颜色更浅

批量展开/折叠：
长表单有 8 个折叠分组 → 面板顶部显示操作栏
  → 用户点击「展开全部」→ 所有分组平滑展开
  → 用户点击「折叠全部」→ 所有分组平滑折叠
  → 用户点击「仅展开有错误的」→ 遍历各分组验证状态 → 含错误字段的分组自动展开
  → 支持快捷键：⌘+⌥+↑ 展开全部，⌘+⌥+↓ 折叠全部

可拖拽排序：
用户按下面板标题左侧的拖拽手柄 → 面板项变为拖拽状态
  → 拖拽时显示占位间隙 → 释放后顺序更新
  → 支持仅同级之间拖拽（嵌套结构中不可跨层级拖拽）
  → 排序后新顺序自动持久化
  → 与 034 的 `useSortable` 共享实现

分组状态指示：
折叠项标题右侧显示迷你状态徽章：
  → 全部通过：绿色 ✓ 图标
  → 有 3 个错误：红色角标 "3"
  → 有未保存更改：橙色圆点
  → 内容加载中：微小 Spinner
  → 点击状态徽章 → 自动展开该分组并滚动到第一个错误/变更字段

自动展开策略：
表单提交时检测到 2 个字段有错误
  → 错误分别位于「基础设置」和「高级选项」分组
  → 两个分组自动展开（带动画）→ 第一个错误字段自动聚焦
  → 用户在搜索框输入关键词「主题」
  → 仅包含「主题」字段的「外观设置」分组自动展开，其余折叠
  → 清除搜索后 → 恢复之前的折叠状态

状态持久化：
用户展开「高级选项」、折叠「通知设置」
  → 状态变化 1 秒后自动保存：{ "accordion-settings": { "advanced": true, "notifications": false } }
  → 用户刷新页面 → 手风琴自动恢复到上次状态
  → 提供「重置为默认展开状态」按钮
```

### 涉及的技术点

- **嵌套递归组件**：Accordion 支持递归渲染，通过 `level` prop 控制缩进和样式层级
- **SortableJS 嵌套限制**：配置 `onMove` 回调禁止跨层级拖拽，只允许同父级内排序
- **状态聚合**：遍历分组内子组件的验证/变更状态，汇总到分组标题的徽章展示
- **受控状态管理**：提供 `v-model:expandedKeys` 支持完全受控，也提供非受控的自动持久化模式
- **搜索过滤联动**：监听搜索关键词，匹配到的分组自动展开并高亮匹配文本

### 与现有架构的衔接方式

| 现有模块 | 衔接方式 |
|---------|---------|
| `src/components/ui/accordion/` | 扩展 AccordionRoot/AccordionItem 支持嵌套层级和状态指示 |
| `src/composables/useSortable.ts`（034）| 折叠项拖拽排序复用 SortableJS 封装 |
| `src/components/ui/badge/` | 分组状态指示徽章 |
| `src/components/ui/form/` | 分组内表单验证状态聚合和反馈 |
| `src/components/ui/collapsible/` | 作为单个折叠项的轻量替代（无手风琴互斥行为） |
| `src/utils/storage.ts` | 折叠状态持久化存储 |

### 需要新增/修改的文件

**新增文件：**
- `src/components/accordion-patterns/NestedAccordion.vue` — 嵌套折叠面板组件
- `src/components/accordion-patterns/AccordionBulkActions.vue` — 批量展开/折叠操作栏组件
- `src/components/accordion-patterns/AccordionItemStatus.vue` — 折叠项状态指示徽章组件
- `src/components/accordion-patterns/SortableAccordion.vue` — 可拖拽排序折叠面板组件
- `src/composables/useAccordionState.ts` — 折叠面板状态管理 composable
- `src/composables/useAccordionSearch.ts` — 折叠面板搜索过滤联动 composable
- `src/types/accordion.ts` — 折叠面板模式类型定义

**修改文件：**
- `src/components/ui/accordion/AccordionItem.vue` — 支持嵌套层级缩进和状态插槽
- `src/components/ui/accordion/AccordionTrigger.vue` — 支持拖拽手柄和状态徽章区域

### 核心数据结构

```typescript
// src/types/accordion.ts
export interface AccordionItemDef {
  id: string
  title: string
  description?: string
  icon?: string
  level?: number                    // 嵌套层级，0 为顶层
  children?: AccordionItemDef[]     // 子折叠项（嵌套）
  disabled?: boolean
  defaultExpanded?: boolean
  persistKey?: string               // 持久化 key，null 则不持久化
}

export interface AccordionItemStatus {
  validCount?: number
  errorCount?: number
  warningCount?: number
  isDirty?: boolean
  isLoading?: boolean
  hasUnseenContent?: boolean
}

export interface AccordionState {
  expandedKeys: Set<string>
  itemOrder: string[]               // 排序后的 item id 列表
}

export interface AccordionSearchOptions {
  query: string
  autoExpandMatches?: boolean       // 匹配项是否自动展开
  highlightMatches?: boolean        // 是否高亮匹配文本
  searchFields?: string[]           // 搜索的字段，默认 ['title', 'description']
}
```

### 关键实现策略

1. **嵌套递归渲染**：AccordionItem 支持递归调用自身，通过 `level` prop 控制缩进（`padding-left: level * 16px`）和字体大小（`text-sm` / `text-xs`）。键盘导航时，Enter/Space 切换当前项，方向键 ↑↓ 在同级间移动，→← 展开/折叠
2. **状态聚合机制**：通过 provide/inject 建立分组上下文，子表单组件向父级 AccordionItem 上报验证状态。父级收集所有子状态后计算 `errorCount`、`validCount` 等摘要数据
3. **拖拽同层限制**：SortableJS 配置 `group` 时加入 `put` 回调，检查被拖拽元素的父级与目标位置的父级是否相同，不同则拒绝放置
4. **搜索高亮联动**：搜索时不仅对分组标题匹配，还深入分组内容匹配。匹配到的分组自动展开，匹配文本用 `<mark>` 高亮。清除搜索后恢复到搜索前的折叠状态
5. **持久化策略**：每个 Accordion 实例通过 `persistKey` 隔离存储，默认使用 `localStorage`，支持传入自定义 storage

## 验收标准

- [ ] 提供 `NestedAccordion` 组件，支持无限层级嵌套，视觉层级分明
- [ ] 提供批量展开/折叠操作（展开全部、折叠全部、仅展开有错误的）
- [ ] 提供 `SortableAccordion` 组件，支持同层级拖拽排序，禁止跨层级拖拽
- [ ] 每个折叠项支持右侧状态徽章（通过数/错误数/未保存/加载中）
- [ ] 表单提交出错时自动展开包含错误的分组，并聚焦第一个错误字段
- [ ] 支持搜索过滤联动，匹配分组自动展开并高亮匹配文本
- [ ] 支持折叠状态持久化，刷新后恢复用户的展开/折叠偏好
- [ ] 支持完全受控模式（`v-model:expandedKeys`）和非受控自动模式
- [ ] 嵌套折叠支持独立的键盘导航（方向键、Enter/Space）
- [ ] 包含至少 4 个使用示例（嵌套折叠、批量操作、拖拽排序、表单联动）

## 优先级

**P1** — 折叠面板是桌面应用处理大量分组内容的标配模式，与现有 Accordion 组件高度契合；模式系统能显著提升复杂配置页面的可用性。

## 参考实现

- [Radix Accordion](https://www.radix-ui.com/primitives/docs/components/accordion) — 底层实现参考
- [Ant Design Collapse](https://ant.design/components/collapse) — 嵌套、批量操作、面板-extra
- [VS Code Settings Sections](https://code.visualstudio.com/docs/getstarted/settings) — 搜索过滤自动展开分组
- [GitHub Settings Accordion](https://github.com/settings/profile) — 分组状态指示
