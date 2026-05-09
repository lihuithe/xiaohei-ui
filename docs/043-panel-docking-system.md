# 面板停靠与浮动面板系统（Panel Docking & Floating Panels）

## 功能背景/动机

当前脚手架已包含 `Resizable` 组件（面板尺寸调整）和 `Sidebar`（侧边栏），但缺少**面板停靠系统（Docking System）**——这是专业桌面工具（VS Code、Figma、Blender）的核心布局特性。用户期望能够自由拖拽面板到窗口的不同区域（左/右/上/下）进行停靠，或让面板浮动为独立窗口，或堆叠为标签页组。目前项目中没有任何停靠相关的实现，所有布局都是固定的（如 Sidebar 始终在左侧）。提供一套面板停靠与浮动面板系统，能让开发者构建真正可自定义布局的桌面应用，这是区分「专业工具」与「普通 Web 应用」的关键特性。

## 功能描述

构建一套面向桌面应用的面板停靠与浮动布局系统：

1. **拖拽停靠（Drag-to-Dock）**：面板支持拖拽到窗口的四边（左/右/上/下）或中心区域进行停靠，拖拽过程中显示停靠区域高亮预览
2. **标签页组停靠（Tab Group Docking）**：多个面板可堆叠为标签页组停靠在同一区域，支持标签页切换、关闭、拖拽分离
3. **浮动面板（Floating Panel）**：面板可从停靠区拖拽分离为浮动面板，支持拖拽标题栏移动位置、拖拽边缘调整大小、双击标题栏最大化/还原
4. **面板尺寸记忆（Panel Size Memory）**：每个停靠区域的面板尺寸比例自动持久化，重启应用后恢复布局
5. **面板显隐控制（Panel Visibility Toggle）**：通过菜单或快捷键显示/隐藏特定面板（如 ⌘+B 显示/隐藏侧边栏），隐藏时布局自动重排
6. **最小化面板区（Minimized Panel Zone）**：面板可最小化为侧边条（只显示图标），点击图标展开，支持自动隐藏（鼠标离开后面板自动收起）

## 目标用户

- 构建 IDE、设计工具、数据可视化工具等需要复杂多面板布局的开发者
- 需要支持用户自定义界面布局并持久化的开发者
- 希望提供 VS Code 级窗口管理体验的桌面应用设计者

## 详细设计

### 交互流程

```
拖拽停靠：
用户按下「文件浏览器」面板的标题栏 → 开始拖拽
  → 拖拽过程中面板变为半透明幽灵卡片跟随鼠标
  → 鼠标靠近窗口左边缘 → 左半侧高亮为停靠预览区（半透明蓝色遮罩）
  → 鼠标靠近窗口右边缘 → 右半侧高亮
  → 鼠标靠近窗口顶部 → 上半侧高亮
  → 鼠标靠近窗口底部 → 下半侧高亮
  → 鼠标靠近窗口中心 → 中心区域高亮（与当前中心面板合并为标签页组）
  → 释放鼠标 → 面板停靠到对应区域
  → 现有布局自动调整尺寸以容纳新面板
  → 停靠后面板边缘出现 ResizableHandle，支持拖拽调整区域尺寸

标签页组停靠：
用户将「搜索面板」拖拽到已停靠的「文件浏览器」面板区域中心
  → 该区域高亮为「合并为标签页」预览
  → 释放后 → 「文件浏览器」和「搜索」合并为标签页组
  → 标签页头显示在面板顶部：「文件浏览器 | 搜索」
  → 点击标签页头切换内容
  → 拖拽标签页头可将面板从组中分离
  → 关闭组中最后一个面板 → 该区域被其他区域自动填充
  → 支持「全部关闭」和「关闭其他」快捷操作

浮动面板：
用户将已停靠的面板标题栏拖拽到窗口中央（非停靠区域）
  → 面板变为浮动状态，覆盖在其他内容之上
  → 浮动面板有独立标题栏（显示标题、最小化、最大化、关闭按钮）
  → 拖拽标题栏 → 移动面板位置（限制在窗口内）
  → 拖拽边缘/角落 → 调整面板大小（最小 200x150px）
  → 双击标题栏 → 面板最大化填充整个窗口（除保留的固定区域）
  → 再次双击 → 还原到之前的位置和尺寸
  → 再次拖拽回停靠区域 → 重新停靠
  → 支持多个浮动面板，后激活的层级更高（z-index）
  → 浮动面板最小化 → 收拢到窗口底部/侧边的最小化条

面板尺寸记忆：
用户调整左侧面板宽度为 280px
  → 尺寸变化 1 秒后自动保存：{ layout: { left: { size: 280 }, center: { ratio: 0.7 } } }
  → 保存到 localStorage 或 electron-store
  → 应用重启后 → 读取布局配置 → 按保存的尺寸恢复面板分割
  → 如窗口尺寸变化导致保存的尺寸不合理（如左侧面板 > 窗口宽度的 50%）
    → 自动调整为合理比例（如 max 40%）
  → 提供「恢复默认布局」按钮

面板显隐控制：
用户按 ⌘+B → 切换「文件浏览器」面板的显示/隐藏
  → 隐藏时：面板平滑滑出（200ms），主内容区自动扩展填充空间
  → 显示时：面板平滑滑入，主内容区自动收缩
  → 菜单栏「视图」菜单中列出所有面板，带勾选标记显示状态
  → 点击菜单项 → 切换对应面板的显隐
  → 支持通过右键菜单快捷隐藏面板

最小化面板区：
用户点击面板标题栏的最小化按钮 → 面板收拢为侧边图标条
  → 图标条位于窗口左侧边缘（或底部边缘），只显示面板图标
  → 鼠标悬停图标 → 面板临时展开（覆盖模式，不推动其他面板）
  → 鼠标离开面板区域 → 如配置了 autoHide，面板自动收起
  → 点击图标 → 面板固定展开（不再自动收起）
  → 再次点击最小化按钮 → 恢复为常驻停靠状态
  → 支持「自动隐藏」模式：面板常驻展开，鼠标离开后面板自动滑出
```

