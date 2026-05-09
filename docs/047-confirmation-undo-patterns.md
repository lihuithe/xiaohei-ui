# 操作确认与撤销模式（Confirmation & Undo Interaction Patterns）

## 功能背景/动机

当前脚手架已包含 030 号「对话框模式系统」（含 Confirm Dialog 模式）和 `AlertDialog` 组件，但缺少面向桌面应用操作安全的**确认与撤销交互模式系统**。在桌面应用中，用户的操作确认不仅是「弹一个对话框问是否删除」，更是一个完整的交互策略——包括危险操作的分级确认、批量操作的确认汇总、操作后的撤销机制（Undo）、以及操作前的预防性提示。提供一套完整的操作确认与撤销模式，能显著降低用户的误操作成本，提升应用的安全感和专业度。

## 功能描述

构建覆盖桌面应用常见操作安全场景的交互模式系统：

1. **分级确认模式（Tiered Confirmation）**：根据操作危险程度配置不同的确认级别——轻微操作无需确认（如切换视图）、普通操作使用轻量确认（如 Inline Confirm 内联按钮）、危险操作使用模态对话框确认（如删除）、极端危险操作使用二次确认（如删除账户需输入确认文本）
2. **批量操作确认模式（Batch Operation Confirmation）**：选中多项后执行批量操作（删除/移动/归档）时，展示操作摘要确认面板（「您即将删除 12 个项目」），支持逐项查看和排除
3. **内联确认模式（Inline Confirmation）**：在操作触发位置直接展示确认按钮组（如列表项悬停显示「删除？」「是」「否」），避免打断用户注意力的弹窗
4. **撤销操作模式（Undo Pattern）**：关键操作执行后提供即时撤销能力，支持撤销倒计时（如「已删除 [撤销] 5秒」）、撤销栈管理（多步撤销/重做）、以及撤销的历史记录查看
5. **预防性提示模式（Preventive Hint）**：在用户可能误操作前给予提示（如关闭有未保存更改的标签页、离开有未提交表单的页面），支持「不再询问」记忆

## 目标用户

- 需要保护用户免受误操作影响的开发者
- 构建数据管理、文件操作、配置编辑等关键操作场景的开发者
- 希望提供类 macOS/Windows 级操作安全体验的开发者

## 详细设计

### 交互流程

```
分级确认：

级别 0 - 无需确认：
  → 切换主题、展开折叠面板、切换标签页
  → 直接执行，无任何确认

级别 1 - 轻量提示：
  → 用户点击「清空搜索历史」→ 底部滑出 Snackbar：「搜索历史已清空」[撤销]
  → 不阻断用户，提供撤销机会

级别 2 - 内联确认：
  → 用户悬停列表项 → 显示删除图标
  → 点击删除图标 → 该行变为确认状态：「确定删除？」[确认] [取消]
  → 点击「确认」→ 删除该行
  → 点击「取消」或点击其他区域 → 恢复原状
  → 适合：删除列表项、移除标签、取消收藏

级别 3 - 模态对话框确认：
  → 用户点击「删除项目」→ ConfirmDialog 弹出
  → 展示操作后果：「此操作将永久删除项目及所有子任务，无法恢复。」
  → 提供「删除」（危险样式）和「取消」按钮
  → 危险操作按钮不在默认焦点位置（防止 Enter 误触）
  → 适合：删除项目、清空数据、移除成员

级别 4 - 二次确认：
  → 用户点击「删除账户」→ 第一次确认对话框：「确定删除账户？」
  → 用户点击「确定」→ 第二次确认：「请输入您的用户名 'zhangsan' 以确认删除」
  → 用户必须准确输入指定文本 → 「确认删除」按钮才变为可用
  → 适合：删除账户、不可逆的系统级操作

批量操作确认：
用户在列表中选中 15 项 → 点击顶部工具栏「删除」
  → 不立即删除，弹出 BatchConfirmDialog
  → 对话框展示：「您即将删除 15 个项目」
  → 下方列出前 5 个项目名称，显示「及另外 10 个项目」
  → 提供「查看全部」→ 展开可滚动的完整列表
  → 列表中每项有复选框，可取消勾选排除某项
  → 实时更新操作数量：「将删除 14 个项目（已排除 1 项）」
  → 提供「确认删除 14 项」和「取消」
  → 确认后 → 展示进度通知（046）→ 完成后显示结果 Toast

内联确认：
用户点击设置项旁的「重置为默认」按钮
  → 按钮立即变为确认状态：背景变色，文字变为「确认重置？」
  → 旁边出现「取消」按钮
  → 3 秒内未点击确认 → 自动恢复为原按钮（超时取消）
  → 点击「确认」→ 执行重置
  → 适合：单按钮触发的确认，无需弹窗

撤销操作：
用户删除文件 → Toast 显示：「文件已删除」[撤销]（倒计时 5 秒）
  → 点击「撤销」→ 文件恢复 → Toast 更新为「已恢复」
  → 倒计时结束未撤销 → 操作真正生效，撤销按钮消失
  → 提供「操作历史」面板（⌘+Shift+Z 或菜单进入）
    → 列出最近操作：删除文件、重命名文件夹、移动项目
    → 每项操作显示「撤销」按钮
    → 支持多步撤销（按操作顺序反向执行）
    → 不可撤销的操作标记为灰色（如已发出的邮件）
  → 撤销栈最大深度：默认 50 步
  → 应用关闭后撤销栈清空（不持久化，避免状态复杂化）

预防性提示：
用户关闭有未保存更改的标签页 → 触发 beforeunload 拦截
  → 提示：「此标签页有未保存的更改，是否保存？」
    → [保存并关闭] [不保存关闭] [取消]
  → 用户勾选「不再询问」→ 记住偏好，下次直接按选择执行
  → 类似场景：
    → 离开有未提交表单的页面
    → 刷新有运行中操作的页面
    → 关闭有正在上传文件的面板
  → 支持全局配置「是否显示预防性提示」
```

