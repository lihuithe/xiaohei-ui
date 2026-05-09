# 218 标签页/工作区布局（Tab Workspace Layout）

## 功能名称

标签页/工作区布局 — 提供浏览器式标签页、多文档工作区、垂直标签页三种可复用骨架。

## 功能背景/动机

桌面应用中，用户经常需要同时处理多个文档、页面或视图：同时编辑多个文件、对比多个报表、打开多个详情页。现有脚手架已有 `ui/tabs/` 组件族（`Tabs`、`TabsList`、`TabsTrigger`、`TabsContent`），但 `Tabs` 是一个轻量的局部切换组件，不适合承载**完整的页面级工作区**（如可拖拽排序的标签、可关闭的标签、新建标签按钮、标签溢出滚动等）。

本功能在 `ui/tabs/` 基础上，提供三种面向复杂工作区的标签页布局模板，让开发者可以快速搭建类浏览器、类 IDE 的多文档界面。

## 功能描述

包含以下三种标签页/工作区布局变体：

| 变体 | 说明 | 适用场景 |
|------|------|----------|
| `BrowserTabsLayout` | 顶部水平标签栏（可关闭、可新建、溢出滚动），下方内容区 | 多文档编辑、多页面浏览 |
| `MultiDocWorkspaceLayout` | 多文档工作区：标签页 + 分屏编辑，支持标签拖拽到分屏区 | IDE 式工作区、多文档对比 |
| `VerticalTabsLayout` | 左侧垂直标签栏（图标 + 文字），右侧大内容区 | 设置页、配置向导、工具面板 |

每种布局均内建：
- 标签栏的溢出处理（左右滚动箭头或下拉菜单）
- 关闭标签按钮（hover 显示，支持中键关闭）
- 新建标签按钮（`+` 按钮或右键菜单）
- 当前激活标签的高亮状态
- 空工作区状态（无标签时的占位）

## 目标用户

- 需要实现多文档、多页面、多视图同时管理的开发者
- 需要搭建 IDE 式或浏览器式工作区的开发者

## 详细设计

### 布局结构描述

#### 1. 浏览器式标签页（BrowserTabsLayout）

```
+--------------------------------------------------+
| [× 文档1] [× 文档2] [× 文档3] [+]       [操作 ▼] |
| ───────── ───────✕─ ─────────                    |
|                                                  |
|  当前激活标签的内容区                             |
|                                                  |
|  ┌──────────────────────────────────────────┐   |
|  │                                          │   |
|  │           文档 2 的内容                  │   |
|  │                                          │   |
|  └──────────────────────────────────────────┘   |
|                                                  |
+--------------------------------------------------+
```

#### 2. 多文档工作区（MultiDocWorkspaceLayout）

```
+--------------------------------------------------+
| [× 文档1] [× 文档2] [× 文档3] [+]       [操作 ▼] |
+--------------------------------------------------+
| 文档 1 (左侧)        ||        文档 2 (右侧)       |
| +------------------+  ||  +------------------+     |
| │                  │  ||  │                  │     |
| │  内容 A          │  ||  │  内容 B          │     |
| │                  │  ||  │                  │     |
| +------------------+  ||  +------------------+     |
|       ↑ 标签可拖拽到另一侧分屏                    |
+--------------------------------------------------+
```

#### 3. 垂直标签页（VerticalTabsLayout）

```
+--------------------------------------------------+
| 左侧标签栏         |  右侧内容区                    |
| ┌───────────────┐ |  ┌─────────────────────────┐ |
| │ 📄 概览       │ |  │                         │ |
| │ ⚙️ 通用设置   │ |  │   当前标签的内容         │ |
| │ 🔔 通知       │ |  │                         │ |
| │ 👤 账户       │ |  │                         │ |
| │ 🎨 外观       │ |  │                         │ |
| │               │ |  │                         │ |
| │               │ |  └─────────────────────────┘ |
| └───────────────┘ |                              |
+--------------------------------------------------+
```

### 涉及的技术点

- 使用现有 `ui/tabs/` 组件作为标签切换的底层逻辑
- 使用 `ScrollArea` 处理标签栏的水平溢出滚动
- 使用 `ResizablePanelGroup` 实现 `MultiDocWorkspaceLayout` 的分屏
- 使用 `DropdownMenu` 处理标签的右键菜单（关闭、关闭其他、关闭右侧）
- 标签拖拽排序可通过 HTML5 Drag and Drop API 或第三方库实现（布局模板提供拖拽占位槽）
- 使用 `Button`（`+` 按钮）和 `Empty` 组件处理新建标签和空状态

### 与现有 layouts/ 的衔接

- 新增 `src/components/layouts/BrowserTabsLayout.vue`
- 新增 `src/components/layouts/MultiDocWorkspaceLayout.vue`
- 新增 `src/components/layouts/VerticalTabsLayout.vue`
- 在 `src/components/layouts/index.ts` 中导出
- `BrowserTabsLayout` 可与 `SplitPaneTripleLayout`（209）组合（标签页内再分屏）
- `VerticalTabsLayout` 可替代 `SettingsLayout` 的左侧导航（更紧凑的标签切换）

### 需要新增/修改的文件

```
desktop-app/src/components/layouts/
  ├── BrowserTabsLayout.vue         # 浏览器式标签页
  ├── MultiDocWorkspaceLayout.vue   # 多文档工作区
  ├── VerticalTabsLayout.vue        # 垂直标签页
  └── index.ts                      # 追加导出
```

**Props 设计（以 BrowserTabsLayout 为例）：**

```ts
interface TabItem {
  id: string
  title: string
  closable?: boolean       // 是否可关闭，默认 true
  icon?: Component
  pinned?: boolean         // 是否固定（不可关闭）
  unsaved?: boolean        // 是否有未保存更改（显示圆点）
}

interface BrowserTabsLayoutProps {
  tabs: TabItem[]
  activeTabId: string
  showNewTabButton?: boolean
  scrollable?: boolean     // 标签栏是否可滚动，默认 true
}

// Events
// @tab-click    — 点击标签切换
// @tab-close    — 点击关闭标签
// @tab-new      — 点击新建标签
// @tab-reorder  — 拖拽重新排序后
```

## 验收标准

- [ ] 三种布局均能在 `ComponentPlayground` 中独立预览
- [ ] `BrowserTabsLayout` 的标签栏在标签数量溢出时，支持左右滚动箭头或鼠标滚轮横向滚动
- [ ] 标签的关闭按钮在 hover 时显示，固定标签（`pinned`）不显示关闭按钮
- [ ] `MultiDocWorkspaceLayout` 支持将标签拖拽到另一侧分屏区（至少提供拖拽占位槽）
- [ ] `VerticalTabsLayout` 的标签栏宽度支持通过拖拽调整（最小 120px，最大 300px）
- [ ] 未保存的标签标题旁显示小圆点指示器
- [ ] 关闭最后一个标签后，自动展示空状态占位（`Empty` 组件："没有打开的文档"）
- [ ] 标签切换时内容区有淡入过渡动画（与 `AnimatedTransition` 衔接）

## 优先级

P1 — 标签页工作区是复杂桌面应用的核心导航模式，能显著提升多任务处理效率。

## 参考实现

- Chrome / Safari 的标签页栏
- VS Code 的多编辑器工作区
- Figma 的文件标签页
- macOS 系统偏好设置的垂直图标标签
