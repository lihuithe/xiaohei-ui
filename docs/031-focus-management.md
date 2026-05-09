# 焦点管理与键盘导航（Focus Management & Keyboard Navigation）

## 功能背景/动机

当前脚手架的 022 号「无障碍支持」从 a11y 合规角度覆盖了焦点管理、屏幕阅读器、减弱动效等内容。但在桌面应用的实际开发中，焦点管理不仅仅是无障碍需求，更是**效率工具的核心交互模式**——键盘党用户期望通过 Tab/Shift+Tab 在界面中流畅导航，期望模态框打开后焦点自动落入正确位置，期望关闭后焦点回到原位，期望自定义快捷键直达特定区域。将焦点管理从「无障碍附属功能」提升为独立的「交互模式系统」，能让开发者系统性地构建键盘友好的桌面应用，同时自然满足无障碍要求。

## 功能描述

构建一套面向桌面应用效率场景的 focal 交互模式系统：

1. **焦点陷阱（Focus Trap）**：模态框/抽屉/菜单打开时，Tab 键仅在容器内循环，不逃逸到背景内容
2. **焦点恢复（Focus Restore）**：弹层关闭后，焦点自动回到打开前的触发元素（或最近的可交互元素）
3. **焦点初始定位（Focus Initial）**：弹层/新页面打开时，焦点自动落入预设的「主操作」或「第一个输入框」
4. **Skip Link 快捷跳转**：键盘用户按 Tab 首项出现「跳转到主内容」链接，快速越过导航区
5. **自定义 Tab 顺序（Tab Order）**：支持通过声明式配置（如 `tabindex` 序列或 `data-tab-order`）定义非 DOM 顺序的 Tab 导航路径
6. **区域焦点导航（Focus Zone）**：将界面划分为多个焦点区域（如侧边栏、主内容、底部工具栏），支持 `F6` 或自定义快捷键在区域间快速跳转
7. **焦点环样式系统（Focus Ring）**：统一不同输入方式（键盘 Tab vs 鼠标点击）的焦点环展示策略，避免鼠标用户的视觉干扰

## 目标用户

- 构建键盘驱动效率工具的开发者（开发者工具、代码编辑器、笔记应用等）
- 希望减少用户鼠标操作、提升操作效率的应用设计者
- 需要满足无障碍合规同时追求键盘交互体验的团队

## 详细设计

### 交互流程

```
焦点陷阱：
用户点击「打开设置」→ Settings Dialog 打开
  → useFocusTrap 激活 → 扫描容器内所有 focusable 元素
  → 用户按 Tab → 焦点在容器内循环（最后一个 → 第一个）
  → 用户按 Shift+Tab → 反向循环（第一个 → 最后一个）
  → 点击 Escape 或关闭按钮 → 焦点陷阱释放

焦点恢复：
用户点击「编辑」按钮 → EditDialog 打开
  → 打开前记录当前焦点元素：`document.activeElement`（编辑按钮）
  → 用户完成编辑 → 关闭对话框
  → 焦点恢复到「编辑」按钮 → 如该元素已不存在，恢复到最近的可交互祖先

焦点初始定位：
对话框/新页面打开时 → 根据策略决定初始焦点：
  → 表单类：落入第一个输入框（或第一个错误字段）
  → 确认类：落入「确认」按钮（但非危险操作）
  → 危险确认类：落入「取消」按钮（防止误触）
  → 详情类：落入对话框标题（屏幕阅读器朗读）

Skip Link：
用户按 Tab（页面首项）→ 屏幕左上角滑出「跳转到主内容」链接
  → 用户按 Enter → 焦点移动到 <main> 区域
  → 再次按 Tab → 在主内容区内正常导航
  → 如用户继续按 Shift+Tab → 回到 Skip Link

区域焦点导航：
界面划分为 Sidebar（F6 区域1）、Main Content（F6 区域2）、Footer Toolbar（F6 区域3）
  → 用户按 F6 → 焦点在当前区域的下一个可交互元素间跳转
  → 再按 F6 → 焦点移动到下一个区域的第一个可交互元素
  → 支持 Shift+F6 反向区域导航
  → 每个区域注册时声明 `focusZoneId` 和 `focusZoneLabel`

焦点环样式策略：
用户使用鼠标点击按钮 → 按钮激活但不显示焦点环（`:focus-visible`）
  → 用户使用 Tab 导航到按钮 → 显示清晰的焦点环（outline）
  → 用户混合使用鼠标和键盘 → 智能判断：鼠标点击后按 Tab 从当前位置继续

自定义 Tab 顺序：
开发者声明：`<input data-tab-order="1" /> <button data-tab-order="3" /> <select data-tab-order="2" />`
  → Tab 导航顺序变为：input → select → button（而非 DOM 顺序）
  → 支持正数和负数（负数优先于正数，如 `:focus-visible` 的 tabindex="-1"）
```

### 涉及的技术点

- **Focus Trap 算法**：遍历容器的 `tabindex` 和天然 focusable 元素（`button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])`），监听 `keydown` 的 Tab 键，在首尾间循环
- **焦点历史栈**：使用栈结构记录焦点路径，支持多级弹层的逐层恢复
- **焦点可见性检测**：`:focus-visible` CSS 伪类 + `FocusEvent` 的 `relatedTarget` 判断输入方式
- **区域注册系统**：基于 Vue 的 provide/inject 或全局 WeakMap 注册焦点区域
- **无障碍衔接**：`aria-label` 标记区域，`aria-describedby` 标记焦点目标

### 与现有架构的衔接方式