### 涉及的技术点

- **操作命令模式**：将操作封装为 Command 对象（execute/undo），支持撤销栈管理
- **倒计时撤销**：`setTimeout` + 悬停暂停机制，超时后真正提交操作
- **beforeunload 拦截**：Electron 的 `beforeunload` 事件和 Vue Router 的导航守卫
- **撤销栈数据结构**：使用数组栈（LIFO），每项包含 execute/undo 函数和操作元数据

### 与现有架构的衔接方式

| 现有模块 | 衔接方式 |
|---------|---------|
| `src/components/ui/alert-dialog/` | 级别 3-4 的模态确认对话框 |
| `src/components/ui/dialog/` | 批量操作确认对话框 |
| `src/components/ui/sonner/` | 级别 1 轻量提示和撤销 Toast |
| `src/components/ui/button/` | 内联确认的按钮变体 |
| `030-dialog-pattern-system` | ConfirmDialog 和 FormDialog 复用 |
| `046-toast-feedback-patterns` | 撤销倒计时 Toast |
| `src/composables/useConfirm.ts`（030）| 命令式确认对话框调用 |
| `src/router/index.ts` | 页面离开前的预防性提示拦截 |

### 需要新增/修改的文件

**新增文件：**
- `src/components/confirm-patterns/TieredConfirm.vue` — 分级确认决策组件
- `src/components/confirm-patterns/InlineConfirm.vue` — 内联确认按钮组件
- `src/components/confirm-patterns/BatchConfirmDialog.vue` — 批量操作确认对话框
- `src/components/confirm-patterns/UndoToast.vue` — 撤销倒计时 Toast 组件
- `src/components/confirm-patterns/OperationHistory.vue` — 操作历史面板组件
- `src/composables/useUndoStack.ts` — 撤销栈管理 composable
- `src/composables/useInlineConfirm.ts` — 内联确认逻辑 composable
- `src/composables/useBeforeUnload.ts` — 页面离开拦截 composable
- `src/types/confirmation.ts` — 操作确认模式类型定义

**修改文件：**
- `src/App.vue` — 注册全局 beforeunload 拦截（如有需要）

### 核心数据结构

