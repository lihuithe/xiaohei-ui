# 205 侧边栏导航变体（Sidebar Navigation Variants）

## 功能名称

侧边栏导航变体 — 在现有 `Sidebar.vue` 和 `ui/sidebar/` 基础上，提供可拖拽调宽、多级嵌套树、迷你图标模式、可折叠分组、底部导航栏五种可复用导航布局。

## 功能背景/动机

现有脚手架已有一个基础的 `Sidebar.vue`（左侧 220px 固定宽度，支持整体收起/展开）以及一套完整的 `ui/sidebar/` 组件族（`SidebarProvider`、`SidebarMenu`、`SidebarMenuSub` 等）。但 `Sidebar.vue` 的交互模式较为单一，仅支持整体折叠；`ui/sidebar/` 组件虽然原子能力完整，却缺少**面向开发者的、开箱即用的布局级变体模板**。

桌面应用的导航需求非常多样：深度设置页需要树形多级菜单、仪表盘需要迷你图标栏节省空间、宽屏场景下用户希望拖拽调整侧边栏宽度。本功能将 `ui/sidebar/` 的原子能力封装为五种可直接使用的导航布局变体，减少开发者的组装成本。

## 功能描述

包含以下五种侧边栏/导航变体：

| 变体 | 说明 | 适用场景 |
|------|------|----------|
| `ResizableSidebarLayout` | 侧边栏宽度可鼠标拖拽调整，支持记忆上次宽度 | 需要灵活空间分配的 IDE 风格应用 |
| `TreeSidebarLayout` | 多级嵌套树形菜单，支持展开/收起子级 | 深层级设置、文件树、组织架构 |
| `MiniSidebarLayout` | 仅图标模式，hover 或 click 后展开浮层显示文字 | 仪表盘、工具类应用的主导航 |
| `CollapsibleGroupSidebarLayout` | 侧边栏内部分组可独立折叠，组内有子菜单 | 大型配置中心、插件管理 |
| `BottomNavLayout` | 底部导航栏（图标 + 文字），适合窄窗口或平板模式 | 响应式降级、触控优化模式 |

每种变体均内建：
- 与现有 `ui/sidebar/` 组件的无缝兼容
- 当前激活项高亮状态
- 展开/收起动画（与 102 页面切换动画编排共用缓动函数）
- 与 `App.vue` 主内容区的衔接约定（margin-left 自动适配）

## 目标用户

- 需要不同导航交互模式的桌面应用开发者
- 希望快速替换或升级现有 `Sidebar.vue` 的开发者

## 详细设计

### 布局结构描述

#### 1. 可拖拽调宽侧边栏（ResizableSidebarLayout）

```
+----------------------------------------------------------+
| Logo      App Name                           [=] [口] [x]  |  <- TitleBar
+----------------------------------------------------------+
|  Sidebar    |                                           |  |
| +---------+ |  Main Content Area                      |  |
| | Nav 1   | |                                           |  |
| | Nav 2 * | |                                           |  |
| | Nav 3   | |                                           |  |
| |         | |                                           |  |
| |         | |                                           |  |
| +---------+ |                                           |  |
|     ↑       |                                           |  |
|  ResizableHandle (2px 宽，hover 变宽 + 颜色高亮)         |  |
+----------------------------------------------------------+
```

#### 2. 树形多级侧边栏（TreeSidebarLayout）

```
+----------------------------------------------------------+
| +---------+                                              |
| | > 概览  |                                              |
| | v 设置  |                                              |
| |   ├─ 通用|                                              |
| |   ├─ 外观|                                              |
| |   └─ 通知|                                              |
| | > 数据  |                                              |
| |   ├─ 导入|                                              |
| |   └─ 导出|                                              |
| +---------+                                              |
+----------------------------------------------------------+
```

#### 3. 迷你图标侧边栏（MiniSidebarLayout）

```
+----------------------------------------------------------+
| +--+                                                     |
| |📁|  主内容区                                           |
| |⚙️|                                                     |
| |📊|                                                     |
| |👤|                                                     |
| +--+                                                     |
| 展开后浮层：                                              |
| +--+-------------------+                                 |
| |📁| 文件管理          |                                 |
| |⚙️| 系统设置          |                                 |
| +--+-------------------+                                 |
+----------------------------------------------------------+
```

