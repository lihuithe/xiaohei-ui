# 悬停/聚焦/激活状态系统

## 功能背景/动机

当前脚手架在交互状态的设计上比较零散：
- `Button.vue` 有基本的 `hover:bg-muted` 和 `active:translate-y-px`。
- `App.vue` 的窗口控制按钮有独立的 hover/active 样式。
- 表单输入框有 `focus-visible:ring-3` 的聚焦环。

但缺乏一套**系统化、无障碍友好、跨组件一致**的交互状态规范。这导致：

1. **状态反馈不一致**：按钮 Hover 是变暗，而卡片 Hover 是上浮，输入框 Hover 是边框变色——三种不同的视觉语言让用户难以建立统一预期。
2. **Focus Ring 样式不统一**：有的组件用 `ring-3`，有的用 `outline`，颜色也可能不一致（有的用 `ring-ring/50`，有的用 `ring-primary`）。
3. **键盘导航视觉支持不足**：对于依赖键盘操作的用户（无障碍需求），清晰的 Focus 指示是必要且法定的（WCAG 2.4.7）。
4. **Active 状态常被忽略**：很多组件只有 Hover 没有 Active，导致点击时缺乏"按下"的物理反馈。
5. **Disabled 状态风格各异**：有的半透明，有的灰色，有的带 `not-allowed` 光标，缺乏统一规范。

提供一套**悬停/聚焦/激活状态系统**，能让所有交互元素在任何场景下都给出一致、可预期、无障碍友好的反馈。

## 功能描述

构建一套**悬停/聚焦/激活状态系统**，包含：

1. **统一的状态 Token 体系**：
   - 为 Hover、Focus、Active、Disabled、Selected 五种状态定义统一的视觉 Token（颜色偏移量、阴影变化、缩放比例、边框变化）。
   - 深浅模式各自有独立的状态色值，确保对比度始终足够。
2. **Focus Ring 规范**：
   - 定义全局统一的 Focus Ring 样式：颜色（`--ring`）、宽度（2px offset + 2px ring）、圆角跟随元素。
   - 提供 `.focus-ring` 工具类，任何元素添加即可获得标准聚焦环。
   - 支持 `focus-ring-subtle`（更细更淡，用于小元素）和 `focus-ring-prominent`（更粗更明显，用于高优先级元素）。
   - 支持 `:focus-visible`（仅键盘聚焦时显示，鼠标点击不显示），避免视觉噪音。
3. **Hover 状态规范**：
   - **实体元素**（按钮、徽章）：Hover 时背景色向反色方向偏移（浅色模式变深，深色模式变浅），配合轻微阴影抬升（elevation+1）。
   - **轮廓元素**（outline 按钮、ghost 按钮）：Hover 时背景填充 subtle 色。
   - **卡片/列表项**：Hover 时边框变亮 + 轻微阴影抬升 + 可选的箭头/图标位移（→ 右移 2px）。
   - **链接**：Hover 时下划线从中心向两侧展开动画。
4. **Active/Pressed 状态规范**：
   - 所有可点击元素在 Active 时统一应用 `scale(0.98)` 或 `translateY(1px)`，模拟物理按压。
   - Active 时阴影降低一级（elevation-1）。
   - 提供 `press-feedback` 工具类，一键应用标准按压反馈。
5. **Disabled 状态规范**：
   - 统一使用 `opacity: 0.5` + `cursor: not-allowed` + `pointer-events: none`。
   - 禁用状态下 Hover/Active/Focus 均不产生任何变化。
   - 提供 `disabled-styled` 工具类，确保禁用状态在所有组件中视觉一致。
6. **Selected/Checked 状态规范**：
   - 选中状态的视觉标识统一为"主色背景 + 白色前景"或"主色边框 + 主色文字"。
   - 切换时带有 150ms 的过渡动画。
7. **状态预览面板**：在 ComponentPlayground 中新增「交互状态」区域，展示按钮、输入框、卡片、链接在五种状态下的实时效果。

## 目标用户

- **需要确保全应用交互反馈一致的前端团队**。
- **需要满足无障碍合规（WCAG Focus Visible 要求）的产品**。
- **追求"每次点击都有回响"精致交互体验的开发者**。

