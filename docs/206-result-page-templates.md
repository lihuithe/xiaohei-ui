# 206 结果页模板（Result Page Templates）

## 功能名称

结果页模板 — 提供成功、失败、404、无权限四种结果状态页面的可复用布局骨架。

## 功能背景/动机

现有脚手架已有 `105-loading-empty-error-state-system`（加载/空/错误状态的统一设计系统）和基础的 `NotFoundPage.vue`（仅一个 404 数字 + 返回按钮）。但"结果页"作为独立的页面类型，需要更完整的视觉表达：插画/图标占位、状态说明、引导操作、辅助链接等。开发者在实现提交结果、操作反馈、异常页面时，往往临时拼凑，风格不统一。

本功能将结果页抽象为布局模板，让开发者通过配置 props 即可生成一致的结果反馈页面，同时与现有的 `Empty`、`Alert`、`Button` 组件保持设计语言统一。

## 功能描述

包含以下四种结果页模板：

| 变体 | 说明 | 适用场景 |
|------|------|----------|
| `ResultSuccessLayout` | 绿色主题，对勾图标，主操作 + 次要操作 | 表单提交成功、任务完成、支付成功 |
| `ResultErrorLayout` | 红色主题，错误图标，重试 + 返回 | 操作失败、提交出错、加载异常 |
| `ResultNotFoundLayout` | 灰色主题，404/搜索为空图标，返回首页 + 搜索 | 页面不存在、搜索无结果 |
| `ResultForbiddenLayout` | 橙色主题，锁图标，返回 + 联系管理员 | 无权限访问、需要升级账户 |

每种布局均内建：
- 图标/插画区（支持 Lucide 图标或自定义插画 slot）
- 标题 + 描述文本区
- 主操作按钮 + 次要操作按钮
- 可选的扩展信息区（如错误码、追踪 ID、详细说明折叠区）
- 与 `Empty` 组件视觉风格一致（圆角、间距、字体层级）

## 目标用户

- 需要为操作结果、异常状态提供反馈页面的开发者
- 希望统一成功/失败/404/无权限页面风格的开发者

## 详细设计

### 布局结构描述

#### 通用结果页结构（以 ResultSuccessLayout 为例）

```
+--------------------------------------------------+
|                                                  |
|                                                  |
|              +----------------+                  |
|              |    ✓ (大图标)   |                  |
|              |   绿色圆形背景   |                  |
|              +----------------+                  |
|                                                  |
|              操作成功                            |
|         您的更改已成功保存到云端                 |
|                                                  |
|         [  查看详情  ]  [  返回首页  ]            |
|                                                  |
|         扩展信息（可选折叠区）                    |
|         追踪 ID: trace-2024-xxxx                 |
|                                                  |
|                                                  |
+--------------------------------------------------+
```

#### 四种变体的视觉差异

```
+--------------------------------------------------+
| ResultSuccessLayout                              |
| 图标: CheckCircle (绿色 bg-green-50)             |
| 按钮: [查看详情] primary + [返回] outline        |
+--------------------------------------------------+

+--------------------------------------------------+
| ResultErrorLayout                                |
| 图标: XCircle (红色 bg-red-50)                   |
| 按钮: [重试] primary destructive + [返回] outline|
| 扩展: 错误详情折叠区（显示 stack / 错误码）      |
+--------------------------------------------------+

+--------------------------------------------------+
| ResultNotFoundLayout                             |
| 图标: SearchX (灰色 bg-muted)                    |
| 按钮: [返回首页] primary + [重新搜索] outline    |
+--------------------------------------------------+

+--------------------------------------------------+
| ResultForbiddenLayout                            |
| 图标: Lock (橙色 bg-orange-50)                   |
| 按钮: [返回] outline + [联系管理员] ghost        |
+--------------------------------------------------+
```

### 涉及的技术点

- 使用现有 `Empty`、`Alert`、`Button`、`Card` 组件构建内容区
- 使用现有 `lucide-vue-next` 图标（`CheckCircle`、`XCircle`、`SearchX`、`Lock`）
- 使用 `AnimatedTransition` 为图标添加进入动画（缩放 + 淡入）
- 错误详情区使用 `Collapsible` 组件控制展开/收起
- 颜色严格使用主题 token，不硬编码色值

### 与现有 layouts/ 的衔接

- 新增 `src/components/layouts/ResultSuccessLayout.vue`
- 新增 `src/components/layouts/ResultErrorLayout.vue`
- 新增 `src/components/layouts/ResultNotFoundLayout.vue`
- 新增 `src/components/layouts/ResultForbiddenLayout.vue`
- 在 `src/components/layouts/index.ts` 中导出
- 替换现有的 `NotFoundPage.vue` 为 `ResultNotFoundLayout` 的演示实例

### 需要新增/修改的文件

```
desktop-app/src/components/layouts/
  ├── ResultSuccessLayout.vue     # 成功结果页
  ├── ResultErrorLayout.vue       # 错误结果页
  ├── ResultNotFoundLayout.vue    # 404/无结果页
  ├── ResultForbiddenLayout.vue   # 无权限页
  └── index.ts                    # 追加导出
```

**Props 设计（通用）：**

```ts
interface ResultPageLayoutProps {
  title: string
  description?: string
  icon?: Component                 // 覆盖默认图标
  primaryAction?: {
    label: string
    onClick: () => void
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
  extra?: string                   // 扩展信息（如错误码、追踪 ID）
}
```

## 验收标准

- [ ] 四种结果页均能在 `ComponentPlayground` 中独立预览
- [ ] 图标进入时有动画效果（建议 0.3s 缩放淡入，与 102 页面切换动画协调）
- [ ] 支持通过 `icon` prop 替换默认图标，支持通过 `#icon` slot 插入自定义插画
- [ ] 内容区在窗口高度变化时始终保持垂直居中
- [ ] `ResultErrorLayout` 的错误详情折叠区默认收起，展开后不影响整体居中
- [ ] 所有颜色使用主题 CSS 变量，深色模式下自动适配
- [ ] 按钮文案支持通过 `vue-i18n` 国际化（或传入已翻译字符串）

## 优先级

P1 — 结果页是用户体验的关键闭环，但已有基础的 `Empty` 和 `NotFoundPage`，属于体验升级。

## 参考实现

- Ant Design Result 组件
- shadcn-ui 的 Empty State 组合模式
- macOS 系统错误对话框的视觉层级
- Vercel 的 404 页面（简约插画 + 返回按钮）
