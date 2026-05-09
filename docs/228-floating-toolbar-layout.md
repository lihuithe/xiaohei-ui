# 228 侧边浮动面板/工具栏布局（Floating Toolbar & Side Panel Layout）

## 功能名称

侧边浮动面板/工具栏布局 — 提供悬浮工具栏、可收起侧边面板、上下文属性面板三种可复用骨架。

## 功能背景/动机

现有脚手架已有 `ui/sheet/`（侧边浮层）和 `210-drawer-overlay-layouts`（抽屉布局），但抽屉通常用于承载完整的子页面（如详情、筛选），而**浮动工具栏和属性面板**则需要更轻量、更紧密贴合工作区的交互模式：它们不遮挡主内容区，可以悬浮在边缘，也可以根据当前选中的对象动态展示相关操作。

本功能提供三种轻量级浮动面板的布局模板，与重型抽屉（Drawer）形成互补，覆盖"常驻工具"、"上下文操作"、"快速属性编辑"等场景。

## 功能描述

包含以下三种浮动面板/工具栏布局变体：

| 变体 | 说明 | 适用场景 |
|------|------|----------|
| `FloatingToolbarLayout` | 悬浮工具栏：可拖拽位置的浮动按钮组，支持展开/收起 | 快捷操作、格式刷、常用工具 |
| `CollapsibleSidePanelLayout` | 可收起侧边面板：点击图标展开为面板，再次点击收起为细条 | 图层面板、历史记录、大纲导航 |
| `ContextPropertyPanelLayout` | 上下文属性面板：选中对象后自动展示相关属性，未选中时隐藏或显示提示 | 设计工具、表单构建器、配置编辑器 |

每种布局均内建：
- 展开/收起的平滑动画
- 位置记忆（拖拽后的位置或收起前的宽度）
- 与主内容区的安全间距（不遮挡关键内容）
- 暗色/亮色主题适配

## 目标用户

- 需要实现快捷工具栏、属性面板、上下文操作区的开发者
- 希望减少页面跳转、提升操作效率的创作类应用开发者

## 详细设计

### 布局结构描述

#### 1. 悬浮工具栏（FloatingToolbarLayout）

```
+--------------------------------------------------+
|                                                  |
|              主内容区                             |
|                                                  |
|       +------------------+                       |
|       │ [✂️] [🖌️] [📝]   │  ← 悬浮工具栏        |
|       │ [➕]             │     （可拖拽位置）    |
|       +------------------+                       |
|                                                  |
|              +------------------+                |
|              │  展开后的工具面板   │                |
|              │  ┌──────────────┐ │                |
|              │  │ 常用工具     │ │                |
|              │  │ [A] [B] [C]  │ │                |
|              │  │ 最近使用     │ │                |
|              │  │ [X] [Y] [Z]  │ │                |
|              │  └──────────────┘ │                |
|              +------------------+                |
|                                                  |
+--------------------------------------------------+
```

#### 2. 可收起侧边面板（CollapsibleSidePanelLayout）

```
+--------------------------------------------------+
| 主内容区              |  侧边面板（展开状态）       |
|                       |  ┌─────────────────────┐  |
|                       |  │ 图层               │  |
|                       |  │ ▼ 背景             │  |
|                       |  │   □ 矩形 1         │  |
|                       |  │   □ 椭圆 2         │  |
|                       |  │ ▶ 文字层           │  |
|                       |  │                    │  |
|                       |  │ 历史记录           │  |
|                       |  │ • 移动矩形         │  |
|                       |  │ • 修改颜色         │  |
|                       |  └─────────────────────┘  |
+--------------------------------------------------+

收起后：
+--------------------------------------------------+
| 主内容区              ||                          |
|                       ||  [图层] [历史]           |
|                       ||  ← 窄条图标栏，点击展开   |
+--------------------------------------------------+
```

#### 3. 上下文属性面板（ContextPropertyPanelLayout）

