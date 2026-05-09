# 215 文件浏览器/树形布局（File Browser & Tree Layout）

## 功能名称

文件浏览器/树形布局 — 提供双栏文件浏览器、树形导航 + 内容区、列视图三种可复用骨架。

## 功能背景/动机

桌面应用中常见的"资源管理"场景（文件浏览、项目结构、目录导航、知识库分类）都需要树形或分栏的布局模式。现有脚手架已有 `ui/accordion/`、`ui/collapsible/`、`ui/sidebar/` 等可折叠组件，但缺少**面向文件/树形数据浏览的页面级布局模板**。开发者在实现文件浏览器时，需要反复处理树节点的缩进对齐、选中高亮、展开状态记忆、以及右侧内容区的联动。

本功能提供三种经典的文件/树形浏览布局，与 macOS Finder、VS Code Explorer 等桌面原生应用的交互模式对齐。

## 功能描述

包含以下三种文件浏览器/树形布局变体：

| 变体 | 说明 | 适用场景 |
|------|------|----------|
| `FileBrowserLayout` | 左侧树形目录 + 右侧文件列表/详情，双栏可拖拽调宽 | 文件管理器、项目资源浏览 |
| `TreeContentLayout` | 左侧树形导航（可嵌套多层级）+ 右侧内容展示 | 知识库、文档中心、分类目录 |
| `ColumnViewLayout` | macOS Finder 风格的列视图，多级并排展示 | 深层级目录快速浏览、分类筛选 |

每种布局均内建：
- 树节点的展开/收起控制（支持记忆状态）
- 节点选中高亮（单选/多选）
- 拖拽调整面板宽度（`ResizablePanelGroup`）
- 空文件夹状态（`Empty` 组件）
- 面包屑导航（与 `Breadcrumb` 组件衔接）

## 目标用户

- 需要实现文件管理、项目浏览、资源库的开发者
- 需要树形分类导航 + 内容展示的知识类应用开发者

## 详细设计

### 布局结构描述

#### 1. 双栏文件浏览器（FileBrowserLayout）

```
+----------------------------------------------------------+
| [←] [→] [↑]  当前路径 / 项目 / src / components          |
+----------------------------------------------------------+
| 目录树 (240px)    |  文件列表区                            |
| ┌───────────────┐ |  ┌─────────────────────────────────┐ |
| │ > 项目        │ |  │ [□] 名称        大小   修改日期  │ |
| │   v src       │ |  ├─────────────────────────────────┤ |
| │     > assets  │ |  │ [□] Button.vue   2KB   昨天     │ |
| │     v comp... │ |  │ [□] Card.vue     3KB   今天     │ |
| │       Sidebar │ |  │ [□] Input.vue    1KB   上周     │ |
| │       Button  │ |  │ [□] Table.vue    5KB   今天     │ |
| │     > pages   │ |  │ [□] Dialog.vue   4KB   昨天     │ |
| │   > docs      │ |  └─────────────────────────────────┘ |
| │   > tests     │ |                                      |
| └───────────────┘ |  共 5 项              [□] 全选      |
|                   |                                      |
+----------------------------------------------------------+
```

#### 2. 树形导航 + 内容区（TreeContentLayout）

```
+----------------------------------------------------------+
| 知识库                                          [搜索...] |
+----------------------------------------------------------+
| 分类导航 (280px)  |  内容区                              |
| ┌───────────────┐ |  ┌─────────────────────────────────┐ |
| │ > 产品文档    │ |  │  Vue 3 组件设计规范              │ |
| │   v 开发指南  │ |  │                                 │ |
| │     快速开始  │ |  │  本文档描述了项目组件的设计...   │ |
| │     * 组件规范│ |  │                                 │ |
| │     API 参考  │ |  │  ## 基础原则                     │ |
| │   > 设计规范  │ |  │                                 │ |
| │   > 发布说明  │ |  │  1. 单一职责原则                 │ |
| │               │ |  │  2. 可组合性                     │ |
| │               │ |  │  ...                            │ |
| └───────────────┘ |  └─────────────────────────────────┘ |
|                   |                                      |
+----------------------------------------------------------+
```

