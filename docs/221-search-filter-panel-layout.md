# 221 搜索与筛选面板布局（Search & Filter Panel Layout）

## 功能名称

搜索与筛选面板布局 — 提供搜索表单栏、高级筛选面板、筛选标签组三种可复用骨架。

## 功能背景/动机

桌面应用中，数据检索是高频操作。现有脚手架已有 `SearchBar.vue`（顶部搜索输入框）、`ui/command/`（命令面板搜索）、`ui/combobox/`（组合框筛选），但缺少**页面级的搜索与筛选布局模板**。开发者在实现列表/表格的筛选功能时，需要反复组装相同的结构：搜索输入框 + 筛选条件下拉 + 已选筛选标签 + 高级筛选展开区 + 排序控制。

本功能将这些高频组合抽象为 Layout 组件，统一筛选面板的交互规范、响应式策略和空状态处理。

## 功能描述

包含以下三种搜索与筛选布局变体：

| 变体 | 说明 | 适用场景 |
|------|------|----------|
| `SearchToolbarLayout` | 顶部紧凑搜索栏：搜索框 + 常用筛选 + 排序 + 视图切换 | 表格页、列表页、资源库 |
| `AdvancedFilterPanelLayout` | 侧边筛选面板（可收起）：多组筛选条件 + 重置/应用按钮 | 电商筛选、数据分析、复杂查询 |
| `FilterChipsLayout` | 已选筛选条件的标签组（Chips），支持一键清除单个或全部 | 任何带筛选的数据展示页面 |

每种布局均内建：
- 搜索框自动聚焦（页面加载后）
- 筛选条件的展示/收起动画
- 已选筛选的标签化展示（Filter Chips）
- 重置/清除全部按钮
- 结果计数显示（"共找到 128 条结果"）
- 与 `DataTableLayout`、`CardGridLayout` 的衔接约定

## 目标用户

- 需要为列表、表格、卡片网格添加搜索筛选功能的开发者
- 希望统一应用内搜索交互体验的开发者

## 详细设计

### 布局结构描述

#### 1. 顶部搜索工具栏（SearchToolbarLayout）

```
+--------------------------------------------------+
| 用户管理                                         |
+--------------------------------------------------+
| ┌────────────────────────────────────────────┐  |
| │ 🔍 搜索用户...    [角色 ▼] [状态 ▼] [排序▼] [▦|☰]│  |
| └────────────────────────────────────────────┘  |
|                                                  |
| 已选筛选： [角色: 管理员 ✕] [状态: 活跃 ✕] [清除全部] |
|                                                  |
| 共找到 12 条结果                                 |
|                                                  |
| ┌────────────────────────────────────────────┐  |
| │ 表格/卡片内容区                               │  |
| └────────────────────────────────────────────┘  |
+--------------------------------------------------+
```

#### 2. 高级筛选面板（AdvancedFilterPanelLayout）

```
+--------------------------------------------------+
| 产品库                              [搜索...]    |
+--------------------------------------------------+
| 筛选面板 (280px)  |  结果列表                        |
| ┌───────────────┐ |  ┌─────────────────────────┐  |
| │ 筛选条件      │ |  │                         │  |
| │               │ |  │   结果内容区             │  |
| │ 价格区间      │ |  │                         │  |
| │ [    ]-[    ] │ |  │                         │  |
| │               │ |  │                         │  |
| │ 分类          │ |  └─────────────────────────┘  |
| │ □ 电子        │ |                               │
| │ □ 服装        │ |                               │
| │ □ 家居        │ |                               │
| │               │ |                               │
| │ 评分          │ |                               │
| │ ★★★★☆ 及以上 │ |                               │
| │               │ |                               │
| │ 重置    应用  │ |                               │
| └───────────────┘ |                               │
+--------------------------------------------------+
```

#### 3. 筛选标签组（FilterChipsLayout）

```
+--------------------------------------------------+
| 搜索结果："设计规范"                              |
+--------------------------------------------------+
| 筛选： [全部] [文档] [图片] [代码] [最近7天▼]     |
|                                                  |
| 已选： [类型: 文档 ✕] [时间: 最近7天 ✕] [清除]    |
|                                                  |
| 结果列表...                                       |
+--------------------------------------------------+
```

### 涉及的技术点

- 使用现有 `Input`、`Select`、`Checkbox`、`Badge` 组件构建筛选控件
- 使用 `ui/button-group/` 或 `ui/toggle-group/` 实现筛选类型切换
- 使用 `ui/slider/` 实现范围筛选（如价格区间、评分）
- 使用 `Drawer` 或 `Sheet` 在移动端/窄屏下将筛选面板转为侧边抽屉
- 使用 `AnimatedTransition` 实现筛选标签的添加/移除动画
- 使用 `ScrollArea` 处理高级筛选面板的长条件列表

### 与现有 layouts/ 的衔接

- 新增 `src/components/layouts/SearchToolbarLayout.vue`
- 新增 `src/components/layouts/AdvancedFilterPanelLayout.vue`
- 新增 `src/components/layouts/FilterChipsLayout.vue`
- 在 `src/components/layouts/index.ts` 中导出
- `SearchToolbarLayout` 可与 `DataTableLayout`、`CardGridWithToolbarLayout`（204）组合，替代其内置工具栏
- `AdvancedFilterPanelLayout` 可与 `ResizableSidebarLayout`（205）共用拖拽面板逻辑

### 需要新增/修改的文件

```
desktop-app/src/components/layouts/
  ├── SearchToolbarLayout.vue       # 顶部搜索工具栏
  ├── AdvancedFilterPanelLayout.vue # 高级筛选面板
  ├── FilterChipsLayout.vue         # 筛选标签组
  └── index.ts                      # 追加导出
```

**Props 设计（以 SearchToolbarLayout 为例）：**

```ts
interface FilterOption {
  key: string
  label: string
  value: string
}

interface SearchToolbarLayoutProps {
  searchPlaceholder?: string
  filters?: FilterOption[]       // 已选筛选，用于展示 Chips
  resultCount?: number
  showViewToggle?: boolean
  showSort?: boolean
  loading?: boolean
}

// Events
// @search      — 搜索关键词变化
// @filter-add  — 添加筛选条件
// @filter-remove — 移除单个筛选
// @filter-clear — 清除全部筛选
// @sort-change — 排序变化
```

## 验收标准

- [ ] 三种布局均能在 `ComponentPlayground` 中独立预览
- [ ] `SearchToolbarLayout` 在页面加载后自动聚焦搜索输入框
- [ ] `AdvancedFilterPanelLayout` 在窗口宽度小于 1024px 时，筛选面板自动转为 `Sheet` 侧边抽屉
- [ ] 筛选标签（Chips）支持点击 `✕` 移除，移除时有缩小消失的动画
- [ ] 点击"清除全部"后，所有筛选条件重置，结果区在 200ms 内更新
- [ ] 搜索框支持通过 `Escape` 键快速清空内容
- [ ] 结果计数文案支持通过 props 传入，便于国际化
- [ ] 与 `DataTableLayout` 和 `CardGridLayout` 组合使用时，工具栏高度和间距保持一致

## 优先级

P1 — 搜索与筛选是数据展示页面的核心交互，通用性极强。

## 参考实现

- Linear 的 Issue 筛选栏
- GitHub 的 PR/Issue 筛选面板
- Notion 的数据库筛选和排序工具栏
- macOS Finder 的搜索栏 + 筛选标签