```
+--------------------------------------------------+
| 主内容区              |  属性面板                  |
|                       |                            |
|   ┌──────┐            |  未选中对象                |
|   │ 矩形 │  ← 选中    |  选择一个对象以编辑属性    |
|   └──────┘            |                            |
|                       |  ───────────────────────   |
|                       |                            |
|   ┌──────┐            |  矩形属性                  |
|   │ 椭圆 │  ← 选中    |  宽度: [100    ]           |
|   └──────┘            |  高度: [80     ]           |
|                       |  填充: [● 红色 ▼]          |
|                       |  描边: [2px    ]           |
|                       |  圆角: [4px    ]           |
+--------------------------------------------------+
```

### 涉及的技术点

- 使用 `fixed` 或 `absolute` 定位实现浮动工具栏的悬浮效果
- 使用 `ResizablePanelGroup` 实现侧边面板的拖拽调宽
- 使用 `ui/tabs/` 在侧边面板内切换不同功能模块（图层、历史、属性）
- 使用 `ui/tooltip/` 为收起状态的图标按钮提供提示
- 使用 `ScrollArea` 处理展开后面板内的长列表滚动
- 使用 CSS `transition` 实现展开/收起的宽度动画

### 与现有 layouts/ 的衔接

- 新增 `src/components/layouts/FloatingToolbarLayout.vue`
- 新增 `src/components/layouts/CollapsibleSidePanelLayout.vue`
- 新增 `src/components/layouts/ContextPropertyPanelLayout.vue`
- 在 `src/components/layouts/index.ts` 中导出
- `CollapsibleSidePanelLayout` 可与 `ClassicCanvasLayout`（224）组合（画布编辑器的图层面板）
- `ContextPropertyPanelLayout` 可与 `DetailSplitLayout`（201）组合（选中列表项后展示属性）
- `FloatingToolbarLayout` 可与 `ImmersiveCanvasLayout`（224）组合（沉浸模式下的快捷工具）

### 需要新增/修改的文件

```
desktop-app/src/components/layouts/
  ├── FloatingToolbarLayout.vue     # 悬浮工具栏
  ├── CollapsibleSidePanelLayout.vue # 可收起侧边面板
  ├── ContextPropertyPanelLayout.vue # 上下文属性面板
  └── index.ts                      # 追加导出
```

**Props 设计（以 CollapsibleSidePanelLayout 为例）：**

```ts
interface SidePanelTab {
  id: string
  label: string
  icon: Component
}

interface CollapsibleSidePanelLayoutProps {
  tabs: SidePanelTab[]
  defaultExpanded?: boolean
  defaultWidth?: number      // 展开宽度，默认 280
  collapsedWidth?: number    // 收起宽度，默认 48
  position?: 'left' | 'right'// 面板位置，默认 right
  rememberKey?: string       // localStorage key
}

// Slot 约定
// #tab-{id}     — 各标签页的内容
// #collapsed    — 完全收起时的自定义内容（覆盖默认图标栏）
```

## 验收标准

- [ ] 三种布局均能在 `ComponentPlayground` 中独立预览
- [ ] `FloatingToolbarLayout` 支持鼠标拖拽改变位置，拖拽时有半透明阴影反馈
- [ ] `CollapsibleSidePanelLayout` 展开/收起动画时长 200ms，使用 ease-out 缓动
- [ ] `CollapsibleSidePanelLayout` 收起后仅显示图标，hover 图标显示 tooltip
- [ ] `ContextPropertyPanelLayout` 在选中对象变化时，属性面板内容在 150ms 内淡入切换
- [ ] 未选中对象时，`ContextPropertyPanelLayout` 显示友好的空状态提示（不显示空白）
- [ ] 面板宽度记忆到 `localStorage`，刷新后恢复上次状态
- [ ] 暗色模式下浮动面板的阴影和边框对比度适配

## 优先级

P1 — 浮动面板是创作类、设计类桌面应用的核心交互模式。

## 参考实现

- Figma 的右侧属性面板和左侧面板收起态
- Sketch 的浮动工具栏
- Photoshop 的可收起面板组
- VS Code 的侧边活动栏（图标 + 展开面板）
