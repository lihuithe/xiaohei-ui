# 225 底部状态栏/信息栏布局（Bottom Status Bar Layout）

## 功能名称

底部状态栏/信息栏布局 — 提供经典状态栏、通知信息条、进度通知栏三种可复用骨架。

## 功能背景/动机

桌面应用的底部区域是展示系统状态、操作反馈、后台任务进度的关键位置。现有脚手架已有 `ui/progress/` 和 `ui/sonner/`（ toast 通知）组件，但缺少**页面级的底部状态栏布局模板**。开发者在实现状态栏时，需要自行处理信息分区、进度条嵌套、多条通知的堆叠、以及状态栏与主内容区的间距衔接。

本功能提供三种底部信息栏的布局模板，统一状态展示的交互规范和视觉层级，确保开发者无需重复处理底部区域的排版问题。

## 功能描述

包含以下三种底部状态栏布局变体：

| 变体 | 说明 | 适用场景 |
|------|------|----------|
| `ClassicStatusBarLayout` | 经典状态栏：左侧信息区 + 中部状态区 + 右侧操作区，固定底部 | IDE、编辑器、文件管理器 |
| `NotificationBannerLayout` | 通知信息条：可堆叠的多条横幅，支持成功/警告/错误/信息类型 | 全局通知、系统消息、操作反馈 |
| `ProgressTaskbarLayout` | 进度任务栏：后台任务列表 + 进度条 + 取消/查看详情按钮 | 文件上传、数据导出、批量处理 |

每种布局均内建：
- 与主内容区的间距自动处理（主内容区底部预留状态栏高度）
- 多条信息的堆叠/展开控制
- 动画进入/退出（滑入滑出）
- 暗色/亮色主题适配
- 与 `ui/progress/`、`ui/badge/`、`ui/button/` 的衔接

## 目标用户

- 需要为应用添加状态栏、通知条、任务进度展示的开发者
- 希望统一底部状态展示风格的开发者

## 详细设计

### 布局结构描述

#### 1. 经典状态栏（ClassicStatusBarLayout）

```
+--------------------------------------------------+
|                                                  |
|              主内容区                             |
|                                                  |
|                                                  |
+--------------------------------------------------+
| 行 12, 列 45  |  UTF-8  |  已保存  |  [设置] [?] |
+--------------------------------------------------+
| ↑ 固定底部，高度 28-32px，与主内容区之间有 1px 边框 |
+--------------------------------------------------+
```

#### 2. 通知信息条（NotificationBannerLayout）

```
+--------------------------------------------------+
|                                                  |
|              主内容区                             |
|                                                  |
|                                                  |
+--------------------------------------------------+
| ┌────────────────────────────────────────────┐  |
| │ ℹ️  新版本已可用，点击更新。              [×] │  |
| └────────────────────────────────────────────┘  |
| ┌────────────────────────────────────────────┐  |
| │ ⚠️  同步出现冲突，请手动解决。     [查看][×] │  |
| └────────────────────────────────────────────┘  |
| ↑ 可堆叠多条，最新的一条在底部，支持逐条关闭      |
+--------------------------------------------------+
```

#### 3. 进度任务栏（ProgressTaskbarLayout）

```
+--------------------------------------------------+
|                                                  |
|              主内容区                             |
|                                                  |
|                                                  |
+--------------------------------------------------+
| 后台任务 (2)                          [查看全部] |
| ┌────────────────────────────────────────────┐  |
| │ 📁 导出数据.zip          ████████░░  80% [×]│  |
| │                          剩余 2 分钟          │  |
| ├────────────────────────────────────────────┤  |
| │ 🖼️  生成缩略图           ████░░░░░░  40% [×]│  |
| │                          剩余 5 分钟          │  |
| └────────────────────────────────────────────┘  |
| ↑ 点击任务项可展开详情，点击 [×] 取消任务         |
+--------------------------------------------------+
```

### 涉及的技术点

- 使用 `flex` + `fixed` 或 `sticky` 定位实现底部固定
- 使用 `ui/progress/` 组件展示任务进度
- 使用 `ui/badge/` 展示状态标识（如"已保存"、"已修改"）
- 使用 `AnimatedTransition` 实现通知条的滑入滑出动画
- 使用 `ScrollArea` 处理多条任务/通知的溢出滚动
- 主内容区通过 `padding-bottom` 自动预留状态栏高度，避免内容被遮挡

### 与现有 layouts/ 的衔接

- 新增 `src/components/layouts/ClassicStatusBarLayout.vue`
- 新增 `src/components/layouts/NotificationBannerLayout.vue`
- 新增 `src/components/layouts/ProgressTaskbarLayout.vue`
- 在 `src/components/layouts/index.ts` 中导出
- `ClassicStatusBarLayout` 可与 `ClassicEditorLayout`（216）组合（编辑器底部状态栏）
- `NotificationBannerLayout` 可与 `App.vue` 组合（全局通知条，覆盖在所有页面之上）
- `ProgressTaskbarLayout` 可与 `BatchActionFormLayout`（222）组合（批量操作的后台进度展示）

### 需要新增/修改的文件

```
desktop-app/src/components/layouts/
  ├── ClassicStatusBarLayout.vue    # 经典状态栏
  ├── NotificationBannerLayout.vue  # 通知信息条
  ├── ProgressTaskbarLayout.vue     # 进度任务栏
  └── index.ts                      # 追加导出
```

**Props 设计（以 NotificationBannerLayout 为例）：**

```ts
interface NotificationBanner {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  dismissible?: boolean    // 是否可关闭，默认 true
}

interface NotificationBannerLayoutProps {
  banners: NotificationBanner[]
  maxVisible?: number      // 最大同时显示条数，默认 3
  position?: 'top' | 'bottom'  // 显示位置，默认 bottom
}

// Events
// @dismiss — 用户关闭某条通知
// @action  — 用户点击通知的操作按钮
```

## 验收标准

- [ ] 三种布局均能在 `ComponentPlayground` 中独立预览
- [ ] `ClassicStatusBarLayout` 固定在视口底部，主内容区滚动时不被遮挡
- [ ] `NotificationBannerLayout` 的多条通知支持堆叠，超过 `maxVisible` 时显示"还有 N 条"提示
- [ ] 通知条的进入动画为从底部向上滑入（200ms），退出为向下滑出
- [ ] `ProgressTaskbarLayout` 的任务项支持点击展开/收起详情，展开时不推动其他内容
- [ ] 进度条颜色根据任务状态变化：进行中为 `primary`，成功为 `green`，失败为 `destructive`
- [ ] 暗色模式下状态栏背景使用 `bg-card` 或 `bg-muted`，与主内容区分界清晰
- [ ] 所有布局支持通过 `position` prop 切换顶部/底部显示（`NotificationBannerLayout`）

## 优先级

P1 — 底部状态栏是桌面应用的"神经系统"，对操作反馈和状态感知至关重要。

## 参考实现

- VS Code 的底部状态栏（行号、编码、分支、错误计数）
- macOS 系统的通知横幅
- Figma 的底部操作反馈条
- Chrome 浏览器的下载进度条（底部）
