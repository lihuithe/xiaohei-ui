# 对话框模式系统（Dialog Pattern System）

## 功能背景/动机

当前脚手架已包含 shadcn-vue 的 `Dialog`、`AlertDialog`、`Sheet`、`Drawer` 等底层组件，但这些组件仅提供了「打开/关闭」的基础能力。在桌面应用中，对话框是一个完整的交互模式系统——开发者需要处理确认/取消的决策流、表单提交的状态管理、多步骤向导的流程控制、全屏沉浸式编辑、拖拽调整大小等复杂场景。如果每个开发者都从零组装这些模式，会导致实现不一致、状态管理混乱、用户体验割裂。提供一套预置的对话框模式系统，能让开发者通过「选择模式」快速搭建符合桌面应用习惯的对话框交互。

## 功能描述

构建覆盖桌面应用常见对话框场景的交互模式系统：

1. **确认对话框模式（Confirm Dialog）**：需要用户明确决策的二元/三元选择（是/否/取消、保留/丢弃/取消）
2. **表单对话框模式（Form Dialog）**：在对话框内完成表单填写，支持提交验证、异步提交、提交中状态
3. **多步骤对话框模式（Wizard Dialog）**：结合 Stepper 组件，在对话框内完成分步流程，支持步骤验证和前进/后退导航
4. **全屏对话框模式（Fullscreen Dialog）**：覆盖整个窗口的内容编辑场景（如代码编辑、富文本编辑、预览模式）
5. **可调整大小对话框模式（Resizable Dialog）**：支持用户拖拽边框调整对话框尺寸，尺寸状态持久化
6. **堆叠对话框管理（Dialog Stack）**：处理对话框嵌套打开时的层级、遮罩、焦点管理和返回关闭策略

## 目标用户

- 需要为用户操作提供二次确认的应用开发者
- 需要在浮层中完成复杂表单或向导流程的开发者
- 需要实现全屏编辑/预览模式的开发者
- 需要处理多层对话框嵌套和焦点管理的开发者

## 详细设计

### 交互流程

```
确认对话框：
用户点击「删除项目」→ ConfirmDialog 打开
  → 展示操作描述和后果提示 → 提供「删除」（危险）和「取消」按钮
  → 用户点击「删除」→ 执行异步删除 → 显示加载状态
  → 删除完成 → 对话框关闭 → 触发成功回调

表单对话框：
用户点击「新建配置」→ FormDialog 打开 → 焦点自动落入第一个输入框
  → 用户填写表单 → 实时字段级验证（blur 时触发）
  → 点击提交 → 表单级验证 → 显示提交中 Spinner
  → 提交成功 → 关闭对话框 → 触发 onSuccess(data)
  → 提交失败 → 保持对话框打开 → 展示字段级或全局错误

多步骤向导：
用户点击「开通服务」→ WizardDialog 打开 → Stepper 展示 3 个步骤
  → 步骤1：填写基本信息 → 验证通过 → 「下一步」可点击
  → 步骤2：选择配置项 → 可返回上一步修改
  → 步骤3：确认信息 → 点击「完成」→ 提交总数据
  → 支持 Enter 前进（最后一步为提交），Escape 询问是否取消整个流程

全屏对话框：
用户点击「全屏编辑」→ FullscreenDialog 打开 → 覆盖整个窗口内容区
  → 顶部保留标题栏和关闭/保存操作 → 主体区域为编辑器/预览器
  → 按 Escape 触发关闭确认（如有未保存更改）
  → 支持从普通对话框「展开」为全屏模式

可调整大小对话框：
用户打开对话框 → 右下角显示拖拽手柄（resize handle）
  → 用户拖拽 → 对话框实时调整尺寸 → 释放后尺寸写入 localStorage
  → 下次打开时恢复上次尺寸 → 支持最小/最大尺寸约束
  → 窗口尺寸变化时对话框自动适配（不超过视口）

对话框堆叠：
用户在 Dialog A 中点击「打开设置」→ Dialog B 在 A 之上打开
  → Dialog B 的遮罩仅覆盖 A 的内容区域（或全屏遮罩但 A 变暗）
  → 关闭 B 后焦点回到 A 内的触发元素
  → 按 Escape 优先关闭最上层对话框
  → 提供 `maxStackDepth` 限制防止无限嵌套
```

### 涉及的技术点

- **焦点管理**：打开时自动聚焦第一个可交互元素，关闭时恢复触发元素焦点（与 031 焦点管理系统联动）
- **滚动锁定**：对话框打开时禁用背景滚动，关闭后恢复
- **异步状态管理**：提交中的 loading 状态、成功/失败的回调时序
- **表单集成**：与 vee-validate / zod 的表单验证体系衔接
- **尺寸持久化**：localStorage 存储用户对对话框的尺寸调整偏好
- **层级管理**：全局 DialogStack 存储打开的对话框队列，处理 z-index 和遮罩策略
- **动画编排**：打开/关闭的缩放+淡入淡出动画，堆叠时的层级过渡动画

### 与现有架构的衔接方式