## 详细设计

### 视觉/动画效果描述

**状态 Token：**
```css
:root {
  /* Hover 状态 */
  --state-hover-bg-offset: 5%; /* 背景色亮度偏移 */
  --state-hover-shadow-offset: 1; /* elevation +1 */
  --state-hover-scale: 1.01; /* 卡片类元素轻微放大 */

  /* Focus 状态 */
  --state-focus-ring-width: 2px;
  --state-focus-ring-offset: 2px;
  --state-focus-ring-color: var(--ring);
  --state-focus-ring-opacity: 0.5;

  /* Active 状态 */
  --state-active-scale: 0.98;
  --state-active-translate-y: 1px;
  --state-active-shadow-offset: -1; /* elevation -1 */

  /* Disabled 状态 */
  --state-disabled-opacity: 0.5;
  --state-disabled-cursor: not-allowed;

  /* 过渡 */
  --state-transition-duration: 150ms;
  --state-transition-easing: var(--ease-out);
}
```

**Focus Ring 工具类：**
```css
.focus-ring {
  outline: none;
}
.focus-ring:focus-visible {
  outline: var(--state-focus-ring-width) solid var(--state-focus-ring-color);
  outline-offset: var(--state-focus-ring-offset);
  border-radius: inherit;
}

.focus-ring-subtle:focus-visible {
  outline-width: 1px;
  outline-offset: 1px;
  outline-opacity: 0.3;
}

.focus-ring-prominent:focus-visible {
  outline-width: 3px;
  outline-offset: 3px;
}
```

**Hover 效果（按钮示例）：**
```css
.btn-hover {
  transition: background-color var(--state-transition-duration) var(--state-transition-easing),
              box-shadow var(--state-transition-duration) var(--state-transition-easing);
}
.btn-hover:hover {
  background-color: color-mix(in oklch, var(--bg-color) 95%, black);
  box-shadow: var(--elevation-2);
}
```

**Active 按压反馈：**
```css
.press-feedback:active {
  transform: scale(var(--state-active-scale)) translateY(var(--state-active-translate-y));
  box-shadow: var(--elevation-0);
  transition-duration: 50ms; /* 按下时更快 */
}
```

**链接下划线展开动画：**
```css
.link-underline-expand {
  position: relative;
  text-decoration: none;
}
.link-underline-expand::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 1px;
  background: currentColor;
  transition: width 0.2s ease-out, left 0.2s ease-out;
}
.link-underline-expand:hover::after {
  width: 100%;
  left: 0;
}
```

### 涉及的技术点

- **CSS `:focus-visible`**：现代浏览器的伪类，仅在键盘聚焦时触发（鼠标点击不触发），是消除 Focus Ring 视觉噪音的关键。
- **`color-mix()`**：CSS 原生函数，可实现背景色的精确亮度偏移（如 `color-mix(in oklch, var(--bg-color) 95%, black)`），无需预定义 hover 色值。
- **CSS 变量级联**：通过状态 Token 变量，全局修改一处即可改变所有组件的交互反馈强度。
- **Tailwind v4 的 `hover:`、`focus-visible:`、`active:`**：继续利用 Tailwind 的变体，但将具体值改为引用 Token。
- **无障碍键盘导航测试**：确保 Tab 键能顺序遍历所有交互元素，Focus Ring 始终可见。

### 与现有架构的衔接方式

- **新增 `src/styles/states.css`**：
  - 定义所有状态 Token 变量。
  - 定义 `.focus-ring`、`.focus-ring-subtle`、`.focus-ring-prominent` 工具类。
  - 定义 `.press-feedback`、`.hover-lift`、`.link-underline-expand` 等交互类。
  - 定义 `.disabled-styled` 统一禁用样式。
- **修改 `src/style.css`**：
  - `@import './styles/states.css'`。
  - 在 `:root` 中注入状态 Token。
- **修改 `src/styles/animations.css`**：
  - 将现有的 `hover-lift`、`hover-scale` 更新为引用新的状态 Token。
