# 209 分屏/双栏编辑布局（Split Pane Layout）

## 功能名称

分屏/双栏编辑布局 — 提供左右分屏、上下分屏、三栏 IDE 式布局三种可复用骨架。

## 功能背景/动机

桌面应用中大量场景需要"并排对比"或"实时预览"的编辑体验：Markdown 编辑与预览、JSON 编辑与格式化结果、代码与文档对照、双文档对比等。现有脚手架已有 `ResizablePanelGroup` 组件（`ui/resizable/`），但缺少**面向编辑场景的分屏页面模板**。开发者需要自行处理分屏比例记忆、同步滚动、焦点切换等通用问题。

本功能提供专门面向"编辑+预览"场景的分屏布局模板，与通用的 `ResizableSidebarLayout`（侧重导航）形成互补。

## 功能描述

包含以下三种分屏布局变体：

| 变体 | 说明 | 适用场景 |
|------|------|----------|
| `SplitPaneHorizontalLayout` | 左右分屏，可拖拽调整比例 | Markdown 编辑器、代码预览、文档对比 |
| `SplitPaneVerticalLayout` | 上下分屏，可拖拽调整比例 | 表单预览、长文档分段编辑 |
| `SplitPaneTripleLayout` | 左中右三栏，两侧可收起 | IDE 式布局（文件树 + 编辑器 + 预览/属性） |

每种布局均内建：
- 分屏拖拽手柄（与 `ResizableHandle` 视觉一致）
- 比例记忆（localStorage）
- 面板折叠/展开按钮（收起一侧后另一侧自动填满）
- 同步滚动锚点（可选 props 开启）
- 面板标题栏（标题 + 操作按钮占位）

## 目标用户

- 需要实现编辑器、预览器、对比工具的开发者
- 需要 IDE 式工作区布局的开发者

## 详细设计

### 布局结构描述

#### 1. 左右分屏（SplitPaneHorizontalLayout）

```
+----------------------------------------------------------+
| 标题栏                                    [预览 ▼] [设置] |
+----------------------------------------------------------+
| 左面板 (50%)    ||    右面板 (50%)                      |
| +-------------+  ||  +-------------+                     |
| | # 标题      |  ||  | <h1>标题</h1>|                     |
| |             |  ||  |             |                     |
| | 内容...     |  ||  | 渲染内容... |                     |
| |             |  ||  |             |                     |
| +-------------+  ||  +-------------+                     |
|                  ↑                                      |
|           ResizableHandle                               |
|  [← 收起]              [收起 →]                         |
+----------------------------------------------------------+
```

#### 2. 上下分屏（SplitPaneVerticalLayout）

```
+----------------------------------------------------------+
| 编辑区                                                   |
| +------------------------------------------------------+ |
| | 表单字段...                                           | |
| +------------------------------------------------------+ |
| ↑ ResizableHandle                                       |
| 预览区                                                   |
| +------------------------------------------------------+ |
| | 实时预览结果...                                       | |
| +------------------------------------------------------+ |
+----------------------------------------------------------+
```

#### 3. 三栏 IDE 式（SplitPaneTripleLayout）

```
+----------------------------------------------------------+
| 左侧面板    | 中间面板        | 右侧面板                  |
| (可收起)    | (主编辑区)      | (可收起)                  |
| +---------+ | +-------------+ | +-------------+          |
| | 文件树  | | |             | | | 属性面板   |          |
| | - src   | | |  主内容     | | | - 尺寸     |          |
| | - docs  | | |             | | | - 颜色     |          |
| +---------+ | +-------------+ | +-------------+          |
|             |                 |                          |
| [<- 收起]   |                 |   [收起 ->]              |
+----------------------------------------------------------+
```

### 涉及的技术点

- 使用现有 `ui/resizable/` 组件作为底层拖拽实现
- 使用 `localStorage` 记忆各面板尺寸比例
- 使用 CSS Grid 或 Flex 实现面板收起后的空间重新分配
- 面板标题栏使用 `flex` 布局，支持 `#panel-header-left/right` slot
- 可选的同步滚动：通过 `scrollTop` 比例映射实现（通过 props 开启，不强制绑定）

### 与现有 layouts/ 的衔接

- 新增 `src/components/layouts/SplitPaneHorizontalLayout.vue`
- 新增 `src/components/layouts/SplitPaneVerticalLayout.vue`
- 新增 `src/components/layouts/SplitPaneTripleLayout.vue`
- 在 `src/components/layouts/index.ts` 中导出
- 可与 `FormWizardLayout` 组合（向导的某一步使用分屏编辑）

### 需要新增/修改的文件

```
desktop-app/src/components/layouts/
  ├── SplitPaneHorizontalLayout.vue   # 左右分屏
  ├── SplitPaneVerticalLayout.vue     # 上下分屏
  ├── SplitPaneTripleLayout.vue       # 三栏 IDE 式
  └── index.ts                        # 追加导出
```

**Props 设计（以 SplitPaneHorizontalLayout 为例）：**

```ts
interface SplitPaneHorizontalLayoutProps {
  defaultLeftRatio?: number    // 左侧面板默认占比，默认 50
  minLeftRatio?: number        // 最小占比，默认 20
  maxLeftRatio?: number        // 最大占比，默认 80
  rememberKey?: string         // localStorage key，默认 'split-h-ratio'
  leftCollapsible?: boolean    // 左侧面板是否可收起，默认 true
  rightCollapsible?: boolean   // 右侧面板是否可收起，默认 true
  syncScroll?: boolean         // 是否开启同步滚动，默认 false
}

// Slot 约定
// #left-header   — 左侧面板标题栏
// #left          — 左侧面板内容
// #right-header  — 右侧面板标题栏
// #right         — 右侧面板内容
```

## 验收标准

- [ ] 三种布局均能在 `ComponentPlayground` 中独立预览
- [ ] 拖拽分屏手柄时，两侧面板实时响应，无卡顿
- [ ] 收起一侧面板后，另一侧自动填满剩余空间，且显示"展开"按钮
- [ ] 刷新页面后，分屏比例自动恢复到上次记忆的值
- [ ] 三栏布局的中间面板最小宽度保证内容可读（不小于 320px）
- [ ] 同步滚动模式下，两侧滚动位置按比例保持一致（误差小于 5%）
- [ ] 所有面板标题栏的操作按钮区支持 `#panel-header-actions` slot
- [ ] 暗色模式下拖拽手柄的视觉对比度足够明显

## 优先级

P1 — 分屏布局是编辑器类、生产力类桌面应用的核心，但通用性不如表单和导航。

## 参考实现

- VS Code 的编辑器分屏
- Notion 的双栏文档编辑
- macOS Preview 的 Markup 工具栏 + 内容区
- GitHub 的 PR 文件对比分屏
