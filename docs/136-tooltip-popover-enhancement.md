# 工具提示/浮层增强系统

## 功能背景/动机

当前脚手架在 `components/ui/tooltip/` 和 `components/ui/popover/` 中提供了基于 Reka UI 的基础 `Tooltip` 和 `Popover` 组件。这些组件功能完整但视觉表现非常基础：纯色背景的小浮层，缺乏现代桌面应用中工具提示应有的丰富度和层次感。

在实际产品中，工具提示和浮层是最高频的辅助信息展示手段，但现有实现存在以下不足：

1. **视觉单一**：Tooltip 只有黑色文字浮层一种形态，没有富文本提示、带操作按钮的提示、带图标的提示等变体。
2. **箭头样式简陋**：TooltipArrow 是一个简单的旋转小方块，没有更精致的三角形箭头或无边框融合效果。
3. **动画生硬**：仅有基础的 fade + zoom 动画，缺少方向感知的滑入滑出（如从上方出现的 tooltip 应该从上往下滑入）。
4. **无延迟策略**：所有 tooltip 立即显示，在密集 UI 中鼠标滑过会触发大量 tooltip 闪烁。
5. **Popover 缺乏视觉层级**：Popover 和 DropdownMenu 的视觉效果几乎一致，无法区分"辅助信息浮层"和"操作菜单"。
6. **无嵌套/级联视觉处理**：多级菜单或嵌套 popover 的层级关系无法通过视觉表达。

提供一套**工具提示/浮层增强系统**，能让开发者构建出层次分明、动画精致、体验细腻的工具提示和浮层体系。

## 功能描述

构建一套**工具提示/浮层增强系统**，包含：

1. **Tooltip 增强变体**：
   - `SimpleTooltip`：现有基础 tooltip，用于极简文字提示。
   - `RichTooltip`：富文本提示，支持标题 + 描述 + 图标 + 操作链接，适合展示复杂说明。
   - `IconTooltip`：带前置图标的提示，图标颜色与提示语义一致。
   - `ShortcutTooltip`：专门用于展示键盘快捷键（如 Hover 在按钮上显示 "⌘S"），自动使用 `Kbd` 组件（108）渲染快捷键。
2. **Tooltip 延迟与停留策略**：
   - `enterDelay`：鼠标进入后延迟显示（默认 300ms，防止误触发）。
   - `leaveDelay`：鼠标离开后延迟隐藏（默认 100ms，允许用户短暂移入 tooltip 内容区）。
   - `followCursor`：tooltip 跟随光标移动（适用于大元素或画布场景）。
   - `disabled`：条件性禁用（如元素处于加载状态时不显示 tooltip）。
3. **方向感知动画**：
   - Tooltip 从 `top` 出现时：从上方 8px 处淡入滑下。
   - 从 `bottom` 出现时：从下方 8px 处淡入滑上。
   - 从 `left` / `right` 出现时：水平方向滑入。
   - 动画使用 `cubic-bezier(0.16, 1, 0.3, 1)`（ease-out-expo），时长 200ms。
4. **Popover 视觉增强**：
   - `Popover` 增加 `variant`：`default`（标准）、`glass`（玻璃拟态，联动 120）、`elevated`（强阴影，用于重要操作确认）。
   - 增加 `arrow` 变体：三角形箭头、圆角箭头、无边框融合（使用 `clip-path` 或 `mask` 实现箭头与内容无缝融合）。
   - 增加 `offset` 精细控制：内容与触发元素的距离可调（默认 8px）。
5. **浮层层级管理**：
   - `FloatingLayer` 组件：统一管理所有 tooltip、popover、dropdown、menu 的 z-index 和层级关系。
   - 嵌套浮层自动递增 z-index（父层 600，子层 610，孙层 620...）。
   - 点击外部区域时，智能判断关闭哪个层级的浮层（而非全部关闭）。
6. **浮层无障碍增强**：
   - Tooltip 内容自动关联 `aria-describedby`。
   - Popover 打开时焦点自动移入，关闭时焦点返回触发元素。
   - 支持 `Esc` 键关闭当前浮层（与 001 全局快捷键系统联动）。
7. **浮层配置面板**：
   - 在设置中新增「浮层」Tab，可配置：
     - Tooltip 默认延迟时间。
     - 是否启用方向感知动画。
     - 浮层默认变体（default/glass/elevated）。

## 目标用户

- **需要为复杂界面元素提供丰富说明的开发者**。
- **需要构建多级菜单、嵌套操作的开发者**。
- **追求"浮层如羽毛般轻盈飘落"精致动画体验的产品**。

## 详细设计

### 视觉/动画效果描述

**RichTooltip 结构：**
```
┌─────────────────────────────┐
│ [Icon] 标题文字              │
│       描述文字，可以换行      │
│       [了解更多 →]           │
└─────────────────────────────┘
```

**方向感知动画 CSS：**
```css
/* Tooltip 从上方出现 */
.tooltip-enter-top {
  animation: tooltip-in-top 0.2s var(--ease-out-expo) forwards;
}
@keyframes tooltip-in-top {
  from { opacity: 0; transform: translateY(-8px) scale(0.96); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

/* Tooltip 从下方出现 */
.tooltip-enter-bottom {
  animation: tooltip-in-bottom 0.2s var(--ease-out-expo) forwards;
}
@keyframes tooltip-in-bottom {
  from { opacity: 0; transform: translateY(8px) scale(0.96); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

/* 类似定义 left/right */
```