- **修改核心 UI 组件**：
  - `Button.vue`：统一 Hover/Active/Focus/Disabled 状态，移除各 variant 中零散的 hover 样式，改用标准化工具类。
  - `Input.vue`、`Textarea.vue`：Focus 时统一使用 `.focus-ring`，Hover 时边框颜色使用状态 Token。
  - `Card.vue`：Hover 时应用 `hover-lift`（elevation+1 + 轻微放大）。
  - `Link.vue`（如存在）或全局 `a` 标签：应用 `.link-underline-expand`。
  - `Checkbox.vue`、`Switch.vue`、`RadioGroupItem.vue`：Focus 时使用标准 Focus Ring，Checked 状态使用统一选中样式。
  - `DropdownMenuItem.vue`、`SelectItem.vue`：Hover/Active/Focus/Selected 状态统一。
- **修改 `src/components/ui/badge/Badge.vue`**：
  - Hover 时背景色偏移，Disabled 时应用 `.disabled-styled`。
- **扩展 `useAnimation.ts`（109）**：
  - 若 109 已实现，将状态过渡时长纳入动画 Token 体系。
- **修改 `ComponentPlayground.vue`**：
  - 新增「交互状态」演示区，展示所有组件在五种状态下的效果。

### 需要新增/修改的文件

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/styles/states.css` | 新增 | 状态 Token 与工具类 |
| `src/style.css` | 修改 | 导入 states.css，注入 Token |
| `src/styles/animations.css` | 修改 | 更新 hover-lift 引用 Token |
| `src/components/ui/button/Button.vue` | 修改 | 统一交互状态 |
| `src/components/ui/input/Input.vue` | 修改 | 统一 Focus/Hover 状态 |
| `src/components/ui/card/Card.vue` | 修改 | 接入 hover-lift |
| `src/components/ui/checkbox/Checkbox.vue` | 修改 | 统一 Focus/Checked 状态 |
| `src/components/ui/switch/Switch.vue` | 修改 | 统一 Focus 状态 |
| `src/components/ui/badge/Badge.vue` | 修改 | 统一 Hover/Disabled 状态 |
| `src/components/ui/dropdown-menu/DropdownMenuItem.vue` | 修改 | 统一 Hover/Focus/Selected |
| `src/components/ui/select/SelectItem.vue` | 修改 | 统一 Hover/Focus/Selected |
| `src/pages/ComponentPlayground.vue` | 修改 | 新增交互状态演示区 |

## 验收标准

- [ ] 定义 Hover、Focus、Active、Disabled、Selected 五种状态的标准视觉 Token。
- [ ] 提供 `.focus-ring`、`.focus-ring-subtle`、`.focus-ring-prominent` 三种聚焦环工具类，使用 `:focus-visible`。
- [ ] 所有按钮在 Hover 时有一致的背景偏移 + 阴影抬升，Active 时有 scale(0.98) 按压反馈。
- [ ] 所有输入框在 Focus 时有统一的标准聚焦环，Hover 时边框颜色变化。
- [ ] 卡片/列表项 Hover 时有统一的边框提亮 + 阴影抬升效果。
- [ ] 链接 Hover 时下划线从中心向两侧展开。
- [ ] Disabled 状态全应用统一：`opacity-50`、`cursor-not-allowed`、无交互反馈。
- [ ] 键盘 Tab 导航可遍历所有交互元素，Focus Ring 始终清晰可见。
- [ ] 修改 `--state-*` CSS 变量可全局实时改变交互反馈强度。
- [ ] ComponentPlayground 中可交互式预览五种状态效果。

## 优先级

P0

## 参考实现

- [WCAG 2.4.7 Focus Visible](https://www.w3.org/WAI/WCAG21/Understanding/focus-visible.html)：无障碍聚焦可见性规范。
- [Material Design 3 - States](https://m3.material.io/foundations/interaction/states)：Material Design 交互状态设计规范。
- [Apple Design - Focus and Selection](https://developer.apple.com/design/human-interface-guidelines/focus-and-selection)：macOS 聚焦与选择视觉规范。
- [Tailwind CSS Focus Ring](https://tailwindcss.com/docs/ring-width)：Tailwind 聚焦环工具类文档。
- [CSS :focus-visible](https://developer.mozilla.org/en-US/docs/Web/CSS/:focus-visible)：现代浏览器焦点伪类说明。