| 现有模块 | 衔接方式 |
|---------|---------|
| `src/components/ui/dialog/` | DialogContent 集成 Focus Trap，关闭时恢复焦点 |
| `src/components/ui/drawer/` | DrawerContent 集成 Focus Trap |
| `src/components/ui/command/` | CommandDialog 打开时焦点落入输入框 |
| `src/components/ui/sheet/` | SheetContent 集成 Focus Trap |
| `src/composables/useShortcuts.ts`（001）| 区域导航快捷键注册到全局快捷键系统 |
| `src/stores/app.ts` | 可选：存储当前焦点区域状态 |
| `src/App.vue` | 挂载 SkipLink 组件和焦点区域容器 |

### 需要新增/修改的文件

**新增文件：**
- `src/composables/useFocusTrap.ts` — 焦点陷阱核心 composable（替代/增强 022 中规划的版本）
- `src/composables/useFocusRestore.ts` — 焦点保存与恢复 composable
- `src/composables/useFocusZone.ts` — 焦点区域注册与导航 composable
- `src/composables/useFocusVisible.ts` — 焦点可见性（键盘/鼠标区分）composable
- `src/components/SkipLink.vue` — 跳转到主内容链接组件
- `src/directives/vFocusOrder.ts` — 自定义 Tab 顺序指令
- `src/types/focus.ts` — 焦点管理类型定义

**修改文件：**
- `src/components/ui/dialog/DialogContent.vue` — 集成 useFocusTrap 和 useFocusRestore
- `src/components/ui/sheet/SheetContent.vue` — 集成焦点管理
- `src/components/ui/drawer/DrawerContent.vue` — 集成焦点管理
- `src/App.vue` — 挂载 SkipLink，注册主要焦点区域
- `src/style.css` 或 `src/assets/` — 添加 `:focus-visible` 统一样式

### 核心数据结构

```typescript
// src/types/focus.ts
export interface FocusTrapOptions {
  containerRef: HTMLElement | Ref<HTMLElement | null>
  initialFocus?: HTMLElement | Ref<HTMLElement | null> | 'first' | 'last' | 'none'
  returnFocusOnDeactivate?: boolean
  escapeDeactivates?: boolean
  allowOutsideClick?: boolean
}

export interface FocusZoneDef {
  id: string
  label: string           // 用于屏幕阅读器播报
  element: HTMLElement
  defaultFocusElement?: HTMLElement
}

export interface FocusRestoreRecord {
  element: HTMLElement | null
  timestamp: number
  context?: string        // 如 'dialog:settings', 'dropdown:profile'
}

export interface FocusOrderItem {
  element: HTMLElement
  order: number
}
```

### 关键实现策略

1. **Focus Trap 基于 Reka UI**：Reka UI（Radix Vue）的 Dialog/Popover 底层已内置 FocusScope，优先复用其能力，在其基础上封装更友好的 `useFocusTrap` 接口
2. **焦点历史栈**：全局维护一个 `FocusHistoryStack`，每次打开模态框 push 当前焦点，关闭时 pop 恢复。支持最大深度限制（如 10 层），防止内存泄漏
3. **智能焦点恢复**：如果保存的焦点元素已从 DOM 中移除，向上查找最近的可交互祖先元素；如果连祖先也不存在，则将焦点移动到 `document.body`
4. **区域导航的默认实现**：桌面应用常见的区域划分——Sidebar（导航）、Main（主内容）、Toolbar（底部/顶部工具栏）、StatusBar（状态栏）。`F6` 循环这些区域是 Windows 平台的常见惯例
5. **focus-visible 全局样式**：在全局 CSS 中定义 `:focus-visible { outline: 2px solid var(--ring); outline-offset: 2px; }`，同时确保鼠标点击不触发 `*:focus` 的 outline（通过 `:focus:not(:focus-visible) { outline: none; }`）

## 验收标准

- [ ] 提供 `useFocusTrap(containerRef)` composable，激活后 Tab 不逃逸出容器
- [ ] 提供 `useFocusRestore()` composable，弹层关闭后焦点回到触发元素
- [ ] Dialog/Sheet/Drawer 打开时自动激活焦点陷阱，关闭时自动恢复焦点
- [ ] 提供 `SkipLink` 组件，键盘 Tab 首项出现「跳转到主内容」链接
- [ ] 提供 `useFocusZone()` 支持区域注册和 `F6`/`Shift+F6` 区域间导航
- [ ] 支持自定义 Tab 顺序（`data-tab-order` 或 `v-focus-order` 指令）
- [ ] 鼠标点击不显示焦点环，键盘 Tab 显示清晰的焦点环（`:focus-visible`）
- [ ] 焦点区域切换时屏幕阅读器自动播报区域名称（如「已进入主内容区」）
- [ ] 焦点历史栈支持最大深度限制和上下文标记
- [ ] 包含至少 4 个使用示例（焦点陷阱、焦点恢复、SkipLink、区域导航）

## 优先级

**P1** — 焦点管理是桌面应用键盘交互的基石，与现有 Dialog/Sheet/Command 组件深度契合；实现成本中等，但能显著提升模板的专业度和效率工具属性。

## 参考实现

- [Radix Focus Scope](https://www.radix-ui.com/primitives/docs/utilities/focus-scope) — Reka UI 底层焦点管理
- [WAI-ARIA Modal Dialog Focus](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) — 模态框焦点管理规范
- [GitHub Primer FocusZone](https://primer.style/react/FocusZone) — 区域焦点导航
- [react-focus-trap](https://github.com/focus-trap/focus-trap) — 焦点陷阱实现参考
- [Tailwind CSS focus-visible](https://tailwindcss.com/docs/hover-focus-and-other-states#focus-visible) — 焦点环样式
