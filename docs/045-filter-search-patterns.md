# 过滤与搜索交互模式（Filter & Search Interaction Patterns）

## 功能背景/动机

当前脚手架已包含 `SearchBar.vue`（基础搜索输入框）和 `Command`/`Combobox`（命令面板和可搜索下拉框），但缺少面向桌面应用数据筛选场景的**过滤与搜索交互模式系统**。在桌面应用中，用户需要处理复杂的多条件筛选（如日期范围 + 分类 + 状态 + 关键词）、筛选标签（Chip）管理、搜索历史、筛选条件持久化等场景。目前项目中没有任何过滤器面板或筛选交互的封装，开发者每次都需要自行组装输入框、下拉框、日期选择器等组件来构建筛选界面。提供一套完整的过滤与搜索交互模式，能让开发者快速构建类 Notion/Airtable 的数据筛选体验。

## 功能描述

构建覆盖桌面应用常见筛选搜索场景的交互模式系统：

1. **过滤器面板模式（Filter Panel）**：侧边栏或顶部展开的面板，集成多种筛选条件（关键词、下拉选择、日期范围、开关、复选框组），支持条件的即时应用和「应用/重置」操作
2. **筛选标签模式（Filter Chips / Tags）**：每个已应用的筛选条件以标签（Chip）形式展示在搜索栏下方，支持点击标签快速编辑条件，点击删除按钮移除条件，支持「清除全部」
3. **搜索高亮与匹配反馈（Search Highlighting）**：在列表/表格中搜索关键词时，匹配文本自动高亮显示（`<mark>` 标签），同时显示「找到 12 个匹配项」的反馈
4. **搜索历史与建议（Search History & Suggestions）**：搜索框支持展示历史搜索记录和自动补全建议，支持固定常用搜索条件为「保存的筛选器」
5. **筛选条件持久化（Filter Persistence）**：筛选条件自动保存到 URL query 或 localStorage，刷新后恢复，支持「保存筛选器」和「分享筛选结果」

## 目标用户

- 构建数据表格、内容列表、文件浏览器的开发者
- 需要提供复杂多条件筛选体验的应用设计者
- 希望筛选条件可分享、可持久化的开发者

## 详细设计

### 交互流程

```
过滤器面板：
用户点击「筛选」按钮 → 侧边滑出 FilterPanel（Sheet/Drawer）
  → 面板内分组展示筛选条件：
    「关键词」：Input 输入框
    「状态」：CheckboxGroup（全部/进行中/已完成/已归档）
    「优先级」：SegmentedControl 或 ButtonGroup（高/中/低）
    「日期范围」：DateRangePicker（040）
    「标签」：MultiSelect 下拉框（040）
    「分配人」：Combobox 可搜索下拉（支持头像展示）
  → 修改任意条件 → 可选策略：
    → 即时应用：数据实时更新（适合数据量小的场景）
    → 延迟应用：点击「应用」按钮后统一生效（适合数据量大或需要后端筛选的场景）
  → 面板底部显示操作栏：「应用」「重置」「取消」
  → 显示当前已选条件数量和预估结果数
  → 按 Escape → 关闭面板（如选择即时应用模式则保留条件；如延迟模式则询问是否放弃未应用的更改）

筛选标签：
用户在搜索栏下方看到已应用的筛选标签：
  → 「关键词: 设计」×  「状态: 进行中」×  「日期: 最近7天」×
  → 点击标签文本 → 弹出小型Popover快速编辑该条件（如点击日期标签 → 弹出迷你日期选择器）
  → 点击标签旁的 × → 移除该条件 → 数据自动刷新
  → 标签过多时显示「+3 更多」展开按钮
  → 最右侧显示「清除全部」按钮（超过 1 个条件时显示）
  → 标签支持拖拽重新排序（仅视觉顺序，不影响筛选逻辑）
  → 悬停标签 → 显示 Tooltip 展示完整条件值（如标签被截断时）

搜索高亮：
用户在搜索框输入「登录」→ 列表/表格数据实时过滤
  → 每个匹配项中高亮显示「登录」文本（黄色背景 `<mark>`）
  → 高亮支持多关键词（输入「登录 失败」→ 同时高亮「登录」和「失败」）
  → 表格模式下高亮单元格边框轻微高亮
  → 卡片模式下高亮文本并滚动到第一个匹配位置
  → 显示反馈：「在 156 条中找到 12 个匹配项」
  → 无匹配时 → 展示空状态 + 「尝试其他关键词」建议
  → 清空搜索 → 恢复完整列表，高亮清除

搜索历史与建议：
用户聚焦搜索框 → 下拉面板展示：
  → 「最近搜索」：历史记录列表（最近 10 条），每项显示搜索词和结果数
    → 悬停历史项 → 显示「删除」按钮（仅删除该历史记录）
    → 点击历史项 → 直接应用该搜索条件
  → 「搜索建议」：基于当前输入的自动补全（如输入「设」→ 建议「设置」「设计」「设备」）
  → 「保存的筛选器」：
    → 「我关注的任务」（关键词: 关注 + 状态: 进行中）
    → 「本周待办」（日期: 本周 + 优先级: 高）
    → 点击保存的筛选器 → 一次性应用所有条件
    → 支持保存当前筛选条件为新筛选器（输入名称 + 图标选择）

筛选条件持久化：
用户应用筛选条件 → 自动同步到 URL：
  → `?q=设计&status=in-progress&priority=high&date=7d`
  → 分享 URL → 他人打开自动应用相同筛选条件
  → 浏览器前进/后退 → 筛选条件同步变化
  → 可选持久化到 localStorage：
    → 记录「上次使用的筛选条件」
    → 返回页面时自动恢复
  → 保存的筛选器存储到 localStorage
    → 支持重命名、删除、排序
    → 支持导出/导入保存的筛选器（JSON）
```