### 涉及的技术点

- **分层面板布局算法**：基于 CSS Grid 或 Flexbox 的动态布局计算，支持四边 + 中心的嵌套分割
- **拖拽停靠检测**：计算鼠标位置与窗口边界的距离，判断应停靠到哪个区域
- **标签页组管理**：面板容器支持两种模式——单面板模式和标签页组模式，动态切换
- **浮动面板层级**：全局 z-index 管理，激活的浮动面板置顶
- **尺寸约束与自适应**：面板尺寸设置 min/max 约束，窗口 resize 时按比例重算

### 与现有架构的衔接方式

| 现有模块 | 衔接方式 |
|---------|---------|
| `src/components/ui/resizable/` | 停靠区域间的尺寸调整复用 ResizablePanel/ResizableHandle |
| `src/components/ui/tabs/` | 标签页组的面板切换复用 Tabs 组件 |
| `src/components/ui/sheet/` | 面板最小化后的临时展开可用 Sheet 实现 |
| `src/composables/useDraggablePosition.ts`（034）| 浮动面板的拖拽移动 |
| `src/composables/useDialogStack.ts`（030/036）| 浮动面板的层级管理 |
| `src/utils/storage.ts` | 布局配置的持久化存储 |

### 需要新增/修改的文件

**新增文件：**
- `src/components/dock/DockLayout.vue` — 停靠布局根容器
- `src/components/dock/DockPanel.vue` — 停靠面板组件
- `src/components/dock/DockZone.vue` — 停靠区域容器（左/右/上/下/中心）
- `src/components/dock/DockTabGroup.vue` — 标签页组容器
- `src/components/dock/DockFloatingPanel.vue` — 浮动面板组件
- `src/components/dock/DockMinimizedBar.vue` — 最小化面板图标条
- `src/components/dock/DockDropPreview.vue` — 拖拽停靠预览高亮组件
- `src/composables/useDockLayout.ts` — 停靠布局核心 composable
- `src/composables/useDockPanel.ts` — 单面板逻辑 composable
- `src/types/dock.ts` — 面板停靠系统类型定义

**修改文件：**
- `src/App.vue` — 可选接入 DockLayout 作为应用根布局替代固定布局
- `src/components/TitleBar.vue` — 可选添加视图菜单的面板显隐控制

### 核心数据结构