**Popover 变体：**
```css
.popover-default {
  background: var(--popover);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--elevation-3);
}
.popover-glass {
  background: var(--glass-md-bg);
  backdrop-filter: blur(var(--glass-md-blur));
  border: 1px solid var(--glass-md-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--glass-md-shadow);
}
.popover-elevated {
  background: var(--popover);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  box-shadow: var(--elevation-4);
}
```

**箭头无缝融合（使用 clip-path）：**
```css
.popover-with-arrow {
  clip-path: polygon(
    0% 8px, 8px 0%, calc(100% - 8px) 0%, 100% 8px,
    100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0% calc(100% - 8px)
  );
}
/* 实际实现更复杂，需配合 ::before 伪元素绘制箭头 */
```

**延迟策略：**
```typescript
// 鼠标进入触发元素后 300ms 显示 tooltip
// 鼠标离开触发元素后 100ms 隐藏 tooltip
// 鼠标从触发元素移入 tooltip 内容区时，取消隐藏定时器
```

### 涉及的技术点

- **CSS 动画方向感知**：根据浮层的 `side`（top/bottom/left/right）动态应用不同的 `@keyframes`。
- **`clip-path` / `mask`**：实现箭头与浮层内容的无缝融合。
- **Reka UI 的 `Tooltip` 和 `Popover` 底层**：继续基于 Reka UI，在其之上封装视觉层和策略层。
- **Floating UI**：Reka UI 底层使用 Floating UI 进行定位，我们在此基础上增加 `offset` 和 `followCursor` 的封装。
- **焦点管理**：`Popover` 打开时使用 `focus-trap`，关闭时恢复焦点。
- **定时器管理**：`enterDelay`/`leaveDelay` 需要精心管理定时器，避免内存泄漏和状态竞争。

### 与现有架构的衔接方式

- **新增 `src/components/ui/tooltip/TooltipRich.vue`**：
  - 富文本 Tooltip，支持标题、描述、图标、操作链接。
- **新增 `src/components/ui/tooltip/TooltipShortcut.vue`**：
  - 快捷键提示，自动集成 `Kbd` 组件。
- **修改 `src/components/ui/tooltip/TooltipContent.vue`**：
  - 扩展 props：`variant`、`enterDelay`、`leaveDelay`、`followCursor`。
  - 根据 `side` 动态应用方向感知动画类。
- **修改 `src/components/ui/popover/PopoverContent.vue`**：
  - 扩展 props：`variant`、`arrow`、`offset`。
  - 支持 `glass` 变体（引用 120 的玻璃 Token）。
- **新增 `src/components/ui/popover/PopoverArrow.vue`**（如不存在则新建）：
  - 支持 `type: 'square' | 'triangle' | 'none'`。
- **新增 `src/composables/useFloatingLayer.ts`**：
  - 管理浮层的 z-index 层级和嵌套关系。
- **修改 `src/components/ui/dropdown-menu/DropdownMenuContent.vue`**：
  - 与 Popover 共享视觉变体。
- **扩展 `ComponentPlayground.vue`**：
  - 新增「浮层系统」演示区，展示所有 Tooltip/Popover 变体、动画、嵌套层级。

### 需要新增/修改的文件

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/components/ui/tooltip/TooltipRich.vue` | 新增 | 富文本 Tooltip |
| `src/components/ui/tooltip/TooltipShortcut.vue` | 新增 | 快捷键 Tooltip |
| `src/components/ui/tooltip/TooltipContent.vue` | 修改 | 扩展变体、延迟、方向动画 |
| `src/components/ui/popover/PopoverContent.vue` | 修改 | 扩展 variant、arrow、offset |
| `src/components/ui/popover/PopoverArrow.vue` | 新增/修改 | 箭头样式变体 |
| `src/composables/useFloatingLayer.ts` | 新增 | 浮层层级管理 |
| `src/components/ui/dropdown-menu/DropdownMenuContent.vue` | 修改 | 共享视觉变体 |
| `src/components/layouts/SettingsLayout.vue` | 修改 | 新增浮层设置 Tab |
| `src/pages/ComponentPlayground.vue` | 修改 | 新增浮层系统演示区 |

## 验收标准

- [ ] 提供 `SimpleTooltip`、`RichTooltip`、`IconTooltip`、`ShortcutTooltip` 四种 Tooltip 变体。
- [ ] Tooltip 支持 `enterDelay`（默认 300ms）和 `leaveDelay`（默认 100ms），支持 `followCursor`。
- [ ] 根据浮层出现的方向（top/bottom/left/right）应用对应的滑入动画。
- [ ] Popover 支持 `default`、`glass`、`elevated` 三种视觉变体。
- [ ] Popover 箭头支持 `square`、`triangle`、`none` 三种样式。
- [ ] 嵌套浮层自动管理 z-index，点击外部智能关闭对应层级。
- [ ] Popover 打开时焦点自动移入，关闭时焦点返回触发元素。
- [ ] `Esc` 键可关闭当前浮层。
- [ ] 玻璃拟态 Popover 与 120 的玻璃系统联动，自动适配深浅模式。
- [ ] ComponentPlayground 中可交互式预览所有浮层变体和动画效果。

## 优先级

P1

## 参考实现

- [Radix UI Tooltip](https://www.radix-ui.com/primitives/docs/components/tooltip)：Tooltip 的基础行为参考。
- [Floating UI](https://floating-ui.com/)：现代浮层定位库，Reka UI 的底层依赖。
- [Material Design 3 - Tooltips](https://m3.material.io/components/tooltips/overview)：Material Design 工具提示规范。
- [GitHub Primer - Tooltips](https://primer.style/components/tooltip)：GitHub 的富文本 Tooltip 设计。
- [macOS Tooltip Design](https://developer.apple.com/design/human-interface-guidelines/tooltips)：macOS 工具提示设计指南。