### 涉及的技术点

- **筛选条件序列化**：将筛选条件对象与 URL query 字符串互相转换，支持嵌套对象和数组
- **防抖搜索**：关键词输入使用 200-300ms 防抖，避免频繁过滤
- **高亮算法**：使用正则表达式匹配关键词，在文本中插入 `<mark>` 标签，注意 XSS 防护（先转义 HTML 再插入 mark）
- **本地与远程筛选策略**：小数据量时前端内存过滤，大数据量时向后端发送筛选参数

### 与现有架构的衔接方式

| 现有模块 | 衔接方式 |
|---------|---------|
| `src/components/SearchBar.vue` | 搜索框基础组件扩展为筛选搜索组合 |
| `src/components/ui/command/` | 命令面板的搜索交互复用 |
| `src/components/ui/combobox/` | 筛选条件的可搜索下拉选择 |
| `src/components/ui/sheet/` | 过滤器面板的侧边抽屉容器 |
| `src/components/ui/badge/` | 筛选标签（Chip）的展示 |
| `src/components/ui/popover/` | 标签快速编辑的弹出容器 |
| `src/components/ui/input/`、`select/`、`switch/` | 筛选条件的输入组件 |
| `040-select-interaction-patterns` | 日期范围、多选等筛选条件组件 |
| `src/router/index.ts` | URL query 同步 |
| `src/utils/storage.ts` | 筛选条件持久化 |

### 需要新增/修改的文件

**新增文件：**
- `src/components/filter-patterns/FilterPanel.vue` — 过滤器面板组件
- `src/components/filter-patterns/FilterBar.vue` — 筛选标签栏组件
- `src/components/filter-patterns/SearchWithFilter.vue` — 搜索+筛选组合组件
- `src/components/filter-patterns/SearchHighlight.vue` — 搜索高亮文本组件
- `src/components/filter-patterns/SavedFilters.vue` — 保存的筛选器管理组件
- `src/components/filter-patterns/SearchHistory.vue` — 搜索历史下拉组件
- `src/composables/useFilter.ts` — 筛选逻辑核心 composable
- `src/composables/useSearchHighlight.ts` — 搜索高亮逻辑 composable
- `src/composables/useSavedFilters.ts` — 保存筛选器管理 composable
- `src/types/filter.ts` — 过滤搜索模式类型定义

**修改文件：**
- `src/components/SearchBar.vue` — 支持搜索历史下拉和筛选标签集成