```typescript
// src/types/dock.ts
export type DockZoneType = 'left' | 'right' | 'top' | 'bottom' | 'center'

export interface DockPanelDef {
  id: string
  title: string
  icon?: string
  component: Component
  defaultZone?: DockZoneType
  defaultSize?: number            // 像素或百分比
  minSize?: number
  maxSize?: number
  closable?: boolean
  floating?: boolean
  minimized?: boolean
  order?: number                  // 在同区域中的排序
}

export interface DockZoneState {
  type: DockZoneType
  size: number                    // 像素（边侧）或比例（中心）
  panels: string[]                // 面板 ID 列表（标签页组）
  activePanel?: string            // 当前激活的面板
  visible: boolean
  autoHide?: boolean
}

export interface DockLayoutState {
  zones: Record<DockZoneType, DockZoneState>
  floatingPanels: Array<{
    panelId: string
    x: number
    y: number
    width: number
    height: number
    zIndex: number
    maximized?: boolean
  }>
  minimizedPanels: string[]
}

export interface DockOptions {
  panels: DockPanelDef[]
  defaultLayout?: Partial<DockLayoutState>
  persistKey?: string
  enableFloating?: boolean
  enableMinimized?: boolean
}
```

### 关键实现策略

1. **布局容器使用 CSS Grid**：根布局使用 CSS Grid 定义 5 个区域（left / right / top / bottom / center），通过动态调整 `grid-template-columns` 和 `grid-template-rows` 实现面板尺寸调整。相比嵌套 Flexbox，Grid 更直观地支持四边+中心的布局模型
2. **停靠预览的坐标检测**：拖拽时根据鼠标坐标与窗口边界的相对位置判断停靠区域。设定阈值：距离边缘 < 100px 视为停靠到该边；距离中心 < 200px 视为合并到中心标签页组。预览遮罩使用固定定位的半透明 div，通过改变 `inset` 值展示停靠位置
3. **标签页组的动态切换**：DockPanel 容器支持两种渲染模式——直接渲染内容（单面板）或渲染 Tabs 组件（多面板）。当 panels 数组长度为 1 时隐藏 Tabs 头，>1 时显示。这样避免为单面板付出 Tabs 的开销
4. **浮动面板的约束**：浮动面板的 `x/y/width/height` 始终限制在视口范围内。窗口 resize 时自动调整超出边界的浮动面板。最大化时记录之前的尺寸，还原时恢复
5. **布局持久化安全**：保存的布局数据包含版本号，升级应用后如布局结构变化，自动迁移到新的默认布局。避免旧版布局数据导致新版应用崩溃

## 验收标准

- [ ] 提供 `DockLayout` 组件，支持左/右/上/下/中心五区域面板停靠
- [ ] 支持拖拽面板到窗口边缘停靠，拖拽过程中显示停靠区域预览高亮
- [ ] 支持多个面板合并为标签页组停靠在同一区域，支持标签切换和拖拽分离
- [ ] 支持面板从停靠区拖拽分离为浮动面板，支持拖拽移动和调整大小
- [ ] 浮动面板支持双击最大化/还原，支持最小化到侧边图标条
- [ ] 支持面板显隐快捷键切换（如 ⌘+B 切换侧边栏），隐藏时布局自动重排
- [ ] 支持面板尺寸和布局自动持久化，重启后恢复
- [ ] 支持「恢复默认布局」功能
- [ ] 支持最小化面板的自动隐藏模式（鼠标离开自动收起）
- [ ] 支持多个浮动面板的层级管理（激活置顶）
- [ ] 包含至少 4 个使用示例（IDE 布局、设计工具布局、数据看板、最小化面板）

## 优先级

**P0** — 面板停靠系统是专业桌面工具的标志性特性，目前项目中完全没有相关实现；这是将模板从「普通 Web 应用」提升为「专业桌面工具」的关键能力，能显著增强模板对 IDE、设计工具、数据工具类应用的支持。

## 参考实现

- [VS Code Workbench Layout](https://code.visualstudio.com/docs/getstarted/userinterface) — 面板停靠的行业标杆
- [Figma Panel System](https://help.figma.com/hc/en-us/articles/360039957894) — 设计工具的左右面板布局
- [GrapesJS Panels](https://grapesjs.com/docs/modules/Panels.html) — Web 构建器的面板停靠系统
- [Golden Layout](https://golden-layout.com/) — JavaScript 面板布局管理库
- [React Mosaic](https://github.com/nomcopter/react-mosaic) — React 面板停靠实现参考
