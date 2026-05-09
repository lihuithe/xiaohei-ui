# 响应式窗口自适应布局系统

## 功能背景/动机

当前脚手架虽然使用了部分 Tailwind 响应式类（如 `lg:hidden`、`md:grid-cols-2`），但这些是基于**视口宽度（viewport width）** 的 Web 思维。Electron 桌面应用的窗口尺寸是**动态可变的**，用户可能：
- 将窗口缩到 600px 宽（类似手机竖屏）
- 将窗口拉到超宽屏（3000px+）
- 在多显示器间拖拽，DPI 和缩放比例不同

现有的响应式方案没有针对「窗口级别」做精细适配：
- 侧边栏在小窗口下不会自动折叠，而是被压缩或溢出
- 没有窗口断点（breakpoint）的概念，无法根据窗口尺寸切换布局策略
- 没有监听 `resize` 并 debounce 的封装
- DashboardLayout 等内容区在小窗口下会出现严重的水平溢出或元素重叠

提供一套**响应式窗口自适应布局系统**，是桌面应用脚手架区别于普通 Web 模板的关键能力。

## 功能描述

构建一套**响应式窗口自适应布局系统**，包含：
1. **窗口尺寸感知 Composable**：`useWindowSize()` 提供响应式的窗口宽高、断点级别、DPR 等信息，且性能友好（debounced/throttled）。
2. **桌面应用专用断点体系**：定义 `compact` (< 768px)、`medium` (768-1200px)、`expanded` (1200-1600px)、`large` (> 1600px) 等窗口断点，替代基于 viewport 的 Web 断点。
3. **侧边栏自适应策略**：
   - `compact`：侧边栏自动折叠为图标栏或完全隐藏（可通过汉堡菜单唤起）。
   - `medium`：侧边栏保持展开，但宽度从 220px 收缩为 180px。
   - `expanded/large`：侧边栏可支持可拖拽调整宽度（Resizable）。
4. **内容区自适应**：
   - 网格布局根据窗口宽度动态调整列数（如卡片网格从 1 -> 2 -> 3 -> 4 列）。
   - 表格在小窗口下自动切换为卡片列表或横向滚动。
5. **布局模板增强**：在 `DashboardLayout`、`DataTableLayout` 中内置断点响应逻辑，开发者开箱即用。
6. **缩放比例适配**：监听 `window.devicePixelRatio` 变化，在高 DPR 屏幕上自动调整边框粗细、阴影模糊度等细节。

## 目标用户

- **需要适配多种窗口尺寸的桌面应用开发者**。
- **需要在笔记本小屏和大屏显示器上都表现良好的产品**。
- **希望减少手写 resize 监听和断点判断的开发者**。

## 详细设计

### 交互流程

1. 应用启动时，`useWindowSize()` 初始化，监听 Electron 主进程通过 IPC 发送的窗口尺寸变化（比渲染进程 `window.resize` 更精确、无延迟）。
2. `useBreakpoint()` 根据当前窗口宽度计算断点级别，返回 `isCompact`、`isMedium`、`isExpanded`、`isLarge` 等布尔值。
3. `Sidebar.vue` 监听断点：
   - 当进入 `compact`，自动触发 `collapsed = true`，并在 header 显示汉堡菜单按钮。
   - 当回到 `medium+`，根据用户上次手动状态决定是否展开。
4. `DashboardLayout` 中的统计卡片网格：
   - `compact`: 1 列
   - `medium`: 2 列
   - `expanded`: 3 列
   - `large`: 4 列
5. 用户拖拽窗口边框时，布局平滑过渡，无卡顿（resize 事件 throttle 至 100ms）。

### 涉及的技术点