#### 4. 可折叠分组侧边栏（CollapsibleGroupSidebarLayout）

```
+----------------------------------------------------------+
| +-----------------------+                                |
| ▼ 工作区                |                                |
|   项目 A                |                                |
|   项目 B                |                                |
| ▶ 收藏夹 (3)           |                                |
| ▶ 标签 (12)            |                                |
| ----------------------- |                                |
| ▼ 系统                  |                                |
|   设置                  |                                |
|   关于                  |                                |
| +-----------------------+                                |
+----------------------------------------------------------+
```

#### 5. 底部导航栏（BottomNavLayout）

```
+----------------------------------------------------------+
|                                                          |
|                       主内容区                            |
|                                                          |
|                                                          |
+----------------------------------------------------------+
|  [🏠 首页]  [🔍 搜索]  [➕ 新建]  [🔔 通知]  [👤 我的]  |
+----------------------------------------------------------+
```

### 涉及的技术点

- 使用现有 `ui/resizable/` 组件实现拖拽调宽（`ResizablePanelGroup` + `ResizableHandle`）
- 使用现有 `ui/sidebar/` 的 `SidebarMenuSub`、`SidebarMenuSubButton` 实现树形嵌套
- 使用现有 `ui/collapsible/` 实现分组折叠
- 使用 `Pinia` 存储侧边栏状态（宽度、展开项、激活项），支持持久化记忆
- 使用 CSS `transition` 实现宽度变化和内容区 `margin-left` 联动

### 与现有 layouts/ 的衔接

- 新增 `src/components/layouts/ResizableSidebarLayout.vue`
- 新增 `src/components/layouts/TreeSidebarLayout.vue`
- 新增 `src/components/layouts/MiniSidebarLayout.vue`
- 新增 `src/components/layouts/CollapsibleGroupSidebarLayout.vue`
- 新增 `src/components/layouts/BottomNavLayout.vue`
- 在 `src/components/layouts/index.ts` 中导出
- 均基于现有 `ui/sidebar/` 组件封装，不重复实现底层交互逻辑

### 需要新增/修改的文件

```
desktop-app/src/components/layouts/
  ├── ResizableSidebarLayout.vue         # 可拖拽调宽侧边栏
  ├── TreeSidebarLayout.vue              # 树形多级侧边栏
  ├── MiniSidebarLayout.vue              # 迷你图标侧边栏
  ├── CollapsibleGroupSidebarLayout.vue  # 可折叠分组侧边栏
  ├── BottomNavLayout.vue                # 底部导航栏
  └── index.ts                           # 追加导出

desktop-app/src/stores/
  └── sidebar.ts                         # 侧边栏状态（宽度、展开项记忆）
```

**Props 设计（以 ResizableSidebarLayout 为例）：**

```ts
interface ResizableSidebarLayoutProps {
  defaultWidth?: number       // 默认宽度，默认 260
  minWidth?: number           // 最小宽度，默认 200
  maxWidth?: number           // 最大宽度，默认 400
  rememberKey?: string        // localStorage key，默认 'sidebar-width'
}
```

## 验收标准

- [ ] 五种变体均能在 `ComponentPlayground` 中独立预览
- [ ] `ResizableSidebarLayout` 拖拽时实时反馈宽度变化，松开鼠标后记忆到 `localStorage`
- [ ] `TreeSidebarLayout` 支持无限层级嵌套，子级展开/收起有旋转箭头动画
- [ ] `MiniSidebarLayout` 在仅图标模式下，tooltip 或浮层面板显示完整菜单文字
- [ ] `CollapsibleGroupSidebarLayout` 各分组展开状态独立，互不影响
- [ ] `BottomNavLayout` 在窗口高度变化时保持固定底部，内容区自动留底边距
- [ ] 所有变体的激活项高亮颜色与当前主题 `primary` token 一致
- [ ] 与 `App.vue` 的 `--sidebar-w` CSS 变量衔接顺畅，无布局跳动

## 优先级

P0 — 导航是桌面应用的骨架，现有 `Sidebar.vue` 功能单薄，亟需变体扩展。

## 参考实现

- VS Code 的可调宽侧边栏
- Figma 的左侧面板（树形 + 可折叠分组）
- Linear 的迷你图标导航
- macOS 控件的底部 Tab Bar 模式
