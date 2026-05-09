# 217 空状态插画模板（Empty State Illustration Layout）

## 功能名称

空状态插画模板 — 提供搜索无结果、列表为空、无权限查看、网络断开四种带插画的空状态页面骨架。

## 功能背景/动机

现有脚手架已有 `ui/empty/` 组件族（`Empty`、`EmptyContent`、`EmptyDescription`、`EmptyMedia`、`EmptyTitle`）和 `105-loading-empty-error-state-system`（空状态的设计规范），但 `Empty.vue` 本身只是一个居中的 flex 容器，缺乏**面向具体场景的空状态页面级布局模板**。不同的空状态场景需要不同的引导策略：搜索无结果时应提供"清除筛选"按钮，列表为空时应提供"新建"引导，网络断开时应提供"重试"按钮。

本功能在现有 `Empty` 组件基础上，提供四种场景化的空状态布局，每种都包含场景化插画占位、引导文案和操作建议。

## 功能描述

包含以下四种空状态插画布局变体：

| 变体 | 说明 | 适用场景 |
|------|------|----------|
| `EmptySearchLayout` | 放大镜/搜索相关插画 + "未找到结果" + 清除筛选/修改关键词 | 搜索页、筛选结果页 |
| `EmptyListLayout` | 空盒子/文件夹插画 + "暂无数据" + 新建按钮 + 导入引导 | 列表页、表格初始状态 |
| `EmptyAccessLayout` | 锁/门插画 + "暂无权限" + 申请权限/联系管理员 | 需要权限的页面区块 |
| `EmptyOfflineLayout` | 断开连接插画 + "网络异常" + 重试/离线模式切换 | 网络依赖的功能模块 |

每种布局均内建：
- 插画区（支持 SVG 插画 slot、Lottie 动画 slot 或 Lucide 图标 fallback）
- 主标题 + 副标题文案区
- 主操作按钮 + 次要操作按钮
- 与 `Empty` 组件的视觉风格一致（圆角、间距、居中）
- 暗色/亮色主题适配

## 目标用户

- 需要为列表、搜索、权限、网络等场景提供空状态反馈的开发者
- 希望统一应用内所有空状态视觉风格的开发者

## 详细设计

### 布局结构描述

#### 通用空状态结构

```
+--------------------------------------------------+
|                                                  |
|                                                  |
|              +------------------+                |
|              |   [插画/图标]     |                |
|              |   120x120px      |                |
|              |   柔和色调背景    |                |
|              +------------------+                |
|                                                  |
|              暂无数据                            |
|         您还没有创建任何项目，开始创建第一个吧     |
|                                                  |
|         [ + 创建项目 ]  [ 导入数据 ]              |
|                                                  |
|         或者从模板开始：                          |
|         [模板A] [模板B] [模板C]                   |
|                                                  |
|                                                  |
+--------------------------------------------------+
```

#### 四种变体的差异

```
+--------------------------------------------------+
| EmptySearchLayout                                |
| 图标: SearchX (或搜索插画)                       |
| 文案: "未找到匹配的结果"                          |
| 按钮: [清除所有筛选] [修改搜索词]                 |
+--------------------------------------------------+

+--------------------------------------------------+
| EmptyListLayout                                  |
| 图标: FolderOpen (或空盒子插画)                   |
| 文案: "这里还没有任何内容"                        |
| 按钮: [新建] primary + [导入] outline + 模板推荐  |
+--------------------------------------------------+

+--------------------------------------------------+
| EmptyAccessLayout                                |
| 图标: Lock (或门禁插画)                           |
| 文案: "您没有权限查看此内容"                      |
| 按钮: [申请权限] primary + [返回] outline         |
+--------------------------------------------------+

+--------------------------------------------------+
| EmptyOfflineLayout                               |
| 图标: WifiOff (或断线插画)                        |
| 文案: "网络连接已断开"                            |
| 按钮: [重试] primary + [进入离线模式] ghost       |
+--------------------------------------------------+
```

### 涉及的技术点

- 使用现有 `ui/empty/` 组件族作为外层容器
- 使用 `lucide-vue-next` 图标作为默认 fallback 插画
- 使用 `Button`、`Card` 组件构建操作建议区
- 使用 `AnimatedTransition` 为空状态添加淡入动画
- 插画区支持通过 `#illustration` slot 插入自定义 SVG 或 Lottie 组件

### 与现有 layouts/ 的衔接

- 新增 `src/components/layouts/EmptySearchLayout.vue`
- 新增 `src/components/layouts/EmptyListLayout.vue`
- 新增 `src/components/layouts/EmptyAccessLayout.vue`
- 新增 `src/components/layouts/EmptyOfflineLayout.vue`
- 在 `src/components/layouts/index.ts` 中导出
- 可与 `CardGridLayout`（204）组合（空搜索结果）
- 可与 `DataTableLayout` 组合（空表格状态）
- 可与 `FileBrowserLayout`（215）组合（空文件夹状态）

### 需要新增/修改的文件

```
desktop-app/src/components/layouts/
  ├── EmptySearchLayout.vue         # 搜索无结果空状态
  ├── EmptyListLayout.vue           # 列表为空空状态
  ├── EmptyAccessLayout.vue         # 无权限空状态
  ├── EmptyOfflineLayout.vue        # 网络断开空状态
  └── index.ts                      # 追加导出
```

**Props 设计（以 EmptyListLayout 为例）：**

```ts
interface EmptyListLayoutProps {
  title?: string           // 主标题，默认"暂无数据"
  description?: string     // 副标题描述
  icon?: Component         // 覆盖默认图标
  showCreateButton?: boolean
  createButtonLabel?: string
  showImportButton?: boolean
  importButtonLabel?: string
  templates?: {            // 推荐模板列表
    label: string
    icon?: Component
    onClick: () => void
  }[]
}

// Events
// @create — 点击创建按钮
// @import — 点击导入按钮
```

## 验收标准

- [ ] 四种空状态布局均能在 `ComponentPlayground` 中独立预览
- [ ] 未提供自定义插画时，自动使用 Lucide 图标 + 主题色圆形背景作为 fallback
- [ ] 提供自定义插画 slot 时，图标 fallback 隐藏，插画居中展示
- [ ] 空状态内容区在任意窗口高度下保持垂直居中
- [ ] 暗色模式下插画/图标的背景色自动适配（使用 `bg-muted` 而非硬编码浅色）
- [ ] 按钮文案支持通过 props 传入，便于国际化
- [ ] 模板推荐区（如 EmptyListLayout 的模板卡片）最多展示 3 个，溢出时隐藏
- [ ] 进入空状态时，内容在 200ms 内淡入显示

## 优先级

P1 — 空状态是用户体验的重要细节，与已有的 `Empty` 组件和 `105` 形成场景化补充。

## 参考实现

- Notion 的空页面引导（插画 + 模板推荐）
- Figma 的"No results"状态页
- Dropbox 的空文件夹引导
- Vercel 的 404 / 空状态插画风格