#### 3. 列视图（ColumnViewLayout）

```
+----------------------------------------------------------+
| 项目 / 文档 / 2024 / Q1                                  |
+----------------------------------------------------------+
| ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐        |
| │ 项目    │ │ 文档    │ │ 2024    │ │ Q1      │        |
| │ > 文档  │ │ > 2024  │ │ > Q1    │ │ report  │        |
| │ > 代码  │ │ > 2023  │ │ > Q2    │ │ summary │        |
| │ > 资源  │ │ > 2022  │ │ > Q3    │ │ plan    │        |
| │         │ │         │ │ > Q4    │ │         │        |
| └─────────┘ └─────────┘ └─────────┘ └─────────┘        |
|    ↑ 每列独立滚动，当前选中项决定下一列内容               |
+----------------------------------------------------------+
```

### 涉及的技术点

- 使用现有 `ui/sidebar/` 的 `SidebarMenu`、`SidebarMenuSub` 构建树形导航
- 使用 `ui/resizable/` 实现面板拖拽调宽
- 使用 `ui/table/` 或 `ui/item/` 构建文件列表
- 使用 `ui/breadcrumb/` 构建路径导航
- 使用 `ui/empty/` 处理空目录状态
- 使用 `Checkbox` 支持列表多选
- 树形数据结构通过递归组件或扁平化渲染实现

### 与现有 layouts/ 的衔接

- 新增 `src/components/layouts/FileBrowserLayout.vue`
- 新增 `src/components/layouts/TreeContentLayout.vue`
- 新增 `src/components/layouts/ColumnViewLayout.vue`
- 在 `src/components/layouts/index.ts` 中导出
- `FileBrowserLayout` 可与 `DetailSplitLayout` 组合（点击文件后右侧显示文件详情而非列表）
- `TreeContentLayout` 可与 `SplitPaneTripleLayout` 组合（左侧树、中间目录、右侧内容）

### 需要新增/修改的文件

```
desktop-app/src/components/layouts/
  ├── FileBrowserLayout.vue         # 双栏文件浏览器
  ├── TreeContentLayout.vue         # 树形导航 + 内容区
  ├── ColumnViewLayout.vue          # 列视图
  └── index.ts                      # 追加导出
```

**Props 设计（以 FileBrowserLayout 为例）：**

```ts
interface FileNode {
  id: string
  name: string
  type: 'folder' | 'file'
  size?: number
  modifiedAt?: Date
  children?: FileNode[]
  icon?: Component
}

interface FileBrowserLayoutProps {
  treeData: FileNode[]
  selectedIds?: string[]
  defaultExpandedIds?: string[]
  showBreadcrumb?: boolean
  showSize?: boolean
  showModifiedAt?: boolean
  multiSelect?: boolean
}

// Events
// @select     — 选中项变化
// @expand     — 树节点展开
// @collapse   — 树节点收起
// @breadcrumb-click — 面包屑点击
```

## 验收标准

- [ ] 三种布局均能在 `ComponentPlayground` 中独立预览
- [ ] `FileBrowserLayout` 的目录树支持无限层级嵌套，展开/收起有动画
- [ ] 树节点选中后，右侧内容区在 200ms 内完成切换（无闪烁）
- [ ] `ColumnViewLayout` 的每列可独立垂直滚动，选中项自动滚动到可视区
- [ ] 空目录时展示 `Empty` 占位（文件夹图标 + "此文件夹为空"文案）
- [ ] 面包屑路径支持点击跳转，与 `Breadcrumb` 组件的交互规范一致
- [ ] 支持多选模式（Ctrl/Cmd + 点击），选中项高亮与主题 `primary` 一致
- [ ] 树节点支持通过 `icon` prop 自定义图标（文件夹/文件/图片/文档等）

## 优先级

P1 — 文件/树形布局是资源管理类桌面应用的基础，通用性强。

## 参考实现

- macOS Finder（双栏、列视图）
- VS Code Explorer（树形 + 文件列表）
- Figma 的左侧图层树（树形导航）
- Notion 的侧边页面树（TreeContentLayout 风格）