| 现有模块 | 衔接方式 |
|---------|---------|
| `src/components/ui/dialog/` | 基础 Dialog/DialogContent/DialogOverlay，扩展为模式变体 |
| `src/components/ui/alert-dialog/` | 作为 Confirm Dialog 的底层组件 |
| `src/components/ui/sheet/` | 作为侧滑表单/详情面板的底层组件 |
| `src/components/ui/drawer/` | 作为移动端优先的底部弹窗（桌面端少用） |
| `src/components/ui/stepper/` | Wizard Dialog 的步骤导航组件 |
| `src/components/ui/form/` | Form Dialog 的表单验证和状态管理 |
| `src/composables/useFocusTrap.ts`（022/031）| 对话框的焦点陷阱实现 |
| `src/stores/app.ts` | 全局对话框状态管理（可选） |

### 需要新增/修改的文件

**新增文件：**
- `src/components/dialog-patterns/ConfirmDialog.vue` — 确认对话框模式组件
- `src/components/dialog-patterns/FormDialog.vue` — 表单对话框模式组件
- `src/components/dialog-patterns/WizardDialog.vue` — 多步骤向导对话框组件
- `src/components/dialog-patterns/FullscreenDialog.vue` — 全屏对话框模式组件
- `src/components/dialog-patterns/ResizableDialog.vue` — 可调整大小对话框组件
- `src/composables/useDialogStack.ts` — 对话框堆栈管理 composable
- `src/composables/useConfirm.ts` — 命令式唤起确认对话框的 composable
- `src/types/dialog.ts` — 对话框模式系统的类型定义

**修改文件：**
- `src/components/ui/dialog/DialogContent.vue` — 可选支持 resizable 属性
- `src/App.vue` — 全局挂载 DialogStack 的遮罩和层级管理

### 核心数据结构

```typescript
// src/types/dialog.ts
export interface ConfirmDialogOptions {
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  thirdOptionLabel?: string       // 如「保留更改」「稍后处理」
  variant?: 'default' | 'destructive' | 'warning'
  onConfirm?: () => void | Promise<void>
  onCancel?: () => void
  onThirdOption?: () => void
}

export interface FormDialogOptions<T = unknown> {
  title: string
  description?: string
  initialValues?: T
  validationSchema?: ZodSchema
  onSubmit: (values: T) => Promise<void>
  onSuccess?: (values: T) => void
  submitLabel?: string
}

export interface WizardStep {
  id: string
  title: string
  description?: string
  validate?: () => boolean | Promise<boolean>
  component: Component
}

export interface WizardDialogOptions {
  title: string
  steps: WizardStep[]
  onComplete: (stepData: Record<string, unknown>) => Promise<void>
  canGoBack?: boolean
}

export interface DialogStackItem {
  id: string
  component: Component
  props: Record<string, unknown>
  zIndex: number
  closeOnOverlayClick?: boolean
  closeOnEsc?: boolean
}
```

### 关键实现策略

1. **命令式与声明式双 API**：Confirm Dialog 支持命令式调用 `const confirmed = await confirm({ title: '确认删除?' })`，便于在业务逻辑中直接使用；复杂对话框使用声明式组件模板
2. **Promise 化异步流程**：FormDialog 的 `onSubmit` 返回 Promise，组件内部自动管理 loading 状态，开发者只需关注数据提交逻辑
3. **尺寸约束与持久化**：ResizableDialog 使用 `min-w`、`max-w`、`min-h`、`max-h` 约束尺寸，用户调整后的尺寸按 `dialogId` 存入 localStorage
4. **堆叠策略选择**：提供两种堆叠遮罩模式——「全局遮罩」（所有对话框共享一个遮罩，下层变暗）和「独立遮罩」（每个对话框有自己的遮罩，视觉更厚重）
5. **未保存更改保护**：FormDialog/WizardDialog 检测表单 dirty 状态，关闭前弹窗确认「有未保存的更改，是否放弃？」

## 验收标准

- [ ] 提供 `ConfirmDialog` 组件，支持二元/三元选择，危险操作按钮红色高亮
- [ ] 提供 `useConfirm()` composable，支持命令式 `await confirm(options)` 调用
- [ ] 提供 `FormDialog` 组件，内置表单验证、提交中状态、错误展示
- [ ] 提供 `WizardDialog` 组件，支持步骤验证、前进/后退导航、进度指示
- [ ] 提供 `FullscreenDialog` 组件，支持从普通对话框展开为全屏，保留操作栏
- [ ] 提供 `ResizableDialog` 组件，支持拖拽调整大小，尺寸按 dialogId 持久化
- [ ] 提供 `useDialogStack()` 管理多层对话框的打开/关闭/层级/焦点恢复
- [ ] 按 Escape 优先关闭最上层对话框，支持 `closeOnEsc` 禁用
- [ ] 对话框打开时背景滚动锁定，关闭后恢复滚动位置
- [ ] 关闭对话框后焦点回到触发元素（Focus Restore）
- [ ] 包含至少 6 种对话框模式的使用示例（确认、表单、向导、全屏、可调整大小、堆叠）

## 优先级

**P0** — 对话框是桌面应用最核心的交互模式之一，与现有 shadcn-vue Dialog/AlertDialog/Sheet 组件高度契合；模式系统能显著提升开发者的组装效率，是模板价值的核心体现。

## 参考实现

- [Radix Dialog](https://www.radix-ui.com/primitives/docs/components/dialog) — shadcn-vue 底层实现
- [Material Design Dialogs](https://m3.material.io/components/dialogs/overview) — 对话框分类和交互规范
- [Ant Design Modal](https://ant.design/components/modal) — 丰富的对话框模式（确认、信息、成功、错误、警告）
- [shadcn-vue Dialog](https://www.shadcn-vue.com/docs/components/dialog.html) — 基础对话框组件