### 核心数据结构

```typescript
// src/types/filter.ts
export type FilterOperator = 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'in' | 'between'

export type FilterValue = string | number | boolean | Date | string[] | [Date | null, Date | null]

export interface FilterCondition {
  field: string
  operator: FilterOperator
  value: FilterValue
  label?: string                // 用于 Chip 展示的标签
}

export interface FilterConfig {
  field: string
  label: string
  type: 'text' | 'select' | 'multiselect' | 'date' | 'daterange' | 'boolean' | 'checkboxgroup' | 'number'
  options?: { label: string; value: unknown }[]
  placeholder?: string
  immediate?: boolean           // 是否即时应用
}

export interface SavedFilter {
  id: string
  name: string
  icon?: string
  conditions: FilterCondition[]
  createdAt: number
}

export interface SearchHistoryItem {
  query: string
  timestamp: number
  resultCount?: number
}

export interface FilterOptions {
  filters: FilterConfig[]
  syncToUrl?: boolean
  persistKey?: string
  enableSavedFilters?: boolean
  enableHistory?: boolean
  debounceMs?: number
}
```

### 关键实现策略

1. **筛选条件的统一表达式**：所有筛选条件统一为 `{ field, operator, value, label }` 结构，便于序列化到 URL、生成筛选标签、以及转换为后端查询参数。`label` 字段用于生成用户友好的 Chip 文本（如「状态: 进行中」而非 raw value）
2. **URL 序列化策略**：使用 `URLSearchParams` 将条件数组序列化为扁平 query。数组值使用 `[]` 后缀（如 `status[]=active&status[]=pending`），日期范围使用 `dateFrom`/`dateTo`，避免嵌套对象导致 URL 过长和难读
3. **搜索高亮安全实现**：对原始文本进行 HTML 转义后再插入 `<mark>`。具体流程：`escapeHtml(text)` → `replace(new RegExp(escapeRegExp(keyword), 'gi'), match => `<mark>${match}</mark>`)`。多关键词时分词后分别高亮
4. **即时 vs 延迟应用模式**：通过 `immediate` 参数控制。即时模式下，每个条件变化直接触发 `onFilterChange`。延迟模式下，条件变化仅更新内部 draft 状态，点击「应用」后统一提交。面板关闭时如 draft 与 applied 不一致，提示「有未应用的更改」
5. **保存筛选器的上下文感知**：保存的筛选器可以标记适用场景（如「仅适用于项目页面」），在不同页面展示不同的保存筛选器列表。支持拖拽排序和导入/导出为 JSON 文件

## 验收标准

- [ ] 提供 `FilterPanel` 组件，支持多种筛选条件类型和即时/延迟应用策略
- [ ] 提供 `FilterBar` 组件，以 Chip 形式展示已应用条件，支持快速编辑和删除
- [ ] 提供 `SearchWithFilter` 组件，搜索框与筛选面板一体化
- [ ] 支持搜索文本高亮，支持多关键词同时高亮
- [ ] 支持搜索历史记录和自动补全建议
- [ ] 支持保存/管理常用筛选器，支持导入/导出
- [ ] 支持筛选条件与 URL query 双向同步
- [ ] 支持筛选条件持久化到 localStorage
- [ ] 提供 `useFilter()` composable，统一管理筛选状态、序列化、应用
- [ ] 包含至少 4 个使用示例（过滤器面板、筛选标签、搜索高亮、保存筛选器）

## 优先级

**P1** — 过滤搜索是数据密集型桌面应用的核心交互，与现有 SearchBar/Command/Combobox 高度契合；模式系统能显著提升复杂数据筛选场景的开发效率。

## 参考实现

- [Notion Filters](https://www.notion.so/) — 筛选面板和 Chip 管理的交互标杆
- [Airtable Filtering](https://www.airtable.com/) — 复杂条件筛选和保存视图
- [GitHub Issues Filters](https://github.com/issues) — URL 同步和筛选标签
- [Ant Design FilterDropdown](https://ant.design/components/table) — 表格列筛选交互
- [Algolia Search](https://www.algolia.com/) — 搜索高亮和即时反馈