- **Electron IPC 窗口尺寸同步**：主进程在 `BrowserWindow` 的 `resize` 事件中通过 `webContents.send('window:resize', { width, height })` 通知渲染进程，避免渲染进程频繁读取 `window.innerWidth` 导致的布局抖动。
- **Debounced/Throttled Resize**：若使用渲染进程监听，需使用 `useThrottleFn`（@vueuse）限制回调频率。
- **CSS Container Queries**：对于组件内部自适应，优先使用 CSS Container Queries（`@container`），减少 JS 参与。Tailwind v4 已支持 `@max-md:` 等容器查询变体。
- **Resizable Sidebar**：利用已有的 `ResizableHandle` / `ResizablePanel` 组件（shadcn-vue 已提供），给侧边栏增加可拖拽调整宽度的能力，并将用户偏好保存到 `localStorage`。
- **DPR 感知样式**：通过 `window.devicePixelRatio` 动态调整细边框（`border-subtle` vs `border-default`），避免在高 DPR 屏幕上边框过粗。

### 与现有架构的衔接方式

- **新增 `src/composables/useWindowSize.ts`**：
  - 监听 IPC `window:resize` 或 DOM `resize`。
  - 导出 `{ width, height, dpr }`。
- **新增 `src/composables/useBreakpoint.ts`**：
  - 基于 `useWindowSize` 计算断点。
  - 导出 `breakpoint`、`isCompact`、`isMedium` 等。
- **修改 `electron/main.ts`**：
  - 在 `BrowserWindow` 的 `resize` 事件中增加 `webContents.send('window:resize', bounds)`。
- **修改 `electron/preload.cjs`**：
  - 暴露 `onWindowResize(callback)` 接口。
- **修改 `src/components/Sidebar.vue`**：
  - 接入 `useBreakpoint`，实现自动折叠/展开。
  - 接入 `ResizableHandle`，支持拖拽调整宽度。
- **修改 `src/components/layouts/DashboardLayout.vue`**：
  - 使用断点响应式网格类替代固定网格。
- **修改 `src/components/layouts/DataTableLayout.vue`**：
  - 小窗口下表格自动切换为卡片视图或横向滚动。

### 需要新增/修改的文件

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/composables/useWindowSize.ts` | 新增 | 窗口尺寸监听 |
| `src/composables/useBreakpoint.ts` | 新增 | 断点计算 |
| `electron/main.ts` | 修改 | 窗口 resize IPC 事件 |
| `electron/preload.cjs` | 修改 | 暴露 resize 监听 API |
| `src/components/Sidebar.vue` | 修改 | 自适应折叠 + 可拖拽宽度 |
| `src/components/layouts/DashboardLayout.vue` | 修改 | 断点响应式网格 |
| `src/components/layouts/DataTableLayout.vue` | 修改 | 小屏表格适配 |
| `src/stores/app.ts` | 修改 | 保存 sidebarWidth 偏好 |

## 验收标准

- [ ] 窗口宽度 < 768px 时，Sidebar 自动折叠，header 出现汉堡菜单。
- [ ] 窗口宽度恢复后，Sidebar 根据用户历史偏好自动恢复（除非用户从未设置过则默认展开）。
- [ ] DashboardLayout 的统计卡片网格根据窗口宽度在 1/2/3/4 列间自动切换。
- [ ] DataTableLayout 在 compact 模式下自动切换为卡片列表视图或启用横向滚动。
- [ ] Sidebar 支持鼠标拖拽调整宽度，最小 160px，最大 400px，偏好持久化。
- [ ] 窗口拖拽缩放时布局更新流畅，无频繁重排导致的卡顿（resize 事件节流 ≤ 100ms）。
- [ ] 高 DPR 屏幕（如 Retina）下细边框和阴影渲染清晰，不出现模糊或过粗。

## 优先级

P0

## 参考实现

- [Electron BrowserWindow Bounds](https://www.electronjs.org/docs/latest/api/browser-window#wingetbounds)：获取窗口尺寸的官方 API。
- [VueUse useWindowSize](https://vueuse.org/core/useWindowSize/)：响应式窗口尺寸参考实现。
- [Tailwind CSS Container Queries](https://tailwindcss.com/docs/container-queries)：容器查询工具类文档。
- [shadcn-vue Resizable](https://www.shadcn-vue.com/docs/components/resizable.html)：可拖拽面板组件实现。
- [macOS AppKit Responsive Layout](https://developer.apple.com/design/human-interface-guidelines/layout)：桌面应用响应式布局设计参考。
