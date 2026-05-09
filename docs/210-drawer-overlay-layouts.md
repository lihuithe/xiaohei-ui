# 210 抽屉与浮层布局变体（Drawer & Overlay Layouts）

## 功能名称

抽屉与浮层布局变体 — 提供侧边抽屉、底部弹窗、全屏覆盖层、浮动操作按钮四种浮层布局模板。

## 功能背景/动机

现有脚手架已具备完整的 `ui/drawer/`（抽屉）、`ui/sheet/`（侧边浮层）、`ui/dialog/`（对话框）组件族，但缺少**页面级的浮层布局模板**。在实际开发中，浮层往往承载完整的子页面（如设置抽屉、详情抽屉、新建表单底部弹窗），开发者需要反复组装相同的结构：头部标题 + 关闭按钮、内容区滚动处理、底部操作栏、遮罩层点击关闭等。

本功能将这些高频组合抽象为 Layout 组件，统一浮层的结构规范、动画行为和响应式策略。

## 功能描述

包含以下四种浮层布局变体：

| 变体 | 说明 | 适用场景 |
|------|------|----------|
| `SideDrawerLayout` | 从左侧或右侧滑出的抽屉，带标题栏和底部操作区 | 详情查看、筛选面板、设置抽屉 |
| `BottomSheetLayout` | 从底部滑出的弹窗，支持多档高度（peek/half/expanded） | 移动端适配、操作确认、快捷新建 |
| `FullscreenOverlayLayout` | 全屏覆盖层，带顶部工具栏和返回按钮 | 沉浸式编辑、媒体浏览、聚焦模式 |
| `FloatingActionLayout` | 浮动操作按钮 + 展开的次级操作菜单 | 快捷创建、批量操作入口 |

每种布局均内建：
- 统一的头部结构（标题 + 关闭/返回按钮 + 可选操作按钮）
- 内容区独立滚动（`ScrollArea` 包裹）
- 底部操作栏（吸底或跟随内容）
- 遮罩层点击关闭（可配置）
- 进入/退出动画（与 `AnimatedTransition` 衔接）

## 目标用户

- 需要在当前页面上叠加详情、表单、筛选面板的开发者
- 需要实现移动端风格底部弹窗的开发者
- 需要全屏沉浸式编辑模式的开发者

## 详细设计

### 布局结构描述

#### 1. 侧边抽屉（SideDrawerLayout）

```
+--------------------------------+---------------+
| 主内容区（遮罩变暗）            | 抽屉 (400px)  |
|                                | +-----------+ |
|                                | | × 标题   […]| |
|                                | +-----------+ |
|                                | |           | |
|                                | |  内容区   | |
|                                | |  (滚动)   | |
|                                | |           | |
|                                | +-----------+ |
|                                | [取消][保存]  |
|                                +---------------+
+--------------------------------+
```

#### 2. 底部弹窗（BottomSheetLayout）

```
+--------------------------------------------------+
| 主内容区（遮罩变暗）                              |
|                                                  |
| +----------------------------------------------+ |
| | ━━ 拖拽指示条                                 | |
| |                                              | |
| | 底部弹窗标题                                  | |
| |                                              | |
| | 内容区...                                     | |
| |                                              | |
| |                               [取消] [确认]   | |
| +----------------------------------------------+ |
+--------------------------------------------------+
```

#### 3. 全屏覆盖层（FullscreenOverlayLayout）

```
+--------------------------------------------------+
| [← 返回]  标题                           [保存]  |
+--------------------------------------------------+
|                                                  |
|                                                  |
|              全屏内容区                          |
|              （无边界，最大化利用空间）            |
|                                                  |
|                                                  |
+--------------------------------------------------+
```

#### 4. 浮动操作按钮（FloatingActionLayout）

```
+--------------------------------------------------+
|                                                  |
|              主内容区                             |
|                                                  |
|                                                  |
|                              +--------+          |
|                              |   +    |  <- 主 FAB |
|                              +--------+          |
|                             /    |    \          |
|                    +------+ +------+ +------+    |
|                    | 新建 | | 导入 | | 模板 |    |
|                    +------+ +------+ +------+    |
|                                                  |
+--------------------------------------------------+
```

### 涉及的技术点

- 使用现有 `ui/drawer/` 组件作为 `SideDrawerLayout` 和 `BottomSheetLayout` 的底层
- 使用现有 `ui/sheet/` 组件作为轻量级侧边浮层的替代选项
- 使用现有 `ui/dialog/` 的 `DialogOverlay` 作为遮罩层
- 使用现有 `ScrollArea` 包裹内容区
- 使用 `v-model` 控制显示/隐藏，与父组件状态双向绑定
- `BottomSheetLayout` 支持三档高度：peek（约 20%）、half（约 50%）、expanded（约 90%）

### 与现有 layouts/ 的衔接

- 新增 `src/components/layouts/SideDrawerLayout.vue`
- 新增 `src/components/layouts/BottomSheetLayout.vue`
- 新增 `src/components/layouts/FullscreenOverlayLayout.vue`
- 新增 `src/components/layouts/FloatingActionLayout.vue`
- 在 `src/components/layouts/index.ts` 中导出
- `SideDrawerLayout` 可与 `DetailSplitLayout` 配合使用（窄屏下将右侧详情转为抽屉）

### 需要新增/修改的文件

```
desktop-app/src/components/layouts/
  ├── SideDrawerLayout.vue          # 侧边抽屉骨架
  ├── BottomSheetLayout.vue         # 底部弹窗骨架
  ├── FullscreenOverlayLayout.vue   # 全屏覆盖层骨架
  ├── FloatingActionLayout.vue      # 浮动操作按钮骨架
  └── index.ts                      # 追加导出
```

**Props 设计（以 BottomSheetLayout 为例）：**

```ts
interface BottomSheetLayoutProps {
  modelValue: boolean
  title?: string
  snapPoints?: number[]        // 停靠高度占比，如 [25, 50, 90]
  defaultSnap?: number         // 默认停靠点索引
  showHandle?: boolean         // 是否显示顶部拖拽条，默认 true
  closeOnOverlayClick?: boolean // 点击遮罩关闭，默认 true
  showFooter?: boolean         // 是否显示底部操作栏，默认 true
}

// Slot 约定
// #header-left    — 头部左侧（替代默认标题）
// #header-right   — 头部右侧操作按钮
// #default        — 内容区
// #footer         — 底部操作栏（覆盖默认的取消/确认）
```

## 验收标准

- [ ] 四种布局均能在 `ComponentPlayground` 中独立预览
- [ ] `SideDrawerLayout` 支持从左侧或右侧滑出（通过 `side` prop 控制）
- [ ] `BottomSheetLayout` 支持拖拽到不同高度档位，松开时自动吸附到最近档位
- [ ] `BottomSheetLayout` 在内容较少时不超过 `expanded` 高度，内容区自适应
- [ ] `FullscreenOverlayLayout` 的进入动画为淡入 + 轻微缩放，退出时反向
- [ ] `FloatingActionLayout` 的次级按钮展开时有扇形/垂直排列动画
- [ ] 所有浮层在打开时自动锁定底层页面滚动（`body scroll lock`）
- [ ] 按 ESC 键可关闭浮层（可通过 `closeOnEsc` prop 控制）

## 优先级

P1 — 浮层是现代桌面应用的重要交互模式，但已有 `drawer`/`sheet`/`dialog` 原子组件作为基础。

## 参考实现

- macOS 的 Slide Over 侧边栏
- iOS 的 Bottom Sheet（Maps、Safari 标签页）
- Figma 的全屏演示模式
- Google Material Design 的 FAB（Floating Action Button）