```typescript
// src/types/confirmation.ts
export type ConfirmLevel = 0 | 1 | 2 | 3 | 4

export interface ConfirmAction {
  id: string
  label: string
  description?: string          // 操作后果描述
  level: ConfirmLevel
  onConfirm: () => void | Promise<void>
  onCancel?: () => void
}

export interface BatchConfirmItem {
  id: string
  label: string
  description?: string
  icon?: string
  excluded?: boolean            // 是否被用户排除
}

export interface UndoableCommand {
  id: string
  label: string                 // 操作描述，如 "删除文件 'doc.txt'"
  timestamp: number
  execute: () => void | Promise<void>
  undo: () => void | Promise<void>
  canUndo: () => boolean        // 某些操作后可能无法撤销
  metadata?: Record<string, unknown>
}

export interface UndoStackState {
  commands: UndoableCommand[]
  currentIndex: number          // 当前位置，支持 undo/redo
  maxSize: number               // 默认 50
}

export interface PreventiveHintOptions {
  message: string
  actions: { label: string; value: 'save' | 'discard' | 'cancel' }[]
  rememberChoice?: boolean
  storageKey?: string
}
```

### 关键实现策略

1. **分级确认配置化**：提供全局 `ConfirmRegistry`，开发者为操作注册确认级别。如 `registerConfirm('delete-project', { level: 3, message: '此操作不可恢复' })`。UI 层根据级别自动选择确认方式，业务层无需关心交互细节
2. **撤销命令模式**：所有可撤销操作实现 `UndoableCommand` 接口。执行时先执行 `execute()` 并将命令压入撤销栈，用户点击撤销时调用 `undo()`。命令模式天然支持 redo（从撤销栈重新 execute）
3. **批量确认的数据预览**：BatchConfirmDialog 接收 `items` 数组渲染可勾选的预览列表。使用虚拟滚动处理大量项（>100）。确认时只提交未被排除（`excluded: false`）的项
4. **预防性提示的记忆**：使用 `localStorage` 存储用户「不再询问」的选择。存储键包含操作类型和上下文（如 `preventive-hint:unsaved-tab-close`），支持全局重置所有记忆
5. **撤销倒计时安全窗口**：撤销期间操作并未真正生效（或已生效但保留了恢复数据）。倒计时结束后调用 `commit()` 真正提交。对于必须立即生效的操作（如 API 调用），undo 实现为「调用恢复 API」而非「阻止原操作」

## 验收标准

- [ ] 提供分级确认系统（0-4 级），支持按操作类型配置确认级别
- [ ] 提供 `InlineConfirm` 组件，支持按钮切换为确认状态 + 超时自动取消
- [ ] 提供 `BatchConfirmDialog` 组件，支持批量操作预览、逐项排除、实时数量更新
- [ ] 提供 `useUndoStack()` composable，支持 execute/undo/redo 和操作历史查看
- [ ] 撤销操作支持倒计时 Toast 提示（悬停暂停倒计时）
- [ ] 支持操作历史面板，列出最近 50 步可撤销/重做操作
- [ ] 提供 `useBeforeUnload()` 拦截页面关闭/刷新/导航，支持预防性提示
- [ ] 预防性提示支持「不再询问」记忆和全局重置
- [ ] 危险操作对话框的确认按钮不在默认焦点位置
- [ ] 二次确认支持文本输入验证（如输入用户名确认删除账户）
- [ ] 包含至少 5 个使用示例（分级确认、内联确认、批量确认、撤销、预防性提示）

## 优先级

**P1** — 操作确认与撤销是桌面应用用户安全感的基础，与现有 AlertDialog/ConfirmDialog/Toast 高度契合；模式系统能显著降低误操作风险，提升应用的专业度。

## 参考实现

- [macOS Undo/Redo](https://support.apple.com/guide/mac-help/mh35835/mac) — 撤销栈和多步撤销
- [Gmail Undo Send](https://support.google.com/mail/answer/2819488) — 倒计时撤销的经典实现
- [Notion Delete Confirmation](https://www.notion.so/) — 内联确认和模态确认的分级使用
- [GitHub Delete Repository](https://github.com/) — 二次确认（输入仓库名确认删除）
- [React use-undo](https://github.com/xxhomey19/use-undo) — 撤销栈的 Hook 实现参考
